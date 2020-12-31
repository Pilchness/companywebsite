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
