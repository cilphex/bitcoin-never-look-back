import Constants from './constants.js'
import mathTools from './math-tools.js'
import moment from './moment.js'

class ChartData {
  constructor(rawData) {
    this.data = rawData.slice()
    this.formatData()
    this.regressionData = this.getRegressionData()
    this.standardDeviation = this.getStandardDeviation()

    window.data = this.data
  }

  reverseData() {
    this.data.reverse()
  }

  parseData() {
    this.data.forEach((item, index) => this.data[index] = {
      date: new Date(item.date),
      price: parseFloat(item.price.replace(/,/g, ''))
    })
  }

  expandData() {
    this.data.forEach((item, index) => {
      var forwardData = this.data.slice(index)
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

  setupRegressionFunctions() {
    this.regressionPriceFn = mathTools.linearRegression(
      this.data.map(i => i.index),
      this.data.map(i => i.price)
    )

    this.regressionNlbFn = mathTools.linearRegression(
      this.data.map(i => i.sqrtDaysPassed),
      this.data.map(i => i.log10forwardMinimumPrice)
    )
  }

  addRegressionFields() {
    this.data.forEach(item => {
      item.regressionPrice = this.regressionPriceFn(item.index)
      item.regressionNlb = this.regressionNlbFn(item.sqrtDaysPassed)
    })
  }

  formatData() {
    this.reverseData()
    this.parseData()
    this.expandData()
    this.setupRegressionFunctions()
    this.addRegressionFields()
  }

  getRegressionData() {
    const { xMax } = Constants.regressionChart

    return Array(xMax).fill(null).map((val, i) => {
      const index = i
      const date = moment(this.data[0].date).add(i, 'days').toDate()
      const sqrtDaysPassed = Math.sqrt(i)
      const regressionNlb = this.regressionNlbFn(sqrtDaysPassed)

      return { index, date, sqrtDaysPassed, regressionNlb }
    })
  }

  getStandardDeviation() {
    const vals1 = this.data.map(item => item.log10forwardMinimumPrice)
    const vals2 = this.data.map(item => item.regressionNlb)

    return mathTools.standardDeviation(vals1, vals2)
  }
}

export default ChartData
