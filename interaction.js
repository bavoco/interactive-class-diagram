var svgElement = document.getElementById('chart');
var ns = 'http://www.w3.org/2000/svg';
var zoomlevel = 1;
let elem = document.createElementNS(ns, "g");
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
var classWidth = 20;
var depth_slider_val = 10;
var threshold_slider_val = 1;
var aggregate_dependencies = true;

function draw() {
  svgElement.setAttribute("viewBox", [0, 0, svgElement.clientWidth, svgElement.clientHeight]);
  while (main_g.firstChild) {
    main_g.removeChild(main_g.firstChild);
  }
  drawRects(packagetree, 1);
}

function drawRects(pkg, depth) {
  let numchildren = Object.keys(pkg.children).length; 
  if (numchildren == 0) {
    drawClassRect(pkg, depth);
  } else {
    drawPackageRect(pkg, depth);
    if (pkg.expanded && depth_slider_val >= depth) {
      drawPackageChildrenOutline(pkg);
      Object.keys(pkg.children).forEach(key => {
        drawRects(pkg.children[key], depth+1);
      });
    } else if (!aggregate_dependencies) {
      aggregateDependencies(pkg);
    }
  }
}

function drawPackageChildrenOutline(pkg) {
  let min_x, min_y, max_x, max_y;
  [min_x, min_y, max_x, max_y] = getChildPackageDimensions(pkg);
  elem = document.createElementNS(ns, "rect");
  elem.setAttribute("x", min_x);
  elem.setAttribute("y", min_y);
  elem.setAttribute("width", max_x - min_x);
  elem.setAttribute("height", max_y - min_y);
  elem.setAttribute("rx", 2);
  elem.setAttribute("ry", 2);
  elem.setAttribute("stroke", 'black');
  elem.setAttribute("stroke-width", 1);
  elem.setAttribute("fill", "transparent");
  main_g.appendChild(elem);
  if (!aggregate_dependencies) {
    drawDottedLine(pkg.x + classWidth / 2, pkg.y + classWidth, min_x + (max_x - min_x)/2, min_y);
  } else {
    let parent = findClassParent(pkg.id, 10);
    let pkg2 = findIdInTree(parent);
    let minx, miny, maxx, maxy;
    [minx, miny, maxx, maxy] = getChildPackageDimensions(pkg2);
    drawDottedLine((maxx-minx)/2 + minx, maxy, min_x + (max_x - min_x)/2, min_y);
  }
  if (aggregate_dependencies) {
    aggregateDependenciesChildren(pkg, min_x, min_y, max_x, max_y);
  }
}

function getChildPackageDimensions(pkg) {
  let min_x = 10000, min_y = 10000, max_x = 0, max_y = 0;
  Object.keys(pkg.children).forEach(key => {
    let child = pkg.children[key];
    if (min_x > child.x) {
      min_x = child.x;
    }
    if (min_y > child.y) {
      min_y = child.y;
    }
    if (max_x < child.x) {
      max_x = child.x;
    }
    if (max_y < child.y) {
      max_y = child.y;
    }
  });
  let packagepadding = 2.5;
  return [min_x - packagepadding, min_y - packagepadding, max_x + classWidth + packagepadding, max_y + classWidth + packagepadding];
}

function drawPackageRect(pkg, depth) {
  let elem = document.createElementNS(ns, "g");
  elem.setAttribute("transform", "translate(" + pkg.x + "," + pkg.y + ")");
  elem.setAttribute("onmouseenter", "enlarge(this)");
  elem.setAttribute("onmouseleave", "reduce(this)");
  elem.setAttribute("onclick", "toggleExpanded("+pkg.id+")");
  let parent = main_g.appendChild(elem);

  let packagepadding = 0;
  elem = document.createElementNS(ns, "rect");
  elem.setAttribute("width", classWidth);
  elem.setAttribute("height", classWidth);
  elem.setAttribute("rx", 2);
  elem.setAttribute("ry", 2);
  elem.setAttribute("stroke", 'black');
  elem.setAttribute("stroke-width", 1);
  if (Object.keys(pkg).includes('label') && !classRoleHidden(pkg)) {
    elem.setAttribute("fill", roles[pkg.label].color);
  } else {
    elem.setAttribute("fill", "transparent");
  }
  parent.appendChild(elem);

  elem = document.createElementNS(ns, "text");
  elem.setAttribute("x", classWidth - packagepadding - 1);
  elem.setAttribute("y", packagepadding + 1);
  elem.setAttribute("font-size", 2);
  elem.setAttribute("style", "text-anchor: end; alignment-baseline: hanging;");
  elem.appendChild(document.createTextNode(pkg.name));
  parent.appendChild(elem);
}

