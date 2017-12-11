function doGet(e) {
  
  var parameter = e.parameter;
  var spreadsheetId = parameter.spreadsheetId;
  var rowIndex = parameter.rowIndex;
  var requestId = parameter.requestId;
  
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var database =  spreadsheet.getSheetByName("Database");
  var range_A1 = database.getRange(rowIndex, 1);
  
  if(requestId == range_A1.getValue()) {
    var note = range_A1.getNote();
    return HtmlService.createHtmlOutput("<h2 align=center>" + note + "</h2>");
  } 
  else return HtmlService.createHtmlOutput("<h2 align=center>Error : Sorry, something gets wrong. please let IS know.</h2>"); 
  
}
