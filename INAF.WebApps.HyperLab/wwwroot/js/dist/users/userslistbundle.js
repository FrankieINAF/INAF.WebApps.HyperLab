var addButtonId = 'buttonAddUser';
var deletedPersonId;
var lastLoadedPersonId = 0;
var defaultDetailsPosition;

function addUser() {
    loadPartialView(UrlUpsertUser);
    updateMenuActiveItemProcedureByUrl(UrlUpsertUser);
}

/* ################################################################################ */
/* ADD BUTTONS */
/* ################################################################################ */

async function tryAddButtons() {
    await tryInsertAddUserButtonAsync();  
}

async function tryInsertAddUserButtonAsync() {
    let isAllowed = await doAjaxGetNoModelAsync(UrlIsUpsertUserPermissionGranted);
    if (isAllowed)
        addAddUserButton();
}

function addAddUserButton() {
    addButton(addButtonId, AddUserTitle, 'mif-plus', addUser);
}

/* ################################################################################ */
/* USERS LIST */
/* ################################################################################ */
async function loadUsersAsync() {
    let obj = await doAjaxGetNoModelAsync(UrlGetUsersList);

    if (obj && obj.length > 0) {
        initDictionary();
        buildList(obj, 'contactsListUl', 'usersList', 'person', getPersonDataFunction, getElemsFunction, setDictionaryElementFunction);
        buildFirstLettersGrid(conditionFunction);
        addEventsToList('usersList', 'contactsCol', 'editPersonForm', 'person', loadUserDetails, 'PersonId', deletePersonProcedure);
    } else {
        showSimpleDialog(WARNING_LABEL, NoUsersFoundMessage, WARNING);
    }
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
function clearSearchboxProcedure() {
    clearSearchbox('searchbox', 'usersList');
}

function doSearchProcedure() {
    doSearch('searchbox', 'usersList');
}

/* ##################################################################################  */
/* CONTROLLER OPERATION STATUS */
/* ##################################################################################  */
function showControllerOperationStatusMessage() {
    if (controllerOperationStatus == CONTROLLER_OPERATION_OK && controllerOperationMessage) {
        showSimpleDialog(INFO_LABEL, controllerOperationMessage, SUCCESS);
    }
}

/* ##################################################################################  */
/* USERS LIST EVENTS */
/* ##################################################################################  */
//function addEventsToUsersList(mainListName, formName) {
//    $('.alphabet').on('click', function (e) {
//        //e.preventDefault();
//        $(`#${mainListName}`).css({ opacity: 0 });
//        $(`#${mainListName}`).css({ transition: TRANSITION_SHORTHAND });
//        $(`#${mainListName}`).css({ transform: 'scale3d(0.25, 0.25, 1)' });

//        $('#lettersGrid').height($(`#${mainListName}`).height());
//        $('#lettersGrid').width($(`#${mainListName}`).width());
//        $("#lettersGrid").css({ top: 40 + 'px', left: 12 + 'px', position: 'absolute' });
//        $("#lettersGrid").css('width', '100%');
//        $("#lettersGrid").css('display', 'block');
//        $("#lettersGrid").css('opacity', '1');
//        $("#lettersGrid").css({ transition: TRANSITION_SHORTHAND });
//        $("#lettersGrid").css({ transform: 'scale3d(1, 1, 1)' });
//    });

//    /* handle selection of letter from alphabet grid */
//    $('.letter').on('click', function () {
//        $("#lettersGrid").css({ opacity: 0 });
//        $("#lettersGrid").css({ transition: TRANSITION_SHORTHAND });
//        $("#lettersGrid").css({ transform: 'scale3d(2, 2, 1)' });
//        setTimeout(function () {
//            $("#lettersGrid").css('display', 'none');
//        }, TRANSITION_DURATION);

//        $(`#${mainListName}`).css({ opacity: 1 });
//        $(`#${mainListName}`).css({ transition: TRANSITION_SHORTHAND });
//        $(`#${mainListName}`).css({ transform: 'scale3d(1, 1, 1)' });

//        var elemId = this.id.replace("grid", "");
//        var elementTop = document.getElementById(elemId).offsetTop;
//        var divTop = document.getElementById(mainListName).offsetTop;
//        var elementRelativeTop = elementTop - divTop;
//        $("#contactsCol").scrollTo(elementRelativeTop, 800);
//    });

//    /* handle contact selection */
//    $('[id^=person]').on('click', function (e) {
//        console.log(e.currentTarget.id);
//        var elemId = e.currentTarget.id;
//        var personId = elemId.replace("person", "");
//        loadPersonData(personId);
//    });

//    /* create context menu on selected person */
//    $.contextMenu({
//        id: 'contextMenu',
//        selector: '.context-menu-one',
//        autoHide: true,
//        build: function ($trigger, e) {
//            //console.log(e);
//            //console.log(e.currentTarget.id)
//            currentContextMenuTargetId = e.currentTarget.id.replace("person", "");
//        },
//        callback: function (key, options) {
//            //console.log(key);
//            var personId = options.$trigger[0].id.replace('person', '');
//            var name = options.$trigger[0].textContent;
//            letter = name.charAt(0).toUpperCase();
//            if (key == 'edit') {
//                $('#PersonId').val(personId);
//                $(`#${formName}`).submit();
//            } else if (key == 'delete') {
//                deletePersonProcedure(personId)
//            }
//        },
//        items: {
//            "edit": { name: EditLabel, icon: "mif-pencil" },
//            "delete": { name: DeleteLabel, icon: "mif-trash" },
//        }
//    });
//}

function getElemsFunction(obj, i) {
    return obj.filter(x => x.Name.charAt(0).toUpperCase() === dictionary[i].firstLetter);
}

function getPersonDataFunction(elems, j) {
    return `${elems[j].Name} ${elems[j].LastName}`;
}

/* ################################################################################ * /
/* SELECTED USER */
/* ################################################################################ */
/* load details */
function clearUserDetails(isMobile) {
    if (!isMobile) {
        setTimeout(function () {
            $('#selectedUserContainer').empty();
            $('#cardContainer').addClass('user-details');
            $('#cardContainer').removeClass('bg-white');
        }, DEFAULT_TIMEOUT_FOR_ANIMATE);
    } else {
        setTimeout(function () {
            $('#selectedUserContainer').empty();
            $('#cardContainer').removeClass('bg-white');
            $('#cardContainer').css({ position: 'relative', top: defaultDetailsPosition.top + 'px' });
        }, DEFAULT_TIMEOUT_FOR_ANIMATE);
    }
}

function closeUserDetails() {
    lastLoadedPersonId = null;

    if (!isMobile()) {
        animateCSS('cardContainer', 'slideOutRight', clearUserDetails(false));
    } else {
        animateCSS('cardContainer', 'slideOutDown', clearUserDetails(true));
    }
}

function loadUserDetails(personId) {
    if (lastLoadedPersonId == personId)
        return;

    var model = {
        Id: personId
    };

    loadPartialViewWithAjaxGet(UrlGetUserDetails, model, 'selectedUserContainer', loadUserDetailsCallback('cardContainer'));

    lastLoadedPersonId = personId;
}

function loadUserDetailsCallback(target) {
    loadPartialViewCallback(target, 'user-details');
}

/* edit user */
function callEditUser() {
    //$('#EditUserId').val(lastLoadedPersonId);
    //$('#editUserForm').submit();
    var model = {
        Id: lastLoadedPersonId
    };

    loadPartialViewWithAjaxPost(UrlEditUser, model, 'renderbody');
}

/* ################################################################################ */
/* DELETE PERSON */
/* ################################################################################ */
function deletePersonProcedure(personId) {
    var title = PersonManagementTitle;
    var message = PersonDeletionQuestion;
    confirmAndExecute(title, message, deletePersonAsync, personId);
}

async function deletePersonAsync(personId) {

    setLoadingCircleIsVisible(true);

    var model = {
        Id: parseInt(personId)
    };

    deletedPersonId = personId;

    let result = await doAjaxPostAsync(UrlDeleteUser, model, deletePersonCallback);
    if (result) {
        deletePersonCallback(result);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DeletePersonErrorMessage, ALERT);
    }
}

