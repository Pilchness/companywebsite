//Database Functions Main Code - CRUD
//**************************************************************************/
//
class DatabaseQuery {
  constructor(querytype) {
    this.querytype = querytype;
  }

  createData = async (name, lastName = '', email = '', ID = '', placeholder = '') => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'create',
          querytype: this.querytype,
          name: name,
          lastName: lastName,
          email: email,
          ID: ID,
          placeholder: placeholder
        },
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };

  readData = async (search, param = 0, filter = '') => {
    console.log('search: ' + search + ' param: ' + param + ' filter: ' + filter);
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'read',
          querytype: this.querytype,
          search: search,
          param: param,
          filter: filter
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

  updateData = async (id, data = '', department = '') => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'update',
          querytype: this.querytype,
          id: id,
          data: data,
          department: department
        },
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };

  deleteData = async (deleteType, id = '0') => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'delete',
          querytype: this.querytype,
          data: deleteType,
          id: id
        },
        success: function (result) {
          resolve(result);
          console.log(result);
        },
        error: function (error) {
          reject(error);
          console.log(error);
        }
      });
    });
  };
}

//Global Variables and Functions
//**************************************************************************/
//
const personnelDirectoryQuery = new DatabaseQuery('personnel');
const departmentDirectoryQuery = new DatabaseQuery('department');
const locationDirectoryQuery = new DatabaseQuery('location');

let visibleSearch = false;
let marginTop = ['162px', '198px'];

const toggleScroll = (scrollEnable) => {
  scrollEnable
    ? $('html, body').css('overflow-y', '')
    : $('html, body').css('overflow-y', 'hidden');
};

const scrollReset = () => {
  if ($('#main-content').length) {
    document.getElementById('main-content').scrollIntoView();
  }
  if ($('#page-content').length) {
    document.getElementById('page-content').scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }
};

const removeSearchBar = () => {
  $('#search-bar').remove();
  $('.directory-content').css('margin-top', marginTop[0]);
  visibleSearch = false;
};

const messageDisplay = (displayMessage, color = 'red', afterRemoval, param) => {
  if ($('#main-content-header').length) {
    $('#main-content-header').append(
      `<div id="display-message"><span style="color: ${color}">${displayMessage.responseText}</span><br></div>`
    );
    const remove = () => {
      $('#display-message').remove();
      if (afterRemoval) {
        param ? afterRemoval(param) : afterRemoval();
      }
      $(document).off('click', remove);
    };
    $(document).on('click', remove);
  }
};

//Change page layout to enable some pages to scroll and others to be static
const changePageLayout = (changeTo) => {
  $('#main-content').length ? (changeFrom = 'main') : (changeFrom = 'page');
  $(`#${changeFrom}-content`).replaceWith(`<div id="${changeTo}-content"></div>`);
  scrollReset();
  removeSearchBar();
};

const shortenString = (string, max) => {
  let textString = string;
  let maxLength = max;
  if (textString.length > maxLength) {
    textString = textString.substr(0, maxLength) + '...';
  }
  return textString;
};

//
//<<<<<<<< Input Validation >>>>>>>>
//
const emailValidate = new RegExp(
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);
const nameValidate = new RegExp(`^[a-zA-Z'\-\pL]+(?:(?! {2})[a-zA-Z'\-\pL ])*[a-zA-Z'\-\pL]+$`);

const handleEmailInput = (email) => {
  $('#email-info').replaceWith(
    `<label id="email-label">Email: </label> <input id="email-input" 
    style="width: 14em" value="${email}" spellcheck="false"></input>`
  );
  $('#email-input').on('keyup', function () {
    if (emailValidate.test($(this).val())) {
      $('#confirm-changes').removeAttr('disabled');
    } else {
      $('#confirm-changes').attr('disabled', true);
    }
  });
};

//Onboard Page Functions
//**************************************************************************/
//
//
//<<<<<<<< Onboard Input Logic and Validation>>>>>>>>
//
const updateProfiledisplayDepartmentList = async (location = 'all', department) => {
  departmentDirectoryQuery
    .readData(location, 'location')
    .then((response) => {
      response.forEach((dept) => {
        if (dept.name !== department) {
          $('#department-selector').append(
            `<option value="${dept.id}">${shortenString(dept.name, 20)}</option>`
          );
        }
      });
    })
    .catch(() => {
      messageDisplay(
        {
          responseText: 'Profile Update Error'
        },
        'red'
      );
    });
};

const createLocationDropdown = async (location) => {
  locationDirectoryQuery
    .readData('all')
    .then((response) => {
      response.forEach((loc) => {
        if (loc.name !== location) {
          $('#location-selector').append(`<option value="${loc.id}">${loc.name}</option>`);
        }
      });
    })
    .catch(() => {
      messageDisplay(
        {
          responseText: 'Error Getting Locations'
        },
        'red'
      );
    });
};

const updateLocationAndDepartmentSelectors = (locid, department) => {
  $('#location-selector').on('change', function () {
    let selectedLocation = $('#location-selector :selected').val();
    $('#department-selector').empty();
    if (selectedLocation === '0') {
      $('#department-selector').append(
        `<option id="current-department" value="0" selected>${shortenString(
          department,
          10
        )} (current)</option>`
      );
      updateProfiledisplayDepartmentList(locid, department);
    } else {
      updateProfiledisplayDepartmentList(selectedLocation, department);
    }
  });
};

