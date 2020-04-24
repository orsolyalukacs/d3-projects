"use strict";

/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 1 - Star Break Coffee
 */

var canvas = d3.select("#chart-area").append("canvas").attr("width", 400).attr("height", 400);

d3.json("data/revenues.json").then(function (data) {
  data.forEach(function (d) {
    console.log(d);
  });
}).catch(function (error) {
  console.log(error);
});