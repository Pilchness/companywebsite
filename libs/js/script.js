class DatabaseQuery {
  constructor(querytype) {
    this.querytype = querytype;
  }

  getData = async (search, param = 0) => {
    console.log(search, param);
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'read',
          querytype: this.querytype,
          search: search,
          param: param
        },
        success: function (result) {
          resolve(result.data);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };

  updateData = async (id, email, department) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'write',
          querytype: this.querytype,
          id: id,
          email: email,
          department: department
        },
        success: function (result) {
          resolve(result.data);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };
}

let visibleSearch = false;
let marginTop = ['162px', '198px'];

const scrollReset = () => {
  if ($('#main-content').length) {
    document.getElementById('main-content').scrollIntoView();
  }
};

const errorDisplay = (error) => {
  $('#main-content-header').append(
    `<span id="error" style="color: red">${error.responseText}</span>`
  );
  $(document).on('click', function () {
    $('#error').remove();
  });
};

const shortenDepartmentString = (departmentName, max) => {
  let departmentTextString = departmentName;
  let maxLength = max;
  if (departmentTextString.length > maxLength) {
    departmentTextString = departmentTextString.substr(0, maxLength) + '...';
  }
  return departmentTextString;
};

const personnelDirectoryQuery = new DatabaseQuery('personnel');
const departmentDirectoryQuery = new DatabaseQuery('department');
const locationDirectoryQuery = new DatabaseQuery('location');
const idQuery = new DatabaseQuery('id');
const personnelUpdate = new DatabaseQuery('update');

departmentDirectoryQuery.getData('all').then((result) => {
  console.log(result);
});

const loadDashboard = () => {
  console.log('loading dashboard');
};

const loadReportsPage = () => {
  console.log('loading reports');
};

const loadOnboardPage = () => {
  console.log('loading onboard');
};

const mainDirectory = async (search, department) => {
  $('#main-directory').empty();
  personnelDirectoryQuery
    .getData(search, department)
    .then((response) => {
      response.forEach((person) => {
        $('#main-directory')
          .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${person.firstName} ${person.lastName}</div>
        <div class="card-body text-dark">
        <img class="headshot" id="${person.id}" src='images/staffpics/staffphoto_id${person.id}.jpg' width='50px' height='50px'/>
          <ul style="margin-left: 5px; margin-top: 5px">
          <li class="person-card-text"><b>Dept:</b> ${person.department}</li>
          <li class="person-card-text"><b>Location:</b> ${person.location}</li>
          <li class="person-card-text">${person.email}</li>
          </ul>
        </div>
      </div>`);
      });
      scrollReset();
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const departmentList = async () => {
  departmentDirectoryQuery.getData('all').then((response) => {
    response.forEach((department) => {
      $('#department-list')
        .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${department.name}</div>
        <div class="dept-card-body text-dark">
          <ul id="personnel-dept-${department.id}" class="dept-section">
          </ul>
        </div>
      </div>`);
      departmentDirectoryQuery
        .getData(department.id, 'person')
        .then((response) => {
          response.forEach((departmentMember) => {
            $(`#personnel-dept-${department.id}`).append(
              `<div class="dept-photo headshot" id="${departmentMember.id}">
            <img src='images/staffpics/staffphoto_id${departmentMember.id}.jpg' 
            width="30px" height="30px"/>
            <span class="person-card-text">${departmentMember.firstName} ${departmentMember.lastName}</span></div>`
            );
          });
          scrollReset();
        })
        .catch((error) => {
          errorDisplay(error);
        });
    });
  });
};

const locationList = async () => {
  locationDirectoryQuery
    .getData('all')
    .then((response) => {
      response.forEach((location) => {
        $('#location-list')
          .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${location.name}</div>
        <div class="dept-card-body text-dark">
          <ul id="personnel-dept-${location.id}" class="location-section">
          </ul>
        </div>
      </div>`);
        locationDirectoryQuery
          .getData(location.id)
          .then((response) => {
            response.forEach((locationMember) => {
              $(`#personnel-dept-${location.id}`).append(
                `<div class="location-photo headshot" id="${locationMember.id}">
            <img src='images/staffpics/staffphoto_id${locationMember.id}.jpg' width="30px" height="30px"/>
            <span class="person-card-text">${locationMember.firstName} ${locationMember.lastName} (${locationMember.department})</span></div>`
              );
            });
            scrollReset();
          })
          .catch((error) => {
            errorDisplay(error);
          });
      });
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const populateDepartmentSelector = () => {
  departmentDirectoryQuery.getData('all').then((response) => {
    response.forEach((department) => {
      $('#department-selector').append(
        `<option id="${department.id}">${shortenDepartmentString(
          department.name,
          14
        )}</option>`
      );
    });
  });
};

