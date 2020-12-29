var svgElement = document.getElementById('chart');
var margin = {top: 0, right: 30, bottom: 20, left: 0};
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
var show_information_holders = false;
var show_service_providers = true;
var show_structurers = true;
var show_interfacers = true;
var show_coordinators = true;
var show_controllers = true;

function draw() {
  var svgWidth = Math.max(svgElement.clientWidth, 2000);
  var svgHeight = Math.max(svgElement.clientHeight, 2000);
  var width = svgWidth - margin.right - margin.left;
  var height = svgHeight - margin.top - margin.bottom;

  svgElement.setAttribute("viewBox", [0, 0, svgElement.clientWidth, svgElement.clientHeight]);
  while (main_g.firstChild) {
    main_g.removeChild(main_g.firstChild);
  }

  // var rects = svgElement.firstChild.getElementsByTagName("g");
  drawRect(packagetree, 0, 0, svgWidth, svgHeight, 1, main_g);
  drawPackageLines();

  // classes.forEach((item, i) => {
  //   if (!show_information_holders && item.label == "Information Holder") {
  //     return;
  //   }
  //   if (!show_service_providers && item.label == "Service Provider") {
  //     return;
  //   }
  //   let class_holder = document.createElementNS(ns, "g");
  //   class_holder.setAttribute("transform", "translate(" + x(item.x) + "," + y(item.y) + ")");
  //   main_g.appendChild(class_holder);

  //   let elem = document.createElementNS(ns, "rect");
  //   elem.setAttribute("width", classWidth);
  //   elem.setAttribute("height", classWidth);
  //   elem.setAttribute("transform", "translate(" + 0 + "," + 0 + ")");
  //   elem.setAttribute("fill", roles[item.label].color);
  //   class_holder.appendChild(elem);

  //   elem = document.createElementNS(ns, "text");
  //   elem.setAttribute("x", classWidth/2);
  //   elem.setAttribute("y", 2);
  //   elem.setAttribute("font-size", 2);
  //   elem.setAttribute("style", "text-anchor: middle;");
  //   elem.appendChild(document.createTextNode("<<" + item.label + ">>"));
  //   class_holder.appendChild(elem);

  //   elem = document.createElementNS(ns, "text");
  //   elem.setAttribute("x", classWidth/2);
  //   elem.setAttribute("y", 4);
  //   elem.setAttribute("font-size", 2);
  //   elem.setAttribute("style", "text-anchor: middle;");
  //   elem.appendChild(document.createTextNode(item.classname));
  //   class_holder.appendChild(elem);
  // });

  // dependencies.forEach((item, i) => {
  //   if (!show_information_holders && classes[i].label == "Information Holder") {
  //     return;
  //   }
  //   if (!show_service_providers && classes[i].label == "Service Provider") {
  //     return;
  //   }
  //   for (const [key, value] of Object.entries(item)) {
  //     if (!show_information_holders && classes[key].label == "Information Holder") {
  //       return;
  //     }
  //     if (!show_service_providers && classes[key].label == "Service Provider") {
  //       return;
  //     }
  //     let elem = document.createElementNS(ns, "line");
  //     elem.setAttribute("x1", x(classes[i].x) + classWidth / 2);
  //     elem.setAttribute("y1", y(classes[i].y));
  //     elem.setAttribute("x2", x(classes[key].x) + classWidth / 2);
  //     elem.setAttribute("y2", y(classes[key].y) + classWidth);
  //     elem.setAttribute("stroke", "black");
  //     elem.setAttribute("stroke-width", .2);
  //     main_g.appendChild(elem);
  //   }
  // });

}

function drawRect(pkg, xs, ys, xe, ye, depth, parent) {
  //let new_parent = document.createElementNS(ns, "g");
  //new_parent.setAttribute("transform", "translate(" + xs + "," + ys + ")");
  //parent.appendChild(new_parent);
  let numchildren = Object.keys(pkg.children).length; 
  if (numchildren == 0) {
    drawClassRect(pkg, 0, 0, xe, ye, depth, parent);
  //} else if (numchildren == 1) {
    //drawPackageRect(pkg, 0, 0, xe, ye, depth, parent);
    //drawRect(pkg.children[Object.keys(pkg.children)[0]], 3, 3, xe-6, ye-6, depth+1, parent);
  } else {
    drawPackageRect(pkg, 0, 0, 0, 0, depth, parent);
    //let size = xe / Math.ceil(Math.sqrt(numchildren));
    Object.keys(pkg.children).forEach((key, index) => {
      drawRect(pkg.children[key], 0, 0, 0, 0, depth+1, parent);
    });
  }
}

