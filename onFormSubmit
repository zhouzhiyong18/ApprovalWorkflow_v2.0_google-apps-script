function onFormSubmit(e) {
  
  var formId = FormApp.getActiveForm().getId();
  var formTitle = FormApp.getActiveForm().getTitle();//Form的标题
  var spreadsheetId = FormApp.getActiveForm().getDestinationId();//关联的电子表格ID
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var database = spreadsheet.getSheetByName("Database");
  var approvalHistory = spreadsheet.getSheetByName("Approval History");
  var configuration = spreadsheet.getSheetByName("Configuration");
  
  var formResponse = e.response;//回复
  var responseId = formResponse.getId();//回复ID
  var itemResponses = formResponse.getItemResponses();//回复items
  var nextApprover = itemResponses[0].getResponse().toLowerCase().replace(/\s+/g,"");//第一审批人，第一个item，转小写，去空格
  var respondentEmail = formResponse.getRespondentEmail();//回复者
  
  var configuration_values = configuration.getRange(1, 2, 5, 1).getValues();
  var title = configuration_values[0][0];//B1
  var prefix = configuration_values[1][0];//B2
  var sheetName = configuration_values[2][0];//B3
  var sever_doPost = configuration_values[3][0];//B4
  var sever_doGet = configuration_values[4][0];//B5
  
  //往Database表里写入记录
  var rowIndex = database.getLastRow() + 1;
  var requestId = prefix+rowIndex;
  var importRange = "=IMPORTRANGE(\"https://docs.google.com/spreadsheets/d/" + spreadsheetId +"\",\"" + sheetName + "!A" + rowIndex + ":Z" + rowIndex +"\")";
  database.getRange(rowIndex, 1, 1, 2).setValues([[requestId, importRange]]);
  
  //往Approval History表里写入记录
  approvalHistory.getRange(rowIndex, 1).setValue(requestId).setBackground("#d9ead3");
  
  //发送邮件
  var to;
  var subject = title + " - " + requestId;
  var template;
  
  //给第一审批人发邮件
  to = nextApprover;
  template = HtmlService.createTemplateFromFile("approvalTemplate");
  template.formTitle = formTitle;
  template.applicant = respondentEmail;
  template.itemResponses = itemResponses;
  template.sever_doPost = sever_doPost;
  template.formId = formId;
  template.responseId = responseId;
  template.rowIndex = rowIndex;
  template.requestId = requestId;
  template.status = 1;
  
  var htmlBody = template.evaluate().getContent();
  
  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: htmlBody, 
    noReply: true
  });
  
  //添加备注
  var note = "Waitting for " + nextApprover + "."; 
  database.getRange(rowIndex, 1).setNote(note);//添加备注
  
  //给申请人发送申请回执
  var doGetUrl = sever_doGet + "?spreadsheetId=" + spreadsheetId + "&rowIndex=" + rowIndex + "&requestId=" + requestId;
  
  to = respondentEmail;
  template = HtmlService.createTemplateFromFile("receiptTemplate");
  template.formTitle = formTitle;
  template.requestId = requestId;
  template.doGetUrl = doGetUrl;
  template.itemResponses = itemResponses;
  
  var htmlBody = template.evaluate().getContent();
  
  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: htmlBody, 
    noReply: true
  });
  
}
