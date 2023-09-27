function setAttrValue(nameAttr, valueAttr) {
  debugger;
  var attr = EdocsApi.getAttributeValue(nameAttr);
  if (!attr) return;
  attr.value = valueAttr;
  EdocsApi.setAttributeValue(attr);
}

function getVacationDaysCount(dateFrom, dateTo) {
  debugger;
  return EdocsApi.getVacationDaysCount(dateFrom, dateTo);
}

function validationDate(dateFrom, dateTo) {
  debugger;
  if (new Date(dateFrom) > new Date(dateTo)) {
    throw "Введені значення некоректні. Дата початку відпустки не може бути раніше дати створення заявки";
  }
}

function onChangedateSince() {
  debugger;
  var attrdateSince = EdocsApi.getAttributeValue("dateSince");
  var attrdateTo = EdocsApi.getAttributeValue("dateTo");
  var attrDateOfApplication = EdocsApi.getAttributeValue("DateOfApplication");
  var attrRegistrationType = EdocsApi.getAttributeValue("RegistrationType");
  if (!attrdateSince.value || !attrdateTo.value) return;

  validationDate(attrdateSince.value, attrdateTo.value);
  setAttrValue(
    "days",
    getVacationDaysCount(attrdateSince.value, attrdateTo.value)
  );
}

function onCreate() {
  setInitiatorOrg();
  EdocsApi.setAttributeValue({
    code: "SignType",
    value: "Підписання паперової копії",
  });
}

function setInitiatorOrg() {
  var empoyeeData = EdocsApi.getEmployeeDataByEmployeeID(
    CurrentDocument.initiatorId
  );
  setAttrValue("RegistrationType", empoyeeData.phone1);
  setAttrValue("InitiatorOrg", empoyeeData.phone3);
}
