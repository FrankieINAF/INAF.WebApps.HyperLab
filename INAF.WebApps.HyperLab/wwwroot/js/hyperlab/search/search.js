var CHECKBOX = 'checkbox';
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
    if (isNaN(id))
        return;

    var index = selectedSpectra.findIndex(x => x == id);
    //console.log(`addOrRemoveSelectedSpectrum - id: ${id}, index: ${index}`);
    if (index == -1)
        addSelectedSpectrum(id);
    else {
        removeSelectedSpectrum(index);
        if (selectedSpectra.length == 0) {
            removeCreateChartsButtonProcedure();
            removeShareButtonProcedure();
            removeSetPublicButtonProcedure();
        }
    }
}

function addSelectedSpectrum(id) {
    selectedSpectra.push(id);

    addCreateChartsButtonProcedure();
    if (selectedSpectra.length == 1) {
        addShareButton();
        addSetPublicButton();
        showToast(ChartsUseChartsButtonMessage, 3000, INFO);
    }
}

function removeSelectedSpectrum(index) {
    //console.log(`removeSelectedSpectrum - index: ${index}`);
    selectedSpectra.splice(index, 1);
    //console.log(`removeSelectedSpectrum - selectedSpectra: ${selectedSpectra}`);
    if (selectedSpectra.length == 0) {
        //removeCreateChartsButtonProcedure();
        showToast(ChartsNoSpectraSelectedMessage, 3000, WARNING);
    }
}

function resetSelectedSpectra() {
    selectedSpectra = [];
}

/* ################################################################################ */
/* SEARCH RESULTS  */
/* ################################################################################ */
function clearSearchResults() {
    if (!$('#searchResultsContainer').length)
        return;

    let callback = function () {
        $('#searchResultsContainer').empty();
        setOverflowYHidden();
    };
    animateCSS('searchResultsContainer', 'backOutDown', FAST, callback);
}

function showSearchResults(resultsNum) {
    setOverflowYAuto(true);

    if (isMobile())
        $('#searchResultsContainer').removeClass('overflow-x-hidden').addClass('overflow-x-auto');

    let callback;
    if (resultsNum > 0) {
        callback = function () {
            $('#panelSearchLoad').parent().removeClass('h-vh-50');
            Metro.getPlugin('#panelSearchLoad', 'panel').collapse();
        };
    }
    showByClass('searchResultsContainer');
    animateCSS('searchResultsContainer', 'backInUp', FAST, callback);
}

/* ################################################################################ */
/* SEARCH RESULT (GROUP ITEMS) */
/* ################################################################################ */
function buildGroupItems(obj, rowIndex) {
    let itemsNum = obj.length;

    var text = `<table class="table striped compact table-border row-border row-hover">`;
    text += `<thead>`;
    text += `   <th>&nbsp;</th>`;
    text += `   <th>&nbsp;</th>`;
    text += `   <th>${FileCsvLabel}</th>`;
    text += `   <th>${FileXmlLabel}</th>`;
    text += `   <th>${SearchGroupItemsColTypeLabel}</th>`;
    text += `   <th>${SearchGroupItemsColInsertDateTimeLabel}</th>`;
    text += `   <th>${SearchGroupItemsColEditDateTimeLabel}</th>`;
    text += `</thead>`;
    text += `<tbody>`;
    for (var i = 0; i < itemsNum; i++) {
        let id = `${CHECKBOX}${GROUP_ITEM}${obj[i].Id}`;
        text += `   <tr>`;
        text += `    <td><input id="${id}" type="checkbox" data-role="checkbox" data-style="2" data-cls-check="bd-cyan"></td>`;
        text += `    <td><span class="mif mif-info mif-3x pointer" onclick='showInfo(${obj[i].Id})'></span></td>`;
        text += `    <td><button class="button primary cycle outline pointer"><span class="mif mif-file-download pointer" title="${ButtonDownloadAsCsvFileLabel}" onclick='downloadSpectrumAsCsvAsync(${obj[i].Id})'></span></button></td>`;
        text += `    <td><button class="button primary cycle outline pointer"><span class="mif mif-file-download pointer" title="${ButtonDownloadAsXmlFileLabel}" onclick='downloadSpectrumAsXmlAsync(${obj[i].Id})'></span></button></td>`;
        text += `    <td class="row-text">${getSpectrumTypeDescription(obj[i].SpectrumType)}</td>`;
        text += `    <td class="row-text">${formatDate(obj[i].InsertDateTimeJs)}</td>`;
        let editDateTime = '-';
        if (obj[i].EditDateTimeJs)
            editDateTime = formatDate(obj[i].EditDateTimeJs);
        text += `    <td class="row-text">${editDateTime}</td>`;
        text += `   </tr>`;
    }
    text += `</tbody>`;
    text += '</table>';

    $(`#${GROUP_ITEMS}${rowIndex}`).html(text);

    $(function () {
        $(`[id^=${CHECKBOX}${GROUP_ITEM}]`).off();
        $(`[id^=${CHECKBOX}${GROUP_ITEM}]`).on('change', function () {
            var id = this.id;
            addOrRemoveSelectedSpectrum(cleanId(id));
        });
    });

    /* show 'shrink' icon and hide 'expand' icon */
    hideByClass(`${GROUP_ITEMS}${rowIndex}IconExpand`);
    showByClass(`${GROUP_ITEMS}${rowIndex}IconShrink`);
}

function cleanId(id) {
    return parseInt(id.replace(`${CHECKBOX}${GROUP_ITEM}`, ''));
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
            getMaterialForSearchByEnter(evt, `${selectMaterial}Input`, `${selectMaterial}`, manageValueSelection);
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

    $('#selectSampleName, #selectFilename').on('keydown', function (evt) {
        if (evt.originalEvent.code == 'Enter')
            search();
    });

    $('#selectLevelAveraged, #selectLevelSingleAcquisition').on('change', function (evt) {
        var checkbox = $(this);
        var value = parseInt(checkbox.val());

        if (checkbox.is(':checked')) {
            // Add item to the array if checked
            if (!requestedLevels.includes(value)) {
                requestedLevels.push(value);
            }
        } else {
            // Remove item from the array if unchecked
            var index = requestedLevels.indexOf(value);
            if (index > -1) {
                requestedLevels.splice(index, 1);
            }
        }
    });

    // Programmatically set the checkbox as checked
    executeAfter(function () { $('#selectLevelAveraged').prop('checked', true).trigger('change'); }, 500);

});

$(document).on('beforeunload', function () {
    setOverflowYHidden();
});
