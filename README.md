# is-tool

## Synopsis

**is-tool** is a command line tool and small set of library functions to perform helpful tasks agains Impinj ItemSense&reg;. The command line aspect of **is-tool** is essentially an interface to the library functions.
The command line tool performs the following primary tasks:
* Stores all ItemSense configuration into a file in JSON format.
* Loads ItemSense configuration from a file.
* Converts configuration from ItemSense 2016r4 format to ItemSense 2016r6 format.

## Getting Started

### Prerequisites
As **is-tool** is a nodejs based tool, to run it you will need both NPM and node installed on your system. The latest version of each is required.

### Installation
To install **is-tool** as a command line tool from an NPM repository run:

```bash
npm install -g is-tool
```
The tool should now be accessible from any location by the installation user.

To use the library functions provided by the tool just include the tool in your package.json file as dependency.
Example:
```
"is-tool": "^0.2.0"
```
Then import the library into you project.
Example:
```
var isToolLib = require("is-tool");
```


## Command Line Example

### Save Config
```
is-tool save -i 10.200.90.177 itemsense-config.json
```

### Load Config
```
is-tool load -i 10.200.90.177 itemsense-config.json
```

### Convert to 2016r6 Format
```
is-tool convert -i 10.200.90.177 itemsense2016r4-config.json
```

### Help
```
is-tool help
```
or
```
is-tool save --help
```

## Usage
### Command Line
The command line tool git-style sub-tasks in the format of:
```
is-tool <task>
```
Each of these sub-tasks have their own help menu which shows the task specific options.


#### Save
Usage: is-tool save [options] [file]


|Options|Description|
|--------|------------|
|\[file\]|The filename to write the configuration to. If not specified, **is-tool** will create a file in the current directory in the format of is-save-<timestamp>.json|
|  -h, --help        |Output usage information for the task|
|  -i --ip \<ipaddr\>  |ItemSense IP address from which to save the configuration.|
|  -u --user \<user\>  |An ItemSense username for an admin level user. |
|  -p --pass \<pass\>  |ItemSense password for the above user. |

The IP address is mandatory but username and password are optional. If they are not specified, the default to the ItemSense default administration username and password.

#### Load
Usage: is-tool load [options] <file>

|Options|Description|
|--------|------------|
|\<file\>|The filename to read configuration from.|
|  -h, --help        |Output usage information for the task|
|  -i --ip \<ipaddr\>  |ItemSense IP address from which to save the configuration.|
|  -u --user \<user\>  |An ItemSense username for an admin level user. |
|  -p --pass \<pass\>  |ItemSense password for the above user. |

The IP address is mandatory but username and password are optional. If they are not specified they default to the ItemSense default administration username and password.

#### Convert
Usage: is-tool load [options] <file>


|Options|Description|
|--------|------------|
|\[file\]|The filename to read configuration from.|

The output file containing the converted configuration will be placed in the same location as the input file except that it's name will have "-converted" appended to it.

So `is-save-r4.json` becomes `is-save-r4-converted.json`.

### Library functions
#### Save
The save function looks like the following:
```js
isToolLib.save(itemsense, fileLocation);
```
Where:
**itemsense** - is an instance of an itemSense connection object as provided by the itemsense-node package.
**fileLocation** - is the location and filename for where **is-tool* should write the configuration file.

#### Load
The load function looks like the following:
```js
isToolLib.load(itemsense, object);
```
Where:
**itemsense** - is an instance of an itemSense connection object as provided by the itemsense-node package.
**object** - is a javascript object which should contain 1 or more of the following keys:
* "facilities"
* "readerDefinitions"
* "readerConfigurations"</li>
* "recipes"
* "zoneMaps"
* "users"

Each of these keys should then contain and area of one or more objects of the appropriate format. The output from `is-tool save` is in the correct form. This tool also accepts the configuration export created using **itemsense-viztool-js**.

If a configuration object already exists within ItemSense, it is updated.

#### Convert
The convert function looks like the following:
```js
isToolLib.convert(object);
```
Where:
**object** - is a javascript object which should contain ItemSense 2016r4 configuration.



## Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## License

This tool uses the MIT license. See the LICENSE file.
