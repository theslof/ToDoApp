$(function () {

    $.ajax({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        }
    });

    var buildFromJSON = function (json) {
        debugLog(JSON.stringify(json));
        $.each(json, function (key, data) {
            var list = addList(data);
            if (data.itemId !== null)
                addItem(data, list);

        })
    };

    function loadServerData() {
        $.getJSON('/listsitems')
            .done(buildFromJSON).fail(function () {
            alert('Error!');
        })

    }

    loadServerData();
});

function addListEvent() {
    var details = {'listTitle': 'New List'};
    $.post('/list', details, function (data) {  // Use $.post() to send it
        if (data.status === 0) {
            addList({'listId': data.id, 'listTitle': details.listTitle});
        }
    });
}

function addItem(data, list) {
    if (
        data.itemId === undefined ||
        data.itemText === undefined ||
        data.statusName === undefined ||
        data.itemId === null
    ) {
        debugLog('Error adding item from data: ' + JSON.stringify(data));
        return;
    }

    debugLog(JSON.stringify(data) + ', ' + list.attr('id'));

    var last_li = list.children('ul').children().last();

    debugLog(JSON.stringify(last_li));

    var li = $(document.createElement('li'))
        .addClass('todoItem')
        .attr('id', 'item_' + data.itemId)
        .append(
            $(document.createElement('span'))
                .text(data.itemText),
            $(document.createElement('img'))
                .addClass('edit')
                .attr('src', 'img/cog.svg')
                .attr('alt', 'Edit')
                .click(function (event) {
                    var childNode = $(event.target).parent().next();
                    if (childNode.hasClass('config')) {
                        childNode.remove();
                        return;
                    }
                    var currentLi = $(event.target).parent();
                    var configLi = $(document.createElement('li')).addClass('config addNewItem');

                    configLi.insertAfter(currentLi);

                    var opt1 = $(document.createElement('option'))
                        .val('todo')
                        .text('Normal');
                    var opt2 = $(document.createElement('option'))
                        .val('priority')
                        .text('Urgent');
                    if (currentLi.hasClass('bold'))
                        opt2.attr('selected', 'selected');
                    var opt3 = $(document.createElement('option'))
                        .val('done')
                        .text('Done');
                    if (currentLi.hasClass('strike'))
                        opt3.attr('selected', 'selected');

                    configLi.append(
                        $(document.createElement('input'))
                            .attr('type', 'button')
                            .val('Rename')
                            .click(function () {
                                var newText = prompt('What do you change the text to?', currentLi.text());
                                if (newText != currentLi && newText != '' && newText != null) {
                                    $.ajax({
                                        url: '/item/name',
                                        type: 'PUT',
                                        data: {itemId: currentLi.attr('id').substr(5), itemText: newText},
                                        success: function (data) {
                                            debugLog('Server responded: ' + data.message);
                                            if (data.status === 0) {
                                                currentLi.children().first().text(newText);
                                            }
                                        }
                                    });
                                }
                            }),
                        $(document.createElement('input'))
                            .attr('type', 'button')
                            .val('Delete')
                            .click(function () {
                                var id = currentLi.attr('id').substr(5);
                                $.ajax({
                                    url: '/item/' + id,
                                    type: 'DELETE',
                                    success: function (data) {
                                        debugLog('Server responded: ' + data.message);
                                        if (data.status === 0) {
                                            configLi.remove();
                                            currentLi.remove();
                                        }
                                    }
                                });
                            }),
                        $(document.createElement('select'))
                            .change(function (event) {
                                var id = currentLi.attr('id').substr(5);
                                var status = $(event.target).val();
                                $.ajax({
                                    url: '/item/status',
                                    type: 'PUT',
                                    data: {itemId: id, statusName: status},
                                    success: function (data) {
                                        debugLog('Server responded: ' + data.message);
                                        if (data.status === 0) {
                                            currentLi.removeClass('bold strike');
                                            switch (status) {
                                                case 'priority':
                                                    currentLi.addClass('bold');
                                                    break;
                                                case 'done':
                                                    currentLi.addClass('strike');
                                                    break;
                                            }
                                        }
                                    }
                                });
                            })
                            .append(opt1, opt2, opt3)
                    );
                }));

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
    li.addClass(style);

    debugLog(last_li.prop('nodeName') + ', ' + last_li.className);

    last_li.before(li);
}


