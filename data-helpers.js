let fileHandle;
var classes;
var dependencies;

document.getElementById('load-classes-button').addEventListener('click', async () => {
  [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  classes = await parseCSV(file);
  console.log(classes[0]);
});

document.getElementById('load-dependencies-button').addEventListener('click', async () => {
  [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  dependencies = await parseDepCSV(file);
  console.log(dependencies[0]);
});

async function parseCSV(file) {
  var contents = await file.text();
  contents = contents.replace('\r\n', '\n');
  if (contents.endsWith('\n')) {
    contents = contents.slice(0, -2);
  }
  var lines = contents.split("\n");
  console.log(lines.length);
  var result = [];
  var headers = lines[0].split(",");
  console.log(headers);
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

async function parseDepCSV(file) {
  var contents = await file.text();
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
