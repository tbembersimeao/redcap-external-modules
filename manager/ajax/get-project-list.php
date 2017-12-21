<?php
namespace ExternalModules;
set_include_path('.' . PATH_SEPARATOR . get_include_path());
require_once '../../classes/ExternalModules.php';

header('Content-type: application/json');

$searchTerms = $_GET['parameters'];

$matchingProjects = ExternalModules::getAdditionalFieldChoices(["type" => "project-id"], $searchTerms);

echo json_encode(["results" => $matchingProjects["choices"],"more" => false]);