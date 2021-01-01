class DatabaseQuery {
  constructor(querytype) {
    this.querytype = querytype;
  }

  getData = async (search) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: "libs/php/databaseFunctions.php",
        dataType: "json",
        data: {
          querytype: this.querytype,
          search: search,
        },
        success: function (result) {
          resolve(result.data);
        },
        error: function (error) {
          reject(error);
        },
      });
    });
  };
}

const personnelDirectoryQuery = new DatabaseQuery("personnel");
const departmentDirectoryQuery = new DatabaseQuery("department");

personnelDirectoryQuery.getData("all").then((response) => {
  //console.log(response);
  //returns list of all personnel and all of their data
});

personnelDirectoryQuery.getData(45).then((response) => {
  //console.log(response[0]);
  //returns data for staff memeber, passing staff ID
});

departmentDirectoryQuery.getData("all").then((response) => {
  //console.log(response);
  //returns a list of departments with names and location IDs
});

departmentDirectoryQuery.getData(2).then((response) => {
  //console.log(response);
  //returns a list of staff in department, passing dept ID
});

//get all
//search by name
//list by department
//list by location
//onboard new staff member
//delete department
//get personnel
//add new department

const loadDashboard = () => {
  console.log("loading dashboard");
};

const mainDirectory = async () => {
  personnelDirectoryQuery.getData("all").then((response) => {
    console.log(response);
    response.forEach((person) => {
      $("#main-directory")
        .append(`<div class="card border-dark mb-3" style="max-width: 100%;">
        <div class="card-header">Header</div>
        <div class="card-body text-dark">
          <h5 class="card-title">Dark card title</h5>
          <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        </div>
      </div>`);
    });
  });
};

const loadPersonnelPage = () => {
  $("#main-content-header").append(`<ul id="main-directory"></ul>`);
  mainDirectory();
};

const loadPage = (pageId) => {
  switch (pageId) {
    case "personnel":
      loadPersonnelPage();
    default:
      loadDashboard();
  }
};

$(document).ready(function () {
  $(".icon").on("click", function () {
    $("#page-title").text($(this).attr("value"));
    loadPage($(this).attr("id"));
  });
});
