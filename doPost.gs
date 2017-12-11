function doPost(e) {
  
  Logger.log(e);
  
  var parameter = e.parameter;
  var formId = parameter.formId;
  var responseId = parameter.responseId;
  var rowIndex = parameter.rowIndex;
  var requestId = parameter.requestId;
  var status = parameter.status;
  var dicision = parameter.dicision;
  var comment = parameter.comment;
  
  if(dicision == "") return HtmlService.createHtmlOutput("<h2 align=center>Please checked approve/reject first.</h2>");
  
  var form = FormApp.openById(formId);
  var formTitle = form.getTitle();//Form的标题
  var spreadsheetId = form.getDestinationId();//关联的电子表格ID
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var database = spreadsheet.getSheetByName("Database");
  var configuration = spreadsheet.getSheetByName("Configuration");
  var approvalHistory = spreadsheet.getSheetByName("Approval History");
  var approvalList = spreadsheet.getSheetByName("Approval List");
  var formResponse = form.getResponse(responseId);
  var itemResponses = formResponse.getItemResponses();
  var respondentEmail = formResponse.getRespondentEmail();
  var user = Session.getActiveUser().getEmail();
  
  var approver;
  var approvalList_values = approvalList.getRange(1, 1, 5, parseInt(status)+1).getValues();
  if(status == "1") {
    approver = itemResponses[0].getResponse();
  }
  else {
    approver = approvalList_values[1][parseInt(status)-1];
  }
  
  if(user != approver) return HtmlService.createHtmlOutput("<h2 align=center>Sorry, you have no right to approve/reject.</h2>");
  
  var column_approver = 2 + (parseInt(status) - 1) * 4;
  var str_approver = approvalHistory.getRange(rowIndex, column_approver).getValue();
  if(str_approver != "") return HtmlService.createHtmlOutput("<h2 align=center>You have already approved/rejected before.</h2>");
  
  var color_app = "#d9ead3";
  var color_rej = "#f4cccc";
  
  //写入Approval History
  var myDate = new Date();
  var newHistory = [["","","",""]];
  newHistory[0][0] = approver;
  newHistory[0][1] = dicision;
  newHistory[0][2] = comment;
  newHistory[0][3] = myDate;
  var color = dicision == "Approve" ? color_app : color_rej;
  approvalHistory.getRange(rowIndex, column_approver, 1, 4).setValues(newHistory).setBackground(color);
  
  var configuration_values = configuration.getRange(1, 2, 5, 1).getValues();
  var title = configuration_values[0][0];//B1
//  var prefix = configuration_values[1][0];//B2
//  var sheetName = configuration_values[2][0];//B3
  var sever_doPost = configuration_values[3][0];//B4
  var sever_doGet = configuration_values[4][0];//B5
  
  //发送邮件
  var subject = title + " - " + requestId;
  
  //给申请人发送邮件，通知当下审批结果
  var to = respondentEmail;
  var doGetUrl = sever_doGet + "?spreadsheetId=" + spreadsheetId + "&rowIndex=" + rowIndex + "&requestId=" + requestId;
  
  var template = HtmlService.createTemplateFromFile("progressTemplate");
  template.approver = approver;
  template.status = status;
  template.dicision_App = dicision == "Approve" ? dicision : "";
  template.dicision_Rej = dicision == "Reject" ? dicision : "";
  template.comment = comment;
  template.doGetUrl = doGetUrl;
  template.itemResponses = itemResponses;
  
  var htmlBody = template.evaluate().getContent();
  
  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: htmlBody, 
    noReply: true
  });
  
  if(dicision == "Reject") {
    //添加备注
    var note = "Rejected by " + approver + "."; 
    database.getRange(rowIndex, 1).setNote(note);//添加备注
    database.getRange(rowIndex, 1, 1, 26).setBackground(color_rej);
    
    return HtmlService.createHtmlOutput("<h2 align=center>Reject Success! You can now exit safely.</h2>");
  }
    
  var nextApprover = approvalList_values[1][parseInt(status)];
  
  if(nextApprover != "") {//给下一审批人发送邮件
    status = parseInt(status) + 1;
    var to = nextApprover;
    
    var template = HtmlService.createTemplateFromFile("approvalTemplate");
    template.formTitle = formTitle;
    template.applicant = respondentEmail;
    template.itemResponses = itemResponses;
    template.sever_doPost = sever_doPost;
    template.formId = formId;
    template.responseId = responseId;
    template.rowIndex = rowIndex;
    template.requestId = requestId;
    template.status = status;
  
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
  }
  
  else {//给申请人发送邮件，通知审批通过
    var to = respondentEmail;
    var cc = approvalList_values[4][1];
    
    var template = HtmlService.createTemplateFromFile("summaryTemplate");
    template.formTitle = formTitle;
    template.requestId = requestId;
    template.itemResponses = itemResponses;
    template.status = status;
    template.approvalRole = approvalList_values;
    var approvalInfo = approvalHistory.getRange(rowIndex, 2, 1, 4 * status).getValues();
    template.approvalInfo = approvalInfo;
  
    var htmlBody = template.evaluate().getContent();
  
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody, 
      noReply: true,
      cc: cc
    });
    
    //添加备注
    var note = "All Approved."; 
    database.getRange(rowIndex, 1).setNote(note);//添加备注
    database.getRange(rowIndex, 1, 1, 26).setBackground(color_app);
  }
  
  return HtmlService.createHtmlOutput("<h2 align=center>Approve Success! You can now exit safely.</h2>");
}
