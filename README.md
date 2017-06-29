# is-tool

## Synopsis

**is-tool** is a command line tool and small set of library functions to perform helpful tasks against Impinj ItemSense&reg;. The command line aspect of **is-tool** is essentially an interface to the library functions.

The command line tool performs the following primary tasks:
* Stores all ItemSense configuration into a file in JSON format.
* Loads ItemSense configuration from a file.
* Converts configuration from ItemSense 2016r4 format to ItemSense 2016r6 format.
* Replace existing configuration.
* Delete specified configuration.
* Remove all configuration.


## Getting Started

### Prerequisites
As **is-tool** is a Node.js based tool, to run it you will need both NPM and Node.js installed on your system. Both can be downloaded from [here]( http://nodejs.org) (installing the Node.js gives you both the `npm` and `node` commands). Any NodeJs version above 6.9.4 is required.

### Installation
To install **is-tool** as a command line tool from an NPM repository run:

```bash
npm install -g is-tool
```
The tool should now be accessible from any location by the installation user.

To use the library functions provided by is-tool just include the tool in your package.json file as dependency.
Example:
```
"is-tool": "^0.2.0"
```
Then import the library into your project.
Example:
```js
const isToolLib = require("is-tool");
```

## Command Line Example

The following are examples on how to use the command line tool. A more complete description of each task is [below](#command-line).

### Save Config
```
is-tool save -i 10.200.90.177 itemsense-config.json
```

### Load Config
```
is-tool load -i 10.200.90.177 itemsense-config.json
```
```
is-tool load -i 10.200.90.177 --addpassword itemsense-config.json
```

### Convert to 2016r6 Format
```
is-tool convert itemsense2016r4-config.json
```

### Clear All Config
```
is-tool clear -i 10.200.90.177
```

### Remove Config
```
is-tool remove -i 10.200.90.177 itemsense-config.json
```

### Set Config
```
is-tool set -i 10.200.90.177 itemsense-config.json
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
This command dumps all ItemSense configuration to a fill specified file. If no filename is given then one is generated.  

Usage: `is-tool save [options] [file]`

|Options|Description|
|--------|------------|
|\[file\]|The filename to write the configuration to. If not specified, **is-tool** will create a file in the current directory in the format of is-save-<timestamp>.json|
|  -h, --help        |Output usage information for the task|
|  -i --ip \<ipaddr\>  |ItemSense IP address from which to save the configuration.|
|  -u --user \<user\>  |An ItemSense username for an admin level user. |
|  -p --pass \<pass\>  |ItemSense password for the above user. |

The IP address is mandatory but username and password are optional.  If they are not specified, is-tool will use the ItemSense default administration username and password.

#### Load
This command loads configuration from a specified file.

Usage: `is-tool load [options] <file>`

|Options|Description|
|--------|------------|
|\<file\>|The filename to read configuration from.|
|  -h, --help        |Output usage information for the task|
|  -i --ip \<ipaddr\>  |ItemSense IP address from which to save the configuration|
|  -u --user \<user\>  |An ItemSense username for an admin level user |
|  -p --pass \<pass\>  |ItemSense password for the above user |
|  -a --addpassword  |Add a default password of 'defualt01' to a user. Necessary when adding a new user to the system.|
|  -f --facility \<pass\>  |Name of new facility in which to add readers |

The IP address is mandatory but username and password are optional. If they are not specified, is-tool will use the ItemSense default administration username and password.

The ```--addpassword``` option is provided because it's not possible to get a user's password when querying for user configuration. This means if you used `is-tool save` to get the configuration of an ItemSense instance (including user configuration) with the intention to load it into a brand new clean ItemSense instance, a password has to be added to each user configuration before it can be loaded. This option does that for you.

#### Convert
This command converts configuration in a specified file to ItemSense 2016r6 format and then writes the converted configuration to a new file.

Usage: `is-tool convert [options] <file>`

|Options|Description|
|--------|------------|
|\[file\]|The filename to read configuration from.|

The output file containing the converted configuration will be placed in the same location as the input file except that it's name will have "-converted" appended to it.

So `is-save-r4.json` becomes `is-save-r4-converted.json`.

#### Clear
This command removes all configuration from an ItemSense instance. The default behavior is to preserve the Impinj default configuration but this can be overridden with the `completeclear` flag.

Usage: `is-tool clear [options]`

|Options|Description|
|--------|------------|
|  -h, --help        |Output usage information for the task|
|  -i --ip \<ipaddr\>  |ItemSense IP address from which to save the configuration.|
|  -u --user \<user\>  |An ItemSense username for an admin level user. |
|  -p --pass \<pass\>  |ItemSense password for the above user. |
|  -c --completeclear | Remove everything including Impinj Defaults. |

The IP address is mandatory but username and password are optional. If they are not specified, is-tool will use the ItemSense default administration username and password.

#### Remove
This command removes all configuration specified in a file. If the specified configuration isn't present in the ItemSense instance then it will be silent ignored. The configuration file takes the same format as what it produce by the save command. However, each configuration block only need to contain the `name` attribute. The other attributes are ignore.

Example:

```js
{
  "readerConfigurations": [
    {
      "name": "SPEEDWAY_2"
    },
    {
      "name": "SPEEDWAY_4"
    }
  ]
}
```
Usage: `is-tool remove [options] <file>`

|Options|Description|
|--------|------------|
|\<file\>|The filename containing the configuration to remove.|
|  -h, --help        |Output usage information for the task|
|  -i --ip \<ipaddr\>  |ItemSense IP address from which to save the configuration|
|  -u --user \<user\>  |An ItemSense username for an admin level user |
|  -p --pass \<pass\>  |ItemSense password for the above user |

The IP address is mandatory but username and password are optional.  If they are not specified, is-tool will use the ItemSense default administration username and password.

#### Set
This command is effectively a combination of the `clear` and `load` commands. While the load command adds configuration to existing configuration, the `set` command effectively sets all ItemSense configuration to what is specified in the configuration file. It does this by first removing all configuration from ItemSense before loading the configuration specified in the configuration file. As with the `clear` command, the default behavior is to preserve the Impinj default configuration but this can be overridden with the `completeclear` flag.

Usage: `is-tool set [options] <file>`

|Options|Description|
|--------|------------|
|\<file\>|The filename containing the configuration to remove.|
|  -h, --help        |Output usage information for the task|
|  -i --ip \<ipaddr\>  |ItemSense IP address from which to save the configuration|
|  -u --user \<user\>  |An ItemSense username for an admin level user |
|  -p --pass \<pass\>  |ItemSense password for the above user |
|  -a --addpassword  |Add a default password of 'defualt01' to a user. Necessary when adding a new user to the system.|
|  -f --facility \<pass\>  |Name of new facility in which to add readers |
|  -c --completeclear | Remove everything including Impinj Defaults. |


The IP address is mandatory but username and password are optional.  If they are not specified, is-tool will use the ItemSense default administration username and password. The ```--addpassword``` option is provided because it's not possible to get a user's password when querying for user configuration. This means if you used `is-tool save` to get the configuration of an ItemSense instance (including user configuration) with the intention to load it into a brand new clean ItemSense instance, a password has to be added to each user configuration before it can be loaded. This option does that for you.


### Library functions
All of these functions perform the same function as their command line equivalents. Also, each function returns a native promise.

To use the library it must be imported:
```js
const isToolLib = require('is-tool-lib');
```

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
isToolLib.load(itemsense, object, facility, addPassword);
```
Where:
**itemsense** - is an instance of an itemSense connection object as provided by the itemsense-node package.
**object** - is a javascript object which should contain 1 or more of the following keys:
* "facilities"
* "readerDefinitions"
* "readerConfigurations"
* "recipes"
* "zoneMaps"
* "users"
Each of these keys should then contain an array of one or more objects of the appropriate format. The output from `is-tool save` is in the correct form. This tool also accepts the configuration export created using [itemsense-viztool-js](https://github.com/impinj/itemsense-viztool-js).

Example of the format:
```js
{
  "facilities": [],
  "readerDefinitions": [],
  "readerConfigurations": [],
  "recipes": [],
  "zoneMaps": [],
  "users": []
}
```
**facility** - A string name of the new facility in which to add readers.
**addPassword** - A boolean flag which when set to `true` tells is-tool to set a password on t user being loaded.

If a configuration object already exists within ItemSense, it is updated.

#### Convert
The convert function looks like the following:
```js
isToolLib.convert(object);
```
Where:
**object** - is a javascript object which should contain ItemSense 2016r4 formatted configuration.

#### Clear
```js
isToolLib.clear(itemsense);
```
Where:
**itemsense** - is an instance of an itemSense connection object as provided by the itemsense-node package.

#### Remove
```js
isToolLib.clear(itemsense, object);
```
Where:
**itemsense** - is an instance of an itemSense connection object as provided by the itemsense-node package.
**object** - is a javascript object containing the objects to be removed. The description of this object is [above](#remove).

#### Set
```js
isToolLib.set(itemsense, configObject)
```
Where:
**itemsense** - is an instance of an itemSense connection object as provided by the itemsense-node package.
**object** - is a javascript object containing the following attributes:
* `configToLoad` - (Mandatory) An object containing the configuration to load after the itemSense instance has been cleared.
* `completeClear` - (Optional) A boolean which when set to `true` prevents the Impinj defaults from remaining in the ItemSense instance.
* `facility` - (Optional) A string name of the new facility in which to add readers.
* `addPassword` - (Optional) A boolean flag which when set to `true` tells is-tool to set a password on t user being loaded.

#### Get
This library function gets all configuration from an itemSense instance and returns the results in a promise as a java object.
```js
isToolLib.get(itemsense)
```
Where:
**itemsense** - is an instance of an itemSense connection object as provided by the itemsense-node package.


## Contributing

1. Fork the repository.
1. Create your feature branch: `git checkout -b my-new-feature`
1. Make changes and added test cases for changes.
1. Run tests: `npm test`
1. Verify coverage: `npm test --coverage` Note; this produces a **coverage/** directory in the base folder which will contain coverage results which can be displayed in a browser.
1. Lint: `npm run linter`
1. Commit your changes: `git commit -am 'Add some feature'`
1. Push to the branch: `git push origin my-new-feature`
1. Submit a pull request.


This tool uses the Apache v2.0 license. See the LICENSE file.
