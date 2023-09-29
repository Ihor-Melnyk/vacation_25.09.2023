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

function getWorkDayCount(dateFrom, dateTo) {
  debugger;
  if (dateFrom >= dateTo) return 0;
  var date = new Date(dateFrom);
  var count = 0;

  while (date < dateTo) {
    var currentDay = date.getDay();
    date.setDate(date.getDate() + 1);

    if (date > dateFrom && date.valueOf() == dateTo.valueOf()) {
      break;
    }
    if (currentDay === 6 || currentDay === 7) {
      continue;
    }
    count++;
  }
  return count;
}

function validationDateFrom(dateFrom, dateTo) {
  debugger;
  validationDate(
    dateFrom,
    dateTo,
    "Введені значення некоректні. Дата початку відпустки не може бути раніше дати заяви"
  );
  if (getWorkDayCount(new Date(dateFrom), new Date(dateTo)) < 5) {
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
      if (attrRegistrationType.value && attrRegistrationType.value == "Штат") {
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
  setAttrValue(
    "initiatorNameSurnameForOrder",
    setLoverCaseName(empoyeeData.nameSurname)
  );
}

function setLoverCaseName(nameSurname) {
  var arr = nameSurname?.split(" ");
  return `${arr[0]} ${arr[1].toUpperCase()}`;
}

function setEmployeeManagers() {
  var unitLevel = EdocsApi.getEmployeeDataByEmployeeID(
    CurrentDocument.initiatorId
  ).unitLevel;
  var result = [];
  var resultText = "";

  while (unitLevel > 0) {
    var boss = EdocsApi.getEmployeeManagerByEmployeeID(
      CurrentDocument.initiatorId,
      unitLevel
    );

    if (boss && boss.employeeId != CurrentDocument.initiatorId) {
      result.push({
        employeeId: boss.employeeId,
        employeeName: boss.shortName,
        id: 0,
        index: result.length,
        positionName: boss.positionName,
      });

      resultText += boss.shortName + "\n";
    }

    unitLevel--;
  }
  var attrEmployeeManagers = EdocsApi.getAttributeValue("EmployeeManagers");

  attrEmployeeManagers.value = JSON.stringify(result);
  attrEmployeeManagers.text = resultText;
  EdocsApi.setAttributeValue(attrEmployeeManagers);
}

function onBeforeCardSave() {
  setVacationDays();
  setEmployeeManagers();
}
