var chart;
var chartContainer;

var chartMagnifier;
var chartMagnifierContainer;

var chartConstantLines;

var points = [];

var spectraInfo = [];
var spectraTree = [];
var spectraTypeColors = [];
var isChartLoaded = false;

var MIN_Y = 'minY';
var MAX_Y = 'maxY';

var VALUE_AXIS = 'valueAxis';

var targetPointer;

var backToSearchButtonId = 'buttonBackToSearch';
var enlargeButtonId = 'buttonEnlarge';
var enterFullScreenButtonId = 'buttonEnterFullScreen';
var exitFullScreenButtonId = 'buttonExitFullScreen';
var openProcessSpectraCharmsButtonId = 'buttonOpenCharms'

const palette = [
    '#3F51B5', // 1. Indigo (Primary)
    '#E91E63', // 2. Pink (Secondary)
    '#009688', // 3. Teal
    '#FF9800', // 4. Orange
    '#9C27B0', // 5. Purple
    '#4CAF50', // 6. Green
    '#00BCD4', // 7. Cyan
    '#FF5722', // 8. Deep Orange
    '#673AB7', // 9. Deep Purple
    '#8BC34A', // 10. Light Green
    '#2196F3', // 11. Blue
    '#FFC107', // 12. Amber
    '#795548', // 13. Brown
    '#03A9F4', // 14. Light Blue
    '#CDDC39', // 15. Lime
    '#607D8B', // 16. Blue Grey
    '#E040FB', // 17. Accent Purple
    '#00E676', // 18. Accent Green
    '#FF4081', // 19. Accent Pink
    '#FFD740'  // 20. Accent Amber
];

/* ################################################################################ */
/* BUTTONS */
/* ################################################################################ */
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

/* ---------- ENTER FULL-SCREEN ---------- */
function addEnterFullScreenButton() {
    addButton(enterFullScreenButtonId, ButtonEnterFullScreenLabel, 'mif-enlarge', enterFullScreen);
}

function removeEnterFullScreenButtonProcedure() {
    if (!isButtonAvailable(enterFullScreenButtonId))
        return;

    animateCSS(`${enterFullScreenButtonId}`, `bounceOutUp`, FAST, removeEnterFullScreenButton);
}

function removeEnterFullScreenButton() {
    $(`#${enterFullScreenButtonId}`).remove();
}

/* ---------- EXIT FULL-SCREEN ---------- */
function addExitFullScreenButton() {
    addButton(exitFullScreenButtonId, ButtonExitFullScreenLabel, 'mif-shrink', exitFullScreen);
}

function removeExitFullScreenButtonProcedure() {
    if (!isButtonAvailable(exitFullScreenButtonId))
        return;

    animateCSS(`${exitFullScreenButtonId}`, `bounceOutUp`, FAST, removeExitFullScreenButton);
}

function removeExitFullScreenButton() {
    $(`#${exitFullScreenButtonId}`).remove();
}

/* ################################################################################ */
/* BACK TO SEARCH */
/* ################################################################################ */
function backToSearchProcedure() {
    navigateTo(UrlHub);
}

function createChartsProcedure() {
    setMenuCollapsed();

    executeAfter(loadChartsProcedureAsync, 500);
}

function createChartsProcedureCaller() {
    if (isChartLoaded)
        showDialogWithActions(WARNING_LABEL, ChartOverwriteQuestion, WARNING, YES_LABEL, NO_LABEL, createChartsProcedure);
    else
        createChartsProcedure();
}

/* ################################################################################ */
/* CHARTS */
/* ################################################################################ */
function disposeChart() {
    if (!isChartLoaded)
        return;

    if (chart) {
        chart.dispose();
        chart = null;
    }
    $(chartContainer).empty();
    isChartLoaded = false;
}

