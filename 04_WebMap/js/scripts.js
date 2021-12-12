'use strict'        // let the browser know we're serious

// debug statement letting us know the file is loaded
console.log('Loaded map.js')

// your mapbox token
maplibregl.accessToken = 'pk.eyJ1Ijoiamdvc2NpYWsiLCJhIjoiY2t3cG5vanB5MGVwMjJuczJrMXI4MzlsdSJ9.TS0iy75tU2Dam19zeMjv7Q'

var map = new maplibregl.Map({
    container: 'map',
    style: 'mapbox://styles/jgosciak/ckwzxbhb906w215ogejsxdw24',
    center: [-73.9973, 40.7309],
    zoom: 12
});

const years = [
  2001,
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
    'data': "https://raw.githubusercontent.com/jennahgosciak/nyu_ownership/gh-pages/04_WebMap/data/nyu_clean.geojson"
  });
  // add a new layer with your points
  map.addLayer({
    'id':'nyu',
    'type':'fill',
    'source':'nyu_data',
    'layout': {},
    'paint':{
      'fill-color': "#9057FF"
    },
  })

  // Set filter to 1998
  filterBy(1997);

  document.getElementById('slider').addEventListener('input', (e) => {
  const yr = parseInt(e.target.value, 10);
  filterBy(yr);
  });

});

map.on("sourcedata", function(e) {
        // without this, will have many many event fired.
        if (map.areTilesLoaded()){
            document.getElementById('tax_calc').textContent = map.queryRenderedFeatures({layers: ['nyu']})[0].properties.taxes_yr;
        }
    })

// when the user does a 'click' on an element in the 'trees' layer...
map.on('click', 'nyu', function(e) {
  // get the map coordinates of the feature
  var coordinates = e.features[0].geometry.coordinates.slice();
  // get its species name from the feature's attributes
  var owner = e.features[0].properties.ownername;
  var address = e.features[0].properties.address_form;
  var value = e.features[0].properties.assessed_adj;
  var value_orig = e.features[0].properties.assessed_adj_orig;
  var bldgarea = e.features[0].properties.bldgarea;
  var tax = e.features[0].properties.taxes_calc;

  // and create a popup on the map
  new maplibregl.Popup()
  .setLngLat(e.lngLat)
  .setHTML(`<table>
              <tr>
              <td>Owner</td>
              <td>${owner}</td>
              </tr>
              <tr>
              <td>Address (if available)</td>
              <td>${address}</td>
              </tr>
              <tr>
              <td>Estimated assessed value</td>
              <td>${value}</td>
              </tr>
              <tr>
              <td>City reported assessed value</td>
              <td>${value_orig}</td>
              </tr>
              <tr>
              <td>Building sq. ft.</td>
              <td>${bldgarea}</td>
              </tr>
              <tr>
              <td>Estimated taxes</td>
              <td>${tax}</td>
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
