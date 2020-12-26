/*
*    stackedAreaChart.js
*    Source: https://bl.ocks.org/mbostock/3885211
*    Mastering Data Visualization with D3.js
*    Jazzle Dashboard
*/

// The stacked area chart should display metrics for revenue, call duration, and units sold, broken down between the different teams.

class StackedAreaChart {
  constructor(_parentElement) {
    this.parentElement = _parentElement
    this.initVis();
  }

  initVis() {
    const vis = this

    vis.svg = d3.select(vis.parentElement)
      .append("svg");
    vis.svg.attr("width", 600)
      .attr("height", 600)
    vis.margin = { top: 20, right: 20, bottom: 30, left: 50 };
    vis.width = vis.svg.attr("width") - vis.margin.left - vis.margin.right;
    vis.height = vis.svg.attr("height") - vis.margin.top - vis.margin.bottom;

    vis.g = vis.svg.append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.color = d3.scaleOrdinal(d3.schemeSet3)

    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);
    vis.z = d3.scaleOrdinal(d3.schemeSet3)

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
      .ticks(4)
    vis.xAxis = vis.g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${vis.height})`)
    vis.yAxis = vis.g.append("g")
      .attr("class", "y axis")


    vis.keys = ["midwest", "northeast", "south", "west"]

    vis.stack = d3.stack().keys(vis.keys);

    vis.area = d3.area()
      .x(d => vis.x(parseDate(d.data.date)))
      .y0(d => vis.y(d[0]))
      .y1(d => vis.y(d[1]));

    vis.wrangleData();
  }

  wrangleData() {
    const vis = this
    vis.selectedVal = $("#var-select").val()
    vis.groupedByDate = d3.nest()
      .key(d => formatDate(d.date))
      .entries(calls)

    vis.filteredData = vis.groupedByDate
      .map(day => day.values.reduce(
        (data, teams) => {
          data.date = day.key
          data[teams.team] = data[teams.team] + teams[vis.selectedVal]
          return data
        }, {
        "northeast": 0,
        "midwest": 0,
        "south": 0,
        "west": 0
      }
      ))

    vis.updateVis();
  }

  updateVis() {
    const vis = this;
    // data join, appending one of these layers for each of the items in the array

    vis.t = d3.transition().duration(500)

    vis.maxDateVal = d3.max(vis.filteredData, d => {
      var vals = d3.keys(d).map(key => key !== 'date' ? d[key] : 0)
      return d3.sum(vals)
    })

    vis.x.domain(d3.extent(vis.filteredData, (d) => parseDate(d.date)));
    vis.y.domain([0, vis.maxDateVal]);

    // update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t).call(vis.xAxisCall)
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall)

    //transition area

    vis.teams = vis.g.selectAll(".team")
      .data(vis.stack(vis.filteredData))

    vis.teams.select('.area')
      .attr('d', vis.area)

    vis.teams.enter().append("g")
      .attr("class", d => `team ${d.key}`)
      .append("path")
      .attr("class", "area")
      .attr("d", vis.area)
      .style("fill", d => vis.color(d.key))
      .style("fill-opacity", 0.8)
  }
  //TODO: adds text labels to the chart and call it in initVis
  addLegend() {

  }

}