const handleOnboardInput = () => {
  let first = 0;
  let last = 0;
  let email = 0;
  $('#onboard-first-name').on('keyup', function () {
    if (nameValidate.test($(this).val())) {
      first = 1;
    } else {
      first = 0;
    }
  });
  $('#onboard-last-name').on('keyup', function () {
    if (nameValidate.test($(this).val())) {
      last = 2;
    } else {
      last = 0;
    }
  });
  $('#onboard-email').on('keyup', function () {
    if (emailValidate.test($(this).val())) {
      email = 4;
    } else {
      email = 0;
    }
  });
  const validate = (total) => {
    if (total === 7) {
      $('#new-onboard').removeAttr('disabled');
    } else {
      $('#new-onboard').attr('disabled', true);
    }
  };
  $('#page-content').on('keyup', function () {
    validate(first + last + email);
  });
};

const authenticateFileType = () => {
  $('#file').change(function () {
    uploadPhoto = window.URL.createObjectURL(this.files[0]);
    if (this.files[0].type === 'image/jpeg') {
      $('.card-img-top').attr('src', uploadPhoto);
    } else {
      if (this.files[0].type !== 'image/jpeg') {
        $('#confirm-changes, #new-onboard').attr('disabled', true);
        $('.custom-file-input').text('Invalid File');
        messageDisplay(
          {
            responseText: 'Wrong type of file.'
          },
          'red'
        );
      }
    }
  });
};

//Dashboard Page Main Code
//**************************************************************************/
//
const loadDashboard = () => {
  changePageLayout('main');
  toggleScroll(true);
  scrollReset();

  $('#main-content').replaceWith(
    `<div id="page-content">
    <ul id="message-list"></ul>
    </div>`
  );

  let messageIndex = 0;
  const updateMessages = () => {
    notificationArray.forEach((message) => {
      $('#message-list').append(`
    <div
    id="message-card${messageIndex}"
    class="card message-card border-dark mb-1"
  >
    <div class="card-header">
      ${message.title}
      <button
        type="button"
        id="message-close${messageIndex}"
        class="btn-close message-close"
        aria-label="Close"
      ></button>
    </div>
    <div class="card-body text-dark" id="message-body${messageIndex}">
      <p class="message-text">
        <img
          id="message-image${messageIndex}"
          class="message-image"
          width="auto"
          height="50px"
          src="${message.image}"
        />${message.message}
      </p>
    </div>
  </div>
    `);
      if (message.image) {
        $(`#message-image${messageIndex}`).css('visibility', 'visible');
      }
      if (message.action) {
        $(`#message-image${messageIndex}`).on('click', function () {
          eval(message.action);
        });
      }
      $(`#message-close${messageIndex}`).on('click', function () {
        const index = this.id.charAt(this.id.length - 1);
        notificationArray.splice(index, 1);
        loadDashboard();
      });
      messageIndex++;
    });
  };
  updateMessages();
};

//Settings Page Main Code
//**************************************************************************/
//
const loadSettings = () => {
  scrollReset();
  changePageLayout('page');
  $('#personnel-button-container').remove();
  $('#page-content').append(
    `<div id="settings-container">
    <h2>Rename, Add and Delete Departments</h2>
    <select
    style="flex: 1; border-radius: 5px"
    class="custom-select"
    id="department-edit-select"
  >  <option value="0" selected>Choose a department...</option>
  </select>
  <div id="edit-departments-button-group" class="btn-group" role="group" aria-label="edit departments">
  <button type="button" id="delete-department" class="btn btn-danger settings-button" disabled>Delete</button>
  <button type="button" id="edit-department" class="btn btn-warning settings-button" disabled>Edit</button>
  <button id="add-department" type="button" class="btn btn-primary settings-button" >Add New</button>
  <button id="cancel-department" type="button" class="btn btn-secondary settings-button" >Cancel</button>
</div>
  <br>
  <br>
    <h2>Rename, Add and Delete Locations</h2>
    <select
    style="flex: 1; border-radius: 5px"
    class="custom-select"
    id="location-edit-select"
  >  <option value="0" selected>Choose a location...</option>
  </select>
  <div id="edit-locations-button-group" class="btn-group" role="group" aria-label="edit locations">
  <button type="button" id="delete-location" class="btn btn-danger settings-button" disabled>Delete</button>
  <button type="button" id="edit-location" class="btn btn-warning cancel settings-button" disabled>Edit</button>
  <button id="add-location" type="button" class="btn btn-primary settings-button">Add New</button>
  <button id="cancel-location" type="button" class="btn btn-secondary settings-button" >Cancel</button>
</div>
</div>`
  );
  populateDepartmentSelector(false);
  $('#department-edit-select').on('change', function () {
    if ($(this).val() === 0) {
      $('#delete-department').attr('disabled', true);
      $('#edit-department').attr('disabled', true);
    } else {
      $('#delete-department').removeAttr('disabled');
      $('#edit-department').removeAttr('disabled');
    }
  });
  populateLocationSelector();
  $('#location-edit-select').on('change', function () {
    if ($(this).val() === 0) {
      $('#delete-location').attr('disabled', true);
      $('#edit-location').attr('disabled', true);
    } else {
      $('#delete-location').removeAttr('disabled');
      $('#edit-location').removeAttr('disabled');
    }
  });
  $('.settings-button').on('click', function () {
    switch ($(this).attr('id')) {
      case 'delete-department':
        handleSettingsButton(
          'department',
          'delete',
          $('#department-edit-select option:selected').val()
        );
        break;
      case 'edit-department':
        handleSettingsButton(
          'department',
          'edit',
          $('#department-edit-select option:selected').val()
        );
        break;
      case 'add-department':
        handleSettingsButton(
          'department',
          'add',
          $('#department-edit-select option:selected').val()
        );
        break;
      case 'delete-location':
        handleSettingsButton(
          'location',
          'delete',
          $('#location-edit-select option:selected').val()
        );
        break;
      case 'edit-location':
        handleSettingsButton('location', 'edit', $('#location-edit-select option:selected').val());
        break;
      case 'add-location':
        handleSettingsButton('location', 'add', $('#location-edit-select option:selected').val());
        break;

      default:
        handleSettingsButton('error');
        break;
    }
  });
  $('#cancel-department, #cancel-location').on('click', function () {
    loadSettings();
  });
};

