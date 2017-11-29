// Add buttons for selecting theme.

$(function () {
    var theme = localStorage.getItem('theme');

    var elP = document.getElementById('theme');

    if(theme == 'dark'){
        elP.innerHTML = '<a onclick="localStorage.setItem(\'theme\', \'light\'); window.location.reload();">Light</a> | Dark';
    }else{
        elP.innerHTML = 'Light | <a onclick="localStorage.setItem(\'theme\', \'dark\'); window.location.reload();">Dark</a>';
    }
});