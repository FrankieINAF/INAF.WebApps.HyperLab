var GROUP_ITEM = 'groupItem';
var GROUP_ITEMS = 'groupItems';

var SELECTED_SEARCH_TYPE;
var SEARCH_SIMPLE_TYPE = 'searhsimpletype';
var SEARCH_COMPLEX_TYPE = 'searhcomplextype';

var suggestions = {};

var areComplexSearchesRetrieved = false;

var timeoutOnWindowResize;

function setChartAreaWidth(isChartVisible) {
    let bodyW = $('#body').width();
    let menuW = $('#leftMenu').width();

    let chartW = bodyW - (500 + menuW);
    if (!isChartVisible)
        chartW = bodyW - menuW;

    $('#charts').css({ 'width': `${chartW}px` });
}

function setUIForChart(isChartVisible) {
    setLogoIsVisible()
    //setTimeout(function () { setChartAreaWidth(isChartVisible); }, 300);
}

/* ################################################################################ */
/* SELECTED SPECTRA */
/* ################################################################################ */
function addOrRemoveSelectedSpectrum(id) {
    var index = selectedSpectra.findIndex(x => x == id);
    //console.log(`addOrRemoveSelectedSpectrum - id: ${id}, index: ${index}`);
    if (index == -1)
        addSelectedspectrum(id);
    else {
        removeSelectedSpectrum(index);
        if (selectedSpectra.length == 0) {
            removeCreateChartsButtonProcedure();
            removeShareButtonProcedure();
        }
    }
}

function addSelectedspectrum(id) {
    selectedSpectra.push(id);

    if (selectedSpectra.length == 1) {
        addCreateChartsButton();
        addShareButton();
        showToast(ChartsUseChartsButtonMessage, 3000, INFO);
    }
}

function removeSelectedSpectrum(index) {
    console.log(`removeSelectedSpectrum - index: ${index}`);
    selectedSpectra.splice(index, 1);
    console.log(`removeSelectedSpectrum - selectedSpectra: ${selectedSpectra}`);
    if (selectedSpectra.length == 0) {
        //removeCreateChartsButtonProcedure();
        showToast(ChartsNoSpectraSelectedMessage, 3000, WARNING);
    }
}

function resetSelectedSpectra() {
    selectedSpectra = [];
}

/* ################################################################################ */
/* SEARCH RESULT (GROUP ITEMS) */
/* ################################################################################ */
function buildGroupItems(obj, rowIndex) {
    let itemsNum = obj.length;

    var text = `<ul data-role="listview" `;
    text += `id = "groupItemsTable${rowIndex}" `;
    text += `data-view="table" `;
    text += `data-selectable="true" `;
    text += `data-select-node="false" `;
    text += 'data-cls-list-item-check="bd-cyan" ';
    text += `data-structure='{"id": false, "insertDate": true, "editDate": true}'>`;
    text += `<li data-icon="<span class='mif-chart-line margin-right-8' style='color: transparent'>" `;
    text += `    data-caption="<strong>${SearchGroupItemsColTypeLabel}</strong>" `;
    text += `    data-insertDate="<strong>${SearchGroupItemsColInsertDateTimeLabel}</strong>" `;
    text += `    data-editDate="<strong>${SearchGroupItemsColEditDateTimeLabel}</strong>"></li>`;

    for (var i = 0; i < itemsNum; i++) {
        text += `<li id="${GROUP_ITEM}${obj[i].Id}" `;
        text += `    data-icon="<span class='mif-info margin-right-8 pointer' onclick='showInfo(${obj[i].Id})'>" `;
        text += `    data-caption="${getSpectrumTypeDescription(obj[i].SpectrumType)}" `;
        text += `    data-insertDate="${formatDate(obj[i].InsertDateTimeJs)}" `;
        let editDateTime = '-';
        if (obj[i].EditDateTimeJs)
            editDateTime = formatDate(obj[i].EditDateTimeJs);
        text += `data-editDate="${editDateTime}"></li>`;
    }
    text += '</ul>';

    $(`#${GROUP_ITEMS}${rowIndex}`).html(text);

    /* trick to hide the checkbox in the 1st row (fake header) */
    $(`#${GROUP_ITEMS}${rowIndex}`).ready(function () {
        let firstChild = $(`#${GROUP_ITEMS}${rowIndex}`).first();
        let labels = $(firstChild).find('label');
        if (labels) {
            $(labels[0]).empty();
            /* resize checkboxes column dimension */
            $(labels).each(function () {
                $(this).addClass('width-48');
            });
        }

        /* customize checkboxs UI */
        let checks = $(`#${GROUP_ITEMS}${rowIndex}`).find('.check');
        if (checks) {
            $(checks).each(function () {
                $(this).addClass('bd-cyan');
            });
        }

        let groupItemChildren = $(`#${GROUP_ITEMS}${rowIndex}`).find(`[id^=${GROUP_ITEM}]`);
        $(groupItemChildren).each(function (index) {
            if ($(this).is("li")) {
                $(this).off();
                $(this).change(function () {
                    var id = this.id;
                    addOrRemoveSelectedSpectrum(cleanId(id))
                });
            }
        });
    });

    Metro.makePlugin(`#${GROUP_ITEMS}Table${rowIndex}`, 'listview');

    /* show 'shrink' icon and hide 'expand' icon */
    hideByClass(`${GROUP_ITEMS}${rowIndex}IconExpand`);
    showByClass(`${GROUP_ITEMS}${rowIndex}IconShrink`);
}

