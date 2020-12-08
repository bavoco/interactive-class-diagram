// uses classes and dependencies
var roles = {
  "Controller": {color: "#6D00FF"},
  "Coordinator": {color: "#36C95E"},
  "Interfacer": {color: "#C8E11E"},
  "Information Holder": {color: "#D04C2F"},
  "Service Provider": {color: "#23B9DC"},
  "Structurer": {color: "#B64991"}
};

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
  classes.forEach((item, i) => {
    [item.x, item.y] = getRandomPos(i);
  });
  for (var k = 0; k < 2; k++) {
    dependencies.forEach((item, i) => {
      for (const [key, value] of Object.entries(item)) {
        if (value == 1) {
          classes[i].x = 0.1 * classes[key].x + 0.9 * classes[i].x;
          classes[i].y = 0.1 * classes[key].y + 0.9 * classes[i].y;
          classes[key].x = 0.9 * classes[key].x + 0.1 * classes[i].x;
          classes[key].y = 0.9 * classes[key].y + 0.1 * classes[i].y;
        } else if (value == 2) {
          classes[i].x = 0.1 * classes[key].x + 0.9 * classes[i].x;
          classes[i].y = 0.1 * classes[key].y + 0.9 * classes[i].y;
          classes[key].x = 0.9 * classes[key].x + 0.1 * classes[i].x;
          classes[key].y = 0.9 * classes[key].y + 0.1 * classes[i].y;
        } else if (value == 3) {
          classes[i].x = 0.1 * classes[key].x + 0.9 * classes[i].x;
          classes[i].y = 0.1 * classes[key].y + 0.9 * classes[i].y;
          classes[key].x = 0.9 * classes[key].x + 0.1 * classes[i].x;
          classes[key].y = 0.9 * classes[key].y + 0.1 * classes[i].y;
        }
      }
    });
  }
}
