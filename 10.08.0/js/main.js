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
let calls
let groupedData = {}
let newArray = []
let filteredData = []
const color = d3.scaleOrdinal(d3.schemePastel1)
const parseDate = d3.timeParse("%d/%m/%Y");
const formatDate = d3.timeFormat("%d/%m/%Y");
$("#var-select").on("change", updateCharts)


d3.json("data/calls.json").then(data => {
	// Create a new data object based on the selected value
	data.forEach((d) => {
		d.call_revenue = Number(d.call_revenue) / 100000
		d.call_duration = Number(d.call_duration) / 100000
		d.units_sold = Number(d.units_sold) / 100000
		d.date = parseDate(d.date)
	});

	calls = data
	groupedCalls = d3.nest()
		.key(d => d.category)
		.entries(calls)

	console.log(groupedCalls)

	stackedAreaChart = new StackedAreaChart("#stacked-area")
})

function updateCharts() {
	stackedAreaChart.wrangleData(newArray)
}
