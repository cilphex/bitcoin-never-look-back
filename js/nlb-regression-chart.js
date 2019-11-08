import data from './data.js'
import moment from './moment.js'
import { regressionNlbFn, dataStandardDeviation } from './util.js'
import d3 from './d3.js'

const drawChart = () => {
  // Vars for dimensions
  const margin = { top: 20, right: 20, bottom: 35, left: 75 }
  const width = 800
  const height = 400
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create the chart SVG
  const svg = d3.select('#nlb_chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'chart-svg')

  // Create and append the main group
  var g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('width', innerWidth)
    .attr('height', innerHeight)

  //=======================================================

  // // Forward minimum line scales - Alternative graphing method
  // var x = d3.scaleLinear().rangeRound([0, innerWidth])
  // var y = d3.scaleLinear().rangeRound([innerHeight, 0])

  // x.domain(d3.extent(data, (d) => d.sqrtDaysPassed))
  // y.domain(d3.extent(data, (d) => d.log10forwardMinimumPrice))

  // // Create forward minimum line
  // var forwardMinLine = d3.line()
  //   .x(d => x(d.sqrtDaysPassed))
  //   .y(d => y(d.log10forwardMinimumPrice))

  var xMax = 5000    // Days passed
  var yMax = 1000000 // Price

  //=======================================================

  // Forward minimum line scales
  var x = d3.scaleSqrt().rangeRound([0, innerWidth])
  var y = d3.scaleLog().rangeRound([innerHeight, 0])

  x.domain([0, xMax])
  y.domain([d3.min(data, (d) => d.forwardMinimumPrice), yMax]) // or, d.forwardMinimumPrice

  // Create forward minimum line
  var forwardMinLine = d3.line()
    .x(d => x(d.index))
    .y(d => y(d.forwardMinimumPrice))

  //=======================================================

  const regressionData = Array(5000).fill(null).map((val, i) => {
    const index = i
    const date = moment(data[0].date).add(i, 'days').toDate()
    const sqrtDaysPassed = Math.sqrt(i)
    const regressionNlb = regressionNlbFn(sqrtDaysPassed)

    return { index, date, sqrtDaysPassed, regressionNlb }
  })

  // Regression line scales
  var x2 = d3.scaleLinear().rangeRound([0, innerWidth])
  var y2 = d3.scaleLinear().rangeRound([innerHeight, 0])

  x2.domain([0, Math.sqrt(xMax)])
  y2.domain([d3.min(data, (d) => d.log10forwardMinimumPrice), Math.log10(yMax)]) // or, d.log10forwardMinimumPrice

  // Create regression line
  var regressionLine = d3.line()
    .x(d => x2(d.sqrtDaysPassed))
    .y(d => y2(d.regressionNlb))

  const standardDeviation = dataStandardDeviation()

  var regressionLineTop = d3.line()
    .x(d => x2(d.sqrtDaysPassed))
    .y(d => y2(d.regressionNlb + standardDeviation))

  var regressionLineBottom = d3.line()
    .x(d => x2(d.sqrtDaysPassed))
    .y(d => y2(d.regressionNlb - standardDeviation))

  //=======================================================

  const xTickVals = regressionData
    .filter(i => i.date.getMonth() == 0 && i.date.getDate() == 1)
    .map(i => i.index)

  // X gridlines - Draw gridlines first to put beneath axis
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .attr('class', 'grid')
    .call(
      d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat('')
        .tickValues(xTickVals)
    )

  // Y gridlines
  g.append('g')
    .attr('class', 'grid')
    .call(
      d3.axisLeft(y)
        .tickValues([0.1, 1, 10, 100, 1000, 10000, 100000, 1000000])
        .tickSize(-innerWidth)
        .tickFormat('')
    )

  // Bottom axis - forward min - Date
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(
      d3.axisBottom(x)
        .tickFormat((i) =>
          moment(data[0].date).add(i, 'days').format('`YY')
        )
        .tickValues(xTickVals)
    )
    .append('text')
    .attr('class', 'axis-text')
    .attr('x', 30)
    .attr('y', 9)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text('Year')

  // Left axis - forward min - Price
  g.append('g')
    .call(
      d3.axisLeft(y)
        .tickFormat(d3.format(",.1f"))
        .tickValues([0.1, 1, 10, 100, 1000, 10000, 100000, 1000000])
    )
    .append('text')
    .attr('class', 'axis-text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text('Price ($)')

  // Append the path
  g.append('path')
    .datum(data)
    .attr('class', 'path-line path-forward-min-price')
    .attr('d', forwardMinLine)

  // Append a clip path for the chart area, so lines don't overflow
  g.append('clipPath')
    .attr('id', 'chart-area-clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', innerWidth)
    .attr('height', innerHeight)

  // Append the regression line
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression')
    .attr('clip-path', "url(#chart-area-clip)")
    .attr('d', regressionLine)

  // Top variation
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression-std-dev')
    .attr('clip-path', "url(#chart-area-clip)")
    .attr('d', regressionLineTop)

  // Bottom variation
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression-std-dev')
    .attr('clip-path', "url(#chart-area-clip)")
    .attr('d', regressionLineBottom)

}

export {
  drawChart
}
