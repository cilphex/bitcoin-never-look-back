import d3 from './external/d3.js'
import moment from './external/moment.js'
import { moneyFormat, updateAllText, updateAllStyles } from './util.js'

class RegressionChart {
  constructor(chartData) {
    this.chartData = chartData
    this.maxDays = null
    this.maxRegressionNlb = null

    this.drawChart()
    this.setupRangeListener()
  }

  drawChart() {
    const {
      data,
      regressionData,
      standardDeviationNlb
    } = this.chartData

    // Vars for dimensions
    const margin = { top: 20, right: 20, bottom: 35, left: 75 }
    const width = 800
    const height = 400
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear the container
    document.querySelector('#regression_chart').innerHTML = ''

    // Create the chart SVG
    const svg = d3.select('#regression_chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'chart-svg')

    // Create and append the main group
    var g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)

    // Set initial max vals for chart
    this.maxDays = data.length - 1
    this.maxRegressionNlb = regressionData[data.length-1].regressionNlb

    //===========================================================================

    // Create scales
    const xScale = d3.scaleSqrt().rangeRound([0, innerWidth])
    const yScale = d3.scaleLog().rangeRound([innerHeight, 0])

    this.setScale = (maxDays, maxRegressionNlb) => {
      xScale.domain([0, this.maxDays])
      yScale.domain([d3.min(data, (d) => d.forwardMinimumPrice), Math.pow(10, this.maxRegressionNlb)])
    }

    this.setScale(null, null)

    //===========================================================================

    // Create forward minimum line
    const forwardMinLine = d3.line()
      .x(d => xScale(d.index))
      .y(d => yScale(d.forwardMinimumPrice))

    // Create regression lines
    const regressionLine = d3.line()
      .x(d => xScale(d.index))
      .y(d => yScale(Math.pow(10, d.regressionNlb)))

    // Standard deviation line - top
    const regressionLineTop = d3.line()
      .x(d => xScale(d.index))
      .y(d => yScale(Math.pow(10, d.regressionNlb + standardDeviationNlb)))

    // Standard deviation line - bottom
    const regressionLineBottom = d3.line()
      .x(d => xScale(d.index))
      .y(d => yScale(Math.pow(10, d.regressionNlb - standardDeviationNlb)))

    //=======================================================

    // A tick for Jan 1. on each year
    const xTickVals = regressionData
      .filter(i => i.date.getMonth() == 0 && i.date.getDate() == 1)
      .map(i => i.index)

    // A tick for each order of magnitude in price.
    // From 0.1 to 10,000,000.
    const yTickValues = Array(9).fill(null).map((val, i) => Math.pow(10, i-1))

    const xGridCall = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickFormat('')
      .tickValues(xTickVals)

    const yGridCall = d3.axisLeft(yScale)
      .tickValues(yTickValues)
      .tickSize(-innerWidth)
      .tickFormat('')

    const xAxisCall = d3.axisBottom(xScale)
      .tickFormat((i) =>
        moment(data[0].date).add(i, 'days').format('`YY')
      )
      .tickValues(xTickVals)

    const yAxisCall = d3.axisLeft(yScale)
      .tickFormat(d3.format(",.1f"))
      .tickValues(yTickValues)

    // X gridlines - Draw gridlines first to put beneath axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'x grid')
      .call(xGridCall)

    // Y gridlines
    g.append('g')
      .attr('class', 'y grid')
      .call(yGridCall)

    // Bottom axis - forward min - Date
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxisCall)
      .append('text')
      .attr('class', 'axis-text')
      .attr('x', 30)
      .attr('y', 9)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Year')

    // Left axis - forward min - Price
    g.append('g')
      .attr('class', 'y axis')
      .call(yAxisCall)
      .append('text')
      .attr('class', 'axis-text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Price ($)')

