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

function maxDependencies() {

}

function maxIncomingDependencies() {

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
  calcLeaves(packagetree, 0);
}

function calcLeaves(pkg, x) {
  let numchildren = Object.keys(pkg.children).length;
  if (numchildren == 0) {
    pkg.leaves = 0
    pkg.x = x;
    return 1;
  }
  let totlvs = 0;
  let lvs = 0;
  pkg.x = x;
  Object.keys(pkg.children).forEach((key, index) => {
    lvs = calcLeaves(pkg.children[key], x);
    x += lvs*20;
    totlvs += lvs;
  });
  pkg.leaves = totlvs;
  pkg.x = pkg.x + (totlvs-1)*10;
  return totlvs;
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

function computeLayers() {
  let layers = {};
  let layer_classes = [];
  for (var i = 0; i < dependencies.length; i++) {
    if (Object.keys(reverse_dependencies[i]).length == 0 && Object.keys(dependencies[i]).length == 0) {
      layer_classes.push(i);
    }
  }
  layers[9] = layer_classes;
  layer_classes = [];
  for (var i = 0; i < dependencies.length; i++) {
    if (!layers[9].includes(i)) {
      layer_classes.push(i);
    }
  }
  layers[8] = [];
  i = 7;
  while (layer_classes.length > 0) {
    next_layer_classes = [];
    for (var j = 0; j < layer_classes.length; j++) {
      for (const [key, value] of Object.entries(dependencies[layer_classes[j]])) {
        let index = layer_classes.indexOf(parseInt(key));
        if (index > 0) {
          layer_classes.splice(index, 1);
          next_layer_classes.push(parseInt(key));
        }
      }
    }
    layers[eval(i)] = layer_classes;
    layer_classes = next_layer_classes;
    i--;
  }
  return layers;
}

function keyExistsInTree(path) {
  var currentelement = packagetree;
  for (let index = 0; index < path.length; index++) {
    const element = path[index];
    currentelement = currentelement?.children[element] ?? null;
  }
  if (currentelement) {
    return true;
  }
  return false;
}

function addKeyToTree(cla) {
  let path = cla['dot_file_ext'].split('.');
  var currentelement = packagetree;
  for (let index = 0; index < path.length; index++) {
    const element = path[index];
    if(!Object.keys(currentelement.children).includes(element)) {
      if (index < path.length - 1) {
        currentelement.children[element] = {name: element, children: {}, expanded: false};
      } else {
        //console.log('hier');
        currentelement.children[element] = {name: element, children: {}, id: cla.index, label: cla.label, classtype: cla.classtype};
      }
      console.log('there');
    }
    currentelement = currentelement.children[element];
  }
}
