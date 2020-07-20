var index = 1;
var indexExp = 0;
var numPeople = 1;
var numExp = 1;
var expenses = [];
var travellers = [];
var totalExp = 0;
var categories = [
  {"name": "accommodation", "amount" : 0},
  {"name": "transportation", "amount" : 0},
  {"name": "food", "amount" : 0},
  {"name": "activities", "amount" : 0},
  {"name": "misc", "amount" : 0},
  {"name": "total", "amount" : 0}
]
var summarySortedDate = [];
var toggleStatus = false;
$(document).ready(function(){

  $("#btn1").click(function(){
    $("#test1").text("Hello world!");
  });

  $("#addTraveller").click(function(){
    index++;
    numPeople++;
    var newTextBoxRow = $(document.createElement('tr')).attr("id", 'per_' + index);
    newTextBoxRow.attr("class", "d-flex");
    console.log(newTextBoxRow);
    var addContent =
    '<td class="col-10 col-lg-3">'+
      '<div class="input-group">'+
        '<input id = "name_'+ index +'" type="text" class="form-control">'+
      '</div>'+
    '</td>'+
    '<td class="col-10 col-lg-3">'+
      '<div class="input-group-append">'+
        '<button class="btn btn-danger deleteTraveller"  type="button">Remove</button>'+
      '</div>'+
    '</td>'

    newTextBoxRow.append(addContent);
    console.log(newTextBoxRow);

    newTextBoxRow.appendTo("#tableTravellers");
  });
  

  $("#remTraveller").click(function(){
    rowID = "#per_" + index;
    $(rowID).remove();
    numPeople--;
  });

  $(document).on('click', '#updateTraveller', function() {
    $("#payers").html('<option selected disabled>Please Select</option>')
    updateTravellerList();
    updateTravellerSelect(travellers);
    updateRowsRate();
    // Uncheck all customize box
    $(".customCheckBox").prop("checked", false);
  });

  $(document).on('click', '.deleteTraveller', function() {
    $(this).closest("tr").remove();
    numPeople--;
  });

  $(document).on('click', '.deleteExp', function() {
    row = $(this).closest("tr");
    // Get row ID
    id = getID(row.attr("id"));
    // Change row status to false
    rowInfo = expenses.find(expense => expense.rowID == id);
    rowInfo.status = false;
    // Remove the row
    row.remove();
    numExp--;
    console.log(rowInfo);
  });  

  $("#addExpense").click(function(){
    indexExp++;
    // Input basic row information to the database
    var rowInfo = {
      "rowID": indexExp,
      "status": true,
      "date" : new Date('2000-01-01'),
      "category" : "",
      "amount" : 0,
      "payerId": 0 ,
      "payeesRate" :[]
    };
    // Set default payeesRate is 100 for all travellers
    travellers.forEach(traveller => {
      var payerRateInfo = {"payeeId" : traveller.id, "rate" : 100};
      rowInfo.payeesRate.push(payerRateInfo);
    });
    expenses.push(rowInfo);
    // Create a new row element
    var newTextBoxRow = $(document.createElement('tr')).attr("id", 'exp_' + indexExp);
    newTextBoxRow.attr("class", "d-flex");
    // Add all travellers's name to Select box
    var payerSelect ='';
    travellers.forEach(traveller => {
      var newSelect = $(document.createElement('option')).attr("id", 'payer_' + traveller.id);
      newSelect.append(traveller.name);
      payerSelect = payerSelect + newSelect.get(0).outerHTML;
    });
    // Get information of all columns of the row 
    var addContent =
            '<td class="col-3">'+
              '<input type="date" class="form-control inputVal" placeholder="mm/dd/yyyy">'+
            '</td>'+
            '<td class="col-2">'+
              '<select class="form-control category inputVal">'+
                '<option selected disabled>Please Select</option>'+
                '<option value = "accommodation">Accommodation</option>'+
                '<option value = "transportation">Transportation</option>'+
                '<option value = "food">Food&Drink</option>'+
                '<option value = "activities">Activities</option>'+
                '<option value = "misc">Misc.</option>'+
              '</select>'+
            '</td>'+
            '<td class="col-2">'+
              '<input type="number" class="form-control inputVal" value="0.00" min="0.00" step="0.01">'+
            '</td>'+
            '<td class="col-2">'+
              '<select class="form-control payers inputVal">'+
                '<option selected disabled>Please Select</option>'+ payerSelect +
              '</select>'+
            '</td>'+
            '<td class="col-2">'+
              '<label class="mx-3 my-auto"><input type="checkbox" class = "inputVal customCheckBox" id="check_' + rowInfo.rowID +
              '"> Customize</label>'+
            '</td>'+
            '<td class="col-2">'+
              '<div class="input-group-append">'+
                '<button class="btn btn-danger deleteExp"  type="button">Remove</button>'+
              '</div>'+
            '</td>';
    // Add the information to the row element
    newTextBoxRow.append(addContent);
    newTextBoxRow.appendTo("#tableExpense");
    numExp++;
  });

  $(document).on('click', '#submit', function() {
    var index = 0;
    var jIndex = 0;

    updateExpenseList();
    updateTravellerExp();
    summaryTravellerCashOut();
    summaryCategoryExp();
    summaryExp();
    summaryDate()

    $("#report").removeClass("d-none");
    table = "#reportTable";
    
    $(table).html(
      '<tr>'+
        '<th>Name</th>'+
        '<th>Trip Cost</th>'+
        '<th>Total Payout</th>'+
        '<th>Cash In</th>'+
        '<th>Cash Out</th>'+
      '</tr>'
    );
    travellers.forEach(traveller => {
      index++;
      var newTextBoxRow = $(document.createElement('tr')).attr("id", 'summaryRow_' + index);
      var addContent = 
        '<td>'+traveller.name+'</td>'+
        '<td>$'+traveller.tripCost+'</td>'+
        '<td>$'+traveller.totalPayOut+'</td>'+
        '<td>$'+traveller.totalCashIn+'</td>'+
        '<td>$'+traveller.totalCashOut+'</td>';
      newTextBoxRow.append(addContent);
      newTextBoxRow.appendTo(table);
    });

    categoryTable = "#reportCategoriesTable";
    $(categoryTable).html(
      '<tr>'+
        '<th>Date</th>'+
        '<th>Accommodation</th>'+
        '<th>Transportation</th>'+
        '<th>Food&Drink</th>'+
        '<th>Activities</th>'+
        '<th>Misc.</th>'+
        '<th>Total</th>'+
      '</tr>'
    );
    summarySortedDate.forEach(date => {
      jIndex++;
      var newTextBoxRow = $(document.createElement('tr')).attr("id", 'summaryDateRow_' + jIndex);
      var addContent = 
        '<td>'+formatedDate(date.date)+'</td>'+
        '<td>$'+date.accommodation.toFixed(2)+'</td>'+
        '<td>$'+date.transportation.toFixed(2)+'</td>'+
        '<td>$'+date.food.toFixed(2)+'</td>'+
        '<td>$'+date.activities.toFixed(2)+'</td>'+
        '<td>$'+date.misc.toFixed(2)+'</td>'+
        '<td>$'+date.total.toFixed(2)+'</td>';
      newTextBoxRow.append(addContent);
      newTextBoxRow.appendTo(categoryTable);
    });
    var newTextBoxRow = $(document.createElement('tr')).attr("id", 'total');
    newTextBoxRow.append("<th>Total</td>");
    categories.forEach(category => {
      var newContent = '<td>$'+category.amount.toFixed(2)+'</td>'
      newTextBoxRow.append(newContent);
    });
    newTextBoxRow.appendTo(categoryTable);
  });

  // Open a modal when select a custom Check Box
  $(document).on('click', '.customCheckBox', function() {
    // Get the id of the expense row
    parent = $(this).closest("tr");
    id = getID($(parent).attr("id"));
    if ($(this).prop("checked") == true){
      // Set the id of the modal of these expense
      $('.customModal').attr("id", id);
      modalId = "#" + id;
      // Update the traveller information to the modal
      updateTravellersModal(id);
      // Show the modal
      $(modalId).modal('show');
    // Set payeesRate of this expense row to default
    } else {
      expense = expenses.find(expense => expense.rowID == id);
      expense.payeesRate.forEach(payeeInfo => {
        payeeInfo.rate = 100;
      });
    }
  });
  // Select cancel in the modal
  $(document).on('click', '#cancelModal', function() {
    // Hide the modal
    $('.customModal').modal('hide');
    // Uncheck the Customize check box
    console.log("This should call the set to 100");
    id = $(".customModal").attr("id")
    checkboxId = "#check_" + id;
    $(checkboxId).prop('checked', false);
    // Set payeesRate of this expense row to default
    expense = expenses.find(expense => expense.rowID == id);
    expense.payeesRate.forEach(payeeInfo => {
      payeeInfo.rate = 100;
    });
  });
  // Check if the customize box is checked or unchecked
  $(document).on('change', '.customizedRate', function(){
    if ($(this).prop("checked") == true){
      // Set rate to 0 and enable the input field
      id = getID($(this).attr("id"));
      inputId = "#rate_" + id;
      $(inputId).val(100);
      $(inputId).removeAttr("disabled");
    }
    else {
      // Uncheck the Select All
      $("#ckbCheckAll").prop("checked",false);
      // Set rate to 0 and disable the input field
      id = getID($(this).attr("id"));
      inputId = "#rate_" + id;
      $(inputId).val(0);
      $(inputId).attr("disabled", "disabled");
    }
  });

  // When select Select All, select all options checkbox below
  $(document).on('click', '#ckbCheckAll', function(){
    $(".customizedRate").prop('checked', $(this).prop('checked')).change();
  });

  // Submit the modal, save all payee rates before close the modal
  $(document).on('click', '#submitModal', function() {
    id = $(".customModal").attr("id");
    // Find all the input with type of number to save the rate to the expense row information
    $('table#distributionTable tr :input[type="number"]').each(function() {
      // Modify the payeesRate in the expense with the current row id
      expense = expenses.find(expense => expense.rowID == id)
      expense.payeesRate.forEach(payeeRate => {
        currentPayeeId = getID($(this).attr("id"));
        currentPayeeRate = $(this).val()
        if (payeeRate.payeeId == currentPayeeId) {
          payeeRate.rate = parseFloat(currentPayeeRate);
        }
      });
    });
    // Close the modal
    $('.customModal').modal('hide');
  });
  
});

