'use strict'        // let the browser know we're serious

// debug statement letting us know the file is loaded
console.log('Loaded map.js')

// your mapbox token
mapboxgl.accessToken = 'pk.eyJ1Ijoiamdvc2NpYWsiLCJhIjoiY2t3cG5vanB5MGVwMjJuczJrMXI4MzlsdSJ9.TS0iy75tU2Dam19zeMjv7Q'

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-73.9973, 40.7309],
    zoom: 14
});

const years = [
2002,
2003,
2004,
2005,
2006,
2007,
2008,
2009,
2010,
2011,
2012,
2013,
2014,
2015,
2016,
2017,
2018,
2019,
2020,
2021
];

function filterBy(year) {
  const filters = ['==', 'year', year];
  map.setFilter('nyu', filters);

  // Set the label to the month
  document.getElementById('year').textContent = years[years.indexOf(year)];
}

map.on('load',function(){
  // define a 'source' for your point dataset
  map.addSource('nyu_data',{
    'type':'geojson',
    'data': "https://raw.githubusercontent.com/jennahgosciak/nyu_ownership/gh-pages/04_WebMap/data/nyu_test.geojson";
  });
  // add a new layer with your points
  map.addLayer({
    'id':'nyu',
    'type':'fill',
    'source':'nyu_data',
    'paint':{
      'fill-color': '#531C86',
      'fill-opacity':0.9
    },
  })

  // Set filter to first year
  // 0 = January
  filterBy(2002);

  document.getElementById('slider').addEventListener('input', (e) => {
  const yr = parseInt(e.target.value, 10);
  filterBy(yr);
  });
});