async function loadChartsProcedureAsync() {
    manageNavigation();

    if (await loadSpectraTypeColorsAsync()) {
        if (await isPublicOrAuthorizedAsync())
            /* load data and show charts */
            loadChartsFromCloudAsync();
        else
            loadChartsFromSessionStorage();
    } else
        loadPartialViewWithAjaxGetNoModel(UrlLoadChartError, 'charts');
}

/* load spectra from cloud */
async function loadChartsFromCloudAsync() {
    setLoadingCircleIsVisible(true);

    let isOk = true;

    try {
        var model = {
            Ids: selectedSpectra
        };
        //console.log(selectedSpectra);

        let obj = await doAjaxPostAsync(UrlGetSpectra, model);
        if (obj) {
            //console.log(obj);
            spectraInfo = obj.SpectraInfo;
            points = obj.Points;
            const chartSeries = createSeriesFromPoints(obj.Points);
            createChart(obj.Points, chartSeries, obj.AxisRange);
            isChartLoaded = true;
            setLoadingCircleIsVisible(false);
        } else
            isOk = false;
    } catch (e) {
        isOk = false;
        console.log(`${loadChartsFromCloudAsync.name} - ex: ${e}`);
    }

    if (!isOk) {
        setLoadingCircleIsVisible(false);
        isChartLoaded = false;
        addClass('charts', 'no-spectra-background');
        showSimpleDialog(ERROR_LABEL, NoSpectraFoundForSelectedIdsMessage, ALERT);
    }
}

/* load spectra from sessionStorage */
function loadChartsFromSessionStorage() {
    let items = getItemsFromSessionStorage(STORAGE_ITEM);

    if (!items || items.length == 0)
        return;

    setLoadingCircleIsVisible(true);

    try {
        let points = [];

        let itemsNum = items.length;
        for (var i = 0; i < itemsNum; i++) {
            let values = parseItemToSpectrum(items[i]);
            let valuesNum = values.length;
            for (var j = 0; j < valuesNum; j++) {
                let foundPoint = points.find(p => p.X == values[j].X);
                if (foundPoint) {
                    let index = points.indexOf(foundPoint);
                    let keysFiltrate = Object.keys(values[j]).filter(key => key != 'X');
                    points[index][keysFiltrate[0]] = values[j][keysFiltrate[0]];
                } else {
                    points.push(values[j]);
                }
            }
        }

        /* retrieve x values for extracting min and max values */
        const xValues = points.map(point => point.x);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const axisRange = { Axis: 1, Min: minX, Max: maxX };

        //console.log(points);
        const chartSeries = createSeriesFromPoints(points);

        createChart(points, chartSeries, axisRange);
        isChartLoaded = true;
    } catch (e) {
        isChartLoaded = false;
        addClass('charts', 'no-spectra-background');
        showSimpleDialog(ERROR_LABEL, NoSpectraFoundForSelectedIdsMessage, ALERT);
    }

    setLoadingCircleIsVisible(false);
}

