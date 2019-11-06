(() => {
  // Vars for dimensions
  const margin = { top: 15, right: 15, bottom: 30, left: 60 }
  const width = 800
  const height = 400
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create the chart SVG
  const svg = d3.select('#nlb_chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // Create and append the main group
  var g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('width', innerWidth)
    .attr('height', innerHeight)

  //=======================================================

  // Forward minimum line scales
  var x = d3.scaleSqrt().rangeRound([0, innerWidth])
  var y = d3.scaleLog().rangeRound([innerHeight, 0])

  x.domain(d3.extent(data, (d) => d.index))
  y.domain(d3.extent(data, (d) => d.forwardMinimumPrice))

  // Create forward minimum line
  var forwardMinLine = d3.line()
    .x(d => x(d.index))
    .y(d => y(d.forwardMinimumPrice))

  //=======================================================

  // Regression line scales
  var x2 = d3.scaleLinear().rangeRound([0, innerWidth])
  var y2 = d3.scaleLinear().rangeRound([innerHeight, 0])

  x2.domain(d3.extent(data, (d) => d.sqrtDaysPassed))
  y2.domain(d3.extent(data, (d) => d.log10forwardMinimumPrice))

  // Create regression line
  var regressionLine = d3.line()
    .x(d => x2(d.index))
    .y(d => y2(d.regressionNlb))

  //=======================================================

  xTickVals = data
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

  // Bottom axis - Date
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(
      d3.axisBottom(x)
        .tickFormat((i) =>
          moment(data[0].date).add(i, 'days').format('`YY')
        )
        .tickValues(xTickVals)
    )
    .select('.domain')

  // Left axis - Price
  g.append('g')
    .call(
      d3.axisLeft(y)
        .tickFormat(d3.format(",.1f"))
        .tickValues([0.1, 1, 10, 100, 1000, 10000, 100000, 1000000])
    )
    .append('text')
    .attr('fill', '#000')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text('Price ($)')

  // Append the path
  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', 1.5)
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
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'green')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', 2)
    .style('opacity', 0.25)
    .attr('d', regressionLine)
    .attr('clip-path', "url(#chart-area-clip)")

})()
