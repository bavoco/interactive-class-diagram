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
var package_lines = [];

function data_init() {
  buildPackageTree();
  placement();
  draw();
}

var packagetree = {children: {}, name: 'root'};

function buildPackageTree() {
  for (let i = 0; i < classes.length; i++) {
    addKeyToTree(classes[i]);
  }
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
  calcLeaves2(packagetree, 0, 0, 0, 30, 0);
}

function calcLeaves2(pkg, x, y, n_x, n_y, depth) {
  if (Object.keys(pkg).includes('id')) {
    classes[pkg.id].x = x;
    classes[pkg.id].y = y;
  }
  pkg.x = x;
  pkg.y = y;
  let numchildren = Object.keys(pkg.children).length;
  if (numchildren == 0) {
    pkg.leaves = 0;
    return [1, n_x];
  }
  let size = Math.ceil(Math.sqrt(numchildren));
  let totlvs = 0;
  let lvs = 0;
  let size_x = 0;
  let nn_y = n_y + size * 21 + 10;
  let nn_x = n_x;
  Object.keys(pkg.children).forEach((key, index) => {
    x = n_x + (index%size) * 21;
    y = n_y + Math.floor(index/size) * 21;
    if (index == 0){
      package_lines.push({x1: pkg.x+10, y1: pkg.y+20, x2: x, y2: y});
    }
    [lvs, size_x] = calcLeaves2(pkg.children[key], x, y, nn_x, nn_y, depth + 1);
    nn_x += size_x - nn_x;
    totlvs += lvs;
  });
  pkg.leaves = totlvs;
  //pkg.x = (size_x_tot-pkg.x)/2 + pkg.x;
  let returnval = Math.max(n_x + (size*21), nn_x) + 10;
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
  if (Object.keys(pkg).includes('id')) {
    if (pkg.id == id) {
      return pkg;
    } else {
      return null;
    }
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
