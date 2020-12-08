function draw() {
  var svgElement = document.getElementById('chart');
  var svgWidth = svgElement.clientWidth;
  var svgHeight = svgElement.clientHeight;
  var margin = {top: 20, right: 30, bottom: 20, left: 20};
  var width = svgWidth - margin.right - margin.left;
  var height = svgHeight - margin.top - margin.bottom;
  var classWidth = 20;

  const zoom = d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  d3.select("#chart").selectAll("g").remove();
  var svg = d3.select("#chart")
    .attr("viewBox", [0, 0, svgWidth, svgHeight])
    .call(zoom)
    .append("g")
    .attr('width', width)
    .attr('height', height)
    .attr("transform", "translate( " + margin.left + ", " + margin.top + ")");

  function zoomed(event, d) {
    svg.attr("transform", event.transform);
  }

  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([0, height]);

  var rects = svg.selectAll("g").data(classes);

  rects.exit().remove();

  var newrect = rects.enter()
    .append("g")
    .attr("transform", function(d, i) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; }).merge(rects);

  newrect.selectAll("line").remove();
  newrect.selectAll("text").remove();
  newrect.selectAll("rect").remove();
  newrect.selectAll("a").remove();

  newrect.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("transform", function(d) { return "translate(" + 0 + ", " + 0 + ")"; })
    .attr("fill", function(d) { return roles[d.label].color; });

  newrect.append("text")
    .attr("x", classWidth/2)
    .attr("y", function(d) { return 2; })
    .attr("font-size", function(d) { return 2; })
    .style("text-anchor", "middle")
    .text(function(d) {
      return "<<" + d.label + ">>";
    });

  newrect.append("text")
    .attr("x", classWidth/2)
    .attr("y", function(d) { return 4; })
    .attr("font-size", function(d) { return 2; })
    .style("text-anchor", "middle")
    .text(function(d) {
      return d.classname;
    });
}