//Settings Page Functions
//**************************************************************************/
//

const checkDepartmentDelete = async (dept) => {
  return new Promise((resolve, reject) => {
    personnelDirectoryQuery.readData('all').then((response) => {
      response.forEach((person) => {
        if (person.department == dept) {
          resolve(false);
        }
      });
      resolve(true);
    });
  });
};

const checkLocationDelete = async (loc) => {
  return new Promise((resolve, reject) => {
    personnelDirectoryQuery.readData('all').then((response) => {
      response.forEach((person) => {
        if (person.location == loc) {
          resolve(false);
        }
      });
      resolve(true);
    });
  });
};

const handleSettingsButton = async (table, action, ID) => {
  if (table === 'error') {
    messageDisplay(
      {
        responseText: 'Invalid Option Selected'
      },
      'red'
    );
  } else {
    if (table === 'department') {
      if (ID !== 0) {
        let selectedDepartment = $('#department-edit-select option:selected').text();
        switch (action) {
          case 'delete':
            checkDepartmentDelete(selectedDepartment).then((response) => {
              if (response) {
                $('#main-content-header')
                  .append(`<div id="delete-department-warning" class="alert alert-danger" role="alert">
                  <p>Are you sure you want to delete the ${selectedDepartment} department?</p>
                  <div class="btn-group" role="group" aria-label="edit or offboard">
                    <button id="confirm-delete-department" type="button" class="btn btn-primary">Confirm</button>
                    <button id="cancel-delete-department" type="button" class="btn btn-danger">Cancel</button>
                  </div>
                </div>`);
                $('#delete-department-warning').alert();
                $('#delete-department-warning').on('click', function (e) {
                  $('#delete-department-warning').remove();
                  e.stopPropagation();
                });
                $('#confirm-delete-department').on('click', function () {
                  departmentDirectoryQuery.deleteData(table, ID).then((response) => {
                    if (response.status.code == 200) {
                      messageDisplay(
                        {
                          responseText: `${selectedDepartment} deleted successfully`
                        },
                        'green',
                        loadSettings
                      );
                    } else {
                      () => {
                        messageDisplay(
                          {
                            responseText: `Could not delete department.`
                          },
                          'red'
                        );
                      };
                    }
                  });
                });
              } else {
                $('#main-content-header')
                  .append(`<div id="delete-department-warning" class="alert alert-danger" role="alert">
        You are attempting to remove ${selectedDepartment} which still has staff assigned to it. 
        If you really want to delete ${selectedDepartment}, you must reassign all its staff or offboard them first.
        </div>`);
                $('#delete-department-warning').alert();
                $('#delete-department-warning').on('click', function (e) {
                  $('#delete-department-warning').remove();
                  e.stopPropagation();
                });
              }
            });
            break;

          case 'edit':
            $('#department-edit-select').replaceWith(`
          <input id="department-edit-name" style="width: 14em" value="${selectedDepartment}" spellcheck="false"></input>`);
            $('#delete-department').attr('disabled', true);
            $('#add-department').attr('disabled', true);
            $('#edit-department').replaceWith(` 
          <button type="button" id="confirm-edit-department" class="btn btn-success settings-button" >Confirm</button>`);
            $('#department-edit-name').on('keyup', function () {
              if ($(this).val().length < 2 || $(this).val().length > 25) {
                $('#confirm-edit-department').attr('disabled', true);
              } else $('#confirm-edit-department').removeAttr('disabled');
            });
            $('#confirm-edit-department').on('click', function () {
              departmentDirectoryQuery
                .updateData(ID, $('#department-edit-name').val())
                .then((response) => {
                  if (response.status.code == 200) {
                    $('#confirm-edit-department').attr('disabled', true);
                    messageDisplay(
                      {
                        responseText: `${selectedDepartment} successfully changed to ${$(
                          '#department-edit-name'
                        ).val()}`
                      },
                      'green',
                      loadSettings
                    );
                  } else {
                    () => {
                      messageDisplay(
                        {
                          responseText: `Could not edit department.`
                        },
                        'red'
                      );
                    };
                  }
                });
            });

            break;

          case 'add':
            $('#department-edit-select').replaceWith(`
            <div style="display: flex; flex-direction: row; align-items: flex-end"><input id="department-new-name" style="width: 10em; height: 40px" placeholder="New Department" spellcheck="false"></input>
            <div id="dept-select-inner" style="display: flex; flex-direction: column"><label style="height: 10px; font-size: 10px" class="form-label" for="location-selector">New Dept Location</label>
            <select style="flex: 1; border-radius: 5px; height: 30px" class="custom-select add" id="location-selector"></select></div></div>
            `);
            createLocationDropdown();
            $('#delete-department').attr('disabled', true);
            $('#edit-department').attr('disabled', true);
            $('#add-department').replaceWith(` 
            <button type="button" id="confirm-new-department" class="btn btn-success settings-button" disabled>Confirm</button>`);
            $('#department-new-name').on('keyup', function () {
              if ($(this).val().length < 2 || $(this).val().length > 25) {
                $('#confirm-new-department').attr('disabled', true);
              } else $('#confirm-new-department').removeAttr('disabled');
            });
            $('#confirm-new-department').on('click', function () {
              departmentDirectoryQuery
                .createData($('#department-new-name').val(), '', '', $('#location-selector').val())
                .then((response) => {
                  if (response.status.code == 200) {
                    $('#confirm-new-department').attr('disabled', true);
                    messageDisplay(
                      {
                        responseText: `${$(
                          '#department-new-name'
                        ).val()} department created successfully`
                      },
                      'green',
                      loadSettings
                    );
                  } else {
                    messageDisplay(
                      {
                        responseText: `${$(
                          '#department-new-name'
                        ).val()} could not be created. Please try again.`
                      },
                      'red',
                      loadSettings
                    );
                  }
                });
            });
            break;

          default:
            messageDisplay(
              {
                responseText: `Unexplained data error.`
              },
              'red'
            );
        }
      }
    } else if (table === 'location') {
      if (ID !== 0) {
        let selectedLocation = $('#location-edit-select option:selected').text();
        switch (action) {
          case 'delete':
            checkLocationDelete(selectedLocation).then((response) => {
              if (response) {
                $('#main-content-header')
                  .append(`<div id="delete-location-warning" class="alert alert-danger" role="alert">
                <p>Are you sure you want to delete the ${selectedLocation} location?</p>
                <div class="btn-group" role="group" aria-label="edit or offboard">
                  <button id="confirm-delete-location" type="button" class="btn btn-primary">Confirm</button>
                  <button id="cancel-delete-location" type="button" class="btn btn-danger">Cancel</button>
                </div>
              </div>
              `);
                $('#delete-location-warning').alert();
                $('#delete-location-warning').on('click', function (e) {
                  $('#delete-location-warning').remove();
                  e.stopPropagation();
                });
                $('#confirm-delete-location').on('click', function () {
                  locationDirectoryQuery.deleteData(table, ID).then((response) => {
                    if (response.status.code == 200) {
                      messageDisplay(
                        {
                          responseText: `${selectedLocation} deleted successfully`
                        },
                        'green',
                        loadSettings
                      );
                    } else {
                      () => {
                        messageDisplay(
                          {
                            responseText: `Could not delete location.`
                          },
                          'red'
                        );
                      };
                    }
                  });
                });
              } else {
                $('#main-content-header')
                  .append(`<div id="delete-location-warning" class="alert alert-danger" role="alert">
          You are attempting to remove ${selectedLocation} which still has staff assigned to it. 
          If you really want to delete ${selectedLocation}, you must reassign all its staff or offboard them first.
          </div>`);
                $('#delete-location-warning').alert();
                $('#delete-location-warning').on('click', function (e) {
                  $('#delete-location-warning').remove();
                  e.stopPropagation();
                });
              }
            });
            break;

          case 'edit':
            $('#location-edit-select').replaceWith(`
            <input id="location-edit-name" style="width: 14em" value="${selectedLocation}" spellcheck="false"></input>`);
            $('#delete-location').attr('disabled', true);
            $('#add-location').attr('disabled', true);
            $('#edit-location').replaceWith(` 
            <button type="button" id="confirm-edit-location" class="btn btn-success settings-button" >Confirm</button>`);
            $('#location-edit-name').on('keyup', function () {
              if ($(this).val().length < 2 || $(this).val().length > 25) {
                $('#confirm-edit-location').attr('disabled', true);
              } else $('#confirm-edit-location').removeAttr('disabled');
            });
            $('#confirm-edit-location').on('click', function () {
              locationDirectoryQuery
                .updateData(ID, $('#location-edit-name').val())
                .then((response) => {
                  if (response.status.code == 200) {
                    $('#confirm-edit-location').attr('disabled', true);
                    messageDisplay(
                      {
                        responseText: `${selectedLocation} successfully changed to ${$(
                          '#location-edit-name'
                        ).val()}`
                      },
                      'green',
                      loadSettings
                    );
                  } else {
                    () => {
                      messageDisplay(
                        {
                          responseText: `Could not edit location.`
                        },
                        'red'
                      );
                    };
                  }
                });
            });

            break;

          case 'add':
            $('#location-edit-select').replaceWith(`
              <div style="display: flex; flex-direction: row; align-items: flex-end"><input id="location-new-name" 
              style="width: 10em; height: 40px" placeholder="New location" spellcheck="false"></input>
              `);
            createLocationDropdown();
            $('#delete-location').attr('disabled', true);
            $('#edit-location').attr('disabled', true);
            $('#add-location').replaceWith(` 
              <button type="button" id="confirm-new-location" class="btn btn-success settings-button" disabled>Confirm</button>`);
            $('#location-new-name').on('keyup', function () {
              if ($(this).val().length < 2 || $(this).val().length > 25) {
                $('#confirm-new-location').attr('disabled', true);
              } else $('#confirm-new-location').removeAttr('disabled');
            });
            $('#confirm-new-location').on('click', function () {
              console.log($('#location-new-name').val());
              locationDirectoryQuery.createData($('#location-new-name').val()).then((response) => {
                console.log(response);
                if (response.status.code == 200) {
                  $('#confirm-new-location').attr('disabled', true);
                  messageDisplay(
                    {
                      responseText: `${$('#location-new-name').val()} created successfully`
                    },
                    'green',
                    loadSettings
                  );
                } else {
                  messageDisplay(
                    {
                      responseText: `${$(
                        '#location-new-name'
                      ).val()} could not be created. Please try again.`
                    },
                    'red',
                    loadSettings
                  );
                }
              });
            });
            break;

          default:
            messageDisplay(
              {
                responseText: `Unexplained data error.`
              },
              'red'
            );
        }
      }
    }
  }
};

