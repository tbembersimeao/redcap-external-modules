<?php
namespace ExternalModules;
require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';
print ExternalModules::downloadModule($_GET['module_id'], false, true);