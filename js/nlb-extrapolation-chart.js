import d3 from './d3.js'
import moment from './moment.js'
import { moneyFormat } from './util.js'

const drawChart = (chartData) => {
  const { data, regressionData, standardDeviation } = chartData

  // Vars for dimensions
  const margin = { top: 20, right: 20, bottom: 35, left: 75 }
  const width = 800
  const height = 400
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create the chart SVG
  const svg = d3.select('#extrapolation_chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'chart-svg')

  // Create and append the main group
  var g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // Create scales
  var xScale = d3.scaleTime().rangeRound([0, innerWidth])
  var yScale = d3.scaleLinear().rangeRound([innerHeight, 0])

  // x.domain([data[0].date, moment(data[0].date).add(3000, 'days').toDate()])
  // y.domain([0, 10000])

  xScale.domain(d3.extent(data, (d) => d.date))
  yScale.domain(d3.extent(data, (d) => d.price))

  // Create price line
  var priceLine = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.price))

  // Create extrapolation line
  var extrapolationLine = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(Math.pow(10, d.regressionNlb)))

  // Create extrapolation line
  var extrapolationLineTop = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(Math.pow(10, d.regressionNlb + standardDeviation)))

  // Create extrapolation line
  var extrapolationLineBottom = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(Math.pow(10, d.regressionNlb - standardDeviation)))

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

  // Append the regression line
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression')
    .attr('d', extrapolationLine)

  // Top variation
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression-std-dev')
    .attr('d', extrapolationLineTop)

  // Bottom variation
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression-std-dev')
    .attr('d', extrapolationLineBottom)

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

  const mouseCircleRegression = g.append('circle')
    .attr('class', 'mouse-circle mouse-circle-regression')
    .attr('visibility', 'hidden')

  const mouseCircleRegressionMax = g.append('circle')
    .attr('class', 'mouse-circle mouse-circle-deviation')
    .attr('visibility', 'hidden')

  const mouseCircleRegressionMin = g.append('circle')
    .attr('class', 'mouse-circle mouse-circle-deviation')
    .attr('visibility', 'hidden')

  // Rect to catch mouse movements
  const mouseArea = g.append('rect')
    .attr('class', 'mouse-overlay')
    .attr('width', innerWidth + margin.right)
    .attr('height', innerHeight)
    .on('mouseover', mouseOver)
    .on('mouseout', mouseOut)
    .on('mousemove', mouseMove)

  const bisectDate = d3.bisector((d) => d.date).right

  function mouseOver() {
    g.select('.mouse-line').style('visibility', 'visible')
    g.selectAll('.mouse-circle').style('visibility', 'visible')
    document.querySelector('#extrapolation_chart_data').style.visibility = 'visible'
  }

  function mouseOut() {
    g.select('.mouse-line').style('visibility', 'hidden')
    g.selectAll('.mouse-circle').style('visibility', 'hidden')
    document.querySelector('#extrapolation_chart_data').style.visibility = 'hidden'
  }

  function mouseMove() {
    const mouse = d3.mouse(this)
    const date = xScale.invert(mouse[0]) // map value from range to domain
    const index = bisectDate(regressionData, date, 1) // get the index for the domain value
    const item = regressionData[index]
    const xPos = xScale(date)

    if (!item) {
      return
    }

    // Using regressionData instead of data and doing this check here lets
    // us make the regression lines overflow to the bleeding edge of the chart
    if (item.price) {
      const yPosPrice = yScale(item.price)
      g.select('.mouse-circle-price')
        .style('visibility', 'visible')
        .attr('transform', `translate(${xPos},${yPosPrice})`)
      document.querySelector('#extrapolation_chart_data .price')
        .textContent = moneyFormat(item.price)
    }
    else {
      g.select('.mouse-circle-price').style('visibility', 'hidden')
      document.querySelector('#extrapolation_chart_data .price')
        .textContent = '???'
    }

    const regressionPrice = Math.pow(10, item.regressionNlb)
    const regressionPriceMax = Math.pow(10, item.regressionNlb + standardDeviation)
    const regressionPriceMin = Math.pow(10, item.regressionNlb - standardDeviation)

    const yPosRegression = yScale(regressionPrice)
    const yPosRegressionMax = yScale(regressionPriceMax)
    const yPosRegressionMin = yScale(regressionPriceMin)

    mouseLine.attr('transform', `translate(${xPos},0)`)
    mouseCircleRegression.attr('transform', `translate(${xPos},${yPosRegression})`)
    mouseCircleRegressionMax.attr('transform', `translate(${xPos},${yPosRegressionMax})`)
    mouseCircleRegressionMin.attr('transform', `translate(${xPos},${yPosRegressionMin})`)

    document.querySelector('#extrapolation_chart_data .expected')
      .textContent = moneyFormat(regressionPrice)
    document.querySelector('#extrapolation_chart_data .d-max')
      .textContent = moneyFormat(regressionPriceMax)
    document.querySelector('#extrapolation_chart_data .d-min')
      .textContent = moneyFormat(regressionPriceMin)
  }
}

export {
  drawChart
}