const updateDirectoryList = () => {
  if ($('#person-file').length) {
    $('#person-file').remove();
    $('#main-content').html(
      `<ul id="main-directory" class="directory-content"></ul>`
    );
    $('.directory-content').css('margin-top', marginTop[1]);
  }
  mainDirectory(
    $('#name-search').val(),
    $('#department-selector option:selected').attr('id')
  );
};

const toggleSearchBar = async () => {
  if (!visibleSearch) {
    $('.directory-content').css('margin-top', marginTop[1]);
    $('#main-content-header').append(`
            <div
          id="search-bar"
          style="margin-top: 3px; width: 100%; padding-right: 3px; display: flex"
        >
          <form class="form-inline" style="display: flex">
            <input
              style="flex: 1"
              id="name-search"
              class="form-control mr-sm-1"
              type="search"
              spellcheck="false"
              placeholder="Search"
              aria-label="Search"
            />
            <select
              style="flex: 1; border-radius: 5px"
              class="custom-select"
              id="department-search-select"
            >
              <option id="0" selected>All Departments</option>
            </select>
          </form>
        </div>`);
    populateDepartmentSelector();
    updateDirectoryList();

    $('#name-search').on('keyup', function () {
      updateDirectoryList();
    });
    $('#department-selector').on('change', function () {
      updateDirectoryList();
    });
    visibleSearch = true;
  } else {
    $('#search-bar').remove();
    $('.directory-content').css('margin-top', marginTop[0]);
    visibleSearch = false;
  }
};

