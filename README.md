**PULL REQUESTS:** Please create pull requests against the **testing** branch (as opposed to **master**).

# REDCap External Modules
Development work for REDCap External Modules/Packages to support a standardized Hook/Plugin framework and management mechanism

## Installation
Clone this repo into to an **external_modules** directory under your REDCap web root (e.g., /redcap/external_modules/).

## Usage

The best way to get started is to download the example module from here:
https://github.com/mmcev106/redcap-external-module-example

It can be installed by downloading that repo as a ZIP file, then extracting it's contents to ```<redcap-web-root>/modules/vanderbilt_example_v1.0```

Here are a few details on managing modules:

* Once installed, modules can be enabled under the **Manage External Modules** link under **Control Center**.
* Enabling a module under **Control Center** does not enable it on any projects by default.
* To enable a module on a specific project, go to the **Manage External Modules** link on the project homepage, click **Search for Additional Module(s)**, and click **Enable** next to the desired module name. Then to configure a module, click **Configure** next to the module's name.
* To enable a module on ALL projects by default, go to the **Manage External Modules** link under **Control Center**, click **Configure** next to the module name, check the **Enable on all projects by default** checkbox, then click save.

The only setting that actually does anything in the example module is the **Project Menu Background CSS** setting.  This will change the background color of the menu on project pages, and is a great demo of simple hook usage, and how a setting can be set systemwide and/or overridden per project.
