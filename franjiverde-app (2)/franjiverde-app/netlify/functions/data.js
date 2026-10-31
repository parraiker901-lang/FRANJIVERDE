// Función de Netlify: responde a /api/data con los datos de partidos y noticias.
const { getData } = require('../../lib/data');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    // La app de Android (Capacitor) llama desde otro origen
    'Access-Control-Allow-Origin': '*'
  };
  try {
    const refresh = !!(event.queryStringParameters && 'refresh' in event.queryStringParameters);
    const d = await getData(refresh);
    return { statusCode: 200, headers, body: JSON.stringify(d) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
