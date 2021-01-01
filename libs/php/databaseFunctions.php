<?php

	// remove next two lines for production
	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

	switch ($_POST['querytype']) {
		case 'personnel':
			if($_POST['search'] === 'all') {
				
					$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
								FROM personnel p 
								LEFT JOIN department d ON (d.id = p.departmentID) 
								LEFT JOIN location l ON (l.id = d.locationID) 
								ORDER BY p.lastName, p.firstName, d.name, l.name'; 
				
			} else {
				$query = 'SELECT * FROM personnel p
				WHERE p.id = ' . $_POST['search'];
			}
			break;

			case 'department':
				if($_POST['search'] === 'all') {
					$query = 'SELECT id, name, locationID 
					FROM department';
				} else {
					$query = 'SELECT * FROM personnel p
					WHERE p.departmentID = ' . $_POST['search']; 
				};
			break;
		
		default:
			echo ('querytype error');
			break;
	}

	$result = $conn->query($query);
	
	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   
   	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>