import d3 from './external/d3.js'
import moment from './external/moment.js'
import { moneyFormat } from './util.js'

class ExtrapolationChart {
  constructor(chartData) {
    this.chartData = chartData

    this.drawChart()
    this.setupRangeListener()
  }

  drawChart = (chartData) => {
    const {
      data,
      regressionData,
      standardDeviation
    } = this.chartData

    // Vars for dimensions
    const margin = { top: 20, right: 20, bottom: 35, left: 75 }
    const width = 800
    const height = 400
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear the container
    document.querySelector('#extrapolation_chart').innerHtml = ''

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




    this.setScale = (maxDays, maxPrice) => {
      maxDays = maxDays || data.length - 1
      maxPrice = maxPrice || d3.max(data, (d) => d.price)

      xScale.domain([data[0].date, moment(data[0].date).add(maxDays, 'days').toDate()])
      yScale.domain([0, maxPrice])
    }

    // this.setScale1 = () => {
    //   xScale.domain(d3.extent(data, (d) => d.date))
    //   yScale.domain(d3.extent(data, (d) => d.price))
    // }

    // this.setScale2 = () => {
    //   xScale.domain([data[0].date, moment(data[0].date).add(5000, 'days').toDate()])
    //   yScale.domain([0, 50000])
    //   // yScale.domain(d3.extent(data, (d) => d.price))
    // }

    this.setScale(null, null)






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

    const xGridCall = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickFormat('')

    const yGridCall = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat('')








    // X gridlines - Draw gridlines first to put beneath axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'x grid')
      .call(xGridCall)

    // Y gridlines
    g.append('g')
      .attr('class', 'y grid')
      .call(yGridCall)




    const xAxisCall = d3.axisBottom(xScale)
    const yAxisCall = d3.axisLeft(yScale)

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

    // Append a clip path for the chart area, so lines don't overflow.
    // Not really used much on this chart since it extends to the right bleed
    g.append('clipPath')
      .attr('id', 'extrapolation_chart_clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth + margin.right)
      .attr('height', innerHeight)

    // Append the price line
    const pricePath = g.append('path')
      .datum(data)
      .attr('class', 'path-line path-price')
      .attr('clip-path', "url(#extrapolation_chart_clip)")
      .attr('d', priceLine)

    // Append the regression line
    const regressionLinePath = g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression')
      .attr('clip-path', "url(#extrapolation_chart_clip)")
      .attr('d', extrapolationLine)


    // Top variation
    const topDeviationPath = g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression-std-dev')
      .attr('clip-path', "url(#extrapolation_chart_clip)")
      .attr('d', extrapolationLineTop)

    // Bottom variation
    const bottomDeviationPath = g.append('path')
      .datum(regressionData)
      .attr('class', 'path-line path-regression-std-dev')
      .attr('clip-path', "url(#extrapolation_chart_clip)")
      .attr('d', extrapolationLineBottom)


    this.rescale = () => {
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

      regressionLinePath
        .attr('d', extrapolationLine)

      topDeviationPath
        .attr('d', extrapolationLineTop)

      bottomDeviationPath
        .attr('d', extrapolationLineBottom)
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
      document.querySelector('#extrapolation_chart_data .date')
        .textContent = moment(item.date).format('MMM D, YYYY')
    }
  }

  setupRangeListener = () => {
    document.querySelector('#extrapolation_chart_range')
      .addEventListener('input', this.rangeChange)
  }

  mapInputRange = (inputRangeValue) => {
    inputRangeValue = 100 - inputRangeValue
    const min = this.chartData.data.length
    const max = 10000 - 1 // Constants.regressionData.maxDays
    const rangeDiff = max - min
    const percent = inputRangeValue / 100
    const offset = rangeDiff * percent
    const pos = min + offset
    return Math.ceil(pos)
  }

  rangeChange = (e) => {
    const maxDays = this.mapInputRange(e.target.value)

    // Determine the max price for the scale in a way that keeps its x,y
    // position the same for the last x point on the chart
    const { data, regressionData } = this.chartData
    const origMaxPrice = d3.max(data, (d) => d.price)
    const origMaxRegressionNlb = Math.pow(10, data[data.length-1].regressionNlb)
    const ratio = origMaxPrice / origMaxRegressionNlb
    const maxDayRegressionNlb = Math.pow(10, regressionData[maxDays].regressionNlb)
    const maxPrice = maxDayRegressionNlb * ratio

    this.setScale(maxDays, maxPrice)
    this.rescale()
  }
}

export default ExtrapolationChart
