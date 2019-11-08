import data from './data.js'
import d3 from './d3.js'

const drawChart = () => {
  // Vars for dimensions
  const margin = { top: 20, right: 20, bottom: 35, left: 75 }
  const width = 800
  const height = 400
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create the chart SVG
  const svg = d3.select('#price_chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'chart-svg')

  // Create and append the main group
  var g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // Create scales
  var x = d3.scaleTime().rangeRound([0, innerWidth])
  var y = d3.scaleLinear().rangeRound([innerHeight, 0])

  x.domain(d3.extent(data, (d) => d.date))
  y.domain(d3.extent(data, (d) => d.price))

  // Create price line
  var priceLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.price))

  // Create forward minimum line
  var forwardMinLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.forwardMinimumPrice))

  // X gridlines - Draw gridlines first to put beneath axis
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .attr('class', 'grid')
    .call(
      d3.axisBottom(x)
        .tickSize(-innerHeight)
        .tickFormat('')
    )

  // Y gridlines
  g.append('g')
    .attr('class', 'grid')
    .call(
      d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat('')
    )

  // Bottom axis - Date
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))

  // Left axis - Price
  g.append('g')
    .call(d3.axisLeft(y))
    .append('text')
    .attr('class', 'axis-text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text('Price ($)')

  // Append the price line
  g.append('path')
    .datum(data)
    .attr('class', 'path-line path-price')
    .attr('d', priceLine)

  // Append the forward minimum price line
  g.append('path')
    .datum(data)
    .attr('class', 'path-line path-forward-min-price')
    .attr('d', forwardMinLine)

}

export {
  drawChart
}