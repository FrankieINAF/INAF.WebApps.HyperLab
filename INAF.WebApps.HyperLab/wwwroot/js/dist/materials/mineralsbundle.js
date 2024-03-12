const CALLER_ADD_BUTTON = 'calleraddbutton';
const CALLER_EDIT_BUTTON = 'callereditbutton';
const MINERAL_PREFIX = 'mineralItem';

var isDataChanged = false;
var deletedMineralId;
var lastLoadedMineralId = 0;
var defaultDetailsPosition;
var caller = null;

var addButtonId = 'addMineralButton';

/* ################################################################################ */
/* ADD MINERAL BUTTON */
/* ################################################################################ */
function addMineralButton() {
    addButton(addButtonId, AddMineralTitle, 'mif-plus', addMineral);
}

function addMineral() {
    loadPartialViewWithAjaxGetNoModel(UrlUpsertMineral, 'upsertMineralContainer', loadMineralPartialViewCallback('upsertCardContainer', 'showCardContainer'));
}

/* ################################################################################ */
/* MINERALS LIST */
/* ################################################################################ */
async function loadMineralsListAsync() {
    setLoadingCircleIsVisible(true);

    let obj = await doAjaxGetNoModelAsync(UrlGetMineralsList);

    if (obj && obj.length > 0) {
        initDictionary();
        buildList(obj, 'materialsListUl', 'mineralsList', MINERAL_PREFIX, getMineralDataFunction, getElemsFunction, setDictionaryElementFunction);
        buildFirstLettersGrid(conditionFunction);
        addEventsToList('mineralsList', 'materialsCol', 'editMaterialForm', MINERAL_PREFIX, loadMineralDetails, 'MineralId', deleteMineralProcedure);
        /* hide loading message */
        hide('remarkLoadingMinerals');
        /* show minerals list and searchbox */
        show('searchboxContainer');
        show('mineralsList');
        setLoadingCircleIsVisible(false);

        addMineralButton();
    } else {
        setLoadingCircleIsVisible(false);
        /* hide loading message */
        hide('remarkLoadingMinerals');
        /* show warning message about not found minerals */
        show('remarkWarningMinerals');
        showSimpleDialog(WARNING_LABEL, NoMineralsFoundMessage, WARNING);
    }
}

function getElemsFunction(obj, i) {
    return obj.filter(x => x.Name.charAt(0).toUpperCase() === dictionary[i].firstLetter);
}

function getMineralDataFunction(elems, j) {
    return `${elems[j].Name}`;
}

/* ################################################################################ * /
/* SELECTED MINERAL */
/* ################################################################################ */
function loadMineralDetails(mineralId) {
    if (lastLoadedMineralId == mineralId)
        return;

    var model = {
        Id: mineralId
    };

    loadPartialViewWithAjaxGet(UrlGetMineralDetails, model, 'selectedMineralContainer', loadMineralPartialViewCallback('showCardContainer', 'upsertCardContainer'));

    lastLoadedMineralId = mineralId;
}

function loadMineralPartialViewCallback(target, divToHide = null) {
    /* hide the divToHide target, if set */
    if (divToHide)
        hide(divToHide);
    /* show the target div */
    show(target);
    /* animate the target div */
    loadPartialViewCallback(target, 'mineral-details');
}

/* ################################################################################ * /
/* UPSERT MINERAL */
/* ################################################################################ */
function loadUpsertMineralFromAdd(mineralId) {
    caller = CALLER_ADD_BUTTON;
    loadUpsertMineral(mineralId);
}

function loadUpsertMineralFromEdit(mineralId) {
    caller = CALLER_EDIT_BUTTON;
    loadUpsertMineral(mineralId);
}

function loadUpsertMineral(mineralId = null) {
    /* set value for newly loaded form */
    isDataChanged = false;

    /* set model and load data */
    var model = {
        Id: mineralId
    };

    loadPartialViewWithAjaxGet(UrlUpsertMineral, model, 'upsertMineralContainer', loadMineralPartialViewCallback('upsertCardContainer', 'showCardContainer'));

    lastLoadedMineralId = mineralId;
}

/* ################################################################################ */
/* CLOSE PARTIAL VIEW */
/* ################################################################################ */
function clearPartialView(target, targetContainer) {
    if (!isMobile()) {
        setTimeout(function () {
            $(`#${target}`).empty();
            $(`#${targetContainer}`).addClass('mineral-details');
            $(`#${targetContainer}`).removeClass('bg-white');
            if (caller == CALLER_EDIT_BUTTON) {
                hide(targetContainer);
                caller = null;
            }
        }, DEFAULT_TIMEOUT_FOR_ANIMATE);
    } else {
        setTimeout(function () {
            $(`#${target}`).empty();
            $(`#${targetContainer}`).removeClass('bg-white');
            $(`#${targetContainer}`).css({ position: 'relative', top: defaultDetailsPosition.top + 'px' });
        }, DEFAULT_TIMEOUT_FOR_ANIMATE);
    }
}

