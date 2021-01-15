// uses classes and dependencies
var roles = {
  "Controller": {color: "#6D00FF"},
  "Coordinator": {color: "#36C95E"},
  "Interfacer": {color: "#C8E11E"},
  "Information Holder": {color: "#D04C2F"},
  "Service Provider": {color: "#23B9DC"},
  "Structurer": {color: "#B64991"}
};
var reverse_dependencies = [];

function data_init() {
  buildPackageTree();
  placement();
  draw();
}

var packagetree = {children: {}, name: 'root', expanded: true};

function buildPackageTree() {
  for (let i = 0; i < classes.length; i++) {
    addKeyToTree(classes[i]);
  }
  giveAllPackagesAnId();
  console.log(packagetree);
}

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

function placement() {
  let max_x = 0;
  let lvs = 0;
  [lvs, max_x] = calcLeaves2(packagetree, 0, 0, 0, 30, 0);
  packagetree.x = max_x / 2;
}

function calcLeaves2(pkg, x, y, n_x, n_y, depth) {
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
  let nn_y = n_y + size_y * 21 + 40;
  let nn_x = n_x;
  Object.keys(pkg.children).forEach((key, index) => {
    x = n_x + (index%size) * 21;
    y = n_y + Math.floor(index/size) * 21;
    [lvs, size_x] = calcLeaves2(pkg.children[key], x, y, nn_x, nn_y, depth + 1);
    nn_x += size_x - nn_x;
    totlvs += lvs;
  });
  let returnval = Math.max(n_x + (size*21), nn_x) + 10;
  Object.keys(pkg.children).forEach((key, index) => {
    pkg.children[key].x = (returnval-n_x) / 2 - 21*size/2 + pkg.children[key].x;
    // if (Object.keys(pkg.children[key]).includes('id') && pkg.id <= classes.length) {
    //   classes[pkg.children[key].id].x = pkg.children[key].x;
    // }
  });
  pkg.leaves = totlvs;
  //pkg.x = ((returnval-pkg.x) / 2) + pkg.x;
  //console.log(returnval);
  return [totlvs, returnval];
}

function computeReverseDependencies() {
  for (var i = 0; i < dependencies.length; i++) {
    reverse_dependencies.push({});
  }
  for (var i = 0; i < dependencies.length; i++) {
    for (const [key, value] of Object.entries(dependencies[i])) {
      reverse_dependencies[key][i] = value;
    }
  }
}

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

function findIdInTree(id) {
  return findIdInSubtree(packagetree, id);
}

function findIdInSubtree(pkg, id) {
  if (pkg.id == id) {
    return pkg;
  }
  let foundpkg = null;
  let i = 0;
  let keys = Object.keys(pkg.children);
  while (foundpkg == null && i < keys.length) {
    foundpkg = findIdInSubtree(pkg.children[keys[i]], id);
    i++;
  }
  return foundpkg;
}

function getListOfChildren(pkg) {
  let childrenlist = [pkg.id];
  Object.keys(pkg.children).forEach((key, index) => {
    childrenlist = getListOfChildren(pkg.children[key]).concat(childrenlist);
  });
  return childrenlist;
}

function findClassParent(id, maxdepth) {
  let returnval = findClassParentSub(packagetree, id, maxdepth, 0);
  if (returnval == -1) {
    return classes.length + 1;
  }
  return returnval;
}

function findClassParentSub(pkg, id, maxdepth, depth) {
  if (pkg.id == id) {
    return -1;
  }
  let foundpkg = null;
  let i = 0;
  let keys = Object.keys(pkg.children);
  while (foundpkg == null && i < keys.length) {
    foundpkg = findClassParentSub(pkg.children[keys[i]], id, maxdepth, depth+1);
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

function findDependencieDestination(id, maxdepth) {
  return findDependencieDestinationSub(packagetree, id, maxdepth, 0);
}

function findDependencieDestinationSub(pkg, id, maxdepth, depth) {
  if (pkg.id == id) {
    return pkg;
  }
  let foundpkg = null;
  let i = 0;
  let keys = Object.keys(pkg.children);
  while (foundpkg == null && i < keys.length) {
    foundpkg = findDependencieDestinationSub(pkg.children[keys[i]], id, maxdepth, depth+1);
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

function giveAllPackagesAnId() {
  let nextid = classes.length + 1;
  giveAllSubPackagesAnId(packagetree, nextid);
}

function giveAllSubPackagesAnId(pkg, nextid) {
  if (!Object.keys(pkg).includes('id')) {
    pkg.id = nextid;
    nextid++;
  }
  Object.keys(pkg.children).forEach((key, index) => {
    nextid = giveAllSubPackagesAnId(pkg.children[key], nextid);
  });
  return nextid;
}
