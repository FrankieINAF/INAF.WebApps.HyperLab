var SELECTED_SEARCH_TYPE;
var SEARCH_SIMPLE_TYPE = 'searhsimpletype';
var SEARCH_COMPLEX_TYPE = 'searhcomplextype';

var suggestions = {};

var areComplexSearchesRetrieved = false;

var timeoutOnWindowResize;

var LOADING_TYPE_SEARCH = 'loadingTypeSearch';
var LOADING_TYPE_LOAD = 'loadingTypeLoad';
var loadingType;

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

function expandSearchPanel() {
    Metro.getPlugin('#panelSearchLoad', 'panel').expand();
}

/* ################################################################################ */
/* MATERIALS SUGGESTIONS */
/* ################################################################################ */
async function getMaterialsSuggestions(srcId, dstId, callback1, callback2) {
    let text = $(`#${srcId}`).val();

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
            suggestions[dstId] = obj;
            /* fill the 'select' ui item with suggestions */
            let plugin = Metro.getPlugin($(`#${dstId}`), 'select');
            plugin.data(obj);

            /* remove the 'error' state from input field */
            setInputFieldErrorState(srcId, false);

            /* hide the inpu field */
            hideElemMetroUIElem(`${srcId}`);
            /* show the 'select' UI element */
            showFlexMetroUIElem(`${dstId}`);

            if (callback1)
                callback1(dstId);

            if (callback2)
                callback2();
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

    /* hide the inpu field */
    showFlexElemMetroUIElem(`${srcId}`);
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
        selectSimpleSearch();
    });

    $('#searchTypeRadioComplex').click(function () {
        selectComplexSearch();
    });
}

function selectComplexSearch(isReloadRequired = false, callback) {
    if (isCheckboxChecked('searchTypeRadioComplex')) {
        SELECTED_SEARCH_TYPE = SEARCH_COMPLEX_TYPE;
        hideByClass('panelSearchSimple');
        showByClass('panelSearchComplex');
        getSavedComplexSearches(isReloadRequired, callback);
    }
}

function selectSimpleSearch() {
    if (isCheckboxChecked('searchTypeRadioSimple')) {
        SELECTED_SEARCH_TYPE = SEARCH_SIMPLE_TYPE;
        hideByClass('panelSearchComplex');
        showByClass('panelSearchSimple');
    }
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
/* ---------- SEARCH BUTTON ---------- */
async function tryAddSearchButton() {
    if (!isUserAuthorized)
        return;
    
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
/* SCREEN ORIENTATION */
/* ################################################################################ */
function checkOrientation() {
    if (screen.orientation.type.startsWith("portrait")) {
        //console.log("Portrait mode");
        $('#panelSearchSimple').removeClass('h-vh-50-sm').addClass('h-vh-25-sm');
    } else if (screen.orientation.type.startsWith("landscape")) {
        //console.log("Landscape mode");
        $('#panelSearchSimple').removeClass('h-vh-25-sm').addClass('h-vh-50-sm');
    }
}

/* ################################################################################ */
/* LAST SEARCH EXECUTION */
/* ################################################################################ */
function tryRestoreLastSearch() {
    if (!lastSearchJson)
        return;

    //console.log(`lastSearchJson: ${lastSearchJson}`);

    const lastSearch = JSON.parse(lastSearchJson);
    const searchType = lastSearch.SearchType;
    let executeSearch = true;
    switch (searchType) {
        case 1:
            selectSimpleSearch();
            $('#selectFilename').val(lastSearch.SearchObjectJson.Text);
            setCurrentSearchSimpleType('selectFilename');
            break;

        case 2:
            selectSimpleSearch();
            $('#selectMaterialInput').val(lastSearch.SearchObjectJson.Text);
            const callback2 = function () {
                executeAfter(function () { search(); }, 500);
            };
            getMaterialsSuggestions('selectMaterialInput', 'selectMaterial', manageValueSelection, callback2);
            setCurrentSearchSimpleType('selectMaterial');
            executeSearch = false;
            break;

        case 3:
            selectSimpleSearch();
            Metro.getPlugin('#selectMineralType', 'select').val(lastSearch.SearchObjectJson.Id);
            setCurrentSearchSimpleType('selectMineralType');
            break;

        case 4:
            selectSimpleSearch();
            Metro.getPlugin('#selectOriginType', 'select').val(lastSearch.SearchObjectJson.Id);
            setCurrentSearchSimpleType('selectOriginType');
            break;

        case 5:
            selectSimpleSearch();
            $('#selectSampleName').val(lastSearch.SearchObjectJson.Text);
            setCurrentSearchSimpleType('selectSampleName');
            break;

        case 6:
            selectSimpleSearch();
            Metro.getPlugin('#selectSampleDataType', 'select').val(lastSearch.SearchObjectJson.Id);
            setCurrentSearchSimpleType('selectSampleDataType');
            break;

        case 7:
            if (lastSearch.SearchObjectJson.Id > 0) {
                $('[id="searchTypeRadioComplex"]').prop('checked', true);
                const callback = function () {
                    buildAndRunComplexSearchProcedureAsync(lastSearch.SearchObjectJson.Id);
                };
                selectComplexSearch(false, callback);
            }
            break;

        default:
    }

    if (executeSearch)
        executeAfter(function () { search(); }, 500);
}

/* ################################################################################ */
/* TOOLTIP(s) */
/* ################################################################################ */
var isTooltipSearchByMaterialVisible = false;

function hideTooltipSearchByMaterial() {
    animateCSS('tooltipSelectMaterialInput', 'fadeOut', FASTER, function () {
        hide('tooltipSelectMaterialInput');
    });
}

function showTooltipSearchByMaterial() {
    show('tooltipSelectMaterialInput');
    animateCSS('tooltipSelectMaterialInput', 'fadeIn', FASTER);
}

function setTooltipSearchByMaterialVisibility() {
    if (!isTooltipSearchByMaterialVisible)
        showTooltipSearchByMaterial();
    else
        hideTooltipSearchByMaterial();

    isTooltipSearchByMaterialVisible = !isTooltipSearchByMaterialVisible;
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

$(async function () {
    navigationStatus = NAVIGATION_HUB;

    setLoadingCircleIsVisible(true);

    await isAuthorizedAsync();

    tryHideLogoutButton();

    /* fill arrays for search */
    //fillSampleTypes();
    //fillMineralTypes();
    //fillOriginTypes();

    /* init buttons */
    SELECTED_SEARCH_TYPE = SEARCH_SIMPLE_TYPE;
    manageNavigation();

    /* init loading type */
    loadingType = LOADING_TYPE_SEARCH;

    $('#searchtitle').on('click', function () {
        loadingType = LOADING_TYPE_SEARCH;
        tryAddSearchButton();
    });

    $('#loadtitle').on('click', function () {
        loadingType = LOADING_TYPE_LOAD;
        removeSearchButtonProcedure();
    });

    await retrieveArraysForSearchesAsync();

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

    showPageItems(true);

    $('#selectSampleName, #selectFilename').on('keydown', function (evt) {
        if (evt.originalEvent.code == 'Enter')
            search();
    });

    /* init requested levels for search and set as checked the 1st one */
    initializeRequestedLevelsSimple();

    /* check for screen orientation */
    screen.orientation.addEventListener("change", checkOrientation);
    checkOrientation(); // Initial check

    /* try execute last search, when available */
    tryRestoreLastSearch();

    setLoadingCircleIsVisible(false);
});

$(document).on('beforeunload', function () {
    setOverflowYHidden();
});
