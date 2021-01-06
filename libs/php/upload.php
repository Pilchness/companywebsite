<?php

if (isset($_FILES['file']['name'])) {
    $uploadOk = 1;

    if ($_FILES['file']['size'] > 100000) {
        echo "File too large";
        $uploadOk = 0;
    }

    /* Location */
    $location = "../../images/uploads/staffphoto_temp.jpg";
    $imageFileType = pathinfo($location, PATHINFO_EXTENSION);
    $imageFileType = strtolower($imageFileType);

    if ($imageFileType != "jpg" && $imageFileType != "jpeg") {
        echo "Wrong filetype";
        $uploadOk = 0;
    }

    /* Valid extensions */
    $valid_extensions = array("jpg", "jpeg");

    $response = 0;
    if ($uploadOk == 0) {
        echo ("File upload error");
    } else {
        /* Check file extension */
        if (in_array(strtolower($imageFileType), $valid_extensions)) {
            /* Upload file */
            if (move_uploaded_file($_FILES['file']['tmp_name'], $location)) {
                $response = $location;
            }
        }
    }

    echo $response;
    exit;
}

echo 0;
