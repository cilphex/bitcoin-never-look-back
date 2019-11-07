(() => {
  // Vars for dimensions
  const margin = { top: 15, right: 15, bottom: 30, left: 50 }
  const width = 800
  const height = 400
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create the chart SVG
  const svg = d3.select('#price_chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

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
    .select('.domain')

  // Left axis - Price
  g.append('g')
    .call(d3.axisLeft(y))
    .append('text')
    .attr('fill', '#000')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text('Price ($)')

  // Append the price line
  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#ccc')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', 1)
    .attr('d', priceLine)

  // Append the forward minimum price line
  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', 1.5)
    .attr('d', forwardMinLine)

})()
