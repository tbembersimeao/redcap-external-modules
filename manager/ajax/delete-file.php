<?php
require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';
require_once APP_PATH_DOCROOT.'Classes/Files.php';

if(empty($pid) && !ExternalModules\ExternalModules::hasSystemSettingsSavePermission($moduleDirectoryPrefix)){
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
$systemValue = ExternalModules\ExternalModules::getSystemSetting($prefix, $key);
if (($systemValue == $edoc) && $pid) {
	# set the setting as "" - this denotes an empty file space
	# if you deleted the actual database entry, then you would go to the system default value
	ExternalModules\ExternalModules::setProjectSetting($prefix, $pid, $key, "");
	$type = "Set $edoc to ''";
} else {
	if (($edoc) && (is_numeric($edoc))) {
		ExternalModules\ExternalModules::deleteEDoc($edoc);
		$message = "";
		//Is repeatable?
		if (preg_match("/____/", $key)) {
			$settings = array();
			$parts = preg_split("/____/", $key);
			$shortKey = array_shift($parts);

			$data = ExternalModules\ExternalModules::getProjectSetting($prefix, $pid, $shortKey);
//            $message = $data;
			if (!isset($data) || !is_array($data) || $data == null) {
				//do nothing
			} else {
				$settings = r_search_and_replace($data,$edoc);
				ExternalModules\ExternalModules::setProjectSetting($prefix, $pid, $shortKey, $settings);
			}
		} else {
			ExternalModules\ExternalModules::removeFileSetting($prefix, $pid, $key);
			$type = "Delete $edoc";
		}
	}

}


function r_search_and_replace( &$arr,$edoc) {
	foreach ( $arr as $idx => $_ ) {
		if( is_array( $_ ) ) r_search_and_replace( $arr[$idx] ,$edoc);
		else {
//			if( is_string( $_ ) ) $arr[$idx] = str_replace( $edoc, '', $_ );
			if( is_string( $_ ) ){
			    if(sizeof($arr) == 2 && $edoc == $_){
			        unset($arr[$idx]);
                }else{
                    $arr[$idx] = str_replace( $edoc, '', $_ );
                }
            }
		}
	}
	return $arr;
}

header('Content-type: application/json');
echo json_encode(array(
	'type' => $type,
        'status' => 'success',
        'moduleDirectoryPrefix' => $prefix,
		'data' => json_encode($message),
		'settings' => json_encode($settings),
		'edoc' => $edoc
));

?>
