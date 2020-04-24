/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 1 - Star Break Coffee
 */

var margin = { left: 100, right: 10, top: 10, bottom: 150 };
var width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// check if svg already exists to avoid webpack double-rendering
if (!document.getElementsByTagName("svg").length) {
  var g = d3
    .select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  // X Label
  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 100)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

  // Y Label
  g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue");

  d3.json("data/revenues.json")
    .then((data) => {
      data.forEach((d) => {
        d.revenue = +d.revenue;
        console.log(d);
      });

      // x-axis: band scale
      var x = d3
        .scaleBand()
        .domain(
          data.map((d) => {
            return d.month;
          })
        )
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);

      var xAxisCall = d3.axisBottom(x);
      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxisCall);

      // y-axis: linear scale
      var y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(data, (d) => {
            return d.revenue;
          }),
        ])
        .range([height, 0]);

      // display the revenue amounts on the y-axis
      var yAxisCall = d3.axisLeft(y).tickFormat((d) => {
        return "$" + d;
      });

      g.append("g").attr("class", "y-axis").call(yAxisCall);

      // add a rectangle for each month of data that we have.
      var rects = g.selectAll("rect").data(data);

      rects
        .enter()
        .append("rect")
        .attr("y", function (d) {
          return y(d.revenue);
        })
        .attr("x", function (d) {
          return x(d.month);
        })
        .attr("width", x.bandwidth)
        .attr("height", function (d) {
          return height - y(d.revenue);
        })
        .attr("fill", "grey");
    })
    .catch((error) => {
      console.log(error);
    });
}
