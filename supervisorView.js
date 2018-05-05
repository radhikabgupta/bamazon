require("dot-env")
var mysql = require('mysql');
var inquirer = require('inquirer');
var colors = require('colors/safe');
var Table = require('cli-table');

//create connection to db
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.DATABASE_PASSWORD,
  database: "Bamazon"
})

function start(){
  inquirer.prompt([{
    type: "list",
    name: "doThing",
    message: "What would you like to do?",
    choices: ["View Product Sales by Department", "Create New Department", "End Session"]
  }]).then(function(ans){
    switch(ans.doThing){
      case "View Product Sales by Department": viewProductByDept();
      break;
      case "Create New Department": createNewDept();
      break;
      case "End Session": console.log('Bye!');
      connection.end();
    }
  });
}

//view product sales by department
function viewProductByDept(){
  console.log('\n');
  connection.query('SELECT DepartmentID, DepartmentName, OverHeadCosts, TotalSales, TotalSales-OverHeadCosts AS ProductSales FROM Departments', function(err, res){
    if(err) throw err;

	var table = new Table({
    head: ['Dept. ID', 'Dept. Name', 'Over Head Cost', 'Product Sales', 'Total Profit' ],
		style: {
			head: ['yellow'],
			compact: false,
			colAligns: ['center'],
		}
	});

	for(var i = 0; i < res.length; i++){
		table.push(
			[res[i].DepartmentID, res[i].DepartmentName, (res[i].OverHeadCosts).toFixed(2) , (res[i].TotalSales).toFixed(2) , (res[i].ProductSales).toFixed(2)  ]
		);
	}

  console.log(table.toString());
  console.log(' ');

    start();
  })
}

  //create a new department
  function createNewDept(){
    console.log('\n');
    inquirer.prompt([
    {
      type: "input",
      name: "deptName",
      message: "Department Name: "
    }, {
      type: "input",
      name: "overHeadCost",
      message: "Over Head Cost: ",
      default: 0,
      validate: function(val){
        if(isNaN(val) === false){return true;}
        else{return false;}
      }
    }, {
      type: "input",
      name: "prodSales",
      message: "Product Sales: ",
      default: 0,
      validate: function(val){
        if(isNaN(val) === false){return true;}
        else{return false;}
      }
    }
    ]).then(function(ans){
      connection.query('INSERT INTO Departments SET ?',{
        DepartmentName: ans.deptName,
        OverHeadCosts: ans.overHeadCost,
        TotalSales: ans.prodSales
      }, function(err, res){
        if(err) throw err;
        console.log('Another department was added.');
      })
      start();
    });
  }

start();