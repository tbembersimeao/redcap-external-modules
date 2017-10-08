<?php
namespace ExternalModules;
require_once '../../classes/ExternalModules.php';
print ExternalModules::downloadModule($_GET['module_id'], false, true);