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

personnelDirectoryQuery.getData("all_personnel").then((response) => {
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

const mainDirectory = async (search) => {
  $("#main-directory").empty();
  personnelDirectoryQuery.getData(search).then((response) => {
    response.forEach((person) => {
      $("#main-directory")
        .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${person.firstName} ${person.lastName}</div>
        <div class="card-body text-dark">
        <img src='images/staffpics/staffphoto_id_${person.id}.jpg' width='50px' height='50px'/>
          <ul style="margin-left: 5px; margin-top: 5px">
          <li class="person-card-text"><b>Dept:</b> ${person.department}</li>
          <li class="person-card-text"><b>Location:</b> ${person.location}</li>
          <li class="person-card-text">${person.email}</li>
          </ul>
        </div>
      </div>`);
    });
  });
};

const departmentList = async () => {
  departmentDirectoryQuery.getData("all").then((response) => {
    response.forEach((department) => {
      $("#department-list")
        .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${department.name}</div>
        <div class="dept-card-body text-dark">
          <ul id="personnel-dept-${department.id}" class="dept-list">
          </ul>
        </div>
      </div>`);
      departmentDirectoryQuery.getData(department.id).then((response) => {
        response.forEach((departmentMember) => {
          $(`#personnel-dept-${department.id}`).append(
            `<div class="dept-photo"><img src='images/staffpics/staffphoto_id_${departmentMember.id}.jpg' width="30px" height="30px"/>
            <a class="person-card-text">${departmentMember.firstName} ${departmentMember.lastName}</a></div>`
          );
        });
      });
    });
  });
};

const loadPersonnelPage = () => {
  $("#main-content-header").append(`
      <div id="personnel-button-container" class="nav nav-tabs">
      <button id="directory" class="personnel-button"><h3>Directory</h3></button>
      <button id="departments" class="personnel-button"><h3>Teams</h3></button>
      <button id="chart" class="personnel-button"><h3>Chart</h3></button>
      <img id="search-icon" src='images/icons/search.png'alt='search database' width='20px' height='20px'/>
      </div>`);
  $("#search-icon").on("click", function () {
    $("#main-content-header").append(`
        <div style="margin-top: 3px; width: 100%; padding-right: 3px; display: flex">
        <form style="flex: 2" class="form-inline">
        <input id="name-search" class="form-control mr-sm-1" type="search" placeholder="Search" aria-label="Search">
        </form>
        <div class="dropdown" style="flex: 1">
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    All Departments
  </button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
    <a class="dropdown-item" href="#">Action</a>
    <a class="dropdown-item" href="#">Another action</a>
    <a class="dropdown-item" href="#">Something else here</a>
  </div>
</div>
        
        
        </div>`);
    $("#main-directory").css("margin-top", "210px");
    $("#name-search").on("keyup", function () {
      console.log($(this).val());
      mainDirectory($(this).val());
    });
  });
  const loadPersonnelTab = (tab) => {
    switch (tab) {
      case "directory":
        $("#directory").focus();
        $("#main-content").html(`<ul id="main-directory"></ul>`);
        mainDirectory("all_personnel");
        break;

      case "departments":
        $("#departments").focus();
        $("#main-content").html(`<ul id="department-list"></ul>`);
        departmentList();
        break;

      case "chart":
        $("#chart").focus();
        $("#main-content").html(`<h3 style="color: white">Chart</h3>`);
        break;

      default:
        return;
    }
  };

  loadPersonnelTab("directory");

  $(".personnel-button").on("click", function () {
    loadPersonnelTab($(this).attr("id"));
  });
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