function createChart(points, series, axisRange) {
    let size = calculateChartSize();

    /* dispose existant chart, avoiding issues with zoom when recreating */
    disposeChart();

    /* translate the DevExtreme series/points shape into ECharts series data */
    const echartsSeries = createEchartSeries(series, points);

    chart = echarts.init(chartContainer[0], null, { renderer: "canvas" });
    chartContainer.css({ height: size.h, width: size.w });

    chart.setOption({
        animation: false,
        grid: {
            containLabel: true,
            top: 30,
            right: 70,
            bottom: 90,
            left: 60
        },
        xAxis: {
            type: "value",
            name: ChartWavelengthsLabel,
            nameLocation: "middle",
            nameGap: 35,
            splitNumber: 10,
            minorTick: { show: true },
            splitLine: { show: true },
            minorSplitLine: { show: true },
            axisLabel: {
                rotate: 45,
                formatter: function (value) { return parseFloat(value); }
            }
        },
        yAxis: {
            type: "value",
            name: ChartReflectanceLabel,
            nameLocation: "middle",
            nameGap: 45,
            min: function (value) {
                return value.min * 0.98; // 2% sotto
            },
            max: function (value) {
                return value.max * 1.02; // 2% sopra
            },
            axisLabel: {
                formatter: v => parseFloat(v.toFixed(6))
            },
            scale: true,
            splitLine: { show: true },
            minorSplitLine: { show: true }
        },
        graphic: [
            {
                type: 'text',
                left: 'center',
                bottom: 40,
                style: {
                    text: `⇆ ${ZoomHorizontalScroller}`,
                    fontSize: 16,
                    fill: '#444'
                }
            },
            {
                type: 'text',
                right: 40,
                top: 'middle',
                rotation: -Math.PI / 2,
                style: {
                    text: `⇆ ${ZoomVerticalScroller}`,
                    fontSize: 16,
                    fill: '#444',
                }
            }
        ],
        axisPointer: {
            show: true
        },
        dataZoom: [
            // X only
            { type: "inside", xAxisIndex: 0, filterMode: "none", zoomOnMouseWheel: true, moveOnMouseMove: "shift" },
            { type: "slider", xAxisIndex: 0, bottom: 10 },

            // Y only
            { type: "inside", yAxisIndex: 0, filterMode: "none", zoomOnMouseWheel: false, moveOnMouseMove: false },
            { type: "slider", yAxisIndex: 0, right: 10 }
        ],
        toolbox: {
            show: true,
            feature: {
                saveAsImage: {}
            }
        },
        legend: {
            show: false
        },
        /* interactivity options */
        tooltip: {
            show: true,
            trigger: "item",
            confine: true,
            formatter: function (params) {
                if (!params) return;

                // trigger: item + axisPointer link → params è array
                const hovered = Array.isArray(params)
                    ? params.find(p => p.dataIndex === params[0].dataIndex)
                    : params;

                if (!hovered) return;

                if (hovered.seriesName === SERIES_HIGHLIGHTENED_BAND)
                    return "";

                return getTooltip(
                    hovered.seriesName,
                    hovered.data[0],
                    hovered.data[1]
                );
            }
        },
        series: echartsSeries
    });

    const resizeObserver = new ResizeObserver(() => {
        let size = calculateChartSize();
        chartContainer.css({ height: size.h, width: size.w });
        chart.resize();
    });
    resizeObserver.observe(chartContainer[0]);

    /* events */
    chart.on("rendered", function () {
        initJoystickController(); // defined in joystick.js
        resetVisualRange();
    });

    chart.on("click", function (evt) {
        if (evt.componentType != "series")
            return;

        if (isPointClickForFitEnabled) {
            let x = parseInt(evt.value[0]);
            let y = parseFloat(evt.value[1]);
            let point = createSimplePoint(x, y);

            let valueField = chart.getOption().series[evt.seriesIndex].valueField;

            let mousePosX = evt.event.event.clientX;
            let mousePosY = evt.event.event.clientY;
            //console.log(`onPointClick - ${mousePosX}, ${mousePosY}`);

            addOrRemoveSelectedPointForFittingProcedure(valueField, point, mousePosX, mousePosY);
        }
    });

    chart.on("dataZoom", function () {
        const currentDataZoom = chart.getOption().dataZoom[0];
        const zoomFactor = (currentDataZoom.end - currentDataZoom.start) / 100;
        manageZoom({ zoomFactor: zoomFactor });
    });


    /* free memory */
    points = 0;
}

function updateChartSize() {
    initPageDims();

    let w = pageW;
    let h = pageH;
    if (isCharmsProcessSpectraOpen()) {
        w = (pageW - CHARMS_WIDTH);
        h = (pageH - APPBAR_HEIGHT);
    }

    $('#charts').css({
        width: `${w}px`,
        height: `${h}px`
    });
}

