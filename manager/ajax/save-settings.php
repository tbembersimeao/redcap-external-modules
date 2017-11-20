<?php
namespace ExternalModules;
require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';

$pid = @$_GET['pid'];
$moduleDirectoryPrefix = $_GET['moduleDirectoryPrefix'];

$settings = json_decode(file_get_contents('php://input'), true);
ExternalModules::saveSettings($moduleDirectoryPrefix, $pid, $settings);

// Log this event
$version = ExternalModules::getModuleVersionByPrefix($moduleDirectoryPrefix);
$logText = "Modify configuration for external module \"{$moduleDirectoryPrefix}_{$version}\" for " . (!empty($_GET['pid']) ? "project" : "system");
\REDCap::logEvent($logText);

header('Content-type: application/json');
echo json_encode(array('status' => 'success'));
