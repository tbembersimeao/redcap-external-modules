<?php
namespace ExternalModules;

require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';
require_once APP_PATH_DOCROOT.'Classes/Files.php';

$pid = @$_GET['pid'];
$moduleDirectoryPrefix = $_GET['moduleDirectoryPrefix'];
$version = $_GET['moduleDirectoryVersion'];

if(empty($pid) && !ExternalModules::hasSystemSettingsSavePermission($moduleDirectoryPrefix)){
	header('Content-type: application/json');
	echo json_encode(array(
		'status' => 'You do not have permission to save system settings!'
	));
}

$pid = @$_GET['pid'];
$edoc = $_POST['edoc'];
$key = $_POST['key'];
$prefix = $_POST['moduleDirectoryPrefix'];

# Three states for external modules database
# 1. no entry: The edoc is the system default value; do not delete the system default
# 2. value = "": The edoc is empty file; no file is specified
# 3. value = ##: Edoc is uploaded in the edocs database under the numeric id

# Check if you are deleting the system default value
$systemValue = ExternalModules::getSystemSetting($prefix, $key);
if (($systemValue == $edoc) && $pid) {
	# set the setting as "" - this denotes an empty file space
	# if you deleted the actual database entry, then you would go to the system default value
	ExternalModules::setProjectSetting($prefix, $pid, $key, "");
	$type = "Set $edoc to ''";
} else {
	if (($edoc) && (is_numeric($edoc))) {
		ExternalModules::deleteEDoc($edoc);
		//Is repeatable?
		if (preg_match("/____/", $key)) {
			$settings = array();
			$parts = preg_split("/____/", $key);
			$shortKey = array_shift($parts);

			$data = ExternalModules::getProjectSetting($prefix, $pid, $shortKey);
			if (!isset($data) || !is_array($data) || $data == null) {
				//do nothing
			} else {
				$settings = r_search_and_replace($data,$edoc);
				ExternalModules::setProjectSetting($prefix, $pid, $shortKey, $settings);
				\REDCap::logEvent("Remove file $edoc on $prefix module to $key for ".(!empty($pid) ? "project ".$pid : "system"),var_export($settings,true));
			}
		} else {
			ExternalModules::removeFileSetting($prefix, $pid, $key);
			\REDCap::logEvent("Remove file $edoc on $prefix module to $key for ".(!empty($pid) ? "project ".$pid : "system"));
			$type = "Delete $edoc";
		}
	}

}


function r_search_and_replace( $arr,$edoc) {
	$newArray = [];
	$keyOffset = 0;
	foreach ( $arr as $idx => $_ ) {
		if( is_array( $_ ) ) {
			$newArray[$idx] = r_search_and_replace( $arr[$idx] ,$edoc);
		}
		else {
			if( is_string( $_ ) ){
                // Remove this from the array if it matches the edoc ID
			    if($edoc == $_){
					$keyOffset++;
                }
				else {
					$newArray[$idx - $keyOffset] = $_;
				}
            }
		}
	}
	return $newArray;
}

header('Content-type: application/json');
echo json_encode(array(
	'type' => $type,
        'status' => 'success',
        'moduleDirectoryPrefix' => $prefix,
		'settings' => json_encode($settings),
		'edoc' => $edoc
));

?>
