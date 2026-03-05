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