    // Append a clip path for the chart area, so lines don't overflow.
    // Only really used for bottom clipping since top and right edges
    // extend to the edge bleed.
    g.append('clipPath')
      .attr('id', 'regression_chart_clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0 - margin.top)
      .attr('width', innerWidth + margin.right)
      .attr('height', innerHeight + margin.top)

    // Append the path
    const forwardMinLinePath = g.append('path')
      .datum(data)
      .attr('class', 'path-line path-forward-min-price')
      .attr('d', forwardMinLine)

    // Append the regression line
    const regressionLinePath = g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression')
      .attr('clip-path', "url(#regression_chart_clip)")
      .attr('d', regressionLine)

    // Top variation
    const topDeviationPath = g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression-std-dev')
      .attr('clip-path', "url(#regression_chart_clip)")
      .attr('d', regressionLineTop)

    // Bottom variation
    const bottomDeviationPath = g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression-std-dev')
      .attr('clip-path', "url(#regression_chart_clip)")
      .attr('d', regressionLineBottom)

    // Re-call and re-attr the axes and line paths.
    // Possible to do this way thanks to closures; 'g', 'pricePath', etc.,
    // are still available in this function even if it's called outside this
    // context.
    this.rescale = () => {
      this.setScale()

      g.select('.x.grid')
        .call(xGridCall)

      g.select('.y.grid')
        .call(yGridCall)

      g.select('.x.axis')
        .call(xAxisCall)

      g.select('.y.axis')
        .call(yAxisCall)

      forwardMinLinePath
        .attr('d', forwardMinLine)

      regressionLinePath
        .attr('d', regressionLine)

      topDeviationPath
        .attr('d', regressionLineTop)

      bottomDeviationPath
        .attr('d', regressionLineBottom)
    }

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
      .on('touchstart', mouseOver)
      .on('touchend', mouseOut)
      .on('touchmove', mouseMove)

    const bisectSqrtDaysPassed = d3.bisector((d) => d.sqrtDaysPassed).right

    function mouseOver() {
      g.select('.mouse-line').style('visibility', 'visible')
      g.selectAll('.mouse-circle').style('visibility', 'visible')
      updateAllStyles('#regression .chart-data', 'visibility', 'visible')
    }

    function mouseOut() {
      g.select('.mouse-line').style('visibility', 'hidden')
      g.selectAll('.mouse-circle').style('visibility', 'hidden')
      updateAllStyles('#regression .chart-data', 'visibility', 'hidden')
    }

    function mouseMove() {
      const mouse = d3.mouse(this)
      const index = Math.round(xScale.invert(mouse[0]))
      const item = regressionData[index]
      const xPos = xScale(index)

      if (!item) {
        return
      }

      if (item.forwardMinimumPrice) {
        const yPosPrice = yScale(item.forwardMinimumPrice)
        g.select('.mouse-circle-forward-minimum')
          .style('visibility', 'visible')
          .attr('transform', `translate(${xPos},${yPosPrice})`)
        updateAllText('#regression .forward-minimum', moneyFormat(item.forwardMinimumPrice))
      }
      else {
        g.select('.mouse-circle-forward-minimum').style('visibility', 'hidden')
        updateAllText('#regression .forward-minimum', '???')
      }

      const regressionPrice = Math.pow(10, item.regressionNlb)
      const regressionPriceMax = Math.pow(10, item.regressionNlb + standardDeviationNlb)
      const regressionPriceMin = Math.pow(10, item.regressionNlb - standardDeviationNlb)

      const yPosRegression = yScale(regressionPrice)
      const yPosRegressionMax = yScale(regressionPriceMax)
      const yPosRegressionMin = yScale(regressionPriceMin)

      mouseLine.attr('transform', `translate(${xPos},0)`)
      mouseCircleRegression.attr('transform', `translate(${xPos},${yPosRegression})`)
      mouseCircleRegressionMax.attr('transform', `translate(${xPos},${yPosRegressionMax})`)
      mouseCircleRegressionMin.attr('transform', `translate(${xPos},${yPosRegressionMin})`)

      updateAllText('#regression .expected', moneyFormat(regressionPrice))
      updateAllText('#regression .d-max', moneyFormat(regressionPriceMax))
      updateAllText('#regression .d-min', moneyFormat(regressionPriceMin))
      updateAllText('#regression .date', moment(item.date).format('MMM D, YYYY'))
    }
  }

  setupRangeListener() {
    document.querySelector('#regression_chart_range')
      .addEventListener('input', this.rangeChange.bind(this))
  }

  mapInputRangeToDays(inputRangeValue) {
    inputRangeValue = 100 - inputRangeValue
    const min = this.chartData.data.length
    const max = 10000 - 1 // Constants.regressionData.maxDays
    const rangeDiff = max - min
    const percent = inputRangeValue / 100
    const offset = rangeDiff * percent
    const pos = min + offset
    return Math.round(pos)
  }

  rangeChange(e) {
    const maxDays = this.mapInputRangeToDays(e.target.value)

    const { data, regressionData } = this.chartData
    const maxRegressionNlb = regressionData[maxDays].regressionNlb

    this.maxDays = maxDays
    this.maxRegressionNlb = maxRegressionNlb

    this.rescale()
  }
}

export default RegressionChart
