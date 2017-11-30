<?php
namespace ExternalModules;

require_once '../../classes/ExternalModules.php';

header('Content-type: application/json');

$searchTerms = $_GET['parameters'];

$matchingProjects = ExternalModules::getAdditionalFieldChoices(["type" => "project-id"], $searchTerms);

if (isset($_GET['for']) && ($_GET['for'] == "ajax")) {
	echo json_encode(["results" => $matchingProjects["choices"],"more" => false]);
} else if (isset($_GET['for']) && ($_GET['for'] == "autocomplete")) {
	# change in key names
	$project_ids = array();
	foreach ($matchingProjects as $match) {
		$project_ids[] = array("value" => $match['id'], "label" => $match["text"]);
	}
	echo json_encode($project_ids);
} else {
	echo json_encode(["results" => $matchingProjects["choices"],"more" => false]);
}
