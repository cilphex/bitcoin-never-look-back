import rawData from './data.js'
import ChartData from './chart-data.js'
import { drawChart as drawBasicChart } from './nlb-basic-chart.js'
import { drawChart as drawRegressionChart } from './nlb-regression-chart.js'
import { drawChart as drawExtrapolationChart } from './nlb-extrapolation-chart.js'
import fillDataPoints from './fill-data-points.js'

const chartData = new ChartData(rawData)

drawBasicChart(chartData)
drawRegressionChart(chartData)
drawExtrapolationChart(chartData)
fillDataPoints(chartData)
