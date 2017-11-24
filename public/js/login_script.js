var name, password, remember;

var loginForm = document.getElementById('loginForm');
var loginName = document.getElementById('name');
var loginPassword = document.getElementById('password');
var loginRemember = document.getElementById('rememberMe');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    name = loginName.value;
    password = loginPassword.value;
    remember = loginRemember.value;

    return false;
}, false);