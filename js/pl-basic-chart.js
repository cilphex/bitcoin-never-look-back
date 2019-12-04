import d3 from './external/d3.js'
import moment from './external/moment.js'
import { moneyFormat, updateAllText, updateAllStyles } from './util.js'

class BasicChart {
  constructor(chartData) {
    this.containerElement = '#basic_chart'
    this.chartData = chartData

    this.drawChart()
  }

  drawChart() {
    const {
      data,
      regressionData,
      standardDeviationPlc
    } = this.chartData

    // Vars for dimensions
    const margin = { top: 20, right: 20, bottom: 35, left: 75 }
    const width = 800
    const height = 400
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear the container
    document.querySelector(this.containerElement).innerHTML = ''

    // Create the chart SVG
    const svg = d3.select(this.containerElement)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('class', 'chart-svg')

    // Create and append the main group
    var g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // Create scales
    var xScale = d3.scaleSqrt().rangeRound([0, innerWidth])
    var yScale = d3.scaleLog().rangeRound([innerHeight, 0])

    xScale.domain(d3.extent(data, (d) => d.index + 1))
    yScale.domain(d3.extent(data, (d) => d.price))

    // Create price line
    var priceLine = d3.line()
      .x(d => xScale(d.index + 1))
      .y(d => yScale(d.price))

    // Create regression line
    var regressionLine = d3.line()
      .x(d => xScale(d.index + 1))
      .y(d => yScale(Math.pow(10, d.regressionPlc)))

    // Create regression through 3 peak prices
    const regressionLineTop = d3.line()
      .x(d => xScale(d.index + 1))
      .y(d => yScale(Math.pow(10, d.regressionPlcTop)))

    // Standard deviation line - bottom
    const regressionLineBottom = d3.line()
      .x(d => xScale(d.index + 1))
      .y(d => yScale(Math.pow(10, d.regressionPlc - standardDeviationPlc)))

    // A tick for Jan 1. on each year
    const xTickVals = regressionData
      .filter(i => i.date.getMonth() == 0 && i.date.getDate() == 1)
      .map(i => i.index)

    // A tick for each order of magnitude in price.
    // From 0.1 to 10,000,000.
    const yTickValues = Array(9).fill(null).map((val, i) => Math.pow(10, i-1))

    // X gridlines - Draw gridlines first to put beneath axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'grid')
      .call(
        d3.axisBottom(xScale)
          .tickValues(xTickVals)
          .tickSize(-innerHeight)
          .tickFormat('')
      )

    // Y gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .tickValues(yTickValues)
          .tickSize(-innerWidth)
          .tickFormat('')
      )

    // Bottom axis - Date
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues(xTickVals)
          .tickFormat((i) =>
            moment(data[0].date).add(i, 'days').format('`YY')
          )
      )

    // Left axis - Price
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .tickValues(yTickValues)
          .tickFormat(d3.format(",.1f"))
      )
      .append('text')
      .attr('class', 'axis-text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Price ($)')

    // Append the clip path
    g.append('clipPath')
      .attr('id', 'basic_chart_clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0 - margin.top)
      .attr('width', innerWidth + margin.right)
      .attr('height', innerHeight + margin.top)

    // Append the price line
    g.append('path')
      .datum(data)
      .attr('class', 'path-line path-price')
      .attr('d', priceLine)

    // Append the regression line
    g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression')
      .attr('clip-path', "url(#basic_chart_clip)")
      .attr('d', regressionLine)

    // Append regression through 3 peak prices
    g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression-std-dev')
      .attr('clip-path', "url(#basic_chart_clip)")
      .attr('d', regressionLineTop)

    // Append regression standard deviation bottom
    g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression-std-dev')
      .attr('clip-path', "url(#basic_chart_clip)")
      .attr('d', regressionLineBottom)
  }
}

export default BasicChart
