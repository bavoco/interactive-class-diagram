var zoomlevel = 1;
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
var depth_slider_val = 10;
var threshold_slider_val = 1;
var aggregate_dependencies = true;

/**
 * Make an element larger.
 * @param {SVGElement} elem element to enlarge
 */
function enlarge(elem) {
  if (zoomlevel > 6) {
    return;
  }
  elem = main_g.removeChild(elem);
  let content = elem.getAttribute('transform');
  elem.setAttribute('transform', content+"scale(5)");
  main_g.appendChild(elem);
}

/**
 * Make an enlarged element small.
 * @param {SVGElement} elem element to reduce
 */
function reduce(elem) {
  let content = elem.getAttribute('transform');
  elem.setAttribute('transform', content.replace('scale(5)', ''));
}

/**
 * Toggle expanded on a package.
 * @param {int} id package to toggle
 */
function toggleExpanded(id) {
  pkg = findIdInTree(packagetree, id);
  pkg.expanded = !pkg.expanded;
  draw();
}

/**
 * Check if class role is hidden.
 * @param {object} cla - class to check role of.
 * @returns {boolean} whether class role is hidden.
 */
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

/**
 * Zoom visualization.
 * @param {Event} e - zoom event
 */
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

/**
 * Pan visualization.
 * @param {int} x - start x.
 * @param {int} y - start y.
 * @param {int} new_x - end x.
 * @param {int} new_y - end y.
 */
function pan(x, y, new_x, new_y) {
  pan_x = pan_x + new_x - x;
  pan_y = pan_y + new_y - y;
  main_g.setAttribute("transform", "translate("+pan_x+","+pan_y+") scale("+zoomlevel+")");
}

//
// Event Listeners for mouse interaction
//

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

// update viewbox on window resize
window.onresize = adjustViewBox;
function adjustViewBox() {
  svgElement.setAttribute("viewBox", [0, 0, svgElement.clientWidth, svgElement.clientHeight]);
}

//
// Event listeners for toggles and sliders in sidebar
//

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
