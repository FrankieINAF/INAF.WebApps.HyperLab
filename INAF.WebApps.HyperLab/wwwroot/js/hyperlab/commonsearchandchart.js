
var showCharmsColorSelectorId = 'buttonShowCharmsColorSelector';
var showCharmsLegendButtonId = 'buttonShowCharmsLegend';
var goToChartsButtonId = 'buttonGoToCharts';
var helpButtonId = 'buttonHelp';

var searchButtonId = 'buttonSearch';
var showChartsButtonId = 'buttonShowCharts';
var zoomOutButtonId = 'buttonZoomOut';

var OPTIONS_TITLE_ALIGNMENT = 'alignmentoptionstitle';
var OPTIONS_TITLE_FIT = 'fitoptionstitle';
var OPTIONS_TITLE_SMOOTHING = 'smoothingoptionstitle';

var NAVIGATION_BACK_TO_SEARCH = 'navigationbacktosearch';
var NAVIGATION_BACK_CLEAR_CHART = 'navigationbackclearchart';
var NAVIGATION_CREATE_CHART = 'navigationcreatechart';
var NAVIGATION_INIT = 'navigationinit';
var NAVIGATION_SHOW_CHART = 'navigationshowchart';
var navigationStatus = NAVIGATION_INIT;

var pageW, pageH;

var lightGreen = '#90ee90';
var lightGreenTransparent = '#90ee9099';
var red = '#a8071e';

function initPageDims() {
    pageW = $('#renderbody').width();
    pageH = $('#renderbody').height();
}

/* ################################################################################ */
/* MANAGE BUTTONS WHEN NAVIGATING BETWEEN SEARCH/CHART PANELS */
/* ################################################################################ */
function manageNavigation() {
    let containerFunction = null;

    switch (navigationStatus) {
        case NAVIGATION_BACK_TO_SEARCH:
            closeCharmsLegend();
            removeBackToSearchButtonProcedure();
            removeBackClearToSearchButtonProcedure();
            removeOpenCharmsButtonProcedure();
            removeCharmsLegendButtonProcedure();
            removeCharmsColorSelectorButtonProcedure();
            containerFunction = function () {
                addSearchButton();
                addCreateChartsButton();
                addGoToChartsButton();
            };
            executeAfter(containerFunction, 500);
            break;

        case NAVIGATION_BACK_CLEAR_CHART:
            initChartSeries();
            initSpectraInfo();
            initFitArrays();
            setCloudTextAndIconStatus(SPECTRUM_TYPE_CONTINUUM_REMOVED, false); // reset cloud icon/text in 'fit options' panel

            setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_ALIGNMENT);

            closeCharmsLegend();
            removeBackToSearchButtonProcedure();
            removeBackClearToSearchButtonProcedure();
            removeOpenCharmsButtonProcedure();
            removeCharmsLegendButtonProcedure();
            removeCharmsColorSelectorButtonProcedure();
            containerFunction = function () {
                addSearchButton();
                addCreateChartsButton();
            };
            executeAfter(containerFunction, 500);
            break;

        case NAVIGATION_SHOW_CHART:
        case NAVIGATION_CREATE_CHART:
            removeSearchButtonProcedure();
            //removeCreateChartsButtonProcedure();
            addCharmsLegendButton();
            addCharmsColorSelectorButton();
            setNavigationButtonsForChartsPanel();
            break;

        default: // NAVIGATION_INIT

            break;
    }
}

/* ---------- SET NAVIGATION BUTTONS FOR CHARTS PANEL SEARCH PANEL ---------- */
function setNavigationButtonsForChartsPanel() {
    /* add button for back-to-search */
    let containerFunction = function () {
        //addBackToSearchButton();
        addBackClearToSearchButton();
        addOpenCharmsButton();
    };
    executeAfter(containerFunction, 500);
}

/* ################################################################################ */
/* SAVE USER SETTINGS */
/* ################################################################################ */
/* items for creating a queue for saving user settings */
//var aQueue;
//var saveUserSettingPromise = ({ ...data } = {}) => () => new Promise(async resolve => {
//    await saveUserSettingAsync(data);
//    resolve();
//});

function getQueueItem(key, value) {
    return saveUserSettingPromise({ url: UrlSetUserSetting, model: { Key: key, Value: value } });
}

function callEnqueueSaveSetting(timeout, key, value, jsDelay) {
    if (timeout)
        clearTimeout(timeout);

    timeout = setTimeout(function () { enqueueSaveSetting(getQueueItem(key, value)); }, jsDelay);
}

function enqueueSaveSetting(saveSettingData) {
    aQueue.enqueue(saveSettingData);
}

/* ################################################################################ */
/* SHOW/HIDE WARNING IN DIALOG MESSAGE */
/* ################################################################################ */
async function showAndAnimateElementAsync(id, animation, speed) {
    showByClass(id);
    await animateCSS(id, animation, speed)
}

/* ################################################################################ */
/* GET/SET SETTINGS */
/* ################################################################################ */
async function getUserSettingAsync(key) {
    let model = {
        Key: key
    };

    let obj = await doAjaxGetAsync(UrlGetUserSetting, model);
    if (obj.IsOk) {
        return obj;
    } else {
        return null;
    }
}

