var express = require('express');
var bodyparser = require('body-parser');
var routes = require('./routes');
var connection = require('./connection');

var app = express();
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

connection.init();
routes.configure(app);

app.use(express.static('public'));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});