/* -------------------------------------------------------------------------------- */
/* ---------- CHARTS ANCILLARY ---------- */
/* -------------------------------------------------------------------------------- */
function buildId(id) {
    if (isNumber(id))
        return `id${id}`;
    else
        return id;
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

function calculateChartSize() {
    if (isMobile())
        return { h: '90%', w: '90%' };
    else
        return { h: '80%', w: '100%' };
}

function createEchartSeries(series, points, customOptions) {
    const seriesArray = Array.isArray(series) ? series : [series];
    const safePoints = Array.isArray(points) ? points : [];
    const opts = customOptions || {};

    return seriesArray.map(function (s) {
        const isScatter = opts.type === "scatter";

        return {
            name: s.name,
            valueField: s.valueField,
            type: opts.type || "line",
            showSymbol: true,
            symbol: opts.symbol || "circle",
            symbolSize: opts.symbolSize || 3,
            // color: scatter uses customOptions, line uses s.color
            color: isScatter ? (opts.color || s.color) : s.color,
            // lineStyle only for line
            lineStyle: isScatter ? undefined : { color: s.color },
            // itemStyle only for scatter, line uses lineStyle
            itemStyle: isScatter
                ? (opts.itemStyle || { color: opts.color || s.color })
                : { color: s.color },
            emphasis: { focus: "series" },
            data: safePoints
                .filter(point => point[s.valueField] !== undefined && point[s.valueField] !== null)
                .map(point => [point.X, point[s.valueField]]),
        };
    });
}

function createSeries(key, name, axisName, color, point = null) {
    return {
        valueField: key,
        name: name,
        axis: axisName,
        color: color,
        point: point
    };
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
        if (isNaN(keyId)) // for local spectra used by unauthenticated users
            keyId = keys[i];
        var index = getSpectrumIndexBySpectrumId(keyId);
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
            axis: VALUE_AXIS,
            color: color,
        });
    }

    return series;
}

function createSeriesFromPoints(points) {
    var series = [];

    let ids = [];

    let lastRawColor;
    let foundRawSpectra = 0;

    let paletteCounter = 0;

    let pointsNum = points.length;
    for (var i = 0; i < pointsNum; i++) {
        let point = points[i];
        let keys = Object.keys(point);
        let keysNum = keys.length;
        for (var j = 0; j < keysNum; j++) {

            if (!keys[j].startsWith('id'))
                continue;

            if (ids.indexOf(keys[j]) == -1) {
                ids.push(keys[j]);
                let keyId = getIdValue(keys[j]);
                if (isNaN(keyId)) // for local spectra used by unauthenticated users
                    keyId = keys[j];
                var index = getSpectrumIndexBySpectrumId(keyId);
                let name = getSpectrumSeriesNameFromIndex(index);
                let color = getSpectrumTypeColor(getSpectrumTypeString(spectraInfo[index].SpectrumType));

                let isRaw = spectraInfo[index].SpectrumType == SPECTRUM_TYPE_RAW;
                if (isRaw && foundRawSpectra == 0) {
                    lastRawColor = color;
                    foundRawSpectra++;
                }

                if (i > 0 && isRaw) {
                    /* create a slight differentiation in colors of multiple RAW spectra */
                    //color = lightenDarkenColor(lastRawColor, 30); // defined in common.js
                    //spectraInfo[index].Color = color;
                    lastRawColor = color; // remember the last RAW color for using it the next time
                    foundRawSpectra++;
                }

                series.push(createSeries(keys[j], name, VALUE_AXIS, palette[paletteCounter]));

                paletteCounter++;
            }
        }
    }

    return series;
}

function createSeriesFromSpectrumName(idItem, spectrumName, color, isPointVisible = false, showInLegend = true) {
    return {
        type: 'line',
        valueField: idItem,
        name: spectrumName,
        axis: VALUE_AXIS,
        color: color,
        point: { visible: isPointVisible },
        showInLegend: showInLegend,
        isVisible: true
    };
}

