<?php

if (isset($_FILES['file']['name'])) {

    /* Getting file name */
    //$filename = $_FILES['file']['name'];
    //$filename = "staffphoto_id_notassigned";

    /* Location */
    $location = "../../images/uploads/staffphoto_temp.jpg";
    $imageFileType = pathinfo($location, PATHINFO_EXTENSION);
    $imageFileType = strtolower($imageFileType);

    /* Valid extensions */
    $valid_extensions = array("jpg", "jpeg");

    $response = 0;
    /* Check file extension */
    if (in_array(strtolower($imageFileType), $valid_extensions)) {
        /* Upload file */
        if (move_uploaded_file($_FILES['file']['tmp_name'], $location)) {
            $response = $location;
        }
    }

    echo $response;
    exit;
}

echo 0;
