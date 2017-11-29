//Auto-run function that checks login status and fetches SQL data
$(function () {

    //Check localStorage for login status, redirect to login site if not logged in.
    if (!(localStorage.getItem('loggedIn') == 1) && !(sessionStorage.getItem('loggedIn') == 1)) {
        window.location.replace('/login.html');
    }

    $.ajax({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        }
    });

    //Render page based on JSON data
    var buildFromJSON = function (json) {
        //Print data to log for debug purposes
        debugLog(JSON.stringify(json));

        //For each object in the JSON blob (one object for each item),
        $.each(json, function (key, data) {
            //Create a list and attach it to the page,
            //returns a reference if list already exists
            var list = addList(data);

            //and attach any items to list if they exist
            if (data.itemId !== null)
                addItem(data, list);

        })
    };

    //Query server for data
    function loadServerData() {
        //Get all lists and items, render page if no errors
        $.getJSON('/listsitems')
            .done(buildFromJSON).fail(function () {
            alert('Error!');
        })

    }

    loadServerData();
});


//Functions that build the HTML elements from data,
//both during page load as well as user input.

// Add a new list
function addList(list) {
    // Abort if required data is missing
    if (
        list.listId === undefined ||
        list.listTitle === undefined
    ) {
        debugLog('Error adding list from data: ' + JSON.stringify(list));
        return;
    }

    // If the list title is blank, create a placeholder title so the user have something to click.
    if (list.listTitle == '')
        list.listTitle = 'No Title';

    // Find the Add New List button, we will insert the list before it.
    var addButton = $('#addNewList');

    // Look for an existing list matching this list ID,
    var article = $('#list_' + list.listId);

    //only create a new list if it does not already exist.
    if (article.attr('id') === undefined) {
        article = $(document.createElement('article'))
            .attr('id', 'list_' + list.listId)
            .addClass('grid-45 tablet-grid-45 mobile-grid-100 todoList')
            .append(
                // Add a title with the correct list name
                $(document.createElement('h2'))
                    .addClass('listTitle')
                    .text(list.listTitle)
                    // Add an event on click for renaming the list.
                    .click(function (event) {
                        var h2 = $(event.target);
                        var newName = prompt('Enter a new list name:', h2.text());
                        if (newName != null && newName != '' && newName != h2.text()) {
                            $.ajax({
                                url: '/list',
                                type: 'PUT',
                                data: {listId: list.listId, listTitle: newName},
                                success: function (data) {
                                    debugLog('Server responded: ' + data.message);
                                    if (data.status === 0) {
                                        h2.text(newName);
                                    }
                                }
                            });
                        }
                    }),
                // Add a remove button
                $(document.createElement('img'))
                    .addClass('remove')
                    .attr('src', 'img/circle-with-cross.svg')
                    .attr('alt', 'Remove')
                    .click(function () {
                            var id = article.attr('id').substr(5);
                            debugLog('Attempting to remove list_' + id);
                            $.ajax({
                                url: '/list/' + id,
                                type: 'DELETE',
                                success: function (data) {
                                    debugLog('Server responded: ' + data.message);
                                    if (data.status === 0) {
                                        // If server reports that delete was successful,
                                        // fix the layout and remove the element.
                                        fixLayout(article.next());
                                        article.remove();
                                    }
                                }
                            });
                        }
                    ),
                // Add the ul element
                $(document.createElement('ul'))
                    .append(
                        $(document.createElement('li'))
                            .addClass('addNewItem todoItem')
                            .append($(document.createElement('a'))
                                .text("Add new item...")
                                .click(function addNewItem(event) {
                                    // Called by clicking the Add New Item text
                                    event.preventDefault();

                                    // Remove any config class elements
                                    $('.config').remove();

                                    var addText = $(event.target);
                                    debugLog('Clicked on Add Item for ' + article.attr('id'));
                                    addText.hide();
                                    // Create a form for adding a new item
                                    article.find('ul').append(
                                        $(document.createElement('form'))
                                            .submit(function (event) {
                                                event.preventDefault();
                                                // On form submit, check if text is valid and create a new item.
                                                var form = $(event.target);
                                                var text = form.find('.addItemField').val();
                                                var id = article.attr('id').substr(5);
                                                if(text == '' || text == null)
                                                    return;
                                                debugLog('text: ' + text + ', id: ' + id);
                                                $.post('/item', {itemText: text, list: id}, function (data) {
                                                    debugLog('id: ' + data.id + ', message: ' + data.message);
                                                    form.remove();
                                                    addText.show();
                                                    debugLog('Adding item to list: ' + addText.closest('article').attr('id'));
                                                    addItem({
                                                        itemId: data.id,
                                                        itemText: text,
                                                        statusName: 'todo'
                                                    }, addText.closest('article'));
                                                });
                                            })
                                            .append(
                                                // Add the input field as well as Add and Cancel buttons
                                                $(document.createElement('input'))
                                                    .addClass('addItemField')
                                                    .attr('type', 'text')
                                                    .attr('placeholder', 'Text'),
                                                $(document.createElement('input'))
                                                    .attr('type', 'submit')
                                                    .val('Add'),
                                                $(document.createElement('input'))
                                                    .attr('type', 'button')
                                                    .val('Cancel')
                                                    .click(function (event) {
                                                        $(event.target).closest('form').remove();
                                                        addText.show();
                                                    })
                                            )
                                    )
                                })
                            ))
            )
            // Insert the new list before the add-button
            .insertBefore(addButton);

        // To get a consistent layout, insert an Unsemantic layout fix div after every second list.
        if (article.prev().hasClass('todoList')) {
            $(document.createElement('div'))
                .addClass('clear hide-on-mobile')
                .insertBefore(addButton);
        }
    }

    // Return a reference to the list
    return article;
}

