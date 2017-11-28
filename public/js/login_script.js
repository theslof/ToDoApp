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

    $.post('/login', {user: name, password: password}, function (data) {
        if(data.status == 0){
            if(remember)
                localStorage.setItem('loggedIn', 1);
            else
                sessionStorage.setItem('loggedIn', 1);
            window.location = '/';
        }else{
            $('p#response').text(data.message);
        }
    });

    return false;
}, false);


$(function () {
        if(localStorage.getItem('loggedIn') == 1 || sessionStorage.getItem('loggedIn') == 1){
            window.location.replace('/');
        }
    }
);