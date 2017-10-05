<?php
namespace ExternalModules;
require_once '../../classes/ExternalModules.php';
print ExternalModules::deleteModuleDirectory($_POST['module_dir']);