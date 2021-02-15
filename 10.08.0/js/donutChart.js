/*
*    donutChart.js
*    Mastering Data Visualization with D3.js
*    Project 4 - Jazzle Dashboard
*/

// TODO: display the category that the sale fell into, by company size: small, medium, large
class DonutChart {
  constructor(_parentElement, _variable) {
    this.parentElement = _parentElement
    this.variable = _variable

    this.initVis()
  }

  initVis() {
    const vis = this

    vis.MARGIN = { LEFT: 0, RIGHT: 0, TOP: 40, BOTTOM: 0 }
    vis.WIDTH = 250 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 250 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
    vis.RADIUS = Math.min(vis.WIDTH, vis.HEIGHT) / 2

    vis.svg = d3.select(vis.parentElement).append("svg")
      .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
      .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)

    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT + (vis.WIDTH / 2)},
        ${vis.MARGIN.TOP + (vis.HEIGHT / 2)})`)

    vis.pie = d3.pie()
      .padAngle(0.03)
      .value(d => d.count)
      .sort(null)

    vis.arc = d3.arc()
      .innerRadius(vis.RADIUS - 60)
      .outerRadius(vis.RADIUS - 30)

    vis.g.append("text")
      .attr("y", -(vis.HEIGHT / 2))
      .attr("x", -(vis.WIDTH / 2))
      .attr("font-size", "12px")
      .attr("text-anchor", "start")
      .text("Company size")

    vis.color = d3.scaleOrdinal(d3.schemeAccent)

    vis.addLegend()

    vis.wrangleData()
  }

  wrangleData() {
    // TODO: write updates when the date range changes.
    const vis = this

    const groupedBySize = d3.nest()
      .key(d => d.company_size)
      .entries(calls)

    vis.filteredData = groupedBySize.map(size => {
      return {
        value: size.key,
        count: size.values.length
      }
    })

    console.log(groupedBySize)

    vis.updateVis()
  }

  updateVis() {
    const vis = this

    vis.t = d3.transition().duration(750)
    vis.path = vis.g.selectAll("path")
      // JOIN elements with new data.
      .data(vis.pie(vis.filteredData))

    // UPDATE elements still on the screen.
    vis.path.transition(vis.t)
      .attrTween("d", arcTween)

    // ENTER new elements in the array.
    vis.path.enter().append("path")
      .attr("fill", d => vis.color(d.data.value))
      .transition(vis.t)
      .attrTween("d", arcTween)

    function arcTween(d) {
      const i = d3.interpolate(this._current, d)
      this._current = i(1)
      return (t) => vis.arc(i(t))
    }
  }

  addLegend() {
    // TODO: add legend
  }
}
