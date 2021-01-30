/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 4 - Jazzle Dashboard
*/

// TODO:
// 1. perform operations on data
// 2. create new instances of each of the visualization objects (stacked area chart, donut chart, barchart1, barchart2, barchart3, donutchart, timeline)
// 3. contain all the events and global variables that the page will use.
let stackedAreaChart
let barChart1
let barChart2
let barChart3
let calls
let allCalls
let groupedData = {}
let newArray = []
let filteredData = []
const color = d3.scaleOrdinal(d3.schemePastel1)
const parseDate = d3.timeParse("%d/%m/%Y");
const formatDate = d3.timeFormat("%d/%m/%Y");

$(document).on('change', '#var-select', updateCharts);

d3.json("data/calls.json").then(data => {
	// Data operations
	data.forEach((d) => {
		d.call_revenue = Number(d.call_revenue)
		d.call_duration = Number(d.call_duration)
		d.units_sold = Number(d.units_sold)
		d.date = parseDate(d.date)
	});

	calls = data
	allCalls = data
	groupedCalls = d3.nest()
		.key(d => d.category)
		.entries(calls)

	stackedAreaChart = new StackedAreaChart("#stacked-area")
	timeline = new Timeline("#timeline")
	barChart1 = new BarChart("#units-sold", "units_sold", "Units sold per call")
	barChart2 = new BarChart("#revenue", "call_revenue", "Average call revenue (USD)")
	barChart3 = new BarChart("#call-duration", "call_duration", "Average call duration (seconds)")
})

function updateCharts() {
	stackedAreaChart.wrangleData(newArray)
	timeline.wrangleData()
}

function brushed() {
	const selection = d3.event.selection || timeline.x.range() // pixel values of the brush selecion area. If the selection is empty, the value equals to the whole range of X scale.
	const dateValues = selection.map(timeline.x.invert) // call the invert method on the timeline's x scale to give us the date values that these points relate to.

	// console.log(dateValues)
	changeTimePeriod(dateValues)
}

function changeTimePeriod(values) {
	calls = allCalls.filter(d => ((d.date > values[0]) && (d.date < values[1])))

	nestedCalls = d3.nest()
		.key(d => d.category)
		.entries(calls)

	$("#dateLabel1").text(formatDate(values[0]))
	$("#dateLabel2").text(formatDate(values[1]))

	stackedAreaChart.wrangleData() // sorts out which dates to show based on the values selected by the brush
}