// Datos guardados para el detalle de cada partido.
// Se amplían a mano o a petición. Todo lo marcado como "estimación" es un cálculo propio, no un dato oficial.

// Enfrentamientos anteriores Elche contra cada rival (clave = nombre normalizado del rival).
// when = fecha o temporada. home/away = quién jugó en casa. hg/ag = goles de local/visitante.
window.H2H = {
  levante: {
    source: 'Analítica Fantasy (analiticafantasy.com)',
    list: [
      { when: '23 ene 2026 · J21', comp: 'LaLiga', home: 'Levante', away: 'Elche', hg: 3, ag: 2 },
      { when: '29 ago 2025 · J3', comp: 'LaLiga', home: 'Elche', away: 'Levante', hg: 2, ag: 0 },
      { when: '10 may 2025 · J39', comp: 'Segunda', home: 'Elche', away: 'Levante', hg: 1, ag: 3 },
      { when: '16 nov 2024 · J15', comp: 'Segunda', home: 'Levante', away: 'Elche', hg: 1, ag: 1 },
      { when: '24 mar 2024 · J32', comp: 'Segunda', home: 'Levante', away: 'Elche', hg: 3, ag: 2 },
      { when: '30 sep 2023 · J8', comp: 'Segunda', home: 'Elche', away: 'Levante', hg: 0, ag: 0 },
      { when: '25 feb 2022 · J26', comp: 'LaLiga', home: 'Levante', away: 'Elche', hg: 3, ag: 0 },
      { when: '18 sep 2021 · J5', comp: 'LaLiga', home: 'Elche', away: 'Levante', hg: 1, ag: 1 }
    ],
    note: 'Muestro los 8 partidos oficiales más recientes de 18 en total. El local de cada partido se ha deducido de la ficha de la fuente.'
  },
  barcelona: {
    source: 'Comuniate y Fotmob',
    list: [
      { when: '23 ago 2026 · J2', comp: 'LaLiga', home: 'Elche', away: 'Barcelona', hg: 0, ag: 5 },
      { when: '31 ene 2026 · J22', comp: 'LaLiga', home: 'Elche', away: 'Barcelona', hg: 1, ag: 3 },
      { when: '2 nov 2025 · J11', comp: 'LaLiga', home: 'Barcelona', away: 'Elche', hg: 3, ag: 1 },
      { when: 'Temp. 22/23 · J27', comp: 'LaLiga', home: 'Elche', away: 'Barcelona', hg: 0, ag: 4 },
      { when: 'Temp. 22/23 · J6', comp: 'LaLiga', home: 'Barcelona', away: 'Elche', hg: 3, ag: 0 },
      { when: 'Temp. 21/22 · J27', comp: 'LaLiga', home: 'Elche', away: 'Barcelona', hg: 1, ag: 2 },
      { when: 'Temp. 21/22 · J18', comp: 'LaLiga', home: 'Barcelona', away: 'Elche', hg: 3, ag: 2 }
    ]
  },
  valencia: {
    source: 'Jornada Perfecta',
    list: [
      { when: '15 oct 2022 · J9', comp: 'LaLiga', home: 'Valencia', away: 'Elche', hg: 2, ag: 2 }
    ],
    note: 'Solo tengo guardado este enfrentamiento. Los dos de la temporada pasada (10 ene y 11 abr de 2026) no tengo el resultado.'
  },
  osasuna: {
    source: 'Previa de Soccerway (temporada pasada)',
    list: [
      { when: '13 feb 2026 · J24', comp: 'LaLiga', home: 'Elche', away: 'Osasuna', hg: 0, ag: 0 }
    ],
    note: 'Según una previa de Soccerway, Osasuna no ha perdido ninguno de sus últimos 12 partidos de Liga contra el Elche (4 victorias y 8 empates). En 9 visitas del Elche a Pamplona en Liga: 1 victoria, 3 empates y 5 derrotas. Son datos de antes de esta temporada.'
  }
};

// Otras fuentes de probabilidad, por rival, para el partido más cercano.
window.EXTRA_PROB = {
  valencia: [
    'Casas de apuestas (legalbet.es): Elche 2,40 · empate 3,40 · Valencia 2,95.',
    'Previa fantasy (asesoriasfantasy.com): Elche 27 % · empate 26 % · Valencia 47 %.'
  ]
};

// Viajes desde Torrevieja a los partidos fuera.
// checked = true si distancia y precios vienen de buscadores; false = cálculo mío.
window.TRAVEL = {
  levante: {
    km: 170, time: 'algo más de 2 h', checked: true,
    bus: [12, 15, 'unas 2 h'], train: [16, 23, 'de 3 h a 3 h 30'], plane: null,
    names: [],
    namesNote: 'No tengo nombres de alojamientos comprobados cerca del Ciutat de València. Los barrios próximos son Orriols, Torrefiel y Rascanya. Usa la búsqueda de Airbnb de abajo, que ya viene filtrada.',
    tip: 'Si el partido es entre semana por la noche, mira el último autobús o tren de vuelta antes de decidir si necesitas dormir allí.'
  },
  osasuna: {
    km: 550, time: 'cerca de 6 h', checked: false,
    bus: [43, 46, 'unas 10 h, desde Alicante'], train: [77, 100, 'más de 6 h 30, con cambios'], plane: [62, 'más de 7 h, con escala'],
    names: [
      { n: 'Soto Deluxe By Clabao', p: 'Pamplona', price: 62 },
      { n: 'Apartamentos Adakairu Pamplona By Clabao', p: 'Lezkairu, barrio del sur de la ciudad, 2,5 km del casco antiguo', price: 62 },
      { n: 'La Capilla By Clabao', p: 'Casco antiguo', price: 65 },
      { n: 'El Mirador De La Estafeta By Clabao', p: 'Centro', price: 67 },
      { n: 'Limehome Pamplona Hilarión Eslava', p: 'Centro', price: 70 }
    ],
    namesNote: 'Nombres y precios por noche tomados de un comparador (cozycozy.com), no son anuncios de Airbnb ni garantizan disponibilidad. No tengo la distancia exacta a El Sadar de cada uno. Otro apartamento de Lezkairu se describe como próximo al estadio.',
    tip: 'Son más de 500 km. Lo normal es viajar el día antes y dormir una noche.'
  }
};

// Distancia aproximada en coche desde Torrevieja. Cálculo mío, sin comprobar.
window.KM_EST = {
  alaves: 680, malaga: 470, barcelona: 590, betis: 640, sevilla: 640, atletico: 440,
  'real madrid': 440, getafe: 440, rayo: 440, sociedad: 780, athletic: 800, celta: 1000,
  villarreal: 250, deportivo: 1100, racing: 800, espanyol: 590
};
