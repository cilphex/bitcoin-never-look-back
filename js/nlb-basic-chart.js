import d3 from './external/d3.js'
import moment from './external/moment.js'
import { moneyFormat } from './util.js'

class BasicChart {
  constructor(chartData) {
    this.containerElement = '#basic_chart'
    this.chartData = chartData

    this.drawChart()
  }

  drawChart = () => {
    const data = this.chartData.data

    // Vars for dimensions
    const margin = { top: 20, right: 20, bottom: 35, left: 75 }
    const width = 800
    const height = 400
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear the container
    document.querySelector(this.containerElement).innerHtml = ''

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
    var xScale = d3.scaleTime().rangeRound([0, innerWidth])
    var yScale = d3.scaleLinear().rangeRound([innerHeight, 0])

    xScale.domain(d3.extent(data, (d) => d.date))
    yScale.domain(d3.extent(data, (d) => d.price))

    // Create price line
    var priceLine = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.price))

    // Create forward minimum line
    var forwardMinLine = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.forwardMinimumPrice))

    // X gridlines - Draw gridlines first to put beneath axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'grid')
      .call(
        d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat('')
      )

    // Y gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat('')
      )

    // Bottom axis - Date
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))

    // Left axis - Price
    g.append('g')
      .call(d3.axisLeft(yScale))
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

    // Append verticle line - must be appended to a group, not rect
    const mouseLine = g.append('line')
      .attr('class', 'mouse-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', innerHeight)
      .attr('visibility', 'hidden')

    // Circles - must be appended to a group, not rect
    const mouseCirclePrice = g.append('circle')
      .attr('class', 'mouse-circle mouse-circle-price')
      .attr('visibility', 'hidden')

    const mouseCircleNlb = g.append('circle')
      .attr('class', 'mouse-circle mouse-circle-forward-minimum')
      .attr('visibility', 'hidden')

    // Rect to catch mouse movements
    const mouseArea = g.append('rect')
      .attr('class', 'mouse-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .on('mousemove', mouseMove)

    const bisectDate = d3.bisector((d) => d.date).right

    function mouseOver() {
      g.select('.mouse-line').style('visibility', 'visible')
      g.selectAll('.mouse-circle').style('visibility', 'visible')
      document.querySelector('#basic_chart_data').style.visibility = 'visible'
    }

    function mouseOut() {
      g.select('.mouse-line').style('visibility', 'hidden')
      g.selectAll('.mouse-circle').style('visibility', 'hidden')
      document.querySelector('#basic_chart_data').style.visibility = 'hidden'
    }

    function mouseMove() {
      const mouse = d3.mouse(this)
      const date = xScale.invert(mouse[0]) // map value from range to domain
      const index = bisectDate(data, date, 1) // get the index for the domain value
      const item = data[index]
      const xPos = xScale(date)

      if (!item) {
        return
      }

      const yPosPrice = yScale(item.price)
      const yPosForwardMinimum = yScale(item.forwardMinimumPrice)

      mouseLine.attr('transform', `translate(${xPos},0)`)
      mouseCirclePrice.attr('transform', `translate(${xPos},${yPosPrice})`)
      mouseCircleNlb.attr('transform', `translate(${xPos},${yPosForwardMinimum})`)

      document.querySelector('#basic_chart_data .price')
        .textContent = moneyFormat(item.price)
      document.querySelector('#basic_chart_data .forward-minimum')
        .textContent = moneyFormat(item.forwardMinimumPrice)
      document.querySelector('#basic_chart_data .date')
        .textContent = moment(item.date).format('MMM D, YYYY')
    }
  }
}

export default BasicChart
