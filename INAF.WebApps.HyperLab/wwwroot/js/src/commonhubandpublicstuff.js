var requestedLevelsSimple = [];
var selectedSpectra = [];

var CHECKBOX = 'checkbox';
var GROUP_ITEM = 'groupItem';
var GROUP_ITEMS = 'groupItems';

var NAVIGATION_BACK_TO_SEARCH = 'navigationbacktosearch';
var NAVIGATION_BACK_CLEAR_CHART = 'navigationbackclearchart';
var NAVIGATION_CREATE_CHART = 'navigationcreatechart';
var NAVIGATION_HUB = 'navigationinit';
var NAVIGATION_PUBLIC_STUFF = 'navigationpublicstuff';
var NAVIGATION_SHOW_CHART = 'navigationshowchart';
var navigationStatus = NAVIGATION_HUB;

function initializeRequestedLevelsSimple() {
    $('#selectLevelAveragedSimple, #selectLevelSingleAcquisitionSimple').on('change', function (evt) {
        var checkbox = $(this);
        var value = parseInt(checkbox.val());

        if (checkbox.is(':checked')) {
            // Add item to the array if checked
            if (!requestedLevelsSimple.includes(value)) {
                requestedLevelsSimple.push(value);
            }
        } else {
            // Remove item from the array if unchecked
            var index = requestedLevelsSimple.indexOf(value);
            if (index > -1) {
                requestedLevelsSimple.splice(index, 1);
            }
        }
    });

    executeAfter(function () { $('#selectLevelAveragedSimple').prop('checked', true).trigger('change'); }, 500);
}

/* ################################################################################ */
/* RETRIEVE ARRAYS FOR SEARCHES */
/* ################################################################################ */
async function retrieveArraysForSearchesAsync() {
    const callRetrieveMineralTypesAsync = retrieveMineralTypesAsync(mineralTypes);
    const callRetrieveOriginTypesAsync = retrieveOriginTypesAsync(originTypes);
    const callRetrieveSampleTypesAsync = retrieveSampleTypesAsync(sampleTypes);

    await Promise.all([callRetrieveMineralTypesAsync, callRetrieveOriginTypesAsync, callRetrieveSampleTypesAsync]);
}

async function retrieveMineralTypesAsync(arrayToBeFilled) {
    const values = await doAjaxGetAsync(UrlGetMineralTypes);
    fillArray(arrayToBeFilled, values);
}

async function retrieveOriginTypesAsync(arrayToBeFilled) {
    const values = await doAjaxGetAsync(UrlGetOriginTypes);
    fillArray(arrayToBeFilled, values);
}

async function retrieveSampleTypesAsync(arrayToBeFilled) {
    const values = await doAjaxGetAsync(UrlGetSampleTypes);
    fillArray(arrayToBeFilled, values);
}

