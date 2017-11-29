var connection = require('../connection');
var fs = require('fs');

function ToDoApp() {

    //Check if the user sent the correct login credentials
    this.verifyLogin = function (body, res) {

        // ---- Hard-coded user credentials ----
        var username = 'todoUser';
        var password = 'todoPassword';
        // -------------------------------------

        if (body.user == username && body.password == password) {
            res.send({status: 0, message: 'Login successful!'});
        } else {
            res.send({status: 1, message: 'Incorrect username or password!'});
        }
    };


    // ---- CRUD ----

    //Create
    this.createList = function (body, res) {
        connection.acquire(function (err, con) {
            con.query('INSERT INTO todolists SET ?', body, function (err, result) {
                con.release();
                if (err) {
                    console.log(err);
                    res.send({status: 1, message: 'TODO creation failed'});
                } else {
                    console.log('TODO created successfully');
                    res.send({status: 0, id: result.insertId, message: 'TODO created successfully'});
                }
            });
        });
    };

    this.createItem = function (body, res) {
        var itemText = body.itemText;
        var listId = body.list;
        console.log('text: ' + itemText + ', id: ' + listId);
        connection.acquire(function (err, con) {
            console.log('INSERT INTO todoitems (itemText, itemList, itemStatus) VALUES (\'' +
                itemText + '\', ' + listId + ', 1)');
            con.query('INSERT INTO todoitems (itemText, itemList, itemStatus) VALUES (?, ?, 1)', [itemText, listId],
                function (err, result) {
                    con.release();
                    if (err) {
                        console.log(err);
                        res.send({status: 1, message: 'Item creation failed'});
                    } else {
                        res.send({
                            status: 0,
                            id: result.insertId,
                            message: 'Create an item named ' + itemText + ' in list ' + listId
                        });
                    }
                });
        });
    };

    //Read
    this.getData = function (res) {
        var file;
        fs.readFile('data.json', function (err, data) {
            if (err) {
                return console.error(err);
            }
            file = data.toString();
            res.send(file);
        });
    };

    this.getLists = function (res) {
        //GET request for all lists
        connection.acquire(function (err, con) {
            con.query('SELECT * FROM todolists', function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.getAllItems = function (res) {
        //GET request for all lists and items
        connection.acquire(function (err, con) {
            con.query('SELECT listId,listTitle,itemId,itemText,statusName FROM todolists LEFT JOIN todoitems ON todolists.listId = todoitems.itemList LEFT JOIN todostatus ON todoitems.itemStatus = todostatus.statusId', function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.getListItems = function (id, res) {
        connection.acquire(function (err, con) {
            con.query('SELECT itemId,itemText,statusName FROM todolists JOIN todoitems ON todolists.listId = todoitems.itemList LEFT JOIN todostatus ON todoitems.itemStatus = todostatus.statusId WHERE todolists.listId = ?', id, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    //Update

    this.updateListName = function (listId, listTitle, res) {
        connection.acquire(function (err, con) {
            con.query('UPDATE todolists SET listTitle = ? WHERE listId = ?', [listTitle, listId], function (err, result) {
                con.release();
                if (err) {
                    console.log(err);
                    res.send({status: 1, message: 'List edit failed'});
                } else {
                    res.send({
                        status: 0,
                        message: 'Edited list name for ' + listId + ' to ' + listTitle
                    });
                }
            });
        });
    };

    this.updateItemText = function (id, text, res) {
        connection.acquire(function (err, con) {
            con.query('UPDATE todoitems SET itemText = ? WHERE itemId = ?', [text, id], function (err, result) {
                con.release();
                if (err) {
                    console.log(err);
                    res.send({status: 1, message: 'Item edit failed'});
                } else {
                    res.send({
                        status: 0,
                        message: 'Edited item text in ' + id + ' to ' + text
                    });
                }
            });
        });
    };

    this.updateItemStatus = function (id, statusName, res) {
        connection.acquire(function (err, con) {
            con.query('UPDATE todoitems SET itemStatus = (SELECT statusId FROM todostatus WHERE statusName = ?) ' +
                'WHERE itemId = ?', [statusName, id], function (err, result) {
                con.release();
                if (err) {
                    console.log(err);
                    res.send({status: 1, message: 'Item edit failed'});
                } else {
                    res.send({
                        status: 0,
                        message: 'Edited item status in ' + id + ' to ' + statusName
                    });
                }
            });
        });
    };

    //Delete

    this.deleteList = function (id, res) {
        //DELETE request for list id
        connection.acquire(function (err, con) {
            con.query('DELETE FROM todoitems WHERE itemList = ?', id, function (err, result) {
                if (err) {
                    con.release();
                    console.log(err);
                    res.send({status: 1, message: 'DELETE failed'});
                } else {
                    con.query('DELETE FROM todolists WHERE listId = ?', id, function (err, result) {
                        con.release();
                        if (err) {
                            console.log(err);
                            res.send({status: 1, message: 'DELETE failed'});
                        } else {
                            console.log('DELETE success');
                            res.send({status: 0, message: 'DELETE success'});
                        }
                    });
                }
            });
        });
    };

    this.deleteItem = function (id, res) {
        //DELETE request for item id
        connection.acquire(function (err, con) {
            con.query('DELETE FROM todoitems WHERE itemId = ?', id, function (err, result) {
                con.release();
                if (err) {
                    console.log(err);
                    res.send({status: 1, message: 'DELETE failed'});
                } else {
                    console.log('DELETE success');
                    res.send({status: 0, message: 'DELETE success'});
                }
            });
        });
    }
}

module.exports = new ToDoApp();