function addList(list) {
    if (
        list.listId === undefined ||
        list.listTitle === undefined
    ) {
        debugLog('Error adding list from data: ' + JSON.stringify(list));
        return;
    }

    var addButton = $('#addNewList');
    var article = $('#list_' + list.listId);

    if (article.attr('id') === undefined) {
        article = $(document.createElement('article'))
            .attr('id', 'list_' + list.listId)
            .addClass('grid-45 tablet-grid-45 mobile-grid-100 todoList')
            .append(
                $(document.createElement('h2'))
                    .addClass('listTitle')
                    .text(list.listTitle),
                $(document.createElement('img'))
                    .addClass('remove')
                    .attr('src', 'img/circle-with-cross.svg')
                    .attr('alt', 'Remove')
                    .click(removeList),
                $(document.createElement('img'))
                    .addClass('remove')
                    .attr('src', 'img/cog.svg')
                    .attr('alt', 'Edit')
                    .click(function () {
                        var newName = prompt('Enter a new list name:', article.children('h2').text());
                        $.ajax({
                            url: '/list',
                            type: 'PUT',
                            data: {listId: list.listId, listTitle: newName},
                            success: function (data) {
                                debugLog('Server responded: ' + data.message);
                                if (data.status === 0) {
                                    article.children('h2').text(newName);
                                }
                            }
                        });
                    }),
                $(document.createElement('ul'))
                    .append($(document.createElement('a'))
                        .click(addNewItem)
                        .append(
                            $(document.createElement('li'))
                                .addClass('addNewItem todoItem')
                                .text("Add new item...")
                        ))
            );

        article.insertBefore(addButton);

        if (article.prev().hasClass('todoList')) {
            $(document.createElement('div'))
                .addClass('clear hide-on-mobile')
                .insertBefore(addButton);
        }
    }

    return article;
}

function removeList(event) {
    var art = $(event.target).parent();
    var id = art.attr('id').substr(5);
    debugLog('Attempting to remove list_' + id);
    $.ajax({
        url: '/list/' + id,
        type: 'DELETE',
        success: function (data) {
            debugLog('Server responded: ' + data.message);
            if (data.status === 0) {
                fixLayout(art.next());
                art.remove();
            }
        }
    });
}

function fixLayout(element) {
    var nextElem = element.next();

    if (element.prop('nodeName') == 'DIV') {
        element.remove();
        fixLayout(nextElem);
        $(document.createElement('div'))
            .addClass('clear hide-on-mobile')
            .insertAfter(nextElem);
    } else if (element.prop('nodeName') == 'ARTICLE') {
        fixLayout(nextElem);
    }
}

function addNewItem(event) {
    event.preventDefault();
    var addText = $(event.target);
    debugLog('Clicked on Add Item for ' + addText.closest('article').attr('id'));
    addText.hide();
    addText.parent().parent().append(
        $(document.createElement('form'))
            .submit(function (event) {
                event.preventDefault();
                var text = $(event.target).children('.addItemField').first().val();
                var id = $(event.target).closest('article').attr('id').substr(5);
                debugLog('text: ' + text + ', id: ' + id);
                $.post('/item', {itemText: text, list: id}, function (data) {
                    debugLog('id: ' + data.id + ', message: ' + data.message);
                    $(event.target).closest('form').remove();
                    addText.show();
                    debugLog('Adding item to list: ' + addText.closest('article').attr('id'));
                    addItem({itemId: data.id, itemText: text, statusName: 'todo'}, addText.closest('article'));
                });
            })
            .append(
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
}

function debugLog(string) {
    console.log(string);
}