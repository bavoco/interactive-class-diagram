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

function maxDependencies() {

}

function maxIncomingDependencies() {

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

function getRandomPos(i) {
  let rad = 2*Math.PI / classes.length * i;
  let x = 50 + 50 * Math.cos(rad);
  let y = 50 + 50 * Math.sin(rad);
  return [x, y];
}

function placement() {
  computeReverseDependencies();
  let layers = computeLayers();
  // classes.forEach((item, i) => {
  //   [item.x, item.y] = getRandomPos(i);
  // });
  for (var i = Object.keys(layers).length; i > 0; i--) {
    for (var j = 0; j < layers[i].length; j++) {
      classes[layers[i][j]].x = (j * 2) % 100;
      classes[layers[i][j]].y = i * 25 + Math.floor(j*2/100) * 3;
    }
  }
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