function deletePersonCallback(obj) {
    if (obj.IsOk) {
        $(`#person${deletedPersonId}`).remove();
        $('#selectedUserContainer').empty();
        $('#cardContainer').addClass('user-details');
        tryRemoveLetterFromList(deletedPersonId);
        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DeletePersonErrorMessage, ALERT);
    }
}

//function handleDeletedPerson(personId) {
//    try {
//        var index = dictionary.findIndex(x => x.firstLetter === letter);

//        var dictionaryLen = dictionary.length;
//        for (var i = 0; i < dictionaryLen; i++) {
//            var userIndex = dictionary[index].users.findIndex(x => x.Id === personId);
//            if (userIndex > 0) {
//                /* remove user */
//                dictionary[i].items.splice(userIndex, 1);
//                /* if no more users are present for this firstLetter, then remove separator */
//                if (dictionary[i].items.length == 0) {
//                    $(`#letter${firstLetter}`).remove();
//                }
//                break;
//            }
//        }
//    } catch (e) {
//        console.log(`handleDeletedPerson: ${e}`);
//    }
//}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(document).ready(function () {    
    loadUsersAsync();

    /* show message about upsert operation, if required */
    showControllerOperationStatusMessage();

    /* actions shorcuts */
    tryAddButtons();

    addReturnListenerToElem('searchbox', doSearchProcedure);
});