function drawPackageRect(pkg, xs, ys, xe, ye, depth, parent) {
  let packagewidth = 20;
  let packagepadding = 0;
  let elem = document.createElementNS(ns, "rect");
  elem.setAttribute("x", pkg.x);
  elem.setAttribute("y", pkg.y);
  elem.setAttribute("width", packagewidth);
  elem.setAttribute("height", packagewidth);
  elem.setAttribute("rx", 2);
  elem.setAttribute("ry", 2);
  elem.setAttribute("stroke", 'black');
  elem.setAttribute("stroke-width", 1);
  elem.setAttribute("fill", "transparent");
  //elem.setAttribute("transform", "translate(" + xs+packagepadding + "," + ys+packagepadding + ")");
  //elem.setAttribute("fill", roles[item.label].color);
  parent.appendChild(elem);

  elem = document.createElementNS(ns, "text");
  elem.setAttribute("x", pkg.x + packagewidth - packagepadding - 1);
  elem.setAttribute("y", pkg.y + packagepadding + 1);
  elem.setAttribute("font-size", 2);
  elem.setAttribute("style", "text-anchor: end; alignment-baseline: hanging;");
  elem.appendChild(document.createTextNode(pkg.name));
  parent.appendChild(elem);
}

function drawClassRect(cla, xs, ys, xe, ye, depth, parent) {
  if (!show_information_holders && cla.label == "Information Holder" ||
      !show_service_providers && cla.label == "Service Provider" ||
      !show_controllers && cla.label == "Controller" ||
      !show_coordinators && cla.label == "Coordinator" ||
      !show_interfacers && cla.label == "Interfacer" ||
      !show_structurers && cla.label == "Structurer"
  ) {
    return;
  }
  var classWidth = 20;
  let classpadding = 0;
  let elem = document.createElementNS(ns, "rect");
  elem.setAttribute("width", classWidth);
  elem.setAttribute("height", classWidth);
  elem.setAttribute("rx", 1);
  elem.setAttribute("ry", 1);
  elem.setAttribute("transform", "translate(" + cla.x + "," + cla.y + ")");
  elem.setAttribute("fill", roles[cla.label].color);
  parent.appendChild(elem);

  elem = document.createElementNS(ns, "text");
  elem.setAttribute("x", cla.x + classWidth/2 + classpadding);
  elem.setAttribute("y", cla.y + 4);
  elem.setAttribute("font-size", 2);
  elem.setAttribute("style", "text-anchor: middle;");
  elem.appendChild(document.createTextNode(cla.name));
  parent.appendChild(elem);
}

function drawPackageLines() {
  package_lines.forEach((item, index) => {
    drawDottedLine(item.x1, item.y1, item.x2, item.y2);
  });
}

function drawDottedLine(x1, y1, x2, y2) {
  elem = document.createElementNS(ns, "line");
  elem.setAttribute("x1", x1);
  elem.setAttribute("y1", y1);
  elem.setAttribute("x2", x2);
  elem.setAttribute("y2", y2);
  elem.setAttribute("stroke", "black");
  elem.setAttribute("stroke-width", .5);
  elem.setAttribute("stroke-dasharray", 4);
  main_g.appendChild(elem);
}

function zoom(e) {
  e.preventDefault();
  let oldzoom = zoomlevel;
  zoomlevel += e.deltaY * -0.01;
  // Restrict scale
  zoomlevel = Math.min(Math.max(0.5, zoomlevel), 8);
  let zoom_dif = zoomlevel - oldzoom;
  if (zoom_dif != 0) {
    let old_svg_x = (e.offsetX - margin.left - pan_x) / (oldzoom * svgElement.clientWidth) * zoom_dif * svgElement.clientWidth;
    let old_svg_y = (e.offsetY - margin.top - pan_y) / (oldzoom * svgElement.clientHeight) * zoom_dif * svgElement.clientHeight;
    pan(old_svg_x, old_svg_y, 0, 0);
    //draw();
  }
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

document.getElementById('toggle-information-holders').addEventListener('click', function() {
  show_information_holders = !show_information_holders;
  document.getElementById('toggle-information-holders').setAttribute('data-checked', show_information_holders);
  draw();
}, {passive: true});

document.getElementById('toggle-service-providers').addEventListener('click', function() {
  show_service_providers = !show_service_providers;
  document.getElementById('toggle-service-providers').setAttribute('data-checked', show_service_providers);
  draw();
}, {passive: true});

document.getElementById('toggle-structurers').addEventListener('click', function() {
  show_structurers = !show_structurers;
  document.getElementById('toggle-structurers').setAttribute('data-checked', show_structurers);
  draw();
}, {passive: true});

document.getElementById('toggle-interfacers').addEventListener('click', function() {
  show_interfacers = !show_interfacers;
  document.getElementById('toggle-interfacers').setAttribute('data-checked', show_interfacers);
  draw();
}, {passive: true});

document.getElementById('toggle-coordinators').addEventListener('click', function() {
  show_coordinators = !show_coordinators;
  document.getElementById('toggle-coordinators').setAttribute('data-checked', show_coordinators);
  draw();
}, {passive: true});

document.getElementById('toggle-controllers').addEventListener('click', function() {
  show_controllers = !show_controllers;
  document.getElementById('toggle-controllers').setAttribute('data-checked', show_controllers);
  draw();
}, {passive: true});