//Reports Page Main Code
//**************************************************************************/
//
const loadReportsPage = async () => {
  scrollReset();
  changePageLayout('page');
  let staffdata;
  let departmentdata;
  let locationdata;
  let largestdepartment = ['none', 0];
  let initialcount = [];
  const initialReportNumber = 5;
  let initialReportList;

  personnelDirectoryQuery
    .readData('all')
    .then((response) => {
      staffdata = response;
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      alphabet.forEach((letter) => {
        let lettercount = 0;
        staffdata.forEach((person) => {
          if (
            person.firstName.charAt(0) === letter ||
            person.firstName.charAt(0) === letter.toLowerCase()
          ) {
            lettercount++;
          }
        });
        initialcount.push([letter, lettercount]);
      });
      initialcount.sort(function (a, b) {
        return b[1] - a[1];
      });
      initialReportList = () => {
        let reportListCode = '';
        for (let i = 0; i < initialReportNumber; i++) {
          reportListCode += `<li><div style="display: flex; flex-direction: row">${
            initialcount[i][0]
          }:&nbsp <div class="bar-chart" style="background-color: blue; height: 20px; width: ${
            initialcount[i][1] * 10
          }px"></div>&nbsp${initialcount[i][1]}<div></li>`;
        }
        return reportListCode;
      };
    })
    .then(() => {
      departmentDirectoryQuery
        .readData('all')
        .then((response) => {
          departmentdata = response;
          departmentdata.forEach((department) => {
            let departmentcount = 0;
            staffdata.forEach((person) => {
              if (person.department === department.name) {
                departmentcount++;
              }
            });
            if (departmentcount > largestdepartment[1]) {
              largestdepartment = [department.name, departmentcount];
            }
          });
        })
        .then(() => {
          locationDirectoryQuery
            .readData('all')
            .then((response) => {
              locationdata = response;
            })
            .then(() => {
              $('#page-content').append(
                `<div id="report-container">
          <p class="body-text">
            There are currently <strong>${staffdata.length}</strong> employees at Global Unity, 
            working in <strong>${departmentdata.length}</strong> departments
            over <strong>${locationdata.length}</strong> locations across the world.
          </p>
          <p class="body-text">The largest department is <strong>${largestdepartment[0]}</strong> 
          with <strong>${largestdepartment[1]}</strong> employees.</p>
          <p class="body-text">Out of the ${
            staffdata.length
          } employees, the ${initialReportNumber} most common first initals are:</p>
          <br>
          <ul id="report-list">${initialReportList()}</ul>
          <div>`
              );
            });
        });
    });
};

