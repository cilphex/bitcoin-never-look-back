import data from './data.js'
import ChartData from './chart-data.js'
import { drawChart as drawBasicChart } from './nlb-basic-chart.js'
import { drawChart as drawRegressionChart } from './nlb-regression-chart.js'
import { drawChart as drawExtrapolationChart } from './nlb-extrapolation-chart.js'

const chartData = new ChartData(data)

drawBasicChart(chartData)
drawRegressionChart(chartData)
drawExtrapolationChart(chartData)