function closePartialView(target, targetContainer) {
    lastLoadedMineralId = null;

    /* if edit form is called from edit button, then we need to make details panel visible */
    if (caller == CALLER_EDIT_BUTTON)
        show('showCardContainer');

    if (!isMobile()) {
        /* close details panel */
        animateCSS(`${target}`, `slideOutRight`, clearPartialView(target, targetContainer));
    } else {
        /* searchbox is hidden for mobile when loading mineral details. Now it's time to make it visible again */
        show('searchboxContainer');
        /* close details panel */
        animateCSS(`${target}`, `slideOutDown`, clearPartialView(target, targetContainer));
    }
}

function tryClosePartialView(target, targetContainer) {
    if (!isDataChanged)
        closePartialView(target, targetContainer);
    else {
        var title = MineralsManagementTitle;
        var message = MineralChangesDiscardQuestion;
        askAndExecute(title, message, closePartialView, [target, targetContainer]);
    }
}

/* ################################################################################ */
/* DELETE MINERAL */
/* ################################################################################ */
function deleteMineralProcedure(mineralId) {
    var title = MineralsManagementTitle;
    var message = MineralDeletionQuestion;
    confirmAndExecute(title, message, deleteMineralAsync, mineralId);
}

async function deleteMineralAsync(mineralId) {

    setLoadingCircleIsVisible(true);

    var model = {
        Id: parseInt(mineralId)
    };

    deletedMineralId = mineralId;

    let result = await doAjaxPostAsync(UrlDeleteMineral, model);
    if (result) {
        deleteMineralCallback(result);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DeleteMineralErrorMessage, ALERT);
    }
}

function deleteMineralCallback(result) {
    if (result.IsOk) {
        $(`#mineral${deletedMineralId}`).remove();
        $('#selectedMineralContainer').empty();
        $('#showCardContainer').addClass('mineral-details');
        /* remote the deleted mineral from list */
        $(`#${MINERAL_PREFIX}${result.Id}`).remove();
        /* remove the separator letter, if required */
        tryRemoveLetterFromList(deletedMineralId);
        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DeleteMineralErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
function clearSearchboxProcedure() {
    clearSearchbox('searchbox', 'mineralsList');
}

function doSearchProcedure() {
    doSearch('searchbox', 'mineralsList');
}

/* ################################################################################ */
/* FORM METHODS */
/* ################################################################################ */
function setDataChanged() {
    isDataChanged = true;
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(document).ready(function () {
    loadMineralsListAsync();

    /* add listener for RETURN in searchbox */
    addReturnListenerToElem('searchbox', doSearchProcedure);

    /* add button for adding new mineral */
    //addMineralButton();
});


function addNewMineralInList(mineralId, mineralName) {
    var newNameFirstLetter = mineralName.charAt(0);

    var lis = $("#materialsListUl").find("li");
    var lisNum = lis.length;
    var index = lis.toArray().findIndex(x => x.innerText == newNameFirstLetter.toUpperCase());
    for (var i = index; i < lisNum; i++) {
        //console.log(`#${lis[i].innerText} - compare: ${lis[i].innerText.localeCompare(mineralName)}`);
        if (lis[i].innerText.localeCompare(mineralName) == 1) {
            //console.log('FOUND ' + lis[i].innerText);
            let newItem = getListItem(MINERAL_PREFIX, mineralId, mineralName);
            //console.log(newItem);
            var id = $(lis[i]).attr('id');
            var lv = Metro.getPlugin('#materialsListUl', 'listview');
            var newNode = lv.insertBefore($('#materialsListUl').find(`#${id}`)[0], { id: `#${MINERAL_PREFIX}${mineralId}`, class: 'context-menu-one', caption: mineralName})
            $(newNode).attr(`id`, `${MINERAL_PREFIX}${mineralId}`);
            $(newNode).attr(`data-caption`, mineralName);
            $(newNode).addClass(`context-menu-one`);
            break;
        }
    }

    /* remove event when clicking a list item... */
    $(`#${MINERAL_PREFIX}`).off();
    /* ...and add it again, in order to enable event also for the newly created item */
    addEventToListItem(MINERAL_PREFIX, loadMineralDetails);
}
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