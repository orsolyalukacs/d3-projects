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
    vis.svg.attr("width", 800)
      .attr("height", 600)
    vis.MARGIN = { LEFT: 50, RIGHT: 100, TOP: 20, BOTTOM: 30 };
    vis.WIDTH = vis.svg.attr("width") - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
    vis.HEIGHT = vis.svg.attr("height") - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;

    vis.g = vis.svg.append("g")
      .attr("transform", "translate(" + vis.MARGIN.LEFT + "," + (vis.MARGIN.TOP + 10) + ")");

    vis.color = d3.scaleOrdinal(d3.schemeSet3)

    vis.x = d3.scaleTime().range([0, vis.WIDTH]);
    vis.y = d3.scaleLinear().range([vis.HEIGHT, 0]);
    vis.z = d3.scaleOrdinal(d3.schemeSet3)

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
      .ticks(4)
    vis.xAxis = vis.g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${vis.HEIGHT})`)
    vis.yAxis = vis.g.append("g")
      .attr("class", "y axis")

    vis.keys = ["midwest", "northeast", "south", "west"]

    vis.stack = d3.stack().keys(vis.keys);

    vis.area = d3.area()
      .x(d => vis.x(parseDate(d.data.date)))
      .y0(d => vis.y(d[0]))
      .y1(d => vis.y(d[1]));

    vis.addLegend();
    vis.wrangleData();
  }

  wrangleData() {
    const vis = this

    vis.selectedVal = $("#var-select").val()
    vis.groupedByDate = d3.nest()
      .key(d => formatDate(d.date))
      .entries(calls)

    // Create a new data object based on the selected value
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

    vis.t = d3.transition().duration(500)

    vis.maxDateVal = d3.max(vis.filteredData, d => {
      var vals = d3.keys(d).map(key => key !== 'date' ? d[key] : 0)
      return d3.sum(vals)
    })

    vis.x.domain(d3.extent(vis.filteredData, (d) => parseDate(d.date)));
    vis.y.domain([0, vis.maxDateVal]);

    // Update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t).call(vis.xAxisCall)
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall)

    // Data join, appending one of these layers for each of the items in the array
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

  //Adds text labels and legend to the chart
  addLegend() {
    const vis = this;
    const size = 20;

    vis.g.selectAll("legend")
      .data(vis.keys)
      .enter()
      .append("rect")
      .attr("x", (d, i) => 20 + i * (size * 6))
      .attr("y", -30 )
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", (d) => vis.color(d))
      .text()

    vis.g.selectAll("labels")
      .data(vis.keys)
      .enter()
      .append("text")
      .attr("x", (d, i) => 20 + i * (size * 6) + size + (size / 2))
      .attr("y", -30 + size / 2)
      .style("fill", "black")
      .text((d) => d )
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
  }
}