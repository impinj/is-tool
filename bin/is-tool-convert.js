var Itemsense = require('itemsense-node');
var loadIsConfig = require('../lib/load');
var converter = require('../lib/convert-r4-to-r6')
var program = require('commander');
var fs = require('fs');
var path = require('path');

program
  .description("Convert an ItemSense 2016r4 config file to 2016r6 format. The" +
  " tool writes the converted file to the same directory as the input file but " +
  "adds \'-converted\' to the file name.")
  .parse(process.argv)

if (!program.args || program.args.length == 0) {
  console.log("No file specified to load.")
  process.exit(1)
}

loadFile(program.args[0]).then(
  config => { return converter(config)}
)
.then(
  convertedConfig => { return writeFile(convertedConfig, program.args[0]) }
)
.then(
  (newfilename) => console.log("Wrote " + newfilename)
)
.catch(
  reason => console.log("Failure during convertion: \n  " + reason.stack + "\n")
)

function loadFile(filename){
  return new Promise(function(resolve, reject){
    console.log('Reading ' + filename);
    fs.readFile(filename, 'utf8', (err,data)=>{
      if(err) reject(err)
      else resolve(JSON.parse(data));
    });
  });
}

function writeFile(convertedConfig, filename){
  return new Promise(function(resolve, reject){
    console.log("Writing converted file");
    var parsed = path.parse(filename);
    let newfilename = (parsed.dir == '' ?  "" : parsed.dir + "/") + parsed.name + "-converted" + parsed.ext;
    fs.writeFile(newfilename, JSON.stringify(convertedConfig, null, 2), (err) => {
      if(err) reject(err);
      else resolve(newfilename);
    })
  })
}
