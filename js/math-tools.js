/**
 * Get the sum of the values in an array
 */
const sum = (values) => values.reduce((a, b) => a + b, 0)

/**
 * Return an array of products of two other arrays
 */
const multiplyVals = (vals1, vals2) => {
  let i = 0;
  return vals1.map(val => val * vals2[i++])
}

/**
 * Return a function in the form of x=(a+b*x), which will return the y value
 * on a linear regression line for a given x value
 */
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

/**
 * Calculate the standard deviation for the values in two sets of points
 */
const standardDeviation = (vals1, vals2) => {
  const squaredDiffs = vals1.map((val1, i) =>
    Math.pow((val1 - vals2[i]), 2)
  )

  const avg = sum(squaredDiffs) / squaredDiffs.length
  return Math.sqrt(avg)
}

export default {
  linearRegression,
  standardDeviation
}
