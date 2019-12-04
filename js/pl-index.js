import rawData from './data.js'
import ChartData from './chart-data.js'
import BasicChart from './pl-basic-chart.js'

const chartData = new ChartData(rawData)

new BasicChart(chartData)

