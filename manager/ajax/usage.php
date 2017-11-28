<?php
namespace ExternalModules;
set_include_path('.' . PATH_SEPARATOR . get_include_path());
require_once '../../classes/ExternalModules.php';

// Only administrators can perform this action
if (!SUPER_USER) exit;

$projects = ExternalModules::getEnabledProjects($_GET['prefix']);

while($project = db_fetch_assoc($projects)){
	$url = APP_PATH_WEBROOT . 'ProjectSetup/index.php?pid=' . $project['project_id'];
	?><a href="<?=$url?>" style="text-decoration: underline;"><?=\RCView::escape(strip_tags($project['name']))?></a><br><?php
}