// Helper methods
const sum = (values) => values.reduce((a, b) => a + b, 0)

const multiplyVals = (vals1, vals2) => {
  let i = 0;
  return vals1.map(val => val * vals2[i++])
}

const linearRegression = (xVals, yVals) => {
  const n = xVals.length
  const sumX = sum(xVals)
  const sumY = sum(yVals)
  const sumX2 = sum(xVals.map(i => i * i))
  const sumY2 = sum(yVals.map(i => i * i))
  const sumXY = sum(multiplyVals(xVals, yVals))

  // y = a + bx. Find b.
  const b = (n * sumXY - sumX * sumY) /
            (n * sumX2 - Math.pow(sumX, 2))

  // y = a + bx. Find a.
  const xAvg = sum(xVals) / xVals.length
  const yAvg = sum(yVals) / yVals.length
  const a = yAvg - (b * xAvg)

  // return the linear regression function.
  return (x) => a + (b * x)
}

// Sanitize data

// Order by date: oldest -> newest
// We know data is already in reverse order, so just reverse back,
// rather than waste time sorting
data.reverse()

// Format values from strings to dates and numbers
data.forEach((item, index) => data[index] = {
  date: new Date(item.date),
  price: parseFloat(item.price.replace(/,/g, ''))
})

// Add:
// - lowest price for all subsequent days
// - sqrt(days passed)
// - regression
data.forEach((item, index) => {
  var forwardData = data.slice(index)
  var min = item.price
  forwardData.forEach(forwardItem => {
    if (forwardItem.price < min) {
      min = forwardItem.price
    }
  })
  item.index = index
  item.sqrtDaysPassed = Math.sqrt(index)
  item.forwardMinimumPrice = min
  item.log10forwardMinimumPrice = Math.log10(item.forwardMinimumPrice)
})

const regressionPriceFn = linearRegression(
  data.map(i => i.index),
  data.map(i => i.price)
)

const regressionNlbFn = linearRegression(
  data.map(i => i.sqrtDaysPassed),
  data.map(i => i.log10forwardMinimumPrice)
)

data.forEach(item => {
  item.regressionPrice = regressionPriceFn(item.index)
  item.regressionNlb = regressionNlbFn(item.sqrtDaysPassed)
})



// Calculate the standard deviation for the values in two sets of points
//
const standardDeviation = (vals1, vals2) => {
  const squaredDiffs = vals1.map((val1, i) => {
    const val2 = vals2[i]
    return Math.pow((val1 - val2), 2)
  })

  const avg = sum(squaredDiffs) / squaredDiffs.length
  return Math.sqrt(avg)
}

// Get the standard deviation between the regression line and the
// log/square-normal price line
//
const dataStandardDeviation = () => {
  const vals1 = data.map(item => item.log10forwardMinimumPrice)
  const vals2 = data.map(item => item.regressionNlb)

  return standardDeviation(vals1, vals2)
}







const calcSigma = (vals) => {
  const mean = sum(vals) / vals.length

  const squaredDiffs = vals.map(val => Math.pow((val - mean), 2))

  const avg = sum(squaredDiffs) / squaredDiffs.length
  const sigma = Math.sqrt(avg)
  return sigma
}