function cleanId(id) {
    return parseInt(id.replace(GROUP_ITEM, ''));
}

function clearGroupItems(rowIndex) {
    $(`#${GROUP_ITEMS}${rowIndex}`).empty();

    /* hide 'shrink' icon and show 'expand' icon */
    hideByClass(`${GROUP_ITEMS}${rowIndex}IconShrink`);
    showByClass(`${GROUP_ITEMS}${rowIndex}IconExpand`);
}

async function searchGroupItems(rawId, rowIndex) {
    setLoadingCircleIsVisible(true);

    var model = {
        Id: rawId
    };

    let obj = await doAjaxGetAsync(UrlSearchGroupItems, model);
    if (obj && obj.length > 0) {
        buildGroupItems(obj, rowIndex);
        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, SearchGroupItemsNoResultsMessage, WARNING);
    }
}

/* ################################################################################ */
/* MATERIALS SUGGESTIONS */
/* ################################################################################ */
async function getMaterialsSuggestions(srcElemId, dstElemId, callback) {
    let text = $(`#${srcElemId}`).val();

    if (!text) {
        showSimpleDialog(WARNING_LABEL, SuggestionsNoTextWarningMessage, WARNING);
        return;
    }

    var model = {
        Text: text,
    };

    try {
        let obj = await doAjaxGetAsync(GetMaterialsSuggestions, model);
        if (obj) {
            /* remember suggestions for creating search request */
            suggestions[dstElemId] = obj;
            /* fill the 'select' ui item with suggestions */
            let plugin = Metro.getPlugin($(`#${dstElemId}`), 'select');
            plugin.data(obj);

            /* remove the 'error' state from input field */
            setInputFieldErrorState(srcElemId, false);

            /* show the 'select' UI element */
            showFlexMetroUIElem(`${dstElemId}`);

            if (callback)
                callback(dstElemId);
        } else {
            suggestions = {};
            resetSearchByMaterial();
            showSimpleDialog(ERROR_LABEL, SuggestionsRetrievingErrorMessage, ALERT);
        }
    } catch (e) {
        showSimpleDialog(ERROR_LABEL, SuggestionsRetrievingErrorMessage, ALERT);
    }
}

function resetSearchByMaterial(srcId) {
    /* clear input element */
    Metro.getPlugin($(`#${srcId}`), 'input').clear();
    /* hide and reset the select item */
    let destId = getDestId(srcId);
    hideMetroUIElem(`${destId}`);
    let plugin = Metro.getPlugin($(`#${destId}`), 'select');
    plugin.reset();
}

function setMaterialSelectWidth() {
    /* retrieve width of search input */
    let w = $('#selectMaterialInput').parent().width();

    /* set width */
    $('#selectMaterial').parent().width(`${w}px`);
}

/* ################################################################################ */
/* ANCILLARY */
/* ################################################################################ */
function alignMaterialSearchFields(srcId) {
    let w = $(`#${srcId}`).parent().width();
    let destId = getDestId(srcId);
    $(`#${destId}`).parent().width(`${w}px`);
}

function getDestId(srcId) {
    return srcId.replace('Input', '');
}

function getMaterialForSearchByEnter(evt, srcElem, dstElem, callback) {
    if (evt.originalEvent.code == 'Enter')
        getMaterialsSuggestions(srcElem, dstElem, callback);
}

