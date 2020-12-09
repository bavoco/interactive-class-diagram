var svgElement = document.getElementById('chart');
var margin = {top: 20, right: 30, bottom: 20, left: 20};
var ns = 'http://www.w3.org/2000/svg';
var zoomlevel = 1;
let elem = document.createElementNS(ns, "g");
elem.setAttribute("transform", "translate(" + margin.right + "," + margin.top + ")");
svgElement.appendChild(elem);
var main_g = svgElement.firstChild;
let isDragging = false;
let mouse_x = 0;
let mouse_y = 0;
let pan_x = 0;
let pan_y = 0;

function draw() {
  var svgWidth = svgElement.clientWidth;
  var svgHeight = svgElement.clientHeight;
  var width = svgWidth - margin.right - margin.left;
  var height = svgHeight - margin.top - margin.bottom;
  var classWidth = 20;

  svgElement.setAttribute("viewBox", [0, 0, svgWidth, svgHeight]);

  var x = function(val) {
    return 0.01 * val * width;
  }

  var y = function(val) {
    return 0.01 * val * height;
  }

  // var rects = svgElement.firstChild.getElementsByTagName("g");

  classes.forEach((item, i) => {
    let class_holder = document.createElementNS(ns, "g");
    class_holder.setAttribute("transform", "translate(" + x(item.x) + "," + y(item.y) + ")");
    main_g.appendChild(class_holder);

    let elem = document.createElementNS(ns, "rect");
    elem.setAttribute("width", classWidth);
    elem.setAttribute("height", classWidth);
    elem.setAttribute("transform", "translate(" + 0 + "," + 0 + ")");
    elem.setAttribute("fill", roles[item.label].color);
    class_holder.appendChild(elem);

    elem = document.createElementNS(ns, "text");
    elem.setAttribute("x", classWidth/2);
    elem.setAttribute("y", 2);
    elem.setAttribute("font-size", 2);
    elem.setAttribute("style", "text-anchor: middle;");
    elem.appendChild(document.createTextNode("<<" + item.label + ">>"));
    class_holder.appendChild(elem);

    elem = document.createElementNS(ns, "text");
    elem.setAttribute("x", classWidth/2);
    elem.setAttribute("y", 4);
    elem.setAttribute("font-size", 2);
    elem.setAttribute("style", "text-anchor: middle;");
    elem.appendChild(document.createTextNode(item.classname));
    class_holder.appendChild(elem);
  });
}

function update() {

}

function zoom(e) {
  e.preventDefault();
  let oldzoom = zoomlevel
  zoomlevel += e.deltaY * -0.001;
  // Restrict scale
  zoomlevel = Math.min(Math.max(.75, zoomlevel), 8);
  let zoom_fac = zoomlevel - oldzoom;
  pan(0, 0,
    -(e.offsetX/svgElement.clientWidth*svgElement.clientWidth*zoom_fac),
    -(e.offsetY/svgElement.clientHeight*svgElement.clientHeight*zoom_fac)
  );
}

function pan(x, y, new_x, new_y) {
  pan_x = pan_x + new_x - x;
  pan_y = pan_y + new_y - y;
  main_g.setAttribute("transform", "translate("+pan_x+","+pan_y+") scale("+zoomlevel+")");
}

svgElement.addEventListener('wheel', zoom, {passive: false});

svgElement.addEventListener('mousedown', e => {
  mouse_x = e.offsetX;
  mouse_y = e.offsetY;
  isDragging = true;
});

svgElement.addEventListener('mousemove', e => {
  if (isDragging === true) {
    pan(mouse_x, mouse_y, e.offsetX, e.offsetY);
    mouse_x = e.offsetX;
    mouse_y = e.offsetY;
  }
});

window.addEventListener('mouseup', e => {
  if (isDragging === true) {
    pan(mouse_x, mouse_y, e.offsetX, e.offsetY);
    mouse_x = e.offsetX;
    mouse_y = e.offsetY;
    isDragging = false;
  }
});