$(document).on('beforeunload', function () {
    animateCSS(`${addButtonId}`, `bounceOutDown`, FAST);
    $(`#${addButtonId}`).remove();
});
var letter;
var dictionary = [];
var alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

/* ################################################################################ */
/* DICTIONARY */
/* ################################################################################ */
function conditionFunction(elem) {
    return (elem.items && elem.items.length > 0);
}

function getDictionaryElementIndex(letter) {
    return dictionary.findIndex(x => x.firstLetter === letter);
}

function tryRemoveLetterFromList(itemId) {
    try {
        var index = -1;
        
        /* if first-letter is not defined (it is defined when using context-menu, e.g. for users), then we have to find it */
        if (!letter) {
            var itemsNum = dictionary.length;
            for (var i = 0; i < itemsNum; i++) {
                let itemIndex = dictionary[i].items.findIndex(x => x.Id == itemId);
                //console.log(`${dictionary[i].firstLetter} - itemIndex: ${itemIndex}`);
                if (itemIndex > -1)
                {
                    letter = dictionary[i].firstLetter;
                    //console.log(`FOUND letter ${letter}!`);
                    break;
                }
            }
        }


        index = dictionary.findIndex(x => x.firstLetter === letter);

        var userIndex = dictionary[index].items.findIndex(x => x.Id === itemId);
        if (userIndex > -1) {
            /* remove user */
            dictionary[i].items.splice(userIndex, 1);
            /* if no more items are present for this firstLetter, then remove separator */
            if (dictionary[i].items.length == 0) {
                $(`#letter${letter}`).remove();
            }
        }
    } catch (e) {
        console.log(`${tryRemoveLetterFromList}: ${e}`);
    }
}

function initDictionary() {
    var lettersNum = alphabet.length;
    for (var i = 0; i < lettersNum; i++) {
        var firstLetter = alphabet[i].toUpperCase();
        elem = initDictionaryElement(firstLetter);
        dictionary.push(elem);
    }
}

function initDictionaryElement(firstLetter) {
    return {
        firstLetter: firstLetter,
        items: []
    };
}

function setDictionaryElementFunction(index, elems) {
    dictionary[index].items = elems;
}

/* ################################################################################ */
/* GRID */
/* ################################################################################ */
function buildFirstLettersGrid(conditionFunction) {
    var rowsNum = 5;
    var lettersNumPerRow = 6;
    var text = '';
    var counter = 0;
    for (var i = 0; i < rowsNum; i++) {
        if (counter == alphabet.length)
            break;

        text += '<div class="row">';
        for (var j = 0; j < lettersNumPerRow; j++) {
            if (counter == alphabet.length)
                break;

            text += '<div class="cell-fs-2 cell-sm-2">';
            var elem = dictionary.find(x => x.firstLetter === alphabet[counter]);
            if (conditionFunction(elem)) {
                //if (elem.users && elem.users.length > 0) {
                text += `<span id="letter${alphabet[counter]}grid" class="letter">${alphabet[counter]}</span>`;
            } else {
                text += `<span id="letter${alphabet[counter]}grid" class="letterNotAvailable">${alphabet[counter]}</span>`;
            }
            text += '</div>';
            counter++;
        }
        text += '</div>';
    }

    $('#lettersList').html(text);
}

