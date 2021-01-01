import ChartData from '/js/chart-data.js'
import BasicChart from './basic-chart.js'
import RegressionChart from './regression-chart.js'
import ExtrapolationChart from './extrapolation-chart.js'
import DataPointManager from './data-point-manager.js'

function gotData(rawData) {
  const chartData = new ChartData(rawData)

  new BasicChart(chartData)
  new RegressionChart(chartData)
  new ExtrapolationChart(chartData)
  new DataPointManager(chartData)
}

fetch('/data.json')
  .then(res => res.json())
  .then(gotData)