function updateTravellerList() {
  travellers = [];
    for (i = 0; i < numPeople; ++i){
      var traveller = [
          {
            "id" : 0,
            "name": "",
            "tripCost": 0,
            "payOut" : [],
            "totalPayOut": 0,
            "totalCashOut": 0,
            "totalCashIn" : 0
          }
        ];
      var index = i+2;
      var nthChild = "#tableTravellers tr:nth-child(" + index + ")";
      var row = $(nthChild)
      var id = row.find("input").attr("id").match(/[0-9 -()+]+$/);
      var name = row.find("input").val();
      traveller.id = id[0];
      traveller.name = name;
      travellers.push(traveller);
    }
}
// Update the travellers' name to the Payer column
function updateTravellerSelect(info) {
  $(".payers").each(function() {
    content = $(this);
    var addContent = $('<option selected disabled>Please Select</option>');
    content.empty();
    content.html(addContent);
    $(info).each(function(i, obj){
      var newTextBoxRow = $(document.createElement('option')).attr("id", 'payer_' + obj.id);
      newTextBoxRow.append(obj.name);
      newTextBoxRow.appendTo(content);
    });
  });
}

// Update all row information when hit submitting
function updateExpenseList(){
  var index = 2;
  // Filter active rows only
  activeExpenses = expenses.filter(expense => expense.status);
  activeExpenses.forEach(expense => {
    var personID;
    var j = 0;
    var nthChild = "#tableExpense tr:nth-child(" + index + ")";
    var row = $(nthChild)
    var input = row.find(".inputVal");
    var rowID = getID(row.attr("id"));
    // Assign information for each row with their id
    if (expense.rowID == rowID) {
      $.each(input, function(){
        switch (j) {
          case 0:
            expense.date = new Date($(this).val());
            break;
          case 1:
            expense.category = $(this).val();
            break;
          case 2:
            expense.amount = $(this).val();
            break;
          case 3:
            personID = $(this).children("option:selected").attr("id");
            id = personID.match(/[0-9 -()+]+$/);
            expense.payerId = id[0];
            break;
        }
        j++;
      });
    }
    index++;
  });
}
// Update all traveller the list of payout amount
function updateTravellerExp() {
  travellers.forEach(traveller => {
      traveller.payOut=[];
      var exp = expenses.filter(expense => expense.payerId === traveller.id && expense.status);
      exp.forEach(eachExp => {
          traveller.payOut.push(eachExp.amount);
      });
  });
}

