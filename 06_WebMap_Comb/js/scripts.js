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
  map.setFilter('nyu_poly', filters);
  map.setFilter('nyu_pt', filters);

  // Set the label to the month
  document.getElementById('year').textContent = years[years.indexOf(year)];
}

map.on('load', () => {
  // define a source for polygon data
  map.addSource('nyu_data',{
    'type':'geojson',
    'data': "https://raw.githubusercontent.com/jennahgosciak/nyu_ownership/gh-pages/04_WebMap/data/nyu_clean.geojson"
  });
  // add a new polygon layer
  map.addLayer({
    'id':'nyu_poly',
    'type':'fill',
    'source':'nyu_data',
    'layout': {
      // Make the layer visible by default.
      'visibility': 'visible'
    },
    'paint':{
      'fill-color': "#9057FF"
    },
  })

  // define a 'source' for the point dataset
  map.addSource('nyu_rpad',{
    'type':'geojson',
    'data': "https://raw.githubusercontent.com/jennahgosciak/nyu_ownership/gh-pages/04_WebMap/data/rpad_geo.geojson"
  });
  // add a new point layer
  map.addLayer({
    'id':'nyu_pt',
    'type': 'circle',
    'source':'nyu_rpad',
    'layout': {
      'visibility': 'none'
    },
    'paint': {
      'circle-radius': 10,
      'circle-color':  "#fffFFF",
      'circle-opacity': 0.4
    },
  })


  // Set filter to 2002
  filterBy(2002);

  document.getElementById('slider').addEventListener('input', (e) => {
    const yr = parseInt(e.target.value, 10);
    filterBy(yr);
  });

});

map.on('idle', () => {
  // If these two layers were not added to the map, abort
  if (!map.getLayer('nyu_poly')) {
  return;
  }

  // Enumerate ids of the layers.
  const toggleableLayerIds = ['nyu_poly', 'nyu_pt'];

  // Set up the corresponding toggle button for each layer.
  for (const id of toggleableLayerIds) {
    // Skip layers that already have a button set up.
    if (document.getElementById(id)) {
      continue;
    }


    // Create a link.
    const link = document.createElement('a');
    link.id = id;
    link.href = '#';

    if (id == "nyu_poly") {
      link.textContent = "NYU buildings";
      link.className = 'active';
    } else {
      link.textContent = "NYU buildings and condos";
      link.className = '';
    }

    // Show or hide layer when the toggle is clicked.
    link.onclick = function (e) {
      const clickedLayer = this.id;
      e.preventDefault();
      e.stopPropagation();

      const visibility = map.getLayoutProperty(
        clickedLayer,
        'visibility'
      );

      // Toggle layer visibility by changing the layout object's visibility property.
      if (visibility === 'visible') {
        map.setLayoutProperty(clickedLayer, 'visibility', 'none');
        this.className = '';
      } else {
        this.className = 'active';
        map.setLayoutProperty(
        clickedLayer,
        'visibility',
        'visible'
      );
    }
  };

  const layers = document.getElementById('menu');
  layers.appendChild(link);
  }
});

map.once("idle", () => {
  map.on("sourcedata", function(e) {

          // without this, will have many many event fired.
          if (map.getLayer('nyu_poly')) {
            const nyu_poly_stat = map.getLayoutProperty("nyu_poly", 'visibility');

            // no calculation was done in 2001
            if (document.getElementById('year').textContent == "2001") {
              document.getElementById('tax_calc').textContent = "";
              document.getElementById('tax_calc_title').textContent = "";
            } else if (nyu_poly_stat == "visible") {
              // was causing error
              if (map.queryRenderedFeatures({layers: ['nyu_poly']})[0] == undefined) {
                return
              }
              // query the taxes
              setTimeout(100);
              document.getElementById('tax_calc').textContent = map.queryRenderedFeatures({layers: ['nyu_poly']})[0].properties.taxes_yr;
              document.getElementById('tax_calc_title').textContent = "Estimated taxes";
            } else {
              // blank if NYU Poly not loaded
              document.getElementById('tax_calc').textContent = "";
              document.getElementById('tax_calc_title').textContent = "";
            }

          }
  });
});

/* only for Polygon Data */
// when the user does a 'click' on an element in the polygon data
map.on('click', 'nyu_poly', function(e) {
  // get the map coordinates of the feature
  var coordinates = e.features[0].geometry.coordinates.slice();
  // get information from feature attributes
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
map.on('mouseenter', 'nyu_poly', function() {
  map.getCanvas().style.cursor = 'pointer';
});

// back to normal when it's not
map.on('mouseleave', 'nyu_poly', function() {
  map.getCanvas().style.cursor = '';
});

/* only for Point Data */
// when the user does a 'click' on an element in the nyu point layer
map.on('click', 'nyu_pt', function(e) {
  // get the map coordinates of the feature
  var coordinates = e.features[0].geometry.coordinates.slice();
  // get its species name from the feature's attributes
  var owner = e.features[0].properties.ownername;
  var address = e.features[0].properties.address_form;
  var bldgarea = e.features[0].properties.bldgarea;

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
              <td>Building sq. ft.</td>
              <td>${bldgarea}</td>
              </tr>
              </table>`)
  .addTo(map);
});

// make the cursor a pointer when over the nyu point data
map.on('mouseenter', 'nyu_pt', function() {
  map.getCanvas().style.cursor = 'pointer';
});

// back to normal when it's not
map.on('mouseleave', 'nyu_pt', function() {
  map.getCanvas().style.cursor = '';
});
