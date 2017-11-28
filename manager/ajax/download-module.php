<?php
namespace ExternalModules;
set_include_path('.' . PATH_SEPARATOR . get_include_path());
require_once '../../classes/ExternalModules.php';
print ExternalModules::downloadModule($_GET['module_id'], false, true);