/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 1 - D3 Transitions and Update pattern
 */

var margin = { left: 100, right: 10, top: 10, bottom: 150 };
var width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var flag = true;

var t = d3.transition().duration(750);

// check if svg already exists to avoid webpack double-rendering
if (!document.getElementsByTagName("svg").length) {
  var g = d3
    .select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  // x-axis: band scale
  var x = d3.scaleBand().range([0, width]).paddingInner(0.3).paddingOuter(0.3);

  // y-axis: linear scale
  var y = d3.scaleLinear().range([height, 0]);

  var xAxisGroup = g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")");

  var yAxisGroup = g.append("g").attr("class", "y-axis");

  // X Label
  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 100)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

  // Y Label
  var yLabel = g
    .append("text")
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
        d.profit = +d.profit;
      });

      // call the update in the interval loop to upate every 1 sec
      d3.interval(() => {
        var newData = flag ? data : data.slice(1)
        update(newData);
        flag = !flag;
      }, 1000);

      // run the visualization for the first time
      update(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

// update:
// 1. scales and axes in case the data changes
// 2. size/position of the rectangles
// what should actually change with the scales is the domain - it relies on the data.
function update(data) {
  // show revenue if flag is true, else show profit
  var value = flag ? "revenue" : "profit";
  //set the x axis domain
  x.domain(
    data.map((d) => {
      return d.month;
    })
  );

  // set the y axis domain
  y.domain([
    0,
    d3.max(data, (d) => {
      return d[value];
    }),
  ]);

  // x axis
  var xAxisCall = d3.axisBottom(x);
  xAxisGroup.call(xAxisCall);

  // y axis
  // display the revenue amounts on the y-axis
  var yAxisCall = d3.axisLeft(y).tickFormat((d) => {
    return "$" + d;
  });
  yAxisGroup.transition(t).call(yAxisCall);

  // JOIN new data with old elements.
  // add a rectangle for each month of data that we have.
  var rects = g.selectAll("rect").data(data,(d) => {
    return d.month;
  });

  // EXIT old elements not present in new data.
  rects
    .exit()
    .attr("fill", "red")
    .transition(t)
    .attr("y", y(0))
    .attr("height", 0)
    .remove();

  // ENTER new elements present in new data
  rects
    .enter()
    .append("rect")
    .attr("y", y(0))
   
    .attr("y", (d) => {
      return y(d[value]);
    })
    .attr("fill", "grey")

    // UPDATE old elements present in new data
    // before the merge function: we  only set attributes for enter selection
    // after the merge function: we set attributes for both enter and update selection
    .merge(rects)
    .transition(t)
    .attr("x", (d) => {
      return x(d.month);
    })
    .attr("width", x.bandwidth)
    .attr("y", (d) => {
      return y(d[value]);
    })
    .attr("height", (d) => {
      return height - y(d[value]);
    })

  var label = flag ? "Revenue" : "Profit";
  yLabel.text(label);
}