//Photo Upload Functions
//**************************************************************************/
//
let placeholder = 'false';
let uploadPhoto;

const addNewPhoto = (id) => {
  $('#new-onboard, #confirm-changes').click(function () {
    let fd = new FormData();
    let files = $('#file')[0].files;
    if (files.length < 0) {
      if (id) {
        files = `images/staffphoto_id${id}.jpg`;
      }
    }
    if (files.length > 0) {
      fd.append('file', files[0]);
      $.ajax({
        url: 'libs/php/upload.php',
        type: 'POST',
        data: fd,
        contentType: false,
        processData: false,
        success: function (response) {
          if (response != 0) {
            messageDisplay(
              {
                responseText: `Photo uploaded successfully.`
              },
              'green'
            );
          } else {
            placeholder = 'true';
            messageDisplay(
              {
                responseText: `Photo could not be uploaded.`
              },
              'green',
              loadPersonnelPage
            );
          }
        }
      });
    } else {
      placeholder = 'true';
    }
  });
};

//Onboard Page Main Code
//**************************************************************************/
//

const photoUploadForm = `<form method="post" action="" enctype="multipart/form-data" id="myform">
<div class="custom-file">
  <img src="images/icons/placeholder.jpg" class="card-img-top" id="preview-image"/>
  <label class="custom-file-label form-label" for="headshot-photo">Upload headshot photo (max 100kb)</label>
  <input type="file" class="custom-file-input" id="file" name="file" />
</div>
<button style="float: right; margin-right: -30px" id="new-onboard" value="Upload" class="btn btn-success button"
  disabled>Add Employee</button>
</div>
</form>`;

const loadOnboardPage = () => {
  changePageLayout('page');
  $('#page-content').append(
    `<div id="onboard-form">
    <div id="form-container">
      <p id="onboard-paragraph" class="body-text">
        To add a new person to the database, complete their details below and then click the
        <strong>Add Employee</strong> button.
      </p>
      <div>
        <div class="form-group">
          <label class="form-label" for="onboard-first-name">First Name</label>
          <input type="text" class="form-control" id="onboard-first-name" spellcheck="false"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="onboard-last-name">Last Name</label>
          <input type="text" class="form-control" id="onboard-last-name" spellcheck="false"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="onboard-email">Email</label>
          <input type="email" class="form-control" id="onboard-email" spellcheck="false"/>
        </div>
        <div>
          <label class="form-label" for="location-selector">Location</label>
          <br />
          <select
            style="flex: 1; border-radius: 5px"
            class="custom-select add"
            id="location-selector"
          ></select>
        </div>
        <div>
          <label class="form-label" for="department-selector">Department</label>
          <br />
          <select
            style="flex: 1; border-radius: 5px"
            class="custom-select add"
            id="department-selector"
          ></select>
        </div>
        ${photoUploadForm}
      </div>
    </div>
  </div>`
  );
  createLocationDropdown();
  updateProfiledisplayDepartmentList(1, 1);
  updateLocationAndDepartmentSelectors();
  handleOnboardInput();
  authenticateFileType();
  addNewPhoto();
  $('#new-onboard').on('click', function () {
    createPersonnelRecord(
      $('#onboard-first-name').val(),
      $('#onboard-last-name').val(),
      $('#onboard-email').val(),
      $('#department-selector option:selected').val(),
      placeholder
    ).then(() => {
      $('#new-onboard').attr('disabled', true);
      $('#onboard-first-name').val(''),
        $('#onboard-last-name').val(''),
        $('#onboard-email').val('');
    });
  });
  scrollReset();
};