function createSeriesPoints(spectrumId, points) {
    const valueField = buildId(spectrumId);

    return points.map(p => ({
        X: p.X,
        [valueField]: p.Y   // ← nome dinamico del campo
    }));
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
function enlargeVisualRange() {
    const { minYValue, maxYValue } = getYRange();
    setVisualRange([minYValue, maxYValue]);
}

function manageZoom(evt) {
    //console.log(`manageZoom - factor: ${evt.zoomFactor}`);
    if (evt.zoomFactor != 1) {
        addZoomOutButton();
    } else {
        removeZoomButtonProcedure();
    }
}

function resetZoom() {
    resetVisualRange();
}

/* ################################################################################ */
/* FULL-SCREEN */
/* ################################################################################ */
function enterFullScreen() {
    switchFullScreenButtonsToExitFullScreen();

    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

function exitFullScreen() {
    switchFullScreenButtonsToEnterFullScreen();

    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}

function setFullScreenChangeListener() {
    $(document).on('fullscreenchange', function () {
        if (document.fullscreenElement) {
            switchFullScreenButtonsToExitFullScreen();
        } else {
            switchFullScreenButtonsToEnterFullScreen();
        }
    });
}

function switchFullScreenButtonsToEnterFullScreen() {
    removeExitFullScreenButtonProcedure();
    setTimeout(() => {
        addEnterFullScreenButton();
    }, 500);
}

function switchFullScreenButtonsToExitFullScreen() {
    removeEnterFullScreenButtonProcedure();
    setTimeout(() => {
        addExitFullScreenButton();
    }, 500);
}

/* ################################################################################ */
/* MANAGE PANELS SEARCH/CHART POSITION */
/* ################################################################################ */
function initChartPanel() {
    //console.log('top:' + position.top);
    setPositionTopRelativePx('charts', -(pageH + APPBAR_HEIGHT) / 2);
    //setPositionLeftRelativePercent('charts', '100');
    //setPositionCompleteRelativePxPercent('charts', -(pageH + APPBAR_HEIGHT) / 2, '100');
    $('#charts').height(pageH - APPBAR_HEIGHT);
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(async function () {
    echarts.registerTheme('material', {
        color: palette
    });

    navigationStatus = NAVIGATION_CREATE_CHART;

    await isAuthorizedAsync();

    /* define selected spectrum type for continuum removal */
    selectedSpectrumTypeForContinuumRemoval = SPECTRUM_TYPE_ALIGNED;

    tryHideLogoutButton();

    /* set y-overflow for page */
    setOverflowYAuto();

    /* set starting position for panels */
    initChartPanel();

    /* init array for vertical constant lines */
    initConstantLines();

    /* init chartContainer */
    chartContainer = $('#charts');

    /* init chartMagnifier, placed in joystick container */
    chartMagnifierContainer = $('#chartMagnifier');

    /* disable tab for band analysis, it will be re-enabled when continuum-removed is created */
    setTabEnabled(3, false);

    fillSelectedSpectra();

    const callback = function () {
        initPageDims();
        createChartsProcedureCaller();
    }

    showPageItems(false, callback);

    /* add listener for detecting full-screen change and manage buttons */
    setFullScreenChangeListener();

    // Center targetPointer in the middle of the 'charts' div
    var chartsDiv = $('#charts');
    if (chartsDiv.length && targetPointer.length) {
        var chartsOffset = chartsDiv.offset();
        var chartsWidth = chartsDiv.outerWidth();
        var chartsHeight = chartsDiv.outerHeight();
        var pointerWidth = targetPointer.outerWidth();
        var pointerHeight = targetPointer.outerHeight();
        var centerX = chartsOffset.left + (chartsWidth / 2) - (pointerWidth / 2);
        var centerY = chartsOffset.top + (chartsHeight / 2) - (pointerHeight / 2);
        targetPointer.css({
            left: centerX + 'px',
            top: centerY + 'px',
            position: 'absolute'
        });
    }

    /* init the joystick manager */
    initJoystickManager(); // defined in joystickManager.js
});