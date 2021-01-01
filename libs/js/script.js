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
      $("#main-directory").append(`<div class="card">
      <div class="card">
      <div class="card-body">
        <h5 class="card-title">${person.lastName} ${person.firstName}</h5>
        <p class="card-text">SSome information about the person</p>
        <a href="#" class="btn btn-primary">Go somewhere</a>
      </div>
    </div>
    </div>`);
    });
  });
};

const loadPersonnelPage = () => {
  $("#main-content-header").append(`<ul class="nav nav-tabs">
  <li class="active"><a data-toggle="tab" href="#directory">Directory</a></li>
  <li><a data-toggle="tab" href="#departments">Departments</a></li>
  <li><a data-toggle="tab" href="#chart">Chart</a></li>
</ul>`);
  $("#main-content").html(`  
<div class="tab-content">
  <div id="directory" class="tab-pane fade in active">
    <div id="card-holder">
    <ul id="main-directory"></ul>
    </div>
  </div>
  <div id="departments" class="tab-pane fade">
    <h3>Departments</h3>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  </div>
  <div id="chart" class="tab-pane fade">
    <h3>Chart</h3>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>
  </div>
</div>
</div>`);
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
