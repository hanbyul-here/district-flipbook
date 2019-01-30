import { interpolate } from 'flubber'

// @results response from endpoint
function buildGeoJSONDistricts(results) {
  return results.map((row, i) => ({
    type: 'Feature',
    geometry: JSON.parse(row.boundary_simple),
    properties: Object.assign({}, row, {
      // start year of district
      startYear: parseInt(1789 - 2 + row.start_session * 2),
      // end year of district (election year, term ends following year in Jan)
      endYear: parseInt(1789 + row.end_session * 2) - 1
    })
  }))
}

function initializeData(data) {
  const districts = buildGeoJSONDistricts(data)

  return {
    type: 'FeatureCollection',
    features: districts
  }
}

const w = 500
const h = 500

function run() {

  fetch(
      'https://us-congress-districts.api.aclu.org/districts?ids=8072-8102-8132-8162-8194-8226-8258-8530-8553-8581-8604-8616-8640-8664-8691'
    )
    .then(function(response) {
      return response.json();
    })
    .then(result => {
      const houstonData = initializeData(result.results)

      const projection = d3.geoMercator().fitSize([w, h], houstonData)

      const geoPath = d3.geoPath().projection(projection) // d3.geo.path().projection(projection)

      for (let j = 0; j < houstonData.features.length - 1; j++) {
        var previewFeature1 = houstonData.features[j] //.geometry.coordinates[0]
        var previewFeature2 = houstonData.features[j + 1] //.geometry.coordinates[0]

        var interpolator = interpolate(
          geoPath(previewFeature1),
          geoPath(previewFeature2)
        )

        for (let i = 0; i < 1.01; i += 0.1) {
          var svg = d3
            .select('div#container')
            .append('svg')
            .attr('width', w)
            .attr('height', h)
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', '0 0 ' + w + ' ' + h)
            .classed('svg-content', true)
          var path = svg
            .append('path')
            .attr('class', 'continent')
            .attr('d', function(d) {
              return interpolator(i)
            })
        }
      }
    })
}
run()

