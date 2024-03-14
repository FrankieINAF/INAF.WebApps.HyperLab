var backToSearchButtonId = 'buttonBackToSearch';
var backClearToSearchButtonId = 'buttonBackClearToSearch';
var showCharmsColorSelectorId = 'buttonShowCharmsColorSelector';
var showCharmsLegendButtonId = 'buttonShowCharmsLegend';
var goToChartsButtonId = 'buttonGoToCharts';
var helpButtonId = 'buttonHelp';
var openCharmsButtonId = 'buttonOpenCharms'
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

/* ################################################################################ */
/* SAVE USER SETTINGS */
/* ################################################################################ */
/* items for creating a queue for saving user settings */
//var aQueue;
//var _ = ({ ...data } = {}) => () => new Promise(async resolve => {
//    await saveUserSettingAsync(data);
//    resolve();
//});

//function getQueueItem(key, value) {
//    return _({ url: UrlSetUserSetting, model: { Key: key, Value: value } });
//}

//function callEnqueueSaveSetting(timeout, key, value, jsDelay) {
//    if (timeout)
//        clearTimeout(timeout);

//    timeout = setTimeout(function () { enqueSaveSetting(getQueueItem(key, value)); }, jsDelay);
//}

//function enqueSaveSetting(saveSettingData) {
//    aQueue.enqueue(saveSettingData);
//}

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

/* ---------- SHOW-CHARTS BUTTON ---------- */
function addCreateChartsButton() {
    addButton(showChartsButtonId, ButtonGraphSelectedSpectraLabel, 'mif-chart-line', createChartsProcedureCaller);
}

function removeCreateChartsButtonProcedure() {
    if (!isButtonAvailable(showChartsButtonId))
        return;

    /* show the 'create chart' button */
    animateCSS(`${showChartsButtonId}`, `bounceOutUp`, FAST, removeCreateChartsButton);
}

function removeCreateChartsButton() {
    $(`#${showChartsButtonId}`).remove();
}

/* ---------- BACK-TO-SEARCH BUTTON ---------- */
function addBackToSearchButton() {
    addButton(backToSearchButtonId, ButtonBackToSearchLabel, 'mif-arrow-left', backToSearchProcedure);
}

function removeBackToSearchButtonProcedure() {
    if (!isButtonAvailable(backToSearchButtonId))
        return;

    animateCSS(`${backToSearchButtonId}`, `bounceOutUp`, FAST, removeBackToSearchButton);
}

function removeBackToSearchButton() {
    $(`#${backToSearchButtonId}`).remove();
}

/* ---------- BACK-CLEAR-TO-SEARCH BUTTON ---------- */
function addBackClearToSearchButton() {
    addButton(backClearToSearchButtonId, ButtonBackClearToSearchLabel, 'mif-cross-light', backClearToSearchProcedureAsync);
}

function removeBackClearToSearchButtonProcedure() {
    if (!isButtonAvailable(backClearToSearchButtonId))
        return;

    animateCSS(`${backClearToSearchButtonId}`, `bounceOutUp`, FAST, removeBackClearToSearchButton);
}

function removeBackClearToSearchButton() {
    $(`#${backClearToSearchButtonId}`).remove();
}

/* ---------- CHARMS BUTTON ---------- */
function addOpenCharmsButton() {
    addButton(openCharmsButtonId, ButtonOpenCharmsLabel, 'mif-magic-wand', openCharms);
}

function removeOpenCharmsButtonProcedure() {
    if (!isButtonAvailable(openCharmsButtonId))
        return;

    animateCSS(`${openCharmsButtonId}`, `bounceOutUp`, FAST, removeOpenCharmsButton);
}

function removeOpenCharmsButton() {
    $(`#${openCharmsButtonId}`).remove();
}

/* ---------- GO-TO-CHARTS BUTTON ---------- */
function addGoToChartsButton() {
    isChartLoadRequired = false;
    addButton(goToChartsButtonId, ButtonBackToSearchLabel, 'mif-arrow-right', showChartsProcedure);
}

function removeGoToChartsButtonProcedure() {
    if (!isButtonAvailable(goToChartsButtonId))
        return;

    animateCSS(`${goToChartsButtonId}`, `bounceOutUp`, FAST, removeGoToChartsButton);
}

function removeGoToChartsButton() {
    $(`#${goToChartsButtonId}`).remove();
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

/* ---------- ZOOM-OUT BUTTON ---------- */
function addZoomOutButton() {
    addButton(zoomOutButtonId, ButtonZoomOutLabel, 'mif-zoom-out', resetZoom);
}

function removeZoomButtonProcedure() {
    if (!isButtonAvailable(zoomOutButtonId))
        return;

    animateCSS(`${zoomOutButtonId}`, `bounceOutUp`, FAST, removeZoomButton);
}

function removeZoomButton() {
    $(`#${zoomOutButtonId}`).remove();
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
            removeCreateChartsButtonProcedure();
            addCharmsLegendButton();
            addCharmsColorSelectorButton();
            setNavigationButtonsForChartsPanel();
            break;

        default: // NAVIGATION_INIT
            
            break;
    }
}

/* ---------- INIT BUTTONS IN SEARCH PANEL ---------- */
function initButtonsInSearchPanel() {
    removeBackToSearchButton();
    addSearchButton();
    addHelpButton();
}

/* ---------- SET NAVIGATION BUTTONS FOR CHARTS PANEL SEARCH PANEL ---------- */
function setNavigationButtonsForChartsPanel() {
    removeGoToChartsButtonProcedure();
    /* add button for back-to-search */
    let containerFunction = function () {
        addBackToSearchButton();
        addBackClearToSearchButton();
        addOpenCharmsButton();
    };
    executeAfter(containerFunction, 500);
}

/* ################################################################################ */
/* MANAGE OVERFLOW-Y */
/* ################################################################################ */
function setOverflowYAuto(isRequired = false) {
    if (isMobile() || isRequired)
        $('#wrapper').removeClass('overflow-y-hidden').addClass('overflow-y-auto');
}

function setOverflowYHidden() {
    if (!isMobile())
        $('#wrapper').removeClass('overflow-y-auto').addClass('overflow-y-hidden');
}

/* ################################################################################ */
/* MANAGE PANELS SEARCH/CHART POSITION */
/* ################################################################################ */
function initSecondaryPanels() {
    //console.log('top:' + position.top);
    setPositionTopRelativePx('charts', -(pageH + APPBAR_HEIGHT) / 2);
    setPositionLeftRelativePercent('charts', '100');
    //setPositionCompleteRelativePxPercent('charts', -(pageH + APPBAR_HEIGHT) / 2, '100');
    $('#charts').height(pageH - APPBAR_HEIGHT);
}

function initPageDims() {
    pageW = $('#renderbody').width();
    pageH = $('#renderbody').height();
}

/* ---------- FOR SEARCH ---------- */
function setChartsPositionForSearch() {
    setChartsPositionForSearchDesktop();
}

function setWrapperPositionForSearch() {
    setWrapperPositionForSearchDesktop();
}

/* FOR SEARCH (DESKTOP) */
function setChartsPositionForSearchDesktop() {
    setPositionTopRelativePx('charts', -(pageH - APPBAR_HEIGHT));
    setPositionLeftRelativePercent('charts', 100);
}

function setWrapperPositionForSearchDesktop() {
    setPositionLeftRelativePercent('wrapper', 0);
}

/* ---------- FOR CHARTS ---------- */
function setChartsPositionForChart() {
    if (isMobile())
        setChartsPositionForChartMobile();
    else
        setChartsPositionForChartDesktop();
}

function setWrapperPositionForChart() {
    setWrapperPositionForChartDesktop();
}

/* FOR CHART (DESKTOP) */
function setWrapperPositionForChartDesktop() {
    setPositionLeftRelativePercent('wrapper', -100);
}

function setChartsPositionForChartDesktop() {
    setPositionTopRelativePx('charts', -pageH + APPBAR_HEIGHT);
    setPositionLeftRelativePx('charts', 0);
}

/* FOR CHART (MOBILE) */
function setChartsPositionForChartMobile() {
    setPositionTopAbsolutePx('charts', -(pageH - (2 * APPBAR_HEIGHT)));
    setPositionLeftRelativePx('charts', 0);
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
    return parseInt(idItem.replace('id', ''));
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
var chart;
var chartContainer;

var chartConstantLines;

var spectraInfo = [];
var spectraTree = [];
var spectraTypeColors = [];
var isChartLoaded = false;

var MIN_Y = 'minY';
var MAX_Y = 'maxY';

/* ################################################################################ */
/* SHOW/HIDE CHARTS */
/* ################################################################################ */
async function backClearToSearchProcedureAsync() {
    setMenuExpanded();

    navigationStatus = NAVIGATION_BACK_CLEAR_CHART;

    /* remove all constant lines from memory and chart */
    initConstantLines();
    resetShownConstantLines();

    if (isCharmsOpen()) {
        await closeCharmsAsync(false);
    } else {
        /* remove all loaded items */
        await initCharmsPhase1Async();
        /* reset tabs visualization to 1st tab */
        showSelectedTab('charmsTabs', 'alignmentoptionstitle');
    }

    disposeChart();

    setWrapperPositionForSearch();
    animateCSS(`charts`, `slideOutRight`, FAST, setChartsPositionForSearch); //function defined in common.js
    animateCSS(`wrapper`, `slideInLeft`, FAST, manageNavigation);

    selectedSpectrumForProcessingId = 0;

    /* hide info button about auto hidden spectra when one of them is selected for processing */
    hideByClass('buttonShowToastAutoHideNotSelectedSpectra');
}

function backToSearchProcedure() {
    hideCharms();

    setMenuExpanded();

    setWrapperPositionForSearch();

    navigationStatus = NAVIGATION_BACK_TO_SEARCH;

    animateCSS(`charts`, `slideOutRight`, FAST, setChartsPositionForSearch); //function defined in panel.js
    animateCSS(`wrapper`, `slideInLeft`, FAST, manageNavigation); //function defined in panel.js
}

function createChartsProcedure() {
    setMenuCollapsed();

    animateCSS(`wrapper`, `fadeOutLeft`, FAST, setWrapperPositionForChart); //function defined in common.js
    animateCSS(`charts`, `slideInRight`, FAST, setChartsPositionForChart); //function defined in common.js

    navigationStatus = NAVIGATION_CREATE_CHART;
    executeAfter(loadChartsProcedure, 500);
}

function createChartsProcedureCaller() {
    if (isChartLoaded)
        showDialogWithActions(WARNING_LABEL, ChartOverwriteQuestion, WARNING, YES_LABEL, NO_LABEL, createChartsProcedure);
    else
        createChartsProcedure();
}

function showChartsProcedure() {
    setMenuCollapsed();

    setChartsPositionForChart();
    animateCSS(`wrapper`, `slideOutLeft`, FAST, setWrapperPositionForChart); //function defined in panel.js
    animateCSS(`charts`, `slideInRight`, FAST); //function defined in panel.js

    navigationStatus = NAVIGATION_SHOW_CHART;
    manageNavigation();
}

/* ################################################################################ */
/* CHARTS */
/* ################################################################################ */
function disposeChart() {
    if (!isChartLoaded)
        return;

    chartContainer.dxChart("dispose");
    $(chartContainer).empty();
    isChartLoaded = false;
}

async function loadChartsProcedure() {
    manageNavigation();

    await loadSpectraTypeColors();

    /* load data and show charts */
    loadCharts();
}

async function loadCharts() {
    setLoadingCircleIsVisible(true);

    var model = {
        Ids: selectedSpectra
    };

    let obj = await doAjaxPostAsync(UrlGetSpectra, model);
    if (obj) {
        //console.log(obj);
        setSpectraInfo(obj.SpectraInfo);
        chartSeries = createSeriesFromPoint(obj.Points[0]);
        createChart(obj.Points, chartSeries, obj.AxisRange);
        isChartLoaded = true;
        setLoadingCircleIsVisible(false);
        await initCharmsPhase1Async();
        if (obj.SpectraInfo.length > 1)
            showToast(ChartColorsDifferentiationMessage, 3000, INFO);
    } else {
        setLoadingCircleIsVisible(false);
        isChartLoaded = false;
        showDialogWithAction(ERROR_LABEL, NoSpectraFoundForSelectedIdsMessage, ALERT, OK_LABEL, backToSearchProcedure);
    }
}

function createChart(dataSource, series, axisRange) {
    let size = calculateChartSize();
    let lc = getLegendLocation();

    /* dispose existant chart, avoiding issues with zoom when recreating */
    disposeChart();

    chart = chartContainer.dxChart({
        /* data */
        rotated: isMobile(),
        dataSource: dataSource,
        animation: {
            enabled: false,
            maxPointCountSupported: 1
        },
        customizePoint: function () {
            if (this.seriesName == SERIES_FIT_POINTS || this.seriesName == SERIES_HIGHLIGHTED_SEGMENT) {
                return { image: { url: 'images/search/red_dot.png', width: 12, height: 12 }, visible: true };
            } else if (this.seriesName == SERIES_BAND_CENTER) {
                return { image: { url: 'images/search/black_dot.png', width: 12, height: 12 }, visible: true };
            }
        },
        commonSeriesSettings: {
            argumentField: "X",
            type: "line",
            point: { visible: true, size: 6 },
        },
        argumentAxis: {
            name: 'argumentAxis',
            argumentType: 'numeric',
            type: 'continuous',
            title: ChartWavelengthsLabel,
            valueMarginsEnabled: true,
            tickInterval: 200,
            minorTickInterval: 50,
            label: {
                displayMode: "rotate",
                rotationAngle: 45,
                format: "decimal"
            }
        },
        valueAxis: {
            name: 'valueAxis',
            type: 'continuous',
            showZero: false,
            visible: true,
            title: ChartReflectanceLabel,
        },
        series: series,
        /* visualization options */
        zoomAndPan: {
            valueAxis: "both",
            argumentAxis: "both",
            dragToZoom: true,
            allowMouseWheel: true,
            panKey: "shift"
        },
        scrollBar: {
            visible: true
        },
        size: {
            height: size.h,
            width: size.w
        },
        commonAxisSettings: {
            grid: {
                visible: true
            },
            minorGrid: {
                visible: true,
                opacity: 1
            },
        },
        crosshair: {
            enabled: true
        },
        //margin: {
        //    bottom: 20
        //},
        legend: {
            visible: false
        },
        /* interactivity options */
        tooltip: {
            enabled: true,
            customizeTooltip: function (arg) {
                if (arg.seriesName == SERIES_HIGHLIGHTENED_BAND)
                    return {
                        text: ''
                    };
                else
                    return {
                        html: getTooltip(arg.seriesName, arg.argumentText, arg.valueText)
                    };
            },
            opacity: 1,
        },
        /* export options */
        export: {
            enabled: true,
        },
        /* events */
        onDone: function (evt) {
            extractVisualRangesFromDataSource(axisRange);
        },
        onPointClick: async function (evt) {
            if (isPointClickForFitEnabled) {
                let x = parseInt(evt.target.argument);
                let y = parseFloat(evt.target.value);
                let point = createSimplePoint(x, y);

                let seriesId = evt.target.series.getValueFields()[0];
                let seriesName = evt.target.series.name;

                let mousePosX = evt.event.clientX;
                let mousePosY = evt.event.clientY;
                //console.log(`onPointClick - ${evt.event.clientX}, ${evt.event.clientY}`);

                addRemoveSelectedPointForFittingProcedure(seriesId, seriesName, point, mousePosX, mousePosY);
            }
        },
        //onPointHoverChanged: function(evt) {
        //    if (getSpectrumTypeValueBySeriesName(evt.target.series.name) == SPECTRUM_TYPE_CONTINUUM_REMOVED) {
        //        console.log(`${onPointHoverChanged.name} - x,y: (${evt.target.argument}, ${evt.target.value}), series: ${evt.target.series.name}`);
        //        //highlightBandAndExecuteAnalyisProcedureAsync(evt.target.argument, evt.target.value, evt.target.series.name);
        //    }
        //},
        //onSeriesClick: async function (evt) {
        //    if (evt.target.name == HIGHLIGHTENED_BAND_SERIES)
        //        await openCharmsBandDepthAsync();
        //},
        //onSeriesSelectionChanged: function (evt) {
        //    console.log(evt);
        //},
        onZoomEnd: function (evt) {
            //console.log(evt);
            manageZoom(evt);
        }
    }).dxChart("instance");

    /* free memory */
    dataSource = 0;
}

function updateChartSize() {
    initPageDims();

    let w = pageW;
    let h = pageH;
    if (isCharmsOpen()) {
        w = (pageW - CHARMS_WIDTH);
        h = (pageH - APPBAR_HEIGHT);
    }

    $('#charts').css({
        width: `${w}px`,
        height: `${h}px`
    });

    setChartsPositionForChart();
}

/* -------------------------------------------------------------------------------- */
/* ---------- CHARTS ANCILLARY ---------- */
/* -------------------------------------------------------------------------------- */
function calculateChartSize() {
    if (isMobile())
        return { h: '90%', w: '90%' };
    else
        return { h: '80%', w: '100%' };
}

function createSeriesFromPoint(firstPoint) {
    var series = [];

    var keys = Object.keys(firstPoint);
    keys.splice(0, 1);

    let lastRawColor;
    let foundRawSpectra = 0;

    let keysNum = keys.length;
    for (var i = 0; i < keysNum; i++) {
        let keyId = getIdValue(keys[i]);
        var index = getSpectrumIndexById(keyId);
        let name = getSpectrumSeriesNameFromIndex(index);
        let color = getSpectrumTypeColor(getSpectrumTypeString(spectraInfo[index].SpectrumType));

        let isRaw = spectraInfo[index].SpectrumType == SPECTRUM_TYPE_RAW;
        if (isRaw && foundRawSpectra == 0) {
            lastRawColor = color;
            foundRawSpectra++;
        }

        if (i > 0 && isRaw) {
            /* create a slight differentiation in colors of multiple RAW spectra */
            color = lightenDarkenColor(lastRawColor, 30); // defined in common.js
            spectraInfo[index].Color = color;
            lastRawColor = color; // remember the last RAW color for using it the next time
            foundRawSpectra++;
        }
        series.push({
            valueField: keys[i],
            name: name,
            axis: 'valueAxis',
            color: color,
            isVisible: true,
        });
    }

    return series;
}

//function extractVisualRanges() {
//    var visualRangeValuesX = chartContainer.dxChart("getArgumentAxis", "argumentAxis").visualRange();
//    var valuesX = [];
//    valuesX.push(visualRangeValuesX.startValue);
//    valuesX.push(visualRangeValuesX.endValue);
//    var minX = Math.min.apply(Math, valuesX);
//    var maxX = Math.max.apply(Math, valuesX);
//    console.log(`X RANGE: ${minX},${maxX}`);
//    visualRangeX = [];
//    visualRangeX.push(minX);
//    visualRangeX.push(maxX);

//    var visualRangeValuesY = chartContainer.dxChart("getValueAxis", "valueAxis").visualRange();
//    var valuesY = [];
//    valuesY.push(visualRangeValuesY.startValue);
//    valuesY.push(visualRangeValuesY.endValue);
//    var minY = Math.min.apply(Math, valuesY);
//    var maxY = Math.max.apply(Math, valuesY);
//    console.log(`Y RANGE: ${minY},${maxY}`);
//    visualRangeY = [];
//    visualRangeY.push(minY);
//    visualRangeY.push(maxY);

//}

function extractVisualRangesFromDataSource(axisRange) {
    chartContainer.dxChart("getValueAxis", "valueAxis").visualRange(axisRange.Min, axisRange.Max)
}

function getLegendLocation() {
    if (isMobile())
        return { p: 'outside', halign: 'right', valign: 'top', itp: 'left', };
    else
        return { p: 'outside', halign: 'center', valign: 'bottom', itp: 'bottom' };
}

function getTooltip(seriesName, argumentText, valueText) {
    var html = '<div>' +
        `<span><strong>${seriesName}</strong></span>` +
        '<br />' +
        `<span><strong>${ChartWavelengthLabel}:</strong> ${parseFloat(argumentText)}</span>` +
        '<br />' +
        `<span><strong>${ChartReflectanceLabel}:</strong> ${parseFloat(valueText).toFixed(4)}</span>` +
        '</div>';

    return html;
}

/* -------------------------------------------------------------------------------- */
/* ---------- CHARTS ACTIONS ---------- */
/* -------------------------------------------------------------------------------- */
function manageZoom(evt) {
    //console.log(`manageZoom - factor: ${evt.zoomFactor}`);
    if (evt.zoomFactor != 1) {
        addZoomOutButton();
    } else {
        removeZoomButtonProcedure();
    }
}

function resetZoom() {
    dxChartResetVisualRange(chartContainer);
}

/* ################################################################################ */
/* MANAGE CHART DIM/POS FOR ORIENTATION CHANGE */
/* ################################################################################ */
//function tryAddOrientationEventHandler() {
//    setTimeout(function () { window.addEventListener("deviceorientation", handleOrientation); }, 500);
//}

//function handleOrientation(evt) {
//    let alpha = evt.alpha;
//    //console.log(`alpha: ${alpha}`);

//    if (!chartContainer || !isChartLoaded)
//        return;

//    /* re-set the chart size */
//    $(`#charts`).css({ transition: TRANSITION_SHORTHAND });

//    /* handle chart position/orientation */
//    if (alpha > 70 && alpha < 120) {
//        console.log('HORIZONTAL');
//        if (isMobile()) {
//            let w = $('#renderbody').width();
//            let h = $('#renderbody').height();

//            $("#charts").css({ transform: 'rotate(90deg) translateX(80%)' });
//            $(chartContainer).dxChart("instance").option("width", h * 0.9);
//            $(chartContainer).dxChart("instance").option("height", w * 0.9);
//        } else
//            $("#charts").css({ transform: 'rotate(0deg) translateY(50%)' });
//    } else {
//        console.log('VERTICAL');
//        if (isMobile())
//            $("#charts").css({ transform: 'rotate(0deg) translateY(0%) translateX(0%)' });
//        else
//            $("#charts").css({ transform: 'rotate(0deg) translateY(0%)' });
//    }
//}
function findAllSpectraToBeHidden(selectedRawId) {
    let spectraToBeHiddenIds = [];

    /* find all raw spectra */
    let rawSpectra = getSpectraBySpectrumType(SPECTRUM_TYPE_RAW);

    /* find all children of raw spectra */
    rawSpectra.forEach(function (item) {
        spectraToBeHiddenIds.push(item.Id);
        let children = findSpectrumChildrenById(item.Id);
        if (children && children.length > 0)
            spectraToBeHiddenIds = spectraToBeHiddenIds.concat(children);
    });

    /* remove id of selected spectrum */
    let index = spectraToBeHiddenIds.findIndex(x => x == selectedRawId);
    if (index > -1)
        spectraToBeHiddenIds.splice(index, 1);

    return spectraToBeHiddenIds;
}

function hideSpectraToBeHidden() {
    let spectraToBeHidden = spectraInfo.filter(x => !x.IsVisible);
    spectraToBeHidden.forEach(function (item) {
        let index = getSpectrumIndexById(item.Id);

        let seriesname = getSpectrumSeriesNameFromIndex(index);

        dxChartHideSeries(chartContainer, seriesname);
    });

    return spectraToBeHidden.length;
}

/* ################################################################################ */
/* CONSTANT LINES */
/* ################################################################################ */
var CHART_CONSTANT_LINES_ALIGNMENT = 'chartconstantlinesalignment';
var CHART_CONSTANT_LINES_FIT_POINTS = 'chartconstantlinesfitpoints';

function initConstantLines() {
    chartConstantLines = {};
}

function addOrUpdateConstantLines(taskConstantLines, constantLinesSpecies) {
    chartConstantLines[constantLinesSpecies] = taskConstantLines;
}

function getConstantLines() {
    let keys = Object.keys(chartConstantLines);

    let constantLines = [];
    keys.forEach(function (key) {
        constantLines = constantLines.concat(chartConstantLines[key]);
    });

    return constantLines;
}

function removeConstantLines(constantLinesSpecies) {
    delete chartConstantLines[constantLinesSpecies];
}

function resetShownConstantLines() {
    dxChartUpdateOption(chart, 'argumentAxis.constantLines', []);
}

function updateConstantLines() {
    dxChartUpdateOption(chart, 'argumentAxis.constantLines', getConstantLines());

    hideSpectraToBeHidden();
}

function manageConstantLinesVisualization(selectedTabId) {
    /* manage vertical constant lines visualiztion */
    if (selectedTabId == OPTIONS_TITLE_ALIGNMENT) {
        if (isCheckboxChecked('alignmentCheckboxShowLines'))
            addOrUpdateConstantLines(getAlignmentConstantLines(), CHART_CONSTANT_LINES_ALIGNMENT);

        removeConstantLines(CHART_CONSTANT_LINES_FIT_POINTS);
    }

    if (selectedTabId == OPTIONS_TITLE_FIT) {
        if (isCheckboxChecked('fitChechboxShowLines'))
            addOrUpdateConstantLines(getFitPointsConstantLines(), CHART_CONSTANT_LINES_FIT_POINTS);

        removeConstantLines(CHART_CONSTANT_LINES_ALIGNMENT);
    }

    updateConstantLines();
}

/* ################################################################################ */
/* SPECTRA COLORS */
/* ################################################################################ */
async function loadSpectraTypeColors() {
    let model = {
        Key: COLOR_WILDCARD
    };

    let obj = await doAjaxGetAsync(UrlGetUserSettingsByWildcard, model);
    if (obj && obj.Responses && obj.IsOk) {
        spectraTypeColors = [];

        let colorsNum = obj.Responses.length;
        for (var i = 0; i < colorsNum; i++) {
            let key = obj.Responses[i].Key.replace('_', '').replace('_DEFAULT', '').toLowerCase();
            let spectrumTypeValue = await getSpectrumTypeValue(key);

            let item = createSpectraTypeColorKeyValueItem(spectrumTypeValue, key, obj.Responses[i].Value);

            addOrUpdateSpectraTypeColoKeyValueItem(item);
        }
    } else {
        showSimpleDialog(ERROR_LABEL, ChartLoadSpectraTypeColorsErrorMessage, ALERT);
    }
}

/* -------------------------------------------------------------------------------- */
/* ---------- SPECTRA TYPE COLORS ---------- */
/* -------------------------------------------------------------------------------- */
function addOrUpdateSpectraTypeColoKeyValueItem(colorKeyValueItem) {
    let index = spectraTypeColors.findIndex(x => x.Key == colorKeyValueItem.Key);
    if (index == -1)
        spectraTypeColors.push(colorKeyValueItem);
    else
        spectraTypeColors[index].Value = colorKeyValueItem.Value;

    /* re-order array items by spectrumType value descending */
    spectraTypeColors.sort((col1, col2) => {
        return col1.SpectrumType - col2.SpectrumType;
    });
}

function createSpectraTypeColorKeyValueItem(spectrumTypeValue, key, color) {
    return {
        SpectrumType: spectrumTypeValue,
        Key: key,
        Value: `#${color}`
    }
}

function getSpectraTypeColorsKeyFromSpectrumType(spectrumType) {
    let item = spectraTypeColors.find(x => x.SpectrumType == spectrumType);
    if (item == null)
        return null;

    return item.Key;
}

function getSpectraTypeColorsValueFromSpectrumType(spectrumType) {
    let item = spectraTypeColors.find(x => x.SpectrumType == spectrumType);
    if (item == null)
        return null;

    return item.Value;
}

function getSpectrumTypeColor(spectrumTypeDescription) {
    try {
        let fixedSpectrumTypeDescription = spectrumTypeDescription.replace(/\s/g, '').toLowerCase(); // fix spectrumType description, if needed

        let values = ['color', fixedSpectrumTypeDescription];
        let key = values.join('').toLowerCase();

        let item = spectraTypeColors.find(x => x.Key == key);
        return item.Value;
    } catch (e) {
        console.log(`getSpectraTypeColor - ex: ${e}`);
        return null;
    }
}

async function getSpectrumTypeValue(key) {
    return await window.dotNetHelper.invokeMethodAsync("retrieveSpectrumTypeFromString", key.replace('color', ''));
}


/* ################################################################################ */
/* SPECTRA INFO */
/* ################################################################################ */
/* ---- SET ----------------------------------------------------------------------- */
function addSpectrumInfo(spectrumInfo) {
    if (isSpectrumAvailableById(spectrumInfo.Id))
        return;

    spectrumInfo.IsVisible = true;
    spectraInfo.push(spectrumInfo);
}

function setSpectraInfo(spectraInfoObj) {
    spectraInfoObj.forEach(function (item) {
        item.IsVisible = true;
    });

    spectraInfo = spectraInfoObj;
}

function setSpectrumVisibility(id, isVisible) {
    let index = getSpectrumIndexById(id);
    if (index == -1)
        return;

    spectraInfo[index].IsVisible = isVisible;
}

function updateSpectrumInfoId(index, newId) {
    spectraInfo[index].Id = newId;
}

/* ---- GET ----------------------------------------------------------------------- */
function findSpectrumChildrenById(id) {
    let continueLoop = true;

    let familyIds = [];
    while (continueLoop) {
        let index = getSpectrumIndexByParentId(id);
        if (index == -1)
            continueLoop = false;
        else {
            familyIds.push(spectraInfo[index].Id);
            id = spectraInfo[index].Id;
        }
    }

    return familyIds;
}

function getAllSpectraHavingSameNameByRawId(rawId) {
    let rawSpectrum = spectraInfo.find(x => x.Id == rawId);

    return spectraInfo.filter(x => x.Name == rawSpectrum.Name);
}

function getChildrenIdsForSpectrum(id) {
    let children = [];

    let continueLoop = true;
    while (continueLoop) {
        let spectra = getSpectraByParentId(id);
        if (spectra.length == 0)
            continueLoop = false;
        else {
            spectra.forEach(function (item) {
                children.push(item.Id);
                id = item.Id;
            });
        }
    }

    return children;
}

function getChildSpectrumByRawIdAndSpectrumType(rawId, spectrumType) {
    let childSpectrum;
    let continueLoop = true;

    let id = rawId;
    while (continueLoop) {
        let spectra = getSpectraByParentId(id);
        if (spectra.length == 0)
            continueLoop = false;
        else {
            let spectraNum = spectra.length;
            for (var i = 0; i < spectraNum; i++) {
                if (spectra[i].SpectrumType == spectrumType) {
                    childSpectrum = spectra[i];
                    continueLoop = false;
                }
                else
                    id = spectra[i].Id;
            }
        }
    }

    return childSpectrum;
}

function getSpectraBySpectrumType(spectrumType) {
    return spectraInfo.filter(x => x.SpectrumType == spectrumType);
}

function getSpectraByParentId(parentId) {
    return spectraInfo.filter(x => x.ParentId == parentId);
}

function getSpectrumInfoById(id) {
    return spectraInfo.find(x => x.Id == id);
}

function getSpectrumByIdAndSpectrumType(id, spectrumType) {
    return spectraInfo.find(x => x.Id == id && x.SpectrumType == spectrumType);
}

function getSpectrumByRawIdAndSpectrumType(rawId, spectrumType) {
    let spectrum;

    let rawSpectrum = spectraInfo.find(x => x.Id == rawId);
    let rawSpectrumName = rawSpectrum.Name;

    spectrum = spectraInfo.find(x => x.Name == rawSpectrumName && x.SpectrumType == spectrumType);

    return spectrum;
}

function getSpectrumBySpectrumType(spectrumType) {
    return spectraInfo.find(x => x.SpectrumType == spectrumType);
}

function getSpectrumIndexById(id) {
    return spectraInfo.findIndex(x => x.Id == id);
}

function getSpectrumIndexByIdAndSpectrumType(id, spectrumType) {
    return spectraInfo.findIndex(x => x.Id == id && x.SpectrumType == spectrumType);
}

function getSpectrumIndexByParentId(parentId) {
    return spectraInfo.findIndex(x => x.ParentId == parentId);
}

function getSpectrumIndexByParentIdAndSpectrumType(parentId, spectrumType) {
    return spectraInfo.findIndex(x => x.ParentId == parentId && x.SpectrumType == spectrumType);
}

function getSpectrumNameById(id) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    return spectrum.Name;
}

function getSpectrumSeriesNameFromIndex(index) {
    return `${spectraInfo[index].Name} (${getSpectrumTypeDescription(spectraInfo[index].SpectrumType)})`;
}

function getSpectrumSeriesNameFromSpectrum(spectrumInfo) {
    return `${spectrumInfo.Name} (${getSpectrumTypeDescription(spectrumInfo.SpectrumType)})`;
}

function getSpectrumTypeById(id) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    return getSpectrumTypeDescription(spectrum.SpectrumType);
}

function getSpectrumTypeValueBySeriesName(seriesName) {
    let spectrumType = SPECTRUM_TYPE_NONE;

    let spectraNum = spectraInfo.length;
    for (var i = 0; i < spectraNum; i++) {
        let currentSeriesName = getSpectrumSeriesNameFromIndex(i);
        if (currentSeriesName == seriesName) {
            spectrumType = spectraInfo[i].SpectrumType;
            break;
        }
    }

    return spectrumType;
}

function getSpectrumTypeValueById(id) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    return spectrum.SpectrumType;
}

function initSpectraInfo() {
    spectraInfo = [];
}

function isAnySpectrumChildById(id) {
    let children = findSpectrumChildrenById(id);
    return (children.length > 0);
}

function isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(rawId, spectrumType) {
    let childSpectrum = getChildSpectrumByRawIdAndSpectrumType(rawId, spectrumType);

    return (childSpectrum != null);
}

function isAnySpectrumByRawIdAndSpectrumType(rawId, spectrumType) {
    let spectrum = getSpectrumByRawIdAndSpectrumType(rawId, spectrumType);
    return (spectrum != null);
}

function isAnySpectrumToBeHidden() {
    let spectra = spectraInfo.filter(x => !x.IsVisible);
    if (!spectra || spectra.length)
        return false;

    return true;
}

function isSpectrumAvailableByType(spectrumType) {
    return (spectraInfo.findIndex(x => x.SpectrumType == spectrumType) > -1);
}

function isSpectrumAvailableById(id) {
    return (spectraInfo.findIndex(x => x.Id == id) > -1);
}

function removeSpectrumByIndex(index) {
    return spectraInfo.splice(index, 1);
}

/* ################################################################################ */
/* CHARTS SERIES */
/* ################################################################################ */
function addChartSeries(series) {
    if (chartSeries.findIndex(x => x.name == series.name) == -1)
        chartSeries.push(series);
}

function findChartSeriesIndexByValueFieldId(valueField) {
    return chartSeries.findIndex(x => x.valueField == valueField);
}

function findChartSeriesIndexByName(name) {
    return chartSeries.findIndex(x => x.name == name);
}

function getSeriesColor(id) {
    let index = getSpectrumIndexById(id);
    if (index < 0)
        return;

    if (spectraInfo[index].Color)
        return spectraInfo[index].Color;
    else {
        let index2 = dxChartGetAllSeries(chartContainer).findIndex(x => x.name == createSeriesNameFromSpectrumNameAndType(spectraInfo[index].Name, spectraInfo[index].SpectrumType));
        return dxChartGetAllSeries(chartContainer)[index2].getColor();
    }
}

function getSeriesFromId(id) {
    let seriesName = getSeriesNameFromId(id);
    return dxChartGetSeriesByName(chartContainer, seriesName);
}

function getSeriesIndexByValueField(valueField) {
    return chartSeries.findIndex(x => x.valueField == valueField); 
}

function getSeriesNameFromId(id) {
    let index = getSpectrumIndexById(id);
    return getSpectrumSeriesNameFromIndex(index);
}

function getSeriesPoints(id) {
    let index = getSpectrumIndexById(id);
    if (index < 0)
        return;

    return dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromIndex(index));
}

function removeChartSeriesAt(index) {
    if (index < 0)
        return;

    chartSeries.splice(index, 1);
}

function initChartSeries() {
    chartSeries = [];
}

function isChartSeriesAvailableByName(name) {
    let index = chartSeries.findIndex(x => x.name == name);
    return (index > -1);
}

/* ################################################################################ */
/* COMPLEX OPERATIONS ON CHARTS SERIES */
/* ################################################################################ */
function removeChartSeriesByFieldIdProcedure(chartContainer, fieldId) {
    /* remove series */
    let index = findChartSeriesIndexByValueFieldId(fieldId);
    if (index > -1) {
        removeChartSeriesAt(index);
        dxChartUpdateSeries(chartContainer, chartSeries);
    }
}

function removeChartSeriesByNameProcedure(chartContainer, seriesName) {
    /* remove series */
    let index = findChartSeriesIndexByName(seriesName);
    if (index > -1) {
        removeChartSeriesAt(index);
        dxChartUpdateSeries(chartContainer, chartSeries);
    }
}
var GROUP_ITEM = 'groupItem';
var GROUP_ITEMS = 'groupItems';

var SELECTED_SEARCH_TYPE;
var SEARCH_SIMPLE_TYPE = 'searhsimpletype';
var SEARCH_COMPLEX_TYPE = 'searhcomplextype';

var selectedSpectra = [];

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
    else
        removeSelectedSpectrum(index);
}

function addSelectedspectrum(id) {
    selectedSpectra.push(id);

    if (selectedSpectra.length == 1) {
        addCreateChartsButton();
        showToast(ChartsUseChartsButtonMessage, 3000, INFO);
    }
}

function removeSelectedSpectrum(index) {
    console.log(`removeSelectedSpectrum - index: ${index}`);
    selectedSpectra.splice(index, 1);
    console.log(`removeSelectedSpectrum - selectedSpectra: ${selectedSpectra}`);
    if (selectedSpectra.length == 0) {
        removeCreateChartsButtonProcedure();
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
        let obj = await doAjaxGetAsync(UrlGetMineralsSuggestions, model);
        if (obj) {
            //console.log(obj);
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
/* DOCUMENT READY */
/* ################################################################################ */
function completePageRendering() {
    let callback = function () {
        /* retrieve page w,h */
        initPageDims();

        /* set starting position for panels */
        initSecondaryPanels();

        /* add event for handling mobile-device rotation */
        //tryAddOrientationEventHandler();

        /* set y-overflow for page */
        setOverflowYAuto();
    };

    setTimeout(function () { animateHideIntro(callback); }, 500);
}

function onWindowResize() {
    if (timeoutOnWindowResize)
        clearTimeout(timeoutOnWindowResize);

    timeoutOnWindowResize = setTimeout(function () {
        setListviewSearchConditionsUI();

        if (isChartLoaded)
            updateChartSize();
    }, 200);
}

$(document).ready(function () {

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
    $(`#${selectMaterial}Input`).ready(function () {
        $(`#${selectMaterial}Input`).keydown(function (evt) {
            getMaterialForSearchByEnter(evt, `${selectMaterial}Input`, `${selectMaterial}`);
        });
    });

    complexSearchConditionsContainer = $('#complexSearchConditionsContainer');

    /* set UI for complex seach conditions list */
    executeAfter(setListviewSearchConditionsUI, 500);

    /* animate intro for 1st loading */
    completePageRendering();

    aQueue = new AutoQueue();

    /* defined in info.js, for input with mineral percentage when sample info is 'mix' */
    setMaterialForMixEventHandler();

    /* add handler for window resize event */
    window.onresize = function () {
        onWindowResize();
    };

    /* init array for vertical constant lines */
    initConstantLines();

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

/* ################################################################################ */
/* ANCILLARY FOR SEARCH-BY-MATERIAL */
/* ################################################################################ */
function getMaterialForSearch() {
    let model = null;

    if (!suggestions)
        return null;

    try {
        let selectedValues = Metro.getPlugin('#selectMaterial', 'select').getSelected();
        let selectedTexts = Metro.getPlugin('#selectMaterial', 'select').getSelectedText();

        if (suggestions['selectMaterial'].Minerals) {
            if (selectedValues && selectedTexts) {
                model = {
                    Id: parseInt(selectedValues[0]),
                    Text: selectedTexts[0],
                    Type: MATERIAL_TYPE_MINERAL,
                };
            }
        } else if (suggestions['selectMaterial'].Rocks) {

        } else if (suggestions['selectMaterial'].MeteorClasses) {

        }

        //console.log(model);
    } catch (e) {
        console.log(`getMaterialForSearch - ex: ${e}`);
        showSimpleDialog(ERROR_LABEL, SearchByMaterialErrorMessage, ALERT);
    }

    return model;
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
async function searchSimpleByMaterial() {
    let model = getMaterialForSearch();

    if (!model)
        return;

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleGroupsByMaterial, model, 'searchResultsContainer');
}

async function searchSimpleByMineralType() {
    let plugin = Metro.getPlugin('#selectMineralType', 'select');

    let model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleByMineralType, model, 'searchResultsContainer');
}

async function searchSimpleByOriginType() {
    let plugin = Metro.getPlugin('#selectOriginType', 'select');

    let model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleByOriginType, model, 'searchResultsContainer');
}

async function searchSimpleBySampleName() {
    let text = $('#selectSampleName').val();

    if (!text) {
        showSimpleDialog(WARNING_LABEL, SearchBySampleNameEmptyErrorMessage, WARNING);
        return;
    }

    let model = {
        Text: text
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleGroupsBySampleName, model, 'searchResultsContainer');
}

async function searchSimpleBySampleType() {
    var plugin = Metro.getPlugin('#selectSampleDataType', 'select');

    var model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleBySampleType, model, 'searchResultsContainer');
}

var conditionsIndex = 0;
var complexSearchConditionsContainer;

var currentlyUsedGroups = [];
var complexSearchConditions = [];

var areSavedComplexSearchesAvailable = false;

var DEFAULT_WAIT_ms = 1000;

function setListviewSearchConditionsUI() {
    if (isMobile()) {
        $("#listviewSearchConditions").data("listview").view('icons');
    } else {
        $("#listviewSearchConditions").data("listview").view('list');
    }
}

/* ################################################################################ */
/* MANAGE CONDITIONS */
/* ################################################################################ */
/* add a condition model */
function addConditionModel(model) {
    complexSearchConditions.push(model);
}

function isFirstConditionGroup(index) {
    let items = complexSearchConditions.filter(x => x.Index < index);
    return (items.length == 0);
}

function isFirstConditionInGroup(conditionType, groupIndex) {
    let groupItems = complexSearchConditions.filter(x => x.ConditionType == conditionType);

    if (!groupItems)
        return false;

    let groupIndexMin = Math.min(...groupItems.map(o => o.GroupIndex));
    return (groupIndexMin == groupIndex)
}

/* try to remove a condition model, if found */
function tryRemoveConditionModel(conditionType, groupIndex) {
    let index = complexSearchConditions.findIndex(x => x.ConditionType == conditionType && x.GroupIndex == groupIndex);

    if (index > -1)
        complexSearchConditions.splice(index, 1);
}

/* remove a condition UI element and, if required, the whole group it belongs to and the previous condition operators group */
function removeConditionProcedure(id, index, groupIndex, conditionType) {
    /* 1) remove condition (and operators) UI item */
    remove(id);

    let isFirstInGroup = isFirstConditionInGroup(conditionType, groupIndex);

    /* 2) remove the related model */
    tryRemoveConditionModel(conditionType, groupIndex);

    /* 3) remove a conditional operator, depending on the position of conditions in the group */
    /* 3.1) check whether removed item is the first or not in the group */
    if (isFirstInGroup) {
        /* if the condition is the 1st in the group, then removed the next conditional operator (UI item + model)... */
        removeMetroUIElemByName(`searchTypeRadio${index}${groupIndex + 1}`);
        tryRemoveConditionOperatorsModelForItem(groupIndex + 1, conditionType);
    } else
        /* ...otherwise remove the previous one (only model, UI item has been already removed @ step 1) */
        tryRemoveConditionOperatorsModelForItem(groupIndex - 1, conditionType);

    /* 4) if no conditions of current conditionType are anymore available, then free the group */
    if (!isAny(conditionType))
        removeFromCurrentlyUsedGroups(conditionType);

    /* manage UI by checking if any other group is available or list of saved conditions must be shown again */
    manageRemovedCondition(conditionType);
}

/* ask whether user wants to remove a conditions group or not. if yes, then remove it */
function removeConditionsGroup(conditionType, id, index) {
    askAndExecute(SearchComplexQueryConditionsManagement, SearchComplexRemoveGroupQuestion, removeConditionsGroupExecute, [conditionType, id, index]);
}

function removeConditionsGroupExecute(conditionType, id, index) {
    try {
        /* 1) remove all condition models */
        let conditions = complexSearchConditions.filter(x => x.Index == index);

        let conditionsNum = conditions.length;
        for (var i = 0; i < conditionsNum; i++) {
            tryRemoveConditionModel(conditionType, conditions[i].GroupIndex)
        }

        /* 2) remove group */
        removeConditionsGroupProcedure(id, index, conditionType);
    } catch (e) {
        console.log(`removeConditionsGroupExecute - e: ${e}`);
    }
}

/* remove group UI item, from used ones, previous condition operators (if required) */
function removeConditionsGroupProcedure(id, index, conditionType) {
    /* remove group UI item */
    remove(id);

    /* remove group from currently used ones */
    removeFromCurrentlyUsedGroups(conditionType);

    if (isFirstConditionGroup(index))
        /* if current group is the 1st one, then remove the following operators group... */
        removeConditionOperatorsGroup(index + 1);
    else
        /* ...otherwise remove the previous conditions operator, if found */
        removeConditionOperatorsGroup(index - 1);

    /* check whether showing explanation is required or not...  */
    checkComplexSearchesIntroIsRequired();

    /* ...and make the related button available again */
    setGroupButtonInUse(conditionType, false);
}

/* remove the condition operators group preceding conditions group that is currently being removed */
function removeConditionOperatorsGroup(index) {
    /* remove UI item... */
    let items = $(complexSearchConditionsContainer).find(`[tag=${(index)}]`);
    if (items && items.length > 0) {
        /* remove UI element */
        remove(items[0].id);
    }

    /* ...and model */
    tryRemoveConditionOperatorsModelForGroup(index);
}

/* remove operator condition model when removing conditions group */
function tryRemoveConditionOperatorsModelForGroup(index) {
    let conditionIndex = complexSearchConditions.findIndex(x => x.Index == index && x.ConditionType == CONDITION_OPERATORS);
    if (conditionIndex > -1)
        complexSearchConditions.splice(conditionIndex, 1);
}

/* remove operator condition model when removing condition within a group */
function tryRemoveConditionOperatorsModelForItem(groupIndex, conditionType) {
    let conditionIndex = complexSearchConditions.findIndex(x => x.GroupIndex == groupIndex && x.ConditionType == conditionType);
    if (conditionIndex > -1)
        complexSearchConditions.splice(conditionIndex, 1);
}

/* ################################################################################ */
/* MANAGE USED GROUPS */
/* ################################################################################ */
function addCurrentlyUsedGroup(groupName) {
    currentlyUsedGroups.push(groupName);
}

function emptyCurrentlyUsedGroups() {
    currentlyUsedGroups = [];
}

function isGroupCurrentlyUsed(groupName) {
    let index = currentlyUsedGroups.findIndex(x => x == groupName);
    if (index > -1)
        return true;
    else
        return false;
}

function removeFromCurrentlyUsedGroups(groupName) {
    let index = currentlyUsedGroups.findIndex(x => x == groupName);
    if (index > -1)
        currentlyUsedGroups.splice(index, 1);
}

/* ################################################################################ */
/* MANAGE GROUP-INDEX */
/* ################################################################################ */
function getGroupIndex(key) {
    if (key == CONDITION_OPERATORS)
        return 0;

    let items = complexSearchConditions.filter(x => x.ConditionType == key);
    if (!items)
        return 0;
    else
        return items.length;
}

function getStrictGroupIndex(key) {
    if (key == CONDITION_OPERATORS)
        return 0;

    let items = complexSearchConditions.filter(x => x.ConditionType == key && x.ConditionOperatorType == CONDITION_OPERATOR_NONE);
    if (!items)
        return 0;
    else
        return items.length;
}

function isAny(key) {
    let items = complexSearchConditions.filter(x => x.ConditionType == key);
    if (items.length == 0)
        return false;
    else
        return true;
}

/* ################################################################################ */
/* ADD/REMOVE CONDITIONS */
/* ################################################################################ */
/* -------------------------------------------------------------------------------- */
/* AND/OR OPERATORS */
/* -------------------------------------------------------------------------------- */
function addConditionsOperators(currentIndex = null) {
    let isAndChecked = true;
    let isOrChecked = false;
    let _groupIndex = null;

    let _currentIndex = null;
    if (currentIndex != null) {
        _currentIndex = currentIndex - 1;
        let item = tryGetConditionOperatorsItem(_currentIndex);
        _groupIndex = item.GroupIndex;
        switch (item.ConditionOperatorType) {
            case CONDITION_OPERATOR_OR:
                isAndChecked = false;
                isOrChecked = true;
                break;
            default:
        }
    }  else {
        _currentIndex = conditionsIndex;
        addConditionModel(getConditionModel(_currentIndex, CONDITION_OPERATORS));
    }

    let html = `<div id="${CONDITION_OPERATORS}${_currentIndex}" tag="${_currentIndex}" class="margin-left-4 d-flex flex-row bg-lightGray">`;
    /* FILLER (ONLY MOBILE) */
    if (isMobile())
        html += `<div class="cell-fs-4">&nbsp;</div>`;

    /* AND */
    html += `<div class="cell-fs-2 cell-md-2 cell-lg-1">`;
    html += getRadioButton(SearchAndLabel, CONDITION_OPERATOR_AND, 'left', _currentIndex, isAndChecked, false, _groupIndex);
    html += `</div>`;
    /* OR */
    html += `<div class="cell-fs-2 cell-md-2 cell-lg-1">`;
    html += getRadioButton(SearchOrLabel, CONDITION_OPERATOR_OR, 'right', _currentIndex, isOrChecked, false, _groupIndex);
    html += `</div>`;
    /* FILLER */
    html += `<div class="cell-fs-4 cell-md-8 cell-lg-10">&nbsp;</div>`;
    html += `</div>`;

    /* add event on radio-buttons to update the related complexSearchConditions item */
    let startid = `${searchTypeRadio}${_currentIndex}`;
    $(`[id^='${startid}']`).ready(function () {
        $(`[id^='${startid}']`).click(function () {
            let index = complexSearchConditions.findIndex(x => x.Index == _currentIndex);
            if (index > -1)
                complexSearchConditions[index].ConditionOperatorType = $(this).attr('data-tag');
        });
    });

    /* append html to create group */
    $(complexSearchConditionsContainer).append(html);

    conditionsIndex++;
}

function getRadioButton(label, conditionOperator, captionPosition, currentIndex, isChecked, useCustomHeight, groupIndex) {
    let html = '';
    html += `<input type="radio" `;
    let groupIndexLabel = (groupIndex != null ? groupIndex : '');
    html += `name="${searchTypeRadio}${currentIndex}${groupIndexLabel}" `;
    html += `id="${searchTypeRadio}${currentIndex}${groupIndexLabel}${label}" `;
    html += `data-role="radio" `;
    html += `data-style="2" `;
    html += `data-caption="${label}" `;
    html += `data-caption-position="${captionPosition}" `;
    html += `data-tag="${conditionOperator}" `;
    html += `data-cls-check="bd-cyan" `;
    let checked = (isChecked ? 'checked' : '');
    let customHeight = (useCustomHeight ? 'group-radio' : '');
    html += `class="d-flex flex-justify-right ${customHeight}" ${checked}>`;
    return html;
}

/* -------------------------------------------------------------------------------- */
/* MATERIAL CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionMaterial(liId, currentIndex = null, groupIndex = null) {
    /* only 1 group per type is allowed, if already present then return */
    if (isGroupCurrentlyUsed(CONDITION_TYPE_MATERIAL))
        return;

    let callback = function () {
        /* try to add the top element for saving search */
        tryAddSaveSearchElement();

        /* set this group currently used */
        addCurrentlyUsedGroup(CONDITION_TYPE_MATERIAL);

        /* add and/or operators between 2 different condition gorups, if needed */
        if (isConditionsOperatorsItemRequired())
            addConditionsOperators(currentIndex);

        /* begin building up condition group */
        let _currentIndex = currentIndex;
        if (_currentIndex == null)
            _currentIndex = conditionsIndex;

        let id = `${CONDITION_TYPE_MATERIAL}${CONDITIONS_CONTAINER}`;

        let html = ``;
        html += `<div id="${id}" tag="${_currentIndex}" class="conditions-group">`;
        html += `   <div class="row cell-fs-12 d-flex flex-justify-between flex-wrap">`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupAddItem}" onclick="addConditionMaterialItem()"><span class="mif-plus"></span></button>`;
        html += `       <label class="flex-center"><span class="text-secondary text-medium">${SearchComplexConditionsOnMaterialLabel}</span></label>`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupRemoveGroup}" onclick="removeConditionsGroup('${CONDITION_TYPE_MATERIAL}', '${id}', ${_currentIndex})"><span class="mif-bin"></span></button>`;
        html += `   </div>`;
        html += `   <div id="${CONDITION_TYPE_MATERIAL}${CONDITIONS_ITEMS}" class="row">`;
        html += getConditionMaterialItem(_currentIndex, groupIndex);
        html += `   </div>`;
        html += `</div>`;

        /* hide the 'select' field and manage variable for incrementing conditionsIndex */
        setMaterialItem(currentIndex, groupIndex);

        /* append html to create group */
        $(complexSearchConditionsContainer).append(html);

        /* disable caller button and set message 'group already in use' */
        setGroupButtonInUse(liId);

        /* increment index for grouping conditions */
        conditionsIndex++;
    }

    manageAddedCondition(callback);
}

function addConditionMaterialItem(currentIndex = null, groupIndex = null) {
    let _currentIndex = currentIndex;
    if (_currentIndex == null)
        _currentIndex = getCurrentIndex(CONDITION_TYPE_MATERIAL);

    let html = getConditionMaterialItem(_currentIndex, groupIndex);

    /* realize metro plugin when item has been created */
    setMaterialItem(_currentIndex, groupIndex);

    /* append html to create item */
    $(`#${CONDITION_TYPE_MATERIAL}${CONDITIONS_ITEMS}`).append(html);
}

function getConditionMaterialItem(currentIndex = null, groupIndex = null) {
    let isBuildingFromExistingConditions = true;

    let _groupIndex = groupIndex;
    if (groupIndex == null) {
        isBuildingFromExistingConditions = false;
        _groupIndex = getGroupIndex(CONDITION_TYPE_MATERIAL);
    }

    let htmloperators = '';
    if (_groupIndex > 0) {
        htmloperators = buildConditionOperatorsGroup(currentIndex, _groupIndex - 1, CONDITION_TYPE_MATERIAL);

        /* set action for radio buttons to update the related complexSearchConditions item */
        let startid = `${searchTypeRadio}${currentIndex}${groupIndex}`;
        $(`[id^='${startid}']`).ready(function () {
            $(`[id^='${startid}']`).click(function () {
                /* retrieve index/groupIndex from last 2 chars of id */
                let retrievedIndex = parseInt(startid.charAt(startid.length - 2));
                let retrievedGroupIndex = parseInt(startid.charAt(startid.length - 1));
                let index = complexSearchConditions.findIndex(x => x.Index == retrievedIndex && x.GroupIndex == retrievedGroupIndex);
                if (index > -1)
                    complexSearchConditions[index].ConditionOperatorType = $(this).attr('data-tag');
            });
        });

        /* update the groupIndex value for next condition model (only if no groupIndex value is passed) */
        if (groupIndex == null)
            _groupIndex = getGroupIndex(CONDITION_TYPE_MATERIAL);
    }

    /* if we're not building up from existings conditions, then add new condition to models */
    if (!isBuildingFromExistingConditions)
        addConditionModel(getConditionModelWithValueText(currentIndex, CONDITION_TYPE_MATERIAL));

    let inputid = `${CONDITION_TYPE_MATERIAL}Input${currentIndex}${_groupIndex}`;
    let selectid = `${CONDITION_TYPE_MATERIAL}${currentIndex}${_groupIndex}`;

    let html = '';
    html += `<div id="${selectid}Container" class="d-flex flex-column margin-horizontal-4" ${getRemoveButtonOpacityActionsHtml(currentIndex, _groupIndex)}>`;
    /* add radio button condition if required */
    if (_groupIndex > 0) {
        html += `   <div class='d-flex flex-row'>`;
        html += htmloperators;
    }
    html += `   <div class='d-flex flex-row'>`;
    html += '       <div>';
    let valueText = tryGetValueText(currentIndex, _groupIndex, CONDITION_TYPE_MATERIAL);
    if (valueText == null)
        valueText = '';
    html += `           <input id="${inputid}" type="text" value="${valueText}" placeholder="${SearchByMaterialPlaceholder}" class="select-item-width" data-role="input" onchange="setMaterialErrorState('${inputid}', false)" data-search-button="true" data-search-button-click="custom" data-on-search-button-click="getMaterialsSuggestions('${inputid}','${selectid}')" />`;
    html += `           <select id="${selectid}" data-role="select" data-cls-select="overlap select-item-width" data-on-change="manageValueSelection('${selectid}')"></select>`;
    html += '       </div>';
    html += `       <button class="button dark cycle small outline margin-top-4 margin-left-8" onclick="resetSearchByMaterial('${inputid}')" title="${SearchClearSuggestionsButtonTitle}"><span class="mif-cross-light"></span></button >`;
    html += getRemoveButtonHtml(`${selectid}Container`, currentIndex, _groupIndex, `${CONDITION_TYPE_MATERIAL}`);
    html += `   </div>`;
    if (_groupIndex > 0)
        html += `   </div>`;
    let spanclass = 'field-validation-valid';
    if (_groupIndex > 0)
        spanclass += ' field-validation-text2';
    html += `<div><span id="${inputid}Validation" class='${spanclass}'></span></div>`;
    html += `</div>`;

    /* manage variable for incrementing conditionsIndex */
    $(`#${inputid}`).ready(function () {
        /* enable search for materials suggestions when 'Enter' is pressed */
        $(`#${inputid}`).keydown(function (evt) {
            getMaterialForSearchByEnter(evt, evt.target.id, evt.target.id.replace('Input', ''), manageValueSelection);
        });

        /* the following is used when building up conditions from saved searches */
        if ($(`#${inputid}`).val() != '') {
            getMaterialsSuggestions(inputid, selectid, manageValueSelection);
        }
    });

    return html;
}

function isMaterialType(object, selectedValue, selectedText) {
    let isMaterialTypeFound = false;

    let keys = Object.keys(object);
    keys.forEach(x => {
        if (x == selectedValue && object[x] == selectedText) {
            isMaterialTypeFound = true;
        }
    });

    return isMaterialTypeFound;
}

function manageValueSelection(id) {
    let selectedValues = Metro.getPlugin(`#${id}`, 'select').getSelected();
    let selectedTexts = Metro.getPlugin(`#${id}`, 'select').getSelectedText();

    let materialType = '';
    let isMaterialTypeFound = false;

    if (suggestions[id].Minerals) {
        if (isMaterialType(suggestions[id].Minerals, selectedValues[0], selectedTexts[0])) {
            isMaterialTypeFound = true;
            materialType = MATERIAL_TYPE_MINERAL;
        }
    }
    if (!isMaterialTypeFound && suggestions[id].Rocks) {
        if (isMaterialType(suggestions[id].Rocks, selectedValues[0], selectedTexts[0])) {
            isMaterialTypeFound = true;
            materialType = MATERIAL_TYPE_ROCK;
        }
    }
    if (!isMaterialTypeFound && suggestions[id].MeteorClasses) {
        if (isMaterialType(suggestions[id].MeteorClasses, selectedValues[0], selectedTexts[0])) {
            isMaterialTypeFound = true;
            materialType = MATERIAL_TYPE_METEORCLASS;
        }
    }

    /* retrieve index/groupIndex from last 2 chars of id */
    let currentIndex = parseInt(id.charAt(id.length - 2));
    let groupIndex = parseInt(id.charAt(id.length - 1));

    /* update condition model */
    updateConditionModelForMaterial(parseInt(selectedValues[0]), currentIndex, groupIndex, materialType);
}

function setMaterialItem(currentIndex, groupIndex) {
    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getGroupIndex(CONDITION_TYPE_MATERIAL) - 1;

    let selectid = `${CONDITION_TYPE_MATERIAL}${currentIndex}${_groupIndex}`;

    $(`#${selectid}`).ready(function () {
        /* hide the 'select' element and leave the 'input' one visible for searching material... */
        hideMetroUIElem(`${selectid}`);
        /* animate the ui items container */
        animateCSS(`${selectid}Container`, `bounceIn`, FAST);
    });
}

/* -------------------------------------------------------------------------------- */
/* MINERAL CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionMineralType(liId, groupIndex = null) {
    addConditionSelectItem(liId, CONDITION_TYPE_MINERAL_TYPE, mineralTypes, 'mineralTypes', selectMineralType, 'selectMineralType', SearchComplexConditionsOnMineralTypeLabel, groupIndex);
}

/* -------------------------------------------------------------------------------- */
/* ORIGIN TYPE CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionOriginType(liId, groupIndex = null) {
    addConditionSelectItem(liId, CONDITION_TYPE_ORIGIN_TYPE, originTypes, 'originTypes', selectOriginType, 'selectOriginType', SearchComplexConditionsOnOriginTypeLabel, groupIndex);
}

/* -------------------------------------------------------------------------------- */
/* SAMPLE NAME CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionSampleName(liId, currentIndex = null, groupIndex = null) {
    /* only 1 group per type is allowed, if already present then return */
    if (isGroupCurrentlyUsed(CONDITION_TYPE_SAMPLE_NAME))
        return;

    let callback = function () {
        /* try to add the top element for saving search */
        tryAddSaveSearchElement();

        /* set this group currently used */
        addCurrentlyUsedGroup(CONDITION_TYPE_SAMPLE_NAME);

        /* add and/or operators between 2 different condition gorups, if needed */
        if (isConditionsOperatorsItemRequired())
            addConditionsOperators(currentIndex);

        /* begin building up condition group */
        let _currentIndex = currentIndex;
        if (_currentIndex == null)
            _currentIndex = conditionsIndex;

        let id = `${CONDITION_TYPE_SAMPLE_NAME}${CONDITIONS_CONTAINER}`;

        let html = ``;
        html += `<div id="${id}" tag="${currentIndex}" class="conditions-group">`;
        html += `   <div class="row cell-fs-12 d-flex flex-justify-between flex-wrap">`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupAddItem}" onclick="addConditionSampleNameItem()"><span class="mif-plus"></span></button>`;
        html += `       <label class="flex-center"><span class="text-secondary text-medium">${SearchComplexConditionsOnSampleNameLabel}</span></label>`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupRemoveGroup}" onclick="removeConditionsGroup('${CONDITION_TYPE_SAMPLE_NAME}', '${id}', ${currentIndex})"><span class="mif-bin"></span></button>`;
        html += `   </div>`;
        html += `   <div id="${CONDITION_TYPE_SAMPLE_NAME}${CONDITIONS_ITEMS}" class="row">`;
        html += getConditionSampleNameItem(currentIndex, groupIndex);
        html += `   </div>`;
        html += `</div>`;

        /* realize metro plugin when item has been created */
        setSampleNameItem(currentIndex, groupIndex);

        /* append html to create group */
        $(complexSearchConditionsContainer).append(html);

        /* disable caller button and set title 'group already in use' */
        setGroupButtonInUse(liId);

        /* increment index for grouping conditions */
        conditionsIndex++;
    };

    manageAddedCondition(callback);
}

function addConditionSampleNameItem(currentIndex = null, groupIndex = null) {
    let _currentIndex = currentIndex;
    if (_currentIndex == null)
        _currentIndex = getCurrentIndex(conditionType);

    let html = getConditionSampleNameItem(_currentIndex, groupIndex);

    /* realize metro plugin when item has been created */
    setSampleNameItem(_currentIndex, groupIndex);

    /* append html to create item */
    $(`#${CONDITION_TYPE_SAMPLE_NAME}${CONDITIONS_ITEMS}`).append(html);
}

function getConditionSampleNameItem(currentIndex, groupIndex) {
    let isBuildingFromExistingConditions = true;

    let _groupIndex = groupIndex;
    if (groupIndex == null) {
        isBuildingFromExistingConditions = false;
        _groupIndex = getGroupIndex(CONDITION_TYPE_SAMPLE_NAME);
    }

    /* if a condition is already existing, then we need to link the old one and the new one with a condition operator and/or */
    let htmloperators = '';
    if (_groupIndex > 0) {
        htmloperators = buildConditionOperatorsGroup(currentIndex, _groupIndex - 1, CONDITION_TYPE_SAMPLE_NAME);
        /* update the groupIndex value for next condition model (only if no groupIndex value is passed) */
        if (groupIndex == null)
            _groupIndex = getGroupIndex(CONDITION_TYPE_SAMPLE_NAME);
    }

    /* if we're not building up from existings conditions, then add new condition to models */
    if (!isBuildingFromExistingConditions)
        addConditionModel(getConditionModelWithValueText(currentIndex, CONDITION_TYPE_SAMPLE_NAME));

    /* create id */
    let id = `${CONDITION_TYPE_SAMPLE_NAME}${currentIndex}${_groupIndex}`;

    let html = '';

    html += `<div id="${id}Container" class="row margin-horizontal-4 d-flex flex-column" ${getRemoveButtonOpacityActionsHtml(currentIndex, _groupIndex)}>`;
    html += `   <div class="d-flex flex-row">`;
    /* add radio button condition if required */
    if (_groupIndex > 0) {
        html += htmloperators;
    }
    /* try to retrieve value from complexSearchConditions */
    let valueText = tryGetValueText(currentIndex, _groupIndex, CONDITION_TYPE_SAMPLE_NAME);
    if (valueText == null)
        valueText = '';
    html += `       <input data-role="input" class="height-40 select-item-width" data-val="true" data-val-required="The SampleName field is required." `;
    html += `onchange="updateSampleNameModel('${id}', ${currentIndex}, ${_groupIndex})" id="${id}" name="SampleName${currentIndex}${_groupIndex}"  `;
    html += `placeholder="${SearchBySampleNamePlaceholder}" type="text" value="${valueText}"  class="" >`;
    html += getRemoveButtonHtml(`${id}Container`, currentIndex, _groupIndex, `${CONDITION_TYPE_SAMPLE_NAME}`);
    html += `   </div>`;
    let spanclass = 'field-validation-valid';
    if (_groupIndex > 0)
        spanclass += ' field-validation-text';
    html += `<div><span id="${id}Validation" class='${spanclass}'>${SearchFieldTextRequiredMessage}</span></div>`;
    html += '</div>';

    return html;
}

function setSampleNameItem(currentIndex, groupIndex = null) {
    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getStrictGroupIndex(CONDITION_TYPE_SAMPLE_NAME) - 1;

    let id = `${CONDITION_TYPE_SAMPLE_NAME}${currentIndex}${_groupIndex}`;
    $(`#${id}`).ready(function () {
        /* create Metro plugin for current html element */
        //Metro.makePlugin(`#${id}`, 'input');
        /* animate the ui items container */
        animateCSS(`${id}`, `bounceIn`, FAST);
    });
}

function updateSampleNameModel(id, currentIndex, groupIndex) {
    /* retrieve text */
    let text = $(`#${id}`).val();

    /* update UI */
    if (text.length > 0)
        setInputFieldErrorState(id, false);
    else
        setInputFieldErrorState(id, true);

    /* update condition model with text */
    let index = complexSearchConditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
    if (index > -1)
        complexSearchConditions[index].ValueText = text;
}

/* -------------------------------------------------------------------------------- */
/* SAMPLE TYPE CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionSampleType(liId, groupIndex = null) {
    addConditionSelectItem(liId, CONDITION_TYPE_SAMPLE_TYPE, sampleTypes, 'sampleTypes', selectSampleDataType, 'selectSampleDataType', SearchComplexConditionsOnSampleDataTypeLabel, groupIndex);
}

/* -------------------------------------------------------------------------------- */
/* SELECT ITEM CONDITION (MINERAL-TYPE, ORIGIN-TYPE, SAMPLE-TYPE) */
/* -------------------------------------------------------------------------------- */
function addConditionSelectItem(liId, conditionType, itemsArray, itemsArrayName, selectItemCallback, selectItemCallbackName, groupLabel, currentIndex = null, groupIndex = null) {
    /* only 1 group per type is allowed, if already present then return */
    if (isGroupCurrentlyUsed(conditionType))
        return;

    let callback = function () {
        /* try to add the top element for saving search */
        tryAddSaveSearchElement();

        /* set this group currently used */
        addCurrentlyUsedGroup(conditionType);

        /* add and/or operators between 2 different condition gorups, if needed */
        if (isConditionsOperatorsItemRequired())
            addConditionsOperators(currentIndex);

        /* begin building up condition group */
        let _currentIndex = currentIndex;
        if (_currentIndex == null)
            _currentIndex = conditionsIndex;

        let id = `${conditionType}${CONDITIONS_CONTAINER}`;

        /* build html for select item */
        let itemhtml = getSelectItem(itemsArray, _currentIndex, groupIndex, selectItemCallback, conditionType)

        let functionhtml = `addConditionSelectItemOtherItems('${conditionType}', ${itemsArrayName}, ${selectItemCallbackName})`;

        /* build html for select + condition item */
        let html = buildConditionsGroupWithSelectItems(id, _currentIndex, conditionType, itemhtml, functionhtml, groupLabel);

        /* realize metro plugin when item has been created */
        animateSelectItem(conditionType, _currentIndex);

        /* append html to create group */
        $(complexSearchConditionsContainer).append(html);

        /* disable caller button and set message 'group already in use' */
        setGroupButtonInUse(liId);

        /* increment index for grouping conditions */
        conditionsIndex++;
    }

    manageAddedCondition(callback);
}

function addConditionSelectItemOtherItems(conditionType, itemsArray, callback, currentIndex = null, groupIndex = null) {
    let _currentIndex = currentIndex;
    if (_currentIndex == null)
        _currentIndex = getCurrentIndex(conditionType);

    if (!isAddingOtherConditionAllowedForGroup(itemsArray.length, conditionType))
        return;

    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getGroupIndex(conditionType);

    let html = getSelectItem(itemsArray, _currentIndex, _groupIndex, callback, conditionType);

    /* realize metro plugin when item has been created */
    animateSelectItem(conditionType, _currentIndex);

    /* append html to create item */
    $(`#${conditionType}${CONDITIONS_ITEMS}`).append(html);
}

function getSelectItem(arrayItems, currentIndex, groupIndex, selectType, conditionType) {
    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getGroupIndex(conditionType);

    let id = `${conditionType}${currentIndex}${getStrictGroupIndex(conditionType)}Container`;

    let html = '';
    html += `<div id="${id}" class="d-flex flex-row margin-horizontal-4" ${getRemoveButtonOpacityActionsHtml(currentIndex, _groupIndex)}>`;
    /* add radio button condition if required */
    if (_groupIndex > 0) {
        html += buildConditionOperatorGroup(currentIndex, _groupIndex - 1, conditionType);
        /* update the groupIndex value for next condition model (only if no groupIndex value is passed) */
        if (groupIndex == null)
            _groupIndex = getGroupIndex(conditionType);
    }
    html += `   <div class="d-flex flex-justify-start">`;
    let selectid = `${selectType}${currentIndex}${_groupIndex}`;
    html += `       <select id="${selectid}" data-role="select" data-cls-select="select-item-width" data-on-change="updateConditionModelForSelectItem('${selectid}', ${currentIndex}, ${_groupIndex})">`;

    let arrayItemsNum = arrayItems.length;
    for (var i = 0; i < arrayItemsNum; i++) {
        html += `       <option value="${arrayItems[i].key}">${arrayItems[i].value}</option>`;
    }

    html += `       </select>`;
    html += getRemoveButtonHtml(`${id}`, currentIndex, _groupIndex, `${conditionType}`);
    html += `   </div>`;
    html += `</div>`;

    /* add condition to models */
    let _itemValue = arrayItems[0].key;
    let _itemId = 0;

    let item = tryGetComplexSearchConditionsItem(currentIndex, _groupIndex, conditionType)
    if (item) {
        _itemValue = item.ValueId;
        _itemId = item.Id;

        $(`#${selectid}`).ready(function () {
            var select = Metro.getPlugin(`#${selectid}`, 'select');
            select.val(_itemValue);
        });
    } else {
        addConditionModel(getConditionModelWithValueId(currentIndex, conditionType, _itemValue, _itemId));
    }

    return html;
}

/* -------------------------------------------------------------------------------- */
/* CONDITIONS BUILDER FUNCTIONS */
/* -------------------------------------------------------------------------------- */
function buildConditionOperatorGroup(currentIndex, groupIndex, conditionType) {
    /* try to retrieve info from complexSearchConditions */
    let item = tryGetComplexSearchConditionsItem(currentIndex, groupIndex, conditionType)

    let isOrChecked = true;
    let conditionOperatorType = CONDITION_OPERATOR_OR;
    let conditionOperatorId = 0;

    if (!item)
        addConditionModel(getConditionOperatorModel(currentIndex, groupIndex, conditionType, conditionOperatorType, conditionOperatorId));

    let html = '';
    html += `   <div class="d-flex flex-column margin-horizontal-4">`;
    html += getRadioButton(SearchOrLabel, CONDITION_OPERATOR_OR, 'right', currentIndex, isOrChecked, true, groupIndex);
    html += `   </div>`;

    return html;
}

function buildConditionOperatorsGroup(currentIndex, groupIndex, conditionType) {
    /* try to retrieve info from complexSearchConditions */
    let item = tryGetComplexSearchConditionsItem(currentIndex, groupIndex, conditionType)

    let isAndChecked = false;
    let isOrChecked = true;
    let conditionOperatorType = CONDITION_OPERATOR_OR;
    let conditionOperatorId = 0;

    if (item) {
        /* if info are available, then retrieve them.... */
        conditionOperatorType = item.ConditionOperatorType;
        conditionOperatorId = item.Id;
        switch (item.ConditionOperatorType) {
            case CONDITION_OPERATOR_AND:
                isAndChecked = true;
                isOrChecked = false;
                break;

            default:
        }
    } else
        /* ...else add condition model for 'and' operator */
        addConditionModel(getConditionOperatorModel(currentIndex, groupIndex, conditionType, conditionOperatorType, conditionOperatorId));

    let html = '';
    html += `   <div class="d-flex flex-column margin-horizontal-4">`;
    html += getRadioButton(SearchAndLabel, CONDITION_OPERATOR_AND, 'right', currentIndex, isAndChecked, true, groupIndex);
    html += getRadioButton(SearchOrLabel, CONDITION_OPERATOR_OR, 'right', currentIndex, isOrChecked, true, groupIndex);
    html += `   </div>`;

    return html;
}

function buildConditionsGroupWithSelectItems(id, currentIndex, conditionType, itemhtml, addItemFunctionHtml, groupTitle) {
    let html = '';
    html += `<div id="${id}" tag="${currentIndex}" class="conditions-group">`;
    html += `   <div class="row cell-fs-12 d-flex flex-justify-between flex-wrap">`;
    html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupAddItem}" onclick="${addItemFunctionHtml}"><span class="mif-plus"></span></button>`;
    html += `       <label class="flex-center"><span class="text-secondary text-medium">${groupTitle}</span></label>`;
    html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupRemoveGroup}" onclick="removeConditionsGroup('${conditionType}', '${id}', ${currentIndex})"><span class="mif-bin"></span></button>`;
    html += `   </div>`;
    html += `   <div id="${conditionType}${CONDITIONS_ITEMS}" class="row">`;
    html += itemhtml;
    html += `   </div>`;
    html += `</div>`;

    return html;
}

function animateSelectItem(conditionType, currentIndex) {
    let groupIndex = getGroupIndex(conditionType);

    let id = `${conditionType}${currentIndex}${groupIndex}`;
    $(`#${id}`).ready(function () {
        /* animate the ui items container */
        animateCSS(`${id}`, `bounceIn`, FAST);
    });
}

function updateConditionModel(index, value) {
    complexSearchConditions[index].ValueId = value;
}

function updateConditionModelForMaterial(value, currentIndex, groupIndex, materialType) {
    let index = complexSearchConditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
    if (index > -1) {
        complexSearchConditions[index].ValueId = value;
        complexSearchConditions[index].MaterialType = materialType
    }
}

function updateConditionModelForSelectItem(id, currentIndex, groupIndex) {
    let plugin = Metro.getPlugin(`#${id}`, 'select');
    if (!plugin)
        return;
    //console.log(`${id} val: ${plugin.val()}`);

    let index = complexSearchConditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
    if (index > -1) {
        updateConditionModel(index, parseInt(plugin.val()));
    }
}

function updateConditionModelId(currentIndex, groupIndex, id) {
    let index = complexSearchConditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
    if (index > -1)
        complexSearchConditions[index].Id = id;
}

function updateConditionOperatorModel(index, value) {
    complexSearchConditions[index].ConditionOperatorType = value;
}

/* -------------------------------------------------------------------------------- */
/* COMMON FOR CONDITIONS */
/* -------------------------------------------------------------------------------- */
function buildConditionModel(id, currentIndex, conditionType, materialType, valueId, valueText, conditionOperatorType) {
    return {
        Id: id,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: materialType, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: valueId,
        ValueText: valueText,
        ConditionOperatorType: conditionOperatorType
    };
}

function getChildren() {
    return $(complexSearchConditionsContainer).children('[id^="Condition"]');
}

function getCurrentIndex(conditionType) {
    let items = complexSearchConditions.filter(x => x.ConditionType == conditionType);
    if (items && items.length > 0)
        return items[0].Index;
    else
        return 0;
}

function getConditionModel(currentIndex, conditionType) {
    return {
        Id: 0,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: 0,
        ValueText: '',
        ConditionOperatorType: CONDITION_OPERATOR_NONE
    };
}

function getConditionModelWithValueId(currentIndex, conditionType, itemValueId, itemId) {
    let _itemId = 0;
    if (itemId)
        _itemId = itemId;
    return {
        Id: _itemId,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: itemValueId,
        ValueText: '',
        ConditionOperatorType: CONDITION_OPERATOR_NONE
    };
}

function getConditionModelWithValueText(currentIndex, conditionType, valueText, id) {
    let _valueText = '';
    if (valueText)
        _valueText = valueText;

    let _id = 0;
    if (id)
        _id = id;

    return {
        Id: _id,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: 0,
        ValueText: _valueText,
        ConditionOperatorType: CONDITION_OPERATOR_NONE
    };
}

function getConditionOperatorModel(currentIndex, groupIndex, conditionType, operatorValue, operatorId) {
    let _operatorId = 0;
    if (operatorId)
        _operatorId = operatorId;
    return {
        Id: _operatorId,
        Index: currentIndex,
        GroupIndex: groupIndex,
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: 0,
        ValueText: '',
        ConditionOperatorType: operatorValue
    };
}

function isAddingOtherConditionAllowedForGroup(arrayValuesNum, conditionType) {
    let groupIndex = getStrictGroupIndex(conditionType);
    if (groupIndex == arrayValuesNum) {
        let text = SearchComplexMaxNumOfConditionsReachedMessage.replace('r_v', arrayValuesNum);
        showSimpleDialog(WARNING_LABEL, text, WARNING);
        return false;
    }

    return true;
}

function isConditionsOperatorsItemRequired() {
    return (getChildren().length > 0);
}

function isSameGroupAlreadyPresent(conditionType) {
    let items = complexSearchConditions.filter(x => x.ConditionType == conditionType);

    if (items && items.length > 0)
        return true;
    else
        return false;
}

function manageAddedCondition(callback) {
    /* when no any condition group is available, use animation to remove the explanation before adding the 1st group,
    otherwise add the new group */
    if ($('#complexSearchConditionsContainer').children().length == 0)
        hideComplexSearchesIntroProcedure(callback);
    else
        callback();
}

function manageRemovedCondition(conditionType) {
    if ($(`#${conditionType}${CONDITIONS_ITEMS}`).children().length == 0) {
        /* when no any condition is available in a group, then remove it... */
        $(`#${conditionType}${CONDITIONS_CONTAINER}`).remove();
        /* ...and make the related button available again */
        setGroupButtonInUse(conditionType, false);
    }

    /* if no group is present, then show explanation */
    checkComplexSearchesIntroIsRequired();
}

function setGroupButtonInUse(liId, isInUse = true) {
    if (isInUse) {
        $(`#${liId}`).addClass('group-in-use');
        $(`#${liId}`).attr('title', SearchComplexGroupAlreadyInUseLabel);
    } else {
        $(`#${liId}`).removeClass('group-in-use');
        $(`#${liId}`).attr('title', '');
    }
}

/* -------------------------------------------------------------------------------- */
/* REMOVE BUTTON */
/* -------------------------------------------------------------------------------- */
function getRemoveButtonOpacityActionsHtml(currentIndex, groupIndex) {
    return `onmouseover="showRemoveButton(${currentIndex}, ${groupIndex})" onmouseout="hideRemoveButton(${currentIndex}, ${groupIndex})"`;
}

function getRemoveButtonId(currentIndex,  groupIndex) {
    return `removeButton${currentIndex}${groupIndex}`;
}

function getRemoveButtonHtml(id, currentIndex, groupIndex, conditionType) {
    return `<button id="${getRemoveButtonId(currentIndex, groupIndex)}" class="button dark cycle small outline remove-button opacity-0 disabled" onclick="removeConditionProcedure('${id}',${currentIndex}, ${groupIndex}, '${conditionType}')"><span class="mif-bin"></span></button>`;
}

function hideRemoveButton(currentIndex, groupIndex) {
    let id = getRemoveButtonId(currentIndex, groupIndex);

    if ($(`#${id}`).hasClass('opacity-1')) {
        let callback = function () {
            $(`#${id}`).removeClass('opacity-1').addClass('opacity-0 disabled');
        };
        animateCSS(id, 'fadeOut', FAST, callback, DELAY_2S);
    }
}

function showRemoveButton(currentIndex, groupIndex) {
    let id = getRemoveButtonId(currentIndex, groupIndex);

    if (!$(`#${id}`).hasClass('opacity-1')) {
        $(`#${id}`).removeClass('opacity-0 disabled').addClass('opacity-1');
        animateCSS(id, 'fadeIn', FAST);
    }
}

/* -------------------------------------------------------------------------------- */
/* RETRIEVE VALUES FROM COMPLEX_SEARCH_CONDITIONS */
/* -------------------------------------------------------------------------------- */
function tryGetComplexSearchConditionsItem(index, groupIndex, conditionType) {
    let _index = complexSearchConditions.findIndex(x => x.ConditionType == conditionType && x.Index == index && x.GroupIndex == groupIndex);

    if (_index == -1)
        return null;

    return complexSearchConditions[_index];
}

function tryGetConditionOperatorsItem(index) {
    let _index = complexSearchConditions.findIndex(x => x.Index == index);

    if (_index == -1)
        return null;

    return complexSearchConditions[_index];
}

function tryGetValueText(index, groupIndex, conditionType) {
    let item = tryGetComplexSearchConditionsItem(index, groupIndex, conditionType);
    if (item)
        return item.ValueText;
    else
        return null;
}

/* ################################################################################ */
/* BUILD FROM SAVED ONE */
/* ################################################################################ */
async function buildAndRunComplexSearchProcedure(id) {
    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetSavedComplexSearchInfo, model)
    if (obj) {
        buildAndRunComplexSearch(obj);

        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesRetrieveInfoErrorMessage, ALERT);
    }
}

function buildAndRunComplexSearch(obj) {
    //console.log(obj);
    let isOk = true;

    /* save id of currently shown complex search */
    saveComplexSearchModel.Id = obj.Id;

    /* find max-value for Index */
    let indexMax = Math.max(...obj.Conditions.map(o => o.Index));

    /* loop on groups */
    for (var i = 0; i <= indexMax; i++) {
        try {
            /* 1) build in-memory models */
            let items = obj.Conditions.filter(x => x.Index == i);
            items.forEach(x => {
                addConditionModel(buildConditionModel(x.Id, x.Index, x.ConditionType, x.MaterialType, x.ValueId, x.ValueText, x.ConditionOperatorType));
            });

            /* 2) build UI items */
            items.forEach(x => {
                if (x.ConditionOperatorType == CONDITION_OPERATOR_NONE) {
                    //console.log(`${x.ConditionType}, index: ${x.Index}, groupIndex: ${x.GroupIndex}`);
                    switch (x.ConditionType) {
                        case CONDITION_TYPE_MATERIAL:
                            if (x.GroupIndex == 0)
                                addConditionMaterial(x.ConditionType, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionMaterialItem(x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_MINERAL_TYPE:
                            if (x.GroupIndex == 0)
                                addConditionSelectItem(x.ConditionType, x.ConditionType, mineralTypes, 'mineralTypes', selectMineralType, 'selectSampleDataType', SearchComplexConditionsOnMineralTypeLabel, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSelectItemOtherItems(x.ConditionType, mineralTypes, selectMineralType, x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_ORIGIN_TYPE:
                            if (x.GroupIndex == 0)
                                addConditionSelectItem(x.ConditionType, x.ConditionType, originTypes, 'originTypes', selectOriginType, 'selectSampleDataType', SearchComplexConditionsOnOriginTypeLabel, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSelectItemOtherItems(x.ConditionType, originTypes, selectOriginType, x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_SAMPLE_NAME:
                            if (x.GroupIndex == 0)
                                addConditionSampleName(x.ConditionType, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSampleNameItem(x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_SAMPLE_TYPE:
                            if (x.GroupIndex == 0)
                                addConditionSelectItem(x.ConditionType, x.ConditionType, sampleTypes, 'sampleTypes', selectSampleDataType, 'selectSampleDataType', SearchComplexConditionsOnSampleDataTypeLabel, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSelectItemOtherItems(x.ConditionType, sampleTypes, selectSampleDataType, x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;
                    }
                }
            });
        } catch (e) {
            console.log(e);
            isOk = false;
            continueLoop = false;
        }
    }

    if (isOk) {
        let name = obj.Name;
        setTimeout(() => { setSearchName(name); }, DEFAULT_WAIT_ms);
        setTimeout(() => { search(); }, 2 * DEFAULT_WAIT_ms);
    }

    if (!isOk) {
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchInfoShowErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
async function executeComplexSearch() {
    let children = getChildren();
    if (children.length == 0) {
        showSimpleDialog(WARNING_LABEL, SearchComplexNoConditionsWarningMessage, WARNING);
        return;
    }

    if (!validateFields()) {
        showSimpleDialog(WARNING_LABEL, SearchComplexValidationErrorsMessage, WARNING);
        return;
    }

    let model = {
        Conditions: complexSearchConditions
    };

    loadPartialViewWithAjaxPost(UrlSearchComplex, model, 'searchResultsContainer');
}

/* -------------------------------------------------------------------------------- */
/* VALIDATION BEFORE START SEARCHING */
/* -------------------------------------------------------------------------------- */
function getError(conditionType, index, groupIndex, msg) {
    return {
        ConditionType: conditionType,
        Index: index,
        GroupIndex: groupIndex,
        Msg: msg
    };
}

function showErrors(errors) {
    let errorsNum = errors.length;
    for (var i = 0; i < errorsNum; i++) {
        switch (errors[i].ConditionType) {
            case CONDITION_TYPE_MATERIAL:
                showErrorMaterial(errors[i]);
                break;

            case CONDITION_TYPE_SAMPLE_NAME:
                showErrorSampleName(errors[i]);
                break;
        }
    }
}

function showErrorSampleName(error) {
    let id = `${error.ConditionType}${error.Index}${error.GroupIndex}`;
    setInputFieldErrorState(id, true)
}

function showErrorMaterial(error) {
    let inputid = `${error.ConditionType}Input${error.Index}${error.GroupIndex}`;

    setMaterialErrorState(inputid, true, error.Msg)
}

function validateFields() {
    let result1 = validateSampleNameTextFields();
    let result2 = validateMaterialTextFields();

    if (result1.IsOk && result2.IsOk)
        return true;
    else {
        if (result1.Errors && result1.Errors.length > 0)
            showErrors(result1.Errors);

        if (result2.Errors && result2.Errors.length > 0)
            showErrors(result2.Errors);
    }

    return false;
}

function validateMaterialTextFields() {
    let result = {
        IsOk: true,
        Errors: []
    };

    /* check whether empty text fields are present or not */
    let textItems = $(`#${CONDITION_TYPE_MATERIAL}${CONDITIONS_ITEMS}`).find(`input[type=text][id^="ConditionMaterial"]`);
    if (textItems.length == 0)
        return result;

    let textItemsNum = textItems.length;
    for (var i = 0; i < textItemsNum; i++) {
        let s = textItems[i].id.replace(`${CONDITION_TYPE_MATERIAL}Input`, '');
        let index = parseInt(s.charAt(0));
        let groupIndex = parseInt(s.charAt(1));
        /* 1) check whether text has been inserted or not */
        let text = $(`#${textItems[i].id}`).val();
        if (text == '') {
            result.Errors.push(getError(CONDITION_TYPE_MATERIAL, index, groupIndex, SearchFieldTextRequiredMessage));
            result.IsOk = false;
            continue;
        }

        /* 2) is previous check is passed, check whether list of suggestions has been retrieved or not */
        let relatedSelectItem = $(`#${textItems[i].id.replace('Input', '')}`);
        if (!$(`#${relatedSelectItem[0].id}`).val()) {
            result.Errors.push(getError(CONDITION_TYPE_MATERIAL, index, groupIndex, SearchSuggestionsNotRetrievedMessage));
            result.IsOk = false;
            continue;
        }
    }

    return result;
}

function validateSampleNameTextFields() {
    let result = {
        IsOk: true,
        Errors: []
    };

    /* check whether empty text fields are present or not */
    let items = complexSearchConditions.filter(x => x.ConditionType == CONDITION_TYPE_SAMPLE_NAME && x.ConditionOperatorType == CONDITION_OPERATOR_NONE && x.ValueText == '');
    if (items.length == 0)
        return result;

    /* validate text fields */
    let itemsNum = items.length;
    for (var i = 0; i < itemsNum; i++) {

        result.Errors.push(getError(CONDITION_TYPE_SAMPLE_NAME, items[i].Index, items[i].GroupIndex, SearchSuggestionsNotRetrievedMessage));
        result.IsOk = false;
    }

    return result;
}

/* -------------------------------------------------------------------------------- */
/* MANAGE ERROR UI */
/* -------------------------------------------------------------------------------- */
function setMaterialErrorState(inputid, isError, msg) {
    if (isError) {
        addCLassToMetroUIElem(inputid, 'border-color-error');

        $(`#${inputid}Validation`).text(msg);
        $(`#${inputid}Validation`).removeClass('field-validation-valid').addClass('field-validation-invalid');
    } else {
        removeCLassToMetroUIElem(inputid, 'border-color-error');

        $(`#${inputid}Validation`).text('');
        $(`#${inputid}Validation`).removeClass('field-validation-invalid').addClass('field-validation-valid');
    }
}

function setInputFieldErrorState(id, isError) {
    if (isError) {
        addCLassToMetroUIElem(id, 'border-color-error');
        $(`#${id}Validation`).removeClass('field-validation-valid').addClass('field-validation-invalid');
    } else {
        removeCLassToMetroUIElem(id, 'border-color-error');
        $(`#${id}Validation`).removeClass('field-validation-invalid').addClass('field-validation-valid');
    }
}

var currentSearchInfoId = 0;

var saveComplexSearchModel = {
    Id: 0,
    Name: '',
    Conditions: []
};

/* ################################################################################ */
/* DELETE COMPLEX SEARCH */
/* ################################################################################ */
function deleteComplexSearchProcedure(itemId, itemName) {
    askAndExecute(SearchComplexQueryConditionsManagement, SavedComplexSearchesDeleteQuestion, deleteComplexSearch, [itemId, itemName]);
}

async function deleteComplexSearch(itemId, itemName) {
    setLoadingCircleIsVisible(true);

    let model = {
        Id: itemId
    };

    let obj = await doAjaxPostAsync(UrlDeleteComplexSearch, model);
    if (obj && obj.IsOk) {
        let plugin = Metro.getPlugin('#retrievedComplexSearchesTable', 'table');
        plugin.deleteItem(2, itemName); // 2 is index of name in column
        plugin.resetView();
        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesDeleteErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* SAVE COMPLEX SEARCH */
/* ################################################################################ */
/* -------------------------------------------------------------------------------- */
/* UI ELEMENTS OPERATORS */
/* -------------------------------------------------------------------------------- */
function setEnabledSearchTitle(isEnabled) {
    if (isEnabled) {
        $('#searchTitleInput').addClass('d-flex');

        $('#searchTitleLabel').removeClass('d-flex');
        hideByClass('searchTitleLabel');
    } else {
        $('#searchTitleLabel').addClass('d-flex');
        showByClass('searchTitleLabel');

        $('#searchTitleInput').removeClass('d-flex');

        $('#SearchName').val('');
    }
}

function tryAddSaveSearchElement() {
    if ($('#complexSearchTopBar').children().length > 0)
        return;

    let html = '';
    html += `<div id="saveSearchGroup" class="d-flex flex-justify-between complex-search-title">`;
    // add button save search
    html += `   <button class="flex-start button primary cycle outline margin-top-8 margin-left-8" title="${SaveComplexSearchLabel}" onclick="saveSearch()"><span class="mif-floppy-disk"></span></button>`;
    // add title
    html += `   <div id='searchTitleInput' class="flex-center flex-row d-none">`;
    html += `       <div class="flex-center flex-column">`;
    html += `           <input data-role="input" class="search-name-width height-40 margin-top-8" data-val="true" data-val-required="The search name field is required." id="SearchName" name="SearchName" onchange="updateSearchNameErrorStatus()" placeholder="${SaveComplexSearchNamePlaceholder}" type="text" value="" data-role-input="true">`;
    html += `           <div><span id="SearchNameValidation" class='field-validation-valid'>${SearchFieldTextRequiredMessage}</span></div>`;
    html += `       </div>`;
    html += `       <span id='searchSavedCheckmark' class='mif-checkmark fg-green margin-top-20 margin-horizontal-8 d-none'></span>`;
    html += `       <button class="flex-end button dark cycle outline mini margin-top-16 margin-left-8" title="${SearchComplexHideTitle}" onclick="setEnabledSearchTitle(false)"><span class="mif-cross-light"></span></button>`;
    html += `   </div>`;
    // add search generic title
    html += `   <div id="searchTitleLabel" class="d-flex flex-center flex-row margin-top-16">`;
    html += `       <button class="flex-start button dark cycle mini outline margin-right-8" title="${SearchComplexEditTitle}" onclick="setEnabledSearchTitle(true)"><span class="mif-pencil"></span></button>`;
    html += `       <label class="flex-end text-bold">${SearchComplexTitle}</label>`;
    html += `   </div>`;
    // add button remove search
    html += `   <button class="flex-end button dark cycle outline margin-top-8 margin-left-8" title="${SearchComplexClearLabel}" onclick="removeSearchProcedure()"><span class="mif-bin"></span></button>`;
    html += `</div>`;

    $(`#SearchName`).ready(function () {
        /* create Metro plugin for current html element */
        Metro.makePlugin(`#SearchName`, 'input');
        /* animate the ui items container */
        animateCSS(`SearchName`, `bounceIn`, FAST);
    });

    $('#complexSearchTopBar').html(html);
}

function removeSaveSearchElement() {
    $('#saveSearchGroup').remove();
}

function setSearchName(name) {
    $(`#SearchName`).val(name);

    updateSearchNameErrorStatus();

    setEnabledSearchTitle(true);
}

function updateSearchNameErrorStatus() {
    /* retrieve text */
    let text = $(`#SearchName`).val();

    /* update UI */
    if (text.length > 0)
        setInputFieldErrorState(`SearchName`, false);
    else
        setInputFieldErrorState(`SearchName`, true);
}

/* -------------------------------------------------------------------------------- */
/* CLOSE SHOWN COMPLEX SEARCH */
/* -------------------------------------------------------------------------------- */
function removeSearchProcedure() {
    confirmAndExecute(SearchComplexManagementLabel, SearchComplexRemoveQuestion, removeSearch);
}

function removeSearch() {
    let callback = function () {
        /* remove search title */
        $('#complexSearchTopBar').empty();
        /* remove conditions */
        $(complexSearchConditionsContainer).empty();

        /* set groups not-in-use anymore */
        let inUseGroups = $('#listviewSearchConditions').find('.group-in-use');
        if (inUseGroups && inUseGroups.length > 0) {
            $(inUseGroups).each(function (index) {
                setGroupButtonInUse(this.id, false);
            });
        }

        /* empty the in-memory list of used groups */
        emptyCurrentlyUsedGroups();

        /* empty complex search conditions array */
        complexSearchConditions = [];

        /* reset the idex used incondition models */
        conditionsIndex = 0;

        /* check whether saved complex-searches-explanation/list is required */
        checkComplexSearchesIntroIsRequired();

        /* remove search result, if present */
        clearSearchResults();
    };
    animateCSS('complexSearchContainer', 'backOutRight', FASTER, callback);
}
/* -------------------------------------------------------------------------------- */
/* SAVE PROCEDURE */
/* -------------------------------------------------------------------------------- */
function isSearchNameAvailable() {
    let isAvaiable = false;

    let text = $('#SearchName').val();
    if (text && text.length > 0)
        isAvaiable = true;

    return isAvaiable;
}

async function saveSearch() {
    /* check whether a nema for current search has been set or not */
    if (!isSearchNameAvailable()) {
        setInputFieldErrorState(`SearchName`, true);
        showSimpleDialog(WARNING_LABEL, SaveComplexSearchNoNameErrorMessage, WARNING);
        return;
    }

    /* check whether fields have been filled or not */
    if (!validateFields()) {
        showSimpleDialog(WARNING_LABEL, SearchComplexValidationErrorsMessage, WARNING);
        return;
    }

    setLoadingCircleIsVisible(true);

    saveComplexSearchModel.Name = $('#SearchName').val();
    saveComplexSearchModel.Conditions = complexSearchConditions

    let isNewSearch = (saveComplexSearchModel.Id == 0);

    let obj = await doAjaxPostDefaultContentTypeAsync(UrlSaveComplexSearch, saveComplexSearchModel);
    if (obj) {
        setLoadingCircleIsVisible(false);
        if (obj.IsOk) {
            /* update model Id for being used in case of edit */
            saveComplexSearchModel.Id = obj.Id;
            /* show checkmark to warn search has been saved */
            showByClass('searchSavedCheckmark');
            animateCSS('searchSavedCheckmark', 'pulse', FAST);

            if (isNewSearch)
                showSimpleDialog(INFO_LABEL, SaveComplexSearchSavedMessage, SUCCESS);
            else
                showSimpleDialog(INFO_LABEL, SaveComplexSearchUpdatedMessage, SUCCESS);
        } else {
            showSimpleDialog(ERROR_LABEL, obj.ExMsg, ALERT);
        }
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SaveComplexSearchErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* RETRIEVE SAVED COMPLEX SEARCHES */
/* ################################################################################ */
function buildSavedComplexSearchesTable(obj) {
    let html = ``;

    let tableid = 'retrievedComplexSearchesTable';

    html += `<table id="${tableid}" `;
    html += `class="table compact striped row-hover" `;
    html += `data-role="table" `;
    html += `data-static-view="true" `;
    html += `data-view-save-mode="client" `;
    html += `data-view-save-path="TABLE:${tableid}:KEYS">`;
    html += `   <thead>`;
    html += `       <tr>`;
    html += `           <th>&nbsp;</th>`;
    html += `           <th>&nbsp;</th>`;
    html += `           <th>${SavedComplexSearchesNameLabel}</th>`;
    html += `           <th>${SavedComplexSearchesDateLabel}</th>`;
    html += `           <th>${SavedComplexSearchesConditionsLabel}</th>`;
    html += `           <th>&nbsp;</th>`;
    html += `       </tr>`;
    html += `   </thead>`;
    html += `   <tbody>`;
    let itemsNum = obj.length;
    for (var i = 0; i < itemsNum; i++) {
        let datetime = formatDate(obj[i].InsertDateTimeJs);

        let conditionTypes = '';
        if (obj[i].ConditionTypes && obj[i].ConditionTypes.length > 0) {
            conditionTypes = obj[i].ConditionTypes.join(', ');
        }

        let popoverhtml = ``;
        popoverhtml += `<button class="button info cycle mini outline" `;
        popoverhtml += `        data-role="popover" `;
        popoverhtml += `        data-popover-text="<div id='complexSearch${obj[i].Id}Info'></div>" `; 
        popoverhtml += `        data-popover-position="right" `;
        popoverhtml += `        data-popover-hide="0" `;
        popoverhtml += `        title = "${SavedComplexSearchesShowDetailedInfoLabel}" `;
        popoverhtml += `        data-on-popover-show="expandComplexSearchInfo(${obj[i].Id})"`;
        popoverhtml += `        data-on-popover-hide="freeCurrentSearchInfoId()" `;
        popoverhtml += `        data-cls-popover="bg-light drop-shadow" `;
        popoverhtml += `        data-hide-on-leave="true">`;
        popoverhtml += `    <span class="mif-list"></span>`;
        popoverhtml += `</button>`;
        /* main row */
        html += `   <tr class="pointer">`;
        html += `       <td>${popoverhtml}</td>`;
        html += `       <td><button class="button primary cycle mini outline" title="${SavedComplexSearchesExecuteLabel}" onclick="buildAndRunComplexSearchProcedure(${obj[i].Id})"><span class="mif-done"></span></button></td>`;
        html += `       <td>${obj[i].Name}</td>`;
        html += `       <td>${datetime}</td>`;
        html += `       <td>${conditionTypes}</td>`;
        html += `       <td><button class="button dark cycle mini outline" title="${SavedComplexSearchesDeleteLabel}" onclick="deleteComplexSearchProcedure(${obj[i].Id}, '${obj[i].Name}')"><span class="mif-bin"></span></button></td>`;
        html += `   </tr>`;
    }
    html += `   </tbody>`;
    html += `</table>`;

    /* append html with list and animate it */
    $('#retrievedComplexSearchesList').html(html);    
}

async function getSavedComplexSearches() {
    if (areComplexSearchesRetrieved)
        return;

    setLoadingCircleIsVisible(true);

    let obj = await doAjaxGetNoModelAsync(UrlGetSavedComplexSearches)
    if (obj && obj.length > 0) {
        /* hide info */
        let callback = function () {
            /* build the list with available items */
            buildSavedComplexSearchesTable(obj);
            /* hide explanation on complex searches */
            hideByClass('retrievedComplexSearchesInfo');
            /* set saved complex searches available */
            areSavedComplexSearchesAvailable = true;
            showComplexSearchesIntroProcedure();
        };
        animateCSS('retrievedComplexSearchesInfo', 'backOutRight', FASTER, callback);

        /* set list as retrieved */
        areComplexSearchesRetrieved = true;
    }

    setLoadingCircleIsVisible(false);
}

/* ################################################################################ */
/* COMPLEX SEARCH INFO */
/* ################################################################################ */
async function expandComplexSearchInfo(id) {
    console.log(id);
    if (currentSearchInfoId == id)
        return;

    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetSavedComplexSearchInfo, model)
    if (obj) {
        setCurrentSearchInfoId(id);
        /* build the info panel and show it */
        buildComplexSearchInfo(id, obj);

        /* show 'shrink' icon and hide 'expand' icon */
        hideByClass(`complexSearch${id}IconExpand`);
        showByClass(`complexSearch${id}IconShrink`);
    } else {
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesRetrieveInfoErrorMessage, ALERT);
    }
}

function shrinkComplexSearchInfo(id) {
    /* remove info about complex search */
    $(`#complexSearch${id}Info`).empty();

    /* hide 'shrink' icon and show 'expand' icon */
    showByClass(`complexSearch${id}IconExpand`);
    hideByClass(`complexSearch${id}IconShrink`);
}

/* -------------------------------------------------------------------------------- */
/* BUILD COMPLEX SEARCH INFO PANEL */
/* -------------------------------------------------------------------------------- */
function buildComplexSearchInfo(id, obj) {
    //console.log(obj);
    let html = ``;

    let isOk = true;

    /* find max-value for Index */
    let indexMax = Math.max(...obj.Conditions.map(o => o.Index))

    /* build-up complex search UI */
    for (var i = 0; i <= indexMax; i++) {
        try {
            /* test whether next group is a condition-group or a conditions-opertor item */
            let testItemIndex = obj.Conditions.findIndex(x => x.Index == i && x.GroupIndex == 0);
            let testItem = obj.Conditions[testItemIndex];

            if (testItem.ConditionOperatorType == CONDITION_OPERATOR_NONE) {
                /* if we're dealing with a conditions-group, then let's' retrieve all items belonging to the group and build-up the info element... */
                let items = obj.Conditions.filter(x => x.Index == i);
                html += getConditionRow(items);
            } else {
                /* ...otherwise let's add the condition between the previous group and the next one */
                html += getConditionOperatorsRow(obj.Conditions[i]);
            }
        } catch (e) {
            console.log(e);
            isOk = false;
            continueLoop = false;
        }
    }

    if (isOk)
        $(`#complexSearch${id}Info`).html(html);
    else
        showComplexSearchInfoError(id);
}

function getConditionRow(conditionGroupItems) {
    let html = ``;

    html += `<div class="row cell-fs-12">`;

    /* 1) retrieve condition type */
    let conditionType = conditionGroupItems[0].ConditionTypeDescription;

    /* 1.1) if condition is of material type, then fix the name */
    if (conditionGroupItems[0].ConditionType == CONDITION_TYPE_MATERIAL)
        conditionType = conditionGroupItems[0].MaterialType;

    /* 1.2) set condition type in html */
    html += `<span class="text-secondary"><strong>${conditionType}</strong>:&nbsp;</span>`;

    /* 2) set values in html */
    let value = ``;
    let itemsNum = conditionGroupItems.length;
    for (var i = 0; i < itemsNum; i++) {
        if (conditionGroupItems[i].ConditionOperatorType == CONDITION_OPERATOR_NONE)
            value += `${conditionGroupItems[i].ValueText}`;
        else
            value += ` <i>${conditionGroupItems[i].ConditionOperatorType.toLowerCase()}</i> `;
    }
    html += `<span class="text-secondary">${value}</span>`;


    html += `</div>`;

    return html;
}

function getConditionOperatorsRow(condition) {
    return `<span class="text-secondary"><strong>${condition.ConditionOperatorType.toLowerCase()}</strong></span>`;
}

function showComplexSearchInfoError(id) {
    let html = '';
    html += `<div class="remark alert">${SavedComplexSearchesInfoErrorMessage}</div>`;

    $(`#complexSearch${id}Info`).html(html);
}

/* -------------------------------------------------------------------------------- */
/* MANAGE currentSearchInfoId */
/* -------------------------------------------------------------------------------- */
function freeCurrentSearchInfoId() {
    currentSearchInfoId = 0;
}

function setCurrentSearchInfoId(id) {
    currentSearchInfoId = id;
}
/* ################################################################################ */
/* SHOW/HIDE SAVED COMPLEX SEARCHES INTRO */
/* ################################################################################ */
function checkComplexSearchesIntroIsRequired() {
    if ($(complexSearchConditionsContainer).children().length == 0) {
        /* remove UI item for saving search */
        removeSaveSearchElement();
        /* show saved searches list */
        showComplexSearchesIntroProcedure();
    }
}

/* -------------------------------------------------------------------------------- */
/* HIDE PROCEDURE */
/* -------------------------------------------------------------------------------- */
function hideComplexSearchesIntroProcedure(extcallback) {
    let id;
    if (!areSavedComplexSearchesAvailable)
        hideComplexSearchesInfo(extcallback);
    else
        hideComplexSearchesList(extcallback);
}

/* -------------------------------------------------------------------------------- */
/* SHOW PROCEDURE */
/* -------------------------------------------------------------------------------- */
function showComplexSearchesIntroProcedure() {
    if (!areSavedComplexSearchesAvailable)
        showComplexSearchesInfo();
    else
        showComplexSearchesList();
}

/* -------------------------------------------------------------------------------- */
/* INFO */
/* -------------------------------------------------------------------------------- */
function hideComplexSearchesInfo(extcallback) {
    let id = 'retrievedComplexSearchesInfo';
    let callback = function () {
        hideByClass(id);

        if (extcallback)
            extcallback();
    };

    animateCSS(id, 'backOutRight', FAST, callback);
}

function showComplexSearchesInfo() {
    let id = 'retrievedComplexSearchesInfo';

    showByClass(id);
    animateCSS(id, 'backInUp', FAST);
}

/* -------------------------------------------------------------------------------- */
/* LIST */
/* -------------------------------------------------------------------------------- */
function hideComplexSearchesList(extcallback) {
    let id = 'retrievedComplexSearchesListContainer';
    let callback = function () {
        hideByClass('retrievedComplexSearchesListTitle');
        hideByClass(id);

        if (extcallback)
            extcallback();
    };

    animateCSS(id, 'backOutRight', FAST, callback);
}

function showComplexSearchesList() {
    let id = 'retrievedComplexSearchesListContainer';

    showByClass(id);
    showByClass('retrievedComplexSearchesListTitle');
    animateCSS(id, 'backInUp', FAST);
}


var LOWER_LIMIT = 0;
var UPPER_LIMIT = 1;

var selectedId;

var minerals = [];
var monoMineral;
var rock;
var meteorClass;

/* ---------- MINERALS ---------- */
function addMineralItem(id, name, percentage) {
    if (minerals.findIndex(x => x.Id == id) == -1)
        minerals.push(createMineralItem(id, name, percentage));
}

function areMineralsAvailable() {
    return (minerals.length > 0);
}

function createMineralItem(id, name, percentage) {
    return {
        Id: id,
        Name: name,
        Percentage: percentage
    }
}

function deleteMineralItem(id) {
    let index = minerals.findIndex(x => x.Id == id);
    if (index == -1)
        return;

    minerals.splice(index, 1);
}

function getMineralItems() {
    return minerals;
}

function updateMineralItemPercentage(id, percentage) {
    let index = minerals.findIndex(x => x.Id == id);
    if (index == -1)
        return;

    minerals[index].Percentage = percentage;
}

/* ---------- MONO-MINERAL ---------- */
function getMonomineral() {
    return monoMineral;
}

function setMonomineral(id, name) {
    minerals = [];

    monoMineral = {
        Id: id,
        Name: name
    };
}

/* ---------- ROCK ---------- */
function getRock() {
    if (rock)
        return rock;
    else
        return createEmpty();
}

function setRock(id, name) {
    rock = {
        Id: id,
        Name: name
    };
}

/* ---------- METEOR CLASS ---------- */
function getMeteorClass() {
    if (meteorClass)
        return meteorClass;
    else
        return createEmpty();
}

function setMeteorClass(id, name) {
    meteorClass = {
        Id: id,
        Name: name
    };
}

/* ################################################################################ */
/* INFO - SAVE */
/* ################################################################################ */
/* ---------- SAMPLE DATA ---------- */
function createEmpty() {
    return {
        Id: 0,
        Name: '',
        Percentage: 0
    }
}

function getGrainSizeTypeValues(sampleTypeId) {
    let grainSizeTypeId = null;
    let grainSizeLowerValueId = null;
    let grainSizeUpperValueId = null;

    if (sampleTypeId == 3 || sampleTypeId == 4) { // 3: Pellet, 4: Particulate
        let grainSizeTypeSelect = Metro.getPlugin("#SampleDataSelectedValues_GrainSizeTypeId", "select");
        if (grainSizeTypeSelect) {
            grainSizeTypeId = parseInt(grainSizeTypeSelect.val());

            let grainSizeLowerLimitSelector = Metro.getPlugin('#grainSizeLowerLimitSelector', 'select');
            if (grainSizeLowerLimitSelector) {
                grainSizeLowerValueId = parseInt(grainSizeLowerLimitSelector.val());
            }

            let grainSizeUpperLimitSelector = Metro.getPlugin('#grainSizeUpperLimitSelector', 'select');
            if (grainSizeUpperLimitSelector) {
                grainSizeUpperValueId = parseInt(grainSizeUpperLimitSelector.val());
            }
        }
    }

    return {
        GrainSizeTypeId: grainSizeTypeId,
        GrainSizeLowerValueId: grainSizeLowerValueId,
        GrainSizeUpperValueId: grainSizeUpperValueId
    };
}

function getMineralTypeId() {
    let mineralTypeId = null;

    let mineralTypeSelector = Metro.getPlugin('#SampleDataSelectedValues_MineralTypeId', 'select');
    if (mineralTypeSelector) {
        mineralTypeId = parseInt(mineralTypeSelector.val());
    }

    return mineralTypeId;
}

function getMinerals(mineralTypeId) {
    let minerals = [];

    switch (mineralTypeId) {
        case 1:
            minerals = [];
            if (areMineralsAvailable())
                minerals.push(getMonomineral());
            else
                minerals.push(createEmpty());
            break;

        case 3: //Mix
            if (areMineralsAvailable())
                minerals = getMineralItems();
            else
                minerals.push(createEmpty());
            break;

        default: // 2
    }

    return minerals;
}

function getOriginTypeId() {
    let originTypeId = null;

    let originTypeSelector = Metro.getPlugin('#SampleDataSelectedValues_OriginTypeId', 'select');
    if (originTypeSelector) {
        originTypeId = parseInt(originTypeSelector.val());
    }

    return originTypeId;
}

/* ---------- MEASUREMENT INFO ---------- */
function getEmissionAngle() {
    try {
        let emissionAngle = Metro.getPlugin('#emissionAngle', 'spinner');
        return parseInt(emissionAngle.val());
    } catch (e) {
        console.log(`getEmissionAngle - e: ${e}`);
    }
}

function getIncidenceAngle() {
    try {
        let incidenceAngle = Metro.getPlugin('#incidenceAngle', 'spinner');
        return parseInt(incidenceAngle.val());
    } catch (e) {
        console.log(`getIncidenceAngle - e: ${e}`);
    }
}

function getNumOfAcquiredSpectra() {
    try {
        let numOfAcquiredSpectraPlugin = Metro.getPlugin('#numOfAcquiredSpectra', 'spinner');
        return parseInt(numOfAcquiredSpectraPlugin.val());
    } catch (e) {
        console.log(`getNumOfAcquiredSpectra - e: ${e}`);
    }
}

function getNumOfAcquisitionsForSpectrum() {
    try {
        let numOfAcquisitionsForSpectrum = Metro.getPlugin('#numOfAcquisitionsForSpectrum', 'spinner');
        return parseInt(numOfAcquisitionsForSpectrum.val());
    } catch (e) {
        console.log(`getNumOfAcquisitionsForSpectrum - e: ${e}`);
    }
}

/* ---------- SAVE ---------- */
async function saveInfo() {
    let sampleTypeId = parseInt(Metro.getPlugin("#SampleDataSelectedValues_SampleTypeId", "select").val());

    let grainSizeTypeValues = getGrainSizeTypeValues(sampleTypeId);

    let mineralTypeId = getMineralTypeId()

    let isSavingAllowed = true;
    let savingErrorMessage;
    switch (mineralTypeId) {
        case MINERAL_TYPE_MONOMINERALIC:
        case MINERAL_TYPE_MIX:
            if (!areMineralsAvailable()) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoNoMineralSelectedErrorMessage;
            }
            break;

        case MINERAL_TYPE_ROCK:
            if (getRock() == null) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoNoRockSelectedErrorMessage;
            }
            break;

        case MINERAL_TYPE_EXTRATERRESTRIAL:
            if (getMeteorClass() == null) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoNoMeteorClassSelectedErrorMessage;
            }
            break;

        default:
    }

    if (!isSavingAllowed) {
        showSimpleDialog(ERROR_LABEL, savingErrorMessage, ALERT);
        return;
    }

    setLoadingCircleIsVisible(true);

    let model = {
        FileId: selectedId,
        Name: $('#SampleDataSelectedValues_Name').val(),
        SampleDataSelectedValues: {
            Name: null,
            SampleTypeId: sampleTypeId,
            GrainSizeLowerValueId: grainSizeTypeValues.GrainSizeLowerValueId,
            GrainSizeUpperValueId: grainSizeTypeValues.GrainSizeUpperValueId,
            GrainSizeTypeId: grainSizeTypeValues.GrainSizeTypeId,
            OriginTypeId: getOriginTypeId(),
            MineralTypeId: mineralTypeId,
            Minerals: getMinerals(mineralTypeId),
            Rock: getRock(),
            MeteorClass: getMeteorClass(),
        },
        SpectrumFileMeasurementInfoValues: {
            NumOfAcquiredSpectra: getNumOfAcquiredSpectra(),
            NumOfAcquisitionsForSpectrum: getNumOfAcquisitionsForSpectrum(),
            EmissionAngle: getEmissionAngle(),
            IncidenceAngle: getIncidenceAngle(),
            InputSpectra: null
        },
    };

    //console.log(model);
    let obj = await doAjaxPostAsync(UrlSaveInfo, model);
    if (obj && obj.IsOk) {
        setLoadingCircleIsVisible(false);
        showInfoBox(INFO_LABEL, UpsertInfoInfoMessage, INFO);
    } else {
        setLoadingCircleIsVisible(false);
        showInfoBox(ERROR_LABEL, UpsertInfoErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* INFO - MEASUREMENT INFO */
/* ################################################################################ */
function loadInfoMeasurementInfo() {
    var model = {
        Id: selectedId
    };

    /* load tab about sample */
    loadPartialViewWithAjaxGet(UrlLoadSpectrumMeasurementInfo, model, 'infoMeasurement');
}

/* ################################################################################ */
/* INFO - SAMPLE DATA */
/* ################################################################################ */
function callSetMineralTypeItems() {
    setMineralTypeItems();
}

function clearInfo() {
    emptyElem('filename');
    emptyElem('type');
    emptyElem('infoSampleData');
    emptyElem('infoMeasurement');
}

function getGrainSizeTypeSelectedValue() {
    return grainSizeTypeSelect.val();
}

function getSampleTypeSelectedValue() {
    return sampleTypeSelect.val();
}

async function loadFilename() {
    model = {
        Id: selectedId
    };

    let obj = await doAjaxGetAsync(UrlGetSpectrumFilename, model);
    if (obj) {
        $('#filename').html(obj.Filename);
        let typeDesc = `(<strong>${getSpectrumTypeDescription(obj.Type)}</strong>)`;
        $('#type').html(typeDesc)
    }
}

function loadInfoSampleData() {
    var model = {
        Id: selectedId
    };

    setLoadingCircleIsVisible(true);

    /* load filename on top of panel */
    loadFilename();

    /* load tab about sample */
    loadPartialViewWithAjaxGet(UrlLoadSpectrumSampleDataPanel, model, 'infoSampleData', callSetMineralTypeItems);
}

/* ################################################################################ */
/* MANAGE PANEL INFO POSITION */
/* ################################################################################ */
var samplesData = [];

function hideInfo() {
    let callback = function () {
        setPositionTop(`info`, 0);
        clearInfo();
    };
    animateCSS(`info`, `slideOutDown`, FAST, callback);
}

function refreshInfo() {
    loadInfoSampleData();
    loadInfoMeasurementInfo();
}

function showInfo(id) {
    //console.log(`showInfo id: ${id}`);

    selectedId = id;

    let pos = $('#info').position();
    setPositionTop(`info`, -(pos.top));

    let callbacks = function () {
        loadInfoSampleData();
        loadInfoMeasurementInfo();
        showByClass('saveInfo');
        showByClass('refreshInfo');
    };
    animateCSS(`info`, `slideInUp`, FAST, callbacks);
}

/* ################################################################################ */
/* MINERALS MANAGEMENT */
/* ################################################################################ */
/* ---------- MINERAL DELETION ---------- */
function checkMineralsList() {
    let children = $('#selectedMinerals').find('li');
    if (children.length == 0) {
        showEmptyList();
    }
}

function deleteMineralProcedure(mineralId) {
    confirmAndExecute(InfoManagementTitle, MineralDeletionQuestion, deleteMineral, mineralId);
}

async function deleteMineral(mineralId) {
    let id = parseInt(mineralId.replace('mineral', ''));

    /* delete from DB link between spectrum and mineral */
    let model = {
        SpectrumId: selectedId,
        MaterialId: id
    };

    await doAjaxPostAsync(UrlDeleteMineral, model);

    /* delete item from 'minerals' array */
    deleteMineralItem(id);

    /* remove UI item from list */
    $(`#${mineralId}`).remove();

    /* check whether message of empty list should be shown or not */
    checkMineralsList();
}

function showEmptyList() {
    callLoadSpectrumSampleSelectedValuesView();
}

/* ---------- AUTOCOMPLETE ---------- */
function setAutocomplete(url) {
    //$("#mineralsSuggestions").off();
    $("#mineralsSuggestions").autocomplete({
        source: function (request, response) {
            var model = {
                Text: request.term
            };

            $.ajax({
                url: url,
                type: GET,
                async: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: model,
                success: function (data) {
                    //console.log(data);
                    response($.map(data, function (item) {
                        return { label: item.Name, value: item.Name, id: item.Id };
                    }));
                },
                error: function (xhr, status, error) {
                    console.log('autocomplete - mineralsSuggestion - ex:' + error);
                }
            });
        },
        nLength: 3,
        select: function (event, ui) {
            //console.log(event);
            //console.log(ui);
            /* select mineral(s) */
            setSelection(ui);

            /* reset input after selection */
            $(this).val('');
            return false;
        }
    });
}

function setLabel(text) {
    $('#mineralsSuggestionLabel').text(text);
}

function setSelection(ui) {
    switch (mineralTypeId) {
        case 1: //Monomineralic
            setMaterialForMonomineralic(ui);
            break;

        case 2: //Amorphous
            // do nothing
            break;

        case 3: //Mix
            setMaterialForMix(ui);
            break;

        case 4: //Rocks
            setMaterialForRock(ui);
            break;

        case 5: //Extraterrestrial
            setMaterialForExtraterrestrial(ui);
            break;
    }
}

function setMaterialForExtraterrestrial(ui) {
    if ($('#noSelectedMeteorClass').length) {
        /* is no mono-mineral exists, then remove and add selected mono-mineral... */
        $('#selectedMeteorClassContainer').empty();

        let html = `<span id="selectedMeteorClass">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="MeteorClass__Id" name="MeteorClass.Id" type="hidden" value="${ui.item.id}">`;
        $('#selectedMeteorClassContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedMeteorClass').text(ui.item.label);
        $('#MeteorClass__Id').val(ui.item.id);
    }
}

function setMaterialForMix(ui) {
    hideByClass('noSelectedMinerals');

    let id = `mineral${ui.item.id}`;
    let percentageId = `mineralPercentage${ui.item.id}`;
    let html = `<li id="${id}" class="d-flex flex-row flex-align-center flex-justify-between material-row">`;
    html += `<span class="label w-25">${ui.item.label}</span>`;
    html += `<input id="${percentageId}" type="number" min="0" max="100" maxlength="10" value="0">`;
    html += `<span class="mif-bin pointer" onclick="deleteMineralProcedure('${id}')"></span>`;
    html += `</li>`;

    $('#selectedMinerals').append(html);

    setMaterialForMixEventHandler();

    let percentage = parseInt($(`#${percentageId}`).val());
    addMineralItem(ui.item.id, ui.item.label, percentage);
}

function setMaterialForMixEventHandler() {
    $(`[id^="mineralPercentage"]`).off();

    $(`[id^="mineralPercentage"]`).on('keyup input', function () {
        let id = parseInt(this.id.replace('mineralPercentage', ''));
        let percentage = parseInt($(`#${this.id}`).val());
        updateMineralItemPercentage(id, percentage);
        console.log(`${this.id}: ${percentage}`);
    });
}

function setMaterialForMonomineralic(ui) {
    if ($('#noSelectedMonoMineral').length) {
        /* is no mono-mineral exists, then remove and add selected mono-mineral... */
        $('#selectedMonoMineralContainer').empty();

        let html = `<span id="selectedMineral">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="Minerals_0__Id" name="Minerals[0].Id" type="hidden" value="${ui.item.id}">`;
        $('#selectedMonoMineralContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedMineral').text(ui.item.label);
        $('#Minerals_0__Id').val(ui.item.id);
    }

    setMonomineral(ui.item.id, ui.item.label);
}

function setMaterialForRock(ui) {
    if ($('#noSelectedRock').length) {
        /* is no rock exists, then remove and add selected rock... */
        $('#selectedRockContainer').empty();

        let html = `<span id="selectedRock">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="Rock__Id" name="RockId" type="hidden" value="${ui.item.id}">`;
        $('#selectedRockContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedRock').text(ui.item.label);
        $('#Rock__Id').val(ui.item.id);
    }

    setRock(ui.item.id, ui.item.label)
}

function callLoadSpectrumSampleSelectedValuesView() {
    var model = {
        Id: fileId,
        SelectedMineralTypeId: mineralTypeId
    };
    loadPartialViewWithAjaxGet(UrlLoadSpectrumSampleSelectedValuesView, model, 'materialsManagement');
}

function setSelectedMineralType(selected) {
    //console.log(selected);

    mineralTypeId = parseInt(selected);

    let isShowRequired = true;
    switch (mineralTypeId) {
        case 1: //Monomineralic
            setAutocomplete(UrlGetMinerals);
            setLabel(SuggestionsForMineralsLabel);
            isShowRequired = true;
            break;

        case 2: //Amorphous
            isShowRequired = false;
            break;

        case 3: //Mix
            setAutocomplete(UrlGetMinerals);
            setLabel(SuggestionsForMineralsLabel);
            isShowRequired = true;
            break;

        case 4: //Rock
            setAutocomplete(UrlGetRocks);
            setLabel(SuggestionsForRocksLabel);
            isShowRequired = true;
            break;

        case 5: //Extraterrestrial
            setAutocomplete(UrlGetMeteorClasses);
            setLabel(SuggestionsForMeteorsLabel);
            isShowRequired = true;
            break;
    }

    if (isShowRequired) {
        showByClass('mineralsSuggestionsLabelContainer');
        showByClass('mineralsSuggestionsContainer');
    } else {
        hideByClass('mineralsSuggestionsLabelContainer');
        hideByClass('mineralsSuggestionsContainer');
    }

    callLoadSpectrumSampleSelectedValuesView();
}
var CHARMS_WIDTH = 500;

var IS_SAVED_ON_CLOUD = 'IsSavedOnCloud';

/* define fake parent Ids for processed spectra */
var SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID = 'aligned_id';
var SPECTRUM_OF_TYPE_CONTINUUM_TEMP_ID = 'continuum_id';
var SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID = 'continuumremoved_id';
var SPECTRUM_OF_TYPE_SMOOTHED_BY_SEGMENTS_TEMP_ID = 'smoothed_bySegments_id';
var SPECTRUM_OF_TYPE_SMOOTHED_WHOLE_SPECTRUM_TEMP_ID = 'smoothed_wholeSpectrum_id';

var isCharmsResetRequested = true;

/* save list of spectra Id to being processed */
var spectraForProcessingIds = [];

/* dictionary for associating each available SpectrumType with it parent SpectrumType */
var spectraTypesParents = {};

var isBuildingUpContinuum = false;

async function closeCharmsAsync(isUserPermissionRequested = true) {

    let callbackAsync = async function () {
        setLoadingCircleIsVisible(true);

        unloadWhiteSpectraForAlignment();

        await removeSpectraProcedureSimpleAsync();

        isCharmsResetRequested = true;

        Metro.charms.close('#charms');

        setLoadingCircleIsVisible(false);
    };

    if (isUserPermissionRequested) {
        let timeoutCallback = function () {
            setTimeout(async function () {
                callbackAsync();
            }, 200);
        };

        askAndExecute(CharmsSpectraProcessingManagementLabel, CharmsCloseWarningMessage, timeoutCallback);
    }
    else
        await callbackAsync();
}

function hideCharms() {
    isCharmsResetRequested = false;

    Metro.charms.close('#charms');
}

function isCharmsOpen() {
    return Metro.charms.isOpen('#charms');
}

async function initCharmsPhase1Async() {
    /* hide tabs */
    hideByClassDFlexItem('charmsTabsContainer');

    /* show explanation message */
    showByClassDFlexItem('charmsTabAlignmentStartingMessageContainer');

    /* reset all variables and arrays used for alignment */
    await initAlignmentAsync();

    /* load from cloud relationships between each spectrum type and its parent */
    getSpectraTypesParentsAsync();

    /* show 1st tab */
    showSelectedTab('charmsTabs', OPTIONS_TITLE_ALIGNMENT);

    /* reset all variables and arrays used for fitting */
    initFit();
}

function onCharmsClosed() {
    /* resize chart */
    updateChartSize();

    if (!isCharmsResetRequested)
        return;

    /* init the id of the selected RAW spectrum for processing */
    selectedSpectrumForProcessingId = 0;

    /* disable saving on cloud checkbox 'alignmentCheckboxShowLines' value */
    isCheckboxForShowSegmentsValueToBeSavedOnCloud = false;

    /* remove spectra list from selector */
    $('#spectrumSelectionContainer').empty();

    /* remove event fir checkbox */
    $("#alignmentCheckboxShowLines").off();
}

async function onCharmsOpened() {
    if (isCharmsResetRequested) {
        /* if requested, show lines for alignment */
        if (isCheckboxChecked('alignmentCheckboxShowLines'))
            $("#alignmentCheckboxShowLines").trigger("click");

        await initCharmsPhase1Async();

        /* fill selector for available RAW files */
        loadSpectraToBeProcessed();

        isCharmsResetRequested = false;
    }
}

function openCharms() {
    let w = $('#renderbody').width();

    w -= (CHARMS_WIDTH);

    $('#charts').css({ width: `${w}px` });
    //$('#charts').css({ transition: TRANSITION_SHORTHAND });
    //$('#charts').css({ transform: `translate(-${(CHARMS_WIDTH - 100)}, 0)` });

    Metro.charms.open('#charms');
}

/* ################################################################################ */
/* COMMON FILES MANAGEMENT */
/* ################################################################################ */
function getParentFile(id) {
    let parentFile = getSpectrumInfoById(id);

    return {
        Id: parentFile.Id,
        Filename: parentFile.Name,
        Type: parentFile.SpectrumType,
        Level: parentFile.SpectrumLevel
    };
}

function getRefWhiteFile(type) {
    let parentFile = getSpectrumBySpectrumType(type);

    return {
        Id: parentFile.Id,
        Filename: parentFile.Name,
        Type: type,
        Level: parentFile.SpectrumLevel
    };
}

/* ################################################################################ */
/* SPECTRA TYPES PARENTS */
/* ################################################################################ */
async function getSpectraTypesParentsAsync() {
    let obj = await doAjaxGetNoModelAsync(UrlGetSpectraTypesParents);
    if (obj) {
        let keys = Object.keys(obj);
        keys.forEach(function (key) {
            let value = obj[key];
            spectraTypesParents[parseInt(key)] = parseInt(value);
        });
    }
}

/* ################################################################################ */
/* CHARTS TO BE PROCESSED */
/* ################################################################################ */
function loadSpectraToBeProcessed() {
    /* close other charms, if opened */
    closeCharmsColorSelector();

    spectraForProcessingIds = spectraInfo.filter(x => x.SpectrumType == SPECTRUM_TYPE_RAW).map(x => { return x.Id }); // SpectrumType = 2 means RAW spectra

    if (spectraForProcessingIds && spectraForProcessingIds.length > 0) {
        let html = ``;
        html += `<select id="charmsSpectrumSelector" data-role="select" `
        html += `data-cls-select="charms-select" `;
        html += `data-on-change="${onSelectSpectrum.name}">`;
        html += `<option value="0">${SelectItemLabel}</option>`;
        let spectraNum = spectraForProcessingIds.length;
        for (var i = 0; i < spectraNum; i++) {
            let index = getSpectrumIndexById(spectraForProcessingIds[i]);
            html += `<option value="${spectraForProcessingIds[i]}">${spectraInfo[index].Name}</option>`;
        }
        html += `</select>`;

        $('#spectrumSelectionContainer').html(html);

        if (spectraNum == 1)
            setTimeout(function () { Metro.getPlugin('#charmsSpectrumSelector', 'select').val(spectraForProcessingIds[0]) }, 1000);
    }
}

function onSelectSpectrum(selected) {
    let selectedValue = parseInt(selected[0]);
    if (selectedValue == selectedSpectrumForProcessingId)
        return; // if we're opening charms and the selected spectrum is the already selected one, then do nothing

    /* remember id of selected spectrum */
    selectedSpectrumForProcessingId = selectedValue;

    /* find selected raw spectrum children, if available */
    let familyIds = findSpectrumChildrenById(selectedSpectrumForProcessingId);

    /* find all spectra that are going to be hidden to let user show only selected raw spectrum */
    let spectraToBeHiddenIds = findAllSpectraToBeHidden(selectedSpectrumForProcessingId);

    /* set visibility for each spectrum for being hidden in next instructions */
    spectraToBeHiddenIds.forEach(function (id) {
        setSpectrumVisibility(id, false);
    });

    if (isAnyItem(familyIds)) {
        let callback = async function () {
            /* hide spectra with IsVisible = false */
            hideSpectraToBeHidden();

            /* reset charms UI and load segments for alignment */
            await initCharmsPhase1Async();

            /* load info for creating UI of alignment panel  */
            initCharmsPhase2Async(selectedSpectrumForProcessingId);
        };
        askAndExecute(CharmsSpectraProcessingManagementLabel, CharmsDeleteProcessedSpectraQuestion, callback);
    } else {
        /* hide spectra with IsVisible = false */
        hideSpectraToBeHidden();

        /* load info for creating UI of alignment panel  */
        initCharmsPhase2Async(selectedSpectrumForProcessingId);
    }
}

async function initCharmsPhase2Async(selectedSpectrumForProcessingId) {
    /* set as selected the alignment tab */
    setTabEnabled(0, true);

    /* hide message about RAW file selection */
    hideByClassDFlexItem('charmsTabAlignmentStartingMessageContainer');

    //console.log(`onSelectSpectrum - selected: ${selected}`) // selected is Id, i.e: 5
    loadPartialViewWithAjaxGetNoModel(UrlLoadAlignmentPanel, 'alignmentOptionsPanel');

    /* check whether continuum-removed version is already available on cloud or not */
    if (await callCheckIsSpectrumOfTypeSavedOnCloudForContinuumRemovedAsync())
        setTabEnabled(1, true);
}

/* ################################################################################ */
/* DOWNLOAD PROCESSED SPECTRUM */
/* ################################################################################ */
async function downloadProcessedSpectrumAsync(spectrumType) {
    if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, spectrumType)) {
        let message;
        switch (spectrumType) {
            case SPECTRUM_TYPE_ALIGNED:
                message = AlignedNoDownloadBecauseAlreadyPresentMessage;
                break;
            case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                message = ContinuumRemovedNoDownloadBecauseAlreadyPresentMessage;
                break;
        }
        showSimpleDialog(WARNING_LABEL, message, WARNING);
        return;
    }

    setLoadingCircleIsVisible(true);

    let model = {
        ParentId: selectedSpectrumForProcessingId,
        SpectrumType: spectrumType
    }

    let obj = await doAjaxPostAsync(UrlGetProcessedSpectrum, model);
    if (obj) {
        setLoadingCircleIsVisible(true); // trick for avoiding mysterious disappearing of loading

        /* save spectrum into 'spectraInfo' */
        addSpectrumInfo(obj.SpectraInfo);

        /* add processed spectrum to chart */
        addProcessedSpectrum(obj.SpectraInfo, obj.Points, spectrumType);

        switch (spectrumType) {
            case SPECTRUM_TYPE_ALIGNED:
                /* actions needed to update UI after aligned spectrum has been added */
                buildAlignedSpectrumCompleted();

                /* retrieve and show settings used for aligning currently selected spectrum */
                await downloadAlignmentSettingsAsync(obj.SpectraInfo.Id);
                break;

            case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                /* actions needed to update UI after aligned spectrum has been added */
                buildContinuumRemovedSpectrumCompleted();

                /* retrieve and show settings used for removing continuum from currently selected spectrum */
                isBuildingUpContinuum = true; // used to avoid removing loading while building up continuum
                await downloadContinuumRemovalSettingsAsync(obj.SpectraInfo.Id);

                ///* save boundaries points as missing points to enable continuum-removed recalculation if points are added/removed */
                //setMissingPointsFromDownloadedContinuumRemoved(obj.Points, Object.keys(obj.Points[0]));
                break;

            default:
        }

        /* set text of cloud icon */
        setCloudTextAndIconStatus(spectrumType, true);

        if (!isBuildingUpContinuum)
            setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, CharmsCloudDownloadErrorMessage, ALERT);
    }
}

async function getSpectrumByParentIdAndSpectrumTypeAsync(parentId, spectrumType) {
    let model = {
        Id: parentId,
        SpectrumType: spectrumType
    };

    let obj = await doAjaxGetAsync(UrlGetSpectrumIdByParentIdAndSpectrumType, model);
    if (obj && obj.IsOk) {

    }
}

async function getSpectrumIdByParentIdAndSpectrumTypeAsync(parentId, spectrumType, callback) {
    let model = {
        Id: parentId,
        SpectrumType: spectrumType
    };

    let obj = await doAjaxGetAsync(UrlGetSpectrumIdByParentIdAndSpectrumType, model);
    if (obj && obj.IsOk) {
        if (callback)
            callback(obj.Id);
    }
}

function getTextIdFromSpectrumType(spectrumType) {
    let desc = getSpectrumTypeDescription(spectrumType);

    let temp = desc.split(' ');

    temp[0] = firstLetterLowerCase(temp[0]);

    if (temp.length > 0) {
        for (var i = 1; i < temp.length; i++) {
            temp[i] = firstLetterUpperCase(temp[i]);
        }
    }

    return temp.join('');
}

/* ################################################################################ */
/* MANAGE TEXT OF CLOUD ICON */
/* ################################################################################ */
function setCloudTextAndIconStatus(spectrumType, isSpectrumFromCloud) {
    let temp = getTextIdFromSpectrumType(spectrumType);
    let textId = `${temp}CloudText`;
    let iconId = `${temp}CloudIcon`;

    if (isSpectrumFromCloud) {
        $(`#${iconId}`).removeClass('mif-cloud-download').addClass('mif-cloud');
        $(`#${textId}`).text(CharmsUsingAlreadySavedOnCloudMessage);
    } else {
        $(`#${iconId}`).removeClass('mif-cloud').addClass('mif-cloud-download');
        $(`#${textId}`).text(CharmsAlreadySavedOnCloudMessage);
    }

    $(`#${textId}`).addClass('ani-pass');
    setTimeout(function () { $(`#${textId}`).removeClass('ani-pass'); }, 5000);
}

/* ################################################################################ */
/* CHECK IS SAVED ON CLOUD */
/* ################################################################################ */
async function checkIsSpectrumOfTypeSavedOnCloudAsync(name, spectrumType) {

    let model = {
        Filename: name,
        SpectrumType: spectrumType
    };

    let obj = await doAjaxPostAsync(UrlIsSpectrumTypeSavedOnCloud, model);
    if (obj) {
        /* save status of spectrum in 'spectraInfo' */
        saveSavedOnCloudStatus(obj.IsOk, spectrumType);

        /* show/hide icon on panel  */
        setCloudIconOnPanel(obj.IsOk, spectrumType);

        return obj.IsOk;
    }
    else
        return false;
}

async function deleteRecursivelySpectrumChildrenOnCloudAsync(rawId, spectrumType) {
    let isRemovalOk = true;

    try {
        let model = {
            Id: rawId,
            SpectrumType: spectrumType
        };

        isRemovalOk = await doAjaxPostAsync(UrlDeleteRecursivelySpectrumChildren, model);
    } catch (e) {
        isRemovalOk = false;
        console.log(`deleteRecursivelySpectrumChildrenOnCloud - ex: ${e}`);
    }

    return isRemovalOk;
}

function isSpectrumOfTypeSavedOnCloud(spectrumType) {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, spectrumType);
    if (!spectrum)
        return false;

    return spectrum.IsSavedOnCloud;
}

function saveSavedOnCloudStatus(isSavedOnCloud, spectrumType) {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, spectrumType);
    if (!spectrum)
        return;

    spectrum.IsSavedOnCloud = isSavedOnCloud;
}

function setCloudIconOnPanel(isSavedOnCloud, spectrumType) {
    let temp = getTextIdFromSpectrumType(spectrumType);

    let divId = `${temp}SavedOnCloud`;

    (isSavedOnCloud ? showFlex(divId) : hide(divId));
}

/* ################################################################################ */
/* REMOVE FILE COMMMON */
/* ################################################################################ */
async function removeSpectraProcedureAsync(spectrumType, dialogId, checkboxId) {
    Metro.dialog.close(`#${dialogId}`);

    /* retrieve all spectra, children of selected RAW spectrum, ordered in descending order */
    let spectra = buildFamilyTreeForSpectrum(selectedSpectrumForProcessingId);

    if (spectra.length == 0)
        return;

    /* filter only spectra with spectrumType greater than or equal to the selected one for being removed */
    let spectraToBeRemoved = spectra.filter(x => x.SpectrumType >= spectrumType);

    if (spectraToBeRemoved.length == 0)
        return;

    /* check whether removal on cloud is requested or not */
    let isRemovalOnCloudRequested = isCheckboxChecked(checkboxId);

    setLoadingCircleIsVisible(true);

    /* loop on spectraToBeRemoved for removing them */
    spectraToBeRemoved.forEach(async function (spectrumToBeRemoved) {
        await removeSpectrumProcedureAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
    });

    /* if removal on cloud is requested, then we have to remove all spectra obtained by next processing steps */
    if (isRemovalOnCloudRequested)
        await deleteRecursivelySpectrumChildrenOnCloudAsync(selectedSpectrumForProcessingId, spectrumType);

    setLoadingCircleIsVisible(false);
}

async function removeSpectraProcedureSimpleAsync() {
    /* retrieve all spectra, children of selected RAW spectrum, ordered in descending order */
    let spectra = buildFamilyTreeForSpectrum(selectedSpectrumForProcessingId);

    if (spectra.length == 0)
        return;

    /* loop on spectraToBeRemoved for removing them */
    spectra.forEach(async function (spectrumToBeRemoved) {
        await removeSpectrumProcedureAsync(spectrumToBeRemoved);
    });

    hideSpectraToBeHidden();


    dxChartRefresh(chartContainer);
    dxChartResetVisualRange(chartContainer);
}

async function removeSpectrumProcedureAsync(spectrumToBeRemoved, isRemovalOnCloudRequested = false) {
    switch (spectrumToBeRemoved.SpectrumType) {
        case SPECTRUM_TYPE_ALIGNED:
            await removeAlignedSpectrumAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
            break;

        case SPECTRUM_TYPE_CONTINUUM_REMOVED:
            await removeContinuumRemovedSpectrumAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
            removeContinuum();
            break;

        case SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS:
        case SPECTRUM_TYPE_ALIGNED_SMOOTHED:
        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:
            removeSmoothedSpectrumAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
            break;
    }
}

function buildFamilyTreeForSpectrum(id) {
    let ids = getChildrenIdsForSpectrum(id);

    let spectra = [];
    ids.forEach(function (id) {
        spectra.push(getSpectrumInfoById(id));
    });

    /* re-order array items */
    spectra.sort((spectrum1, spectrum2) => {
        return spectrum2.SpectrumType - spectrum1.SpectrumType;
    });

    return spectra;
}

async function getChildrenSpectraTypesAsync(spectrumType) {
    return await doAjaxGetNoModelAsync(`${UrlGetChildrenSpectraTypes}?SpectrumTypeId=${spectrumType}`);
}

function getIsSpectrumSavedOnCloud(spectrumType) {
    let index = getSpectrumIndexByParentIdAndSpectrumType(selectedSpectrumForProcessingId, spectrumType);

    /* check whether aligned spectrum has been saved on cloud or not */
    let isSpectrumSavedOnCloud = false;
    try {
        if (spectraInfo[index][IS_SAVED_ON_CLOUD])
            isSpectrumSavedOnCloud = spectraInfo[index][IS_SAVED_ON_CLOUD];
    } catch (e) { }

    return isSpectrumSavedOnCloud;
}

/* show dialog for asking user whether spectrum is to be deleted or not */
function removeFileProcedure(spectrumType, checkBoxId, dialogId) {
    let isSpectrumSavedOnCloud = getIsSpectrumSavedOnCloud(spectrumType);

    /* if aligned spectrum has been saved on cloud, then show checkbox for removing it from cloud */
    if (isSpectrumSavedOnCloud && checkBoxId)
        showFlexElemMetroUIElem(checkBoxId);

    /* open dialog for removing aligned spectrum */
    if (dialogId)
        Metro.dialog.open(`#${dialogId}`);
}

function removeSpectrumFromChart(seriesname, id) {
    /* remove from series and chart */
    let idItem = buildId(id);

    dxChartBeginUpdate(chartContainer);

    /* remove from chart points */
    let items = dxChartGetItems(chartContainer);
    if (items && items.length > 0) {
        let itemsNum = items.length;
        for (var i = 0; i < itemsNum; i++) {
            if (items[i][idItem])
                delete items[i][idItem];
        }
    }

    /* remove from series */
    let seriesNum = chartSeries.length;
    for (var i = 0; i < seriesNum; i++) {
        if (chartSeries[i].name == seriesname) {
            removeChartSeriesAt(i);
            break;
        }
    }
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    /* reset visual range to make ref whites appear in chart */
    dxChartResetVisualRange(chartContainer);
}

async function removeSpectrumOnCloudAsync(id) {
    let isRemovalOk = true;

    try {
        let model = {
            Id: id
        };

        isRemovalOk = await doAjaxPostAsync(UrlDeleteSpectrum, model);
    } catch (e) {
        isRemovalOk = false;
        console.log(`removeSpectrumOnCloudAsync - ex: ${e}`);
    }

    return isRemovalOk;
}

async function removeSpectrumOnCloudProcedureAsync(id, successMessage, errorMessage) {
    let isRemovalOk = true;

    try {
        setLoadingCircleIsVisible(true);

        isRemovalOk = await removeSpectrumOnCloudAsync(id);

        let childrenSpectraTypes = await getChildrenSpectraTypesAsync(SPECTRUM_TYPE_ALIGNED);
        /* aggiungere rimozione children */

    } catch (e) {
        isRemovalOk = false;
        console.log(`removeSpectrumOnCloudProcedureAsync - ex: ${e}`);
    }

    setLoadingCircleIsVisible(false);

    if (isRemovalOk)
        showSimpleDialog(INFO_LABEL, successMessage, SUCCESS);
    else
        showSimpleDialog(ERROR_LABEL, errorMessage, ALERT);
}

function switchVisibilityOfChildrenSpectraRemovalMessage(id, isVisible) {
    if (isVisible) {
        $(`#${id}`).removeClass('d-none').addClass('d-flex');
    } else {
        $(`#${id}`).removeClass('d-flex').addClass('d-none');
    }
}

/* ################################################################################ */
/* MANAGE POINTS */
/* ################################################################################ */
function createSimplePoint(x, y) {
    return {
        X: x,
        Y: y
    };
}

function extractSpectrumXMax(points) {
    return Math.max(...points.map(p => p.X));
}

function extractSpectrumXMin(points) {
    return Math.min(...points.map(p => p.X));
}

function extractSpectrumRange(points, x0, x1) {
    if (x1 <= x0)
        return null;

    return points.filter(p => p.X >= x0 && p.X <= x1);
}

function getPointByX(points, x) {
    let point = points.find(p => p.X == x);
    if (!point)
        return null;

    return point;
}

function getPointsMaxX(points) {
    return points[points.length - 1].X
}


function getPointsMinX(points) {
    return points[0].X
}

function getPointFromSeriesPoints(seriesPoints, x) {
    let seriesPoint = seriesPoints.find(p => parseFloat(p.argument) == x);

    return {
        X: parseFloat(seriesPoint.argument),
        Y: parseFloat(seriesPoint.value)
    };
}

function getPointsFromSeriesPoints(seriesPoints) {
    return seriesPoints.map(x => { return { X: parseFloat(x.argument), Y: parseFloat(x.value), YStdDev: 0 }; });
}

function getPointsFromSeriesPointsProcedure(rawId, spectrumType) {
    /* retrieve series points */
    let seriesPoints = getSeriesPointsProcedure(rawId, spectrumType);
    return getPointsFromSeriesPoints(seriesPoints);
}

function getPointAtFromSeriesPoints(seriesPoints, index) {
    return seriesPoints[index].map(x => { return { X: parseFloat(x.argument), Y: parseFloat(x.value) }; });
}

function getSeriesPointsProcedure(rawId, spectrumType) {
    //selectedSpectrumTypeForContinuumRemoval
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(rawId, spectrumType);
    /* retrieve index of spectrum in spectraInfo */
    let index = getSpectrumIndexById(spectrum.Id);
    /* retrieve series name */
    let seriesname = getSpectrumSeriesNameFromIndex(index);
    /* retrieve series points */
    return dxChartGetSeriesPoints(chartContainer, seriesname);
}

function getSpectrumPointsById(id) {
    let index = getSpectrumIndexById(id);
    if (index < 0)
        return;

    let seriesPoints = dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromIndex(index));
    if (!seriesPoints)
        return null;

    return getPointsFromSeriesPoints(seriesPoints);
}

function getSpectrumPointsByRawIdAndSpectrumType(rawId, spectrumType) {
    let spectrum = getSpectrumByRawIdAndSpectrumType(rawId, spectrumType);
    return getSpectrumPointsById(spectrum.Id);
}

function getSpectrumPointsBySpectrumType(spectrumType) {
    let spectrum = getSpectrumBySpectrumType(spectrumType);
    return getSpectrumPointsById(spectrum.Id);
}

function isExistingPointByX(points, x) {
    let index = points.findIndex(p => p.X == x);
    return (index >= 0);
}
/* ################################################################################ */
/* COMMON */
/* ################################################################################ */
function addProcessedSpectrum(processedSpectrum, processedPoints, spectrumType) {
    /* update chart with new aligned spectrum */
    dxChartBeginUpdate(chartContainer);

    /* create chart series for aligned spectrum */
    let spectrumSeriesName = createSeriesNameFromSpectrumNameAndType(processedSpectrum.Name, processedSpectrum.SpectrumType);

    /* create the value of 'valueField' field for chart */
    let idItem = buildId(processedSpectrum.Id);

    let color = getSpectrumTypeColor(getSpectrumTypeString(spectrumType));
    let newChartSeries = createSeriesFromSpectrumName(idItem, spectrumSeriesName, color, true);
    addChartSeries(newChartSeries);

    /* retrieve current items */
    let items = dxChartGetItems(chartContainer);
    /* get id of raw spectrum */
    let rawId = buildId(selectedSpectrumForProcessingId);

    /* retrieve keys of 'alignedPoint' entity and uses the 2nd for adding point to spectrum:
       when adding from locally calculated aligned spectrum, the key is 'Y', while when adding
       from downloaded aligned spectrum, the key is 'idnn' */
    let keys = Object.keys(processedPoints[0]);

    /* loop over items to add aligned point */
    let itemsNum = items.length;
    let counter = 0;
    for (var i = 0; i < itemsNum; i++) {
        if (items[i][rawId]) {
            items[i][idItem] = processedPoints[counter][keys[1]];
            counter++;
        }
    }

    /* update chart series */
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    /* reset visual range to make ref whites appear in chart */
    dxChartResetVisualRange(chartContainer);
}

function buildTempAlignedId() {
    return `${SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID}${selectedSpectrumForProcessingId}`;
}

function buildTempContinuumId() {
    return `${SPECTRUM_OF_TYPE_CONTINUUM_TEMP_ID}${selectedSpectrumForProcessingId}`;
}

function buildTempContinuumRemovedId() {
    return `${SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID}${selectedSpectrumForProcessingId}`;
}

function buildTempSmoothedSpectrumId(spectrumType, smoothingType) {
    let key;

    switch (smoothingType) {
        case BY_SEGMENTS:
            key = SPECTRUM_OF_TYPE_SMOOTHED_BY_SEGMENTS_TEMP_ID;
            break;

        case BY_WHOLE_SPECTRUM:
            key = SPECTRUM_OF_TYPE_SMOOTHED_WHOLE_SPECTRUM_TEMP_ID;
            break;
    }
    return `${getSpectrumTypeString(spectrumType)}_${key}${selectedSpectrumForProcessingId}`;
}

function getIdValueFromTempAlignedId(id) {
    return parseInt(id.replace(SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID, ''));
}

function getIdValueFromTempContinuumRemoved(id) {
    return parseInt(id.replace(SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID, ''));
}

function getTempAlignedIdValue(id) {
    return id.replace(SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID, '');
}

function isSpectrumOfType(destId, destSpectrumType) {
    let id = destId;

    var idRegex = new RegExp('^id[0-9]+');
    if (idRegex.test(destId)) {
        id = parseInt(destId.replace('id', ''));
    }

    let index = getSpectrumIndexByIdAndSpectrumType(id, destSpectrumType);
    return (index > -1);
}

function updateProcessedSpectrumSeries(oldId, newId, newIdValue, isPointVisible = false) {
    /* remove series containing oldId */
    let chartSeriesNum = chartSeries.length;
    for (var i = 0; i < chartSeriesNum; i++) {
        if (chartSeries[i].valueField == oldId) {
            removeChartSeriesAt(i);
            break;
        }
    }

    /* add series with newId */
    let index = getSpectrumIndexById(newIdValue);
    let color = getSpectrumTypeColor(getSpectrumTypeString(spectraInfo[index].SpectrumType));
    let processedSeries = createSeriesFromSpectrumName(newId, getSpectrumSeriesNameFromIndex(index), color, isPointVisible);
    addChartSeries(processedSeries);

    /* update chart series */
    dxChartUpdateSeries(chartContainer, chartSeries);
}

function updateProcessedSpectrumValueField(oldId, newId) {
    let items = dxChartGetItems(chartContainer);

    if (items && items.length > 0) {
        let itemsNum = items.length;
        for (var i = 0; i < itemsNum; i++) {
            if (items[i][oldId]) {
                let value = items[i][oldId];
                delete items[i][oldId];
                items[i][newId] = value;
            }
        }
    }
}

/* ################################################################################ */
/* TABS */
/* ################################################################################ */
function setTabEnabled(index, isEnabled) {
    let children = $('#charmsTabs').children('li');

    function setEnabled(item, isItemEnabled) {
        if (isEnabled)
            $(item).removeClass('disabled');
        else
            $(item).addClass('disabled');
    }

    let childrenNum = children.length;
    for (var i = 0; i < childrenNum; i++) {
        let isItemEnabled = isEnabled;
        if (i != index)
            isItemEnabled = !isEnabled;

        setEnabled(children[index], isItemEnabled);
    }
}

function setTabSelectedProcedure(containerId, selectedTabId, isFromUserAction = false) {
    if (!isFromUserAction)
        setTabTitleSelected(containerId, selectedTabId);

    showSelectedTab(containerId, selectedTabId);

    manageConstantLinesVisualization(selectedTabId);
}

function setTabTitleSelected(titlesContainerId, selectedTabTitleId) {
    let titles = $(`#${titlesContainerId}`).find('li');
    if (titles && titles.length > 0) {
        let titlesNum = titles.length;
        for (var i = 0; i < titlesNum; i++) {
            let currentTabTitleId = $(titles[i]).find('a').attr('id');
            if (currentTabTitleId == selectedTabTitleId) {
                $(titles[i]).addClass('active fg-white text-bold');

                let width = $(titles[i]).width();
                let paddingLeft = $(titles[i]).parent().css('paddingLeft');

                /* move the tab marker and adjust width */
                $($('#charmsTabs').find('.tab-marker')[0]).css({ 'left': `${parseInt(paddingLeft)}px`, 'width': `${parseInt(width)}px` });
            } else {
                $(titles[i]).removeClass('active fg-white text-bold');
            }
        }
    }
}

function showSelectedTab(containerId, selectedTabId) {
    let tabs = $(`#${containerId}`).find('li');
    if (tabs && tabs.length > 0) {
        let tabsNum = tabs.length;
        for (var i = 0; i < tabsNum; i++) {
            /* change visualization of tabs + show/hide the tab related panel */
            let currentTabId = $(tabs[i]).find('a').attr('id');
            let currentPanelId = currentTabId.replace('title', '');
            if (currentTabId == selectedTabId) {
                $(tabs[i]).addClass('active');
                show(currentPanelId);
            } else {
                $(tabs[i]).removeClass('active');
                hide(currentPanelId);
            }
        }
    }
}

/* ################################################################################ */
/* OPEN/CLOSE SETTINGS */
/* ################################################################################ */
function toggleSettings(id) {
    if ($(`#${id}`).hasClass('keep-open')) {
        $(`#${id}`).removeClass('keep-open');

        setTimeout(function () { $(`#${id}`).addClass('keep-open') }, 500);
    }
}
/* ################################################################################ */
/* CHARMS LEGEND */
/* ################################################################################ */
function closeCharmsLegend() {
    if (Metro.charms.isOpen('#charmsLegend'))
        Metro.charms.close('#charmsLegend');
}

function createCharmsLegend() {
    /* close other charms, if opened */
    closeCharmsColorSelector();

    /* find raw spectra */
    let rawSpectra = getSpectraBySpectrumType(SPECTRUM_TYPE_RAW);

    if (!rawSpectra || rawSpectra.length == 0)
        return;

    initSpectraTree();

    /* add ref spectrum to list */
    let refSpectrums = getSpectraBySpectrumType(SPECTRUM_TYPE_REF);
    if (refSpectrums.length > 0)
        addSpectrumToSpectraTree(refSpectrums[0].Id);

    /* add ref-white spectrum to list */
    let refWhiteSpectrums = getSpectraBySpectrumType(SPECTRUM_TYPE_REF_WHITE);
    if (refWhiteSpectrums.length > 0)
        addSpectrumToSpectraTree(refWhiteSpectrums[0].Id);

    /* build array with spectra */
    let rawSpectraNum = rawSpectra.length;
    for (var i = 0; i < rawSpectraNum; i++) {
        addSpectrumToSpectraTree(rawSpectra[i].Id);

        let children = getChildrenIdsForSpectrum(rawSpectra[i].Id);
        if (children && children.length > 0) {
            //console.log(children);
            children.forEach(function (id) {
                addSpectrumChildToSpectraTree(rawSpectra[i].Id, id);
            });
        }
    }

    /* destroy previous legend */
    $('#legend').empty();

    /* build legend */
    let spectreTreeItemsNum = getSpectraTreeItemsNum();
    for (var i = 0; i < spectreTreeItemsNum; i++) {
        let rawSpectrumId = spectraTree[i].Id;
        let name = `${getSpectrumNameById(rawSpectrumId)} (${getSpectrumTypeById(rawSpectrumId)})`;

        if (name == SERIES_HIGHLIGHTED_SEGMENT)
            continue;

        let rawcolor = getSeriesColor(rawSpectrumId);

        let opacity = 1;
        let series = getSeriesFromId(rawSpectrumId);
        if (!series.isVisible()) opacity = 0.5;

        let mainliobj = $('<li/>', {
            class: 'fg-white'
        });
        $(mainliobj).attr('data-caption', name);
        $(mainliobj).attr('data-icon', `<span id='spectrum${rawSpectrumId}' class='mif-chevron-right pointer' style='background-color: ${rawcolor}; color: ${rawcolor}; opacity: ${opacity}' onclick='onSeriesClick(${rawSpectrumId})' onmouseover='onSeriesMouseOver(${rawSpectrumId})' onmouseout='onSeriesMouseOut(${rawSpectrumId})'></span>>`);

        if (spectraTree[i].Children.length > 0) {
            let ulobj = $('<ul/>');
            let childrenNum = spectraTree[i].Children.length;
            for (var j = 0; j < childrenNum; j++) {
                let childId = spectraTree[i].Children[j];

                let childcolor = getSeriesColor(childId);

                let opacity = 1;
                let series = getSeriesFromId(rawSpectrumId);
                if (!series.isVisible()) opacity = 0.5;

                let childIdForEvent = childId;
                if (!Number.isInteger(childId))
                    childIdForEvent = `"${childId}"`;

                let childliobj = $('<li/>', {
                    class: 'fg-light'
                });
                $(childliobj).attr('data-caption', getSpectrumTypeById(childId));
                let html = `<span id='spectrum${childId}' class='mif-chevron-right pointer' style='background-color: ${childcolor}; color: ${childcolor}; opacity: ${opacity}' `;
                html += `onclick='onSeriesClick(${childIdForEvent})' onmouseover='onSeriesMouseOver(${childIdForEvent})' onmouseout='onSeriesMouseOut(${childIdForEvent})'></span>`;
                html += `class="fg-white"></li>`;
                $(childliobj).attr('data-icon', html);

                $(childliobj).appendTo($(ulobj));
            }
            $(ulobj).appendTo(mainliobj);
        }

        $(mainliobj).appendTo('#legend');
    }

    Metro.makePlugin('#legend', 'treeview');
}

function refreshCharmsLegend() {
    if (Metro.charms.isOpen('#charmsLegend'))
        createCharmsLegend();
}

function toggleCharmsLegend() {
    Metro.getPlugin('#charmsLegend', 'charms').toggle();
}

/* ---------- LEGEND EVENTS ---------- */
function onSeriesClick(id) {
    let series = getSeriesFromId(id);
    if (series.isVisible()) {
        series.hide()
        $(`#spectrum${id}`).css({ opacity: 0.5 });
    } else {
        series.show();
        $(`#spectrum${id}`).css({ opacity: 1 });
    }
}

function onSeriesMouseOut(id) {
    let seriesName = getSeriesNameFromId(id);
    let series = dxChartGetSeriesByName(chartContainer, seriesName);
    series.clearSelection();
}

function onSeriesMouseOver(id) {
    let seriesName = getSeriesNameFromId(id);
    let series = dxChartGetSeriesByName(chartContainer, seriesName);
    series.select();
}

/* ---------- SPECTRA TREE ---------- */
function addSpectrumToSpectraTree(id) {
    if (spectraTree.findIndex(x => x == id) == -1)
        spectraTree.push(getSpectraTreeItem(id));
}

function addSpectrumChildToSpectraTree(parentId, id) {
    let spectraTreeItem = spectraTree.find(x => x.Id == parentId);
    if (!spectraTreeItem)
        return;

    if (spectraTreeItem.Children.findIndex(x => x == id) == -1)
        spectraTreeItem.Children.push(id);
}

function getSpectraTreeItem(id) {
    return {
        Id: id,
        Children: []
    };
}

function getSpectraTreeItemsNum() {
    return spectraTree.length;
}

function initSpectraTree() {
    spectraTree = [];
}
var selectedSpectrumType;
var isOnlyShowingColor;

function closeCharmsColorSelector() {
    Metro.getPlugin('#charmsColorSelector', 'charms').close();
}

function toggleCharmsColorSelector() {
    Metro.getPlugin('#charmsColorSelector', 'charms').toggle();
}

async function createSpectraTypesColorList() {
    /* close other charms, if opened */
    Metro.getPlugin('#charms', 'charms').close();
    Metro.getPlugin('#charmsLegend', 'charms').close();

    /* remove the old list */
    $('#spectraTypesColorsListContainer').empty();

    /* load spectra types-colors relationship values */
    await loadSpectraTypeColors();

    /* create new list */
    let spectraTypeColorsNum = spectraTypeColors.length;
    let html = `<div class="d-flex flex-column">`;
    for (var i = 0; i < spectraTypeColorsNum; i++) {
        html += createSpectraTypesColorListItem(spectraTypeColors[i].SpectrumType, spectraTypeColors[i].Value);
    }
    html += `</div>`;

    $('#spectraTypesColorsListContainer').html(html);
}

function createSpectraTypesColorListItem(spectrumType, color) {
    let html = ``;

    html += `<div id="spectrumType${spectrumType}" class="d-flex flex-justify-start pointer charms-color-select-list-item" onclick="setSpectrumTypeSelected(${spectrumType})">`;
    html += `   <div id="spectrumType${spectrumType}Color" class="dot margin-top-8" style="background-color: ${color}"></div>`;
    html += `   <div class="margin-left-8"><span class="text-leader2">${getSpectrumTypeDescription(spectrumType)}</span></div>`;
    html += `</div>`;

    return html;
}

/* -------------------------------------------------------------------------------- */
/* MANAGE SPECTRUM TYPE COLOR */
/* -------------------------------------------------------------------------------- */
function onSelectColor(color) {
    if (selectedSpectrumType) {
        let key = getSpectraTypeColorsKeyFromSpectrumType(selectedSpectrumType)
        if (key == null)
            return;

        /* show newly selected color for currently selected spectrumType */
        $(`#spectrumType${selectedSpectrumType}Color`).css('background-color', color);

        /* fix color for being saved in setting on cloud and locally */
        let fixedColor = color.replace('#', '').toUpperCase();

        /* update spectraTypeColors */
        let item = createSpectraTypeColorKeyValueItem(selectedSpectrumType, key, fixedColor);
        addOrUpdateSpectraTypeColoKeyValueItem(item);

        /* update series of selected spectrumType with the new color */
        updateSpectraColor(selectedSpectrumType, color);

        /* save setting on cloud */
        isOnlyShowingColor = false;
        saveColorOnCloud(key, fixedColor);
    }
}

function saveColorOnCloud(key, color) {
    if (isOnlyShowingColor)
        return;

    /* fix keyword for being saved  setting on cloud */
    let uppercaseKey = key.toUpperCase();
    let fixedKey = uppercaseKey.slice(0, 5) + "_" + uppercaseKey.slice(5);

    /* enque command for saving this setting */
    callEnqueueSaveSetting(timeoutSpectrumTypeColor, fixedKey, color, JS_DELAY_200);
}

function setSpectrumTypeSelected(spectrumType) {
    selectedSpectrumType = spectrumType;

    let spectraTypeColorsNum = spectraTypeColors.length;
    for (var i = 0; i < spectraTypeColorsNum; i++) {
        if (selectedSpectrumType == spectraTypeColors[i].SpectrumType)
            $(`#spectrumType${spectraTypeColors[i].SpectrumType}`).removeClass('charms-color-select-list-item').addClass('charms-color-select-list-item-selected');
        else
            $(`#spectrumType${spectraTypeColors[i].SpectrumType}`).removeClass('charms-color-select-list-item-selected').addClass('charms-color-select-list-item');
    }

    /* show defined color for selected spectrumType */
    isOnlyShowingColor = true;
    let color = getSpectraTypeColorsValueFromSpectrumType(selectedSpectrumType);
    Metro.getPlugin('#colorSelector', 'color-selector').val(color);
}

function updateSpectraColor(spectrumType, color) {
    let spectra = getSpectraBySpectrumType(spectrumType);

    if (!spectra || spectra.length == 0)
        return;

    let spectraNum = spectra.length;
    for (var i = 0; i < spectraNum; i++) {
        let index = findChartSeriesIndexByName(getSeriesNameFromId(spectra[i].Id));
        if (index == -1)
            continue;

        chartSeries[index].color = color;
    }

    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartRefresh(chartContainer);
}
var alignmentModel;

var isCheckboxForShowSegmentsChecked = false;
var isCheckboxForShowSegmentsValueToBeSavedOnCloud = true;
var timeoutNumOfPoints;
var timeoutSegments;
var timeoutSelectedSegment;
var timeoutSpectrumTypeColor;

var selectedSpectrumForProcessingId = 0;
var isSavedOnCloudFileRemovalRequested = false;
var isHidingRefWhitesRequested = false;

/* we want to know which spectra are ref whites */
var refWhitesIds = [];

var PARENT_ID = 'ParentId';

async function initAlignmentAsync() {
    spectraForProcessingIds = [];

    refWhitesIds = [];

    isSavedOnCloudFileRemovalRequested = false;

    alignmentModel = {
        Segments: [],
        NumOfPoints: 3,
        SelectedSegment: 0
    };

    $('#alignmentPanel').remove();

    await loadSegmentsAsync();

    await tryShowAlignmentSegmentsAsync();
}

function callCheckIsSpectrumOfTypeSavedOnCloudForAligned(filename = null) {
    if (filename == null) {
        let file = getSpectrumInfoById(selectedSpectrumForProcessingId);
        filename = file.Name;
    }

    checkIsSpectrumOfTypeSavedOnCloudAsync(filename, SPECTRUM_TYPE_ALIGNED);
}

/* ################################################################################ */
/* RETRIEVE SETTING FOR ALIGNMENT */
/* ################################################################################ */
async function loadAlignmentValuesAsync() {
    /* enable event management for switch for auto-aligning spectrum */
    await initSwitchLoadAutoAlignSpectrumAsync();

    /* enable event management for switch for auto-loading aligned spectrum */
    await initSwitchLoadAutoDownloadAlignedSpectrumAsync();

    initCheckBoxForShowingLines();

    buildSliders();
    await loadSelectedSegmentAsync();
    await loadNumOfPointsForAlignmentAsync();

    /* automatically raise event for loading ref whites */
    setWhitesSwitchChecked(true);

    /* enable 1st tab */
    setTabEnabled(0, true);
}

function setWhitesSwitchChecked(isChecked) {
    $('#charmsSwitchLoadWhiteSpectraForAlignment').prop('checked', isChecked).trigger('change');
}

/* -------------------------------------------------------------------------------- */
/* ---------- ALIGNMENT LINES ---------- */
/* -------------------------------------------------------------------------------- */
function getAlignmentConstantLines(areLabelsVisible = true) {
    let alignmentSegmentsNum = alignmentModel.Segments.length;
    let constantLines = [];
    for (var i = 0; i < alignmentSegmentsNum; i++) {
        constantLines.push(
            {
                value: parseInt(alignmentModel.Segments[i]),
                color: lightGreen,
                width: 2,
                dashStyle: 'solid',
                label: {
                    visible: areLabelsVisible
                }
            });
    }

    return constantLines;
}

async function tryShowAlignmentSegmentsAsync() {
    let obj = await getUserSettingAsync(ALIGNMENT_SHOW_LINES)
    if (obj.IsOk) {
        if (obj.Value == '1') {
            isCheckboxForShowSegmentsChecked = true;
            setAlignmentSegmentsVisible(true);
        } else {
            isCheckboxForShowSegmentsChecked = false;
            setAlignmentSegmentsVisible(false);
        }
    } else {
        showSimpleDialog(ERROR_LABEL, AlignmentLoadSegmentsErrorMessage, ALERT);
    }
}

function setAlignmentSegmentsVisible(isVisible = true) {
    let chart = dxChartGetChart(chartContainer);

    if (isVisible) {
        if (alignmentModel.Segments.length > 0) {
            /* 1) remove existing lines */
            resetShownConstantLines();

            /* 2) build new lines */
            addOrUpdateConstantLines(getAlignmentConstantLines(), CHART_CONSTANT_LINES_ALIGNMENT);
            updateConstantLines();
        }
    } else {
        removeConstantLines(CHART_CONSTANT_LINES_ALIGNMENT);
        updateConstantLines();
        //dxChartUpdateOption(chart, 'argumentAxis.constantLines', []);
    }
}

/* -------------------------------------------------------------------------------- */
/* SEGMENTS */
/* -------------------------------------------------------------------------------- */
function initCheckBoxForShowingLines() {
    /* set checkbox checked/unchecked depending on isCheckboxForShowSegmentsChecked */
    $('#alignmentCheckboxShowLines').prop('checked', isCheckboxForShowSegmentsChecked);

    /* set event for checkbox */
    $('#alignmentCheckboxShowLines').on('click', function () {
        let isChecked = isCheckboxChecked('alignmentCheckboxShowLines');

        setAlignmentSegmentsVisible(isChecked);

        /* append an item to queue of settings to be saved */
        if (isCheckboxForShowSegmentsValueToBeSavedOnCloud) {
            let value = (isChecked ? '1' : '0');
            enqueSaveSetting(getQueueItem(ALIGNMENT_SHOW_LINES, value));
        }

        /* reset variable to true to allow saving on cloud if checked manually */
        isCheckboxForShowSegmentsValueToBeSavedOnCloud = true;
    })
}

async function loadSegmentsAsync() {
    let obj = await getUserSettingAsync(ALIGNMENT_SEGMENTS_BOUNDARIES);
    if (obj.IsOk) {
        /* save segments  */
        alignmentModel.Segments = obj.Value.split(',');
    } else {
        showSimpleDialog(ERROR_LABEL, AlignmentLoadSegmentsErrorMessage, ALERT);
    }
}

async function loadSelectedSegmentAsync() {
    let obj = await getUserSettingAsync(ALIGNMENT_SELECTED_SEGMENT);
    if (obj.IsOk) {
        alignmentModel.SelectedSegment = parseInt(obj.Value);
    } else {
        showSimpleDialog(ERROR_LABEL, AlignmentLoadSelectedSegmentErrorMessage, ALERT);
    }
}

/* -------------------------------------------------------------------------------- */
/* CREATE SLIDERS */
/* -------------------------------------------------------------------------------- */
function buildSliders() {
    let valuesNum = alignmentModel.Segments.length;
    for (var i = 0; i < valuesNum; i++) {
        /* save segment boundary in array and create slider */
        buildSlider(parseInt(alignmentModel.Segments[i]), i);
    }
}

function buildSlider(value, index) {
    let min = value - 100;
    let max = value + 100;

    let id = `slider${index}Container`;

    let html = ``;
    html += `<input type="number" id="slider${index}Target" class="slider-target">`;
    html += `<input id="slider${index}" `;
    html += `data-role="slider" `;
    html += `data-return-type="value" `;
    html += `data-show-min-max="true" `;
    html += `data-min="${min}" `;
    html += `data-max="${max}" `;
    html += `data-value="${value}" `;
    html += `data-on-change-value="${onChangeSegmentCenter.name}" `;
    html += `data-accuracy="1" `;
    html += `data-target="#slider${index}Target" `;
    html += `data-hint-position="top" `;
    html += `data-hint-always="true" `;
    html += `data-cls-hint="bg-cyan" `;
    html += `data-cls-slider="ultra-thin cycle-marker" `;
    html += `data-cls-marker="bg-blue" `;
    html += `data-cls-complete="bg-cyan">`;

    $(`[id^=slider][id$=Target]`).on("keyup input paste", function (evt) {
        //console.log(this.value);
        let sliderid = this.id.replace('Target', '');
        $(`#${sliderid}`).attr('data-value', parseInt(this.value));
        evt.preventDefault();
    });

    $(`#${id}`).ready(async function () {
        showAndAnimateElementAsync(id, 'fadeIn', FAST);
    });

    $(`#${id}`).html(html);
}

function onChangeSegmentCenter(val, slider) {
    //console.log(`onChangeSegmentCenter - val: ${val}, slider: ${slider}`);

    try {
        let index = parseInt(slider.id.replace('slider', ''));
        alignmentModel.Segments[index] = val;

        let segmentsstring = alignmentModel.Segments.join();

        callEnqueueSaveSetting(timeoutSegments, ALIGNMENT_SEGMENTS_BOUNDARIES, segmentsstring, JS_DELAY_500);

        setAlignmentSegmentsVisible();
    } catch (e) {
        console.log(`onChangeSegmentCenter - ex: ${e}`);
    }
}

/* -------------------------------------------------------------------------------- */
/* SELECTED SEGMENT */
/* -------------------------------------------------------------------------------- */
function setSelectedSegment(xValue, isSaveSettingRequired = true) {
    let index = 0;

    let segments = alignmentModel.Segments.map(x => { return parseInt(x); });

    let segmentsNum = segments.length;
    for (var i = 0; i < segmentsNum - 1; i++) {
        if (xValue >= segments[i] && xValue <= segments[i + 1]) {
            index = i;
            break;
        }
    }

    alignmentModel.SelectedSegment = index;

    setStripsForMiniature();
    setSelectedSegmentMessage(false);

    /* enque command for saving this setting */
    if (isSaveSettingRequired)
        callEnqueueSaveSetting(timeoutSelectedSegment, ALIGNMENT_SELECTED_SEGMENT, index.toString(), JS_DELAY_200);
}

function setSelectedSegmentMessage(makeVisible = true) {
    let message = AlignmentChartMiniatureSelectedSegmentMessage
        .replace('r_v1', alignmentModel.Segments[alignmentModel.SelectedSegment])
        .replace('r_v2', alignmentModel.Segments[alignmentModel.SelectedSegment + 1]);

    $('#chartMiniatureSelectedSegment').text(message);

    if (makeVisible) {
        showByClass('chartMiniatureSelectedSegmentContainer');
        animateCSS('chartMiniatureSelectedSegmentContainer', 'fadeIn', 'FASTER');
    }
}

function setStripsForMiniature() {
    let strips = [{
        startValue: alignmentModel.Segments[alignmentModel.SelectedSegment],
        endValue: alignmentModel.Segments[alignmentModel.SelectedSegment + 1],
        color: lightGreenTransparent
    }];

    $('#chartMiniature').dxChart('instance').option('argumentAxis.strips', strips);
}

/* -------------------------------------------------------------------------------- */
/* NUM OF POINTS */
/* -------------------------------------------------------------------------------- */
async function loadNumOfPointsForAlignmentAsync() {
    let obj = await getUserSettingAsync(ALIGNMENT_NUM_OF_POINTS);
    if (obj.IsOk) {
        /* save retrieved value and show it */
        setNumOfPointsForAlignment(parseInt(obj.Value));
        showAndAnimateElementAsync('alignedNumOfPointsForAlignment', 'fadeIn', FAST);
    } else {
        showSimpleDialog(ERROR_LABEL, AlignmentLoadNumOfPointsErrorMessage, ALERT);
    }
}

function onChangeNumOfPoints(curr, request, real) {
    if (curr == parseInt(real))
        return;

    alignmentModel.NumOfPoints = curr;

    //console.log(`onChangeNumOfPoints - curr: ${curr}, request: ${request}, real: ${real}`);
    callEnqueueSaveSetting(timeoutNumOfPoints, ALIGNMENT_NUM_OF_POINTS, real, JS_DELAY_500);
}

function setNumOfPointsForAlignment(value) {
    alignmentModel.NumOfPoints = value;
    Metro.getPlugin('#inputNumOfPointsForAlignment', 'spinner').val(value);
}

/* ################################################################################ */
/* AUTO ALIGN SPECTRUM */
/* ################################################################################ */
async function initSwitchLoadAutoAlignSpectrumAsync() {
    await loadAutoAlignSpectrumAsync();

    $('#charmsSwitchAutoAlignSpectrum').on('change', async function () {
        let isChecked = isCheckboxChecked('charmsSwitchAutoAlignSpectrum');

        enqueSaveSetting(getQueueItem(ALIGNMENT_AUTO_ALIGN_SPECTRUM, (isChecked ? '1' : '0')));

        if (isChecked) {
            /* show message for saved settings */
            showBubble('charmsSwitchAutoAlignSpectrumBubble');

            /* if auto align is enabled, then disable auto download */
            setSwitchAutoDownloadAlignedSpectrumAsync(false);
            enqueSaveSetting(getQueueItem(ALIGNMENT_AUTO_DOWNLOAD_ALIGNED_SPECTRUM, '0'));
        }
    });
}

async function loadAutoAlignSpectrumAsync() {
    let obj = await getUserSettingAsync(ALIGNMENT_AUTO_ALIGN_SPECTRUM);
    if (obj.IsOk) {
        /* save retrieved value and show it */
        let isChecked = (obj.Value == '1');
        setSwitchAutoAlignSpectrum(isChecked);
    } else
        setSwitchAutoAlignSpectrum(false);
}

function setSwitchAutoAlignSpectrum(isChecked) {
    $('#charmsSwitchAutoAlignSpectrum').prop('checked', isChecked);

    if (isChecked)
        alignSpectrumAsync();
}

/* ################################################################################ */
/* AUTO DOWNLOAD ALIGNED SPECTRUM */
/* ################################################################################ */
async function initSwitchLoadAutoDownloadAlignedSpectrumAsync() {
    await loadAutoDownloadAlignedSpectrumAsync();

    $('#charmsSwitchAutoDownloadAlignedSpectrum').on('change', async function () {
        let isChecked = isCheckboxChecked('charmsSwitchAutoDownloadAlignedSpectrum');

        enqueSaveSetting(getQueueItem(ALIGNMENT_AUTO_DOWNLOAD_ALIGNED_SPECTRUM, (isChecked ? '1' : '0')));

        if (isChecked) {
            /* show message for saved settings */
            showBubble('charmsSwitchAutoDownloadAlignedSpectrumBubble');

            /* if auto download is enabled, then disable auto align */
            setSwitchAutoAlignSpectrum(false);
            enqueSaveSetting(getQueueItem(ALIGNMENT_AUTO_ALIGN_SPECTRUM, '0'));
        }
    });
}

async function loadAutoDownloadAlignedSpectrumAsync() {
    let obj = await getUserSettingAsync(ALIGNMENT_AUTO_DOWNLOAD_ALIGNED_SPECTRUM);
    if (obj.IsOk) {
        /* save retrieved value and show it */
        let isChecked = (obj.Value == '1');
        setSwitchAutoDownloadAlignedSpectrumAsync(isChecked);
    } else
        setSwitchAutoDownloadAlignedSpectrumAsync(false);
}

async function setSwitchAutoDownloadAlignedSpectrumAsync(isChecked) {
    $('#charmsSwitchAutoDownloadAlignedSpectrum').prop('checked', isChecked);

    if (isChecked) {
        isHidingRefWhitesRequested = true; // after aligned has been downloaded, we don't need visible ref whites anymore
        await downloadProcessedSpectrumAsync(SPECTRUM_TYPE_ALIGNED);
    }
}

/* ################################################################################ */
/* LOAD/REMOVE REF WHITES */
/* ################################################################################ */
function initSwitchLoadWhiteSpectraForAlignment() {
    $('#charmsSwitchLoadWhiteSpectraForAlignment').on('change', async function () {
        let isChecked = isCheckboxChecked('charmsSwitchLoadWhiteSpectraForAlignment');

        if (isChecked)
            await loadWhiteSpectraForAlignmentProcedureAsync();
        else
            unloadWhiteSpectraForAlignment();
    });
}

function binarySearchInsert(arr, newItem) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        if (arr[mid].X === newItem.X) {
            return mid;
        } else if (arr[mid].X < newItem.X) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return left;
}

function createSeriesForWhiteSpectra(idItem, objSpectraInfo, isPointVisible = false) {
    let keyId = getIdValue(idItem);
    var index = objSpectraInfo.findIndex(x => x.Id == keyId);
    let name = `${objSpectraInfo[index].Name} (${getSpectrumTypeDescription(objSpectraInfo[index].SpectrumType)})`;
    let color = getSpectrumTypeColor(getSpectrumTypeString(objSpectraInfo[index].SpectrumType));
    let series = {
        valueField: idItem,
        name: name,
        axis: 'valueAxis',
        point: { visible: isPointVisible },
        color: color,
        isVisible: true,
    };

    return series;
}

function extractSpectraIds(points) {
    let ids = [];

    if (points && points.length > 0) {
        let pointsNum = points.length;
        for (var i = 0; i < pointsNum; i++) {
            let properties = Object.getOwnPropertyNames(points[i])
            properties.forEach(property => {
                if (property != 'X' && ids.findIndex(x => x == property) == -1)
                    ids.push(property);
            });
        }
    }

    return ids;
}

async function loadWhiteSpectraForAlignmentAsync() {
    let obj = await doAjaxGetNoModelAsync(UrlGetWhiteSpectraForAlignment);
    if (obj) {
        dxChartBeginUpdate(chartContainer);

        /* append spectra info items to current series */
        obj.SpectraInfo.forEach(x => {
            addSpectrumInfo(x);
        });

        /* create new series for ref whites and append them to current series list */
        let ids = extractSpectraIds(obj.Points);
        ids.forEach(id => {
            let idseries = createSeriesForWhiteSpectra(id, obj.SpectraInfo);
            addChartSeries(idseries);
            /* save ids of ref whites */
            refWhitesIds.push(getIdValue(id));
        });

        /* retrieve current items */
        let items = dxChartGetItems(chartContainer);

        /* add points and series to existing chart */
        let pointsNum = obj.Points.length;
        for (var i = 0; i < pointsNum; i++) {
            let index = items.findIndex(x => x.X == obj.Points[i].X);
            if (index == -1) {
                /* a point with same X DOES NOT exist, we must add point */
                let item = { X: obj.Points[i].X };
                let index1 = binarySearchInsert(items, obj.Points[i]);
                let ids = extractSpectraIds([obj.Points[i]]);
                ids.forEach(id => {
                    item[id] = obj.Points[i][id];
                });
                items.splice(index1, 0, item);
            } else {
                /* a point with same X exists, add ids to existing point */
                ids.forEach(id => {
                    if (obj.Points[i][id])
                        items[index][id] = obj.Points[i][id];
                });
            }
        }

        /* update chart series */
        dxChartUpdateSeries(chartContainer, chartSeries);

        dxChartEndUpdate(chartContainer);

        /* reset visual range to make ref whites appear in chart */
        if (!isCheckboxChecked('charmsSwitchAutoAlignSpectrum') && !isCheckboxChecked('charmsSwitchAutoDownloadAlignedSpectrum'))
            dxChartResetVisualRange(chartContainer);

        /* enable button for alignment and change title */
        setButtonAlignEnabled('alignmentButtonExecute', true, AlignmentButtonExecuteLabel);
    } else {
        showSimpleDialog(ERROR_LABEL, AlignmentLoadWhiteSpectraForAlignmentErrorMessage, ALERT);
    }
}

async function loadWhiteSpectraForAlignmentProcedureAsync() {
    await loadWhiteSpectraForAlignmentAsync();

    if (isHidingRefWhitesRequested) {
        setRefWhitesHidden();
        isHidingRefWhitesRequested = false;
    }

    /* hide all but the selected one and ref whites */
    let hiddenSpectraNum = hideSpectraToBeHidden();
    if (hiddenSpectraNum > 0) {
        showByClass('buttonShowToastAutoHideNotSelectedSpectra');
        showToast(AlignmentAutoHideNotSelectedRawSpectraMessage, 3000, INFO);
    }
}

function unloadWhiteSpectraForAlignment() {
    /* remove ref whites from list of info about loaded spectra */
    /* AND */
    /* remove series related to ref white spectra */
    let refWhitesIdsNum = refWhitesIds.length;
    for (var i = 0; i < refWhitesIdsNum; i++) {
        /* remove from spectraInfo */
        let index1 = getSpectrumIndexById(refWhitesIds[i]);
        removeSpectrumByIndex(index1);

        /* remove from chartSeries */
        let index2 = findChartSeriesIndexByValueFieldId(buildId(refWhitesIds[i]));
        removeChartSeriesAt(index2);
    }

    dxChartBeginUpdate(chartContainer);

    /* remove points belonging to ref white spectra */
    let items = dxChartGetItems(chartContainer);
    let itemsNum = items.length;
    for (var i = itemsNum - 1; i >= 0; i--) {
        refWhitesIds.forEach(id => {
            let idItem = buildId(id);
            if (items[i][idItem])
                delete items[i][idItem];
        });

        let properties = Object.getOwnPropertyNames(items[i])
        if (properties && properties.length == 1 && properties[0] == 'X')
            items.splice(i, 1);
    }

    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    /* reset visual range to make ref whites disappear in chart */
    //dxChartRefresh(chartContainer);
    dxChartResetVisualRange(chartContainer);

    /* clean array with ids of ref white spectra */
    refWhitesIds = [];

    /* enable button for alignment and change title */
    setButtonAlignEnabled('alignmentButtonExecute', false, AlignmentButtonDisabledMessage);
}

/* -------------------------------------------------------------------------------- */
/* MANAGE CHART MINIATURE */
/* -------------------------------------------------------------------------------- */
function createChartMiniatureProcedure() {
    try {
        /* retrieve selected spewctrum id */
        if (selectedSpectrumForProcessingId <= 1)
            return;

        let dataSource = getSpectrumPointsById(selectedSpectrumForProcessingId);
        if (!dataSource)
            return;

        createChartMiniature(dataSource);

        /* show label */
        showByClass('chartMiniatureLabelContainer');
        animateCSS('chartMiniatureLabelContainer', 'fadeIn', 'FASTER');

        /* set and show the selected segment message */
        setSelectedSegmentMessage();
    } catch (e) {
        console.log(`createChartMiniatureProcedure - ex: ${e}`);
    }
}

function createChartMiniature(dataSource) {
    /* dispose existant chart, avoiding issues with zoom when recreating */
    disposeChartMiniature();

    let constantLines = getAlignmentConstantLines(false);

    let chart = $('#chartMiniature').dxChart({
        /* data */
        dataSource: dataSource,
        commonSeriesSettings: {
            argumentField: 'X',
            type: "line",
            point: { visible: true },
        },
        argumentAxis: {
            name: 'argumentAxis',
            argumentType: 'numeric',
            type: 'continuous',
            valueMarginsEnabled: true,
            tickInterval: 500,
            minorTickInterval: 100,
            color: 'white',
            label: {
                visible: true,
                color: 'white'
            },
            constantLines: constantLines
        },
        valueAxis: {
            name: 'valueAxis',
            showZero: false,
            color: 'white',
            label: {
                visible: true,
                color: 'white'
            },
        },
        series: [
            { valueField: 'Y' }
        ],
        /* visualization options */
        zoomAndPan: {
            dragToZoom: false,
            allowMouseWheel: false,
        },
        size: {
            height: 150,
            width: 400
        },
        commonAxisSettings: {
            grid: {
                visible: false
            },
            minorGrid: {
                visible: false,
            },
        },
        crosshair: {
            enabled: false
        },
        margin: {
            bottom: 0
        },
        legend: {
            visible: false
        },
        /* export options */
        export: {
            enabled: false,
        },
        onPointClick: function (evt) {
            setSelectedSegment(evt.target.argument);
        }
    }).dxChart("instance");

    /* highlights selected reference segment for alignment */
    setStripsForMiniature();

    /* free memory */
    dataSource = 0;
}

function disposeChartMiniature() {
    try {
        $('#chartMiniature').dxChart("dispose");
        $('#chartMiniature').empty();
    } catch (e) { }
}

/* ################################################################################ */
/* ALIGN SPECTRUM */
/* ################################################################################ */
async function alignSpectrumAsync() {
    if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED)) {
        showSimpleDialog(WARNING_LABEL, AlignedNoProcessBecauseAlreadyPresentMessage, WARNING);
        return;
    }

    let points = getSpectrumPointsById(selectedSpectrumForProcessingId);
    if (!points)
        return;

    if (isSpectrumAvailableByType(SPECTRUM_TYPE_REF_WHITE)) {
        let refWhiteYValuesMax = getRefWhiteYMax();

        let refSpectrumPoints = getSpectrumPointsBySpectrumType(SPECTRUM_TYPE_REF);

        points = await window.dotNetHelper.invokeMethodAsync("normalizePoints",
            points,
            refWhiteYValuesMax,
            refSpectrumPoints);
    }

    let segments = alignmentModel.Segments.map(x => { return parseFloat(x); });

    let selectedSegmentValue = segments[alignmentModel.SelectedSegment];
    let isXMinLowestBoundary = segments.findIndex(x => x < selectedSegmentValue) == -1;
    let isXMaxHighestBoundary = segments.findIndex(x => x > selectedSegmentValue) == -1;

    let alignedPoints = await window.dotNetHelper.invokeMethodAsync("alignSpectrumPoints",
        points,
        segments,
        segments[alignmentModel.SelectedSegment],
        segments[alignmentModel.SelectedSegment + 1],
        isXMinLowestBoundary,
        isXMaxHighestBoundary,
        alignmentModel.NumOfPoints);

    let isOk = true;
    if (alignedPoints && alignedPoints.length > 0) {
        /* build and show aligned spectrum */
        let alignedSpectrum = buildAlignedSpectrum();
        if (alignedSpectrum) {
            /* add aligned spectrum to chart */
            addProcessedSpectrum(alignedSpectrum, alignedPoints, SPECTRUM_TYPE_ALIGNED);

            /* actions needed to update UI after aligned spectrum hs been added */
            buildAlignedSpectrumCompleted();

            /* set text of cloud icon */
            setCloudTextAndIconStatus(SPECTRUM_TYPE_ALIGNED, false);
        }
        else
            isOk = false
    } else
        isOk = false;

    if (!isOk)
        showSimpleDialog(ERROR_LABEL, AlignmentExecutionErrorMessage, ALERT);
}

function buildAlignedSpectrum() {
    try {
        /* retrieve info about parent spectrum */
        let rawSpectrum = getSpectrumInfoById(selectedSpectrumForProcessingId);

        /* build spectrum info for being added to 'spactraInfo' */
        let alignedSpectrum = {
            Id: buildTempAlignedId(),
            ParentId: selectedSpectrumForProcessingId,
            Name: rawSpectrum.Name,
            SpectrumLevel: rawSpectrum.SpectrumLevel,
            SpectrumType: SPECTRUM_TYPE_ALIGNED,
            InsertDateTimeJs: 0
        };

        /* save spectrum into 'spoectraInfo' */
        addSpectrumInfo(alignedSpectrum);

        return alignedSpectrum;
    } catch (e) {
        console.log(`${buildAlignedSpectrum.name} - ex: ${e}`);
        return null;
    }
}

function buildAlignedSpectrumCompleted() {
    /* enable tab for fitting spectrum */
    setTabEnabled(1, true);

    /* load panel for smoothing */
    loadPartialViewWithAjaxGetNoModel(UrlLoadSmoothingPanel, 'smoothingoptions');

    /* enable management of clicked point on aligned spectrum for fitting */
    setIsPointClickForFitEnabled(true);

    /* enable buttons for saving/removing aligned spectrum */
    setMetroUIButtonEnabled('alignmentButtonSave', true);
    setMetroUIButtonEnabled('alignmentButtonRemove', true);

    /* set hidden the checkbox for removing file on cloud (because of the used HTML & css, we need to do it manually, since the 'd-none' class doesn't work) */
    hideElemMetroUIElem('checkboxRemoveAlignedSpectrumOnCloud');

    /* add ref white ids to spectra to be hidden */
    setRefWhitesHidden();

    /* refresh legend, if opened */
    refreshCharmsLegend();

    /* mantain hidden all not necessary spectra */
    let hiddenSpectraNum = hideSpectraToBeHidden();
    if (hiddenSpectraNum > 0) {
        showToast(AlignmentAutoHideRefSpectraMessage, 3000, INFO);
    }
}

function getRefWhiteYMax() {
    let refWhiteYValuesMax = 1.0;

    let refWhiteSpectrum = getSpectrumBySpectrumType(SPECTRUM_TYPE_REF_WHITE);

    try {
        let refWhiteSpectrumPoints = getSpectrumPointsById(refWhiteSpectrum.Id);
        let refWhiteYValues = refWhiteSpectrumPoints.map(p => { return p.Y; });
        refWhiteYValuesMax = Math.max(...refWhiteYValues);
    } catch (e) {
        console.log(`getRefWhiteYMax ex: ${e}`);
    }

    return refWhiteYValuesMax;
}

function setRefWhitesHidden() {
    refWhitesIds.forEach(function (id) {
        setSpectrumVisibility(id, false);
    });
}

/* ################################################################################ */
/* SAVE ALIGNED SPECTRUM */
/* ################################################################################ */
function getAlignedParentFiles(parentId) {
    return {
        ParentFile: getParentFile(parentId),
        RefFile: getRefWhiteFile(SPECTRUM_TYPE_REF),
        RefWhiteFile: getRefWhiteFile(SPECTRUM_TYPE_REF_WHITE)
    };
}

function getAlignmentSettings() {
    let segments = alignmentModel.Segments.map(x => { return parseFloat(x); });

    return {
        NumOfPoints: alignmentModel.NumOfPoints,
        AlignmentSegmentBoundaries: {
            Min: parseFloat(segments[alignmentModel.SelectedSegment]),
            Max: parseFloat(segments[alignmentModel.SelectedSegment + 1])
        }
    };
}

async function saveAlignedSpectrumProcedureAsync() {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    let cond1 = await checkIsSpectrumOfTypeSavedOnCloudAsync(spectrum.Name, SPECTRUM_TYPE_ALIGNED);
    let cond2 = isSpectrumOfTypeSavedOnCloud(SPECTRUM_TYPE_ALIGNED);
    if (cond1 || cond2)
        askAndExecute(CharmsSpectraProcessingManagementLabel, OverwriteSavedSpectrumQuestion, saveAlignedSpectrumAsync);
    else
        saveAlignedSpectrumAsync();
}

async function saveAlignedSpectrumAsync(showLoadingAndMessage = true) {
    let isSavingOk = true;

    try {
        let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        if (!spectrum)
            return;

        if (showLoadingAndMessage)
            setLoadingCircleIsVisible(true);

        /* retrieve parent file */
        let rawSpectrum = getSpectrumInfoById(selectedSpectrumForProcessingId);

        let alignmentSettings = getAlignmentSettings();
        let parentFiles = getAlignedParentFiles(selectedSpectrumForProcessingId);

        let xml = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeAlignedModelAsXml",
            spectrum.Name,
            spectrum.SpectrumType,
            getSpectrumPointsById(spectrum.Id),
            alignmentSettings,
            parentFiles);


        let spectrumFile = {
            Id: 0,
            Filename: spectrum.Name,
            ParentId: rawSpectrum.Id,
            Type: spectrum.SpectrumType,
            Level: spectrum.SpectrumLevel,
            Xml: xml
        };

        /* create model for request */
        let saveSpectrumRequest = {
            SpectrumFile: spectrumFile,
            AlignmentSettings: alignmentSettings,
            ParentFiles: parentFiles, // defined in charms.js
        };

        /* execute request and process response */
        let obj = await doAjaxPostAsync(UrlSaveSpectrumOfTypeAligned, saveSpectrumRequest);
        if (obj) {
            if (obj.IsOk) {
                let index = getSpectrumIndexById(spectrum.Id);

                /* add ParentId property to aligned spectrum */
                spectraInfo[index][PARENT_ID] = rawSpectrum.Id;

                /* UPDATES */
                /* 1) update spectraInfo id of aligned file with the one coming from DB */
                updateSpectrumInfoId(index, obj.Id);

                /* 2) update valueField for chart points by replacing the old fake-id with the real one */
                updateProcessedSpectrumValueField(buildTempAlignedId(), buildId(obj.Id));

                /* 3) update series in chart to ensure correspondance between series and valueField of aligned spectrum */
                updateProcessedSpectrumSeries(buildTempAlignedId(), buildId(obj.Id), obj.Id, true);

                /* call method for checking whether a version of aligned file is already saved on cloud or not */
                callCheckIsSpectrumOfTypeSavedOnCloudForAligned(spectraInfo[index].Name);

                /* mantain hidden unwanted spectra */
                hideSpectraToBeHidden();

                /* enable button for removing aligned file */
                setMetroUIButtonEnabled('alignmentButtonRemove', true);
            } else
                isSavingOk = false;
        } else
            isSavingOk = false;
    } catch (e) {
        isSavingOk = false;
        console.log(`${saveAlignedSpectrumAsync.name} - ex: ${e}`);
    }

    if (showLoadingAndMessage) {
        setLoadingCircleIsVisible(false);

        if (isSavingOk)
            showSimpleDialog(INFO_LABEL, AlignmentSaveSuccessMessage, SUCCESS);
        else
            showSimpleDialog(ERROR_LABEL, AlignmentSaveErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* REMOVE ALIGNED SPECTRUM */
/* ################################################################################ */
function removeAlignedSpectrumProcedure() {
    /* hide children removal warning message if it has previously been shown */
    switchVisibilityOfChildrenSpectraRemovalMessage('alignedChildrenRemovalWarning', false);

    /* check whether children removal warning message is to be shown or not  */
    let childSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    if (isAnySpectrumChildById(childSpectrum.Id))
        switchVisibilityOfChildrenSpectraRemovalMessage('alignedChildrenRemovalWarning', true);

    /* start removal procedure */
    removeFileProcedure(SPECTRUM_TYPE_ALIGNED, 'checkboxRemoveAlignedSpectrumOnCloud', 'alignedDialogRemove');
}

async function removeAlignedSpectrumAsync(alignedSpectrum, isRemovalOnCloudRequested = false) {
    /* retrieve index of spectrum in spectraInfo */
    let index = getSpectrumIndexById(alignedSpectrum.Id);

    let seriesname = getSpectrumSeriesNameFromIndex(index);

    /* remove aligned file from chart */
    removeSpectrumFromChart(seriesname, alignedSpectrum.Id);

    /* remove aligned file from spectraInfo */
    removeSpectrumByIndex(index);

    /* disable management of clicked point on aligned spectrum for fitting */
    setIsPointClickForFitEnabled(false);

    /* remove aligned file from cloud, if required  */
    if (isRemovalOnCloudRequested && Number.isInteger(alignedSpectrum.Id)) {
        await removeSpectrumOnCloudAsync(alignedSpectrum.Id, AlignmentRemovalSuccessMessage, AlignmentRemovalErrorMessage);
    }

    /* disable buttons for saving/removing since aligned spectrum is not present anymore */
    setMetroUIButtonEnabled('alignmentButtonSave', false);
    setMetroUIButtonEnabled('alignmentButtonRemove', false);

    /* disable tabs for fit and smoothing */
    setTabEnabled(1, false);
    setTabEnabled(2, false);

    /* refresh legend, if opened */
    refreshCharmsLegend();

    /* set text of cloud icon */
    setCloudTextAndIconStatus(SPECTRUM_TYPE_ALIGNED, false);
    callCheckIsSpectrumOfTypeSavedOnCloudForAligned(alignedSpectrum.Name);
}

/* ################################################################################ */
/* RETRIEVE ALIGNMENT SETTINGS */
/* ################################################################################ */
async function downloadAlignmentSettingsAsync(id) {
    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetAlignmentSettings, model);
    if (obj && obj.IsOk) {
        /* set settings for alignment without saving values as settings */

        /* 1) set num of points */
        setNumOfPointsForAlignment(obj.ResponseObject.NumOfPoints);

        /* 2.1) set selected segment */
        setSelectedSegment(obj.ResponseObject.AlignmentSegmentBoundaries.Max, false);

        /* 2.2) update selected region in chart miniature */
        setStripsForMiniature();
    } else {
        showSimpleDialog(ERROR_LABEL, AlignmentDownloadAlignmentSettingsErrorMessage, ALERT);
    }
}
var isContinuumRemovedDownloadRequested = false;
var isFitTabSelected = false;
var isFitTabReady = false;
var isPointClickForFitEnabled = false;
var isRemovingContinuum = false;

var timeoutNumOfPointsForMissingPoints;

var isShowChartConstantLinesForFitPointsAllowed = false;
var isAutoRecalculateContinuumRemovedAllowed = false;
var isShowBreaksOnValueAxisForContinuumRemovedRequested = false;

var missingPoints = [];
var pointsForFitting = [];
var fitFunctions = [];
var pXMinPXMaxMaxValueFunctions = [];
var segmentsForFitting = [];

var fitPointSemiRange = 20;
var selectedSpectrumTypeForContinuumRemoval;

var SERIES_FIT_POINT = 'FitPoint';
var SERIES_FIT_POINTS = 'FitPointsSeries';
var SERIES_HIGHLIGHTED_SEGMENT = 'HighlightedSegmentSeries';

var FIT_NUM_OF_POINTS_FOR_MISSING_POINTS_VALUE = 'fitnumofpointsvalue'
var FIT_SEGMENT_CORE = 'fitsegmentcore';
var FIT_SEGMENT_PRO = 'fitsegmentpro';
var FIT_SEGMENT_CORE_VALUE = 'fitsegmentcorevalue';
var FIT_SEGMENT_PRO_VALUE = 'fitsegmentprovalue';

var SPECTRUM_SEGMENT_ID = 'spectrum_segment_id';
var HIGHLIGHTED_SEGMENT_TEMP_ID = 'highlightedSegment_id';

var POINT_RADIUS = 12;

var currentFitMode = FIT_CORE_MODE;
var errorBarSemiHeight;

var PULSE_TIMEOUT = 1000;

async function callCheckIsSpectrumOfTypeSavedOnCloudForContinuumRemovedAsync(filename = null) {
    if (filename == null) {
        let file = getSpectrumInfoById(selectedSpectrumForProcessingId);
        filename = file.Name;
    }

    return checkIsSpectrumOfTypeSavedOnCloudAsync(filename, SPECTRUM_TYPE_CONTINUUM_REMOVED);
}

async function preparePanelForFitPhase1Async() {
    if (!isFitTabSelected) {
        setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_FIT);

        await loadFitFunctionsAsync();
        await loadPXMinPXMaxMaxValueFunctionsAsync();

        /* define callback to be executed when panel is loaded */
        let callback = function () {
            /* show panel containing fit settings */
            showByClass('fitPanel');
            /* load num of points for averaging missing points on x axis */
            loadNumOfPointsForMissingPointsAsync();
        }
        loadPartialViewWithAjaxGetNoModel(UrlLoadFitPanel, 'fitOptionsPanel', callback);

        /* add raw spectrum to the ones to be hidden */
        setSpectrumVisibility(selectedSpectrumForProcessingId, false);

        isFitTabSelected = true;
    }
}

function preparePanelForFitPhase2() {
    if (!isFitTabReady) {
        /* hide message for empty panel */
        let callback = function () {
            hideByClassDFlexItem('charmsTabFitStartingMessageContainer')
        };
        animateCSS('charmsTabFitStartingMessageContainer', 'fadeOut', FAST, callback);

        isFitTabReady = true;
    }
}

function initFit() {
    initFitArrays();
    initFitFunctions();

    isFitTabSelected = false;
    isFitTabReady = false;
    isPointClickForFitEnabled = false;

    /* remove panel with segments */
    $('#fitPanel').remove();

    /* set panels for segments list hideen */
    setPanelForFitCoreHidden();
    setPanelForFitProHidden();

    /* show panel for empty fit panel */
    showByClassDFlexItem('charmsTabFitStartingMessageContainer');

    /* hide fitoptions panel */
    hide('fitoptions');

    /* init the switch for showing/hiding constant lines for fit points */
    loadFitPanelValuesAsync();
}

function initFitArrays() {
    missingPoints = [];
    pointsForFitting = [];
    segmentsForFitting = [];
}

function setIsPointClickForFitEnabled(isEnabled) {
    isPointClickForFitEnabled = isEnabled;
}

/* ################################################################################ */
/* FIT OPTIONS */
/* ################################################################################ */
async function loadFitPanelValuesAsync() {
    /* retrieve setting about core/pro mode */
    initSwitchCoreProModeAsync();

    /* retrieve from cloud setting for enabling auto-save for smoothing settings */
    initSwitchShowHideVerticalLinesForFitPointsAsync();

    /* retrieve from cloud setting for enabling auto-recalculate continuum-removed when changing fit points series */
    initSwitchAutoRecalculateContinuumRemovedOnChangingFitPointsAsync();

    /* retrieve from cloud setting for showing/hiding breaks on valueAxis for continuum-removed */
    initShowHideBreaksOnValueAxisAsync();
}

/* -------------------------------------------------------------------------------- */
/* ---------- CORE/PRO MODE ---------- */
/* -------------------------------------------------------------------------------- */
async function initSwitchCoreProModeAsync() {
    await loadFitCoreProModeAsync();

    $('#fitCheckboxCoreProMode').on('change', function () {
        let isChecked = isCheckboxChecked('fitCheckboxCoreProMode');

        enqueSaveSetting(getQueueItem(FIT_SET_CORE_PRO_MODE, (isChecked ? FIT_PRO_MODE : FIT_CORE_MODE)));

        /* trick to let switch button changing status on UI, without wating for in-memory operations completion  */
        setTimeout(function () {
            currentFitMode = getFitMode(isChecked);

            switch (currentFitMode) {
                case FIT_CORE_MODE:
                    switchToCoreMode();
                    break;

                case FIT_PRO_MODE:
                    switchToProMode();
                    break;
            }
        }, 100);
    });
}

function getFitMode(isChecked) {
    let mode;

    if (!isChecked)
        mode = FIT_CORE_MODE;
    else
        mode = FIT_PRO_MODE;

    return mode;
}

async function loadFitCoreProModeAsync() {
    let obj = await getUserSettingAsync(FIT_SET_CORE_PRO_MODE);
    if (obj.IsOk) {
        currentFitMode = obj.Value;
        /* save retrieved value and show it */
        let isChecked = (obj.Value == FIT_PRO_MODE);
        setSwitchCoreProMode(isChecked);
    } else
        setSwitchCoreProMode(false);
}

function setSwitchCoreProMode(isChecked) {
    $('#fitCheckboxCoreProMode').prop('checked', isChecked);

    currentFitMode = getFitMode(isChecked);
}

/* -------------------------------------------------------------------------------- */
/* ---------- SHOW/HIDE CONSTANT LINES FOR FIT POINTS ---------- */
/* -------------------------------------------------------------------------------- */
function getFitPointsConstantLines(areLabelsVisible = true) {
    let pointsForFittingNum = pointsForFitting.length;
    let constantLines = [];
    for (var i = 0; i < pointsForFittingNum; i++) {
        constantLines.push(
            {
                value: parseInt(pointsForFitting[i].P.X),
                color: red,
                width: 1,
                dashStyle: 'solid',
                label: {
                    visible: areLabelsVisible
                }
            });
    }

    return constantLines;
}

async function initSwitchShowHideVerticalLinesForFitPointsAsync() {
    await loadShowHideVerticalLinesForFitPointsAsync();

    $('#fitChechboxShowLines').on('change', async function () {
        let isChecked = isCheckboxChecked('fitChechboxShowLines');

        enqueSaveSetting(getQueueItem(FIT_SHOW_HIDE_VERTICAL_LINES_FIT_POINTS, (isChecked ? '1' : '0')));

        isShowChartConstantLinesForFitPointsAllowed = isChecked;

        if (isChecked) {
            resetShownConstantLines();
            addOrUpdateConstantLines(getFitPointsConstantLines(), CHART_CONSTANT_LINES_FIT_POINTS);
        } else {
            removeConstantLines(CHART_CONSTANT_LINES_FIT_POINTS);
        }
        updateConstantLines();
    });
}

async function loadShowHideVerticalLinesForFitPointsAsync() {
    let obj = await getUserSettingAsync(FIT_SHOW_HIDE_VERTICAL_LINES_FIT_POINTS);
    if (obj.IsOk) {
        /* save retrieved value and show it */
        let isChecked = (obj.Value == '1');
        setSwitchShowHideVerticalLinesForFitPoints(isChecked);
    } else
        setSwitchShowHideVerticalLinesForFitPoints(false);
}

function setSwitchShowHideVerticalLinesForFitPoints(isChecked) {
    $('#fitChechboxShowLines').prop('checked', isChecked);

    isShowChartConstantLinesForFitPointsAllowed = isChecked;
}

/* -------------------------------------------------------------------------------- */
/* ---------- AUTO RECALCULATE CONTINUUM-REMOVED ON CHANGING FIT POINTS ---------- */
/* -------------------------------------------------------------------------------- */
async function initSwitchAutoRecalculateContinuumRemovedOnChangingFitPointsAsync() {
    await loadAutoRecalculateContinuumRemovedOnChangingFitPointsAsync();

    $('#charmsAutoRecalculateContinuumRemovedOnChangingFitPoints').on('change', async function () {
        let isChecked = isCheckboxChecked('charmsAutoRecalculateContinuumRemovedOnChangingFitPoints');

        enqueSaveSetting(getQueueItem(FIT_AUTO_RECALCULATE_ON_CHANGING_FIT_POINTS, (isChecked ? '1' : '0')));

        isAutoRecalculateContinuumRemovedAllowed = isChecked;
    });
}

async function loadAutoRecalculateContinuumRemovedOnChangingFitPointsAsync() {
    let obj = await getUserSettingAsync(FIT_AUTO_RECALCULATE_ON_CHANGING_FIT_POINTS);
    if (obj.IsOk) {
        /* save retrieved value and show it */
        let isChecked = (obj.Value == '1');
        setAutoRecalculateContinuumRemovedOnChangingFitPoints(isChecked);
    } else
        setAutoRecalculateContinuumRemovedOnChangingFitPoints(false);
}

function setAutoRecalculateContinuumRemovedOnChangingFitPoints(isChecked) {
    $('#charmsAutoRecalculateContinuumRemovedOnChangingFitPoints').prop('checked', isChecked);

    isAutoRecalculateContinuumRemovedAllowed = isChecked;
}

/* -------------------------------------------------------------------------------- */
/* ---------- SHOW/HIDE BREAKS ON VALUE AXIS ---------- */
/* -------------------------------------------------------------------------------- */
async function initShowHideBreaksOnValueAxisAsync() {
    await loadShowHideBreaksOnValueAxisAsync();

    $('#charmsShowHideBreaksOnValueAxis').on('change', async function () {
        let isChecked = isCheckboxChecked('charmsShowHideBreaksOnValueAxis');

        enqueSaveSetting(getQueueItem(FIT_SHOW_HIDE_BREAKS_ON_VALUE_AXIS, (isChecked ? '1' : '0')));

        isShowBreaksOnValueAxisForContinuumRemovedRequested = isChecked;

        let callback;
        if (isChecked)
            callback = function () { fitShowBreaksOnValueAxis(); };
        else
            callback = function () { fitHideBreaksOnValueAxis(); };
        executeAfter(callback, 500);
    });
}

async function loadShowHideBreaksOnValueAxisAsync() {
    let obj = await getUserSettingAsync(FIT_SHOW_HIDE_BREAKS_ON_VALUE_AXIS);
    if (obj.IsOk) {
        /* save retrieved value and show it */
        let isChecked = (obj.Value == '1');

        setShowHideBreaksOnValueAxis(isChecked);
    } else
        setShowHideBreaksOnValueAxis(false);
}

function setShowHideBreaksOnValueAxis(isChecked) {
    $('#charmsShowHideBreaksOnValueAxis').prop('checked', isChecked);

    isShowBreaksOnValueAxisForContinuumRemovedRequested = isChecked;
}

/* ################################################################################ */
/* SWITCH CORE-PRO MODE  */
/* ################################################################################ */
function emptyListOfSegmentsOnCharms(divId, containerDivId) {

    let callback = function () {
        $(`#${divId}`).empty();

        hideByClassDFlexItem(`${containerDivId}`);
    };
    animateCSS(divId, 'fadeOut', FASTER, callback);
}

function switchToCommon() {
    /* show message for 'no segments defined' */
    showByClass('noSegmentsMessageContainer');

    /* disable button for executing continuum-removal */
    setMetroUIButtonEnabled('fitButtonExecute', false);
}

function switchToCoreMode() {
    let items = dxChartGetItems(chartContainer);
    if (items == null || !items.some(obj => Object.keys(obj).includes(buildTempContinuumId())))
        return;

    /* remove continuum-series and fit points */
    tryRemoveSeriesAndPoints(items);

    /* remove list of fit-segments on charms */
    emptyListOfSegmentsOnCharms('fitSegmentsListPro', 'fitSegmentsListContainerPro');

    /* common operations for switch */
    switchToCommon();
}

function switchToProMode() {
    let items = dxChartGetItems(chartContainer);
    if (items == null || !items.some(obj => Object.keys(obj).includes(buildTempContinuumId())))
        return;

    /* remove continuum-series and fit points */
    tryRemoveSeriesAndPoints(items);

    /* remove list of fit-segments on charms */
    emptyListOfSegmentsOnCharms('fitSegmentsListCore', 'fitSegmentsListContainerCore');

    /* common operations for switch */
    switchToCommon();
}

function tryRemoveSeriesAndPoints(items) {
    initFitArrays();

    /* start updating chart */
    dxChartBeginUpdate(chartContainer);

    /* remove continuum */
    tryRemoveContinuumSeriesAndPoints(items);

    /* remove user-defied fit points */
    tryRemoveFitSeriesAndPoints(items);

    /* end updating chart */
    dxChartEndUpdate(chartContainer);

    dxChartRefresh(chartContainer);

    hideSpectraToBeHidden();
}

function tryRemoveContinuumSeriesAndPoints(items) {
    let continuumPoints = items.filter(function (item) { return Object.keys(item).includes(buildTempContinuumId()); });

    if (!continuumPoints || (continuumPoints && continuumPoints.length == 0))
        return;

    let id = buildTempContinuumId();

    /* remove points */
    let continuumPointsNum = continuumPoints.length;
    for (var i = 0; i < continuumPointsNum; i++) {
        let x = continuumPoints[i].X;
        let index = items.findIndex(p => p.X == x);
        if (index < 0)
            continue;

        if (items[index][id])
            delete items[index][id];
    }

    resetShownConstantLines();

    /* remove series */
    removeChartSeriesByFieldIdProcedure(chartContainer, id);
}

function tryRemoveFitSeriesAndPoints(items) {
    let fitPoints = items.filter(function (item) { return Object.keys(item).includes(SERIES_FIT_POINT); });

    if (!fitPoints || (fitPoints && fitPoints.length == 0))
        return;

    /* remove points */
    let fitPointsNum = fitPoints.length;
    for (var i = 0; i < fitPointsNum; i++) {
        let x = fitPoints[i].X;
        let index = items.findIndex(p => p.X == x);
        if (index < 0)
            continue;

        if (items[index][SERIES_FIT_POINT])
            delete items[index][SERIES_FIT_POINT];
    }

    /* remove series */
    removeChartSeriesByFieldIdProcedure(chartContainer, SERIES_FIT_POINT);
}

/* ################################################################################ */
/* LOAD FUNCTIONS FOR FIT  */
/* ################################################################################ */
function getFitFunctionById(id) {
    return fitFunctions.find(x => x.Id == id);
}

function initFitFunctions() {
    fitFunctions = [];
}

async function loadFitFunctionsAsync() {
    let objItems = await doAjaxGetNoModelAsync(UrlGetFitFunctions);
    if (objItems && objItems.length > 0) {
        /* reset array */
        fitFunctions = [];

        /* read functions and store them into array */
        let objItemsNum = objItems.length;
        for (var i = 0; i < objItemsNum; i++) {
            fitFunctions.push(objItems[i]);
        }
    } else
        showSimpleDialog(ERROR_LABEL, FitLoadFitFunctionsErrorMessage, ALERT);
}

async function loadNumOfPointsForMissingPointsAsync() {
    let obj = await getUserSettingAsync(FIT_NUM_OF_POINTS_FOR_MISSING_POINTS);
    if (obj && obj.IsOk) {
        /* save segments  */
        setNumOfPointsForMissingPoints(parseInt(obj.Value));
    } else {
        showSimpleDialog(ERROR_LABEL, FitLoadNumOfPointsForMissingPointsErrorMessage, ALERT);
    }
}

async function loadPXMinPXMaxMaxValueFunctionsAsync() {
    let objItems = await doAjaxGetNoModelAsync(UrlGetPXMinPXMaxMaxValueFunctions);
    if (objItems && objItems.length > 0) {
        /* reset array */
        pXMinPXMaxMaxValueFunctions = [];

        /* read functions and store them into array */
        let objItemsNum = objItems.length;
        for (var i = 0; i < objItemsNum; i++) {
            pXMinPXMaxMaxValueFunctions.push(objItems[i]);
        }
    } else
        showSimpleDialog(ERROR_LABEL, FitLoadPMinPMaxMaxValueFunctionsErrorMessage, ALERT);
}

function onFitNumOfPointsForMissingPointsChange(curr, request, real) {
    if (curr == parseFloat(real))
        return;
    //console.log(`onFitNumOfPointsForMissingPointsChange - curr: ${curr}, request: ${request}, real: ${real}`);
    callEnqueueSaveSetting(timeoutNumOfPointsForMissingPoints, FIT_NUM_OF_POINTS_FOR_MISSING_POINTS, real, JS_DELAY_500);
}

function setNumOfPointsForMissingPoints(value) {
    Metro.getPlugin('#inputNumOfPointsForFit', 'spinner').val(value);
}

/* ################################################################################ */
/* MANAGE VISUALIZATION OF SERIES CONTAINING SELECTED POINTS */
/* ################################################################################ */
function tryAddFitPointsSeries() {
    let isChartSeriesUpdateDone = false;

    if (!isChartSeriesAvailableByName(SERIES_FIT_POINTS)) {
        let fitSeries = {
            valueField: SERIES_FIT_POINT,
            name: SERIES_FIT_POINTS,
            axis: 'valueAxis',
            width: 0,
            point: { visible: true },
            isVisible: true,
            valueErrorBar: {
                lowValueField: MIN_Y,
                highValueField: MAX_Y,
                lineWidth: 1,
                opacity: 0.8,
            },
        };
        addChartSeries(fitSeries);

        dxChartUpdateSeries(chartContainer, chartSeries);
        isChartSeriesUpdateDone = true;
    }

    return isChartSeriesUpdateDone;
}

async function addFitPointToChartAsync(point, isFromUserAction = false) {
    let items = dxChartGetItems(chartContainer);

    if (currentFitMode == FIT_CORE_MODE) {
        setPointOnChart(items, point.P.X, point.P.Y, SERIES_FIT_POINT);
    } else {
        dxChartBeginUpdate(chartContainer);

        let maxPoint;
        if (isFromUserAction)
            maxPoint = await calculateMaximumInPointRangeAsync(point.PXMin.X, point.PXMax.X);
        else
            maxPoint = point.P;
        //let maxPoint = point.PXMax;

        updatePointForFitting(point, maxPoint);

        setPointOnChart(items, maxPoint.X, maxPoint.Y, SERIES_FIT_POINT);

        /* in 'pro' mode, add boundary points together with the selected point */
        addBoundaryPointsPro(items, point);

        dxChartEndUpdate(chartContainer);
        dxChartRefresh(chartContainer);

        hideSpectraToBeHidden();
    }

    if (isShowChartConstantLinesForFitPointsAllowed) {
        resetShownConstantLines();
        addOrUpdateConstantLines(getFitPointsConstantLines(), CHART_CONSTANT_LINES_FIT_POINTS);
        updateConstantLines();
    }
}

function removeFitPointFromChart(point) {
    let items = dxChartGetItems(chartContainer);

    dxChartBeginUpdate(chartContainer);

    let index = items.findIndex(p => p.X == point.X);
    if (items[index][SERIES_FIT_POINT])
        delete items[index][SERIES_FIT_POINT];

    dxChartEndUpdate(chartContainer);

    dxChartRefresh(chartContainer);

    if (isShowChartConstantLinesForFitPointsAllowed) {
        removeConstantLines(CHART_CONSTANT_LINES_FIT_POINTS);
        updateConstantLines();
    }

    hideSpectraToBeHidden();
}

function tryRemoveFitPointsSeries() {
    let index = findChartSeriesIndexByName(SERIES_FIT_POINTS);
    if (index > -1) {
        removeChartSeriesAt(index);
        dxChartUpdateSeries(chartContainer, chartSeries);
    }
}

/* ################################################################################ */
/* MANAGE SELECTED POINTS */
/* ################################################################################ */
/* STARTING METHOD FOR ADDING/REMOVING POINTS */
function addRemoveSelectedPointForFittingProcedure(seriesId, seriesName, point, mousePosX, mousePosY) {
    if (seriesId == buildTempContinuumId())
        return;

    /* adjusted coords for showing pulse animation */
    mousePosX -= 6;
    mousePosY -= 4;

    if (seriesId == SERIES_FIT_POINT)
        removeSelectedPointFromFitting(point, mousePosX, mousePosY);
    else if (isSpectrumOfType(seriesId, SPECTRUM_TYPE_ALIGNED)) {
        insertPulse(mousePosX, mousePosY, 'pulse-ring-add');
        selectedSpectrumTypeForContinuumRemoval = SPECTRUM_TYPE_ALIGNED;
        addSelectedPointForFittingAsync(createPointForFitting(point), true, true);
    }
}

async function addSelectedPointForFittingAsync(point, isFromUserAction = false, isLast = false) {
    if (!isExistantPointForFitting(point)) {
        let callback = async function () {
            /* save point in dedicated array */
            addPointForFitting(point);
            //console.log(`${addSelectedPointForFittingAsync.name} - point: ${point.P.Y}`);
            /* add point to fit series */
            await addFitPointToChartAsync(point, isFromUserAction);

            /* switch to 'FIT OPTIONS' tab and load fitting functions  */
            if (isOnlyOnePointFotFittingAvailable())
                preparePanelForFitPhase1Async();

            await manageNewPointAsync(point, isFromUserAction, isLast);

            /* add series of points for fitting, if not already existant */
            tryAddFitPointsSeries();

            /* mantain hidden all not necessary spectra */
            executeAfter(function () {
                hideSpectraToBeHidden();
                //dxChartResetVisualRange(chartContainer);
            }, 100);
        };

        /* execute callback after pulse animation completed  */
        if (isFromUserAction)
            setTimeout(callback, PULSE_TIMEOUT/ 4);
        else
            callback();
    }
}

function removeSelectedPointFromFitting(point, mousePosX = null, mousePosY = null) {
    /* remove point from dedicated array, return the right X coord of the point for fit */
    let pointForFitting = findPointForFittingByX(point.X);
    if (!pointForFitting)
        return;

    removePointForFitting(point);

    if (mousePosX && mousePosY)
        insertPulse(mousePosX, mousePosY, 'pulse-ring-remove');

    let callback = function () {
        let fixedPoint = createPointForFitting(createSimplePoint(pointForFitting.X, point.Y));

        /* remove point from chart */
        removeFitPointFromChart(fixedPoint);

        /* manage segments after point has been removed */
        manageRemovedPoint(fixedPoint);

        /* if only 1 point remains, remove segment */
        if (isOnlyOnePointFotFittingAvailable()) { }

        /* if no points for fitting exist, then remove series */
        if (isPointsForFittingEmpty())
            tryRemoveFitPointsSeries();

        /* if conditions are satisfied, then auto recalculate continuum-remved */
        tryAutoRecalculateContinuumRemovedAsync();
    };

    /* execute callback after pulse animation completed */
    setTimeout(callback, 1000);
}

/* -------------------------------------------------------------------------------- */
/* PULSE ANIMATION */
/* -------------------------------------------------------------------------------- */
function insertPulse(left, top, className) {
    let html = `<div id="pulseRing" class="${className}"></div>`;

    $('body').append(html);
    $('#pulseRing').css({ position: 'absolute', left: `${left}px`, top: `${top}px` });

    setTimeout(function () { $('#pulseRing').remove(); }, PULSE_TIMEOUT);
}


/* ################################################################################ */
/* MANAGE ADDED/REMOVED POINT */
/* ################################################################################ */
async function manageNewPointAsync(point, isFromUserAction = false, isLast = false) {
    if (isPointForFittingInExistingSegment(point)) {
        /* find index of existing segment to be replaced */
        let index = findExistingSegmentFotFittingIndex(point.P.X);
        if (index == -1)
            return;

        /* remove the existing segment to let create 2 new ones */
        replaceSegmentForFittingAtProcedureAsync(index, point, isFromUserAction, isLast);
    } else {
        /* hide 'empty' message and show list of segments */
        preparePanelForFitPhase2();

        /* no segments added for empty points list and for 1st point */
        if (isPointsForFittingEmpty() || isFirstPointForFittingInList())
            return;

        let minX = getPointsForFittingMinX();
        let maxX = getPointsForFittingMaxX();

        if (point.P.X <= minX) {
            let pointAfter = getPointForFittingAfter(point);
            await addNewSegmentProcedureAsync(point, pointAfter, isFromUserAction, isLast); // add as 1st segment
        } else if (point.P.X >= maxX) {
            let pointBefore = getPointForFittingBefore(point);
            await addNewSegmentProcedureAsync(pointBefore, point, isFromUserAction, isLast); // add as last segment
        }
    }
}

function manageRemovedPoint(point) {
    if (segmentsForFitting.length == 0)
        return;

    let minX = getPointsForFittingMinX();
    let maxX = getPointsForFittingMaxX();

    if (point.X <= minX) {
        /* remove 1st segment on UI */
        removeSegmentForFittingUICore(segmentsForFitting[0]);
        /* remove the 1st segment  */
        removeContinuumSegmentForFittingOnChart(segmentsForFitting[0]);
        /* remove 1st segment from segmentsForFitting */
        removeSegmentForFittingAt(0);
    } else if (point.X >= maxX) {
        /* remove last segment on UI */
        removeSegmentForFittingUICore(segmentsForFitting[segmentsForFitting.length - 1]);
        /* remove the lastst segment  */
        removeContinuumSegmentForFittingOnChart(segmentsForFitting[segmentsForFitting.length - 1]);
        /* remove last segment from segmentsForFitting */
        removeSegmentForFittingAt(segmentsForFitting.length - 1);
    } else {
        let index = segmentsForFitting.findIndex(p => p.P1.X > point.X);
        /* before removing the segment, we need to retrieve the x0 of the previous segment and the
           X1 of the next segment. Then we'll remove 2 segments containing the removed point and
           we'll add a new segment with the retrieved boundaries x0,x1 */
        let p0 = segmentsForFitting[index - 1].P0;
        let p1 = segmentsForFitting[index].P1;
        /* remove n-th segment on UI */
        removeSegmentForFittingUICore(segmentsForFitting[index]);
        /* remove segments containing the selected removed point  */
        let segments0 = removeSegmentForFittingAt(index);
        removeContinuumSegmentForFittingOnChart(segments0[0]);
        /* remove n-th segment on UI */
        removeSegmentForFittingUICore(segmentsForFitting[index - 1]);
        let segments1 = removeSegmentForFittingAt(index - 1);
        removeContinuumSegmentForFittingOnChart(segments1[0]);
        /* add new segment with p0,p1 */
        addNewSegmentProcedureAsync(p0, p1);
    }
}

/* ################################################################################ */
/* MANAGE SEGMENTS DEFINED BY SELECTED POINTS */
/* ################################################################################ */
async function addNewSegmentProcedureAsync(p0, p1, isFromUserAction = false, isLast = false) {
    //console.log(`${addNewSegment.name} - isFromUserAction: ${isFromUserAction}, isLast: ${isLast}`);
    let segment = createSegmentForFitting(p0, p1);
    addSegmentForFitting(segment)

    /* order segments by X0 */
    if (segmentsForFitting.length > 1)
        orderSegmentsForFitting(); // DOPO QUESTO BISOGNA RIORDINARE GLI ELEMENTI SULLA UI!!!!!!!!!!!!!!!!!!ì

    /* add segment-related UI item  */
    let result;
    switch (currentFitMode) {
        case FIT_CORE_MODE:
            result = createSegmentFittingUICore(segment, isFromUserAction, isLast);
            break;

        case FIT_PRO_MODE:
            result = await createSegmentFittingUIProAsync(segment, isFromUserAction, isLast);
            break;
    }

    segmentsForFitting[segment.Index].uiId = result.SegmentId;

    /* update id of list of segments on charms */
    if (segmentsForFitting.length > 1)
        orderSegmentForFittingUIsIds(currentFitMode);

    if (segmentsForFitting.length == 1 && segment.Index == 0) {
        switch (currentFitMode) {
            case FIT_CORE_MODE:
                appendToListCore(result.Html);
                setPanelForFitCoreVisible();
                break;

            case FIT_PRO_MODE:
                appendToListPro(result.Html);
                setPanelForFitProVisible();
                break;
        }
        //animateCSS(segmentId, 'bounceIn', FASTER);
        //return;
    } else {
        /* check whether a segment with lower index exists,
           if exists, then append the ui item after it, otherwise append as 1st item */
        let insertAsFirst = false;
        let previousSegmentIndex = 0;

        let filteredItems = segmentsForFitting.filter(x => x.Index < segment.Index).map(x => { return x.Index });
        if (filteredItems.length == 0)
            insertAsFirst = true;
        else {
            previousSegmentIndex = Math.max(...filteredItems);
            if (previousSegmentIndex == -1)
                insertAsFirst = true;
        }

        
        if (!insertAsFirst)
            $(result.Html).insertAfter(`#${segmentsForFitting[previousSegmentIndex].uiId}`);
        else {
            let firstId = getFirstSegmentId(currentFitMode);
            $(result.Html).insertBefore(`#${firstId}`);
        }

        //animateCSS(segmentId, 'bounceIn', FASTER);
    }

    /* enable button for removing continuum and change title */
    setButtonAlignEnabled('fitButtonExecute', true, FitButtonExecuteLabel);
}

async function replaceSegmentForFittingAtProcedureAsync(index, p, isFromUserAction = false, isLast = false) {
    /* remove n-th segment on UI */
    switch (currentFitMode) {
        case FIT_CORE_MODE:
            removeSegmentForFittingUICore(segmentsForFitting[index]);
            break;

        case FIT_PRO_MODE:
            removeSegmentForFittingUIPro(segmentsForFitting[index]);
            break;
    }
    
    removeSegmentForFittingAt(index);

    let p0 = pointsForFitting[index];
    let p1 = p;
    let p2 = pointsForFitting[index + 2];

    await addNewSegmentProcedureAsync(p0, p1, isFromUserAction, false);
    await addNewSegmentProcedureAsync(p1, p2, isFromUserAction, true);
}

/* MANAGE HIGHLIGHTING/LOWLIGHTING SEGMENT ON UI */
function buildTempHighlightedSegment() {
    return `${HIGHLIGHTED_SEGMENT_TEMP_ID}${selectedSpectrumForProcessingId}`;
}

function getSegmentForFittingBoundaryIndexes(items, segmentId) {
    try {
        let numbers = segmentId.replace(FIT_SEGMENT_CORE, '');
        let segmentIndex = parseInt(numbers.charAt(0));

        let x0Index = items.findIndex(p => p.X == segmentsForFitting[segmentIndex].P0.X);
        let x1Index = items.findIndex(p => p.X == segmentsForFitting[segmentIndex].P1.X);

        return {
            X0Index: x0Index,
            X1Index: x1Index
        };
    } catch (e) {
        console.log(`getSegmentBoundaryIndexes - ex: ${e}`);
        return {
            X0Index: 0,
            X1Index: 0
        };
    }
}

function highlightSegmentForFitting(segmentId) {
    try {
        /* retrieve points of continuum series, in order to find points defining the selected segment */
        let seriesPoints = getSeriesPoints(buildTempContinuumId());
        if (!seriesPoints || seriesPoints.length == 0)
            return;

        let items = dxChartGetItems(chartContainer);

        let segmentBoundaryIndexes = getSegmentForFittingBoundaryIndexes(items, segmentId);
        if (segmentBoundaryIndexes.X0Index == 0 && segmentBoundaryIndexes.X1Index == 0)
            return;

        /* create, customize and add new series for highlighted segment */
        let id = buildTempHighlightedSegment();

        let color = getSpectrumTypeColor(getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM));
        let highlightedSegmentChartSeries = createSeriesFromSpectrumName(id, SERIES_HIGHLIGHTED_SEGMENT, color, true);

        dxChartBeginUpdate(chartContainer);

        addChartSeries(highlightedSegmentChartSeries);

        for (var i = segmentBoundaryIndexes.X0Index; i <= segmentBoundaryIndexes.X1Index; i++) {
            let index = seriesPoints.findIndex(p => p.argument == items[i].X);
            items[i][id] = seriesPoints[index].value;
        }

        dxChartUpdateSeries(chartContainer, chartSeries);

        dxChartEndUpdate(chartContainer);

        /* mantain hidden all not necessary spectra */
        hideSpectraToBeHidden();
        //dxChartRefresh(chartContainer);
    } catch (e) {
        console.log(`highlightSegment - ex: ${e}`);
    }
}

function lowlightSegmentForFitting(segmentId) {
    try {
        let seriesPoints = getSeriesPoints(buildTempContinuumId());
        if (!seriesPoints || seriesPoints.length == 0)
            return;

        let items = dxChartGetItems(chartContainer);

        let segmentBoundaryIndexes = getSegmentForFittingBoundaryIndexes(items, segmentId);
        if (segmentBoundaryIndexes.X0Index == 0 && segmentBoundaryIndexes.X1Index == 0)
            return;

        let id = buildTempHighlightedSegment();

        dxChartBeginUpdate(chartContainer);

        let index = findChartSeriesIndexByValueFieldId(id);
        removeChartSeriesAt(index);
        dxChartUpdateSeries(chartContainer, chartSeries);

        for (var i = segmentBoundaryIndexes.X0Index; i <= segmentBoundaryIndexes.X1Index; i++) {
            delete items[i][id];
        }

        dxChartEndUpdate(chartContainer);
        dxChartResetVisualRange(chartContainer);
    } catch (e) {
        console.log(`lowlightSegment - ex: ${e}`);
    }
}

/* MANAGE ADDING/UPDATING OF SEGMENT ON UI */
async function buildContinuumSegmentAsync(selectedFitFunction, p0, p1) {
    /* retrieve range for current segment to extract the required set of points from aligned model */
    let pointsInRange = extractSpectrumRange(getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval), p0.X, p1.X);

    if (!pointsInRange || pointsInRange.length == 0) {
        showSimpleDialog(ERROR_LABEL, FitNoPointsFoundForSegmentErrorMessage, ALERT);
        return;
    }

    if (isMissingPoint(pointsInRange[0])) {
        pointsInRange[0].Y = getMissingPointByX(pointsInRange[0].X).P.Y;
    }
    if (isMissingPoint(pointsInRange[pointsInRange.length - 1])) {
        pointsInRange[pointsInRange.length - 1].Y = getMissingPointByX(pointsInRange[pointsInRange.length - 1].X).P.Y;
    }

    let processingResult = await window.dotNetHelper.invokeMethodAsync("fitSegmentAsync",
        pointsInRange,
        selectedFitFunction);

    if (processingResult.dialogMessage) {
        //console.log(`buildContinuumSegment - ex: ${processingResult.dialogMessage}`);
        showSimpleDialog(ERROR_LABEL, FitSegmentFittingErrorMessage, ALERT);
        return;
    }

    /* procedure for adding/updating the continuum spectrum */
    let continuumSpectrum = tryAddContinuumSpectrum();

    /* update chart with new aligned spectrum */
    dxChartBeginUpdate(chartContainer);

    /* retrieve current items */
    let items = dxChartGetItems(chartContainer);
    ///* get id of raw spectrum */
    //let rawId = buildId(selectedSpectrumForProcessingId);
    /* loop over items to add aligned point */
    let pointsNum = processingResult.Points.length;
    for (var i = 0; i < pointsNum; i++) {
        let x = processingResult.Points[i].X;
        let index = items.findIndex(p => p.X == x);
        if (index > -1)
            items[index][continuumSpectrum.Id] = processingResult.Points[i].Y;
    }

    /* add (if not already present) the continuum series */
    tryAddContinuumSpectrumSeries(continuumSpectrum);

    /* update chart with new aligned spectrum */
    dxChartEndUpdate(chartContainer);

    dxChartRefresh(chartContainer); // show points and segments
    if (isBuildingUpContinuum)
        dxChartResetVisualRange(chartContainer);

    /* mantain hidden all not necessary spectra */
    hideSpectraToBeHidden();

    /* try to start procedure for removing continuum, if conditions are satisfied */
    await tryCalculateContinuumRemovedAsync();
}

function removeContinuumSegmentForFittingOnChart(segment) {
    let items = dxChartGetItems(chartContainer);

    let index0 = items.findIndex(p => p.X == segment.P0.X);
    let index1 = items.findIndex(p => p.X == segment.P1.X);

    dxChartBeginUpdate(chartContainer);

    let id = buildTempContinuumId();
    for (var i = index0; i <= index1; i++) {
        if (items[i][id])
            delete items[i][id];
    }

    dxChartEndUpdate(chartContainer);
}

function tryAddContinuumSpectrum() {
    if (isSpectrumOfType(buildTempContinuumId(), SPECTRUM_TYPE_CONTINUUM)) {
        return getSpectrumBySpectrumType(SPECTRUM_TYPE_CONTINUUM)
    }

    /* retrieve parent RAW spectrum */
    let rawSpectrum = getSpectrumInfoById(selectedSpectrumForProcessingId);

    let alignedSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);

    /* build spectrum info for being added to 'spectraInfo' */
    let continuumSpectrum = {
        Id: buildTempContinuumId(),
        ParentId: alignedSpectrum.Id,
        Name: rawSpectrum.Name,
        SpectrumLevel: rawSpectrum.SpectrumLevel,
        SpectrumType: SPECTRUM_TYPE_CONTINUUM,
        InsertDateTimeJs: 0
    };
    addSpectrumInfo(continuumSpectrum);

    return continuumSpectrum;
}

function tryAddContinuumSpectrumSeries(continuumSpectrum) {
    /* create chart series for aligned spectrum */
    let spectrumSeriesName = createSeriesNameFromSpectrumNameAndType(continuumSpectrum.Name, continuumSpectrum.SpectrumType);

    /* check whether series is already present or not */
    if (isSeriesAlreadyPresent(spectrumSeriesName))
        return;

    /* add new series */
    let color = getSpectrumTypeColor(getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM));
    let continuumChartSeries = createSeriesFromSpectrumName(continuumSpectrum.Id, spectrumSeriesName, color, true);
    addChartSeries(continuumChartSeries);
}

/* ################################################################################ */
/* REMOVE CONTINUUM */
/* ################################################################################ */
function removeContinuum() {
    isRemovingContinuum = true;

    try {
        let pointsForFittingNum = pointsForFitting.length;
        for (var i = pointsForFittingNum - 1; i >= 0; i--) {
            removeSelectedPointFromFitting(pointsForFitting[i]);
        }

        let id = buildTempContinuumId();

        /* retrieve index of spectrum in spectraInfo */
        let index = getSpectrumIndexById(id)


        let seriesname = getSpectrumSeriesNameFromIndex(index);

        console.log(`removeContinuum - id: ${id}, index: ${index}, seriesname: ${seriesname}`);

        /* remove from spectraInfo */
        if (index >= 0)
            removeSpectrumByIndex(index);

        /* remove continuum spectrum from chart */
        removeSpectrumFromChart(seriesname, id);
    } catch (e) {
        console.log(`${removeContinuum.name} - ex: ${e}`);
    }

    isRemovingContinuum = false;
}

/* ################################################################################ */
/* REMOVE CONTINUUM FROM SPECTRUM */
/* ################################################################################ */
function buildContinuumRemovedSpectrum() {
    try {
        /* retrieve RAW spectrum */
        let rawSpectrum = getSpectrumInfoById(selectedSpectrumForProcessingId);

        /* retrieve info about parent spectrum */
        let alignedSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);

        /* build spectrum info for being added to 'spactraInfo' */
        let continuumRemovedSpectrum = {
            Id: buildTempContinuumRemovedId(),
            ParentId: alignedSpectrum.Id,
            Name: rawSpectrum.Name,
            SpectrumLevel: rawSpectrum.SpectrumLevel,
            SpectrumType: SPECTRUM_TYPE_CONTINUUM_REMOVED,
            InsertDateTimeJs: 0
        };
        addSpectrumInfo(continuumRemovedSpectrum);

        return continuumRemovedSpectrum;
    } catch (e) {
        console.log(`${buildContinuumRemovedSpectrum.name} - ex: ${e}`);
        return null;
    }
}

function buildContinuumRemovedSpectrumCompleted(filename) {
    /* call method for checking whether a version of continuum-removed file is already saved on cloud or not */
    callCheckIsSpectrumOfTypeSavedOnCloudForContinuumRemovedAsync(filename);

    /* enable buttons for saving/removing continuum-removed spectrum */
    setMetroUIButtonEnabled('fitButtonSave', true);
    setMetroUIButtonEnabled('fitButtonRemove', true);

    /* set hidden the checkbox for removing file on cloud (because of the used HTML & css, we need to do it manually, since the 'd-none' class doesn't work) */
    hideElemMetroUIElem('checkboxRemoveContinuumRemovedSpectrumOnCloud');

    /* refresh legend, if opened */
    refreshCharmsLegend();

    if (isShowBreaksOnValueAxisForContinuumRemovedRequested)
        fitShowBreaksOnValueAxis();

    /* mantain hidden all not necessary spectra */
    hideSpectraToBeHidden();

    /* refresh chart */
    executeAfter(dxChartResetVisualRange(chartContainer), 200);

    /* if available, showbuttons for starting band analysis */
    let bandAnalysisButtons = $(`[id$="${BandAnalysisButton}"]`);
    if (bandAnalysisButtons && bandAnalysisButtons.length > 0) {
        $(bandAnalysisButtons).each(function (index, item) {
            showByClassDFlexItem(item.id);
        });
    }
}

async function calculateMissingPointAsync(missingPointPosition) {

    let missingPoint;

    try {
        let spectrum = getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);
        let points = getSpectrumPointsById(spectrum.Id);
        let numOfPointsForMissingPoints = getNumOfPointsForMissingPoints();

        missingPoint = await window.dotNetHelper.invokeMethodAsync("calculateMissingPoint",
            missingPointPosition,
            points,
            numOfPointsForMissingPoints);
        //console.log(`calculateMissingPoint - missingPointPosition: ${missingPointPosition}, missingPoint: (${missingPoint.X},${missingPoint.Y})`);

        let missingPointBoundaries = createPointBoundariesForFitting(missingPoint);

        return {
            PXMin: missingPointBoundaries.MinXPoint,
            P: missingPoint,
            PXMax: missingPointBoundaries.MaxXPoint
        };
    } catch (e) {
        return null;
    }
}

function getNumOfPointsForMissingPoints() {
    return parseInt(Metro.getPlugin('#inputNumOfPointsForFit', 'spinner').val());
}

function setMissingPointsFromDownloadedContinuumRemoved() {
    let continuumPoints = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM);
    //let continuumPoints = getPointsFromSeriesPoints(dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM))));

    /* set missing point 0 */
    trySaveMissingPoint(createPointForFitting(createSimplePoint(continuumPoints[0].X, continuumPoints[0].Y)));

    /* set missing point 1 */
    let continuumPointsNum = continuumPoints.length;

    trySaveMissingPoint(createPointForFitting(createSimplePoint(continuumPoints[continuumPointsNum - 1].X, continuumPoints[continuumPointsNum - 1].Y)));
}

async function startRemoveContinuumProcedureAsync() {
    /* if continuum removed spectrum is already present, doesn't start (check 1) */
    if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED))
        return;

    /* if continuum removed spectrum is already present, doesn't start (check 2) */
    if (isAnySpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED))
        return;

    /* reset array to let re-calculate them */
    resetMissingPoints();

    let missingPointBeginning = await calculateMissingPointAsync(MissingPointPositionBeginning);
    let missingPointEnd = await calculateMissingPointAsync(MissingPointPositionEnd);

    if (missingPointBeginning == null && missingPointEnd == null)
        return;

    setLoadingCircleIsVisible(true);

    /* add 1st segment */
    if (!isPointForFittingInExistingSegment(missingPointBeginning)) {
        missingPointBeginning.Position = MissingPointPositionBeginning;
        trySaveMissingPoint(missingPointBeginning);
        await addSelectedPointForFittingAsync(missingPointBeginning, false);
    }

    /* add last segment */
    if (!isPointForFittingInExistingSegment(missingPointEnd)) {
        missingPointEnd.Position = MissingPointPositionEnd;
        trySaveMissingPoint(missingPointEnd);
        await addSelectedPointForFittingAsync(missingPointEnd, false);
    }
}

async function tryCalculateContinuumRemovedAsync() {
    /* avoid starting procedure when continuum-removed has been downloaded from cloud and app is downloading segments */
    if (isAnySpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED))
        return;

    /* retrieve points of continuum for removing it from aligned */
    let continuumPoints = getSpectrumPointsByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM);
    if (!continuumPoints)
        return;

    /* retrieve points of aligned for calculating continuum-removed spectrum */
    let points = getSpectrumPointsByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    if (!points)
        return;

    let isOk = true;

    let cond1 = (missingPoints.length == 2);
    let cond2 = (continuumPoints.length == points.length);

    if (cond1 && cond2) {
        setLoadingCircleIsVisible(true);

        let processingResult = await window.dotNetHelper.invokeMethodAsync("removeContinuum",
            points,
            continuumPoints);

        if (processingResult.dialogMessage) {
            //console.log(`removeContinuumAsync - ex: ${processingResult.dialogMessage}`);
            showSimpleDialog(ERROR_LABEL, FitContinuumRemovalErrorMessage, ALERT);
            return;
        }

        /* buil continuum-removed spectrum */
        let continuumRemovedSpectrum = buildContinuumRemovedSpectrum();
        if (continuumRemovedSpectrum) {
            /* add continuum-removed spectrum to chart */
            addProcessedSpectrum(continuumRemovedSpectrum, processingResult.Points, SPECTRUM_TYPE_CONTINUUM_REMOVED);

            /* actions needed to update UI after continuum-removed spectrum hs been added */
            buildContinuumRemovedSpectrumCompleted(continuumRemovedSpectrum.Name);

            /* set text of cloud icon */
            setCloudTextAndIconStatus(SPECTRUM_TYPE_CONTINUUM_REMOVED, false);
        }
        else
            isOk = false;

        setLoadingCircleIsVisible(false);
        if (!isOk)
            showSimpleDialog(ERROR_LABEL, ContinuumRemovalExecutionErrorMessage, ALERT);
    }
}

/* -------------------------------------------------------------------------------- */
/* AUTO RECALCULATE CONTINUUM-REMOVED */
/* -------------------------------------------------------------------------------- */
async function tryAutoRecalculateContinuumRemovedAsync() {
    if (isRemovingContinuum)
        return;

    if (!isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED))
        return;

    /* retrieve current visual range */
    let visualRange = dxChartGetVisualRangeY(chartContainer);

    /* retieve and remove the continuum-removed spectrum */
    let continuumRemovedSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    await removeContinuumRemovedSpectrumAsync(continuumRemovedSpectrum, false);

    /* restore previous visual range for a better UX during process */
    dxChartSetVisualRangeY(chartContainer, visualRange);

    /* ensure no saved highlightened band is remaining in memory */
    initLastSelectedSegmentForBand();

    await tryCalculateContinuumRemovedAsync();
}

/* -------------------------------------------------------------------------------- */
/* CHECK FOR SCALE-BREAK WHEN CONTINUUM IS REMOVED */
/* -------------------------------------------------------------------------------- */
function extractSeriesValuesForContinuumRemovedBreaks() {
    let continuumRemovedMin = Number.MIN_VALUE;
    let maxMax = Number.MIN_VALUE;

    try {
        let maxArray = [];

        let spectra = getAllSpectraHavingSameNameByRawId(selectedSpectrumForProcessingId);

        spectra.forEach(function (spectrumInfo) {
            let seriesName = getSeriesNameFromId(spectrumInfo.Id);

            let seriesPoints = dxChartGetSeriesPoints(chartContainer, seriesName);
            let points = getPointsFromSeriesPoints(seriesPoints);

            if (spectrumInfo.SpectrumType == SPECTRUM_TYPE_CONTINUUM_REMOVED) {
                continuumRemovedMin = Math.min(...points.map(p => p.Y));
            } else {
                let max = Math.max(...points.map(p => p.Y));
                maxArray.push(max);
            }
        });

        maxMax = Math.max(...maxArray);
    } catch (e) {
        console.log(`${extractSeriesValuesForBreaks.name} - ex: ${e}`);
    }

    return {
        ContinuumRemovedMin: continuumRemovedMin,
        MaxMax: maxMax
    }
}

function fitHideBreaksOnValueAxis() {
    let visualRangeY = dxChartGetVisualRangeY(chartContainer);

    dxChartUpdateOption(chart, 'valueAxis.breaks', []);
    dxChartRefresh(chartContainer);

    dxChartSetVisualRangeY(chartContainer, visualRangeY);

    hideSpectraToBeHidden();
}

function fitShowBreaksOnValueAxis() {
    let visualRangeY = dxChartGetVisualRangeY(chartContainer);

    let model = extractSeriesValuesForContinuumRemovedBreaks();

    let startValue = parseFloat(parseFloat((model.MaxMax * 1.01).toFixed(2)).toFixed(1));
    let endValue = parseFloat(parseFloat((model.ContinuumRemovedMin / 1.01).toFixed(2)).toFixed(1));
    //console.log(`model.MaxMax: ${model.MaxMax}, startValue: ${startValue}, model.ContinuumRemovedMin: ${model.ContinuumRemovedMin}, endValue: ${endValue}`);

    dxChartUpdateOption(chart, 'valueAxis.tickInterval', 0.1);
    dxChartUpdateOption(chart, 'valueAxis.breaks', [{ startValue: startValue, endValue: endValue }]);
    dxChartRefresh(chartContainer);

    dxChartSetVisualRangeY(chartContainer, visualRangeY);

    hideSpectraToBeHidden();
}

/* -------------------------------------------------------------------------------- */
/* MANAGE MISSING POINTS */
/* -------------------------------------------------------------------------------- */
function getMissingPointByX(x) {
    return missingPoints.find(p => p.P.X == x);
}

function isMissingPoint(point) {
    if (missingPoints.findIndex(p => p.P.X == point.X) > -1)
        return true;
    else
        return false;
}

function resetMissingPoints() {
    if (missingPoints.length == 0)
        return;

    /* remove saved missing points from 'pointsForFitting' array */
    removePointForFitting(missingPoints[0]);
    removePointForFitting(missingPoints[1]);


    /* reset array */
    missingPoints = [];
}

function trySaveMissingPoint(missingPoint) {
    if (missingPoints.findIndex(p => p.P.X == missingPoint.P.X) == -1)
        missingPoints.push(missingPoint);
}

/* ################################################################################ */
/* SAVE CONTINUUM-REMOVED SPECTRUM */
/* ################################################################################ */
function getContinuumRemovedParentFiles(parentId) {
    return {
        ParentFile: getParentFile(parentId),
        RefFile: null,
        RefWhiteFile: null
    };
}

function getContinuumRemovalSettings() {
    return {
        NumOfPointsForAveragingMissingPointX: getNumOfPointsForMissingPoints(),
        Segments: getSegments()
    }
}

function getSegments() {
    let segments = [];

    let segmentsForFittingNum = segmentsForFitting.length;
    for (var i = 0; i < segmentsForFittingNum; i++) {
        let fitFunction = getFitFunctionById(segmentsForFitting[i].SelectedFitFunctionId);

        segments.push({
            Id: 0,
            XStart: segmentsForFitting[i].P0.X,
            XEnd: segmentsForFitting[i].P1.X,
            FitMethodName: fitFunction.MethodName,
            ParameterValue: segmentsForFitting[i].FitFunctionParameterValue
        });
    }

    return segments;
}

async function saveContinuumRemovedSpectrumProcedureAsync() {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    let cond1 = await checkIsSpectrumOfTypeSavedOnCloudAsync(spectrum.Name, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    let cond2 = isSpectrumOfTypeSavedOnCloud(SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (cond1 || cond2)
        askAndExecute(CharmsSpectraProcessingManagementLabel, OverwriteSavedSpectrumQuestion, saveContinuumRemovedSpectrumAsync);
    else
        saveContinuumRemovedSpectrumAsync();
}

async function saveContinuumRemovedSpectrumAsync() {
    let isSavingOk = true;

    try {
        let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED);
        if (!spectrum)
            return;

        setLoadingCircleIsVisible(true);

        /* save aligned for building the parent-child chain */
        if (!isSpectrumOfTypeSavedOnCloud(SPECTRUM_TYPE_ALIGNED))
            await saveAlignedSpectrumAsync(false);

        /* retrieve parent file */
        let alignedSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        if (alignedSpectrum.Id == buildTempAlignedId())
            alignedSpectrum.Id = 0;

        let parentFiles = getContinuumRemovedParentFiles(selectedSpectrumForProcessingId);

        let continuumRemovalSettings = getContinuumRemovalSettings();

        let xml = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeContinuumRemovedModelAsXml",
            spectrum.Name,
            spectrum.SpectrumType,
            getSpectrumPointsById(spectrum.Id),
            continuumRemovalSettings,
            parentFiles);

        let spectrumFile = {
            Id: 0,
            Filename: spectrum.Name,
            ParentId: alignedSpectrum.Id,
            Type: spectrum.SpectrumType,
            Level: spectrum.SpectrumLevel,
            Xml: xml
        };

        /* create model for request */
        let saveSpectrumRequest = {
            SpectrumFile: spectrumFile,
            ContinuumRemovalSettings: continuumRemovalSettings,
            ParentFiles: parentFiles, // defined in charms.js
        };

        /* execute request and process response */
        let obj = await doAjaxPostAsync(UrlSaveSpectrumOfTypeContinuumRemoved, saveSpectrumRequest);
        if (obj) {
            if (obj.IsOk) {
                let index = getSpectrumIndexById(spectrum.Id);

                /* add ParentId property to aligned spectrum */
                spectraInfo[index][PARENT_ID] = alignedSpectrum.Id;

                /* UPDATES */
                /* 1) update spectraInfo id of aligned file with the one coming from DB */
                updateSpectrumInfoId(index, obj.Id);

                /* 2) update id for each segment used for fit */
                setSegmentsId(obj.Segments);

                /* 3) update valueField for chart points by replacing the old fake-id with the real one */
                updateProcessedSpectrumValueField(buildTempContinuumId(), buildId(obj.Id));

                /* 4) update series in chart to ensure correspondance between series and valueField of aligned spectrum */
                updateProcessedSpectrumSeries(buildTempContinuumId(), buildId(obj.Id), obj.Id);

                /* call method for checking whether a version of aligned file is already saved on cloud or not */
                callCheckIsSpectrumOfTypeSavedOnCloudForContinuumRemovedAsync(spectraInfo[index].Name);
            } else
                isSavingOk = false;
        } else
            isSavingOk = false;
    } catch (e) {
        isSavingOk = false;
        console.log(`${saveContinuumRemovedSpectrumAsync.name} - ex: ${e}`);
    }

    setLoadingCircleIsVisible(false);

    if (isSavingOk)
        showSimpleDialog(INFO_LABEL, FitSaveSuccessMessage, SUCCESS);
    else
        showSimpleDialog(ERROR_LABEL, FitSaveErrorMessage, ALERT);
}

function setSegmentsId(segments) {
    if (!segments || segments.length == 0)
        return;

    let segmentsNum = segments.length;
    for (var i = 0; i < segmentsNum; i++) {
        let selSegmentForFitting = segmentsForFitting.find(x => x.P0.X == segments[i].XStart && x.P1.X == segments[i].XEnd);
        if (!selSegmentForFitting)
            continue;

        selSegmentForFitting.Id = segments[i].Id;
    }
}

/* ################################################################################ */
/* REMOVE CONTINUUM REMOVED */
/* ################################################################################ */
function removeContinuumRemovedSpectrumProcedure() {
    /* hide children removal warning message if it has previously been shown */
    switchVisibilityOfChildrenSpectraRemovalMessage('continuumRemovedChildrenRemovalWarning', false);

    /* check whether children removal warning message is to be shown or not  */
    let childSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    if (isAnySpectrumChildById(childSpectrum.Id))
        switchVisibilityOfChildrenSpectraRemovalMessage('continuumRemovedChildrenRemovalWarning', true);

    /* start removal procedure */
    removeFileProcedure(SPECTRUM_TYPE_CONTINUUM_REMOVED, 'checkboxRemoveContinuumRemovedSpectrumOnCloud', 'continuumRemovedDialogRemove');
}

async function removeContinuumRemovedSpectrumAsync(continuumRemovedSpectrum, isRemovalOnCloudRequested = false) {
    /* retrieve index of spectrum in spectraInfo */
    let index = getSpectrumIndexById(continuumRemovedSpectrum.Id);

    let seriesname = getSpectrumSeriesNameFromIndex(index);

    /* remove aligned file from chart */
    removeSpectrumFromChart(seriesname, continuumRemovedSpectrum.Id);

    /* remove aligned file from spectraInfo */
    removeSpectrumByIndex(index);

    /* remove aligned file from cloud, if required  */
    if (isRemovalOnCloudRequested && Number.isInteger(continuumRemovedSpectrum.Id)) {
        await removeSpectrumOnCloudAsync(continuumRemovedSpectrum.Id, ContinuumRemovedRemovalSuccessMessage, ContinuumRemovedRemovalErrorMessage);
    }

    /* if a highlightened band is available, it is removed */
    removeHighlightenedBandProcedure();

    /* disable buttons for saving/removing since aligned spectrum is not present anymore */
    setMetroUIButtonEnabled('fitButtonSave', false);
    setMetroUIButtonEnabled('fitButtonRemove', false);

    /* refresh legend, if opened */
    refreshCharmsLegend();

    /* hide selected spectra for improving visualization */
    hideSpectraToBeHidden();

    /* set text of cloud icon */
    setCloudTextAndIconStatus(continuumRemovedSpectrum.SpectrumType, false);
    callCheckIsSpectrumOfTypeSavedOnCloudForContinuumRemovedAsync(continuumRemovedSpectrum.Name);
}

/* ################################################################################ */
/* RETRIEVE CONTINUUM-REMOVAL SETTINGS */
/* ################################################################################ */
function downloadContinuumRemovedSpectrumProcedure() {
    if (!isFitTabSelected) {
        /* when the 'fit options' tab has NOT been opened by user action... */

        isContinuumRemovedDownloadRequested = true;

        /* load the fit panel */
        preparePanelForFitPhase1Async();
    } else {
        /* when the 'fit options' tab has been opened by user action... */
        downloadProcessedSpectrumAsync(SPECTRUM_TYPE_CONTINUUM_REMOVED);
    }
}

async function downloadContinuumRemovalSettingsAsync(id) {
    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetContinuumRemovalSettings, model);
    if (obj && obj.IsOk) {
        /* set settings for continuum-removal without saving values as settings */
        setNumOfPointsForMissingPoints(parseInt(obj.ResponseObject.NumOfPointsForAveragingMissingPointX));

        if (obj.ResponseObject.Segments.length == 0)
            return;

        /* we need aligned spectrum to get y-coord for points defining segments
           we first look for it locally... */
        let alignedSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        if (!alignedSpectrum) {
            await downloadProcessedSpectrumAsync(SPECTRUM_TYPE_ALIGNED);
            alignedSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        }

        let alignedPoints = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        //let alignedPoints = getPointsFromSeriesPoints(dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(alignedSpectrum)));

        if (!alignedPoints) {
            showSimpleDialog(ERROR_LABEL, FitDownloadContinuumRemovalSettingsErrorMessage, ALERT);
            return;
        }

        async function addPointAsync(x, isFromUserAction = false, isLast = false) {
            let y = getYCoord(x, alignedPoints);

            if (y > 0) {
                await addSelectedPointForFittingAsync(createPointForFitting(createSimplePoint(x, y)), isFromUserAction, isLast);
            }
        }

        /* add points of continuum and build it up */
        let segmentsNum = obj.ResponseObject.Segments.length;
        for (var i = 0; i < segmentsNum; i++) {
            let x = obj.ResponseObject.Segments[i].XStart;
            await addPointAsync(x);
        }
        /* add XEnd from last segment to complete continuum */
        await addPointAsync(obj.ResponseObject.Segments[segmentsNum - 1].XEnd, false, true);
    } else {
        showSimpleDialog(ERROR_LABEL, FitDownloadContinuumRemovalSettingsErrorMessage, ALERT);
    }
}

function getYCoord(x, points) {
    let point = points.find(p => p.X >= x && p.X <= x);
    if (point)
        return point.Y;
    else
        return 0;
}

/* -------------------------------------------------------------------------------- */
/* EVENTS FOR CONTINUUM-REMOVAL */
/* -------------------------------------------------------------------------------- */
var EVENT_SEGMENTS_LOADED_DOWNLOAD_CONTINUUM_REMOVED = "eventSegmentsLoadedDownloadContinuumRemoved";
var EVENT_RECALCULATE_CONTINUUM_REMOVED = "eventRecalculateContinuumRemoved";

const eventSegmentsLoadedDownloadContinuumRemoved = new CustomEvent(EVENT_SEGMENTS_LOADED_DOWNLOAD_CONTINUUM_REMOVED);

window.addEventListener(EVENT_SEGMENTS_LOADED_DOWNLOAD_CONTINUUM_REMOVED, (e) => {
    setLoadingCircleIsVisible(false);

    /* set missing points for allowing auto-retry of calculating continuum-removal */
    setMissingPointsFromDownloadedContinuumRemoved();

    /* condition for allowing auto-retry of calculating continuum-removal */
    isBuildingUpContinuum = false;
});


function setPanelForFitCoreHidden() {
    /* hide container of segments */
    hideByClassDFlexItem('fitSegmentsListContainerCore');

    /* show message for no-segments-available */
    showByClass('noSegmentsMessageContainer');
}

function setPanelForFitCoreVisible() {
    /* hide message for no-segments-available */
    let callback1 = function () {
        if (isVisibleByClass('noSegmentsMessageContainer'))
            hideByClass('noSegmentsMessageContainer');
    };
    animateCSS('noSegmentsMessageContainer', 'fadeOut', FAST, callback1);

    /* show container of segments */
    showByClassDFlexItem('fitSegmentsListContainerCore');
    animateCSS('fitSegmentsListContainerCore', 'fadeIn', FAST);
}

function appendToListCore(html) {
    $('#fitSegmentsListCore').append(html);
}

function createSegmentFittingUICore(segment, isFromUserAction = false, isLast = false) {
    let rangeLabel = FitRangeLabel
        .replace('rv_1', segment.P0.P.X)
        .replace('rv_2', segment.P1.P.X);

    let segmentId = `${FIT_SEGMENT_CORE}${segment.Index}`;
    let html = ``;
    html += `<div id="${segmentId}" class="d-flex flex-column padding-bottom-8 margin-top-16 border-bottom">`;
    html += `    <div><span id="${segmentId}RangeLabel">${rangeLabel}</span></div>`;
    html += `    <div class="d-flex flex-row">`;
    /*              rectangle for highlighting segment */
    //html += `       <div class="select-segment-rectangle pointer" onmouseover="${highlightSegmentForFitting.name}('${segmentId}')" onmouseout="${lowlightSegmentForFitting.name}('${segmentId}')">`;
    html += `       <div class="select-segment-rectangle pointer">`;
    html += `       </div>`;
    /*               column for functions */
    html += `        <div class="d-flex flex-column margin-top-8" style="width: 50%">`;
    html += `           <label>${FitSegmentFunctionsLabel}</label>`;
    html += `           <select id="${FIT_SEGMENT_CORE}${segment.Index}Select" data-role="select" data-on-item-select="${onSegmentFunctionSelectCoreAsync.name}">`;
    let fitFunctionsNum = fitFunctions.length;
    for (var i = 0; i < fitFunctionsNum; i++) {
        html += `<option value="${FIT_SEGMENT_CORE}${segment.Index}${fitFunctions[i].Id}">${fitFunctions[i].Name}</option>`;
    }
    html += `           </select>`;
    html += `        </div>`;
    /*               column for function parameter */
    html += `        <div id="${FIT_SEGMENT_CORE_VALUE}${segment.Index}Container" class="d-flex flex-column margin-left-8 margin-top-8" style="width: 50%">`;
    html += `        </div>`;
    html += `    </div>`;
    html += `</div>`;

    $(`#${segmentId}`).ready(async function () {
        let parent = $(`#${segmentId}Select`).parent();
        $(parent).css({ 'margin-top': '8px' });

        await onSegmentFunctionSelectCoreAsync(Metro.getPlugin(`#${segmentId}Select`, 'select').val());
        //console.log(`${createSegmentFittingUICore.name} - ready - isBuildingUpContinuum: ${isBuildingUpContinuum}, isFromUserAction: ${isFromUserAction}, isLast: ${isLast}`);
        if (isFromUserAction) {
            /* if conditions are satisfied, then auto recalculate continuum-remved */
            if (isLast && !isBuildingUpContinuum)
                await tryAutoRecalculateContinuumRemovedAsync();
        } else {
            if (isLast)
                window.dispatchEvent(eventSegmentsLoadedDownloadContinuumRemoved); // raise event to complete continuum building-up
        }
    });

    return {
        SegmentId: segmentId,
        Html: html
    };
}

async function onSegmentFunctionSelectCoreAsync(val, option, item) {
    //console.log(`onSegmentFunctionSelectAsync ${val}`);

    let segmentIndex;
    if (this.id)
        segmentIndex = parseInt(this.id.replace(FIT_SEGMENT_CORE, '').replace('Select', ''));
    else
        segmentIndex = parseInt(val.replace(FIT_SEGMENT_CORE, '').split('')[0]);

    /* retrieve info about segment and function */
    let functionIndex = getFunctionIndexFromValue(val, FIT_SEGMENT_CORE);

    /* clear the div */
    $(`#${FIT_SEGMENT_CORE_VALUE}${segmentIndex}Container`).empty();

    /* retrieve the selected fit function */
    let selectedFitFunction = fitFunctions[functionIndex];
    if (!selectedFitFunction)
        return;

    /* save selected fit function for segment */
    segmentsForFitting[segmentIndex].SelectedFitFunctionId = selectedFitFunction.Id;
    /* set default parameter value */
    let fitFunction = getFitFunctionById(segmentsForFitting[segmentIndex].SelectedFitFunctionId);
    if (fitFunction.ParameterConstraintValue)
        segmentsForFitting[segmentIndex].FitFunctionParameterValue = fitFunction.ParameterConstraintValue.Value;
    else
        segmentsForFitting[segmentIndex].FitFunctionParameterValue = 0;

    /* retrieve parameter, if existant, and build the spinner for parameter value */
    let parameter = selectedFitFunction.ParameterConstraintValue;
    if (parameter) {

        setParameterSpinner(`${FIT_SEGMENT_CORE_VALUE}${segmentIndex}`, parameter, segmentIndex, onFitMethodFunctionParameterChange.name);

    }

    /* add/update continuum segment */
    await buildContinuumSegmentAsync(selectedFitFunction, segmentsForFitting[segmentIndex].P0.P, segmentsForFitting[segmentIndex].P1.P);
}

function removeSegmentForFittingUICore(segment) {
    let segmentId = `${FIT_SEGMENT_CORE}${segment.Index}`;

    $(`#${segmentId}`).remove();

    //let callback = function () { $(`#${segmentId}`).remove(); };
    //animateCSS(segmentId, 'slideOutRight', FASTER, callback);
}


var P0 = 'P0';
var P1 = 'P1';
var PXMin = 'PXMin';
var PXMax = 'PXMax';
var Appendix = 'Appendix';
var BandAnalysisButton = 'BandAnalysisButton';
var Button = 'Button';

var currentP0P1Selection;
var currentAppendixSelectId;
var appendixChartContainer;

var isAppendixAlreadyAvailable = false;
var isAppendixPinned = false;

var appendixTimeout;

var SERIES_PXMIN_PXMAX_MAX_VALUE = 'PXMinPXMaxMaxValueSeries';
var SERIES_PXMIN_PXMAX_MAX_VALUE_POINT = 'PXMinPXMaxMaxValueSeriesPoint';

var SERIES_PXMIN_PXMAX_FIT = 'PXMinPXMaxFitSeries';
var SERIES_PXMIN_PXMAX_FIT_POINT = 'PXMinPXMaxFitSeriesPoint';


var pXMinPXMaxSeries = [];

function appendToListPro(html) {
    $('#fitSegmentsListPro').append(html);
}

async function calculateMaxValuePointAsync(points, pointForFitting, pMinPMaxMaxValueFunctionId) {
    let pMinPMaxMaxValueFunction = pXMinPXMaxMaxValueFunctions.find(x => x.Id == pMinPMaxMaxValueFunctionId);

    let range = extractSpectrumRange(points, pointForFitting.PXMin.X, pointForFitting.PXMax.X);

    let xs = range.map(p => { return p.X });
    let ys = range.map(p => { return p.Y });

    return await window.dotNetHelper.invokeMethodAsync("getPMinPMaxMaxValueAsync",
        xs,
        ys,
        pMinPMaxMaxValueFunction);
}

async function createSegmentFittingUIProAsync(segment, isFromUserAction = false, isLast = false) {
    let segmentId = `${FIT_SEGMENT_PRO}${segment.Index}`;

    let points = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);

    /* find spectrum boundaries for setting the 'boundary' label to the first and last segments */
    let xmin;
    let xmax;
    if (!isFromUserAction) {
        xmin = extractSpectrumXMin(points);
        xmax = extractSpectrumXMax(points);
    }

    let html = ``;

    /* segment info */
    html += `<div id="${segmentId}" class="d-flex flex-row margin-bottom-8 border-bottom">`;

    html += `<div class="d-flex flex-column">`;

    /* top spinners */
    html += `<div class="d-flex flex-row">`;
    if (isFromUserAction)
        html += `   <div id="${segmentId}${P0}${Button}" style="width: 20px; height: 30px;" class="margin-vertical-4 margin-horizontal-4"><span id="${segmentId}${P0}${Button}Icon" title="${BandAnalysisIconPXMinXMaxFitTitle}" class="mif-chevron-thin-left mif-2x fg-red pointer"></span></div>`;
    else
        html += `   <div class="margin-vertical-4 margin-horizontal-4" style="width: 20px; height: 30px"></div>`;
    html += `   <div class="d-flex flex-justify-between">`;
    let idP0PMin = `${segmentId}${P0}${PXMin}`;
    html += `   <input id="${idP0PMin}" `;
    html += `   data-cls-spinner="width-130" `;
    html += `   data-default-value="${segment.P0.PXMin.X}" `;
    let p0PMax = (segment.P0.P.X - 1);
    if (!isFromUserAction)
        p0PMax = segment.P0.P.X;
    html += `   data-max-value="${p0PMax}" `; // only max-value for left boundary
    html += `   data-step="${1}" `;
    //html += `   data-fixed="4" `;
    html += `   data-on-plus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-minus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-change="${onBoundaryValueChangeByEnter.name}" `;
    html += `   data-repeat-threshold="1000" `;
    html += `   type="text" data-role="spinner" data-buttons-position="right">`;

    html += `   <div class="margin-horizontal-8" style="width: 80px;">`;
    let topPMinPMaxResult;
    if (isFromUserAction) {
        /* find the maximum in the segments defined by the points boundaries */
        topPMinPMaxResult = await calculateMaxValuePointAsync(points, segment.P0, segment.P0.SelectedPXMinPXMaxFitFunctionId);
        /* save the max-y-val point as P for P0 */
        if (topPMinPMaxResult)
            segment.P0.P = topPMinPMaxResult.maxValuePoint;
    }
    let topSpinnerTextElem;
    if (topPMinPMaxResult)
        topSpinnerTextElem = `<p class="text-secondary">${FitProModeCenterLabel}<span id="${segmentId}${P0}Text" class="margin-left-4 text-secondary">${(topPMinPMaxResult.maxValuePoint.X)}</span></p>`;
    else
        topSpinnerTextElem = `<p class="text-secondary">${FitBoundaryLabel}</p>`;
    html += topSpinnerTextElem;
    html += `   </div>`;

    let idP0PMax = `${segmentId}${P0}${PXMax}`;
    html += `   <input id="${idP0PMax}" `;
    html += `   data-cls-spinner="width-130" `;
    html += `   data-default-value="${segment.P0.PXMax.X}" `;
    html += `   data-min-value="${(segment.P0.P.X + 1)}" `; // only min-value for right boundary
    html += `   data-step="${1}" `;
    //html += `   data-fixed="4" `;
    html += `   data-on-plus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-minus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-change="${onBoundaryValueChangeByEnter.name}" `;
    html += `   data-repeat-threshold="1000" `;
    html += `   type="text" data-role="spinner" data-buttons-position="right">`;
    html += `   </div>`;
    html += `</div>`;

    /* segment fit functions selector */
    html += `<div class="d-flex flex-justify-center">`;
    html += `   <div class="d-flex flex-column padding-vertical-4">`;
    html += `      <label>${FitSegmentFunctionsLabel}</label>`;
    html += `      <select id="${FIT_SEGMENT_PRO}${segment.Index}Select" data-role="select" data-on-item-select="${onSegmentFunctionSelectProAsync.name}">`;
    let fitFunctionsNum = fitFunctions.length;
    for (var i = 0; i < fitFunctionsNum; i++) {
        html += `<option value="${FIT_SEGMENT_PRO}${segment.Index}${fitFunctions[i].Id}">${fitFunctions[i].Name}</option>`;
    }
    html += `      </select>`;
    html += `   </div>`;
    /*          column for function parameter */
    html += `   <div id="${FIT_SEGMENT_PRO_VALUE}${segment.Index}Container" class="d-flex flex-column margin-left-8 padding-vertical-4">`;
    html += `   </div>`;
    html += `</div>`;

    /* bottom spinners */
    html += `<div class="d-flex flex-row margin-bottom-4">`;
    if (isFromUserAction)
        html += `   <div id="${segmentId}${P1}${Button}" class="margin-horizontal-4" style="width: 20px; height: 30px;"><span id="${segmentId}${P1}${Button}Icon" title="${BandAnalysisIconPXMinXMaxFitTitle}" class="mif-chevron-thin-left mif-2x fg-red pointer"></span></div>`;
    else
        html += `   <div class="margin-horizontal-4" style="width: 20px; height: 30px"></div>`;
    html += `   <div class="d-flex flex-justify-between">`;
    let idP1PMin = `${segmentId}${P1}${PXMin}`;
    html += `   <input id="${idP1PMin}" `;
    html += `   data-cls-spinner="width-130" `;
    html += `   data-default-value="${segment.P1.PXMin.X}" `;
    html += `   data-max-value="${(segment.P1.P.X - 1)}" `; // only max-value for left boundary
    html += `   data-step="${1}" `;
    //html += `   data-fixed="4" `;
    html += `   data-on-plus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-minus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-change="${onBoundaryValueChangeByEnter.name}" `;
    html += `   data-repeat-threshold="1000" `;
    html += `   type="text" data-role="spinner" data-buttons-position="right">`;

    let p1PMax = (segment.P1.P.X + 1);
    if (!isFromUserAction)
        p1PMax = segment.P1.P.X;

    html += `   <div class="margin-horizontal-8" style="width: 80px;">`;
    let bottomPMinPMaxResult;
    if (isFromUserAction) {
        /* find the maximum in the segments defined by the points boundaries */
        bottomPMinPMaxResult = await calculateMaxValuePointAsync(points, segment.P1, segment.P0.SelectedPXMinPXMaxFitFunctionId);
        /* save the max-y-val point as P for P1 */
        if (bottomPMinPMaxResult)
            segment.P1.P = bottomPMinPMaxResult.maxValuePoint;
    }
    let bottomSpinnerTextElem;
    if (bottomPMinPMaxResult)
        bottomSpinnerTextElem = `<p class="text-secondary">${FitProModeCenterLabel}<span id="${segmentId}${P1}Text" class="margin-left-4 text-secondary">${(bottomPMinPMaxResult.maxValuePoint.X)}</span></p>`;
    else
        bottomSpinnerTextElem = `<p class="text-secondary">${FitBoundaryLabel}</p>`;
    html += bottomSpinnerTextElem;
    html += `   </div>`;

    let idP1PMax = `${segmentId}${P1}${PXMax}`;
    html += `   <input id="${idP1PMax}" `;
    html += `   data-cls-spinner="width-130" `;
    html += `   data-default-value="${segment.P1.PXMax.X}" `;
    html += `   data-min-value="${p1PMax}" `; // only min-value for right boundary
    html += `   data-step="${1}" `;
    //html += `   data-fixed="4" `;
    html += `   data-on-plus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-minus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-change="${onBoundaryValueChangeByEnter.name}" `;
    html += `   data-repeat-threshold="1000" `;
    html += `   type="text" data-role="spinner" data-buttons-position="right">`;
    html += `   </div>`;
    html += `</div>`;

    html += `</div>`;

    /* button for starting band analysis */
    if (topPMinPMaxResult) {
        html += `<div id="${segmentId}BandAnalysisButton" class="flex-align-center d-none">`;
        html += `<button class="button light cycle small outline pointer" onclick="${startBandAnalysisProcedureAsync.name}(${segment.P0.P.X}, ${segment.P1.P.X})" title=""><span class="mif-calculator2"></span></button>`;
        html += `</div>`;
    }

    html += `</div>`;

    $(`#${idP0PMin}`).ready(function () {
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP0PMin}`, 'spinner').toDefault();
    });

    $(`#${idP0PMax}`).ready(function () {
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP0PMax}`, 'spinner').toDefault();
    });

    $(`#${idP1PMin}`).ready(function () {
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP1PMin}`, 'spinner').toDefault();
    });

    $(`#${idP1PMax}`).ready(function () {
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP1PMax}`, 'spinner').toDefault();
    });

    /* show panels for changing method for finding Max in selected segment */
    let buttonP0Id = `${segmentId}${P0}${Button}`;
    $(`#${buttonP0Id}`).ready(function () {
        $(`#${buttonP0Id}`).on('click', function () {
            if (!isAppendixAlreadyAvailable) {
                showPXMinPXMaxFitting(P0, `${buttonP0Id}`, segment.Index, segment.P0);

                setIconForPXMinXMaxFit(`${buttonP0Id}Icon`, false);

                setIconParentDivForPXMinPXMaxFit(buttonP0Id, true);
            } else {
                hidePXMinPXMaxFitting(`${buttonP0Id}${Appendix}`);

                setIconForPXMinXMaxFit(`${buttonP0Id}Icon`, true);

                setIconParentDivForPXMinPXMaxFit(buttonP0Id, false);
            }
        });
    });

    /* show panels for changing method for finding Max in selected segment */
    let buttonP1Id = `${segmentId}${P1}${Button}`;
    $(`#${buttonP1Id}`).ready(function () {
        $(`#${buttonP1Id}`).on('click', function () {
            if (!isAppendixAlreadyAvailable) {
                showPXMinPXMaxFitting(P1, `${buttonP1Id}`, segment.Index, segment.P1);

                setIconForPXMinXMaxFit(`${buttonP1Id}Icon`, false);

                setIconParentDivForPXMinPXMaxFit(buttonP1Id, true);

            } else {
                hidePXMinPXMaxFitting(`${buttonP1Id}${Appendix}`);

                setIconForPXMinXMaxFit(`${buttonP1Id}Icon`, true);

                setIconParentDivForPXMinPXMaxFit(buttonP1Id, false);
            }

        });
    });

    $(`#${segmentId}`).ready(async function () {
        await onSegmentFunctionSelectProAsync(Metro.getPlugin(`#${segmentId}Select`, 'select').val());
        //console.log(`createSegmentUI - ready - isBuildingUpContinuum: ${isBuildingUpContinuum}, isFromUserAction: ${isFromUserAction}, isLast: ${isLast}`);
        if (isFromUserAction) {
            /* if conditions are satisfied, then auto recalculate continuum-remved */
            if (isLast && !isBuildingUpContinuum)
                await tryAutoRecalculateContinuumRemovedAsync();
        } else {
            if (isLast)
                window.dispatchEvent(eventSegmentsLoadedDownloadContinuumRemoved); // raise event to complete continuum building-up
        }
    });

    return {
        SegmentId: segmentId,
        Html: html
    };
}

function onBoundaryValueChangeByButtonPro(curr, request, real) {
    //console.log(`${onBoundaryValueChangeByButtonPro.name} - id: ${this.id}, curr: ${curr}, request: ${request}, real: ${real}`);

    let spinnerId = $(this).closest('div').prevObject[0].id;

    onBoundaryValueChangedProcedureAsync(this.id, spinnerId, parseInt(curr), parseInt(request));
}

function onBoundaryValueChangeByEnter(curr, request) {
    if (!Number.isInteger(parseInt(request))) // trick to avoid firing event when UI element is created
        return;

    //console.log(`${onBoundaryValueChangeByEnter.name} - id: ${this.id}, curr: ${curr}, request: ${request}`);

    let spinnerId = $(this).closest('div').prevObject[0].id;

    onBoundaryValueChangedProcedureAsync(this.id, spinnerId, parseInt(curr), parseInt(request));
}

async function onBoundaryValueChangedProcedureAsync(id, spinnerId, curr, requestedX) {
    setLoadingCircleIsVisible(true);

    let pointForFitting;

    if (id.includes(PXMin))
        pointForFitting = findPointForFittingByPMinX(curr);
    else if (id.includes(PXMax))
        pointForFitting = findPointForFittingByPMaxX(curr);

    if (!pointForFitting)
        return;

    let PMinMax = PXMin;

    if (id.includes(P1))
        PIndex = P1;

    if (id.includes(PXMax))
        PMinMax = PXMax;

    /* update boundary point on chart */
    await updateBoundaryPointProAsync(pointForFitting, requestedX, PMinMax, spinnerId);

    setLoadingCircleIsVisible(false);
}

async function onSegmentFunctionSelectProAsync(val, option, item) {
    let result = onSegmentFunctionSelectBase(this.id, val, FIT_SEGMENT_PRO, FIT_SEGMENT_PRO_VALUE);

    /* add/update continuum segment */
    await buildContinuumSegmentAsync(result.SelectedFitFunction, segmentsForFitting[result.SegmentIndex].P0.P, segmentsForFitting[result.SegmentIndex].P1.P);
}

function removeSegmentForFittingUIPro(segment) {
    let segmentId = `${FIT_SEGMENT_PRO}${segment.Index}`;

    $(`#${segmentId}`).remove();

    //let callback = function () { $(`#${segmentId}`).remove(); };
    //animateCSS(segmentId, 'slideOutRight', FASTER, callback);
}

function setIconForPXMinXMaxFit(id, isIconForShowRequired) {
    if (!isIconForShowRequired)
        $(`#${id}`).removeClass('mif-chevron-thin-left').addClass('mif-chevron-thin-right');
    else
        $(`#${id}`).removeClass('mif-chevron-thin-right').addClass('mif-chevron-thin-left');
}

function setIconParentDivForPXMinPXMaxFit(id, isSelected) {
    if (isSelected)
        $(`#${id}`).parent().addClass('selected-point');
    else
        $(`#${id}`).parent().removeClass('selected-point');
}

function setPanelForFitProHidden() {
    /* hide container of segments */
    hideByClassDFlexItem('fitSegmentsListContainerPro');

    /* show message for no-segments-available */
    showByClass('noSegmentsMessageContainer');
}

function setPanelForFitProVisible() {
    /* hide message for no-segments-available */
    let callback1 = function () {
        if (isVisibleByClass('noSegmentsMessageContainer'))
            hideByClass('noSegmentsMessageContainer');
    };
    animateCSS('noSegmentsMessageContainer', 'fadeOut', FAST, callback1);

    /* show container of segments */
    showByClassDFlexItem('fitSegmentsListContainerPro');
    animateCSS('fitSegmentsListContainerPro', 'fadeIn', FAST);
}

/* ################################################################################ */
/* MANAGE FIT OF PXMin-PXMax segment */
/* ################################################################################ */
function showPXMinPXMaxFitting(P0P1Val, parentId, segmentIndex, P) {
    if (isAppendixAlreadyAvailable)
        return;

    currentP0P1Selection = P;

    let id = `${parentId}${Appendix}`;

    /* if item exists, then do nothing */
    if ($(`#${id}`).length > 0)
        return;

    /* calculate position of new panel */
    let divW = 400;
    let divH = 560;

    let parentRect = document.getElementById('fitSegmentsListContainerPro').getBoundingClientRect();

    let mainContainerRect = document.getElementById('mainContainer').getBoundingClientRect();
    let charmsRect = document.getElementById('charms').getBoundingClientRect();
    let appbarRect = document.getElementById('appbar').getBoundingClientRect();
    //console.log(parentRect);

    let left = mainContainerRect.width - (charmsRect.width + divW + 52);
    let top = parentRect.top - appbarRect.height;

    /* retrieve series points */
    let seriesPoints = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);
    //console.log(seriesPoints);

    let segmentSeriesPoints = seriesPoints.filter(p => p.X >= P.PXMin.X && p.X <= P.PXMax.X);
    //console.log(segmentSeriesPoints);

    let spectrumInfo = getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);

    let newSeriesPoints = [];
    let segmentSeriesPointsNum = segmentSeriesPoints.length;
    for (var i = 0; i < segmentSeriesPointsNum; i++) {
        newSeriesPoints[i] = { X: segmentSeriesPoints[i].X };
        newSeriesPoints[i][`id${spectrumInfo.Id}`] = segmentSeriesPoints[i].Y;
    }

    /* build panel */
    let html = '';

    html += `<div id="${id}" style="position: absolute; width: ${divW}px; height: ${divH}px; background: rgba(0, 0, 0, 0.8) !important; top: ${top}px; left: ${left}px"> `
    //html += `onmouseover="${clearHidePXMinPXMaxFitting.name}()" onmouseout="${hidePXMinPXMaxFitting.name}('${id}')">`;

    /* boundaries */
    html += `<div class="d-flex flex-justify-center">`;
    html += `<div>&nbsp;</div>`;
    html += `<div><span class="fg-white">${BandAnalysisSegmentXBoundariesLabel} [${P.PXMin.X},${P.PXMax.X}]</span></div>`;
    //html += `<div class="margin-horizontal-4 margin-vertical-4"><img id="pinStatusImg" src="/images/search/unpinned.png" onclick="${changePinStatus.name}()" width="24" height="24"></div>`;
    html += `</div>`;
    /* max value x coord */
    html += ``;
    let text = `<p class="fg-white">${FitProModeCenterLabel}<span id="yMaxValueXCoord" class="margin-left-4 text-secondary fg-white">${(P.P.X)}</span></p>`;
    html += `<div class="d-flex flex-justify-center">${text}</div>`;
    /* fit method */
    html += `        <div class="d-flex flex-column margin-vertical-8 margin-horizontal-8">`;
    html += `           <label class="fg-white">${FitSegmentFunctionsLabel}</label>`;
    currentAppendixSelectId = `${FIT_SEGMENT_PRO}${segmentIndex}Select${P0P1Val}`; // save value to be used in chart-onDrawn event
    html += `           <select id="${currentAppendixSelectId}" data-role="select" data-on-item-select="${onPXMinPXMaxFitFunctionSelectProAsync.name}">`;

    let selectedpXMinPXMaxMaxValueFunctionId = segmentsForFitting[segmentIndex].P0.SelectedPXMinPXMaxFitFunctionId;
    if (P0P1Val == P1)
        selectedpXMinPXMaxMaxValueFunctionId = segmentsForFitting[segmentIndex].P1.SelectedPXMinPXMaxFitFunctionId;

    let pMinPMaxMaxValueFunctionsNum = pXMinPXMaxMaxValueFunctions.length;
    for (var i = 0; i < pMinPMaxMaxValueFunctionsNum; i++) {
        let selected = '';
        if (pXMinPXMaxMaxValueFunctions[i].Id == selectedpXMinPXMaxMaxValueFunctionId)
            selected = 'selected';
        html += `<option value="${FIT_SEGMENT_PRO}${segmentIndex}${pXMinPXMaxMaxValueFunctions[i].Id}${P0P1Val}" ${selected}>${pXMinPXMaxMaxValueFunctions[i].Name}</option>`;
    }
    html += `           </select>`;
    html += `        </div>`;
    /* chart */
    let chartId = `${id}Chart`;
    html += `<div id="${chartId}" class="margin-horizontal-8" style="width: 100%"></div>`;

    html += `</div>`;

    $('#renderbody').append(html);
    animateCSS(id, 'fadeInRight', FASTER);

    $(`#${id}`).ready(function () {
        appendixChartContainer = $(`#${chartId}`);
        pXMinPXMaxSeries = createSeriesFromPoint(newSeriesPoints[0]);
        showPXMinPXMaxFittingChart(newSeriesPoints, pXMinPXMaxSeries);

        isAppendixAlreadyAvailable = true;

        /* after a time-interval, build the selected fit for the current xPmin-xPMax interval */
        setTimeout(function () {
            /* add point showing the position of 'max' value in current interval */
            let selectedValue = ($(`#${currentAppendixSelectId}`).find(':selected')[0]).value;
            //console.log(selectedValue);
            pXMinPXMaxFitFunctionSelectProManagementAsync(selectedValue);
        }, 500);
    });
}

function showPXMinPXMaxFittingChart(dataSource, series) {
    let chart = appendixChartContainer.dxChart({
        /* data */
        rotated: isMobile(),
        dataSource: dataSource,
        animation: {
            enabled: false,
        },
        commonSeriesSettings: {
            argumentField: "X",
            type: "line",
            point: { visible: true, size: 6 },
        },
        argumentAxis: {
            name: 'argumentAxis',
            argumentType: 'numeric',
            type: 'continuous',
            title: {
                text: ChartWavelengthsLabel,
                font: {
                    color: 'white'
                }
            },
            valueMarginsEnabled: true,
            tickInterval: 10,
            minorTickInterval: 5,
            label: {
                displayMode: "rotate",
                rotationAngle: 45,
                format: "decimal",
                font: {
                    color: 'white'
                }
            }
        },
        valueAxis: {
            name: 'valueAxis',
            type: 'continuous',
            showZero: false,
            visible: true,
            title: {
                text: ChartReflectanceLabel,
                font: {
                    color: 'white'
                }
            },
            label: {
                font: {
                    color: 'white'
                }
            },
            font: {
                color: 'white'
            }
        },
        series: series,
        /* visualization options */
        scrollBar: {
            visible: false
        },
        size: {
            height: 400,
            width: 380
        },
        commonAxisSettings: {
            color: 'white',
            grid: {
                visible: true,
                color: 'white'
            },
            minorGrid: {
                visible: false,
                color: 'white',
            },
        },
        crosshair: {
            enabled: true
        },
        legend: {
            visible: false
        },
        /* interactivity options */
        tooltip: {
            enabled: true,
            customizeTooltip: function (arg) {
                return {
                    html: getTooltip(arg.seriesName, arg.argumentText, arg.valueText)
                };
            },
            opacity: 1,
        },
        /* export options */
        export: {
            enabled: false,
        }
    }).dxChart("instance");
}

/* -------------------------------------------------------------------------------- */
/* PMIN-PMAX FIT FUNCTION MANAGEMENT */
/* -------------------------------------------------------------------------------- */
function addPXMinPXMaxFitToChart(yValues) {
    let items = dxChartGetItems(appendixChartContainer);

    dxChartBeginUpdate(appendixChartContainer);

    let yValuesNum = yValues.length;
    for (var i = 0; i < yValuesNum; i++) {
        items[i][SERIES_PXMIN_PXMAX_FIT_POINT] = yValues[i];
    }

    tryAddPXMinPXMaxFitPointsSeries();

    dxChartEndUpdate(appendixChartContainer);
}

function tryAddPXMinPXMaxFitPointsSeries() {
    if (!isPXMinPXMaxChartSeriesAvailableByName(SERIES_PXMIN_PXMAX_FIT)) {
        let pMinPMaxFitSeries = {
            valueField: SERIES_PXMIN_PXMAX_FIT_POINT,
            name: SERIES_PXMIN_PXMAX_FIT,
            axis: 'valueAxis',
            color: 'green',
            point: { visible: true, size: 12, color: 'green' },
            isVisible: true,
        };
        addPXMinPXMaxChartSeries(pMinPMaxFitSeries);
        dxChartUpdateSeries(appendixChartContainer, pXMinPXMaxSeries);
    }
}

function addPXMinPXMaxMaxValuePointToChart() {
    let items = dxChartGetItems(appendixChartContainer);

    //console.log(`${addPMinPMaxMaxValuePoint.name} - adding ${currentP0P1Selection.P.X}, ${currentP0P1Selection.P.Y}...`);
    setPointOnChart(items, currentP0P1Selection.P.X, currentP0P1Selection.P.Y, SERIES_PXMIN_PXMAX_MAX_VALUE_POINT);
}

function tryAddPXMinPXMaxMaxValuePointSeries() {
    if (!isPXMinPXMaxChartSeriesAvailableByName(SERIES_PXMIN_PXMAX_MAX_VALUE)) {
        let pMinPMaxMaxValueSeries = {
            valueField: SERIES_PXMIN_PXMAX_MAX_VALUE_POINT,
            name: SERIES_PXMIN_PXMAX_MAX_VALUE,
            axis: 'valueAxis',
            width: 0,
            point: { visible: true, size: 12, color: 'white' },
            isVisible: true,
        };
        addPXMinPXMaxChartSeries(pMinPMaxMaxValueSeries);
        dxChartUpdateSeries(appendixChartContainer, pXMinPXMaxSeries);
    }
}

async function onPXMinPXMaxFitFunctionSelectProAsync(val, option, item) {
    //console.log(val);
    let value = Metro.getPlugin(`#${this.id}`, 'select').val();
    let textId = `${value.slice(0, value.length - 3)}${value.slice(value.length - 2)}Text`;
    await pXMinPXMaxFitFunctionSelectProManagementAsync(val, textId)
}

async function pXMinPXMaxFitFunctionSelectProManagementAsync(val, textId = null) {
    /* remove fit-series */
    tryRemovePXMinPXMaxMaxValueSeries();

    /* retrieve info about segment and function */
    let functionIndex = getFunctionIndexFromValue(val, FIT_SEGMENT_PRO);

    /* retrieve the selected fit function */
    let selectedFitFunction = pXMinPXMaxMaxValueFunctions[functionIndex];
    if (!selectedFitFunction)
        return;

    let fixedVal = val.replace(FIT_SEGMENT_PRO, '');

    /* retrieve segment index */
    let segmentIndex = parseInt(fixedVal.substring(0, 1));

    /* determine whether selected point is P0 or P1 */
    let P0P1Val = P0;
    let _P0P1Val = fixedVal.substring(2, 4);
    if (_P0P1Val == P1)
        P0P1Val = P1;

    /* save used pXMinPXMaxMaxValueFunctionId for P0/P1 */
    segmentsForFitting[segmentIndex][P0P1Val].SelectedPXMinPXMaxFitFunctionId = selectedFitFunction.Id;

    /* remove old y-max-value point from appendix-chart */
    removeYMaxValuePointFromChart(currentP0P1Selection.P);

    /* find the maximum in the segments defined by the points boundaries */
    let points = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);
    pXMinPXMaxResult = await calculateMaxValuePointAsync(points, currentP0P1Selection, selectedFitFunction.Id);
    //console.log(pXMinPXMaxResult);

    /* retrieve the yvalue on chart from the y-max-value x-coord */
    let point = points.find(p => p.X == pXMinPXMaxResult.maxValuePoint.X);

    /* update y-max-value x-coord */
    currentP0P1Selection.P = pXMinPXMaxResult.maxValuePoint;
    pXMinPXMaxResult.maxValuePoint.Y = point.Y;

    /* re-add the new y-max-value on appendix chart */
    addPXMinPXMaxMaxValuePointToChart();
    tryAddPXMinPXMaxMaxValuePointSeries();

    /* when fit function values are available, then add them to chart */
    if (pXMinPXMaxResult.yValues && pXMinPXMaxResult.yValues.length > 0) {
        /* extract points in range defined by P0/P1 XMin-XMax */
        let range = extractSpectrumRange(points, segmentsForFitting[segmentIndex][P0P1Val].PXMin.X, segmentsForFitting[segmentIndex][P0P1Val].PXMax.X);

        /* extract min-max for yvalues in range */
        let rangeYValues = range.map(p => { return p.Y });
        let fitYValues = updateSegmentYRange(rangeYValues, pXMinPXMaxResult.yValues);
        //let rangeYValuesMin = Math.min(...rangeYValues);
        //let rangeYValuesMax = Math.max(...rangeYValues);
        ////console.log(`rangeYValuesMin: ${rangeYValuesMin}, rangeYValuesMax: ${rangeYValuesMax}`);

        //let fitYValuesMin = Math.min(...pXMinPXMaxResult.yValues);
        //let fitYValuesMax = Math.max(...pXMinPXMaxResult.yValues);

        ///* create a new y-array with fitvalues mapped to original y-values-interval */
        //let fitYValues = [];
        //let pXMinPXMaxResultYValuesNum = pXMinPXMaxResult.yValues.length;
        //for (var i = 0; i < pXMinPXMaxResultYValuesNum; i++) {
        //    fitYValues[i] = ((pXMinPXMaxResult.yValues[i] - fitYValuesMin) / (fitYValuesMax - fitYValuesMin)) * (rangeYValuesMax - rangeYValuesMin) + rangeYValuesMin;
        //    //console.log(fitYValues);
        //}

        addPXMinPXMaxFitToChart(fitYValues);
    }

    /* update chart */
    dxChartRefresh(appendixChartContainer);

    /* update y-max-value x-coord on appendix */
    $('#yMaxValueXCoord').text(pXMinPXMaxResult.maxValuePoint.X);

    if (textId)
        $(`#${textId}`).text(pXMinPXMaxResult.maxValuePoint.X);
}

function tryRemovePXMinPXMaxMaxValueSeries() {
    if (!isPXMinPXMaxChartSeriesAvailableByName(SERIES_PXMIN_PXMAX_FIT))
        return;

    /* remove points */
    let items = dxChartGetItems(appendixChartContainer);

    dxChartBeginUpdate(appendixChartContainer);
    let itemsNum = items.length;
    for (var i = 0; i < itemsNum; i++) {
        if (items[i][SERIES_PXMIN_PXMAX_FIT_POINT])
            delete items[i][SERIES_PXMIN_PXMAX_FIT_POINT];
    }
    dxChartEndUpdate(appendixChartContainer);

    /* remove series */
    let seriesIndex = findPXMinPXMaxChartSeriesIndexByName(SERIES_PXMIN_PXMAX_FIT);
    removePXMinPXMaxChartSeriesAt(seriesIndex);
    dxChartUpdateSeries(appendixChartContainer, pXMinPXMaxSeries);
}

/* -------------------------------------------------------------------------------- */
/* PMIN-PMAX APPENDIX VISUALIZATION */
/* -------------------------------------------------------------------------------- */
function hidePXMinPXMaxFitting(elemid) {
    if (isAppendixPinned)
        return;

    let callback = function () {
        $(`#${elemid}`).remove();
        isAppendixAlreadyAvailable = false;
    };
    animateCSS(elemid, 'fadeOutRight', FASTER, callback);
}

/* -------------------------------------------------------------------------------- */
/* PMIN-PMAX CHART SERIES */
/* -------------------------------------------------------------------------------- */
function addPXMinPXMaxChartSeries(series) {
    if (pXMinPXMaxSeries.findIndex(x => x.name == series.name) == -1)
        pXMinPXMaxSeries.push(series);
}

function isPXMinPXMaxChartSeriesAvailableByName(name) {
    let index = pXMinPXMaxSeries.findIndex(x => x.name == name);
    return (index > -1);
}

function findPXMinPXMaxChartSeriesIndexByName(name) {
    return pXMinPXMaxSeries.findIndex(x => x.name == name);
}

function removePXMinPXMaxChartSeriesAt(index) {
    if (index < 0)
        return;

    pXMinPXMaxSeries.splice(index, 1);
}

function removeYMaxValuePointFromChart(point) {
    let items = dxChartGetItems(appendixChartContainer);

    let index = items.findIndex(p => p.X == point.X);
    if (index < 0)
        return;
    if (items[index][SERIES_PXMIN_PXMAX_MAX_VALUE_POINT]) {
        dxChartBeginUpdate(appendixChartContainer);

        delete items[index][SERIES_PXMIN_PXMAX_MAX_VALUE_POINT];

        dxChartEndUpdate(appendixChartContainer);
    }
}

/* ################################################################################ */
/* MANAGE VISUALIZATION OF SERIES CONTAINING SELECTED POINTS */
/* ################################################################################ */
function addBoundaryPointsPro(items, point) {
    /* add left boundary */
    setPointWithErrorBarOnChart(items, point.PXMin.X, point.PXMin.Y, point.PXMin[MIN_Y], point.PXMin[MAX_Y], SERIES_FIT_POINT);

    /* add right boundary */
    setPointWithErrorBarOnChart(items, point.PXMax.X, point.PXMax.Y, point.PXMax[MIN_Y], point.PXMax[MAX_Y], SERIES_FIT_POINT);
}

async function calculateMaximumInPointRangeAsync(xMin, xMax) {
    let points = extractSpectrumRange(getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval), xMin, xMax);

    let maxPoint = await window.dotNetHelper.invokeMethodAsync("calculateMaximumInRange",
        points);
    //console.log(`${calculateMaximumInPointRangeAsync.name} - point_x: ${xMin}, maxPoint_x: ${maxPoint.X}`);
    return maxPoint;
}

async function updateBoundaryPointProAsync(oldPointForFitting, requestedX, PMinMax, spinnerId) {
    let items = dxChartGetItems(chartContainer);

    /* find index of boundary in items array */
    let oldBoundaryIndex = items.findIndex(p => p.X == oldPointForFitting[PMinMax].X);

    /* remove the old point */
    if (items[oldBoundaryIndex][SERIES_FIT_POINT])
        delete items[oldBoundaryIndex][SERIES_FIT_POINT];

    let points = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);

    let spectrumPoint = points.find(p => p.X == requestedX);
    if (!spectrumPoint)
        return;

    /* set y-interval for points to be used as boundaries of selected point in pro-fit-mode */
    let minY = spectrumPoint.Y - errorBarSemiHeight;
    let maxY = spectrumPoint.Y + errorBarSemiHeight;

    let newBoundaryIndex = items.findIndex(p => p.X == requestedX);
    items[newBoundaryIndex][SERIES_FIT_POINT] = spectrumPoint.Y;
    items[newBoundaryIndex][MIN_Y] = minY;
    items[newBoundaryIndex][MAX_Y] = maxY;

    /* update value of current boundary point */
    oldPointForFitting[PMinMax].X = requestedX;

    /* update maxPoint in the boundaries-defined range */
    let xMin = requestedX;
    let xMax = oldPointForFitting.PXMax.X;
    if (PMinMax == PXMax) {
        xMin = oldPointForFitting.PXMin.X;
        xMax = requestedX;
    }
    let maxPoint = await calculateMaximumInPointRangeAsync(xMin, xMax);

    updatePointForFitting(oldPointForFitting, maxPoint);

    setPointOnChart(items, maxPoint.X, maxPoint.Y, SERIES_FIT_POINT);

    if (isShowChartConstantLinesForFitPointsAllowed) {
        resetShownConstantLines();
        addOrUpdateConstantLines(getFitPointsConstantLines(), CHART_CONSTANT_LINES_FIT_POINTS);
        updateConstantLines();
    }

    /* refresh chart */
    dxChartRefresh(chartContainer);
    hideSpectraToBeHidden();

    /* update segment centeron charms UI */
    let targetId = spinnerId.replace(PMinMax, spinnerId);
    $(`#${targetId}`).text(maxPoint.X);
}
function getFirstSegmentId(currentFitMode) {
    let suffix = 'Core';
    if (currentFitMode == FIT_PRO_MODE)
        suffix = 'Pro';

    return $(`#fitSegmentsList${suffix}`).children().first().attr('id');
}

function getFunctionIndexFromValue(id, fitSegmentType) {
    if (!fitSegmentType) {
        if (id.includes(FIT_SEGMENT_CORE))
            fitSegmentType = FIT_SEGMENT_CORE;
        else if (id.includes(FIT_SEGMENT_PRO))
            fitSegmentType = FIT_SEGMENT_PRO;
    }

    let numbers = id.replace(fitSegmentType, '');
    let functionId = parseInt(numbers.charAt(1));
    let functionIndex = fitFunctions.findIndex(f => f.Id == functionId);
    return functionIndex;
}

function onSegmentFunctionSelectBase(id, val, fitSegmentType, fitSegmentValueType) {
    let segmentIndex;
    if (id)
        segmentIndex = parseInt(id.replace(fitSegmentType, '').replace('Select', ''));
    else
        segmentIndex = parseInt(val.replace(fitSegmentType, '').split('')[0]);

    /* retrieve info about segment and function */
    let functionIndex = getFunctionIndexFromValue(val, fitSegmentType);

    /* clear the div */
    $(`#${fitSegmentValueType}${segmentIndex}Container`).empty();

    /* retrieve the selected fit function */
    let selectedFitFunction = fitFunctions[functionIndex];
    if (!selectedFitFunction)
        return;

    /* save selected fit function for segment */
    segmentsForFitting[segmentIndex].SelectedFitFunctionId = selectedFitFunction.Id;
    /* set default parameter value */
    let fitFunction = getFitFunctionById(segmentsForFitting[segmentIndex].SelectedFitFunctionId);
    if (fitFunction.ParameterConstraintValue)
        segmentsForFitting[segmentIndex].FitFunctionParameterValue = fitFunction.ParameterConstraintValue.Value;
    else
        segmentsForFitting[segmentIndex].FitFunctionParameterValue = 0;

    let parameter = selectedFitFunction.ParameterConstraintValue;
    if (parameter) {
        let segmentId = `${fitSegmentValueType}${segmentIndex}`;
        setParameterSpinner(segmentId, parameter, segmentIndex, fitFunction, onFitMethodFunctionParameterChange.name);
    }

    return {
        SelectedFitFunction: selectedFitFunction,
        SegmentIndex: segmentIndex
    }
}

async function onFitMethodFunctionParameterChange(curr, request, real) {
    if (curr == parseFloat(real))
        return;

    //console.log(`onFitMethodFunctionParameterChange - curr: ${curr}, request: ${request}, real: ${real}`);

    try {
        let elemId = this.id;
        let value = Metro.getPlugin(`#${this.id}`, 'spinner').val();

        /* retrieve selected fit-function for current segment */
        let val = Metro.getPlugin(`#${elemId.replace('value', '')}Select`, 'select').val();
        /* retrieve info about segment and function */
        let functionIndex = getFunctionIndexFromValue(val);

        /* retrieve the selected fit function and update the parameter value */
        let selectedFitFunction = fitFunctions[functionIndex];
        selectedFitFunction.ParameterConstraintValue.Value = request;

        /* retrieve index of selected segment */
        let fitSegmentValue = FIT_SEGMENT_CORE_VALUE;
        if (elemId.includes(FIT_SEGMENT_PRO))
            fitSegmentValue = FIT_SEGMENT_PRO_VALUE;

        let index = parseInt(elemId.replace(fitSegmentValue, ''));

        /* save parameter used for current fit function */
        segmentsForFitting[index].FitFunctionParameterValue = request;

        /* add/update continuum segment */
        await buildContinuumSegmentAsync(selectedFitFunction, segmentsForFitting[index].P0.P, segmentsForFitting[index].P1.P);
    } catch (e) {
        console.log(`${onFitMethodFunctionParameterChange.name} - ex: ${e}`);
    }
}

function orderSegmentForFittingUIsIds(currentFitMode) {

    let fitSegmentType = FIT_SEGMENT_CORE;
    let fitSegmentValueType = FIT_SEGMENT_CORE_VALUE;
    if (currentFitMode == FIT_PRO_MODE) {
        fitSegmentType = FIT_SEGMENT_PRO;
        fitSegmentValueType = FIT_SEGMENT_PRO_VALUE;
    }

    let segmentsForFittingNum = segmentsForFitting.length;
    for (var i = segmentsForFittingNum - 1; i >= 0; i--) {
        let newId = `${fitSegmentType}${segmentsForFitting[i].Index}`;
        $(`#${segmentsForFitting[i].uiId}`).attr('id', newId);
        segmentsForFitting[i].uiId = newId;
        /* update id of select */
        $(`#${newId}`).find('select').attr('id', `${fitSegmentType}${segmentsForFitting[i].Index}Select`);
        /* update id of div containing param value */
        let newFitSegmentValueContainerId = `${fitSegmentValueType}${segmentsForFitting[i].Index}Container`;
        $(`#${newId}`).find('div[id$="Container"]').attr('id', newFitSegmentValueContainerId);
        /* update spinner id, if available */
        let spinner = $(`#${fitSegmentValueType}${segmentsForFitting[i].Index}Container`).find('input[type=text]');
        if (spinner)
            $(spinner).attr('id', `${fitSegmentValueType}${segmentsForFitting[i].Index}`);
    }
}

function setParameterSpinner(id, parameter, segmentIndex, fitFunction, onFitMethodFunctionParameterChangeFunctionName) {
    let html = `<label>${FitSegmentFunctionParameterLabel}</label>`;
    html += `<input id="${id}" `;
    html += `data-default-value="${parameter.Value}" `;
    html += `data-min-value="${parameter.Minimum}" `;
    html += `data-max-value="${parameter.Maximum}" `;
    html += `data-step="${parameter.Step}" `;
    html += `data-fixed="4" `;
    html += `data-cls-spinner="margin-top-8" `;
    html += `data-on-plus-click="${onFitMethodFunctionParameterChangeFunctionName}" `;
    html += `data-on-minus-click="${onFitMethodFunctionParameterChangeFunctionName}" `;
    html += `data-repeat-threshold="1000" `;
    html += `type="text" data-role="spinner" data-buttons-position="right">`;
    $(`#${id}Container`).html(html);
    $(`#${id}`).ready(function () {
        segmentsForFitting[segmentIndex].FitFunctionParameterValue = fitFunction.ParameterConstraintValue.Value;
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${id}`, 'spinner').toDefault();
    });
}

/* ################################################################################ */
/* MANAGE POINTS ON CHART */
/* ################################################################################ */
function setPointOnChart(items, x, y, argumentValue) {
    let index = items.findIndex(p => p.X == x);
    items[index][argumentValue] = y;
}

function setPointWithErrorBarOnChart(items, pX, pY, pMinY, pMaxY, argumentValue) {
    let index = items.findIndex(p => p.X == pX);
    items[index][argumentValue] = pY;
    items[index][MIN_Y] = pMinY;
    items[index][MAX_Y] = pMaxY;
}

/* ################################################################################ */
/* POINTS FOR FITTING */
/* ################################################################################ */
function addPointForFitting(point) {
    pointsForFitting.push(point);
    pointsForFitting.sort((p0, p1) => {
        return p0.P.X - p1.P.X;
    });
}

function createPointForFitting(point) {
    let pointBoundaries = createPointBoundariesForFitting(point);

    return {
        PXMin: pointBoundaries.MinXPoint,
        P: point,
        SavedP: point, // this is used to save the original clicked point: in PRO mode, P is recalculated by as max/min of selected portion of spectrum
        PXMax: pointBoundaries.MaxXPoint,
        SelectedPXMinPXMaxFitFunctionId: 1
    };
}

function findPointForFittingByPX(point) {
    let index = pointsForFitting.findIndex(p => p.P.X >= (point.P.X - POINT_RADIUS) && (p.P.X <= (point.P.X + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index].X;
}

function findPointForFittingByPMinX(x) {
    let index = pointsForFitting.findIndex(p => p.PXMin.X >= (x - POINT_RADIUS) && (p.PXMin.X <= (x + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function findPointForFittingByPMaxX(x) {
    let index = pointsForFitting.findIndex(p => p.PXMax.X >= (x - POINT_RADIUS) && (p.PXMax.X <= (x + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function findPointForFittingByX(x) {
    let index = pointsForFitting.findIndex(p => p.P.X >= (x - POINT_RADIUS) && (p.P.X <= (x + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function getPointForFittingAfter(point) {
    return pointsForFitting.find(p => p.P.X > point.P.X);
}

function getPointForFittingBefore(point) {
    let pointsBefore = pointsForFitting.filter(p => p.P.X < point.P.X);
    return pointsBefore[pointsBefore.length - 1];
}

function getPointsForFittingMaxX() {
    return Math.max(...pointsForFitting.map(p => p.P.X));
}

function getPointsForFittingMinX() {
    return Math.min(...pointsForFitting.map(p => p.P.X));
}

function isFirstPointForFittingInList() {
    return pointsForFitting.length == 1;
}

function isExistantPointForFitting(point) {
    let index = pointsForFitting.findIndex(p => p.P.X == point.P.X && p.P.Y == point.P.Y);
    return (index > -1);
}

function isOnlyOnePointFotFittingAvailable() {
    return (pointsForFitting.length == 1);
}

function isPointsForFittingEmpty() {
    return (pointsForFitting.length == 0);
}

function isPointForFittingInExistingSegment(point) {
    isInExistingSegment = true;

    if (isPointsForFittingEmpty() || isFirstPointForFittingInList())
        return false;

    let minX = getPointsForFittingMinX();
    let maxX = getPointsForFittingMaxX();

    if (point.P.X <= minX || point.P.X >= maxX)
        isInExistingSegment = false;

    return isInExistingSegment;
}

function removePointForFitting(point) {
    let index = pointsForFitting.findIndex(p => p.P.X >= (point.P.X - POINT_RADIUS) && (p.P.X <= (point.P.X + POINT_RADIUS)));

    if (index == -1)
        return;

    pointsForFitting.splice(index, 1);
}

function updatePointForFitting(oldPoint, newPoint) {
    let index = pointsForFitting.findIndex(p => p.P.X == oldPoint.P.X);
    if (index == -1)
        return;

    pointsForFitting[index].P.X = newPoint.X;
    pointsForFitting[index].P.Y = newPoint.Y;
}

/* ANCILLARY */
function calculateSemiErrorBarHeight() {
    /* error-bar semi-height is calculated only once, to have always the same height */
    if (!errorBarSemiHeight) {
        /* get user-defined minor-tick-interval. if not defined, retrieve the one used by chart */
        let minorTickInterval = dxChartGetValueAxisMinorTickInterval(chartContainer);
        if (!minorTickInterval)
            minorTickInterval = dxChartGetUnofficialValueAxisMinorTickInterval(chartContainer);

        errorBarSemiHeight = minorTickInterval;
        //console.log(`calculate errorBarSemiHeight: ${errorBarSemiHeight}`);
    }
}

function createPointBoundariesForFitting(point) {
    let points = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);
    //let points = getPointsFromSeriesPoints(dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval))));

    let minXPoint;
    if (isExistingPointByX(points, point.X - fitPointSemiRange))
        minXPoint = getPointByX(points, point.X - fitPointSemiRange);
    else {
        let minX = getPointsMinX(points);
        minXPoint = getPointByX(points, minX);
    }

    let maxXPoint;
    if (isExistingPointByX(points, point.X + fitPointSemiRange))
        maxXPoint = getPointByX(points, point.X + fitPointSemiRange);
    else {
        let maxX = getPointsMaxX(points);
        maxXPoint = getPointByX(points, maxX);
    }

    /* error-bar semi-height is calculated only once, to have always the same height */
    calculateSemiErrorBarHeight();

    /* set y-interval for points to be used as boundaries of selected point in pro-fit-mode */
    minXPoint[MIN_Y] = minXPoint.Y - errorBarSemiHeight;
    minXPoint[MAX_Y] = minXPoint.Y + errorBarSemiHeight;

    maxXPoint[MIN_Y] = maxXPoint.Y - errorBarSemiHeight;
    maxXPoint[MAX_Y] = maxXPoint.Y + errorBarSemiHeight;

    return {
        MinXPoint: minXPoint,
        MaxXPoint: maxXPoint
    }
}

/* -------------------------------------------------------------------------------- */
/* SEGMENTS-FOR-FITTING */
/* -------------------------------------------------------------------------------- */
function addSegmentForFitting(segmentForFitting) {
    segmentsForFitting.push(segmentForFitting);
}

function createSegmentForFitting(p0, p1) {
    return {
        Index: 0,
        P0: p0,
        P1: p1
    };
}

function findExistingSegmentFotFittingIndex(x) {
    return segmentsForFitting.findIndex(s => s.P0.P.X <= x && s.P1.P.X >= x);
}

function orderSegmentsForFitting() {
    /* re-order segments in ascending order (by X0) */
    segmentsForFitting.sort((s0, s1) => {
        return s0.P0.P.X - s1.P0.P.X;
    });

    let counter = 0;
    segmentsForFitting.forEach(item => {
        item.Index = counter;
        counter++;
    });
}

function removeSegmentForFittingAt(index) {
    return segmentsForFitting.splice(index, 1);
}
var BY_SEGMENTS = "BySegments";
var BY_WHOLE_SPECTRUM = "ByWholeSpectrum";

var X_START = "XStart";
var X_END = "XEnd";

var WINDOW_SIZE = "WindowSize";
var POLYNOMIAL_ORDER = "PolynomialOrder";

var isAutoSaveSmoothingSettingsEnabled = false;
var timeoutSmoothingSettings;

var smoothingSegmentsOptions;
var smoothingWholeSpectrumOptions;


var INCREASE = 'increase';
var DECREASE = 'decrease';

var currentSmoothingTypeForDelete;

async function callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(filename = null, spectrumType) {
    if (filename == null) {
        let file = getSpectrumInfoById(selectedSpectrumForProcessingId);
        filename = file.Name;
    }

    await checkIsSpectrumOfTypeSavedOnCloudAsync(filename, spectrumType);
}

async function getDestSpectrumTypeAsync(smoothingType, spectrumType) {
    let smoothingValue;
    switch (smoothingType) {
        case BY_SEGMENTS:
            smoothingValue = SMOOTHING_TYPE_BY_SEGMENTS;
            break;

        case BY_WHOLE_SPECTRUM:
            smoothingValue = SMOOTHING_TYPE_WHOLE_SPECTRUM;
            break;
    }

    return await window.dotNetHelper.invokeMethodAsync("getDestSpectrumType",
        smoothingValue,
        spectrumType);
}

/* ################################################################################ */
/* AUTO SAVE SMOOTHING SETTINGS */
/* ################################################################################ */
async function initSwitchAutoSaveSmoothingSegmentsAsync() {
    await loadAutoSaveSmoothingSegmentsAsync();

    $('#charmsSwitchAutoSaveSmoothingSegments').on('change', async function () {
        let isChecked = isCheckboxChecked('charmsSwitchAutoSaveSmoothingSegments');

        enqueSaveSetting(getQueueItem(SMOOTHING_AUTO_SAVE_SEGMENTS_SETTINGS, (isChecked ? '1' : '0')));

        if (isChecked)
            /* show message for saved settings */
            showBubble('charmsSwitchAutoSaveSmoothingSegmentsBubble');
    });
}

async function loadAutoSaveSmoothingSegmentsAsync() {
    let obj = await getUserSettingAsync(SMOOTHING_AUTO_SAVE_SEGMENTS_SETTINGS);
    if (obj.IsOk) {
        /* save retrieved value and show it */
        let isChecked = (obj.Value == '1');
        setSwitchAutoSaveSmoothingSegments(isChecked);
    } else
        setSwitchAutoSaveSmoothingSegments(false);
}

function setSwitchAutoSaveSmoothingSegments(isChecked) {
    $('#charmsSwitchAutoSaveSmoothingSegments').prop('checked', isChecked);

    isAutoSaveSmoothingSettingsEnabled = isChecked;
}

/* ################################################################################ */
/* PANEL UI ELEMENTS */
/* ################################################################################ */
async function loadSmoothingPanelValuesAsync() {
    /* retrieve from cloud setting for enabling auto-save for smoothing settings */
    await initSwitchAutoSaveSmoothingSegmentsAsync();

    /* load and show the user defined options for smoothing by segments */
    await loadSmoothingSegmentsOptionsAsync();

    /* load and show the user defined options for smoothing by whole spectrum */
    await loadSmoothingWholeSpectrumOptionsAsync();
}

/* -------------------------------------------------------------------------------- */
/* ---------- SRC SPECTRUM TYPE ---------- */
/* -------------------------------------------------------------------------------- */
function getAvailableSrcSpectrumTypesNum() {
    let srcSpectrumTypes = [SPECTRUM_TYPE_ALIGNED, SPECTRUM_TYPE_CONTINUUM_REMOVED];

    let availableNum = 0;
    srcSpectrumTypes.forEach(function (item) {
        if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, item))
            availableNum++;
    });

    return availableNum;
}

function selectTargetSpectrumType() {
    let availableNum = getAvailableSrcSpectrumTypesNum();

    if (availableNum == 1) {
        let srcSpectrumType = getSrcSpectrumType();
        /* write the src spectrumType */
        showByClass('smoothingSrcSpectrumType');
        $('#smoothingSrcSpectrumType').text(getSpectrumTypeDescription(srcSpectrumType));
    } else if (availableNum > 1) {
        showByClass('srcSpectrumTypeListContainer');
    }
}

function getSrcSpectrumType() {
    let srcSpectrumType = SPECTRUM_TYPE_NONE;

    let availableNum = getAvailableSrcSpectrumTypesNum();

    if (availableNum == 1) {
        if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED))
            srcSpectrumType = SPECTRUM_TYPE_ALIGNED;
        else if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED))
            srcSpectrumType = SPECTRUM_TYPE_CONTINUUM_REMOVED;
    } else if (availableNum > 1) {
        srcSpectrumType = parseInt(Metro.getPlugin('#srcSpectrumTypeList', 'select').val());
    }

    return srcSpectrumType;
}

function buildSmoothingSegmentUI(smoothingSegment, segmentType, index, useButtonAdd = true, useButtonRemove = true) {
    let html = ``;

    html += `<div id="${segmentType}${index}" class="row cell-fs-12 border-bottom">`;
    /* ROW 0 */
    html += `   <div class="row cell-fs-12"><span class="text-light">${SmoothingSegmentBoundariesLabel}</span></div>`;
    /* ROW 1 */
    html += `   <div class="row margin-top--8">`;
    html += `       <div class="cell-fs-5">`;
    let minValue;
    if (index == 0) {
        /* retrieve raw spectrum min wavelength for settings 1st segment min vzlue and last segment max value */
        let spectrumPoints = getSpectrumPointsById(selectedSpectrumForProcessingId);
        minValue = spectrumPoints[0].X;
    }
    html += getSmoothingSegmentUISpinner(segmentType, X_START, index, onSmoothingSegmentBySegmentsXStartChangeAsync.name, minValue);
    html += `       </div>`;
    html += `       <div class="cell-fs-5">`;
    let maxValue;
    if (index == getSmoothingSegmentsNum() - 1) {
        /* retrieve raw spectrum max wavelength for settings 1st segment min vzlue and last segment max value */
        let spectrumPoints = getSpectrumPointsById(selectedSpectrumForProcessingId);
        maxValue = spectrumPoints[spectrumPoints.length - 1].X;
    }
    html += getSmoothingSegmentUISpinner(segmentType, X_END, index, onSmoothingSegmentBySegmentsXEndChangeAsync.name, null, maxValue);
    html += `       </div>`;
    html += `       <div class="cell-fs-2">`;
    html += (useButtonAdd ? getSmoothingSegmentUIButtonAdd(segmentType, index) : `&nbsp;`);
    html += `       </div>`;
    html += `   </div>`;
    /* ROW 2 */
    html += `   <div class="row">`;
    html += `       <div class="cell-fs-5"><span class="text-light">${SmoothingSegmentWindowSizeLabel}</span></div>`;
    html += `       <div class="cell-fs-5"><span class="text-light">${SmoothingSegmentPolynomialOrderLabel}</span></div>`;
    html += `       <div class="cell-fs-2">&nbsp;</div>`;
    html += `   </div>`;
    /* ROW 3 */
    html += `   <div class="row margin-top--8">`;
    html += `       <div class="cell-fs-5">`;
    let actionNameWindowSize;
    switch (segmentType) {
        case BY_SEGMENTS:
            actionNameWindowSize = onSmoothingSegmentBySegmentsWindowSizeChangeAsync.name;
            break;

        case BY_WHOLE_SPECTRUM:
            actionNameWindowSize = onSmoothingSegmentByWholeSpectrumWindowSizeChangeAsync.name;
            break;
    }
    html += getSmoothingSegmentUISpinner(segmentType, WINDOW_SIZE, index, actionNameWindowSize, 0, 30);
    html += `       </div>`;
    html += `       <div class="cell-fs-5">`;
    let actionNamePolynomialOrder;
    switch (segmentType) {
        case BY_SEGMENTS:
            actionNamePolynomialOrder = onSmoothingSegmentBySegmentsPolynomialOrderChangeAsync.name;
            break;

        case BY_WHOLE_SPECTRUM:
            actionNamePolynomialOrder = onSmoothingSegmentByWholeSpectrumPolynomialOrderChangeAsync.name;
            break;
    }
    html += getSmoothingSegmentUISpinner(segmentType, POLYNOMIAL_ORDER, index, actionNamePolynomialOrder, 0, 3);
    html += `       </div>`;
    html += `       <div class="cell-fs-2">`;
    html += (useButtonRemove ? getSmoothingSegmentUIButtonRemove(segmentType, index) : `&nbsp;`);
    html += `       </div>`;
    html += `   </div>`;
    html += `</div>`;

    /* set value for spinners */
    $(`#${segmentType}${X_START}${index}`).ready(function () {
        Metro.getPlugin(`#${segmentType}${X_START}${index}`, 'spinner').val(smoothingSegment.XStart);
    });

    $(`#${segmentType}${X_END}${index}`).ready(function () {
        Metro.getPlugin(`#${segmentType}${X_END}${index}`, 'spinner').val(smoothingSegment.XEnd);
    });

    $(`#${segmentType}${WINDOW_SIZE}${index}`).ready(function () {
        Metro.getPlugin(`#${segmentType}${WINDOW_SIZE}${index}`, 'spinner').val(smoothingSegment.WindowSize);
    });

    $(`#${segmentType}${POLYNOMIAL_ORDER}${index}`).ready(function () {
        Metro.getPlugin(`#${segmentType}${POLYNOMIAL_ORDER}${index}`, 'spinner').val(smoothingSegment.PolynomialOrder);
    });

    /* append t the end of the list or insert in the middle, depending on the index value */
    if (segmentType == BY_SEGMENTS) {
        if (index == getSmoothingSegmentsNum() - 1)
            $(`#smoothing${segmentType}OptionsContainer`).append(html);
        else
            $(html).insertAfter(`#${segmentType}${index - 1}`);
    } else {
        $(`#smoothing${segmentType}OptionsContainer`).append(html);
    }
}

/* ################################################################################ */
/* SMOOTHING BY SEGMENTS OPTIONS */
/* ################################################################################ */
/* -------------------------------------------------------------------------------- */
/* ---------- SEGMENTS UI BUTTONS ---------- */
/* -------------------------------------------------------------------------------- */
function addSmoothingSegmentUI(segmentType, index) {
    /* when we add a new segment, what we do is the following:
       1) we retrieve the boundaries, the range of the segment 'next to the current one' and, then, the semi-range
       2) we increase the index of all segments following the current one to let a free place for the new segment
       3) we update id of UI items related to segments in memory
       4) we update the range of the segment 'next to the current one' to the upper half of its previous range
       5) we update the range in the UI of the segment 'next to the current one' to the upper half of its previous range
       6) we create a the new  segment in memory
       7) we create UI for the new segment */

    /* 1 */
    let nextSegment = getSmoothingSegmentByIndex(index + 1);

    let xstart = nextSegment.XStart;
    let xend = nextSegment.XEnd;

    let range = xend - xstart;
    let semiRange = parseInt(range / 2);

    /* 2/3 */
    for (var i = getSmoothingSegmentsNum() - 1; i >= index + 1; i--) {
        let itemIndex = getSmoothingSegmentByIndex(i).Index;

        updateSmoothingSegmentUIIndex(segmentType, itemIndex, INCREASE);

        getSmoothingSegmentByIndex(i).Index++;
    }

    /* 4 */
    updateSmoothingSegment(index + 2, X_START, xstart + semiRange);

    /* 5 */
    updateSmoothingSegmentUIProperty(segmentType, index + 2, X_START, xstart + semiRange);

    /* 6 */
    addSmoothingSegment(createSmoothingSegment(index + 1,
        xstart,
        xstart + semiRange,
        0,
        0));

    /* 7 */
    let segment = getSmoothingSegmentByIndex(index + 1);
    buildSmoothingSegmentUI(segment, segmentType, index + 1);

    trySaveSmoothingSettingsAsync(segmentType);
}

function removeSmoothingSegmentUIProcedure(segmentType, index) {
    askAndExecute(SmoothingManagementTitle, SmoothingRemoveSegmentQuestion, removeSmoothingSegmentUI, [segmentType, index]);
}

function removeSmoothingSegmentUI(segmentType, index) {
    /* when we remove a segment, what we do is the following: 
       1) we retrieve the boundaries of the current segment
       2) we remove segment UI
       3) we remove segment in memory
       4) we decrease the index of all segments following the current one to let a free place for the new segment
       5) we update id of UI items related to segments in memory
       6) we update the xEnd property of the segment before the current one
       7) we update the X_START in the UI of the segment before the current one */

    /* 1 */
    let currentSegment = getSmoothingSegmentByIndex(index);

    let xstart = currentSegment.XStart;
    let xend = currentSegment.XEnd;

    /* 2 */
    $(`#${segmentType}${index}`).remove();

    /* 3 */
    removeSmoothingSegment(xstart, xend);

    /* 4/5 */
    for (var i = 0; i < getSmoothingSegmentsNum(); i++) {
        let itemIndex = getSmoothingSegmentByPositionIndex(i).Index;

        if (itemIndex <= index)
            continue;

        updateSmoothingSegmentUIIndex(segmentType, itemIndex, DECREASE);

        getSmoothingSegmentByIndex(itemIndex).Index--;
    }

    /* 6 */
    updateSmoothingSegment(index, X_START, xstart);

    /* 7 */
    updateSmoothingSegmentUIProperty(segmentType, index, X_START, xstart - 1); // - 1 is due to the way the 'updateSmoothingSegmentUIProperty' function works

    trySaveSmoothingSettingsAsync(segmentType);
}

function updateSmoothingSegmentUIIndex(segmentType, itemIndex, increaseOrDecrease) {
    let newIndex;
    switch (increaseOrDecrease) {
        case INCREASE:
            newIndex = itemIndex + 1;
            break;

        case DECREASE:
            newIndex = itemIndex - 1;
            break;
    }

    $(`#${segmentType}${itemIndex}`).attr('id', `${segmentType}${newIndex}`);
    $(`#${segmentType}${X_START}${itemIndex}`).attr('id', `${segmentType}${X_START}${newIndex}`);
    $(`#${segmentType}${X_END}${itemIndex}`).attr('id', `${segmentType}${X_END}${newIndex}`);
    $(`#${segmentType}${WINDOW_SIZE}${itemIndex}`).attr('id', `${segmentType}${WINDOW_SIZE}${newIndex}`);
    $(`#${segmentType}${POLYNOMIAL_ORDER}${itemIndex}`).attr('id', `${segmentType}${POLYNOMIAL_ORDER}${newIndex}`);
}

function updateSmoothingSegmentUIProperty(segmentType, index, targetPropertyName, updatedValue) {
    let id = `${segmentType}${targetPropertyName}${index}`;
    let value = parseInt(Metro.getPlugin(`#${id}`, 'spinner').val());

    let isUpdateRequired = false;
    let newValue;
    switch (targetPropertyName) {
        case X_START:
            newValue = updatedValue + 1;
            isUpdateRequired = true;
            break;

        case X_END:
            newValue = updatedValue - 1;
            isUpdateRequired = true;
            break;
    }

    if (isUpdateRequired) {
        Metro.getPlugin(`#${id}`, 'spinner').val(newValue);
        updateSmoothingSegment(index, targetPropertyName, newValue);
    }
}

/* -------------------------------------------------------------------------------- */
/* ---------- SEGMENTS UI ---------- */
/* -------------------------------------------------------------------------------- */
function getSmoothingSegmentUIButtonAdd(segmentType, index) {
    return `<button class="button primary cycle small margin-top-8" title="${SmoothingAddNewSegmentLabel}" onclick="${addSmoothingSegmentUI.name}('${segmentType}', ${index})"><span class="mif-plus"></span></button>`;
}

function getSmoothingSegmentUIButtonRemove(segmentType, index) {
    return `<button class="button primary cycle small margin-top-8" title="${SmoothingRemoveSegmentLabel}" onclick="${removeSmoothingSegmentUIProcedure.name}('${segmentType}', ${index})"><span class="mif-bin"></span></button>`;
}

function getSmoothingSegmentUISpinner(segmentType, propertyName, index, onValueChangeName, minValue = null, maxValue = null) {
    let html = ``;
    html += `<input id="${segmentType}${propertyName}${index}"`;
    html += `       type="text"`;
    html += `       data-role="spinner"`;
    html += `       data-buttons-position="right"`;
    html += `       data-cls-spinner="spinner margin-top-4"`;
    html += `       data-step="1"`;
    if (minValue)
        html += `       data-min-value="${minValue}"`;
    if (maxValue)
        html += `       data-max-value="${maxValue}"`;
    html += `       data-plus-icon="<span class='mif-chevron-thin-up'></span>"`;
    html += `       data-minus-icon="<span class='mif-chevron-thin-down'></span>"`;
    html += `       data-cls-spinner-button-plus="bg-cyan"`;
    html += `       data-cls-spinner-button-minus="bg-cyan"`;
    html += `       data-on-plus-click="${onValueChangeName}"`;
    html += `       data-on-minus-click="${onValueChangeName}"`;
    html += `       data-cls-spinner-button="fg-white">`;
    return html;
}

async function loadSmoothingSegmentsOptionsAsync() {
    let obj = await getUserSettingAsync(SMOOTHING_SEGMENTS_SETTINGS);
    if (obj && obj.IsOk) {
        /* init array with segments */
        initSmoothingSegmentsOptions();

        /* deserialize retrieved XML to extract smoothing segments */
        let smoothingSettingsModel = await dotNetHelper.invokeMethodAsync("deserializeFromXml", obj.Value);
        if (smoothingSettingsModel && smoothingSettingsModel.segments && smoothingSettingsModel.segments.length > 0) {
            let segmentsNum = smoothingSettingsModel.segments.length;
            for (var i = 0; i < segmentsNum; i++) {
                let segment = createSmoothingSegment(i,
                    smoothingSettingsModel.segments[i].xStart,
                    smoothingSettingsModel.segments[i].xEnd,
                    smoothingSettingsModel.segments[i].windowSize,
                    smoothingSettingsModel.segments[i].polynomialOrder);
                addSmoothingSegment(segment);

                buildSmoothingSegmentUI(segment, BY_SEGMENTS, i);
            }

            $('#smoothingBySegmentsButtonExecute').removeClass('disabled');
        }
        else
            showSimpleDialog(ERROR_LABEL, SmoothingRetrieveSettingsModelErrorMessage, ALERT);
    }
}

/* -------------------------------------------------------------------------------- */
/* ---------- UPDATE SEGMENT SETTINGS ---------- */
/* -------------------------------------------------------------------------------- */
async function onSmoothingSegmentBySegmentsXStartChangeAsync(curr, request, real) {
    let index = extractIndex(this, X_START);
    updateSmoothingSegment(index, X_START, request);

    /* to avoid overlapping between 2 segments boundaries, when a segment lower boundary changes, the previous upper boundary changes consequently */
    if (index > 0 && index < getSmoothingSegmentsNum()) {
        updateSmoothingSegmentUIProperty(BY_SEGMENTS, index - 1, X_END, request);
    }

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

async function onSmoothingSegmentBySegmentsXEndChangeAsync(curr, request, real) {
    let index = extractIndex(this, X_END);
    updateSmoothingSegment(index, X_END, request);

    /* to avoid overlapping between 2 segments boundaries, when a segment upper boundary changes, the next lower boundary changes consequently */
    if (index >= 0 && index < (getSmoothingSegmentsNum() - 1)) {
        updateSmoothingSegmentUIProperty(BY_SEGMENTS, index + 1, X_START, request);
    }

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

async function onSmoothingSegmentBySegmentsPolynomialOrderChangeAsync(curr, request, real) {
    let index = extractIndex(this, POLYNOMIAL_ORDER);
    updateSmoothingSegment(index, POLYNOMIAL_ORDER, request);

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

async function onSmoothingSegmentBySegmentsWindowSizeChangeAsync(curr, request, real) {
    let index = extractIndex(this, WINDOW_SIZE);
    updateSmoothingSegment(index, WINDOW_SIZE, request);

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

function extractIndex(reference, replaceValue) {
    let _index = reference.id.replace(BY_SEGMENTS, '').replace(replaceValue, '');
    let index = parseInt(_index);
    return index;
}

/* -------------------------------------------------------------------------------- */
/* ---------- SEGMENTS ARRAY ---------- */
/* -------------------------------------------------------------------------------- */
function initSmoothingSegmentsOptions() {
    smoothingSegmentsOptions = [];
}

function addSmoothingSegment(segment) {
    let index = smoothingSegmentsOptions.findIndex(x => x.XStart == segment.XStart && x.XEnd == segment.XEnd);
    if (index == -1)
        smoothingSegmentsOptions.push(segment);

    /* re-order array items by xStart value ascending */
    updateSmoothingSegmentsByXStart();
}

function createSmoothingSegment(index, xstart, xend, windowSize, polynomialOrder) {
    return {
        Index: index,
        XStart: xstart,
        XEnd: xend,
        WindowSize: windowSize,
        PolynomialOrder: polynomialOrder
    };
}

function getSmoothingSegmentByIndex(index) {
    let _index = smoothingSegmentsOptions.findIndex(x => x.Index == index)
    if (_index == -1)
        return null;

    return smoothingSegmentsOptions[_index]
}

function getSmoothingSegmentByPositionIndex(index) {
    try {
        return smoothingSegmentsOptions[index];
    } catch (e) {
        return null;
    }
}

function getSmoothingSegmentsNum() {
    return smoothingSegmentsOptions.length;
}

function removeSmoothingSegment(xstart, xend) {
    let index = smoothingSegmentsOptions.findIndex(x => x.XStart == xstart && x.XEnd == xend);
    if (index == -1)
        return;

    smoothingSegmentsOptions.splice(index, 1);

    /* re-order array items by xStart value ascending */
    updateSmoothingSegmentsByXStart()
}

function updateSmoothingSegment(index, propertyName, value) {
    let item = getSmoothingSegmentByIndex(index);
    if (item == null)
        return;

    item[propertyName] = value;
}

function updateSmoothingSegmentsByXStart() {
    /* re-order array items by lowerLimit value ascending */
    smoothingSegmentsOptions.sort((s1, s2) => {
        return s1.XStart - s2.XStart;
    });
}

/* ################################################################################ */
/* SETTINGS SERIALIZATION + SAVE TO CLOUD */
/* ################################################################################ */
async function saveSmoothingSettingsAsync(segmentType) {
    trySaveSmoothingSettingsAsync(segmentType, true);
}

async function trySaveSmoothingSettingsAsync(segmentType, isForced = false) {
    if (!isAutoSaveSmoothingSettingsEnabled && !isForced)
        return;

    let segments;
    switch (segmentType) {
        case BY_SEGMENTS:
            segments = smoothingSegmentsOptions;
            break;

        case BY_WHOLE_SPECTRUM:
            segments = [ smoothingWholeSpectrumOptions ];
            break;
    }
    let model = {
        Segments: segments
    };

    let xml = await dotNetHelper.invokeMethodAsync("serializeToXml", model);

    if (xml) {
        let key;
        switch (segmentType) {
            case BY_SEGMENTS:
                key = SMOOTHING_SEGMENTS_SETTINGS;
                break;

            case BY_WHOLE_SPECTRUM:
                key = SMOOTHING_WHOLE_SPECTRUM_SETTINGS;
                break;
        }

        callEnqueueSaveSetting(timeoutSmoothingSettings, key, xml, JS_DELAY_200);
    }
}

/* ################################################################################ */
/* SMOOTHING BY WHOLE SPECTRUM OPTIONS */
/* ################################################################################ */
async function loadSmoothingWholeSpectrumOptionsAsync() {
    let obj = await getUserSettingAsync(SMOOTHING_WHOLE_SPECTRUM_SETTINGS);
    if (obj && obj.IsOk) {
        /* deserialize retrieved XML to extract smoothing segments */
        let smoothingSettingsModel = await dotNetHelper.invokeMethodAsync("deserializeFromXml", obj.Value);
        if (smoothingSettingsModel && smoothingSettingsModel.segments && smoothingSettingsModel.segments.length > 0) {
            smoothingWholeSpectrumOptions = createSmoothingSegment(0,
                smoothingSettingsModel.segments[0].xStart,
                smoothingSettingsModel.segments[0].xEnd,
                smoothingSettingsModel.segments[0].windowSize,
                smoothingSettingsModel.segments[0].polynomialOrder);

            buildSmoothingSegmentUI(smoothingWholeSpectrumOptions, BY_WHOLE_SPECTRUM, 0, false, false);

            $('#smoothingByWholeSpectrumButtonExecute').removeClass('disabled');
        }
        else
            showSimpleDialog(ERROR_LABEL, SmoothingRetrieveSettingsModelErrorMessage, ALERT);
    }
}

/* -------------------------------------------------------------------------------- */
/* ---------- UPDATE SEGMENT SETTINGS ---------- */
/* -------------------------------------------------------------------------------- */
async function onSmoothingSegmentByWholeSpectrumPolynomialOrderChangeAsync(curr, request, real) {
    smoothingWholeSpectrumOptions.PolynomialOrder = request;

    await trySaveSmoothingSettingsAsync(BY_WHOLE_SPECTRUM);
}

async function onSmoothingSegmentByWholeSpectrumWindowSizeChangeAsync(curr, request, real) {
    smoothingWholeSpectrumOptions.WindowSize = request;

    await trySaveSmoothingSettingsAsync(BY_WHOLE_SPECTRUM);
}

/* ################################################################################ */
/* APPLY SMOOTHING */
/* ################################################################################ */
async function applySmoothingAsync(smoothingType) {
    /* retrieve spectrumType of spectrum to be processed */
    let srcSpectrumType = getSrcSpectrumType();

    /* retrieve points of continuum for removing it from aligned */
    let toBeSmoothedPoints = getSpectrumPointsBySpectrumType(srcSpectrumType);
    if (!toBeSmoothedPoints) {
        showSimpleDialog(ERROR_LABEL, SmoothingExecuteSmoothingErrorMessage, ALERT);
        return;
    }

    let smoothingOptions;
    switch (smoothingType) {
        case BY_SEGMENTS:
            smoothingOptions = smoothingSegmentsOptions;
            break;

        case BY_WHOLE_SPECTRUM:
            smoothingOptions = smoothingWholeSpectrumOptions;
            break;
    }

    let processingResult = await window.dotNetHelper.invokeMethodAsync(`applySmoothing${smoothingType}`,
        toBeSmoothedPoints,
        smoothingOptions);

    if (processingResult.dialogMessage) {
        //console.log(`applySmoothingBySegmentsAsync - ex: ${processingResult.dialogMessage}`);
        showSimpleDialog(ERROR_LABEL, SmoothingApplySmoothingErrorMessage, ALERT);
        return;
    }

    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(smoothingType, srcSpectrumType);

    let smoothedSpectrum = buildSmoothedSpectrum(smoothingType, srcSpectrumType, destSpectrumType);
    if (smoothedSpectrum) {
        /* add aligned spectrum to chart */
        addProcessedSpectrum(smoothedSpectrum, processingResult.Points, destSpectrumType);

        /* actions needed to update UI after smoothed spectrum has been added */
        buildSmoothedSpectrumCompleted(smoothingType);

        /* set text of cloud icon */
        setCloudTextAndIconStatus(destSpectrumType, false);
    }
    else
        showSimpleDialog(ERROR_LABEL, SmoothingExecutionErrorMessage, ALERT);
}

function buildSmoothedSpectrum(smoothingType, srcSpectrumType, destSpectrumType) {
    try {
        /* retrieve RAW spectrum */
        let rawSpectrum = getSpectrumInfoById(selectedSpectrumForProcessingId);

        /* retrieve info about parent spectrum */
        let srcSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, srcSpectrumType);

        /* build spectrum info for being added to 'spectraInfo' */
        let smoothedSpectrum = {
            Id: buildTempSmoothedSpectrumId(srcSpectrumType, smoothingType),
            ParentId: srcSpectrum.Id,
            Name: rawSpectrum.Name,
            SpectrumLevel: rawSpectrum.SpectrumLevel,
            SpectrumType: destSpectrumType,
            InsertDateTimeJs: 0
        };
        addSpectrumInfo(smoothedSpectrum);

        return smoothedSpectrum;
    } catch (e) {
        console.log(`${buildSmoothedSpectrum.name} - ex: ${e}`);
        return null;
    }
}

function buildSmoothedSpectrumCompleted(smoothingType) {
    /* enable buttons for saving/removing aligned spectrum */
    setMetroUIButtonEnabled(`smoothing${smoothingType}ButtonSave`, true);
    setMetroUIButtonEnabled(`smoothing${smoothingType}ButtonRemove`, true);

    /* set hidden the checkbox for removing file on cloud (because of the used HTML & css, we need to do it manually, since the 'd-none' class doesn't work) */
    hideElemMetroUIElem('checkboxRemoveSmoothedSpectrumOnCloud');

    /* refresh legend, if opened */
    refreshCharmsLegend();

    /* mantain hidden all not necessary spectra */
    hideSpectraToBeHidden();
}

/* ################################################################################ */
/* SAVE SMOOTHED SPECTRUM */
/* ################################################################################ */
function getSmoothedParentFiles(parentId) {
    return {
        ParentFile: getParentFile(parentId),
        RefFile: null,
        RefWhiteFile: null
    };
}

async function saveSmoothedSpectrumProcedureAsync(smoothingType) {
    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(smoothingType, getSrcSpectrumType());

    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, destSpectrumType);
    let cond1 = await checkIsSpectrumOfTypeSavedOnCloudAsync(spectrum.Name, destSpectrumType);
    let cond2 = isSpectrumOfTypeSavedOnCloud(destSpectrumType);
    if (cond1 || cond2)
        askAndExecute(CharmsSpectraProcessingManagementLabel, OverwriteSavedSpectrumQuestion, saveSmoothedSpectrumAsync, [smoothingType, true]);
    else
        saveSmoothedSpectrumAsync(smoothingType);
}

async function saveSmoothedSpectrumAsync(smoothingType, showLoadingAndMessage = true) {
    let isSavingOk = true;

    try {
        let srcSpectrumType = getSrcSpectrumType();

        /* retrieve spectrumType of processed spectrum */
        let destSpectrumType = await getDestSpectrumTypeAsync(smoothingType, srcSpectrumType);

        let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, destSpectrumType);
        if (!spectrum)
            return;

        if (showLoadingAndMessage)
            setLoadingCircleIsVisible(true);

        /* retrieve parent file */
        let srcSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, srcSpectrumType);
        if (srcSpectrum.Id == buildTempSmoothedSpectrumId(srcSpectrumType, smoothingType))
            srcSpectrum.Id = 0;

        let parentFiles = getSmoothedParentFiles(srcSpectrum.Id);

        let smoothingOptions;
        switch (smoothingType) {
            case BY_SEGMENTS:
                smoothingOptions = smoothingSegmentsOptions;
                break;

            case BY_WHOLE_SPECTRUM:
                smoothingOptions = [ smoothingWholeSpectrumOptions ];
                break;
        }

        let smoothingSettings = {
            Segments: smoothingOptions
        };

        let xml = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeSmoothedModelAsXml",
            spectrum.Name,
            spectrum.SpectrumType,
            getSpectrumPointsById(spectrum.Id),
            smoothingSettings,
            parentFiles);

        let spectrumFile = {
            Id: 0,
            Filename: spectrum.Name,
            ParentId: srcSpectrum.Id,
            Type: spectrum.SpectrumType,
            Level: spectrum.SpectrumLevel,
            Xml: xml
        };

        /* create model for request */
        let saveSpectrumRequest = {
            SpectrumFile: spectrumFile,
            SmoothingSettings: smoothingSettings,
            ParentFiles: parentFiles, // defined in charms.js
        };

        /* execute request and process response */
        let obj = await doAjaxPostAsync(UrlSaveSpectrumOfTypeSmoothed, saveSpectrumRequest);
        if (obj) {
            if (obj.IsOk) {
                let index = getSpectrumIndexById(spectrum.Id);

                /* add ParentId property to aligned spectrum */
                spectraInfo[index][PARENT_ID] = srcSpectrum.Id;

                /* UPDATES */
                /* 1) update spectraInfo id of aligned file with the one coming from DB */
                updateSpectrumInfoId(index, obj.Id);

                /* 2) update valueField for chart points by replacing the old fake-id with the real one */
                updateProcessedSpectrumValueField(buildTempSmoothedSpectrumId(srcSpectrumType, smoothingType), buildId(obj.Id));

                /* 3) update series in chart to ensure correspondance between series and valueField of aligned spectrum */
                updateProcessedSpectrumSeries(buildTempSmoothedSpectrumId(srcSpectrumType, smoothingType), buildId(obj.Id), obj.Id, true);

                /* call method for checking whether a version of aligned file is already saved on cloud or not */
                callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(spectraInfo[index].Name, destSpectrumType);

                /* mantain hidden unwanted spectra */
                hideSpectraToBeHidden();

                /* enable button for removing aligned file */
                setMetroUIButtonEnabled(`smoothing${smoothingType}ButtonRemove`, true);
            } else
                isSavingOk = false;
        } else 
            isSavingOk = false;
    } catch (e) {
        isSavingOk = false;
        console.log(`${saveSmoothedSpectrumAsync.name} - ex: ${e}`);
    }

    if (showLoadingAndMessage) {
        setLoadingCircleIsVisible(false);

        if (isSavingOk)
            showSimpleDialog(INFO_LABEL, SmoothedSaveSuccessMessage, SUCCESS);
        else
            showSimpleDialog(ERROR_LABEL, SmoothedSaveErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* REMOVE SMOOTHED SPECTRUM */
/* ################################################################################ */
async function callRemoveSpectraProcedureAsync(dialogId, checkboxId) {
    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(currentSmoothingTypeForDelete, getSrcSpectrumType());

    removeSpectraProcedureAsync(destSpectrumType, dialogId, checkboxId);
}

async function removeSmoothedSpectrumProcedure(smoothingType) {
    currentSmoothingTypeForDelete = smoothingType;

    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(smoothingType, getSrcSpectrumType());

    removeFileProcedure(destSpectrumType, 'checkboxRemoveSmoothedSpectrumOnCloud', 'smoothedDialogRemove');
}

async function removeSmoothedSpectrumAsync(smoothedSpectrum, isRemovalOnCloudRequested = false) {
    /* retrieve index of spectrum in spectraInfo */
    let index = getSpectrumIndexById(smoothedSpectrum.Id);

    let seriesname = getSpectrumSeriesNameFromIndex(index);

    /* remove aligned file from chart */
    removeSpectrumFromChart(seriesname, smoothedSpectrum.Id);

    /* remove aligned file from spectraInfo */
    removeSpectrumByIndex(index);

    /* remove aligned file from cloud, if required  */
    if (isRemovalOnCloudRequested && Number.isInteger(smoothedSpectrum.Id)) {
        await removeSpectrumOnCloudAsync(smoothedSpectrum.Id, AlignmentRemovalSuccessMessage, AlignmentRemovalErrorMessage);
    }

    /* disable buttons for saving/removing since aligned spectrum is not present anymore */
    let smoothingType;
    switch (smoothedSpectrum.SpectrumType) {
        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
            smoothingType = BY_SEGMENTS;
            break;

        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:
            smoothingType = BY_WHOLE_SPECTRUM;
            break;
    }
    setMetroUIButtonEnabled(`smoothing${smoothingType}ButtonSave`, false);
    setMetroUIButtonEnabled(`smoothing${smoothingType}ButtonRemove`, false);

    /* refresh legend, if opened */
    refreshCharmsLegend();

    /* hide selected spectra for improving visualization */
    hideSpectraToBeHidden();

    /* set text of cloud icon */
    setCloudTextAndIconStatus(SPECTRUM_TYPE_ALIGNED, false);
    await callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(smoothedSpectrum.Name, smoothedSpectrum.SpectrumType);
}
var SERIES_HIGHLIGHTENED_BAND = 'highlightenedBandSeries'
var SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT = 'highlightenedBandSeriesMaxValuePoint';
var SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT = 'highlightenedBandSeriesMinValuePoint';

var SERIES_BAND_CENTER = 'BandCenterSeries';
var SERIES_BAND_CENTER_POINT = 'BandCenterSeriesPoint';

var SERIES_FWHM = 'FwhmSeries';
var SERIES_FWHM_POINT = 'FwhmSeriesPoint';

var SERIES_NORMAL_FIT = 'NormalFitSeries'
var SERIES_NORMAL_FIT_POINT = 'NormalFitPoint';

var SERIES_INVERTED_BAND = 'InvertedBandSeries';
var SERIES_INVERTED_BAND_POINT = 'InvertedBandSeriesPoint';

var lastSelectedSegmentForBand;

var isBandDepthCharmsOpened = false;
var fitPoints;

var bandAnalysis = {
    id: 0,
    boundaries: [],
    area: 0,
    center: 0,
    depth: 0,
    fwhmResult: null,
    isEvaluated: false,
    isSaved: false
}

var bandsAnalysisData;

async function startBandAnalysisProcedureAsync(x0, x1) {
    /* retrieve available analysis data, if present */
    getBandsAnalysisDataAsync();

    /* start retrieving info for evaluating bands analysis data */
    let segmentForFitting = segmentsForFitting.find(s => s.P0.P.X <= x0 && s.P1.P.X >= x1);

    /* if no existing segment in segmentsForFitting is found, no action is required */
    if (!segmentForFitting)
        return;

    /* if we're dealing with the same band, no action is required */
    if (lastSelectedSegmentForBand && segmentForFitting.P0.P.X == lastSelectedSegmentForBand.P0.P.X && segmentForFitting.P1.P.X == lastSelectedSegmentForBand.P1.P.X)
        return;

    /* let's find the series name */
    let spectrum = getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (!spectrum)
        return;

    let seriesIndex = findChartSeriesIndexByValueFieldId(spectrum.Id);
    if (seriesIndex == -1)
        return;

    setLoadingCircleIsVisible(true);

    let series = chartSeries[seriesIndex];

    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);

    /* if a band is already highlightened, remove it */
    if (lastSelectedSegmentForBand)
        removeHighlightenedBand(items);

    /* save current segment */
    lastSelectedSegmentForBand = segmentForFitting;

    /* highlight the selected band */
    await highlightBandAsync(series.name, segmentForFitting, items);

    /* calculate band-depth parameters */
    await executeBandAnalysisProcedureAsync();

    setLoadingCircleIsVisible(false);
}

async function executeBandAnalysisProcedureAsync() {
    if (!isBandDepthCharmsOpened)
        await showBandAnalysisPanelAsync();

    await executeBandAnalysisAsync();

    isBandDepthCharmsOpened = true;
}

/* ################################################################################ */
/* SHOW/HIDE BAND DEPTH PANEL */
/* ################################################################################ */
async function hideBandAnalysisPanelAsync() {
    await animateCSSAsync('charmsBandAnalysisMainPanel', 'fadeOut', FASTER);
    hideByClass('charmsBandAnalysisMainPanel');

    showByClass('charmsSpectraProcessingMainPanel');
    await animateCSSAsync('charmsSpectraProcessingMainPanel', 'fadeIn', FASTER);

    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);

    /* remove previous analysis and UI items, if available */
    clearBandAnalysisProcedure(items);
}

async function showBandAnalysisPanelAsync() {
    await animateCSSAsync('charmsSpectraProcessingMainPanel', 'fadeOut', FASTER);
    hideByClass('charmsSpectraProcessingMainPanel');

    showByClass('charmsBandAnalysisMainPanel');
    await animateCSSAsync('charmsBandAnalysisMainPanel', 'fadeIn', FASTER);
}

/* ################################################################################ */
/* BAND DEPTH */
/* ################################################################################ */
async function executeBandAnalysisAsync() {
    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);

    /* remove previous analysis and UI items, if available */
    clearBandAnalysisProcedure(items);

    /* find points in range selected by the highlightened band */
    let seriesPoints = dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED)));
    let pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), lastSelectedSegmentForBand.P0.P.X, lastSelectedSegmentForBand.P1.P.X);

    /* extract y values from points */
    let pointsInRangeXValues = pointsInRange.map(p => p.X);
    let pointsInRangeYValues = pointsInRange.map(p => p.Y);

    /* find the min value of the continuum-removed points in the selected range */
    let selectedRangeXMin = Math.min(...pointsInRangeXValues);
    let selectedRangeXMax = Math.max(...pointsInRangeXValues);

    /* show current band boundaries */
    $('#bandAnalysisBandBoundariesMinValue').text(selectedRangeXMin);
    $('#bandAnalysisBandBoundariesMaxValue').text(selectedRangeXMax);

    saveBandBoundaries([selectedRangeXMin, selectedRangeXMax]);

    /* calculate values that fit the input values */
    let fitResult = await window.dotNetHelper.invokeMethodAsync("getAbsorptionBandGaussianFit",
        pointsInRangeXValues,
        pointsInRangeYValues);

    /* retrieve values for next calculations */
    let wavelength = parseInt(fitResult.μ);

    let bandCenter = pointsInRange.find(p => p.X == wavelength);

    //console.log(`μ: ${fitResult.μ}, σ: ${fitResult.σ}`);
    /* 2.0) show band center */
    setBandCenter(parseFloat(fitResult.μ));

    /* 2.1) show band center on chart */
    showBandCenterOnChart(items, wavelength, bandCenter);

    //let invertedYValues = invertYValuesBottomToTop(yValues);
    //showInvertedBand(items, xValues, invertedYValues);

    showGaussianFit(items, pointsInRangeXValues, pointsInRangeYValues, fitResult);

    /* 3) band depth */
    let bandDepth = evaluateBandDepth(wavelength, bandCenter);

    let fitPointsYValues = fitPoints.map(p => p.Y);

    /* 4) band area */
    evaluateBandAreaAsync(pointsInRangeXValues, fitPointsYValues);

    /* 5) fwhm of spectrum selected band */
    evaluateFwhmAsync(items, pointsInRangeXValues, pointsInRangeYValues, bandCenter.X, bandDepth);

    /* reset visual range to make ref whites appear in chart */
    dxChartResetVisualRange(chartContainer);

    enableByClassElem('bandAnalysisDataButtonSave');

    /* set isEvaluated value */
    saveIsEvaluated(true);
}

async function evaluateBandAreaAsync(xs, ys) {
    let area = await window.dotNetHelper.invokeMethodAsync("evaluateBandArea",
        xs,
        ys);

    setBandArea(parseFloat(area));
}

function evaluateBandDepth(wavelength, bandCenter) {
    /* retrieve the point on fittedPoints corresponding to the band center */
    let bandCenterFittedPoint = fitPoints.find(p => p.X == wavelength);

    let bandDepth = bandCenterFittedPoint.Y - bandCenter.Y;
    setBandDepth(bandDepth);

    return bandDepth;
}

async function evaluateFwhmAsync(items, xs, ys, bandCenterX, bandDepth) {
    let fwhmResult = await window.dotNetHelper.invokeMethodAsync("evaluateFwhm",
        xs,
        ys,
        bandCenterX,
        bandDepth);

    if (!fwhmResult)
        return;

    setFwhm(fwhmResult);

    showFwhm(items, fwhmResult.leftMargin, fwhmResult.rightMargin)
}

async function rebuildFwhmAsync(items, xs, ys, fwhmLeftMargin, fwhmRightMargin) {
    let fwhmResult = await window.dotNetHelper.invokeMethodAsync("rebuildFwhm",
        xs,
        ys,
        fwhmLeftMargin,
        fwhmRightMargin);

    if (!fwhmResult)
        return;

    setFwhm(fwhmResult);

    showFwhm(items, fwhmResult.leftMargin, fwhmResult.rightMargin);
}

function setBandArea(bandArea) {
    setTextField('bandAnalysisBandAreaValue', bandArea.toFixed(3));

    saveBandArea(bandArea);
}

function setBandCenter(bandCenterX) {
    setTextField('bandAnalysisBandCenterValue', bandCenterX.toFixed(3));
    showByClass('bandAnalysisBandCenterUnit');

    saveBandCenter(bandCenterX);
}

function setBandDepth(bandDepth) {
    setTextField('bandAnalysisBandDepthValue', parseFloat(bandDepth).toFixed(3));

    saveBandDepth(bandDepth);
}

function setFwhm(fwhmResult) {
    setTextField('bandAnalysisBandFwhmValue', fwhmResult.fwhm);
    showByClass('bandAnalysisBandFwhmUnit');

    saveBandFwhm(fwhmResult);
}

function showBandCenterOnChart(items, wavelength, bandCenter) {
    setPointOnChart(items, wavelength, bandCenter.Y, SERIES_BAND_CENTER_POINT);

    let bandCenterSeries = createSeriesFromSpectrumName(SERIES_BAND_CENTER_POINT, SERIES_BAND_CENTER, '#9933ff', true, true);
    bandCenterSeries.point.size = 12;
    addChartSeries(bandCenterSeries);

    dxChartUpdateSeries(chartContainer, chartSeries);

    hideSpectraToBeHidden();
}

function showGaussianFit(items, xValues, yValues, fitResult) {
    let invertedYValues = invertYValuesBottomToTop(yValues);

    let yValuesYMax = Math.max(...yValues);
    let fixedFitResultYValues = [];

    let invertedYValuesNum = invertedYValues.length;
    for (var i = 0; i < invertedYValuesNum; i++) {
        fixedFitResultYValues[i] = yValuesYMax + fitResult.yValues[i];
    }

    let updatedFixedFitResultYValues = updateSegmentYRange(invertedYValues, fixedFitResultYValues);

    let invertedFitResultYValues = [];
    for (var i = 0; i < invertedYValuesNum; i++) {
        invertedFitResultYValues[i] = yValuesYMax - Math.abs(updatedFixedFitResultYValues[i] - yValuesYMax);
    }

    dxChartBeginUpdate(chartContainer);

    let xValuesNum = xValues.length;
    for (var i = 0; i < xValuesNum; i++) {
        let index = items.findIndex(p => p.X == xValues[i]);
        if (index > -1) {
            items[index][SERIES_NORMAL_FIT_POINT] = invertedFitResultYValues[i];
        }
    }

    let normalFitSeries = createSeriesFromSpectrumName(SERIES_NORMAL_FIT_POINT, SERIES_NORMAL_FIT, '#9933ff', true, false);
    addChartSeries(normalFitSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    hideSpectraToBeHidden();
}

function showFwhm(items, leftMargin, rightMargin) {
    dxChartBeginUpdate(chartContainer);

    let indexLeftMargin = items.findIndex(p => p.X == leftMargin.X);
    if (indexLeftMargin > -1)
        items[indexLeftMargin][SERIES_FWHM_POINT] = leftMargin.Y;

    let indexRightMargin = items.findIndex(p => p.X == rightMargin.X);
    if (indexRightMargin > -1)
        items[indexRightMargin][SERIES_FWHM_POINT] = rightMargin.Y;

    let fwhmSeries = createSeriesFromSpectrumName(SERIES_FWHM_POINT, SERIES_FWHM, '#9933ff', false, false);
    addChartSeries(fwhmSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    hideSpectraToBeHidden();
    dxChartResetVisualRange(chartContainer);
}

// ONLY FOR DEVELOP
function showInvertedBand(items, xValues, invertedYValues) {
    dxChartBeginUpdate(chartContainer);

    let xValuesNum = xValues.length;
    for (var i = 0; i < xValuesNum; i++) {
        let index = items.findIndex(p => p.X == xValues[i]);
        if (index > -1) {
            items[index][SERIES_INVERTED_BAND_POINT] = invertedYValues[i];
        }
    }

    let invertedBandSeries = createSeriesFromSpectrumName(SERIES_INVERTED_BAND_POINT, SERIES_INVERTED_BAND, '#9933ff', true, false);
    addChartSeries(invertedBandSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    hideSpectraToBeHidden();
}

/* -------------------------------------------------------------------------------- */
/* CLEAR BAND ANALYSIS */
/* -------------------------------------------------------------------------------- */
function clearBandAnalysisProcedure(items) {
    disableByClassElem('bandAnalysisDataButtonSave');

    clearBandCenter(items);

    clearBandAnalysisNormalFit(items);

    clearFwhm(items);

    clearTextFields();

    hideSpectraToBeHidden();
}

function clearBandAnalysisNormalFit(items) {
    /* remove gaussian fit points */
    let itemsFitNormal = dxChartGetItems(chartContainer).filter(function (item) { return Object.keys(item).includes(SERIES_NORMAL_FIT_POINT) });

    let itemsFitNormalNum = itemsFitNormal.length;

    if (itemsFitNormalNum == 0)
        return;

    dxChartBeginUpdate(chartContainer);

    for (var i = 0; i < itemsFitNormalNum; i++) {
        let index = items.findIndex(p => p.X == itemsFitNormal[i].X);
        delete items[index][SERIES_NORMAL_FIT_POINT];
    }

    /* remove chart series */
    removeChartSeriesByFieldIdProcedure(chartContainer, SERIES_NORMAL_FIT_POINT);

    dxChartEndUpdate(chartContainer);
}

function clearBandCenter(items) {
    /* remove gaussian fit points */
    let itemsBandCenter = dxChartGetItems(chartContainer).filter(function (item) { return Object.keys(item).includes(SERIES_BAND_CENTER_POINT) });

    let itemsBandCenterNum = itemsBandCenter.length;

    if (itemsBandCenterNum == 0)
        return;

    dxChartBeginUpdate(chartContainer);

    for (var i = 0; i < itemsBandCenterNum; i++) {
        let index = items.findIndex(p => p.X == itemsBandCenter[i].X);
        delete items[index][SERIES_BAND_CENTER_POINT];
    }

    /* remove chart series */
    removeChartSeriesByFieldIdProcedure(chartContainer, SERIES_BAND_CENTER_POINT);

    dxChartEndUpdate(chartContainer);
}

function clearFwhm(items) {
    /* remove gaussian fit points */
    let itemsFwhm = dxChartGetItems(chartContainer).filter(function (item) { return Object.keys(item).includes(SERIES_FWHM_POINT) });

    let itemsFwhmNum = itemsFwhm.length;

    if (itemsFwhmNum == 0)
        return;

    dxChartBeginUpdate(chartContainer);

    for (var i = 0; i < itemsFwhmNum; i++) {
        let index = items.findIndex(p => p.X == itemsFwhm[i].X);
        delete items[index][SERIES_FWHM_POINT];
    }

    /* remove chart series */
    removeChartSeriesByFieldIdProcedure(chartContainer, SERIES_FWHM_POINT);

    dxChartEndUpdate(chartContainer);
}

function clearTextFields() {
    setTextField('bandAnalysisBandCenterValue', '-');
    setTextField('bandAnalysisBandFwhmValue', '-');
    setTextField('bandAnalysisBandDepthValue', '-');
    setTextField('bandAnalysisBandAreaValue', '-');

    hideByClass('bandAnalysisBandFwhmUnit');
    hideByClass('bandAnalysisBandCenterUnit');
}

/* ################################################################################ */
/* MANAGE BAND ANALYSIS OBJECT */
/* ################################################################################ */
function saveBandArea(bandArea) {
    bandAnalysis.area = bandArea;
}

function saveBandBoundaries(boundaries) {
    bandAnalysis.boundaries = boundaries;
}

function saveBandCenter(bandCenter) {
    bandAnalysis.center = bandCenter;
}

function saveBandDepth(bandDepth) {
    bandAnalysis.depth = bandDepth;
}

function saveBandFwhm(fwhmResult) {
    bandAnalysis.fwhmResult = fwhmResult;
}

function saveIsEvaluated(isEvaluated) {
    bandAnalysis.isEvaluated = isEvaluated;
}

/* ################################################################################ */
/* BAND HIGHLIGHTENING */
/* ################################################################################ */
function initLastSelectedSegmentForBand() {
    lastSelectedSegmentForBand = null;
}

async function highlightBandAsync(seriesName, segmentForFitting, items) {
    /* retrieve (continuum-removed) series points between the 2 points which define the band  */
    let seriesPoints = dxChartGetSeriesPoints(chartContainer, seriesName);
    let pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), segmentForFitting.P0.P.X, segmentForFitting.P1.P.X);

    /* extract the x values */
    let xArray = pointsInRange.map(p => { return p.X });

    /* extract the y values of the points belonging to the band */
    let minValArray = pointsInRange.map(p => { return p.Y });

    /* retrieve y values along the line connecting the 2 points which define the band */
    let processingResult = await window.dotNetHelper.invokeMethodAsync("fitSegmentAsync",
        pointsInRange,
        fitFunctions[0]); //fitFunctions[0] is 'linear fit'. DO NOT CHANGE IT SINCE WE WANT TO HIGHLIGHT BAND BY FILLING AREA
    let maxValArray = processingResult.Points.map(p => { return p.Y });

    /* save fitted points in memory */
    fitPoints = processingResult.Points;

    dxChartBeginUpdate(chartContainer);

    let seriesPointsNum = seriesPoints.length;
    for (var i = 0; i < seriesPointsNum; i++) {
        let index = items.findIndex(p => p.X == xArray[i]);
        if (index > -1) {
            items[index][SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT] = minValArray[i];
            items[index][SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT] = maxValArray[i];
        }
    }

    let bandSeries = {
        type: 'rangeArea',
        argumentField: 'X',
        rangeValue1Field: SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT,
        rangeValue2Field: SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT,
        name: SERIES_HIGHLIGHTENED_BAND,
        axis: 'valueAxis',
        color: '#ff00ff',
        showInLegend: false
    };
    addChartSeries(bandSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    hideSpectraToBeHidden();

    dxChartResetVisualRange(chartContainer);
}

function removeHighlightenedBand(items) {
    let pointsInRange = items.filter(p => p.X >= lastSelectedSegmentForBand.P0.P.X && p.X <= lastSelectedSegmentForBand.P1.P.X);

    dxChartBeginUpdate(chartContainer);

    let pointsInRangeNum = pointsInRange.length;
    for (var i = 0; i < pointsInRangeNum; i++) {
        let index = items.findIndex(p => p.X == pointsInRange[i].X);
        if (index > -1) {
            delete items[index][SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT];
            delete items[index][SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT];
        }
    }

    removeChartSeriesByNameProcedure(chartContainer, SERIES_HIGHLIGHTENED_BAND);

    dxChartEndUpdate(chartContainer);

    dxChartResetVisualRange(chartContainer);

    hideSpectraToBeHidden();

    /* reset visual range to make ref whites appear in chart */
    //dxChartResetVisualRange(chartContainer);
}

/* called when continuum-removed is deleted  */
function removeHighlightenedBandProcedure() {
    if (!lastSelectedSegmentForBand)
        return;

    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);

    removeHighlightenedBand(items);

    initLastSelectedSegmentForBand();
}

/* ################################################################################ */
/* RETRIEVE BAND ANALYSIS DATA LIST */
/* ################################################################################ */
async function getBandsAnalysisDataAsync() {
    let model = {
        FileId: selectedSpectrumForProcessingId,
    };

    let obj = await doAjaxGetAsync(UrlGetBandsAnalysisData, model);
    if (obj && obj.IsOk) {
        bandsAnalysisData = obj.ResponseObject;

        buildListOfAvailableBandsAnalysisData(obj.ResponseObject);
    }
}

function buildListOfAvailableBandsAnalysisData(listObj) {
    let bandsNum = listObj.length;

    if (bandsNum == 0)
        return;

    let html = ``;
    html += `<div class="margin-horizontal-8 margin-vertical-8">`;
    for (var i = 0; i < bandsNum; i++) {
        html += `<div class="margin-vertical-4">`;
        html += `<span class="mif-file-download fg-white pointer margin-right-8" onclick="${downloadBandAnalysisDataProcedure.name}(${listObj[i].Id})" title="${BandAnalysisDownloadBandsAnalysisLabel}"></span>&nbsp;<span>[</span><span>${listObj[i].LeftBoundary}</span>,&nbsp;<span>${listObj[i].RightBoundary}</span><span>]</span>`;
        html += `</div>`;
    }
    html += `</div>`;

    $('#bandsAnalysisDataList').html(html);
}

/* ################################################################################ */
/* DOWNLOAD SELECTED BAND ANALYSIS DATA */
/* ################################################################################ */
function downloadBandAnalysisDataProcedure(id) {
    if (bandAnalysis.isEvaluated)
        askAndExecuteWithTimeout(BandAnalysisManagementLabel, BandAnalysisReplaceBandsAnalysisQuestion, downloadBandAnalysisDataAsync, [id], 400);
    else
        downloadBandAnalysisDataAsync(id);
}

async function downloadBandAnalysisDataAsync(id) {
    setLoadingCircleIsVisible(true);

    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);
    clearBandAnalysisProcedure(items);

    dxChartResetVisualRange(chartContainer);

    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetBandAnalysisData, model);
    if (obj && obj.IsOk) {
        saveBandBoundaries([obj.ResponseObject[0].LeftBoundary, obj.ResponseObject.RightBoundary]);
        setBandCenter(obj.ResponseObject[0].BandCenterX);
        setBandDepth(obj.ResponseObject[0].BandDepth);
        setBandArea(obj.ResponseObject[0].BandArea);

        /* find points in range selected by the highlightened band */
        let seriesPoints = dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED)));
        let pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), obj.ResponseObject[0].LeftBoundary, obj.ResponseObject[0].RightBoundary);

        /* extract y values from points */
        let pointsInRangeXValues = pointsInRange.map(p => p.X);
        let pointsInRangeYValues = pointsInRange.map(p => p.Y);

        /* calculate values that fit the input values */
        let fitResult = await window.dotNetHelper.invokeMethodAsync("getAbsorptionBandGaussianFit",
            pointsInRangeXValues,
            pointsInRangeYValues);
        showGaussianFit(items, pointsInRangeXValues, pointsInRangeYValues, fitResult);

        dxChartResetVisualRange(chartContainer);

        /* build-up fwhm starting from retrieved data */
        await rebuildFwhmAsync(items,
            pointsInRangeXValues,
            pointsInRangeYValues,
            obj.ResponseObject[0].FwhmLeftMargin,
            obj.ResponseObject[0].FwhmRightMargin);

        /* 2.1) show band center on chart */
        let wavelength = parseInt(obj.ResponseObject[0].BandCenterX);

        let bandCenter = pointsInRange.find(p => p.X == wavelength);

        /* show band center */
        showBandCenterOnChart(items, wavelength, bandCenter);

        dxChartResetVisualRange(chartContainer);

        hideSpectraToBeHidden();

        setLoadingCircleIsVisible(false);
    }
}
/* ################################################################################ */
/* SAVE BAND ANALYSIS DATA */
/* ################################################################################ */
async function saveBandAnalysisDataProcedureAsync() {
    setLoadingCircleIsVisible(true);

    let model = {
        FileId: selectedSpectrumForProcessingId,
        LeftBoundary: bandAnalysis.boundaries[0],
        RightBoundary: bandAnalysis.boundaries[1],
    };

    let isResponseOk = true;

    let obj = await doAjaxPostAsync(UrlIsBandOverlappingWithExistingOne, model);
    if (obj) {
        if (!obj.BoolValue)
            await saveBandAnalysisDataAsync();
        else
            askAndExecute(BandAnalysisManagementLabel, BandAnalysisCheckOverlapQuestion, saveBandAnalysisDataAsync);
    }
    else
        isResponseOk = false;

    setLoadingCircleIsVisible(false);

    if (!isResponseOk)
        showSimpleDialog(ERROR_LABEL, BandAnalysisCheckOverlapErrorMessage, ALERT);
}

async function saveBandAnalysisDataAsync() {

    setLoadingCircleIsVisible(true);

    let model = {
        Id: 0,
        FileId: selectedSpectrumForProcessingId,
        LeftBoundary: bandAnalysis.boundaries[0],
        RightBoundary: bandAnalysis.boundaries[1],
        BandArea: bandAnalysis.area,
        BandCenter: bandAnalysis.center,
        BandDepth: bandAnalysis.depth,
        FwhmLeftMargin: bandAnalysis.fwhmResult.leftMargin.X,
        FwhmRightMargin: bandAnalysis.fwhmResult.rightMargin.X,
    }

    let isSavingOk = true;

    let obj = await doAjaxPostAsync(UrlSaveBandAnalysisData, model);
    if (obj) {
        if (obj.IsOk) {
            bandAnalysis.id = obj.Id;
            bandAnalysis.isSaved = true;
        } else
            isSavingOk = false;
    } else
        isSavingOk = false;

    setLoadingCircleIsVisible(false);

    if (isSavingOk)
        showSimpleDialog(INFO_LABEL, BandAnalysisSaveSuccessMessage, SUCCESS);
    else
        showSimpleDialog(ERROR_LABEL, BandAnalysisSaveErrorMessage, ALERT);
}