//Directory Search Page Main Code
//**************************************************************************/
//
const loadPersonnelPage = () => {
  changePageLayout('main');
  toggleScroll(true);
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
        $('#main-content').html(`<ul id="main-directory" class="directory-content"></ul>`);
        $('.directory-content').css('margin-top', marginTop[0]);
        displayPersonnelList('all');
        $('#search-icon').removeAttr('disabled');
        break;

      case 'departments':
        $('#departments').focus();
        $('#main-content').html(`<ul id="department-list" class="directory-content"></ul>`);
        //$('.directory-content').css('margin-top', marginTop[0]);
        displayDepartmentList('', 0);
        //$('#search-icon').removeAttr('disabled');
        //visible = false;
        break;

      case 'locations':
        $('#locations').focus();
        $('#main-content').html(`<ul id="location-list" class="directory-content"></ul>`);
        displayLocationList('', 0);
        //visible = false;
        break;

      default:
        return;
    }
    toggleScroll(true);
    scrollReset();
  };

  loadPersonnelTab('directory');

  $('.personnel-button').on('click', function () {
    loadPersonnelTab($(this).attr('id'));
    $('.directory-content').css('margin-top', marginTop[0]);
  });
};
//Directory Search Page Functions
//**************************************************************************/
//
//
//<<<<<<<< PERSONNEL TAB >>>>>>>>
//
const displayPersonnelList = async (search, department) => {
  $('#main-directory').empty();
  personnelDirectoryQuery
    .readData(search, department)
    .then((response) => {
      response.forEach((person) => {
        $('#main-directory')
          .append(`<div class="card directory-card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${person.firstName} ${person.lastName}</div>
        <div class="card-body directory-card-body text-dark">
        <img class="headshot" id="${person.id}" src='images/staffpics/staffphoto_id${person.id}.jpg' width='50px' height='50px'/>
          <ul style="margin-left: 5px; margin-top: 5px">
          <li class="person-card-text"><b>Dept:</b> ${person.department}</li>
          <li class="person-card-text"><b>Location:</b> ${person.location}</li>
          <li class="person-card-text">${person.email}</li>
          </ul>
        </div>
      </div>`);
      });
      if (visibleSearch) {
        //toggleSearchBar();
        $('.directory-content').css('margin-top', marginTop[1]);
        //toggleSearchBar();
        console.log('searchbar present');
      }
      scrollReset();
    })
    .catch(() => {
      messageDisplay(
        {
          responseText: 'Staff Listing Error'
        },
        'red'
      );
    });
};

const updatePersonnelList = () => {
  if ($('#main-directory').length) {
    console.log('main list');
    if ($('#person-file').length) {
      $('#person-file').remove();
      $('#main-content').html(`<ul id="main-directory" class="directory-content"></ul>`);
      $('.directory-content').css('margin-top', marginTop[0]);
    }
    displayPersonnelList(
      $('#name-search').val(),
      $('#department-search-select option:selected').val()
    );
  } else return;
};
//
//<<<<<<<< TEAMS (DEPARTMENTS) TAB >>>>>>>>
//
const displayDepartmentList = async (search, departmentFilter) => {
  console.log(search, departmentFilter);
  //if ($('#name-search').val() == '') removeSearchBar();
  $('#department-list').empty();
  departmentDirectoryQuery.readData('all').then((response) => {
    response.forEach((department) => {
      //console.log(department, departmentFilter);
      if (department.id === departmentFilter || departmentFilter == 0) {
        $('#department-list')
          .append(`<div class="card directory-card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${department.name}</div>
        <div class="dept-card-body text-dark">
          <ul id="personnel-dept-${department.id}" class="dept-section">
          </ul>
        </div>
      </div>`);
        console.log(department.id, search);
        departmentDirectoryQuery
          .readData(department.id, 'person', search)
          .then((response) => {
            console.log(response);
            response.forEach((departmentMember) => {
              $(`#personnel-dept-${department.id}`).append(
                `<div class="dept-photo headshot" id="${departmentMember.id}">
            <img class="small-headshot" src='images/staffpics/staffphoto_id${departmentMember.id}.jpg' 
            width="30px" height="30px"/>
            <span class="person-card-text">${departmentMember.firstName} ${departmentMember.lastName}</span></div>`
              );
            });
            if (visibleSearch) {
              //toggleSearchBar();
              $('.directory-content').css('margin-top', marginTop[1]);
              //toggleSearchBar();
              console.log('searchbar present');
            }
            scrollReset();
          })
          .catch((error) => {
            messageDisplay(
              {
                responseText: 'Department List Error'
              },
              'red'
            );
          });
      }
    });
  });
};

const updateDepartmentList = () => {
  console.log('dept update');
  if ($('#department-list').length) {
    console.log('department list');
    if ($('#person-file').length) {
      console.log('here');
      $('#person-file').remove();
      $('#main-content').html(`<ul id="department-list" class="directory-content"></ul>`);
      $('.directory-content').css('margin-top', marginTop[0]);
    }
    displayDepartmentList(
      $('#name-search').val(),
      $('#department-search-select option:selected').val()
    );
  } else return;
};

