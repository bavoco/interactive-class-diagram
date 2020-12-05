function draw() {
  var svgElement = document.getElementById('chart');
  var svgWidth = svgElement.clientWidth;
  var svgHeight = svgElement.clientHeight;
  var margin = {top: 0, right: 12, bottom: 17, left: 19}

  d3.select("#chart").selectAll("g").remove();
  var svg = d3.select("#chart")
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", "translate( " + margin.left + ", " + margin.top + ")");

  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, svgWidth-margin.left-margin.right]);
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([0, svgHeight-margin.top-margin.bottom]);

  var rects = svg.selectAll("g").data(classes);

  rects.exit().remove();

  var newrect = rects.enter()
    .append("g")
    .attr("transform", function(d, i) { return "translate(" + i * 2 + "," + i * 2 + ")"; }).merge(rects);

  newrect.selectAll("line").remove();
  newrect.selectAll("text").remove();
  newrect.selectAll("rect").remove();
  newrect.selectAll("a").remove();

  newrect.append("rect")
    .attr("width", 5)
    .attr("height", 5)
    .attr("transform", function(d) { return "translate(" + 5 + ", " + 5 + ")"; })
    .attr("fill", "#beaed4");
}