async function saveUserSettingAsync(data) {
    let obj = await doAjaxPostAsync(data.url, data.model);
    if (obj) {
        //console.log(`${data.url}, IsOk: ${obj.IsOk}`);
        return true;
    } else {
        //console.log(`Error`);
        return false;
    }
}

/* ################################################################################ */
/* SET BUTTONS STATUS */
/* ################################################################################ */
function setButtonAlignEnabled(id, isEnabled, label) {
    setMetroUIButtonEnabled(id, isEnabled);
    $(`#${id}`).prop('title', label);
}

/* ################################################################################ */
/* ADD/REMOVE BUTTONS */
/* ################################################################################ */
function isButtonAvailable(buttonId) {
    var item = $('#buttonsAppBar').find(`#${buttonId}`);
    if (item[0])
        return true;
    else
        return false
}

/* ---------- CHARMS COLOR-PICKER ---------- */
function addCharmsColorSelectorButton() {
    addButton(showCharmsColorSelectorId, ButtonShowCharmsColorSelectorLabel, 'mif-palette', toggleCharmsColorSelector);
}

function removeCharmsColorSelectorButtonProcedure() {
    if (!isButtonAvailable(showCharmsColorSelectorId))
        return;

    animateCSS(`${showCharmsColorSelectorId}`, `bounceOutUp`, FAST, removeCharmsColorSelectorButton);
}

function removeCharmsColorSelectorButton() {
    $(`#${showCharmsColorSelectorId}`).remove();
}

/* ---------- CHARMS LEGEND ---------- */
function addCharmsLegendButton() {
    addButton(showCharmsLegendButtonId, ButtonShowCharmsLegendLabel, 'mif-list', toggleCharmsLegend);
}

function removeCharmsLegendButtonProcedure() {
    if (!isButtonAvailable(showCharmsLegendButtonId))
        return;

    animateCSS(`${showCharmsLegendButtonId}`, `bounceOutUp`, FAST, removeCharmsLegendButton);
}

function removeCharmsLegendButton() {
    $(`#${showCharmsLegendButtonId}`).remove();
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
/* OTHER */
/* ################################################################################ */
function buildId(id) {
    if (Number.isInteger(id))
        return `id${id}`;
    else
        return id;
}

function createSeriesFromSpectrumName(idItem, spectrumName, color, isPointVisible = false, showInLegend = true) {
    return {
        type: 'line',
        valueField: idItem,
        name: spectrumName,
        axis: 'valueAxis',
        color: color,
        point: { visible: isPointVisible },
        showInLegend: showInLegend
    };
}

function createSeriesNameFromSpectrumNameAndType(name, spectrumType) {
    return `${name} (${getSpectrumTypeDescription(spectrumType)})`;
}

function getIdValue(idItem) {
    let idValue = idItem
        .replace(SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_CONTINUUM_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_SMOOTHED_BY_SEGMENTS_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_SMOOTHED_WHOLE_SPECTRUM_TEMP_ID, '')
        .replace('id', '');
    return parseInt(idValue);
}

function invertYValuesBottomToTop(yValues) {
    let selectedRangeYMax = Math.max(...yValues);

    let invertedYValues = [];
    let yValuesNum = yValues.length;
    for (var i = 0; i < yValuesNum; i++) {
        invertedYValues[i] = selectedRangeYMax + Math.abs(selectedRangeYMax - yValues[i]);
        //console.log(invertedYValues[i]);
    }

    return invertedYValues;
}

function invertYValuesTopToBottom(yValues) {
    let selectedRangeYMin = Math.min(...yValues);

    let invertedYValues = [];
    let yValuesNum = yValues.length;
    for (var i = 0; i < yValuesNum; i++) {
        invertedYValues[i] = selectedRangeYMin - Math.abs(selectedRangeYMin - yValues[i]);
        //console.log(invertedYValues[i]);
    }

    return invertedYValues;
}

function isSeriesAlreadyPresent(name) {
    let series = dxChartGetAllSeries(chartContainer);

    let index = series.findIndex(x => x.name == name);

    return (index > -1);
}

function updateSegmentYRange(sourceYValues, destYRangeValues) {
    /* extract min-max for yvalues in range */
    let sourceYValuesMin = Math.min(...sourceYValues);
    let sourceYValuesMax = Math.max(...sourceYValues);
    //console.log(`rangeYValuesMin: ${rangeYValuesMin}, rangeYValuesMax: ${rangeYValuesMax}`);

    let destYValuesMin = Math.min(...destYRangeValues);
    let destYValuesMax = Math.max(...destYRangeValues);

    /* create a new y-array with fitvalues mapped to original y-values-interval */
    let fitYValues = [];
    let destYRangeValuesNum = destYRangeValues.length;
    for (var i = 0; i < destYRangeValuesNum; i++) {
        fitYValues[i] = ((destYRangeValues[i] - destYValuesMin) / (destYValuesMax - destYValuesMin)) * (sourceYValuesMax - sourceYValuesMin) + sourceYValuesMin;
    }

    return fitYValues;
}

/* ################################################################################ */
/* BUBBLES */
/* ################################################################################ */
function showBubble(id) {
    let callbackShow = function () {
        let callbackHide = function () {
            hide(id);
        };
        setTimeout(function () { animateCSS(id, 'fadeOut', FAST, callbackHide) }, 2000);
    };

    show(id);
    animateCSS(id, 'fadeIn', FAST, callbackShow);
}