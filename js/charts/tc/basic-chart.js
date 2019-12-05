import d3 from '/js/external/d3.js'
import moment from '/js/external/moment.js'
import { moneyFormat, updateAllText, updateAllStyles } from '/js/util.js'

class BasicChart {
  constructor(chartData) {
    this.containerElement = '#basic_chart'
    this.chartData = chartData

    this.drawChart()
    this.setupRangeListener()
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

    // Set initial max vals for chart
    this.maxDays = data.length - 1
    this.maxRegressionPlc = regressionData[data.length-1].regressionPlc

    //===========================================================================

    // Create scales
    var xScale = d3.scaleSqrt().rangeRound([0, innerWidth])
    var yScale = d3.scaleLog().rangeRound([innerHeight, 0])

    this.setScale = () => {
      xScale.domain([0, this.maxDays])
      yScale.domain([d3.min(data, (d) => d.price), Math.pow(10, this.maxRegressionPlc)])
    }

    this.setScale()

    //===========================================================================

    // Create price line
    var priceLine = d3.line()
      .x(d => xScale(d.index + 1))
      .y(d => yScale(d.price))

    // Standard deviation line - bottom
    const regressionLineBottom = d3.line()
      .x(d => xScale(d.index + 1))
      .y(d => yScale(Math.pow(10, d.regressionPlc - standardDeviationPlc)))

    //===========================================================================

    // A tick for Jan 1. on each year
    const xTickVals = regressionData
      .filter(i => i.date.getMonth() == 0 && i.date.getDate() == 1)
      .map(i => i.index)

    // A tick for each order of magnitude in price.
    // From 0.1 to 10,000,000.
    const yTickValues = Array(9).fill(null).map((val, i) => Math.pow(10, i-1))

    const xGridCall = d3.axisBottom(xScale)
      .tickValues(xTickVals)
      .tickSize(-innerHeight)
      .tickFormat('')

    const yGridCall = d3.axisLeft(yScale)
      .tickValues(yTickValues)
      .tickSize(-innerWidth)
      .tickFormat('')

    const xAxisCall = d3.axisBottom(xScale)
      .tickValues(xTickVals)
      .tickFormat((i) =>
        moment(data[0].date).add(i, 'days').format('`YY')
      )

    const yAxisCall = d3.axisLeft(yScale)
      .tickValues(yTickValues)
      .tickFormat(d3.format(",.1f"))

    // X gridlines - Draw gridlines first to put beneath axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'x grid')
      .call(xGridCall)

    // Y gridlines
    g.append('g')
      .attr('class', 'y grid')
      .call(yGridCall)

    // Bottom axis - Date
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxisCall)

    // Left axis - Price
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

    // Append the clip path
    g.append('clipPath')
      .attr('id', 'basic_chart_clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0 - margin.top)
      .attr('width', innerWidth + margin.right)
      .attr('height', innerHeight + margin.top)

    // Append the price line
    const pricePath = g.append('path')
      .datum(data)
      .attr('class', 'path-line path-price')
      .attr('d', priceLine)

    // Append regression standard deviation bottom
    const bottomDeviationPath = g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression-std-dev')
      .attr('clip-path', "url(#basic_chart_clip)")
      .attr('d', regressionLineBottom)

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

      pricePath
        .attr('d', priceLine)

      bottomDeviationPath
        .attr('d', regressionLineBottom)
    }

    // Append verticle line - must be appended to a group, not rect
    const verticalLine = g.append('line')
      .attr('class', 'mouse-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', innerHeight)
      .attr('visibility', 'hidden')

    const horizontalLine = g.append('line')
      .attr('class', 'mouse-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', innerWidth)
      .attr('y2', 0)
      .attr('visibility', 'hidden')

    // Circles - must be appended to a group, not rect
    const mouseCirclePrice = g.append('circle')
      .attr('class', 'mouse-circle mouse-circle-price')
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

    // const bisectSqrtDaysPassed = d3.bisector((d) => d.sqrtDaysPassed).right
    const bisectPrice = d3.bisector((d) => d.price).left

    function mouseOver() {
      g.selectAll('.mouse-line').style('visibility', 'visible')
      g.selectAll('.mouse-circle').style('visibility', 'visible')
      updateAllStyles('#basic .chart-data', 'visibility', 'visible')
    }

    function mouseOut() {
      g.selectAll('.mouse-line').style('visibility', 'hidden')
      g.selectAll('.mouse-circle').style('visibility', 'hidden')
      updateAllStyles('#basic .chart-data', 'visibility', 'hidden')
    }

    function mouseMove() {
      const mouse = d3.mouse(this)
      const index = Math.round(xScale.invert(mouse[0]))
      const item = regressionData[index]
      const xPos = xScale(index)

      // get the index for the domain value
      //
      // very much work in progress...
      //
      const price = item.price
      const index2 = bisectPrice(regressionData, price, 1)
      console.log('price', price, 'index2', index2)
      const yPos = yScale(100)

      if (!item) {
        return
      }

      if (item.price) {
        const yPosPrice = yScale(item.price)
        g.select('.mouse-circle-price')
          .style('visibility', 'visible')
          .attr('transform', `translate(${xPos},${yPosPrice})`)
        updateAllText('#basic .price', moneyFormat(item.price))
      }
      else {
        g.select('.mouse-circle-price').style('visibility', 'hidden')
        updateAllText('#basic .price', '???')
      }

      const regressionPriceMin = Math.pow(10, item.regressionPlc - standardDeviationPlc)

      const yPosRegressionMin = yScale(regressionPriceMin)

      verticalLine.attr('transform', `translate(${xPos},0)`)
      horizontalLine.attr('transform', `translate(0,${yPos})`)
      mouseCircleRegressionMin.attr('transform', `translate(${xPos},${yPosRegressionMin})`)

      updateAllText('#basic .d-min', moneyFormat(regressionPriceMin))
      updateAllText('#basic .date', moment(item.date).format('MMM D, YYYY'))
    }
  }

  setupRangeListener() {
    document.querySelector('#basic_chart_range')
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
    const maxRegressionPlc = regressionData[maxDays].regressionPlc

    this.maxDays = maxDays
    this.maxRegressionPlc = maxRegressionPlc

    this.rescale()
  }
}

export default BasicChart
