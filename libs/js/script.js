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
    response.forEach((person) => {
      $("#main-directory")
        .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${person.firstName} ${person.lastName}</div>
        <div class="card-body text-dark">
        <img src='/images/staffpics/staffphoto_id_${person.id}.jpg' width='80px' height='80px' style="background-color: black"/>
          <ul style="margin-left: 5px; margin-top: 5px">
          <li>Department: ${person.department}</li>
          <li>Location: ${person.location}</li>
          <li>Email: ${person.email}</li>
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
            `<div><img src='/images/staffpics/staffphoto_id_${departmentMember.id}.jpg' width="50px" height="50px"/>
            <a>${departmentMember.firstName} ${departmentMember.lastName}</a></div>`
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
      <button id="departments" class="personnel-button"><h3>Departments</h3></button>
      <button id="chart" class="personnel-button"><h3>Chart</h3></button>
      </div>`);
  const loadPersonnelTab = (tab) => {
    switch (tab) {
      case "directory":
        $("#directory").focus();
        $("#main-content").html(`<ul id="main-directory"></ul>`);
        mainDirectory();
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