function initSearchTypesButtons() {
    $('#searchTypeRadioSimple').click(function () {
        if (isCheckboxChecked('searchTypeRadioSimple')) {
            SELECTED_SEARCH_TYPE = SEARCH_SIMPLE_TYPE;
            hideByClass('panelSearchComplex');
            showByClass('panelSearchSimple');
        }
    });

    $('#searchTypeRadioComplex').click(function () {
        if (isCheckboxChecked('searchTypeRadioComplex')) {
            SELECTED_SEARCH_TYPE = SEARCH_COMPLEX_TYPE;
            hideByClass('panelSearchSimple');
            showByClass('panelSearchComplex');
            getSavedComplexSearches();
        }
    });
}

function setCurrentSearchSimpleType(selected) {
    //console.log(selected);
    $('[id$="SearchTypeLabel"]').removeClass('bold-text');
    $(`#${selected}SearchTypeLabel`).addClass('bold-text');

    selectedSearchSimpleType = selected;

    if (selected == selectMaterial) {
        setMaterialSelectWidth();
    }
}

/* ################################################################################ */
/* SEARCH INFO */
/* ################################################################################ */
function hideSearchInfo() {
    let callback = function () {
        $('#searchInfoContainer').removeClass('d-flex');
        hide('searchInfoContainer');
        addHelpButton();
    };
    animateCSS(`searchInfoContainer`, `fadeOut`, FASTER, callback);
}

function showSearchInfo() {
    $('#searchInfoContainer').addClass('d-flex');
    show('searchInfoContainer');
    animateCSS(`searchInfoContainer`, `fadeIn`, FASTER, removeHelpButtonProcedure);
}

/* ################################################################################ */
/* BUTTONS */
/* ################################################################################ */
/* ---------- INIT BUTTONS IN SEARCH PANEL ---------- */
function initButtonsInSearchPanel() {
    //removeBackToSearchButton();
    addSearchButton();
    addHelpButton();
}

/* ---------- HELP BUTTON ---------- */
function addHelpButton() {
    addButton(helpButtonId, ButtonHelpLabel, 'mif-help', showSearchInfo);
}

function removeHelpButtonProcedure() {
    if (!isButtonAvailable(helpButtonId))
        return;

    animateCSS(`${helpButtonId}`, `bounceOutUp`, FAST, removeHelpButton);
}

function removeHelpButton() {
    $(`#${helpButtonId}`).remove();
}

/* ---------- SEARCH BUTTON ---------- */
function addSearchButton() {
    addButton(searchButtonId, ButtonSearchLabel, 'mif-search', search);
}

function removeSearchButtonProcedure() {
    if (!isButtonAvailable(searchButtonId))
        return;

    animateCSS(`${searchButtonId}`, `bounceOutUp`, FAST, removeSearchButton);
}

function removeSearchButton() {
    $(`#${searchButtonId}`).remove();
}


/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
function onWindowResize() {
    if (timeoutOnWindowResize)
        clearTimeout(timeoutOnWindowResize);

    timeoutOnWindowResize = setTimeout(function () {
        setListviewSearchConditionsUI();
    }, 200);
}

$(function () {
    /* fill arrays for search */
    fillSampleTypes();
    fillMineralTypes();
    fillOriginTypes();

    /* init buttons */
    SELECTED_SEARCH_TYPE = SEARCH_SIMPLE_TYPE;
    initButtonsInSearchPanel();

    /* init chartContainer */
    chartContainer = $('#charts');

    /* init radio-buttons for selecting search type */
    initSearchTypesButtons();

    /* init selected SIMPLE search type */
    setCurrentSearchSimpleType(selectSampleDataType);

    /* hide the 'select' used to show mterials suggestions */
    hideMetroUIElem(`${selectMaterial}`);

    /* enable search for materials suggestions when 'Enter' is pressed */
    $(`#${selectMaterial}Input`).each(function () {
        $(`#${selectMaterial}Input`).on('keydown', function (evt) {
            getMaterialForSearchByEnter(evt, `${selectMaterial}Input`, `${selectMaterial}`);
        });
    });

    complexSearchConditionsContainer = $('#complexSearchConditionsContainer');

    /* set UI for complex seach conditions list */
    executeAfter(setListviewSearchConditionsUI, 500);

    /* animate intro for 1st loading */
    //completePageRendering();

    aQueue = new AutoQueue();

    /* defined in info.js, for input with mineral percentage when sample info is 'mix' */
    setMaterialForMixEventHandler();

    /* add handler for window resize event */
    window.onresize = function () {
        onWindowResize();
    };

    showPageItems();

    //$("body").click(function (e) {
    //    var parentOffset = $(this).offset();
    //    var relX = e.pageX - parentOffset.left;
    //    var relY = e.pageY - parentOffset.top;

    //    console.log(`${relX}, ${relY}`);
    //});
});

$(document).on('beforeunload', function () {
    setOverflowYHidden();
});
