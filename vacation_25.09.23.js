function setAttrValue(nameAttr, valueAttr) {
  debugger;
  var attr = EdocsApi.getAttributeValue(nameAttr);
  if (!attr) return;
  attr.value = valueAttr;
  EdocsApi.setAttributeValue(attr);
}

function getDaysFromTo(dateFrom, dateTo, error) {
  debugger;
  validationDate(dateFrom, dateTo, error);
  return EdocsApi.getVacationDaysCount(dateFrom, dateTo);
}

function getVacationDaysCount(dateFrom, dateTo) {
  debugger;
  return getDaysFromTo(
    dateFrom,
    dateTo,
    "Введені значення некоректні. Дата закінчення відпустки не може бути раніше дати початку відпустки"
  );
}

function validationDate(dateFrom, dateTo, error) {
  debugger;
  if (new Date(dateFrom) > new Date(dateTo)) {
    throw error;
  }
}

function validationDateFrom(dateFrom, dateOfApplication) {
  debugger;
  if (
    getDaysFromTo(
      dateFrom,
      dateOfApplication,
      "Введені значення некоректні. Дата початку відпустки не може бути раніше дати заяви"
    ) <= 5
  ) {
    throw "Введені значення некоректні. Заяву на відпустку можливо створити не пізніше ніж за 5 робочих днів. до дати початку відпустки";
  }
}

function setVacationDays() {
  debugger;
  var attrdateSince = EdocsApi.getAttributeValue("dateSince");
  var attrdateTo = EdocsApi.getAttributeValue("dateTo");

  if (!attrdateSince.value || !attrdateTo.value) return;
  var vacationType = EdocsApi.getAttributeValue("vacationType");
  if (
    vacationType.value &&
    (vacationType.value == "відпустку без збереження заробітної плати" ||
      vacationType.value == "по вагітності та пологам" ||
      vacationType.value == "відпустка при народженні дитини")
  ) {
    setAttrValue(
      "days",
      getVacationDaysCount(attrdateSince.value, attrdateTo.value)
    );
  } else {
    var attrDateOfApplication = EdocsApi.getAttributeValue("DateOfApplication");
    if (attrDateOfApplication.value) {
      var attrRegistrationType = EdocsApi.getAttributeValue("RegistrationType");
      if (attrRegistrationType.value && attrRegistrationType.value == "ФОП") {
        validationDateFrom(attrDateOfApplication.value, attrdateSince.value);
      }
      setAttrValue(
        "days",
        getVacationDaysCount(attrdateSince.value, attrdateTo.value)
      );
    }
  }
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
  setAttrValue("DateOfApplication", new Date());
}

function onBeforeCardSave() {
  setVacationDays();
}
