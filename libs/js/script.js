class DatabaseQuery {
    constructor(table) {
      //this.type = type;
      this.table = table;
      //this.data = data;
    }
  
    getData = async () => {
      return new Promise((resolve, reject) => {
        $.ajax({
          type: 'POST',
          url: 'libs/php/databaseFunctions.php',
          dataType: 'json',
          data: {
            table: this.table
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
  }

  const personnel = new DatabaseQuery('personnel');
  personnel.getData().then(response => console.log(response));

  //type CREATE / REMOVE / UPDATE / DELETE
  //table DEPT / LOCATION / PERSONNEL
  //data