/* ################################################################################ */
/* LIST */
/* ################################################################################ */
function buildList(obj, ulId, listId, elemPrefix, getElemDataFunction, getElemsFunction, setDictionaryElementFunction) {
    var lettersNum = alphabet.length;

    var text = '';
    text += `<ul id="${ulId}" data-role="listview" style="width:100%; margin-left:10px">`;
    for (var i = 0; i < lettersNum; i++) {
        var firstLetter = dictionary[i].firstLetter;

        var elems = getElemsFunction(obj, i);
        //var elems = obj.filter(x => x.Name.charAt(0).toUpperCase() === dictionary[i].firstLetter);
        if (elems && elems.length > 0) {
            text += `<li class="alphabet jarvis-bg" id="letter${firstLetter}">${firstLetter}</li>`;

            /* create and save list of elems for current first letter */
            var index = getDictionaryElementIndex(dictionary[i].firstLetter);
            setDictionaryElementFunction(index, elems);

            /* build list of elems for current first letter */
            elemsNum = elems.length;
            for (j = 0; j < elemsNum; j++) {
                var elemData = getElemDataFunction(elems, j);
                text += getListItem(elemPrefix, elems[j].Id, elemData)
            }
        }
    }
    text += '</ul>';

    $(`#${listId}`).html(text);

    $(`#${listId}`).data('list');
}

function getListItem(elemPrefix, id, elemData) {
    return `<li id="${elemPrefix}${id}" class="context-menu-one" data-caption="${elemData}"></li>`;
}

/* ################################################################################ */
/* EVENTS FOR LIST + CONTEXT-MENU */
/* ################################################################################ */
function addEventToListItem(elemIdPrefix, loadDataFunction) {
    $(`[id^=${elemIdPrefix}]`).on('click', function (e) {
        //console.log(e.currentTarget.id);
        var elemId = e.currentTarget.id;
        var elemIdValue = elemId.replace(`${elemIdPrefix}`, "");
        loadDataFunction(elemIdValue);
    });
}

function addEventsToList(mainListName, colName, formName, elemIdPrefix, loadDataFunction, formElemId, deleteElemFunction) {
    $('.alphabet').on('click', function (e) {
        //e.preventDefault();
        $(`#${mainListName}`).css({ opacity: 0 });
        $(`#${mainListName}`).css({ transition: TRANSITION_SHORTHAND });
        $(`#${mainListName}`).css({ transform: 'scale3d(0.25, 0.25, 1)' });

        $('#lettersGrid').height($(`#${mainListName}`).height());
        $('#lettersGrid').width($(`#${mainListName}`).width());
        $("#lettersGrid").css({ top: 40 + 'px', left: 12 + 'px', position: 'absolute' });
        $("#lettersGrid").css('width', '100%');
        $("#lettersGrid").css('display', 'block');
        $("#lettersGrid").css('opacity', '1');
        $("#lettersGrid").css({ transition: TRANSITION_SHORTHAND });
        $("#lettersGrid").css({ transform: 'scale3d(1, 1, 1)' });
    });

    /* handle selection of letter from alphabet grid */
    $('.letter').on('click', function () {
        $("#lettersGrid").css({ opacity: 0 });
        $("#lettersGrid").css({ transition: TRANSITION_SHORTHAND });
        $("#lettersGrid").css({ transform: 'scale3d(2, 2, 1)' });
        setTimeout(function () {
            $("#lettersGrid").css('display', 'none');
        }, TRANSITION_DURATION);

        $(`#${mainListName}`).css({ opacity: 1 });
        $(`#${mainListName}`).css({ transition: TRANSITION_SHORTHAND });
        $(`#${mainListName}`).css({ transform: 'scale3d(1, 1, 1)' });

        var elemId = this.id.replace("grid", "");
        var elementTop = document.getElementById(elemId).offsetTop;
        var divTop = document.getElementById(mainListName).offsetTop;
        var elementRelativeTop = elementTop - divTop;
        $(`#${colName}`).scrollTo(elementRelativeTop, 800);
    });

    /* add event to each item in list */
    addEventToListItem(elemIdPrefix, loadDataFunction);
    /* handle contact selection */
    //$(`[id^=${elemIdPrefix}]`).on('click', function (e) {
    //    //console.log(e.currentTarget.id);
    //    var elemId = e.currentTarget.id;
    //    var elemIdValue = elemId.replace(`${elemIdPrefix}`, "");
    //    loadDataFunction(elemIdValue);
    //});

    /* create context menu on selected person */
    $.contextMenu({
        id: 'contextMenu',
        selector: '.context-menu-one',
        autoHide: true,
        build: function ($trigger, e) {
            //console.log(e);
            //console.log(e.currentTarget.id)
            currentContextMenuTargetId = e.currentTarget.id.replace(elemIdPrefix, "");
        },
        callback: function (key, options) {
            console.log(key);
            var elemId = options.$trigger[0].id.replace(elemIdPrefix, '');
            var name = options.$trigger[0].textContent;
            letter = name.charAt(0).toUpperCase();
            if (key == 'edit') {
                $(`#${formElemId}`).val(elemId);
                $(`#${formName}`).submit();
            } else if (key == 'delete') {
                deleteElemFunction(elemId)
            }
        },
        items: {
            "edit": { name: EditLabel, icon: "mif-pencil" },
            "delete": { name: DeleteLabel, icon: "mif-trash" },
        }
    });
}

