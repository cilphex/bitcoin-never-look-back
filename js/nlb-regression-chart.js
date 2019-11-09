import Constants from './constants.js'
import d3 from './external/d3.js'
import moment from './external/moment.js'
import { moneyFormat } from './util.js'

const drawChart = (chartData) => {
  const {
    data,
    regressionData,
    standardDeviation
  } = chartData



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

  // X and Y limits for the chart
  const xMax = data.length
  const yMax = d3.max(data, (d) => d.forwardMinimumPrice)

  //===========================================================================

  // Forward minimum line scales
  var xScale = d3.scaleSqrt().rangeRound([0, innerWidth])
  var yScale = d3.scaleLog().rangeRound([innerHeight, 0])

  xScale.domain([0, xMax])
  yScale.domain([d3.min(data, (d) => d.forwardMinimumPrice), yMax])

  // Create forward minimum line
  var forwardMinLine = d3.line()
    .x(d => xScale(d.index))
    .y(d => yScale(d.forwardMinimumPrice))

  //===========================================================================

  // Regression line scales
  var xScale2 = d3.scaleLinear().rangeRound([0, innerWidth])
  var yScale2 = d3.scaleLinear().rangeRound([innerHeight, 0])

  xScale2.domain([0, Math.sqrt(xMax)])
  yScale2.domain([d3.min(data, (d) => d.log10forwardMinimumPrice), Math.log10(yMax)])

  // Create regression lines
  var regressionLine = d3.line()
    .x(d => xScale2(d.sqrtDaysPassed))
    .y(d => yScale2(d.regressionNlb))

  // Standard deviation line - top
  var regressionLineTop = d3.line()
    .x(d => xScale2(d.sqrtDaysPassed))
    .y(d => yScale2(d.regressionNlb + standardDeviation))

  // Standard deviation line - bottom
  var regressionLineBottom = d3.line()
    .x(d => xScale2(d.sqrtDaysPassed))
    .y(d => yScale2(d.regressionNlb - standardDeviation))

  //=======================================================

  // A tick for Jan 1. on each year
  const xTickVals = regressionData
    .filter(i => i.date.getMonth() == 0 && i.date.getDate() == 1)
    .map(i => i.index)

  // A tick for each order of magnitude in price
  const yTickValues = [0.1, 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000]

  // X gridlines - Draw gridlines first to put beneath axis
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .attr('class', 'grid')
    .call(
      d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat('')
        .tickValues(xTickVals)
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

  // Bottom axis - forward min - Date
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(
      d3.axisBottom(xScale)
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
      d3.axisLeft(yScale)
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

  // Append a clip path for the chart area, so lines don't overflow.
  // Only really used for bottom clipping since right edge extends to bleed.
  g.append('clipPath')
    .attr('id', 'regression_chart_clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', innerWidth + margin.right)
    .attr('height', innerHeight)

  // Append the regression line
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression')
    .attr('clip-path', "url(#regression_chart_clip)")
    .attr('d', regressionLine)

  // Top variation
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression-std-dev')
    .attr('clip-path', "url(#regression_chart_clip)")
    .attr('d', regressionLineTop)

  // Bottom variation
  g.append('path')
    .datum(regressionData)
    .attr('class', 'path-line path-regression-std-dev')
    .attr('clip-path', "url(#regression_chart_clip)")
    .attr('d', regressionLineBottom)

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
    .attr('class', 'mouse-circle mouse-circle-forward-minimum')
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

  const bisectSqrtDaysPassed = d3.bisector((d) => d.sqrtDaysPassed).right

  function mouseOver() {
    g.select('.mouse-line').style('visibility', 'visible')
    g.selectAll('.mouse-circle').style('visibility', 'visible')
    document.querySelector('#regression_chart_data').style.visibility = 'visible'
  }

  function mouseOut() {
    g.select('.mouse-line').style('visibility', 'hidden')
    g.selectAll('.mouse-circle').style('visibility', 'hidden')
    document.querySelector('#regression_chart_data').style.visibility = 'hidden'
  }

  function mouseMove() {
    const mouse = d3.mouse(this)
    const sqrtDaysPassed = xScale2.invert(mouse[0]) // map value from range to domain
    const index = bisectSqrtDaysPassed(regressionData, sqrtDaysPassed) // get the index for the domain value
    const item = regressionData[index]
    const xPos = xScale2(sqrtDaysPassed)

    if (!item) {
      return
    }

    if (item.forwardMinimumPrice) {
      const yPosPrice = yScale(item.forwardMinimumPrice)
      g.select('.mouse-circle-forward-minimum')
        .style('visibility', 'visible')
        .attr('transform', `translate(${xPos},${yPosPrice})`)
      document.querySelector('#regression_chart_data .forward-minimum')
        .textContent = moneyFormat(item.forwardMinimumPrice)
    }
    else {
      g.select('.mouse-circle-forward-minimum').style('visibility', 'hidden')
      document.querySelector('#regression_chart_data .forward-minimum')
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

    document.querySelector('#regression_chart_data .expected')
      .textContent = moneyFormat(regressionPrice)
    document.querySelector('#regression_chart_data .d-max')
      .textContent = moneyFormat(regressionPriceMax)
    document.querySelector('#regression_chart_data .d-min')
      .textContent = moneyFormat(regressionPriceMin)
    document.querySelector('#regression_chart_data .date')
      .textContent = moment(item.date).format('MMM D, YYYY')
  }
}

export {
  drawChart
}
