// Lógica común de datos. La usan el servidor local (server.js) y la función de Netlify.
// Reúne partidos y clasificación (football-data.org) y titulares (Google News RSS).
// Si no hay clave o algo falla, responde con los datos guardados.
const fallback = require('../data.fallback.json');

const KEY = process.env.FOOTBALL_DATA_KEY || '';
const SEASON = process.env.SEASON || '2026';
const TTL = 5 * 60 * 1000;

let teamId = process.env.TEAM_ID ? Number(process.env.TEAM_ID) : null;
let cache = null;
let cacheAt = 0;

async function fd(p) {
  const r = await fetch('https://api.football-data.org/v4' + p, { headers: { 'X-Auth-Token': KEY } });
  if (!r.ok) throw new Error('football-data respondió ' + r.status);
  return r.json();
}

async function getTeamId() {
  if (teamId) return teamId;
  const j = await fd('/competitions/PD/teams?season=' + SEASON);
  const t = (j.teams || []).find(x => /elche/i.test(x.name));
  if (!t) throw new Error('No encuentro al Elche en la competición');
  teamId = t.id;
  return teamId;
}

async function loadFootball() {
  const id = await getTeamId();
  const [m, s] = await Promise.all([
    fd('/teams/' + id + '/matches?season=' + SEASON),
    fd('/competitions/PD/standings?season=' + SEASON)
  ]);
  const name = t => t.shortName || t.name;
  const matches = (m.matches || []).map(x => ({
    date: x.utcDate,
    home: name(x.homeTeam),
    away: name(x.awayTeam),
    isHome: x.homeTeam.id === id,
    comp: (x.competition && x.competition.name || '') + (x.matchday ? ' · J' + x.matchday : ''),
    status: x.status,
    hg: x.score && x.score.fullTime ? x.score.fullTime.home : null,
    ag: x.score && x.score.fullTime ? x.score.fullTime.away : null,
    venue: x.venue || null
  }));
  const table = (s.standings && s.standings[0] && s.standings[0].table) || [];
  const row = table.find(r => r.team.id === id);
  const standing = row ? {
    pos: row.position, pts: row.points, played: row.playedGames,
    w: row.won, d: row.draw, l: row.lost, gf: row.goalsFor, ga: row.goalsAgainst
  } : null;
  const upcoming = matches.filter(x => x.status !== 'FINISHED');
  const results = matches.filter(x => x.status === 'FINISHED').reverse().slice(0, 12);
  const tableOut = table.map(r => ({ team: name(r.team), pos: r.position, pts: r.points, pj: r.playedGames, gf: r.goalsFor, ga: r.goalsAgainst }));
  return { standing, fixtures: upcoming, results, table: tableOut };
}

const decode = s => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const LINEUP_RE = /alineaci|once (titular|probable|inicial|confirmado)|onces? (probables|confirmados)|convocatoria|convocados|\bonce\b.*elche/i;

async function rss(query) {
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=es&gl=ES&ceid=ES:es';
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('RSS respondió ' + r.status);
  const xml = await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 25).map(m => {
    const get = tag => { const x = m[1].match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>')); return x ? decode(x[1]).trim() : ''; };
    let title = get('title');
    const source = get('source');
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
    return { title, source, link: get('link'), date: get('pubDate') ? new Date(get('pubDate')).toISOString() : null };
  });
}

// Intenta sacar el once de la página de la noticia. Puede fallar: los enlaces de
// Google News a veces no llevan directamente al artículo. Si falla, queda el titular.
async function extractXI(link) {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 3000);
    const r = await fetch(link, { redirect: 'follow', signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t);
    if (!r.ok) return null;
    const text = decode((await r.text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
    const m = text.match(/Elche(?: CF)?\s*:\s*([A-ZÁÉÍÓÚÑ][^:]{20,260}?;[^:]{15,260}?)(?= (?:Árbitro|Valencia|Real|Posible|Alineaci|Bajas|Dudas|Estadio)|\.\s|$)/);
    return m ? m[1].trim() : null;
  } catch (e) { return null; }
}

async function loadNews() {
  // "Elche CF" en prensa, y lo publicado en la web oficial del club
  const lists = await Promise.allSettled([rss('"Elche CF"'), rss('site:elchecf.es')]);
  const ok = lists.filter(l => l.status === 'fulfilled').flatMap(l => l.value);
  if (!ok.length) throw new Error('RSS no disponible');
  const seen = new Set();
  const items = ok.filter(i => { const k = i.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 30);
  const lineups = items.filter(i => LINEUP_RE.test(i.title)).slice(0, 5);
  await Promise.all(lineups.map(async i => { i.xi = await extractXI(i.link); }));
  return { news: items, lineups };
}

async function build() {
  const out = { updated: new Date().toISOString(), notes: [] };
  if (KEY) {
    try { Object.assign(out, await loadFootball(), { source: 'live' }); }
    catch (e) { out.notes.push('Partidos: ' + e.message + '. Muestro datos guardados.'); }
  } else {
    out.notes.push('Falta FOOTBALL_DATA_KEY. Muestro los partidos guardados.');
  }
  if (!out.fixtures) {
    out.fixtures = fallback.fixtures; out.results = fallback.results; out.standing = fallback.standing; out.table = fallback.table; out.source = 'fallback';
  }
  try { Object.assign(out, await loadNews()); }
  catch (e) { out.news = fallback.news; out.lineups = fallback.lineups; out.notes.push('Noticias: ' + e.message + '. Muestro las guardadas.'); }
  return out;
}

async function getData(force) {
  if (!force && cache && Date.now() - cacheAt < TTL) return cache;
  cache = await build();
  cacheAt = Date.now();
  return cache;
}

module.exports = { getData };
