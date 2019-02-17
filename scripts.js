function getLogin() {
  var username = document.getElementById('text').type
  var pass = document.getElementById('password').type
}

function switchVisible() {
  if (document.getElementById('login')) {
    if (document.getElementById('login').style.display == 'none') {
      document.getElementById('login').style.display = 'block'
      document.getElementById('schedule').style.display = 'none'
    } else {
      document.getElementById('login').style.display = 'none'
      document.getElementById('schedule').style.display = 'block'
    }
  }
}

function myFunction() {
  var x = document.getElementById('quarters').value
}