//Add an item (li) to a list (ul inside an article)
function addItem(data, list) {
    //Check that all necessary data exists
    if (
        data.itemId === undefined ||
        data.itemText === undefined ||
        data.statusName === undefined ||
        data.itemId === null
    ) {
        debugLog('Error adding item from data: ' + JSON.stringify(data));
        return;
    }

    // If item text is blank, add placeholder text.
    // This is to ensure that the user can always click on an item to edit or remove it.
    if (data.itemText == '')
        data.itemText = 'No Text';

    debugLog('Adding item: ' + JSON.stringify(data) + ' to list: ' + list.attr('id'));

    // Find the "Add new item" li. New items will be inserted before this.
    var last_li = list.find('.addNewItem');

    debugLog(JSON.stringify(last_li));

    // Add relevant classes to item based on style.
    var style = '';
    switch (data.statusName) {
        case 'priority':
            style = 'bold';
            break;
        case 'done':
            style = 'strike';
            break;
        default:
    }

    // Do some intricate DOM manipulation, this should have been trimmed.
    // Start with a new li-tag.
    var li = $(document.createElement('li'))
        .addClass('todoItem')
        .attr('id', 'item_' + data.itemId)
        .text(data.itemText)
        .addClass(style)
        // When clicked the li-tag should display buttons to edit/remove item.
        .click(function () {
            // Check if the element after our li is a config class element,
            // meaning we already have an active config element for this tag.
            var hasConfig = li.next().hasClass('config');

            // Hide all config class elements
            $('.config').remove();
            // If this li had an active config class element, exit the function. We do not want to show it again.
            if (hasConfig)
                return;

            // Create a new li with the config class and insert it after the active li.
            // This is where we will house edit/delete buttons.
            var configLi = $(document.createElement('li')).addClass('config');
            configLi.insertAfter(li);

            // Create three options for our selection menu, with values matching SQL and readable names.
            // If the active li has a atching class, set that option as selected.
            var opt1 = $(document.createElement('option'))
                .val('todo')
                .text('Normal');
            var opt2 = $(document.createElement('option'))
                .val('priority')
                .text('Urgent');
            if (li.hasClass('bold'))
                opt2.attr('selected', 'selected');
            var opt3 = $(document.createElement('option'))
                .val('done')
                .text('Done');
            if (li.hasClass('strike'))
                opt3.attr('selected', 'selected');

            // Create and append the buttons to the config class li.
            configLi.append(
                // Rename button
                $(document.createElement('input'))
                    .attr('type', 'button')
                    .val('Rename')
                    .click(function () {
                        // The rename button results in a popup input box and attempts to change the text if it's not
                        // blank, null or matching the original.
                        var newText = prompt('What do you change the text to?', li.text());
                        if (newText != li.text() && newText != '' && newText != null) {
                            $.ajax({
                                url: '/item/name',
                                type: 'PUT',
                                data: {itemId: li.attr('id').substr(5), itemText: newText},
                                success: function (data) {
                                    debugLog('Server responded: ' + data.message);
                                    if (data.status === 0) {
                                        li.text(newText);
                                    }
                                }
                            });
                        }
                    }),
                // Delete button
                $(document.createElement('input'))
                    .attr('type', 'button')
                    .val('Delete')
                    .click(function () {
                        var id = li.attr('id').substr(5);
                        $.ajax({
                            url: '/item/' + id,
                            type: 'DELETE',
                            success: function (data) {
                                debugLog('Server responded: ' + data.message);
                                if (data.status === 0) {
                                    configLi.remove();
                                    li.remove();
                                }
                            }
                        });
                    }),
                // Change item status menu
                $(document.createElement('select'))
                    .change(function (event) {
                        // If the user selects another status, tell the server to change it.
                        var id = li.attr('id').substr(5);
                        // Check what the selected status is,
                        var status = $(event.target).val();
                        $.ajax({
                            url: '/item/status',
                            type: 'PUT',
                            data: {itemId: id, statusName: status},
                            success: function (data) {
                                debugLog('Server responded: ' + data.message);
                                if (data.status === 0) {
                                    // Remove all status classes and apply relevant class.
                                    li.removeClass('bold strike');
                                    switch (status) {
                                        case 'priority':
                                            li.addClass('bold');
                                            break;
                                        case 'done':
                                            li.addClass('strike');
                                            break;
                                    }
                                }
                            }
                        });
                    })
                    .append(opt1, opt2, opt3)
            );
        })
        // Insert the new li before the "Add new item" text.
        .insertBefore(last_li);
}

