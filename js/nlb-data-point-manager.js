import d3 from './external/d3.js'
import moment from './external/moment.js'
import { moneyFormat } from './util.js'

class DataPointManager {
  constructor(chartData) {
    this.chartData = chartData

    this.fillData()
  }

  fillData() {
    this.fillToday()
    this.fill5Years()
    this.fillMagnitudes()
  }

  fillToday() {
    const { regressionData, standardDeviationNlb } = this.chartData

    const todayData = regressionData.find(i =>
      moment(i.date).isSame(moment(), 'day')
    )

    const { regressionNlb } = todayData

    const todayExpected = Math.round(Math.pow(10, regressionNlb))
    const todayMin = Math.round(Math.pow(10, regressionNlb - standardDeviationNlb))
    const todayMax = Math.round(Math.pow(10, regressionNlb + standardDeviationNlb))

    const vals = {
      '#today_expected': todayExpected,
      '#today_max': todayMax,
      '#today_min': todayMin
    }

    Object.keys(vals).forEach(key =>
      document.querySelector(key).textContent = moneyFormat(vals[key])
    )
  }

  fill5Years() {
    const { regressionData } = this.chartData

    const years = Array(5).fill(null)
      .map((item, i) => moment().year() + i)
      .map((year, i) =>
        regressionData.find(dataItem =>
          moment(dataItem.date).isSame(moment(`${year}-01-01`), 'day')
        )
      )

    var table = d3.select('#year_data_points')

    var rows = table
      .selectAll('tr')
      .data(years)
      .enter()
      .append('tr')

    var cells = rows.selectAll('td')
      .data(d => [
        moment(d.date).year(),
        moneyFormat(Math.round(Math.pow(10, d.regressionNlb)))
      ])
      .enter()
      .append('td')
      .text(d => d)
  }

  fillMagnitudes() {
    const { regressionData } = this.chartData

    const magnitudes = Array(5).fill(null)
      .map((val, i) => Math.pow(10, i+3)) // 10,000 to 100,000,000
      .map((price, i) =>
        regressionData.find(dataItem =>
          Math.pow(10, dataItem.regressionNlb) > price
        )
      )

    var table = d3.select('#magnitude_data_points')

    var rows = table
      .selectAll('tr')
      .data(magnitudes)
      .enter()
      .append('tr')

    var cells = rows.selectAll('td')
      .data(d => [
        moneyFormat(Math.round(Math.pow(10, Math.floor(d.regressionNlb)))),
        moment(d.date).format('MMM D, YYYY')
      ])
      .enter()
      .append('td')
      .text(d => d)
  }
}

export default DataPointManager


