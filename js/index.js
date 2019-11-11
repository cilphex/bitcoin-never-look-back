import rawData from './data.js'
import ChartData from './chart-data.js'
import BasicChart from './nlb-basic-chart.js'
import RegressionChart from './nlb-regression-chart.js'
import ExtrapolationChart from './nlb-extrapolation-chart.js'
import DataPointManager from './data-point-manager.js'

const chartData = new ChartData(rawData)

new BasicChart(chartData)
new RegressionChart(chartData)
new ExtrapolationChart(chartData)
new DataPointManager(chartData)

// document.querySelector('#regression_chart_range')
//   .addEventListener('input', (e) => {
//     console.log('event', e)
//   })