// This is called whenever the user clicks the plus-button to add a new list.
// It adds a new empty list called "New List"
function addListEvent() {
    var details = {'listTitle': 'New List'};
    $.post('/list', details, function (data) {  // Use $.post() to send it
        if (data.status === 0) {
            addList({'listId': data.id, 'listTitle': details.listTitle});
        }
    });
}

// This function will loop through all elements following the argument element and
// move any layout fix divs one step down in the order, necessary after list deletion.
// This is recursive and does the actual layout fixes when bubbling up.
function fixLayout(element) {
    var nextElem = element.next();

    // If the current element is a fix div, fix next element and on bubbling back move the fix div after next element.
    if (element.hasClass('clear')) {
        fixLayout(nextElem);
        element.insertAfter(nextElem);
    }
    // If the element is a todoList, just skip it
    else if (element.hasClass('todoList')) {
        fixLayout(nextElem);
    }
    // If the element is the Add New List button, nuke all following clear divs.
    else if (element.attr('id') == 'addNewList') {
        element.nextAll('.clear').remove();
    }
}

// Debug function. Will be ignored as long as the line is commented; uncomment to re-enable debug strings.
function debugLog(string) {
//    console.log(string);
}

// Called by the Log Out button, sets login-variables in localStorage to 0 and redirects browser to the login page.
function logOut() {
    localStorage.setItem('loggedIn', 0);
    sessionStorage.setItem('loggedIn', 0);
    window.location.href = '/login.html';
}