import rawData from '/js/data.js'
import ChartData from '/js/chart-data.js'
import BasicChart from './basic-chart.js'
import ExtrapolationChart from './extrapolation-chart.js'

const chartData = new ChartData(rawData)

new BasicChart(chartData)
new ExtrapolationChart(chartData)