/* ################################################################################ */
/* SHOW CARD */
/* ################################################################################ */
function loadPartialViewCallback(target, classToBeRemoved) {
    $(`#${target}`).removeClass(classToBeRemoved);

    if (!isMobile()) {
        animateCSS(`${target}`, `slideInRight`);
    } else {
        hide('searchboxContainer');

        defaultDetailsPosition = $(`#${target}`).position();
        $(`#${target}`).css({ position: `absolute`, top: `${0}px` });
        $(`#${target}`).addClass(`bg-white`);
        animateCSS(`${target}`, `slideInUp`);
    }
}

//function showCardCommon() {
//    $(`#listAndCardContainer`).append(detail);

//    var position = $(`#cardContainer`).position();

//    detail.css(`position`, `absolute`);
//    detail.css(`top`, position.top + `px`);
//    detail.css(`left`, (position.left + 4) + `px`);
//    detail.width($(`#cardContainer`).width() + 16 + `px`);
//    detail.height($(`#cardContainer`).height() + `px`);
//    detail.css(`background-color`, `white`);

//    //$(detail).slideUp(250, 'linear'); // WORKS BUT NEEDS TO BE USED IN RIGHT WAY!
//    //detail.removeClass('slideOutRight');
//    //detail.addClass('slideInRight');
//}
function clearSearchbox(inputElemId, listId, isTable = false) {
    $(`#${inputElemId}`).val('');
    doSearch(inputElemId, listId, isTable);
}

function doSearch(inputElemId, listId, isTable = false) {
    // Declare variables
    var defaultDisplayType = 'flex';
    if (isTable) {
        defaultDisplayType = 'table-row';
    }
    var input, filter, ul, li, i;
    input = document.getElementById(inputElemId);

    filter = input.value.toUpperCase();
    ul = document.getElementById(listId);
    li = ul.getElementsByTagName('li');

    if (input.value.length > 0) {
        for (i = 0; i < li.length; i++) {
            text = li[i].getAttribute("data-caption");  //nome 
            if (text) {
                if (text.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = defaultDisplayType;
                } else {
                    li[i].style.display = "none";
                }
            } else {
                li[i].style.display = "none";
            }

            if (!isNaN(filter)) { // lv 17/03/20
                text = li[i].id;  //ID = "companyXXX"
                var companyId = text.substring(7, text.length); //companyId
                if (companyId) {
                    if (companyId.toUpperCase().indexOf(filter) > -1) {
                        li[i].style.display = defaultDisplayType;
                    } else {
                        li[i].style.display = "none";
                    }
                } else {
                    li[i].style.display = "none";
                }
            }

        }
    } else {
        for (i = 0; i < li.length; i++) {
            li[i].style.display = defaultDisplayType;
        }
    }

}