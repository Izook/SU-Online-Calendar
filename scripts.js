$(document).ready(function () {
  $("#submitHide").unbind('click');
  $("#submitHide").on('click', function() {
    var username = $("#userNameInput").val();
    var password = $("#passWordInput").val();
    requestScheduleJSON(username,password);
  });
})

function changeCells(currTime, course, c, text) {
  row = document.getElementById(currTime);
  if (course.mw) {
    row.children[1].style.backgroundColor = c;
    row.children[1].style.color = '#FFFFFF';
    row.children[1].innerHTML = text;
    row.children[3].style.backgroundColor = c;
    row.children[3].style.color = '#FFFFFF';
    row.children[3].innerHTML = text;
    if (course.f) {
      row.children[5].style.backgroundColor = c;
      row.children[5].style.color = '#FFFFFF';
      row.children[5].innerHTML = text;
    }
  } else if (course.tth) {
    row.children[2].style.backgroundColor = c;
    row.children[2].style.color = '#FFFFFF';
    row.children[2].innerHTML = text;

    row.children[4].style.backgroundColor = c;
    row.children[4].style.color = '#FFFFFF';
    row.children[4].innerHTML = text;
  }

  if (parseInt(currTime) < 900) {
    currTime = "0" + (parseInt(currTime) + 100).toString();
  }
  else {
    currTime = (parseInt(currTime) + 100).toString();
  }
}

function updateSchedule(course, c) {
  var scheduleBody = document.getElementById("schedule-body");

  var startTime = course.startTimeMilitary;
  var endTime = course.endTimeMilitary;
  var courseCode = course.code.replace(course.code.substring(9, 12), "");
  var building = course.buildingCode;
  var room = course.roomNum.replace(course.roomNum.substring(0, 3), "");
  var location = building + " " + room;

  if (course.onTuesday == true && course.onThursday == true) {
    course.tth = true;
  } else if (course.onMonday == true && course.onWednesday == true) {
    course.mw = true;
    if (course.onFriday == true)
      course.f = true;
  }

  currTime = startTime;
  changeCells(currTime, course, c, courseCode);
  changeCells(currTime, course, c, location);
  while (parseInt(currTime) <= endTime) {
    changeCells(currTime, course, c, courseCode, "");
  }
}

function showSchedule(student_courses) {
  var count = 0;
  var color = ["#EF4135", "#088099", "#55B31B", "#FDB913", "#003282"];

  student_courses.courses.forEach(function(course) {
    updateSchedule(course, color[count]);
    count++;
  })
}
