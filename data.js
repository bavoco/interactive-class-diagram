// define role colors
var roles = {
  "Controller": {color: "#6D00FF"},
  "Coordinator": {color: "#36C95E"},
  "Interfacer": {color: "#C8E11E"},
  "Information Holder": {color: "#D04C2F"},
  "Service Provider": {color: "#23B9DC"},
  "Structurer": {color: "#B64991"}
};
//var reverse_dependencies = [];
var packagetree = {children: {}, name: 'root', expanded: true};

/**
 * Build data structure needed for visualization.
 */
function data_init() {
  buildPackageTree();
  placement();
  draw();
}

/**
 * Add all classes to packagetree and give packages an id.
 */
function buildPackageTree() {
  for (let i = 0; i < classes.length; i++) {
    addKeyToTree(classes[i]);
  }
  giveAllPackagesAnId(packagetree, classes.length + 1);
  //console.log(packagetree);
}

/**
 * Computes and displays number of classes per role in sidebar.
 */
function numClassesPerRole() {
  var rolecount = roles;
  for (var prop in rolecount) {
    rolecount[prop].count = 0;
  }
  classes.forEach((item, i) => {
    rolecount[item.label].count += 1;
  });
  var countelem = document.getElementById('class-count');
  countelem.innerHTML = "";
  for (var prop in rolecount) {
    countelem.innerHTML += prop + ": " + rolecount[prop].count + "<br>";
  }
}

/**
 * Computes placement, initializes calcLeaves.
 */
function placement() {
  let max_x = 0;
  let lvs = 0;
  [lvs, max_x] = calcLeaves(packagetree, 0, 0, 0, 100);
  packagetree.x = max_x / 2 - 21 / 2;
}

/**
 * Computes placement of all packages and classes in packagetree.
 * @param {object} pkg - package.
 * @param {int} x - x for current package.
 * @param {int} y - y for current package.
 * @param {int} n_x - next x for children of current package.
 * @param {int} n_y - next y for children of current package.
 */
function calcLeaves(pkg, x, y, n_x, n_y) {
  pkg.x = x;
  pkg.y = y;
  let numchildren = Object.keys(pkg.children).length;
  if (numchildren == 0) {
    pkg.leaves = 0;
    return [1, n_x];
  }
  let size = Math.floor(Math.ceil(Math.sqrt(numchildren)/2));
  let size_y = Math.ceil(Math.sqrt(numchildren)) * 2;
  let totlvs = 0;
  let lvs = 0;
  let size_x = 0;
  let nn_y = n_y + size_y * 21 + 100;
  let nn_x = n_x;
  Object.keys(pkg.children).forEach((key, index) => {
    x = n_x + (index%size) * 21;
    y = n_y + Math.floor(index/size) * 21;
    [lvs, size_x] = calcLeaves(pkg.children[key], x, y, nn_x, nn_y);
    nn_x += size_x - nn_x;
    totlvs += lvs;
  });
  let returnval = Math.max(n_x + (size*21), nn_x) + 10;
  Object.keys(pkg.children).forEach(key => {
    pkg.children[key].x = (returnval-n_x) / 2 - 21*size/2 + pkg.children[key].x;
  });
  pkg.leaves = totlvs;
  return [totlvs, returnval];
}

// function computeReverseDependencies() {
//   for (var i = 0; i < dependencies.length; i++) {
//     reverse_dependencies.push({});
//   }
//   for (var i = 0; i < dependencies.length; i++) {
//     for (const [key, value] of Object.entries(dependencies[i])) {
//       reverse_dependencies[key][i] = value;
//     }
//   }
// }

/**
 * Adds a class to the packagetree.
 * @param {object} cla - class to add to the packagetree. 
 */
