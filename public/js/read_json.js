var left = true;

$(function () {

    $.ajax({
        beforeSend: function (xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        }
    });

    var loadFromJSON = function (data) {
        var container = document.getElementById('listContainer');
        for (var i in data) {
            var list = data[i];

            var article = document.createElement('article');
            article.className = 'grid-30 tablet-grid-45 mobile-grid-100 todoList';

            var header = document.createElement('h2');
            header.className = 'listTitle';
            header.textContent = list.title;
            article.appendChild(header);

            var ul = document.createElement('ul');
            article.appendChild(ul);

            for (var j in list.items) {
                var item = list.items[j];
                var li = document.createElement('li');
                li.className = 'todoItem';
                for (var k in item.style) {
                    li.className += ' ' + item.style[k];
                }
                li.textContent = item.text;
                ul.appendChild(li);
            }

            container.appendChild(article);

            var div = document.createElement('div');
            div.className = 'grid-5 tablet-grid-5 hide-on-mobile';
            div.appendChild(document.createElement('p'));

            container.appendChild(div);
        }
    };

    var buildFromJSON = function (json) {
        $.each(json, function (key, data) {
            var list = addList(data);
            if (data.itemId !== null)
                addItem(data, list);

        })
    };

    function loadJSONData() {
        $.getJSON('data/data.json')
            .done(loadFromJSON).fail(function () {
            alert('Error!');
        });
    }

    function loadServerData() {
        $.getJSON('/listsitems')
            .done(buildFromJSON).fail(function () {
            alert('Error!');
        })

    }

//    loadJSONData();
    loadServerData();
});

function addListEvent() {
    var details = {'listTitle': 'New List'};
    $.post('/list', details, function (data) {  // Use $.post() to send it
        if (data.status === 0) {
            var art = addList({'listId': data.id, 'listTitle': details.listTitle});
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
        console.log('Error adding item from data: ' + JSON.stringify(data));
        return;
    }

    var ul = list.children('ul');

    var li = $(document.createElement('li'))
        .addClass('todoItem')
        .attr('id', 'item_' + data.itemId)
        .text(data.itemText);

    var style = '';
    switch (data.statusName){
        case 'priority':
            style = 'bold';
            break;
        case 'done':
            style = 'strike';
            break;
        default:
    }
    li.addClass(style);

    ul.append(li);
}


function addList(list) {
    if (
        list.listId === undefined ||
        list.listTitle === undefined
    ) {
        console.log('Error adding list from data: ' + JSON.stringify(list));
        return;
    }

    var addButton = $('#addNewList');
    var article = $('#list_' + list.listId);
    var ul;

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
//                    .attr('onclick', 'removeList(\'' + list.listId + '\')')
            );
        article.click(removeList);

        article.insertBefore(addButton);

        if (left) {
            $(document.createElement('div'))
                .addClass('grid-5 tablet-grid-5 hide-on-mobile')
                .append($(document.createElement('p')))
                .insertBefore(addButton);
            left = false;
        } else {
            $(document.createElement('div'))
                .addClass('clear hide-on-mobile')
                .insertBefore(addButton);
            left = true;
        }


        ul = $(document.createElement('ul'));
        article.append(ul);
    } else {
        ul = article.children('ul');
    }

    return article;
}

function removeList(event) {
    var art = $(event.target).parent();
    var id = art.attr('id').substr(5);
    console.log('Attempting to remove list_' + id);
    $.ajax({
        url: '/list/' + id,
        type: 'DELETE',
        success: function (data) {
            console.log('Server responded: ' + data.message)
            if (data.status === 0) {
//                console.log(art.next().);

                art.next().remove();
                art.remove();
                console.log('Removing element from DOM');
            }
        }
    });
}