function fillArray(arrayToBeFilled, values) {
    if (values && values.length > 0) {
        const valuesNum = values.length;
        for (var i = 0; i < valuesNum; i++) {
            arrayToBeFilled.push({
                key: values[i].Id,
                value: values[i].StringValue
            });
        }
    }
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
function executeSearchSimpleByFilename(text) {
    if (!text) {
        showSimpleDialog(WARNING_LABEL, SearchByFilenameEmptyErrorMessage, WARNING);
        return;
    }

    const model = {
        Text: text,
        RequestedLevels: requestedLevelsSimple
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxJsonPost(UrlSearchSimpleGroupsByFilename, model, 'searchResultsContainer');
}

function executeSearchSimpleByMineralType(value) {
    if (!value) {
        showSimpleDialog(WARNING_LABEL, SearchByMineralTypeEmptyErrorMessage, WARNING);
        return;
    }

    const model = {
        Id: value,
        RequestedLevels: requestedLevelsSimple
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxJsonPost(UrlSearchSimpleByMineralType, model, 'searchResultsContainer');
}

function executeSearchSimpleByOriginType(value) {
    if (!value) {
        showSimpleDialog(WARNING_LABEL, SearchByOriginTypeEmptyErrorMessage, WARNING);
        return;
    }

    const model = {
        Id: value,
        RequestedLevels: requestedLevelsSimple
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxJsonPost(UrlSearchSimpleByOriginType, model, 'searchResultsContainer');
}

function executeSearchSimpleBySampleName(text) {
    if (!text) {
        showSimpleDialog(WARNING_LABEL, SearchBySampleNameEmptyErrorMessage, WARNING);
        return;
    }

    const model = {
        Text: text,
        RequestedLevels: requestedLevelsSimple
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxJsonPost(UrlSearchSimpleGroupsBySampleName, model, 'searchResultsContainer');
}

function executeSearchSimpleBySampleType(value) {
    if (!value) {
        showSimpleDialog(WARNING_LABEL, SearchBySampleTypeEmptyErrorMessage, WARNING);
        return;
    }

    const model = {
        Id: value,
        RequestedLevels: requestedLevelsSimple
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxJsonPost(UrlSearchSimpleBySampleType, model, 'searchResultsContainer');
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

        /* remove buttons added when any spaectrum is selected (Hub page) */
        if (doesMetroUIElemExist('panelSearchLoad')) {
            removeCreateChartsButtonProcedure();
            removePublicAndShareButtonsProcedure();
        }

        /* this is true in PublicStuff page */
        $('#searchResultsContainer').removeClass('search-results-public');
    };
    animateCSS('searchResultsContainer', 'backOutDown', FAST, callback);
}

function showSearchResults(resultsNum) {
    setOverflowYAuto(true);

    if (isMobile())
        $('#searchResultsContainer').removeClass('overflow-x-hidden').addClass('overflow-x-auto');

    const callback = function () {
        if (doesMetroUIElemExist('panelSearchLoad'))
            /* this is true in Hub page */
            Metro.getPlugin('#panelSearchLoad', 'panel').collapse();
        else
            /* this is true in PublicStuff page */
            $('#searchResultsContainer').addClass('search-results-public');
    };
    showByClass('searchResultsContainer');
    animateCSS('searchResultsContainer', 'backInUp', FAST, callback);
}

/* ################################################################################ */
/* SELECTED SPECTRA */
/* ################################################################################ */
function addOrRemoveSelectedSpectrum(id) {
    if (isNaN(id))
        return;

    if (!selectedSpectra.includes(id))
        addSelectedSpectrum(id);
    else {
        removeSelectedSpectrum(id);
        if (selectedSpectra.length == 0) {
            removeCreateChartsButtonProcedure();
            removePublicAndShareButtonsProcedure();
        }
    }
}

function addSelectedSpectrum(id) {
    selectedSpectra.push(id);

    addCreateChartsButtonProcedure();
    if (selectedSpectra.length == 1) {
        if (navigationStatus == NAVIGATION_PUBLIC_STUFF)
            return;

        addPublicAndShareButtons();
        addMessage(ChartsUseChartsButtonMessage, 3000, INFO);
    }
}

function removeSelectedSpectrum(id) {
    const index = selectedSpectra.findIndex(x => x == id);
    //console.log(`removeSelectedSpectrum - id: ${id}, index: ${index}`);
    selectedSpectra.splice(index, 1);
    //console.log(`removeSelectedSpectrum - selectedSpectra: ${selectedSpectra}`);
    if (selectedSpectra.length == 0) {
        addMessage(ChartsNoSpectraSelectedMessage, 3000, WARNING);
    }
}

function resetSelectedSpectra() {
    selectedSpectra = [];
}

/* ################################################################################ */
/* MANAGE OVERFLOW-Y */
/* ################################################################################ */
function setOverflowYAuto(isRequired = false) {
    if (isMobile() || isRequired)
        $('#search').removeClass('overflow-y-hidden').addClass('overflow-y-auto');
}

function setOverflowYHidden() {
    if (!isMobile())
        $('#search').removeClass('overflow-y-auto').addClass('overflow-y-hidden');
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
/* DOWNLOAD PROCEDURE */
/* ################################################################################ */
async function downloadSpectrumAsCsvAsync(id) {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let model = {
        Id: id
    };

    try {
        let obj = await doAjaxGetAsync(UrlGetSpectrumAsCsv, model);
        if (obj.IsOk) {
            setLoadingCircleIsVisible(false);
            executeExportFile(obj.ResponseObject.Csv, `${obj.ResponseObject.Filename}_${getSpectrumTypeString(obj.ResponseObject.TypeId)}.csv`)
        } else
            isOk = false;
    } catch (e) {
        isOk = false;
    }

    if (!isOk) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DownloadSpectrumErrorMessage, ALERT);
    }
}

async function downloadSpectrumAsXmlAsync(id) {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let model = {
        Id: id
    };

    try {
        let obj = await doAjaxGetAsync(UrlGetSpectrumAsXml, model);
        if (obj.IsOk) {
            setLoadingCircleIsVisible(false);
            executeExportFile(obj.ResponseObject.Xml, `${obj.ResponseObject.Filename}_${getSpectrumTypeString(obj.ResponseObject.TypeId)}.xml`)
        } else
            isOk = false;
    } catch (e) {
        isOk = false;
    }

    if (!isOk) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DownloadSpectrumErrorMessage, ALERT);
    }
}