// Calculate each traveller payout
function summaryTravellerCashOut() {
  travellers.forEach(traveller => {
    traveller.totalPayOut = 0;
    traveller.payOut.forEach(exp => {
      traveller.totalPayOut = (parseFloat(traveller.totalPayOut) + parseFloat(exp)).toFixed(2);
    });
  });
}
// Calculate the amount paid in each category
function summaryCategoryExp() {
  var sum = 0;
  categories.forEach(category => {
    category.amount = 0;
    var exp = expenses.filter(expense => expense.category === category.name && expense.status);
    exp.forEach(eachExp => {
      category.amount = parseFloat(category.amount) + parseFloat(eachExp.amount);
      sum = parseFloat(sum) + parseFloat(eachExp.amount);
    });
  });
  var category = categories.find(category => category.name == "total")
  category.amount = sum;                
}
// 7/19 Should change how to calculate each expense according to each expense rate.
// Calculate the trip cost and the amount each traveller get back or own
function summaryExp() {
  // Calculate total Expense and average trip cost
  totalExp = 0;
  travellers.forEach(traveller => {
    totalExp = parseFloat(totalExp) + parseFloat(traveller.totalPayOut);
  });
  // Calculate the total rate of each expense
  expenses.forEach(expense => {
    var totalRate = 0;
    expense.payeesRate.forEach( payeeRate => {
        totalRate += parseFloat(payeeRate.rate);
    });
    expense["totalRate"] = totalRate;
  });
  // Calculate each traveller cost for each expense
  expenses.forEach(expense => {
    expense.payeesRate.forEach(payeeInfo => {
        payeeInfo["thisCost"] = parseFloat(expense.amount)/expense.totalRate*parseFloat(payeeInfo.rate);
        payeeInfo["thisCost"] = payeeInfo["thisCost"].toFixed(2);
    });
  });
  // Summary trip cost for each traveller
  travellers.forEach(traveller => {
    traveller.tripCost = 0;
    traveller.totalCashIn = 0;
    traveller.totalCashOut = 0;
    // Calculate the trip cost for each traveller
    activeExpenses = expenses.filter(expense => expense.status);
    activeExpenses.forEach(expense => {
      thisTravellerCost = expense.payeesRate.find(payeeInfo => payeeInfo.payeeId == traveller.id);
      traveller.tripCost += parseFloat(thisTravellerCost.thisCost);
      });
    //  Calculate the amount they need to pay or other people own each traveller
    if (parseFloat(traveller.totalPayOut) > parseFloat(traveller.tripCost)){
      traveller.totalCashIn = (parseFloat(traveller.totalPayOut) - parseFloat(traveller.tripCost)).toFixed(2);
    } else {
      traveller.totalCashOut = (parseFloat(traveller.tripCost) - parseFloat(traveller.totalPayOut)).toFixed(2);
    }
    traveller.tripCost = traveller.tripCost.toFixed(2);
  });
}
// Summary the expense each day
function summaryDate() {
  var sortedDate = expenses.sort((d1,d2) => (d1.date < d2.date) ? -1 : 1);
  summarySortedDate = [];
  var j = 0;
  for (i=0; i<sortedDate.length; i++) {
    if (sortedDate[i].status) {
      if (i==0 || (sortedDate[i].date - sortedDate[i-1].date) !=0 ) {
        var newDate = {
          "date":sortedDate[i].date, 
          "accommodation":0, 
          "transportation":0,
          "food":0, 
          "activities":0,
          "misc":0, 
          "total":0
        };
        switch(sortedDate[i].category) {
          case "accommodation":
            newDate.accommodation = parseFloat(newDate.accommodation) + parseFloat(sortedDate[i].amount);
            break;
          case "transportation":
            newDate.transportation = parseFloat(newDate.transportation) + parseFloat(sortedDate[i].amount);
            break;
          case "food":
            newDate.food = parseFloat(newDate.food) + parseFloat(sortedDate[i].amount);
            break;
          case "activities":
            newDate.activities = parseFloat(newDate.activities) + parseFloat(sortedDate[i].amount);
            break;
          case "misc":
            newDate.misc = parseFloat(newDate.misc) + parseFloat(sortedDate[i].amount);
            break;
        }
        newDate.total = parseFloat(sortedDate[i].amount);
        summarySortedDate.push(newDate); 
        j++;
      }
      else {
        switch(sortedDate[i].category) {
          case "accommodation":
            summarySortedDate[j-1].accommodation = parseFloat(summarySortedDate[j-1].accommodation) + parseFloat(sortedDate[i].amount);
            break;
          case "transportation":
            summarySortedDate[j-1].transportation = parseFloat(summarySortedDate[j-1].transportation) + parseFloat(sortedDate[i].amount);
            break;
          case "food":
            summarySortedDate[j-1].food = parseFloat(summarySortedDate[j-1].food) + parseFloat(sortedDate[i].amount);
            break;
          case "activities":
            summarySortedDate[j-1].activities = parseFloat(summarySortedDate[j-1].activities) + parseFloat(sortedDate[i].amount);
            break;
          case "misc":
            summarySortedDate[j-1].misc = parseFloat(summarySortedDate[j-1].misc) + parseFloat(sortedDate[i].amount);
            break;
        }
        summarySortedDate[j-1].total = parseFloat(summarySortedDate[j-1].total) + parseFloat(sortedDate[i].amount);
      }
    }
  }
  console.log(summarySortedDate);
}
// Format date to output
function formatedDate(date) {
  newDate = (date.getMonth()+1) + "/" + (date.getDate()+1) + "/" + date.getFullYear();
  return newDate;
}
// Update the traveller information into the modal
function updateTravellersModal(id) {
  address = "#" + id + " #distributionTable";
  content = $(address);
  content.empty();
  content.html("<tr><th><input type='checkbox' id='ckbCheckAll'>  Select All</th><th>Name</th><th>Percentage</th></tr>");
  travellers.forEach(traveller => {
    var newContent = 
    '<tr>'+
    '<td><label><input type="checkbox" class="customizedRate" id="checkbox_' + traveller.id +'"</label></td>'+
    '<td>'+ traveller.name + '</td>'+
    '<td><input type="number" class="form-control" value="0" min="0" max="100" step="5" id="rate_'+ traveller.id +'" disabled></td>'+
    '</tr>';
    content.append(newContent);
  });
}
// Get the id from a string
function getID(input) {
  var id = input.match(/[0-9 -()+]+$/);
  return id[0];
}

// Update the expense row Rate and set payerId to null
function updateRowsRate() {
  // For each expesens, add the row ID with default rate of 100 for all travellers
  expenses.forEach(expense => {
    // Empty the payeeRate
    expense.payeesRate = [];
    // Set payee rates to 100 for with new traveller information
    travellers.forEach(traveller => {
      var payerRateInfo = {"payeeId" : traveller.id, "rate" : 100};
      expense.payeesRate.push(payerRateInfo);
    });
    // Empty payerId
    expense.payerId = "";
  });
}