function drawClassRect(cla, depth) {
  if (classRoleHidden(cla)) {
    return;
  }
  let elem = document.createElementNS(ns, "g");
  elem.setAttribute("transform", "translate(" + cla.x + "," + cla.y + ")");
  elem.setAttribute("onmouseenter", "enlarge(this)");
  elem.setAttribute("onmouseleave", "reduce(this)");
  let parent = main_g.appendChild(elem);

  let classpadding = 0;
  elem = document.createElementNS(ns, "rect");
  elem.setAttribute("width", classWidth);
  elem.setAttribute("height", classWidth);
  elem.setAttribute("rx", 1);
  elem.setAttribute("ry", 1);
  elem.setAttribute("fill", roles[cla.label].color);
  parent.appendChild(elem);

  elem = document.createElementNS(ns, "text");
  elem.setAttribute("x", classWidth/2 + classpadding);
  elem.setAttribute("y", 4);
  elem.setAttribute("font-size", 2);
  elem.setAttribute("style", "text-anchor: middle;");
  elem.appendChild(document.createTextNode(cla.name));
  parent.appendChild(elem);

  if (threshold_slider_val == 1 && !aggregate_dependencies) {
    for (const [key, value] of Object.entries(dependencies[cla.id])) {
      if (classRoleHidden(classes[key])) {
        continue;
      }
      if (value == 1) {
        let dest = findDependencieDestination(key, depth_slider_val);
        drawDependecie(cla.x + classWidth/2, cla.y, dest.x + classWidth/2, dest.y + classWidth, 1);
      }
    }
  }
}

function enlarge(elem) {
  if (zoomlevel > 6) {
    return;
  }
  elem = main_g.removeChild(elem);
  let content = elem.getAttribute('transform');
  elem.setAttribute('transform', content+"scale(5)");
  main_g.appendChild(elem);
}

function reduce(elem) {
  let content = elem.getAttribute('transform');
  elem.setAttribute('transform', content.replace('scale(5)', ''));
}

function toggleExpanded(id) {
  pkg = findIdInTree(id);
  pkg.expanded = !pkg.expanded;
  draw();
}

function drawDottedLine(x1, y1, x2, y2) {
  let elem = document.createElementNS(ns, "line");
  elem.setAttribute("x1", x1);
  elem.setAttribute("y1", y1);
  elem.setAttribute("x2", x2);
  elem.setAttribute("y2", y2);
  elem.setAttribute("stroke", "black");
  elem.setAttribute("stroke-width", .2);
  elem.setAttribute("stroke-dasharray", 4);
  main_g.appendChild(elem);
}

function classRoleHidden(cla) {
  if (!show_information_holders && cla.label == "Information Holder" ||
      !show_service_providers && cla.label == "Service Provider" ||
      !show_controllers && cla.label == "Controller" ||
      !show_coordinators && cla.label == "Coordinator" ||
      !show_interfacers && cla.label == "Interfacer" ||
      !show_structurers && cla.label == "Structurer") {
    return true;
  }
  return false;
}

