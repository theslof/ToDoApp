var todo = require('./api/todoapp');

module.exports = {
    configure: function (app) {

        //CRUD

        //Create
        app.post('/list', function (req, res) {
            //POST request to create a new list
            todo.createList(req.body, res);
        });

        app.post('/item', function (req, res) {
            //POST request to create a new item
            todo.createItem(req.body, res);
        });

        //Read
        app.get('/data', function (req, res) {
            todo.getData(res);
        });

        app.get('/lists', function (req, res) {
            //GET request for all lists
            todo.getLists(res);
        });

        app.get('/listsitems', function (req, res) {
            //GET request for all lists
            todo.getAllItems(res);
        });

        app.get('/list/:id', function (req, res) {
            //GET request for all items in list :id
            todo.getListItems(req.params.id, res);
        });

        app.get('/item/:id', function (req, res) {
            //GET request for information about item :id
            res.send('Return data about item ' + req.params.id);
        });

        //Update
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
            todo.deleteItem(req.params.id, res);
        });

        app.delete('/list/:id', function (req, res) {
            //DELETE request for list :id
            todo.deleteList(req.params.id, res);
        })
    }
};