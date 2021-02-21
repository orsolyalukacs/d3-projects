/*
*    barChart.js
*    Source: https://bl.ocks.org/mbostock/3885304
*    Mastering Data Visualization with D3.js
*    Jazzle Dashboard
*/

class BarChart {
  constructor(_parentElement, _variable, _title) {
    this.parentElement = _parentElement
    this.variable = _variable
    this.title = _title

    this.initVis()
  }

  initVis() {
    const vis = this

    vis.svg = d3.select(vis.parentElement)
      .append("svg");

    vis.MARGIN = { top: 30, right: 50, bottom: 30, left: 50 };
    vis.WIDTH = 350 - vis.MARGIN.left - vis.MARGIN.right;
    vis.HEIGHT = 150 - vis.MARGIN.top - vis.MARGIN.bottom;

    vis.g = vis.svg.append("g")
      .attr("transform", "translate(" + vis.MARGIN.left + "," + vis.MARGIN.top + ")");

    vis.linePath = vis.g.append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", "3px")

    vis.x = d3.scaleBand()
      .domain(["electronics", "furniture", "appliances", "materials"])
      .range([0, vis.WIDTH])
      .padding(0.5);
    vis.y = d3.scaleLinear().range([vis.HEIGHT, 0]);

    vis.yAxisCall = d3.axisLeft().ticks(4);
    vis.xAxisCall = d3.axisBottom();

    vis.xAxis = vis.g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${vis.HEIGHT})`)
      .attr("font-size", "12px")
    vis.yAxis = vis.g.append("g")
      .attr("class", "y-axis")
      .attr("font-size", "12px")

    vis.g.append("text")
      .attr("class", "title")
      .attr("y", -15)
      .attr("x", -50)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text(vis.title)

    this.wrangleData()
  }

  wrangleData() {
    const vis = this

    vis.filteredData = groupedCalls.map(category => {
      return {
        category: category.key,
        size: (category.values.reduce((accumulator, current) =>
          accumulator + current[vis.variable], 0) / category.values.length)
      }
    })

    this.updateVis()
  }

  updateVis() {
    const vis = this

    // update scales
    vis.y.domain([0, d3.max(vis.filteredData, (d) => Number(d.size))]);

    var accent = d3.scaleOrdinal(d3.schemePaired);

    // update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t).call(vis.xAxisCall)
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall)

    // transition
    vis.t = d3.transition().duration(1000)

    // d3 update pattern (1.join, 2.exit, 3.update, 4.enter)
    // 1. data join - join new data with old elements, if any.
    vis.bars = vis.g.selectAll("rect")
      .data(vis.filteredData, d => d.category)

    // 2. exit - remove old elements
    vis.bars.exit()
      .attr("class", "exit")
      .transition(vis.t)
      .attr("height", 0)
      .attr("y", vis.HEIGHT)
      .style("fill-opacity", "0.1")
      .remove()

    // 3. update - update old elements
    vis.bars
      .attr("class", "update")
      .transition(vis.t)
      .attr("x", (d) => vis.x(d.category))
      .attr("y", (d) => vis.y(d.size))
      .attr("width", vis.x.bandwidth())
      .attr("height", (d) => vis.HEIGHT - vis.y(d.size))

    // enter - create new elements
    vis.bars.enter().append("rect")
      .attr("class", "enter")
      .attr("x", (d) => vis.x(d.category))
      .attr("y", (d) => vis.y(d.size))
      .attr("width", vis.x.bandwidth())
      .attr("height", (d) => vis.HEIGHT - vis.y(d.size))
      .attr("fill", function (d) { return accent(d.category); });
      //   .attr("fill", function(d) {
      //     console.log(vis.y(d.size))
      //     return "rgb(0, 0, " + (- vis.y(d.size * 10)) + ")";
      // });
  }
}
