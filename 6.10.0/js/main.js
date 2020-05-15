/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/


// avoid webpack double-rendering
if (!document.getElementsByTagName('svg').length) {

    /********************************************/
    // Svg dimension creation ___________________/
    /********************************************/

    var margin = { left: 80, right: 100, top: 50, bottom: 100 },
        height = 500 - margin.top - margin.bottom,
        width = 800 - margin.left - margin.right;

    var svg = d3.select("#chart-area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left +
            ", " + margin.top + ")");

    // Time parser for x-scale
    var parseTime = d3.timeParse("%d/%m/%Y");
    var formatTime = d3.timeFormat("%d/%m/%Y");

    // For tooltip
    var bisectDate = d3.bisector((d) => { return d.year; }).left;

    // Set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Create a transition duration variable
    const t = d3.transition().duration(100);

    g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "1px")

    // Axis generators
    var xAxisCall = d3.axisBottom()
    var yAxisCall = d3.axisLeft()
        .ticks(6)
        .tickFormat((d) => { return parseInt(d / 1000) + "k"; });

    // Axis groups
    var xAxis = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");
    var yAxis = g.append("g")
        .attr("class", "y axis")

    // Y-Axis label
    yAxis.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr('x', -(height / 2) + 30)
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("Price(USD)");

    // X-Axis label
    xAxis.append("text")
        .attr("class", "axis-title")
        .attr('x', width / 2)
        .attr('y', 40)
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("Time");

    // Initialize variables
    var coinsArray;
    var coinsData;
    var bitcoinValues;

    // Event listeners
    d3.select("#coin-select").on("change", update)
    d3.select("#var-select").on("change", update)

    /********************************************/
    // Data part ________________________________/
    /********************************************/

    // Load data
    d3.json("data/coins.json").then((data) => {
        // Data cleaning
        coinsArray = Object.entries(data);
        coinsData = {};
        for (const [key] of coinsArray) {
            coinsData[key] = data[key].filter((d) => {
                return !((d["price_usd"] == null))
            })

            coinsData[key].forEach((d) => {
                d["price_usd"] = +d["price_usd"];
                d["24h_vol"] = +d["24h_vol"];
                d["market_cap"] = +d["market_cap"];
                d["date"] = parseTime(d["date"]);
            });
        }
        update();
    })
        // Catch if data is not loaded
        .catch((error) => {
            console.log(error);
        });

    function update() {
        // Filter visualization by selected data
        var coin = $("#coin-select").val();
        var yVal = $("#var-select").val();

        // Return selected data
        var dataSelected = coinsData[coin].filter(function (d) {
            return d;
        });

        // Line path generator
        var line = d3.line()
            .x((d) => { return x(d.date); })
            .y((d) => { return y(d[yVal]); });

        // Set scale domains
        x.domain(d3.extent(dataSelected, (d) => { return d.date; }));
        y.domain([d3.min(dataSelected, (d) => { return d[yVal]; }) / 1.005,
        d3.max(dataSelected, (d) => { return d[yVal]; }) * 1.005]);

        // Generate axes once scales have been set
        xAxis.transition(t).call(xAxisCall.scale(x))
        yAxis.transition(t).call(yAxisCall.scale(y))

        // Draw the path using the selected data
        g.select(".line")
            .transition(t)
            .attr("d", line(dataSelected));
    }
}