var chart;
var chartContainer;

var chartConstantLines;

var spectraInfo = [];
var spectraTree = [];
var spectraTypeColors = [];
var isChartLoaded = false;

var MIN_Y = 'minY';
var MAX_Y = 'maxY';

var backToSearchButtonId = 'buttonBackToSearch';
var backClearToSearchButtonId = 'buttonBackClearToSearch';
var openCharmsButtonId = 'buttonOpenCharms'

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
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    createChartsProcedureCaller();
});

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