$(document).ready(function () {
  $("#submitHide").click(function() {
      $("#login-title").hide();
      $("#login-page").hide();
      $("#calendar-title").show();
      $("#schedule-page").show();
  });
})

function changeColor(cell) {
  var i;
  for (i = 0; i < cell.length; i++) {
    cell[i].style.color = '#EF4135'
    //BLUE #088099
    //GREEN #55B31B
    //YELLOW #FDB913
    //NAVY #003282
  }
}

function showSchedule() {

}