//
//<<<<<<<< LOCATIONS TAB >>>>>>>>
//
const displayLocationList = async (search, departmentFilter) => {
  $('#location-list').empty();
  //if ($('#name-search').val() == '') removeSearchBar();
  locationDirectoryQuery
    .readData('all')
    .then((response) => {
      response.forEach((location) => {
        $('#location-list')
          .append(`<div class="card directory-card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${location.name}</div>
        <div class="dept-card-body text-dark">
          <ul id="personnel-dept-${location.id}" class="location-section">
          </ul>
        </div>
      </div>`);
        locationDirectoryQuery
          .readData(location.id)
          .then((response) => {
            response.forEach((locationMember) => {
              //console.log(locationMember, departmentFilter);
              if (locationMember.deptID === departmentFilter || departmentFilter === 0) {
                $(`#personnel-dept-${location.id}`).append(
                  `<div class="location-photo headshot" id="${locationMember.id}">
            <img class="small-headshot" src='images/staffpics/staffphoto_id${locationMember.id}.jpg' width="30px" height="30px"/>
            <span class="person-card-text">${locationMember.firstName} ${locationMember.lastName} (${locationMember.department})</span></div>`
                );
              }
            });
            if (visibleSearch) {
              //toggleSearchBar();
              $('.directory-content').css('margin-top', marginTop[1]);
              //toggleSearchBar();
              console.log('searchbar present');
            }
            scrollReset();
          })
          .catch(() => {
            messageDisplay(
              {
                responseText: 'Location List Error'
              },
              'red'
            );
          });
      });
    })
    .catch(() => {
      messageDisplay(
        {
          responseText: 'Location List Error'
        },
        'red'
      );
    });
};

const updateLocationList = () => {
  console.log('loc update');
  if ($('#location-list').length) {
    console.log('location list');
    if ($('#person-file').length) {
      console.log('here');
      $('#person-file').remove();
      $('#main-content').html(`<ul id="location-list" class="directory-content"></ul>`);
      $('.directory-content').css('margin-top', marginTop[0]);
    }
    displayLocationList(
      $('#name-search').val(),
      $('#department-search-select option:selected').val()
    );
  } else return;
};

//Functions for UI components
//**************************************************************************/
//
const populateDepartmentSelector = (shorten = true) => {
  departmentDirectoryQuery.readData('all').then((response) => {
    response.forEach((department) => {
      const departmentName = () => {
        if (shorten) {
          return shortenString(department.name, 14);
        } else return department.name;
      };
      $('#department-search-select, #department-edit-select').append(
        `<option value="${department.id}">${departmentName()}</option>`
      );
    });
  });
};

const populateLocationSelector = (shorten = true) => {
  locationDirectoryQuery.readData('all').then((response) => {
    response.forEach((location) => {
      const locationName = () => {
        if (shorten) {
          return shortenString(location.name, 14);
        } else return location.name;
      };
      $('#location-search-select, #location-edit-select').append(
        `<option value="${location.id}">${locationName()}</option>`
      );
    });
  });
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
        <option value="0" selected>All Departments</option>
      </select>
    </form>
  </div>`);
    populateDepartmentSelector();

    const updateDatabaseTabs = () => {
      updatePersonnelList();
      updateDepartmentList();
      updateLocationList();
    };
    //updatePersonnelList();
    $('#name-search').on('keyup', function () {
      updateDatabaseTabs();
      //visibleSearch = true;
    });
    $('#department-search-select').on('change', function () {
      updateDatabaseTabs();
      //visibleSearch = true;
    });
    visibleSearch = true;
  } else {
    removeSearchBar();
  }
};

//Personnel Database Functions
//**************************************************************************/
//
const createPersonnelRecord = async (firstName, lastName, email, department, placeholder) => {
  try {
    personnelDirectoryQuery
      .createData(firstName, lastName, email, department, placeholder)
      .then((response) => {
        messageDisplay(
          { responseText: `${firstName} ${lastName} added successfully.` },
          'green',
          showPersonFile,
          response.last
        );
      });
  } catch {
    () =>
      messageDisplay(
        {
          responseText: `Could not add ${firstName} ${lastName}.`
        },
        'red'
      );
  }
};

const updatePersonnelRecord = async (id, email, department) => {
  personnelDirectoryQuery
    .updateData(id, email, department)
    .then(() => {
      messageDisplay({ responseText: `Database Update Success` }, 'green');
    })
    .catch(() => {
      messageDisplay(
        {
          responseText: 'Could not update record.'
        },
        'red'
      );
    });
};

const deletePersonnelRecord = async (id, name) => {
  $('#main-content-header').append(`
    <div id="delete-person-warning" class="alert alert-danger" role="alert">
    You are about to offboard <b>${name}</b> and this action cannot be undone.
    Please confirm that you want to remove <b>${name}</b> from the company
    database.
    <div class="btn-group" role="group" aria-label="edit or offboard">
      <button id="confirm-delete-person" type="button" class="btn btn-primary">
        Confirm
      </button>
      <button id="cancel-delete-person" type="button" class="btn btn-danger">
        Cancel
      </button>
    </div>
  </div>`);
  $('#delete-person-warning').alert();
  $('#confirm-delete-person').on('click', function (e) {
    $('#delete-person-warning').remove();
    e.stopPropagation();

    personnelDirectoryQuery.deleteData('person', id).then((response) => {
      console.log(response);
      if (response.status.code == 200) {
        messageDisplay(
          {
            responseText: `${name} has been successfully removed from the database.`
          },
          'green',
          loadPersonnelPage
        );
      } else {
        messageDisplay(
          {
            responseText: `${name} could not be deleted.`
          },
          'red'
        );
      }
    });
  });
  $('#cancel-delete-person').on('click', function (e) {
    $('#delete-person-warning').remove();
    e.stopPropagation();
    messageDisplay({ responseText: `${name} has not been deleted.` }, 'orange');
  });
};

//Edit Personnel Record Page Main Code
//**************************************************************************/
//
const editPersonnelRecord = async (id, location, department, email, locid, name) => {
  const locationSelection = `<select
    style="flex: 1; border-radius: 5px"
    class="custom-select"
    id="location-selector"
    ><option id="current-location" value="0" selected>${location} (current)</option></select><br>`;
  const departmentSelection = `<select
    style="flex: 1; border-radius: 5px"
    class="custom-select"
    id="department-selector"
    ><option id="current-department" value="0" selected>${shortenString(
      department,
      10
    )} (current)</option></select><br>`;
  $('#location-info').replaceWith(`<label>Location: </label> ${locationSelection}`);
  $('#department-info').replaceWith(`<label>Department: </label> ${departmentSelection}`);

  createLocationDropdown(location);
  updateProfiledisplayDepartmentList(locid, department);
  updateLocationAndDepartmentSelectors(locid, department);

  $('#edit-button-group').remove();
  $('#person-file-info').append(`
    <li>
    <form method="post" action="" enctype="multipart/form-data" id="replaceform">
        <div class="custom-file">
            <label id="profile-label" style="color: black" class="custom-file-label form-label"
                for="headshot-photo">Replace headshot photo (max 100kb)</label>
            <input style="color: black" type="file" class="custom-file-input" id="file" name="file" />
        </div>
        <div id="edit-person-button-group" class="btn-group" role="group" aria-label="edit or offboard">
            <button type="button" id="confirm-changes" class="btn btn-success confirm">Confirm</button>
            <button type="button" class="btn btn-danger cancel">Cancel</button>
            <button id="${id}" type="button" class="btn btn-secondary offboard">Offboard</button>
        </div>
        </div>
    </form>
</li>`);
  $('.offboard').on('click', function () {
    deletePersonnelRecord(id, name);
  });
  authenticateFileType();
  handleEmailInput(email);
  addNewPhoto(id);
};

//Individual Personnel Record Page (displayed when directory photo clicked)
//**************************************************************************/
//
const showPersonFile = async (id) => {
  if (!$('#main-content').length) {
    loadPersonnelPage();
  }
  toggleScroll(false);
  scrollReset();
  personnelDirectoryQuery.readData('id', id).then((response) => {
    let person = response[0];
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
        <div id="edit-button-group" class="btn-group" role="group" aria-label="edit or offboard">
        <button id="${person.id}" location="${person.location}" locid="${person.locid}" 
              dept="${person.department}" email="${person.email}"
            type="button" class="btn btn-primary edit" name="${person.firstName} ${person.lastName}">Edit Details</button>
        <button id="${person.id}" name="${person.firstName} ${person.lastName}" 
        type="button" class="btn btn-secondary offboard">Offboard</button>
      </div>
    </div>`
    );
    $('.offboard').on('click', function () {
      deletePersonnelRecord($(this).attr('id'), $(this).attr('name'));
    });
    if (uploadPhoto) {
      $('.card-img-top').attr('src', uploadPhoto);
      $('body').on('click', function () {
        location.reload();
      });
    }
    uploadPhoto = null;
    $('.edit').on('click', function () {
      editPersonnelRecord(
        $(this).attr('id'),
        $(this).attr('location'),
        $(this).attr('dept'),
        $(this).attr('email'),
        $(this).attr('locid'),
        $(this).attr('name')
      );
      $('.confirm').on('click', function () {
        updatePersonnelRecord(
          person.id,
          $('#email-input').val(),
          $('#department-selector :selected').val()
        );
        showPersonFile(person.id);
      });
      $('.cancel').on('click', function () {
        showPersonFile(person.id);
      });
    });
    $('#search-bar').empty();
    $('.directory-content').css('margin-top', marginTop[0]);
    scrollReset();
  });
};

