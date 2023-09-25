function DataInitiator() {
    debugger;
    var attributeValueInitiatorT = EdocsApi.getAttributeValue("Type");
    var attributeValueInitiatorO = EdocsApi.getAttributeValue("orgName1");
    var attributeValueInitiatorS = EdocsApi.getAttributeValue("Org");
  
    var empoyeeData = EdocsApi.getEmployeeDataByEmployeeID(
      CurrentDocument.initiatorId
    );
    attributeValueInitiatorT.value = empoyeeData.phone1;
    attributeValueInitiatorO.value = empoyeeData.phone3;
    attributeValueInitiatorS.value = empoyeeData.phone3;
  
    EdocsApi.setAttributeValue(attributeValueInitiatorT);
    EdocsApi.setAttributeValue(attributeValueInitiatorO);
    EdocsApi.setAttributeValue(attributeValueInitiatorS);
  }
  
  function dateCreation() {
    debugger;
  
    var dateCreate = EdocsApi.getAttributeValue("Date0");
    var dateVacation = EdocsApi.getAttributeValue("dateFrom");
    var DCreate = moment(dateCreate.value).format("DD.MM.YYYY");
    DCreate = moment(DCreate, "DD.MM.YYYY");
    var DTo = moment(dateVacation.value).format("DD.MM.YYYY");
    DTo = moment(DTo, "DD.MM.YYYY");
  
    if (dateCreate.value && dateVacation.value) {
      var vacationType = EdocsApi.getAttributeValue("vacationType");
  
      if (
        vacationType.value &&
        (vacationType.value == "відпустку без збереження заробітної плати" ||
          vacationType.value == "по вагітності та пологам" ||
          vacationType.value == "відпустка при народженні дитини")
      ) {
        return;
      } else {
        if (dateCreate.value <= dateVacation.value) {
          var shtat = EdocsApi.getAttributeValue("Type");
          var days = getWorkDayCount(DCreate, DTo);
          //var days = EdocsApi.getVacationDaysCount(DCreate, DTo);
          if (days < 5 && shtat && shtat.value == "Штат") {
            throw "Введені значення некоректні. Заяву на відпустку можливо створити не пізніше ніж за 5 робочих днів. до дати початку відпустки";
          }
        } else {
          throw new Error(
            "Введені значення некоректні. Дата початку відпустки не може бути раніше дати створення заявки"
          );
        }
      }
    }
  }
  
  function getWorkDayCount(dateFrom, dateTo) {
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
  
  function diffdate() {
    debugger;
    var days = EdocsApi.getAttributeValue("days");
    var dateFrom = EdocsApi.getAttributeValue("dateFrom");
    var dateTo = EdocsApi.getAttributeValue("dateTo");
    if (dateTo.value && dateFrom.value) {
      if (dateTo.value >= dateFrom.value) {
        days.value = EdocsApi.getVacationDaysCount(dateFrom.value, dateTo.value);
        if (days.value >= 0) {
          if (days.value === 0) {
            days.value = 1;
          }
          EdocsApi.setAttributeValue(days);
        }
      } else {
        throw new Error(
          "Введені значення некоректні. Дата початку не повинна бути більшою дати кінця"
        );
      }
    }
  }
  
  function onCardSave() {
    debugger;
    var Initiator1 = EdocsApi.getAttributeValue("Initiator1");
    if (Initiator1.text) {
      if (CurrentDocument.isDraft) {
        var m = moment(Initiator1.value);
        EdocsApi.setAttributeValue({
          code: "InitiatorN",
          value: Initiator1.value,
        });
      }
    }
  
    dateCreation();
    diffdate();
    var Date0 = EdocsApi.getAttributeValue("Date0");
    if (Date0.value) {
      if (CurrentDocument.isDraft) {
        var m = moment(Date0.value);
        EdocsApi.setAttributeValue({
          code: "datecreationtext",
          value: m.format("DD.MM.YYYY"),
        });
      }
    }
  }
  
  function onChangedateFrom() {
    debugger;
    var dateFrom = EdocsApi.getAttributeValue("dateFrom");
    var datesincetext = EdocsApi.getAttributeValue("datesincetext");
    if (dateFrom.value) {
      var m = moment(dateFrom.value);
      datesincetext.value = m.format("DD.MM.YYYY");
    }
    EdocsApi.setAttributeValue(datesincetext);
  }
  
  function onChangedateTo() {
    debugger;
    var dateTo = EdocsApi.getAttributeValue("dateTo");
    var datetotext = EdocsApi.getAttributeValue("datetotext");
    if (dateTo.value) {
      var m = moment(dateTo.value);
      datetotext.value = m.format("DD.MM.YYYY");
    }
    EdocsApi.setAttributeValue(datetotext);
  }
  
  function onBeforeCardSave() {
    if (CurrentDocument.isDraft) {
      onCardSave();
      setVacationName();
      DataInitiator();
      setBossByAuthor();
      dateCreation();
    }
  }
  
  function onCreate() {
    DataInitiator();
    FillBaseFields();
    EdocsApi.setAttributeValue({
      code: "SignType",
      value: "Підписання паперової копії",
    });
  }
  
  function FillBaseFields() {
    var employee = EdocsApi.getEmployeeDataByEmployeeID(CurrentUser.employeeId);
    if (employee && employee.phone2 && employee.phone2.length > 0) {
      EdocsApi.setAttributeValue({
        code: "Initiator2",
        value: employee.phone2,
        text: employee.phone2,
      });
    } else {
      EdocsApi.setAttributeValue({
        code: "Initiator2",
        value: employee.positionName,
        text: employee.positionName,
      });
    }
  }
  
  
  function setVacationName() {
    var vacationUser = EdocsApi.getAttributeValue("Initiator1").text;
    var vacationDateFrom = EdocsApi.getAttributeValue("dateFrom").value;
    var vacationDateTo = EdocsApi.getAttributeValue("dateTo").value;
    var vacationType = EdocsApi.getAttributeValue("vacationType").value;
    var vacationName = EdocsApi.getAttributeValue("vacationName");
    if (vacationUser && vacationDateFrom && vacationDateTo && vacationType) {
      vacationName.value =
        vacationUser +
        ": " +
        vacationType +
        ", з " +
        moment(vacationDateFrom).format("DD.MM.YYYY") +
        " по " +
        moment(vacationDateTo).format("DD.MM.YYYY");
    } else if (vacationType) {
      vacationName.value = vacationType;
    } else if (vacationUser) {
      vacationName.value = vacationUser;
    } else {
      vacationName.value = null;
    }
  
    EdocsApi.setAttributeValue(vacationName);
  }
  
  function setBossByAuthor() {
    var author = CurrentDocument.initiatorId; //EdocsApi.getAttributeValue('Initiator1').value;
    var unitLevel = EdocsApi.getEmployeeDataByEmployeeID(author).unitLevel;
    var result = [];
    var resultText = "";
  
    while (unitLevel > 0) {
      var boss = EdocsApi.getEmployeeManagerByEmployeeID(author, unitLevel);
  
      if (boss && boss.employeeId != author) {
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
    var bosses = EdocsApi.getAttributeValue("bosses");
  
    bosses.value = JSON.stringify(result);
    bosses.text = resultText;
    EdocsApi.setAttributeValue(bosses);
  }
  