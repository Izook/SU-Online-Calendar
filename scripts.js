$(document).ready(function () {
  $("#submitHide").unbind('click');
  $("#submitHide").on('click', function() {
    var username = $("#userNameInput").val();
    var password = $("#passWordInput").val();
    requestScheduleJSON(username,password);
  });
})

function clear() {
  document.getElementsByTagName('td').backgroundColor = #ffffff;
}

function changeColor(course, c) {
  var scheduleBody = document.getElementById("schedule-body");

  var courseCode = course.code.replace(course.code.substring(9, 12), "");
  var building = course.buildingCode;
  var room = course.roomNum.replace(course.roomNum.substring(0, 3), "");
  var location = building + " " + room;
  var start = course.startTimeMilitary;
  var end = course.endTimeMilitary;
  courses.forEach(function(course) {
    if (course.onTuesday == true && course.onThursday == true) {
      course.tth = true;
    } else if (course.onMonday == true && course.onWednesday == true) {
      course.mw = true;
      if (course.onFriday == true) {
        course.f = true;
      }
    }
  })

  for course in courses {
    currTime = start;
    for (currTime <= end {
      row = document.getElementById(currTime);
      if (course.mw) {
        row[1].style.color = c;
        row[3].style.color = c;
        if (course.f) {
          row[5].style.color = c;
        }
      } else if (course.tth) {
        row[2].style.color = c;
        row[4].style.color = c;
      }
      currTime = (parseInt(currTime) + 100).toString();
    }
  }
}

function showSchedule(student_courses) {
  clear();

  var count = 0;
  var color = ["#EF4135", "#088099", "#55B31B", "#FDB913", "#003282"];

  student_courses.courses.forEach(function(course) {
    changeColor(course, color[count]);
    count++;
  })
}
