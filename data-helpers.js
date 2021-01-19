let fileHandle;
var classes;
var dependencies;

/**
 * Load classes
 */
document.getElementById('load-classes-button').addEventListener('click', async () => {
  [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  var contents = await file.text();
  classes = await parseCSV(contents);
  //console.log(classes[0]);
  checkifbothloaded();
  numClassesPerRole();
});

/**
 * Load dependencies
 */
document.getElementById('load-dependencies-button').addEventListener('click', async () => {
  [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  var contents = await file.text();
  dependencies = await parseDepCSV(contents);
  //console.log(dependencies[0]);
  checkifbothloaded();
});

/**
 * Parse classses CSV
 * @param {String} contents - content of the csv
 * @returns {Array} classes
 */
async function parseCSV(contents) {
  contents = contents.replace('\r\n', '\n');
  if (contents.endsWith('\n')) {
    contents = contents.slice(0, -2);
  }
  var lines = contents.split("\n");
  console.log(lines.length-1);
  var result = [];
  var headers = lines[0].split(",");
  //console.log(headers);
  for (var i=1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");

    for (var j=0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
}

/**
 * Parse dependencies CSV
 * @param {String} contents - content of the csv
 * @returns {Array} dependecies
 */
async function parseDepCSV(contents) {
  contents = contents.replace('\r\n', '\n');
  if (contents.endsWith('\n')) {
    contents = contents.slice(0, -2);
  }
  var lines = contents.split("\n");
  console.log(lines.length);
  var result = [];
  for (var i=0; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");

    for (var j=0; j < currentline.length; j++) {
      if (currentline[j] == 0) {
      } else if (currentline[j] == 1) {
        obj[j] = 1;
      } else if (currentline[j] == 2) {
        obj[j] = 2;
      } else if (currentline[j] == 3) {
        obj[j] = 3;
      } else {
        console.log('unknown value in dependencie matrix');
      }
    }
    result.push(obj);
  }
  return result;
}

/**
 * Check if both classes and dependencies are loaded
 */
function checkifbothloaded() {
  if (classes != null && classes.length > 0 && dependencies != null && dependencies.length > 0) {
    data_init();
  }
}

/**
 * Load files on page load
 */
document.addEventListener('load', loadFiles());

/**
 * Load default data set
 */
async function loadFiles() {
  classes = await parseCSV(classes_file.text);
  numClassesPerRole();
  dependencies = await parseDepCSV(dependencies_file.text);
  checkifbothloaded();
}
