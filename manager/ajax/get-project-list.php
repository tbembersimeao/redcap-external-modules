<?php
namespace ExternalModules;
require_once dirname(dirname(dirname(__FILE__))) . '/classes/ExternalModules.php';

header('Content-type: application/json');

$searchTerms = $_GET['parameters'];

$matchingProjects = ExternalModules::getAdditionalFieldChoices(["type" => "project-id"], $searchTerms);

echo json_encode(["results" => $matchingProjects["choices"],"more" => false]);