function aggregateDependencies(pkg) {
  let children = getListOfChildren(pkg);
  let counts = {};
  for (let i = 0; i < children.length; i++) {
    const id = children[i];
    if (id >= classes.length || classRoleHidden(classes[id])) {
      continue;
    }
    for (const [key, value] of Object.entries(dependencies[id])) {
      if (classRoleHidden(classes[key])) {
        continue;
      }
      if (value == 1) {
        let dest = findDependencieDestination(key, depth_slider_val);
        if (!Object.keys(counts).includes(dest.id.toString())) {
          counts[dest.id] = 0;
        }
        counts[dest.id]++;
      }
    }
  }
  Object.keys(counts).forEach(item => {
    if (counts[item] >= threshold_slider_val) {
      let pkg2 = findIdInTree(item);
      drawDependecie(pkg.x + classWidth/2, pkg.y, pkg2.x + classWidth/2, pkg2.y + classWidth, counts[item]);
    }
  });
}

function aggregateDependenciesChildren(pkg, minx, miny, maxx, maxy) {
  let children = [];
  Object.keys(pkg.children).forEach(item => {
    if (Object.keys(pkg.children[item]).includes('expanded')) {
      if (pkg.children[item].expanded) {
        children.push(pkg.children[item].id);
      } else {
        children = children.concat(getListOfChildren(pkg.children[item]));
      }
    } else {
      children.push(pkg.children[item].id);
    }
  });
  let counts = {};
  for (let i = 0; i < children.length; i++) {
    const id = children[i];
    if (id >= classes.length || classRoleHidden(classes[id])) {
      continue;
    }
    for (const [key, value] of Object.entries(dependencies[id])) {
      if (classRoleHidden(classes[key])) {
        continue;
      }
      if (value == 1) {
        let dest = findClassParent(key, depth_slider_val);
        if (!Object.keys(counts).includes(dest.toString())) {
          counts[dest] = 0;
        }
        counts[dest]++;
      }
    }
  }
  Object.keys(counts).forEach(item => {
    if (counts[item] >= threshold_slider_val) {
      let pkg2 = findIdInTree(item);
      let min_x, min_y, max_x, max_y;
      [min_x, min_y, max_x, max_y] = getChildPackageDimensions(pkg2);
      drawDependecie((maxx-minx)/2 + minx, miny, (max_x-min_x)/2 + min_x, max_y, counts[item]);
    }
  });
}

function drawDependecie(x1, y1, x2, y2, depval) {
  //value 1 x depends on y
  //value 2 x sub class of y
  //value 3 x implements y
  let elem = document.createElementNS(ns, "line");
  elem.setAttribute("x1", x1);
  elem.setAttribute("y1", y1);
  elem.setAttribute("x2", x2);
  elem.setAttribute("y2", y2);
  elem.setAttribute("stroke", "black");
  elem.setAttribute("stroke-width", Math.min(depval*0.1, 5));
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
    let old_svg_x = (e.offsetX - pan_x) / (oldzoom * svgElement.clientWidth) * zoom_dif * svgElement.clientWidth;
    let old_svg_y = (e.offsetY - pan_y) / (oldzoom * svgElement.clientHeight) * zoom_dif * svgElement.clientHeight;
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

window.onresize = adjustViewBox;
function adjustViewBox() {
  svgElement.setAttribute("viewBox", [0, 0, svgElement.clientWidth, svgElement.clientHeight]);
}

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

document.getElementById('slider-depth').addEventListener('input', function() {
  depth_slider_val = document.getElementById('slider-depth').value;
  document.getElementById('slider-depth-output').textContent = depth_slider_val;
  draw();
}, {passige: true});

document.getElementById('slider-threshold').addEventListener('input', function() {
  threshold_slider_val = document.getElementById('slider-threshold').value;
  document.getElementById('slider-threshold-output').textContent = threshold_slider_val;
  draw();
}, {passige: true});

document.getElementById('toggle-aggregate-dependencies').addEventListener('click', function() {
  aggregate_dependencies = !aggregate_dependencies;
  document.getElementById('toggle-aggregate-dependencies').setAttribute('data-checked', aggregate_dependencies);
  draw();
}, {passive: true});
