mapboxgl.accessToken = 'pk.eyJ1Ijoia3JpZGFuZyIsImEiOiJjbWhib3YwM3cxYmM0Mmxwdm00MmpubjdnIn0.A_2GT3PB5OEdbL9HLwlubQ';

// INITIAL DEC --------------------------------------------
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  zoom: 3.5,
  minZoom: .9,
  center: [-113, 38]
});

var pieChart = c3.generate({
  bindto: '#piechart',
  data: {
    columns: [],
    type: 'pie'
  },
  pie: {
    label: {
      format: value => value.toLocaleString()
    }
  }, size: {
        width: 400,
        height: 400
    },
    color: {
    pattern: ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F",
              "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#BAB0AC"]
  }
});
let activePopup = null;

// HELPERS ----------------------------------------------------
function getTopTenOverall(){
  return rates.features
    .sort((a,b)=> b.properties.cases - a.properties.cases) // DESC
    .slice(0,10);
}

function formatPieData(features){
  return features.map(f => [
    f.properties.county + ", " + f.properties.state,
    f.properties.cases
  ]);
}
// LEGEND -----------------------------------------------------
const legend = document.getElementById('legend');
const grades = [500, 4000, 10000],
      colors = ['rgb(251,198,198)', 'rgb(222,103,76)', 'rgb(199,29,29)', 'rgb(128,0,0)'],
      radii = [4, 12, 24, 30];

let labels = ['<strong>Total COVID-19 USA Cases<br></strong>'], vbreak;
for (var i = 0; i < grades.length; i++) {
  vbreak = grades[i];
    let dot_radii = 2 * radii[i];

    labels.push(
      '<p class="break"><i class="dot" style="background:' + colors[i] + '; width: ' + dot_radii +
        'px; height: ' +
        dot_radii + 'px; "></i> <span class="dot-label" style="top: ' + dot_radii / 2 + 'px;">' + vbreak +
        '</span></p>'
    );
}

labels.push(`
      <p class="break">
        <i class="dot" style="background:${colors[3]}; width:${2*radii[3]}px; height:${2*radii[3]}px;"></i>
        <span class="dot-label" style="top:${radii[3]}px;">${grades[2]}+</span>
      </p>
    `);

const source =
  '<p style="text-align:right; font-size:10pt">Source: US C.B., ACS, NYT Data</p>';
legend.innerHTML = labels.join('') + source;

// UPDATES ----------------------------------------------------
function calCases(features, bounds) {
  let totalDeaths = 0; // inside scope bc it changes with bounds

  features.forEach(d => {
    if (bounds.contains(d.geometry.coordinates)) {
      totalDeaths += d.properties.deaths;
    }
  });
  return totalDeaths;
}

function updateCharts() {
  if (!rates || !rates.features) return; // ~~ fetch data before searching

  let totalDeaths = calCases(rates.features, map.getBounds()); // bounds change, in prof's code example
  document.getElementById("covid-count").innerHTML = totalDeaths;
}

async function geojsonFetch() {
  let response;
  response = await fetch('assets/us-covid-2020-counts.json');
  rates = await response.json();

  map.on('load', () => {
    // CLUSTERS -----------------------------------------------
    // looked messy, so i aggregated clusters using ...
    // https://docs.mapbox.com/mapbox-gl-js/example/cluster/
    map.addSource('cases', { // data
      type: 'geojson',
      generateId: true,
      data: 'assets/us-covid-2020-counts.json',
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    map.addLayer({ // cluster circles
      id: 'cases',
      type: 'circle',
      source: 'cases',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#f88e2b',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10, 30,
          100, 40 // <= 100 points, radius
        ]
      }
    });

  map.addLayer({
    id: 'cluster-count', // text for clusters
    type: 'symbol',
    source: 'cases',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 12
    }
  });

  // DATA PTS  ------------------------------------------------
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'cases',
    filter: ['!', ['has', 'point_count']],
    paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'cases'],
      0, 2,
      500, 6,
      5000, 20,
      20000, 35
    ],
    'circle-color': [
      'step',
      ['get', 'cases'],
      'rgb(251,198,198)', // <500
      500, 'rgb(222,103,76)', // 500–3999
      4000, 'rgb(199,29,29)', // 4000–9999
      10000, 'rgb(128,0,0)' // 4000+
    ],
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    'circle-opacity': 0.6
  }
  });

  // popup
  map.on('click', 'unclustered-point', (event) => {
    const props = event.features[0].properties;
    if (activePopup) activePopup.remove();

    activePopup = new mapboxgl.Popup()
    .setLngLat(event.features[0].geometry.coordinates)
    .setHTML(`<strong>${props.county}, ${props.state}</strong><br>
              Cases: ${props.cases}<br>
              Deaths: ${props.deaths}`)
    .addTo(map);
  });

  const reset = document.getElementById('reset');
  reset.addEventListener('click', (event) => {
    map.flyTo({
      zoom: 3.5,
      center: [-113, 38]
    });

    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
  });

  });

  function buildChart(){
    const topTen = getTopTenOverall();
    const columns = formatPieData(topTen);

    pieChart.load({
      columns: columns
    });
  }

  buildChart();
  updateCharts();
  map.on("moveend", updateCharts);
}
geojsonFetch();