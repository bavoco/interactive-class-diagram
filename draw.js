var svgElement = document.getElementById('chart');
var ns = 'http://www.w3.org/2000/svg';
let elem = document.createElementNS(ns, "g");
svgElement.appendChild(elem);
var main_g = svgElement.firstChild;
var classWidth = 20;

/**
 * Draw visualization
 */
function draw() {
    svgElement.setAttribute("viewBox", [0, 0, svgElement.clientWidth, svgElement.clientHeight]);
    while (main_g.firstChild) {
      main_g.removeChild(main_g.firstChild);
    }
    drawRects(packagetree, 1);
  }
  
  /**
   * Draw classes and packages in a package
   * @param {object} pkg package to draw
   * @param {int} depth current depth
   */
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
  
/**
 * Draw rectangle around children of a package.
 * @param {object} pkg parent package
 */
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
        let parent = findClassParent(packagetree, pkg.id, 10, 0);
        if (parent == -1) {
        drawDottedLine(pkg.x + classWidth / 2, pkg.y + classWidth, min_x + (max_x - min_x)/2, min_y);
        } else {
        let pkg2 = findIdInTree(packagetree, parent);
        let minx, miny, maxx, maxy;
        [minx, miny, maxx, maxy] = getChildPackageDimensions(pkg2);
        drawDottedLine((maxx-minx)/2 + minx, maxy, min_x + (max_x - min_x)/2, min_y);
        }
    }
    if (aggregate_dependencies) {
        aggregateDependenciesChildren(pkg, min_x, min_y, max_x, max_y);
    }
}

/**
 * Get dimensions of the rectangle containing children packages/classes
 * @param {object} pkg parent package
 */
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

/**
 * Draw a package
 * @param {object} pkg package to draw
 * @param {int} depth depth of the package
 */
function drawPackageRect(pkg, depth) {
    let elem = document.createElementNS(ns, "g");
    elem.setAttribute("transform", "translate(" + pkg.x + "," + pkg.y + ")");
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

/**
 * Draw a Class
 * @param {object} cla class to draw
 * @param {int} depth depth of the class
 */
function drawClassRect(cla, depth) {
    if (classRoleHidden(cla)) {
        return;
    }
    let elem = document.createElementNS(ns, "g");
    elem.setAttribute("transform", "translate(" + cla.x + "," + cla.y + ")");
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
            let dest = findDependencieDestination(packagetree, key, depth_slider_val, 0);
            drawDependency(cla.x + classWidth/2, cla.y, dest.x + classWidth/2, dest.y + classWidth, 1);
        }
        }
    }
}

/**
 * Draw a dotted line.
 * @param {int} x1 start x
 * @param {int} y1 start y
 * @param {int} x2 end x
 * @param {int} y2 end y
 */
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

/**
 * Aggregates dependencies of a package.
 * @param {object} pkg - package.
 */
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
            let dest = findDependencieDestination(packagetree, key, depth_slider_val, 0);
            if (!Object.keys(counts).includes(dest.id.toString())) {
            counts[dest.id] = 0;
            }
            counts[dest.id]++;
        }
        }
    }
    Object.keys(counts).forEach(item => {
        if (counts[item] >= threshold_slider_val) {
        let pkg2 = findIdInTree(packagetree, item);
        drawDependency(pkg.x + classWidth/2, pkg.y, pkg2.x + classWidth/2, pkg2.y + classWidth, counts[item]);
        }
    });
}

/**
 * Aggregate dependencies of children packages
 * @param {object} pkg - parent package
 * @param {int} minx - left x of children packages
 * @param {int} miny - top y of children packages
 * @param {int} maxx - right x of children packages
 * @param {int} maxy - bottom y of children packages
 */
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
            let dest = findClassParent(packagetree, key, depth_slider_val, 0);
            if (!Object.keys(counts).includes(dest.toString())) {
            counts[dest] = 0;
            }
            counts[dest]++;
        }
        }
    }
    Object.keys(counts).forEach(item => {
        if (counts[item] >= threshold_slider_val) {
        let pkg2 = findIdInTree(packagetree, item);
        let min_x, min_y, max_x, max_y;
        [min_x, min_y, max_x, max_y] = getChildPackageDimensions(pkg2);
        drawDependency((maxx-minx)/2 + minx, miny, (max_x-min_x)/2 + min_x, max_y, counts[item]);
        }
    });
}

/**
 * Draw dependency line
 * @param {int} x1 - start x.
 * @param {int} y1 - start y.
 * @param {int} x2 - end x.
 * @param {int} y2 - end y.
 * @param {int} depval - amount of dependencies to represent.
 */
function drawDependency(x1, y1, x2, y2, depval) {
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
