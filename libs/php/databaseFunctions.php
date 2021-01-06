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

		if ($_POST['search'] === 'all_personnel' || $_POST['search'] === '') {
			if ($_POST['param'] == 0) {

				$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
								FROM personnel p 
								LEFT JOIN department d ON (d.id = p.departmentID) 
								LEFT JOIN location l ON (l.id = d.locationID) 
								ORDER BY p.lastName, p.firstName, d.name, l.name';
			} else {
				$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
				FROM personnel p
				LEFT JOIN department d ON (d.id = p.departmentID) 
				LEFT JOIN location l ON (l.id = d.locationID) 
				WHERE d.id = ' . $_POST['param'] . '
				ORDER BY p.lastName, p.firstName, d.name, l.name';
			}
		} else {
			if ($_POST['param'] == 0) {
				$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
				FROM personnel p
				LEFT JOIN department d ON (d.id = p.departmentID) 
				LEFT JOIN location l ON (l.id = d.locationID) 
				WHERE p.firstName LIKE "%' . $_POST['search'] . '%"
				OR p.lastName LIKE "%' . $_POST['search'] . '%"
				OR p.email LIKE "%' . $_POST['search'] . '%"
				ORDER BY p.lastName, p.firstName, d.name, l.name';
			} else {
				$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
									FROM personnel p
									LEFT JOIN department d ON (d.id = p.departmentID) 
									LEFT JOIN location l ON (l.id = d.locationID) 
									WHERE d.id = ' . $_POST['param'] . '
									AND (p.firstName LIKE "%' . $_POST['search'] . '%"
									OR p.lastName LIKE "%' . $_POST['search'] . '%"
									OR p.email LIKE "%' . $_POST['search'] . '%")
									ORDER BY p.lastName, p.firstName, d.name, l.name';
			}
		}
		break;

	case 'department':
		if ($_POST['search'] === 'all') {
			$query = 'SELECT id, name, locationID 
					FROM department';
		} else {
			if ($_POST['param'] == 'person') {
				$query = 'SELECT * FROM personnel p
					WHERE p.departmentID = ' . $_POST['search'];
			} else {
				$query = 'SELECT * FROM department
					WHERE locationID = ' . $_POST['search'];
			}
		};
		break;

	case 'location':
		if ($_POST['search'] === 'all') {
			$query = 'SELECT id, name
					FROM location';
		} else {
			$query = 'SELECT p.id, p.lastName, p.firstName, d.name as department, l.name as location 
					FROM personnel p
					LEFT JOIN department d ON (d.id = p.departmentID) 
					LEFT JOIN location l ON (l.id = d.locationID) 
					WHERE l.id = ' . $_POST['search'];
		};
		break;

	case 'id':
		$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location, l.id as locid 
				FROM personnel p 
				LEFT JOIN department d ON (d.id = p.departmentID) 
				LEFT JOIN location l ON (l.id = d.locationID)
				WHERE p.id =' . $_POST['search'];
		break;

	case 'update':

		if ($_POST['department'] == '0') {
			if (filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
				$query = 'UPDATE personnel
				SET email = "' . $_POST['email'] . '"
				WHERE id = "' . $_POST['id'] . '"';
			} else {
				exit('Invalid Email Error');
			}
		} else {
			if (filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
				$query = 'UPDATE personnel
				SET email = "' . $_POST['email'] . '",
				departmentID = "' . $_POST['department'] . '"
				WHERE id = "' . $_POST['id'] . '"';
			} else {
				exit('Invalid Email Error');
			}
		}

		// if (filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) && $_POST['department'] !== '0') {
		// 	$query = 'UPDATE personnel
		// 			SET email = "' . $_POST['email'] . '",
		// 			departmentID = "' . $_POST['department'] . '"
		// 			WHERE id = "' . $_POST['id'] . '"';
		// } else if (
		// 	filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)
		// ) {
		// 	$query = 'UPDATE personnel
		// 	SET email = "' . $_POST['email'] . '",
		// 	WHERE id = "' . $_POST['id'] . '"';
		// } else {
		// 	exit('Invalid Email Error');
		// }

		break;

	case 'delete':
		if ($_POST['operation'] == 'delete') {
			switch ($_POST['data']) {
				case 'id':

					if ($_POST['id'] !== 0) {
						echo ('id_is' . $_POST['id']);
						$query = 'DELETE 
						FROM personnel
						WHERE id = ' . $_POST['id'];
					} else {
						exit('Could Not Delete Person');
					}
					break;

				case 'department':
					if ($_POST['department'] !== 0) {
						$query =
							'DELETE 
						FROM personnel
						WHERE id = "' . $_POST['id'] . '",' .
							$_POST['department'] . 'NOT IN 
						(SELECT departmentID FROM personnel)';
					} else {
						exit('Could Not Delete Department');
					}
					break;

				case 'location':
					# code...
					break;

				default:
					exit('Delete Not Possible');
					break;
			}
		}
		break;

	case 'create':
		switch ($_POST['table']) {
			case 'personnel':

				$jobTitle = "";
				// $newID = $conn->query('SELECT MAX(id) + 1 FROM personnel');

				$query = 'INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID, id) 
				SELECT "' . $_POST['firstName'] . '","' . $_POST['lastName'] . '","' . $jobTitle . '","' . $_POST['email'] . '","' . $_POST['departmentID'] .
					'", MAX(id) + 1 FROM personnel';

				break;

			case 'department':
				# code...
				break;
			case 'location':
				# code...
				break;
			default:
				# code...
				break;
		}




		break;

	default:
		exit('Invalid Database Query');
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

if ($_POST['operation'] == 'read') {

	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;
} else {

	$sql =  "SELECT id FROM personnel ORDER BY id DESC LIMIT 1";
	$result = $conn->query($sql);
	$lastID = 0;
	if ($result->num_rows > 0) {
		while ($row = $result->fetch_assoc()) {
			$lastID = $row["id"];
		}
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	//echo (mysqli_fetch_assoc($newID));

	if ($_POST['operation'] == 'create') {
		copy("../../images/icons/placeholder.jpg", "../../images/staffpics/staffphoto_id" . $lastID . ".jpg");
		if (file_exists("../../images/uploads/staffphoto_temp.jpg")) {
			rename("../../images/uploads/staffphoto_temp.jpg", "../../images/staffpics/staffphoto_id" . $lastID . ".jpg");
		}
	}

	if ($_POST['operation'] == 'update') {
		while (true) {
			if (file_exists("../../images/uploads/staffphoto_temp.jpg")) {
				rename("../../images/uploads/staffphoto_temp.jpg", "../../images/staffpics/staffphoto_id" . $_POST['id'] . ".jpg");
				break;
			}
		}
	}
}

mysqli_close($conn);

echo json_encode($output);