function addKeyToTree(cla) {
  let path = cla['dot_file_ext'].split('.');
  var currentelement = packagetree;
  for (let i = 0; i < path.length; i++) {
    if(!Object.keys(currentelement.children).includes(path[i])) {
      if (i < path.length - 1) {
        currentelement.children[path[i]] = {name: path[i], children: {}, expanded: true};
      } else {
        currentelement.children[path[i]] = {name: path[i], children: {}, id: cla.index, label: cla.label, classtype: cla.classtype};
      }
    } else {
      if (i == path.length - 1) {
        currentelement.children[path[i]].id = cla.index;
        currentelement.children[path[i]].label = cla.label;
        currentelement.children[path[i]].classtype = cla.classtype;
      }
    }
    currentelement = currentelement.children[path[i]];
  }
}

/**
 * Find id in tree.
 * @param {object} pkg - package to search through (haystack).
 * @param {int} id - needle.
 * @returns {(null|object)} null if id not found or package where id == needle.
 */
function findIdInTree(pkg, id) {
  if (pkg.id == id) {
    return pkg;
  }
  let foundpkg = null;
  let i = 0;
  let keys = Object.keys(pkg.children);
  while (foundpkg == null && i < keys.length) {
    foundpkg = findIdInTree(pkg.children[keys[i]], id);
    i++;
  }
  return foundpkg;
}

/**
 * returns list of children ids.
 * @param {object} pkg - package.
 * @returns {Array} list of children ids including package id.
 */
function getListOfChildren(pkg) {
  let childrenlist = [pkg.id];
  Object.keys(pkg.children).forEach((key, index) => {
    childrenlist = getListOfChildren(pkg.children[key]).concat(childrenlist);
  });
  return childrenlist;
}

/**
 * Finds parent of package or class with passed id.
 * @param {object} pkg - package to search in (haystack).
 * @param {int} id - needle.
 * @param {int} maxdepth - if parent of found id is lower than this depth, return anscestor at this depth.
 * @param {int} depth - current depth.
 * @returns {(null|int)} null if id not found or -1 if parent should be returned or id >= 0 of parent class. 
 */
function findClassParent(pkg, id, maxdepth, depth) {
  if (pkg.id == id) {
    return -1;
  }
  let foundpkg = null;
  let i = 0;
  let keys = Object.keys(pkg.children);
  while (foundpkg == null && i < keys.length) {
    foundpkg = findClassParent(pkg.children[keys[i]], id, maxdepth, depth+1);
    i++;
  }
  if (foundpkg == null) {
    return null;
  }
  if (Object.keys(pkg).includes('expanded') && pkg.expanded == true && depth <= maxdepth - 1) {
    if (foundpkg == -1) {
      return pkg.id;
    }
    return foundpkg;
  }
  return -1;
}

/**
 * Finds package which is the destination of the dependencie in the visualization.
 * @param {object} pkg - package to search through (haystack).
 * @param {int} id - needle.
 * @param {int} maxdepth - if found id is lower than this depth, parent at this depth must be returned.
 * @param {int} depth - current depth.
 * @returns {(null|object)} null if id is not found or the destination package.
 */
function findDependencieDestination(pkg, id, maxdepth, depth) {
  if (pkg.id == id) {
    return pkg;
  }
  let foundpkg = null;
  let i = 0;
  let keys = Object.keys(pkg.children);
  while (foundpkg == null && i < keys.length) {
    foundpkg = findDependencieDestination(pkg.children[keys[i]], id, maxdepth, depth+1);
    i++;
  }
  if (foundpkg == null) {
    return null;
  }
  if (Object.keys(pkg).includes('expanded') && pkg.expanded == true && depth <= maxdepth - 1) {
    return foundpkg;
  }
  return pkg;
}

/**
 * @param {object} pkg - package.
 * @param {int} nextid - int for which no int larger than nextid is already an id.
 */
function giveAllPackagesAnId(pkg, nextid) {
  if (!Object.keys(pkg).includes('id')) {
    pkg.id = nextid;
    nextid++;
  }
  Object.keys(pkg.children).forEach(key => {
    nextid = giveAllPackagesAnId(pkg.children[key], nextid);
  });
  return nextid;
}
