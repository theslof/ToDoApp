var connection = require('../connection');
var fs = require('fs');

function ToDoApp() {
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
        res.send('Create an item named ' + itemText + ' in list ' + listId);
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

    this.getListItems = function (id, res){
        connection.acquire(function (err, con) {
            con.query('SELECT itemId,itemText,statusName FROM todolists JOIN todoitems ON todolists.listId = todoitems.itemList LEFT JOIN todostatus ON todoitems.itemStatus = todostatus.statusId WHERE todolists.listId = ?', id, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    /*      //Update
            app.put('/list', function (req, res) {
                //PUT request for updating list
                var listId = req.body.listId;
                var listTitle = req.body.listTitle;
                res.send('Update list ' + listId + ' with title ' + listTitle);
            });

            app.put('/item', function (req, res) {
                //PUT request to update item text
                var itemId = req.body.itemId;
                var itemText = req.body.itemText;
            });

            //Delete
            app.delete('/item/:id', function (req, res) {
                //DELETE request for item :id
                res.send('Delete item ' + req.params.id);
            });
*/
    this.deleteList = function (id, res) {
        //DELETE request for list id
        connection.acquire(function (err, con) {
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