//Main Icons - Load Requested Page
//**************************************************************************/
//
const loadPage = (pageId) => {
  switch (pageId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'personnel':
      loadPersonnelPage();
      break;
    case 'reports':
      toggleScroll(false);
      loadReportsPage();
      break;
    case 'onboard':
      toggleScroll(false);
      loadOnboardPage();
      break;
    default:
      toggleScroll(true);
      loadDashboard();
  }
};

//Initialization
//**************************************************************************/
//
$(document).ready(function () {
  $('.icon').on('click', function () {
    $('#page-title').text($(this).attr('value'));
    $('#main-content').empty();
    $('#personnel-button-container').remove();
    loadPage($(this).attr('id'));
    $('.directory-content').css('margin-top', marginTop[0]);
  });
  $('#settings-icon').on('click', function () {
    $('#page-title').text('Admin Functions and Settings');
    loadSettings();
  });
  $(document).on('click', '.headshot', function () {
    showPersonFile($(this).attr('id'));
  });
  loadDashboard();
});

//Simulated Notification Database
//**************************************************************************/
//
let notificationArray = [
  {
    title: 'Welcome',
    message:
      'Welcome to the Global Unity Personnel App, the best way to access the personnel database and keep up to date with everything.',
    image: 'images/icons/welcome.png'
  },
  {
    title: 'New Employees',
    message:
      'Please welcome three new members of the sales team: Virge Bootes, Robena Ivanyutin and Brendan Fooks',
    image: 'images/icons/team.png',
    action: `loadPersonnelPage(); displayDepartmentList();`
  },
  {
    title: 'Photo Reminder',
    message:
      'Would all users of the app please check if they have a recent up to date photo on their profile and update it if necessary.',
    image: 'images/icons/think.png'
  },
  {
    title: 'New App Feature',
    message: 'Try the new reports section for fascinating insights into our organization.',
    image: 'images/icons/report.png',
    action: `toggleScroll(false);loadReportsPage();$('#page-title').text("Try our new Reports feature!");`
  },
  {
    title: "Senior Directors' Meeting",
    message:
      'The Senior Directors will meet as usual on the 1st Friday in the month, but due to COVID the meeting this month will be via Zoom.',
    image: 'images/icons/manage.png'
  },
  {
    title: 'Christmas Draw Winner',
    message:
      'Congratulations to Tamarra Ace who came first in the Christmas Draw and is the lucky winner of a tin of biscuits and a chocolate cake.',
    image: 'images/staffpics/staffphoto_id23.jpg',
    action: `showPersonFile(23); $('#page-title').text("Well done, Tamarra!");`
  }
];
