## Developer methods for External Modules

"External Modules" is a class-based framework for plugins and hooks. Modules can utilize any of the "REDCap" class methods (e.g., REDCap::getData), and they also come with many other helpful built-in methods to store and manage settings for a given module. 

### how to call hooks???

### Naming a module

Modules must follow a specific naming scheme for the module directory that will sit on the REDCap web server. Each version of a module will have its own directory (like REDCap) and will be located in the `/redcap/modules/` directory on the REDCap web server. A module directory name consists of three parts: 
1. a **unique name** (so that it will not duplicate any one else's module in the consortium) in [snake case](https://en.wikipedia.org/wiki/Snake_case) format
1. an underscore + letter "v"
1. a **module version number in X.Y format** that consists of a major version X and minor version Y (e.g., 1.0 or 3.25), in which X and Y must be an integer beginning wi1 up to 100.

The diagram below shows the general directory structure of some hypothetical  modules to illustrate how modules will sit on the REDCap web server alongside other REDCap files and directories.
```
redcap
|-- modules
|   |-- mymodulename_v1.0
|   |-- other_module_v2.9
|   |-- other_module_v2.10
|   |-- other_module_v2.11
|   |-- yet_another_module_v1.5
|-- redcap_vX.X.X
|-- redcap_connect.php
|-- ...
```

### Module requirements

**Every module must have two files at the minimum:** `config.json` and the module PHP class file (e.g., `MyModuleClass.php`). The config file contains all the module's basic configuration, such as its title, author information, module permissions, and many other module settings. The module class file houses the basic business logic of the module, and the file can be named whatever you like so long as the file name matches the class name (e.g., Votecap.php contains the class Votecap). 

A class named *AbstractExternalModule* is included in the External Modules framework, and it provides all the helper methods documented below that you can use in your module. The module class must extend the *AbstractExternalModule* class, as seen below in an example file that might be named `MyModuleClass.php`.
``` php
<?php 
namespace UniqueNamespaceOfYourChoice\MyModuleClass;
use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;
class MyModuleClass extends AbstractExternalModule {
...
```
Or alternatively,
``` php
<?php 
namespace UniqueNamespaceOfYourChoice\MyModuleClass;
class MyModuleClass extends \ExternalModules\AbstractExternalModule {
...
````
The **MyModuleClass** class name in the examples above can be named whatever you wish for a given module. The module class file must also have the same name as the class name (e.g., **MyModuleClass.php**). Also, the **UniqueNamespaceOfYourChoice** namespace is also up to you to name it. Please note that the full namespace declared in a module must exactly match the "namespace" setting in the **config.json** file (with the exception of there being a double backslash in the config file because of escaping in JSON).


``` json
{
	"name": "Example Module",
	"namespace": "UniqueNamespaceOfYourChoice\\MyModuleClass", 
...
```

It is also required that the sub-namespace matches the module's class name (e.g., MyModuleClass). Using namespacing in this way helps prevent against collisions in PHP class naming when multiple modules are being used in REDCap at the same time. **Recommendation:** For the first part of the namespace, you might want to use the name of your institution as a way of grouping the modules you and your team create (e.g., `namespace Vanderbilt\VoteCap;`).

Listed below are methods that module creators may make use of the following methods to store and manage settings for their module. These methods can be called inside your module class using **$this** (e.g., `$this->getModuleName()`).

To learn about how to utilize cron jobs in a module, see the **cron job documentation** near the bottom of this page.

### Available Developer Methods in External Modules

Method  | Description
------- | -----------
createDAG($name) | Creates a DAG with the specified name, and returns it's ID.
delayModuleExecution() | pushes the execution of the module to the end of the queue; helpful to wait for data to be processed by other modules; execution of the module will be restarted from the beginning
disableUserBasedSettingPermissions() | By default an exception will be thrown if a set/remove setting method is called and the current user doesn't have access to change that setting.  Call this method in a module's constructor to disable this behavior and leave settings permission checking up to the module itself.
getChoiceLabel($fieldName, $value[, $pid]) | Get the label associated with the specified choice value for a particular field.
getChoiceLabels($fieldName[, $pid]) | Returns an array mapping all choice values to labels for the specified field.
getConfig() | get the config for the current External Module; consists of config.json and filled-in values
getModuleDirectoryName() | get the directory name of the current external module
getModuleName() | get the name of the current external module
getModulePath() | Get the path of the current module directory (e.g., /var/html/redcap/modules/votecap_v1.1/)
getProjectSetting($key&nbsp;[,&nbsp;$pid]) | Returns the value stored for the specified key for the current project if it exists.  If this setting key is not set (overriden) for the current project, the systemwide value for this key is returned.  In most cases the project id can be detected automatically, but it can optionaly be specified as the third parameter instead.
getSettingConfig($key) | Returns the configuration for the specified setting.
getSettingKeyPrefix() | This method can be overridden to prefix all setting keys.  This allows for multiple versions of settings depending on contexts defined by the module.
getSubSettings($key) | Returns the sub-settings under the specified key in a user friendly array format.
getSystemSetting($key) | Get the value stored systemwide for the specified key.
getUrl($path [, $noAuth=false [, $useApiEndpoint=false]]) | Get the url to a resource (php page, js/css file, image etc.) at the specified path relative to the module directory. If the $noAuth parameter is set to true, then "&NOAUTH" will be appended to the URL, which disables REDCap's authentication for that PHP page (assuming the link's URL in config.json contains "&NOAUTH"). Also, if you wish to obtain an alternative form of the URL that does not contain the REDCap version directory (e.g., https://example.com/redcap/redcap_vX.X.X/ExternalModules/?id=1&page=index&pid=33), then set $useApiEndpoint=true, which will return a version-less URL using the API end-point (e.g., https://example.com/redcap/api/?id=1&page=index&pid=33). Both links will work identically.
hasPermission($permissionName) | checks whether the current External Module has permission for $permissionName
removeProjectSetting($key&nbsp;[,&nbsp;$pid]) | Remove the value stored for this project and the specified key.  In most cases the project id can be detected automatically, but it can optionaly be specified as the third parameter instead. 
removeSystemSetting($key) | Remove the value stored systemwide for the specified key.
renameDAG($dagId, $name) | Renames the DAG with the given ID to the specified name.
setDAG($record, $dagId) | Sets the DAG for the given record ID to given DAG ID.
setData($record, $fieldName, $values) | Sets the data for the given record and field name to the specified value or array of values.
setProjectSetting($key,&nbsp;$value&nbsp;[,&nbsp;$pid]) | Set the setting specified by the key to the specified value for this project (override the systemwide setting).  In most cases the project id can be detected automatically, but it can optionaly be specified as the third parameter instead.
setSystemSetting($key,&nbsp;$value) | Set the setting specified by the key to the specified value systemwide (shared by all projects).

### Utilizing Cron Jobs for Modules

Modules can actually have their own cron jobs that are run at a given interval by REDCap (alongside REDCap's internal cron jobs). This allows modules to have processes that are not run in real time but in the background at a given interval. There is no limit on the number of cron jobs that a module can have, and each can be configured to run at different times for different purposes. 

Module cron jobs must be defined in the config.json as seen below, in which each has a `cron_name` (alphanumeric name that is unique within the module), a `cron_description` (text that describes what the cron does), and a `method` (refers to a PHP method in the module class that will be called when the cron is run). The `cron_frequency` and `cron_max_run_time` must be defined as integers (in units of seconds). The cron_max_run_time refers to the maximum time that the cron job is expected to run (once that time is passed, if the cron is still listed in the state of "processing", it assumes it has failed/crashed and thus will automatically enable it to run again at the next scheduled interval). Note: If any of the cron attributes are missing, it will prevent the module from being enabled.

``` json
{
	"name": "Name of the module",
	"crons": [
		{
			"cron_name": "cron1",
			"cron_description": "Cron that runs every 30 minutes to do X",
			"method": "cron1",
			"cron_frequency": "1800",
			"cron_max_run_time": "60"
		 },
		{
			"cron_name": "cron2",
			"cron_description": "Cron that runs daily to do Y",
			"method": "some_other_method",
			"cron_frequency": "86400",
			"cron_max_run_time": "1200"
		 }
	]
	...
}
```