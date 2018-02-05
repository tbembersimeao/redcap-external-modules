<?php
require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';
require_once APP_PATH_DOCROOT.'Classes/Files.php';

$pid = @$_GET['pid'];
$moduleDirectoryPrefix = $_GET['moduleDirectoryPrefix'];
$version = $_GET['moduleDirectoryVersion'];

if(empty($pid) && !ExternalModules\ExternalModules::hasSystemSettingsSavePermission($moduleDirectoryPrefix)){
	header('Content-type: application/json');
	echo json_encode(array(
		'status' => 'You do not have permission to save system settings!'
	));
}

$config = ExternalModules\ExternalModules::getConfig($moduleDirectoryPrefix, $version, $pid);
$files = array();
foreach(['system-settings', 'project-settings'] as $settingsKey){
	 foreach($config[$settingsKey] as $row) {
         if($row['type'] && ($row['type'] == "sub_settings") && $row['sub_settings']){
             foreach ($row['sub_settings'] as $r){
                 if ($r['type'] && ($r['type'] == "file")) {
                     $files[] = $r['key'];
                 }
             }
         }else if ($row['type'] && ($row['type'] == "file")) {
			   $files[] = $row['key'];
		  }
	 }
}

# returns boolean
function isExternalModuleFile($key, $fileKeys) {
	 if (in_array($key, $fileKeys)) {
		  return true;
	 }
	 foreach ($fileKeys as $fileKey) {
		  if (preg_match('/^'.$fileKey.'____\d+$/', $key)) {
			   return true;
		  }
         if (preg_match("/____/", $key)) {
             $parts = preg_split("/____/", $key);
             $shortKey = array_shift($parts);
             if($shortKey == $fileKey){
                 return true;
             }
         }
	 }
	 return false;
}

if(empty($pid)) {
	$pidPossiblyWithNullValue = null;
} else {
	$pidPossiblyWithNullValue = $pid;
}

$edoc = null;
$myfiles = array();
foreach($_FILES as $key=>$value){
	$myfiles[] = $key;
	if (isExternalModuleFile($key, $files) && $value) {
		# use REDCap's uploadFile
		$edoc = Files::uploadFile($_FILES[$key]);
		if ($edoc) {
			if(!empty($pid) && !ExternalModules\ExternalModules::hasProjectSettingSavePermission($moduleDirectoryPrefix, $key)) {
				header('Content-type: application/json');
				echo json_encode(array(
					'status' => "You don't have permission to save the following project setting: $key!"
				));
			}

            //For repeatable elements we change the key
            if (preg_match("/____/", $key)) {
                $settings = array();
                $parts = preg_split("/____/", $key);
                $shortKey = array_shift($parts);
                $aux =& $settings;

                foreach ($parts as $index) {
                    $aux[$index] = array();
                    $aux =& $aux[$index];
                }
                $aux = (string)$edoc;

                $data = ExternalModules\ExternalModules::getProjectSetting($moduleDirectoryPrefix,$pidPossiblyWithNullValue,$shortKey);
                if(!isset($data) || !is_array($data) || $data == null){
                    //do nothing
                }else{
                    $settings = array_replace_recursive($data,$settings);
                }

                ExternalModules\ExternalModules::setProjectSetting($moduleDirectoryPrefix, $pidPossiblyWithNullValue, $shortKey, $settings);
            }else{
                ExternalModules\ExternalModules::setFileSetting($moduleDirectoryPrefix, $pidPossiblyWithNullValue, $key, $edoc);
            }

		} else {
			header('Content-type: application/json');
			echo json_encode(array(
				'status' => "You could not save a file properly."
			));
		}
	 }
}

if ($edoc) {
	header('Content-type: application/json');
	echo json_encode(array(
		'status' => 'success',
        'myfiles' => json_encode($myfiles),
        'shortkey' => $shortKey,
		'data' => json_encode($data),
		'setting' => json_encode($settings),
		'parts' => $parts
	));
} else {
	header('Content-type: application/json');
	echo json_encode(array(
		'myfiles' => json_encode($myfiles),
		'_POST' => json_encode($_POST),
        'message' => $message,
		'status' => 'You could not find a file.'
	));
}
