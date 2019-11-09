import mathTools from './math-tools.js'
import moment from './moment.js'

// Order by date: oldest -> newest
// We know data is already in reverse order, so just reverse back,
// rather than waste time sorting
const reverseData = (data) => {
  data.reverse()
}

// Format values from strings to dates and numbers
const parseData = (data) => {
  data.forEach((item, index) => data[index] = {
    date: new Date(item.date),
    price: parseFloat(item.price.replace(/,/g, ''))
  })
}

// Add:
// - lowest price for all subsequent days
// - sqrt(days passed)
// - regression
const expandData = (data) => {
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
}

const regressionPriceFn = (data) => mathTools.linearRegression(
  data.map(i => i.index),
  data.map(i => i.price)
)

const regressionNlbFn = (data) => mathTools.linearRegression(
  data.map(i => i.sqrtDaysPassed),
  data.map(i => i.log10forwardMinimumPrice)
)

const addRegressionFields = (data) => {
  data.forEach(item => {
    item.regressionPrice = regressionPriceFn(data)(item.index)
    item.regressionNlb = regressionNlbFn(data)(item.sqrtDaysPassed)
  })
}

const getRegressionData = (data) => {
  return Array(5000).fill(null).map((val, i) => {
    const index = i
    const date = moment(data[0].date).add(i, 'days').toDate()
    const sqrtDaysPassed = Math.sqrt(i)
    const regressionNlb = regressionNlbFn(data)(sqrtDaysPassed)

    return { index, date, sqrtDaysPassed, regressionNlb }
  })
}



// Get the standard deviation between the regression line and the
// log/square-normal price line
//
const getStandardDeviation = (data) => {
  const vals1 = data.map(item => item.log10forwardMinimumPrice)
  const vals2 = data.map(item => item.regressionNlb)

  return mathTools.standardDeviation(vals1, vals2)
}

const formatData = (data) => {
  reverseData(data)
  parseData(data)
  expandData(data)
  addRegressionFields(data)
}

export {
  formatData,
  getRegressionData,
  getStandardDeviation
}




