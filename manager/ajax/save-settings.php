<?php
namespace ExternalModules;
require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';

$pid = @$_GET['pid'];
$moduleDirectoryPrefix = $_GET['moduleDirectoryPrefix'];

$rawSettings = json_decode(file_get_contents('php://input'), true);
$module = ExternalModules::getModuleInstance($moduleDirectoryPrefix);
$validationErrorMessage = $module->validateSettings(ExternalModules::formatRawSettings($moduleDirectoryPrefix, $pid, $rawSettings));
if(!empty($validationErrorMessage)){
	die($validationErrorMessage);
}

ExternalModules::saveSettings($moduleDirectoryPrefix, $pid, $rawSettings);

// Log this event
$version = ExternalModules::getModuleVersionByPrefix($moduleDirectoryPrefix);
$logText = "Modify configuration for external module \"{$moduleDirectoryPrefix}_{$version}\" for " . (!empty($_GET['pid']) ? "project" : "system");
\REDCap::logEvent($logText);

header('Content-type: application/json');
echo json_encode(array(
    'status' => 'success',
    'test' => 'success'
));
