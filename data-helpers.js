let fileHandle;

document.getElementById('load-data-button').addEventListener('click', async () => {
  [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const obj = await parseCSV(file);
  console.log(obj[4]);
});

async function parseCSV(file) {
  var contents = await file.text();
  contents = contents.replace('\r\n', '\n')
  if (contents.endsWith('\n')) {
    contents = contents.slice(0, -2);
  }
  var lines = contents.split("\n");
  console.log(lines.length);
  var result = [];
  var headers = lines[0].split(",");
  console.log(headers);
  for (var i=1;i<lines.length;i++) {
      var obj = {};
      var currentline=lines[i].split(",");

      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }

      result.push(obj);
  }

  return result;
}