const updatePersonRecord = async (id, department, email) => {
  console.log(id, department, email);
  personnelUpdate
    .updateData(id, email, department)
    .then(() => {
      console.log('database updated');
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const loadPersonnelPage = () => {
  if (!$('#personnel-button-container').length) {
    $('#main-content-header').append(`
      <div id="personnel-button-container" class="nav nav-tabs">
      <button id="directory" class="personnel-button"><h3>Directory</h3></button>
      <button id="departments" class="personnel-button"><h3>Teams</h3></button>
      <button id="locations" class="personnel-button"><h3>Locations</h3></button>
      <img id="search-icon" src='images/icons/search.png'alt='search database' width='20px' height='20px'/>
      </div>`);
  }
  $('#search-icon').on('click', function () {
    toggleSearchBar();
  });

  const loadPersonnelTab = (tab) => {
    switch (tab) {
      case 'directory':
        $('#directory').focus();
        $('#main-content').html(
          `<ul id="main-directory" class="directory-content"></ul>`
        );
        mainDirectory('all_personnel');
        break;

      case 'departments':
        $('#departments').focus();
        $('#main-content').html(
          `<ul id="department-list" class="directory-content"></ul>`
        );
        departmentList();
        break;

      case 'locations':
        $('#locations').focus();
        $('#main-content').html(
          `<ul id="location-list" class="directory-content"></ul>`
        );
        locationList();
        break;

      default:
        return;
    }
  };

  loadPersonnelTab('directory');

  $('.personnel-button').on('click', function () {
    loadPersonnelTab($(this).attr('id'));
    $('.directory-content').css('margin-top', marginTop[0]);
  });
};

const editPerson = async (id, location, department, email, locid) => {
  console.log(id, location, department, email, locid);
  const locationSelection = `<select
  style="flex: 1; border-radius: 5px"
  class="custom-select"
  id="location-selector"
  ><option id="current-location" value="0" selected>${location} (current)</option></select><br>`;
  const departmentSelection = `<select
  style="flex: 1; border-radius: 5px"
  class="custom-select"
  id="department-selector"
  ><option id="current-department" value="0" selected>${shortenDepartmentString(
    department,
    10
  )} (current)</option></select><br>`;
  $('#location-info').replaceWith(
    `<label>Location: </label> ${locationSelection}`
  );
  $('#department-info').replaceWith(
    `<label>Department: </label> ${departmentSelection}`
  );
  locationDirectoryQuery
    .getData('all')
    .then((response) => {
      console.log(response);
      response.forEach((loc) => {
        if (loc.name !== location) {
          $('#location-selector').append(
            `<option value="${loc.id}">${loc.name}</option>`
          );
        }
      });
    })
    .catch((error) => {
      errorDisplay(error);
    });

  const updateDirectoryList = async (location) => {
    console.log(location);
    departmentDirectoryQuery
      .getData(location, 'location')
      .then((response) => {
        console.log(response);
        response.forEach((dept) => {
          if (dept.name !== department) {
            $('#department-selector').append(
              `<option value="${dept.id}">${shortenDepartmentString(
                dept.name,
                10
              )}</option>`
            );
          }
        });
      })
      .catch((error) => {
        errorDisplay(error);
      });
  };
  console.log(locid);
  updateDirectoryList(locid);
  $('#location-selector').on('change', function () {
    let selectedLocation = $('#location-selector :selected').attr('value');
    console.log(typeof selectedLocation);
    $('#department-selector').empty();
    if (selectedLocation === '0') {
      console.log(locid);
      $('#department-selector').append(
        `<option id="current-department" value="0" selected>${shortenDepartmentString(
          department,
          10
        )} (current)</option>`
      );
      updateDirectoryList(locid);
      console.log('currentlocation');
    } else {
      updateDirectoryList(selectedLocation);
    }
  });
  $('#email-info').replaceWith(
    `<label>Email: </label> <input id="email-input" style="width: 10em" value="${email}" spellcheck="false"></input>`
  );
  $('#email-input').on('keyup', function () {
    const emailvalidate = new RegExp(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    );
    if (emailvalidate.test($(this).val())) {
      console.log('ok');
      $('#confirm-changes').removeAttr('disabled');
    } else {
      console.log('failed');
      //$('#confirm-changes').attr('disabled', true);
    }
  });
};

const offboardPerson = (id) => {
  console.log('offboarding ' + id);
};

const showPersonFile = async (id) => {
  idQuery
    .getData(id)
    .then((response) => {
      let person = response[0];
      console.log(person);
      $('#main-content').html(
        `<div class="card directory-content" id="person-file">
      <img
        class="card-img-top"
        src="images/staffpics/staffphoto_id${person.id}.jpg"
        alt="${person.firstName} ${person.lastName}"
      />
      <div id="person-file-body">
        <h2 class="card-title">${person.firstName} ${person.lastName}</h2>
        <ul id="person-file-info">
          <li id="location-info">Location: ${person.location}</li>
          <li id="department-info">Department: ${person.department}</li>
          <li id="email-info">Email: ${person.email}</li>
        </ul>
        <div class="btn-group" role="group" aria-label="Basic example">
        <button id="${person.id}" location="${person.location}" locid="${person.locid}" 
              dept="${person.department}" email="${person.email}"
            type="button" class="btn btn-primary edit">Edit Details</button>
        <button id="${person.id}" type="button" class="btn btn-secondary offboard">Offboard</button>
      </div>
    </div>`
      );
      $('.edit').on('click', function () {
        editPerson(
          $(this).attr('id'),
          $(this).attr('location'),
          $(this).attr('dept'),
          $(this).attr('email'),
          $(this).attr('locid')
        );
        $('.edit').replaceWith(
          `<button type="button" id="confirm-changes" class="btn btn-success confirm">Confirm</button>
        <button type="button" class="btn btn-danger cancel">Cancel</button>`
        );
        $('.confirm').on('click', function () {
          updatePersonRecord(
            person.id,
            $('#department-selector :selected').attr('value'),
            $('#email-input').val()
          );
          showPersonFile(person.id);
        });
        $('.cancel').on('click', function () {
          showPersonFile(person.id);
        });
      });
      $('.offboard').on('click', function () {
        offboardPerson($(this).attr('id'));
      });
      $('#search-bar').empty();
      $('.directory-content').css('margin-top', marginTop[0]);
      scrollReset();
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const loadPage = (pageId) => {
  switch (pageId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'personnel':
      loadPersonnelPage();
      break;
    case 'reports':
      loadReportsPage();
      break;
    case 'onboard':
      loadOnboardPage();
      break;
    default:
      loadDashboard();
  }
};

$(document).ready(function () {
  $('.icon').on('click', function () {
    $('#page-title').text($(this).attr('value'));
    $('#main-content').empty();
    $('#personnel-button-container').remove();
    loadPage($(this).attr('id'));
    $('.directory-content').css('margin-top', marginTop[0]);
  });
  $(document).on('click', '.headshot', function () {
    console.log($(this).attr('id'));
    showPersonFile($(this).attr('id'));
  });
});
