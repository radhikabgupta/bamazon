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

//start the manager view functionality
function start(){
  inquirer.prompt([{
    type: "list",
    name: "doThing",
    message: "Please select an option: ",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product","End Session"]
  }]).then(function(ans){
     switch(ans.doThing){
      case "View Products for Sale": viewProducts();
      break;
      case "View Low Inventory": viewLowInventory();
      break;
      case "Add to Inventory": addToInventory();
      break;
      case "Add New Product": addNewProduct();
      break;
      case "End Session": console.log('See you soon!');
      connection.end();
      break;
    }
  });
}

//views all inventory
function viewProducts(){

  console.log('\n')
  connection.query('SELECT * FROM Products', function(err, res){
  if(err) throw err;
	//creates a table for the information from the mysql database to be placed
	var table = new Table({
		head: ['ID', 'Product', 'Department', 'Price', 'QTY'],
		style: {
			head: ['yellow'],
			compact: false,
			colAligns: ['center'],
		}
	});

	//loops through each item in the mysql database and pushes that information into a new row in the table
	for(var i = 0; i < res.length; i++){
		table.push(
			[res[i].ItemID, res[i].ProductName,  res[i].DepartmentName, (res[i].Price).toFixed(2), res[i].StockQuantity]
		);
	}
  console.log(table.toString());
  console.log(' ');

  start();
  });
}

//views inventory lower than 5
function viewLowInventory(){
  console.log('\n')
  connection.query('SELECT * FROM Products where StockQuantity < 5', function(err, res){   
  if(err) throw err;

	var table = new Table({
		head: ['ID', 'Product', 'Department', 'Price', 'QTY'],
		style: {
			head: ['yellow'],
			compact: false,
			colAligns: ['center'],
		}
	});

	for(var i = 0; i < res.length; i++){
		table.push(
			[res[i].ItemID, res[i].ProductName,  res[i].DepartmentName, (res[i].Price).toFixed(2), res[i].StockQuantity]
		);
	}
  console.log(table.toString());
  console.log(' ');

  start();
  });
}

//displays prompt to add more of an item to the store and asks how much
function addToInventory(){
  console.log('\n')    
  connection.query('SELECT * FROM Products', function(err, res){
  if(err) throw err;
  var itemArray = [];

  for(var i=0; i<res.length; i++){
    itemArray.push(res[i].ProductName);
  }

  inquirer.prompt([{
    type: "list",
    name: "product",
    choices: itemArray,
    message: "Which item would you like to add inventory?"
  }, {
    type: "input",
    name: "qty",
    message: "How much would you like to add?",
    validate: function(value){
      if(isNaN(value) === false){return true;}
      else{return false;}
    }
    }]).then(function(ans){
      var currentQty;
      for(var i=0; i<res.length; i++){
        if(res[i].ProductName === ans.product){
          currentQty = res[i].StockQuantity;
        }
      }
      connection.query('UPDATE Products SET ? WHERE ?', [
        {StockQuantity: currentQty + parseInt(ans.qty)},
        {ProductName: ans.product}
        ], function(err, res){
          if(err) throw err;
          console.log('The quantity was updated.');
          start();
        });
      })
  });
}

//allows manager to add a completely new product to store
function addNewProduct(){
  console.log('\n');
  var deptNames = [];

  connection.query('SELECT * FROM Departments', function(err, res){
    if(err) throw err;
    for(var i = 0; i<res.length; i++){
      deptNames.push(res[i].DepartmentName);
    }
  })

  inquirer.prompt([{
    type: "input",
    name: "product",
    message: "Product: ",
    validate: function(value){
      if(value){return true;}
      else{return false;}
    }
  }, {
    type: "list",
    name: "department",
    message: "Department: ",
    choices: deptNames
  }, {
    type: "input",
    name: "price",
    message: "Price: ",
    validate: function(value){
      if(isNaN(value) === false){return true;}
      else{return false;}
    }
  }, {
    type: "input",
    name: "quantity",
    message: "Quantity: ",
    validate: function(value){
      if(isNaN(value) == false){return true;}
      else{return false;}
    }
  }]).then(function(ans){
    connection.query('INSERT INTO Products SET ?',{
      ProductName: ans.product,
      DepartmentName: ans.department,
      Price: ans.price,
      StockQuantity: ans.quantity
    }, function(err, res){
      if(err) throw err;
      console.log('Another item was added to the store.');
    })
    start();
  });
}

start();