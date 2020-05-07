/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/


// avoid webpack double-rendering
if (!document.getElementsByTagName('svg').length) {

	// Set up dimensions for the visualization
	const margin = { top: 10, right: 10, bottom: 150, left: 100 }
	const height = 750 - margin.top - margin.bottom;
	const width = 1000 - margin.left - margin.right;

	// Append svg
	let g = d3
		.select('#chart-area')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	var time = 0;

	// Tooltip
	var tip = d3.tip().attr('class', 'd3-tip')
		.html((d) => {
			var tooltipText = "<strong>Country:</strong> <span style='color:#c6f25e'>" + d.country + "</span></br>";
			tooltipText += "<strong>Continent:</strong> <span style='color:#c6f25e; text-transform: capitalize'>" + d.continent + "</span></br>";
			tooltipText += "<strong>Life Expectancy:</strong> <span style='color:#c6f25e'>" + d3.format('.2f')(d.life_exp) + "</span></br>";
			tooltipText += "<strong>GDP/capita:</strong> <span style='color:#c6f25e'>" + d3.format('$,.0f')(d.income) + "</span></br>";
			tooltipText += "<strong>Population:</strong> <span style='color:#c6f25e'>" + d3.format(',.0f')(d.population) + "</span></br>";
			return tooltipText;
		});
	g.call(tip);

	// X Labels
	g.append('text')
		.attr('class', 'x axis-label')
		.attr('x', width / 2)
		.attr('y', height + 100)
		.attr('font-size', '18px')
		.attr('fill', '#274c56')
		.attr('text-anchor', 'middle')
		.text('Income')

	g.append('text')
		.attr('class', 'x axis-label')
		.attr('x', width)
		.attr('y', height - 5)
		.attr('font-size', '14px')
		.attr('fill', '#aabad4')
		.attr('text-anchor', 'end')
		.text('per person GDP/capita (PPP$ inflation-adjusted)')

	// Y Labels
	g.append('text')
		.attr('class', 'y axis-label')
		.attr('x', - (height / 2))
		.attr('y', -50)
		.attr('font-size', '18px')
		.attr('fill', '#274c56')
		.attr('text-anchor', 'middle')
		.attr('transform', 'rotate(-90)')
		.text('Life expectancy')

	g.append('text')
		.attr('class', 'y axis-label')
		.attr('x', - (height / 2))
		.attr('y', + 15)
		.attr('font-size', '14px')
		.attr('fill', '#aabad4')
		.attr('text-anchor', 'start')
		.attr('transform', 'rotate(-90)')
		.text('years')

	// x and y scale
	const x = d3
		.scaleLog()
		.domain([300, 150000])
		.range([0, width])

	const y = d3
		.scaleLinear()
		.domain([0, 90])
		.range([height, 0])

	// Color scale
	var colorScheme = ['#75eab6', '#feafda', '#c6f25e', '#91cef4'];
	var colorScale = d3.scaleOrdinal().range(colorScheme);

	// Define x and y axis
	const xAxis = g
		.append('g')
		.attr('class', 'x axis')
		.attr('fill', '#274c56')
		.attr('transform', 'translate(0, ' + height + ')');

	const yAxis = g
		.append('g')
		.attr('class', 'y axis')
		.attr('fill', '#274c56')

	const xAxisCall = d3.axisBottom(x)
		.tickValues([400, 4000, 40000])
		.tickFormat(function (d) {
			return d;
		});

	xAxis.call(xAxisCall)
		.selectAll('text')
		.attr('y', '10')
		.attr('x', '-5')
		.attr('text-anchor', 'end')
		.attr('transform', 'rotate(-40)');

	const yAxisCall = d3.axisLeft(y)
		.ticks(9)
		.tickFormat((d) => {
			return d;
		});

	yAxis.call(yAxisCall);

	let continents = ['europe', 'africa', 'americas', 'asia'];

	let legend = g.append('g')
		.attr('transform', 'translate(' + (width - 15) + ',' + (height - 250) + ')')

	continents.forEach((continent, i) => {
		var legendRow = legend.append('g')
			.attr('transform', 'translate(0, ' + (i * 30) + ')');

		legendRow.append('rect')
			.attr('fill', colorScale(continent))
			.attr('width', 15)
			.attr('height', 15)

		legendRow.append('text')
			.attr('x', -10)
			.attr('y', 10)
			.attr('fill', '#aabad4')
			.attr('text-anchor', 'end')
			.style('text-transform', 'capitalize')
			.attr('font-size', '14px')
			.text(continent)
	})

	d3.json('data/data.json')
		.then((data) => {
			let countriesByYear = data.map((countryArray) => {
				return countryArray;
			});

			var getCountryData = countriesByYear.map((element) => {
				let values = Object.values(element);
				let years = values[1];
				let countries = values[0];
				const country = countries.map((e) => {
					return e;
				})

				checkNullValue = (country) => {
					for (var e in country) {
						if (country[e] === null) {
							return true;
						}
						else false;
					}
				}

				// Filter countries array by checking for null values
				countries = countries.filter(country => !checkNullValue(country));
				values = {
					countries: countries,
					years: years
				}
				return values;
			});

			countriesByYear = getCountryData;

			// Index for each animation
			var index = 0;

			var interval = d3.interval(() => {
				// Restart animation at the end of loop
				index = (index < 214) ? index + 1 : 0
				update(countriesByYear, index);
			}, 100);

			// Run the vis for the first time
			update(countriesByYear, index);
		})
		// Catch if data is not loaded
		.catch((error) => {
			console.log(error);
		});

	// Update pattern
	update = (countriesByYear, index) => {
		let data = countriesByYear[index].countries;
		let years = countriesByYear[index].years;

		// Create an array for the populations only to use for max value count
		let populationArray = [];

		let getPopulationArray = () =>
			data.forEach(value => {
				let countryValues = Object.values(value);
				populationArray.push(countryValues[4]);
				return populationArray;
			});

		getPopulationArray();

		var maxValue = d3.max(populationArray);

		// Create scale for the circles r radius with max value from population array
		var rScale = d3.scaleSqrt()
			.domain([0, maxValue])
			.range([5, 25])

		// Create a transition duration variable
		const t = d3.transition().duration(100);

		// Years Label on x axis
		let yearsLabel = xAxis.selectAll('#yearsLabel')
			.data(years);

		yearsLabel.exit().remove();

		yearsLabel
			.text('Year: ' + years)
			.transition(t)

		yearsLabel
			.enter()
			.append('text')
			.attr('id', 'yearsLabel')
			.attr('x', width)
			.attr('y', -60)
			.attr('font-size', '48px')
			.attr('text-anchor', 'end')
			.attr('fill', '#aabad4')
			.text('Year: ' + years)

		let circles = g.selectAll('circle')
			.data(data, (d) => {
				return d.country;
			})

		// Exit old elements from previous year in data
		circles.exit().remove();

		// Append circles for each country in first year
		circles
			.enter()
			.append('circle')
			.style('fill', (d) => { return colorScale(d.continent); })
			.attr('stroke', '#000')
			.attr('stroke-width', 0.7)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			// Update circles with incoming data
			.merge(circles)
			.transition(t)
			.attr('cx', (d) => {
				return x(d.income);
			})
			.attr('cy', (d) => {
				return y(d.life_exp);
			})
			.attr('r', (d) => {
				return rScale(d.population);
			})
	}
}

