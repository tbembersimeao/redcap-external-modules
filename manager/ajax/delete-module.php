<?php
namespace ExternalModules;
require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';
print ExternalModules::deleteModuleDirectory($_POST['module_dir']);