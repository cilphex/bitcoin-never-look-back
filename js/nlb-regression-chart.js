import Constants from './constants.js'
import d3 from './d3.js'
import moment from './moment.js'

const drawChart = (chartData) => {
  const {
    data,
    regressionData,
    standardDeviation
  } = chartData

  // X and Y limits for the chart
  const { xMax, yMax } = Constants.regressionChart

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

  //===========================================================================

  // Forward minimum line scales
  var x = d3.scaleSqrt().rangeRound([0, innerWidth])
  var y = d3.scaleLog().rangeRound([innerHeight, 0])

  x.domain([0, xMax])
  y.domain([d3.min(data, (d) => d.forwardMinimumPrice), yMax])

  // Create forward minimum line
  var forwardMinLine = d3.line()
    .x(d => x(d.index))
    .y(d => y(d.forwardMinimumPrice))

  //===========================================================================

  // Regression line scales
  var x2 = d3.scaleLinear().rangeRound([0, innerWidth])
  var y2 = d3.scaleLinear().rangeRound([innerHeight, 0])

  x2.domain([0, Math.sqrt(xMax)])
  y2.domain([d3.min(data, (d) => d.log10forwardMinimumPrice), Math.log10(yMax)])

  // Create regression lines
  var regressionLine = d3.line()
    .x(d => x2(d.sqrtDaysPassed))
    .y(d => y2(d.regressionNlb))

  // Standard deviation line - top
  var regressionLineTop = d3.line()
    .x(d => x2(d.sqrtDaysPassed))
    .y(d => y2(d.regressionNlb + standardDeviation))

  // Standard deviation line - bottom
  var regressionLineBottom = d3.line()
    .x(d => x2(d.sqrtDaysPassed))
    .y(d => y2(d.regressionNlb - standardDeviation))

  //=======================================================

  // A tick for Jan 1. on each year
  const xTickVals = regressionData
    .filter(i => i.date.getMonth() == 0 && i.date.getDate() == 1)
    .map(i => i.index)

  // A tick for each order of magnitude in price
  const yTickValues = [0.1, 1, 10, 100, 1000, 10000, 100000, 1000000]

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
        .tickValues(yTickValues)
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
        .tickValues(yTickValues)
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
