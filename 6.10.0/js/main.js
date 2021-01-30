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

    const margin = { left: 120, right: 100, top: 50, bottom: 100 },
        height = 500 - margin.top - margin.bottom,
        width = 800 - margin.left - margin.right;

    const svg = d3.select("#chart-area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", "translate(" + margin.left +
            ", " + margin.top + ")");

    // Time parser for x-scale
    const parseTime = d3.timeParse("%d/%m/%Y");
    const formatTime = d3.timeFormat("%d/%m/%Y");

    // For tooltip
    const bisectDate = d3.bisector((d) => { return d.date; }).left;

    // Set the ranges
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Create a transition duration variable
    const t = () => { return d3.transition().duration(1000); }

    g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "1px")

    // Axis generators
    const xAxisCall = d3.axisBottom()
    const yAxisCall = d3.axisLeft()
        .ticks(6)
        .tickFormat((d) => { return parseInt(d / 1000) + "k"; });

    // Axis groups
    const xAxis = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");
    const yAxis = g.append("g")
        .attr("class", "y axis")

    // Y-Axis label
    const yLabel = yAxis.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr('x', -(height / 2) + 30)
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")

    // X-Axis label
    xAxis.append("text")
        .attr("class", "axis-title")
        .attr('x', width / 2)
        .attr('y', 40)
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("Time");

    // Initialize variables
    let coinsData;

    // Event listeners
    d3.select("#coin-select").on("change", update)
    d3.select("#var-select").on("change", update)


    // Add a slider selector for dates
    const minDate = parseTime("31/5/2013").getTime();
    const maxDate = parseTime("12/10/2017").getTime();

    $("#date-slider").slider({
        range: true,
        min: minDate,
        max: maxDate,
        step: 60 * 60 * 24 * 1000, // 1 day
        values: [minDate, maxDate],
        slide: function (event, ui) {
            const startDate = new Date(ui.values[0]);
            const endDate = new Date(ui.values[1]);
            $('#dateLabel1').text(formatTime(startDate));
            $('#dateLabel2').text(formatTime(endDate));
            update();
        }
    })

    /********************************************/
    // Data part ________________________________/
    /********************************************/

    // Load data
    d3.json("data/coins.json").then((data) => {
        // Data cleaning
        const coinsArray = Object.entries(data);
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
        const coin = $("#coin-select").val();
        const yVal = $("#var-select").val();
        const sliderValues = $("#date-slider").slider("values");

        // Return selected data
        const dataSelected = coinsData[coin].filter(function (d) {
            return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
        });

        // Line path generator
        const line = d3.line()
            .x((d) => { return x(d.date); })
            .y((d) => { return y(d[yVal]); });

        // Updates scale domains
        x.domain(d3.extent(dataSelected, (d) => { return d.date; }));
        y.domain([d3.min(dataSelected, (d) => { return d[yVal]; }) / 1.005,
        d3.max(dataSelected, (d) => { return d[yVal]; }) * 1.005]);

        // Fix for format values
        const formatSi = d3.format(".2s");
        formatAbbreviation = (x) => {
            var s = formatSi(x);
            switch (s[s.length - 1]) {
                case "G": return s.slice(0, -1) + "B";
                case "k": return s.slice(0, -1) + "K";
            }
            return s;
        }

        // Update axes once scales have been set
        xAxisCall.scale(x);
        xAxis.transition(t()).call(xAxisCall);
        yAxisCall.scale(y);
        yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));

        // Clear old tooltips
        d3.select(".focus").remove();
        d3.select(".overlay").remove();

        // Tooltip code
        var focus = g.append("g")
            .attr("class", "focus")
            .style("display", "none");
        focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", height);
        focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", 0)
            .attr("x2", width);
        focus.append("circle")
            .attr("r", 5);
        focus.append("text")
            .attr("x", 15)
            .attr("dy", ".31em");
        svg.append("rect")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", () => { focus.style("display", null); })
            .on("mouseout", () => { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(dataSelected, x0, 1),
                d0 = dataSelected[i - 1],
                d1 = dataSelected[i],
                d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
            focus.attr("transform", "translate(" + x(d.date) + "," + y(d[yVal]) + ")");
            focus.select("text").text(() => { return d3.format("$,")(d[yVal] ? d[yVal].toFixed(2) : ""); });
            focus.select(".x-hover-line").attr("y2", height - y(d[yVal]));
            focus.select(".y-hover-line").attr("x2", -x(d.date));
        }

        // Update the path using the selected data
        g.select(".line")
            .transition(t)
            .attr("d", line(dataSelected));

        // Change Y label after selecting the Y value
        const newText = (yVal == "price_usd") ? "Price (USD)" :
            ((yVal == "market_cap") ? "Market Capitalization (USD)" : "24 Hour Trading Volume (USD)")
        yLabel.text(newText);
    }
}