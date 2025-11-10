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