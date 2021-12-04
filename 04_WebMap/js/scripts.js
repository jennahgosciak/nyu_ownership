'use strict'        // let the browser know we're serious

// debug statement letting us know the file is loaded
console.log('Loaded map.js')

// your mapbox token
maplibregl.accessToken = 'pk.eyJ1Ijoiamdvc2NpYWsiLCJhIjoiY2t3cG5vanB5MGVwMjJuczJrMXI4MzlsdSJ9.TS0iy75tU2Dam19zeMjv7Q'

var map = new maplibregl.Map({
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
    'data': "https://raw.githubusercontent.com/jennahgosciak/nyu_ownership/gh-pages/04_WebMap/data/nyu_filt.geojson"
  });
  // add a new layer with your points
  map.addLayer({
    'id':'nyu',
    'type':'circle',
    'source':'nyu_data',
    'paint':{
      'circle-radius': [
        '/',
        ['get', 'assessed_adj'], 2000000],
      'circle-color': '#531C86',
      'circle-opacity':0.7
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

// when the user does a 'click' on an element in the 'trees' layer...
map.on('click', 'nyu', function(e) {
  // get the map coordinates of the feature
  var coordinates = e.features[0].geometry.coordinates.slice();
  // get its species name from the feature's attributes
  var owner = e.features[0].properties.ownername;
  var value = e.features[0].properties.assessed_adj;

  // and create a popup on the map
  new maplibregl.Popup()
  .setLngLat(coordinates)
  .setHTML(`<table>
              <tr>
              <td>Owner</td>
              <td>${owner}</td>
              </tr>
              <tr>
              <td>Assessed value (adj. for 2021)</td>
              <td>${value}</td>
              </tr>
              </table>`)
  .addTo(map);
});

// make the cursor a pointer when over the tree
map.on('mouseenter', 'nyu', function() {
  map.getCanvas().style.cursor = 'pointer';
});

// back to normal when it's not
map.on('mouseleave', 'nyu', function() {
  map.getCanvas().style.cursor = '';
});
