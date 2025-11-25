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
var FIT_SEGMENT = 'fitsegment';
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
    return await checkIsSpectrumOfTypeSavedOnCloudAsync(SPECTRUM_TYPE_CONTINUUM_REMOVED, filename);
}

async function loadFitPanelAsync(extCallback = null) {
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

            /* execute external callback */
            if (extCallback) {
                hideFitStartingMessageContainer();
                extCallback();
            }
        }
        loadPartialViewWithAjaxGetNoModel(UrlLoadFitPanel, 'fitoptions', callback);

        /* add raw spectrum to the ones to be hidden */
        if (isSLabConditionForSpectrumTypeNotHigherThanRaw()) //when a SLab RAW spectrum is loaded and under processing we hide it in this phase, otherwise avoid to hide it
            dxChartSetSeriesVisible(chartContainer, getSeriesNameFromId(selectedSpectrumForProcessingId), false);

        isFitTabSelected = true;
    }
}

function hideFitStartingMessageContainer() {
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
    /* init dictionary for ordering segmnents */
    initSegmentsDictionary();

    isFitTabSelected = false;
    isFitTabReady = false;
    setIsPointClickForFitEnabled(false);
    setJoystickVisible(false);

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

    $('#fitCheckboxCoreProMode').off(); // to avoid fire multiple times the same event
    $('#fitCheckboxCoreProMode').on('click', function (event) {
        let isChecked = isCheckboxChecked('fitCheckboxCoreProMode');

        /* set current fit mode, to manage which kind of point is added to chart */
        currentFitMode = getFitMode(isChecked);

        /* update label showing current fit mode */
        setSwitchCoreProModeLabel(isChecked);

        /* check whether any point for fitting already exists. If no point is available it's ok */
        if (isPointsForFittingArrayEmpty())
            return;

        /* if any point exists, then ask for resetting points and segment */
        let callbackYes = function () {
            tryCallEnqueueSaveSetting(FIT_SET_CORE_PRO_MODE, (isChecked ? FIT_PRO_MODE : FIT_CORE_MODE));

            /* trick to let switch button changing status on UI, without wating for in-memory operations completion  */
            setTimeout(function () {
                switch (currentFitMode) {
                    case FIT_CORE_MODE:
                        switchToCoreMode();
                        break;

                    case FIT_PRO_MODE:
                        switchToProMode();
                        break;
                }
            }, 100);
        };

        let callbackNo = function () {
            $('#fitCheckboxCoreProMode').prop('checked', !isChecked);
            setSwitchCoreProModeLabel(!isChecked);
        };

        showDialogWithActions(WARNING_LABEL, FitSwitchModeResetQuestion, WARNING, YES_LABEL, NO_LABEL, callbackYes, callbackNo);
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

        /* set switch button to the right status */
        setSwitchCoreProMode(isChecked);

        /* update label showing current fit mode */
        setSwitchCoreProModeLabel(isChecked);
    } else
        setSwitchCoreProMode(false);
}

function setSwitchCoreProMode(isChecked) {
    $('#fitCheckboxCoreProMode').prop('checked', isChecked);

    currentFitMode = getFitMode(isChecked);
}

function setSwitchCoreProModeLabel(isChecked) {
    $('#currentFitMode').text(isChecked ? FitProModeLabel : FitCoreModeLabel);
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

        tryCallEnqueueSaveSetting(FIT_SHOW_HIDE_VERTICAL_LINES_FIT_POINTS, (isChecked ? '1' : '0'));

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

        tryCallEnqueueSaveSetting(FIT_AUTO_RECALCULATE_ON_CHANGING_FIT_POINTS, (isChecked ? '1' : '0'));

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

        tryCallEnqueueSaveSetting(FIT_SHOW_HIDE_BREAKS_ON_VALUE_AXIS, (isChecked ? '1' : '0'));

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

    /* when fit-tab is enabled, then remove items with animation, 
       otherwise remove them without animation to avoid issued related to UI */
    if (isTabEnabled(1))
        animateCSS(divId, 'fadeOut', FASTER, callback);
    else
        callback();
}

function switchToCommon() {
    /* show message for 'no segments defined' */
    showByClass('noSegmentsMessageContainer');

    /* disable button for executing continuum-removal */
    setMetroUIButtonEnabled('fitButtonExecute', false);
}

function switchToCoreMode() {
    let items = dxChartGetItems(chartContainer);

    /* remove continuum-series and fit points */
    tryRemoveSeriesAndPoints(items);

    /* remove list of fit-segments on charms */
    emptyListOfSegmentsOnCharms('fitSegmentsListPro', 'fitSegmentsListContainerPro');

    /* common operations for switch */
    switchToCommon();
}

function switchToProMode() {
    let items = dxChartGetItems(chartContainer);

    /* remove continuum-series and fit points */
    tryRemoveSeriesAndPoints(items);

    /* remove list of fit-segments on charms */
    emptyListOfSegmentsOnCharms('fitSegmentsListCore', 'fitSegmentsListContainerCore');

    /* common operations for switch */
    switchToCommon();
}

function tryRemoveSeriesAndPoints(items) {
    initFitArrays();

    ///* start updating chart */
    //dxChartBeginUpdate(chartContainer);

    /* remove continuum */
    tryRemoveContinuumSeriesAndPoints(items);

    /* remove user-defied fit points */
    tryRemoveFitSeriesAndPoints(items);

    ///* end updating chart */
    //dxChartEndUpdate(chartContainer);

    dxChartRefresh(chartContainer);

    hideSpectraToBeHidden();
}

function tryRemoveContinuumSeriesAndPoints(items) {
    let continuumPoints = items.filter(function (item) { return Object.keys(item).includes(buildTempContinuumId()); });

    if (!continuumPoints || (continuumPoints && continuumPoints.length == 0))
        return;

    let id = buildTempContinuumId();

    ///* remove points */
    //let continuumPointsNum = continuumPoints.length;
    //for (var i = 0; i < continuumPointsNum; i++) {
    //    let x = continuumPoints[i].X;
    //    let index = items.findIndex(p => p.X == x);
    //    if (index < 0)
    //        continue;

    //    if (items[index][id])
    //        delete items[index][id];
    //}

    resetShownConstantLines();

    /* remove series */
    removeChartSeriesByFieldIdProcedure(chartContainer, items, id);
}

function tryRemoveFitSeriesAndPoints(items) {
    /* remove series */
    removeChartSeriesByFieldIdProcedure(chartContainer, items, SERIES_FIT_POINT);

    deleteChartSeriesItems(items, MIN_Y);
    deleteChartSeriesItems(items, MAX_Y);
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
    tryCallEnqueueSaveSetting(FIT_NUM_OF_POINTS_FOR_MISSING_POINTS, real, timeoutNumOfPointsForMissingPoints);
}

function setNumOfPointsForMissingPoints(value) {
    Metro.getPlugin('#inputNumOfPointsForFit', 'spinner').val(value);
}

/* ################################################################################ */
/* MANAGE VISUALIZATION OF SERIES CONTAINING SELECTED POINTS */
/* ################################################################################ */
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

        updatePointsForFittingArray(point, maxPoint);

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

function removeFitPointsFromChart(xValues) {
    removePointsFromChart(chartContainer, xValues, SERIES_FIT_POINT)

    if (isShowChartConstantLinesForFitPointsAllowed) {
        removeConstantLines(CHART_CONSTANT_LINES_FIT_POINTS);
        updateConstantLines();
    }

    hideSpectraToBeHidden();
}

function tryAddFitPointsSeries() {
    let isChartSeriesUpdateDone = false;

    if (!isChartSeriesAvailableByName(SERIES_FIT_POINTS)) {
        /* add series of points for fitting */
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

function tryRemoveFitPointsSeries() {
    let index = findChartSeriesIndexByName(SERIES_FIT_POINTS);
    if (index > -1) {
        dxChartBeginUpdate(chartContainer);

        deleteChartSeriesItems(dxChartGetItems(chartContainer), SERIES_FIT_POINT);

        removeChartSeriesAt(index);
        dxChartUpdateSeries(chartContainer, chartSeries);

        dxChartEndUpdate(chartContainer);
    }
}

/* ################################################################################ */
/* MANAGE SELECTED POINTS */
/* ################################################################################ */
/* STARTING METHOD FOR ADDING/REMOVING POINTS */
function addRemoveSelectedPointForFittingProcedure(seriesId, point, mousePosX, mousePosY) {
    /* adjusted coords for showing pulse animation */
    mousePosX -= 6;
    mousePosY -= 4;

    if (isFitPointAvailableAtCurrentX(point.X))
        removeSelectedPointFromFitting(point, mousePosX, mousePosY);
    else if (isSpectrumOfType(seriesId, SPECTRUM_TYPE_ALIGNED)) {
        insertPulse(mousePosX, mousePosY, 'pulse-ring-add');
        selectedSpectrumTypeForContinuumRemoval = SPECTRUM_TYPE_ALIGNED;
        executeAfter(function () { addSelectedPointForFittingAsync(createPointForFitting(point), true, true); }, JS_DELAY_200);
    }
}

async function addSelectedPointForFittingAsync(point, isFromUserAction = false, isLast = false) {
    if (!isExistantInPointsForFittingArray(point)) {
        const callback = async function () {
            /* save point in dedicated array */
            addToPointsForFittingArray(point);
            //console.log(`${addSelectedPointForFittingAsync.name} - point: ${point.P.Y}`);
            /* add point to fit series */
            await addFitPointToChartAsync(point, isFromUserAction);

            let pointUICallback = function () {
                switch (currentFitMode) {
                    case FIT_CORE_MODE:
                        /* create UI element on charms */
                        addPointUI(point);
                        break;

                    case FIT_PRO_MODE:
                        /* do nothing */
                        break;
                }
            };
            /* switch to 'FIT OPTIONS' tab and load fitting functions  */
            if (isOnlyOneItemInPointsForFittingArrayAvailable())
                await loadFitPanelAsync(pointUICallback);
            else
                pointUICallback();

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
            setTimeout(callback, PULSE_TIMEOUT / 4);
        else
            callback();
    } else
        setLoadingCircleIsVisible(false); // avoid loading circle remaining visible when no point is added
}

/* clean panel on charms from points settings */
function cleanPointsPanel() {
    if (currentFitMode == FIT_CORE_MODE) {
        //let callback = function () {
        //    $('#fitSegmentsListCore').empty();
        //};
        //animateCSS('fitSegmentsListCore', 'fadeOut', FASTER, callback);
        emptyListOfSegmentsOnCharms('fitSegmentsListCore', 'fitSegmentsListContainerCore');
    } else if (currentFitMode == FIT_PRO_MODE) {
        //let callback = function () {
        //    $('#fitSegmentsListPro').empty();
        //};
        //animateCSS('fitSegmentsListPro', 'fadeOut', FASTER, callback);
        emptyListOfSegmentsOnCharms('fitSegmentsListPro', 'fitSegmentsListContainerPro');
    }
}

function isFitPointAvailableAtCurrentX(x) {
    let items = dxChartGetItems(chartContainer);
    return items.some(obj => obj.X == x && Object.keys(obj).includes(SERIES_FIT_POINT));
}

/* for removing user selected points on chart */
function removeSelectedPointFromFitting(point, mousePosX = null, mousePosY = null) {
    /* remove point from dedicated array, return the right X coord of the point for fit */
    let pointForFitting = findInPointsForFittingArrayByX(point.X);

    if (!pointForFitting)
        return;

    /* remove from 'pointsForFitting' array */
    removeFromPointsForFittingArray(point);

    if (mousePosX && mousePosY)
        insertPulse(mousePosX, mousePosY, 'pulse-ring-remove');

    let callback = function () {
        /* remove point (with boundary points) from chart */
        removeFitPointsFromChart([pointForFitting.PXMin.X, pointForFitting.P.X, pointForFitting.PXMax.X]);

        /* manage segments after point has been removed */
        manageRemovedPoint(pointForFitting);

        /* if only 1 point remains, remove segment */
        if (isOnlyOneItemInPointsForFittingArrayAvailable()) { }

        /* if no points for fitting exist, then remove series */
        if (isPointsForFittingArrayEmpty())
            tryRemoveFitPointsSeries();

        /* if conditions are satisfied, then auto recalculate continuum-remved */
        tryAutoRecalculateContinuumRemovedAsync();
    };

    /* execute callback after pulse animation completed */
    setTimeout(callback, 500);
}

/* for removing points when removing the whole continuum */
function removePointFromFitting(point) {
    let pointForFitting;

    if (currentFitMode == FIT_CORE_MODE)
        pointForFitting = findInPointsForFittingArrayByP(point);
    else if (currentFitMode == FIT_PRO_MODE)
        pointForFitting = findInPointsForFittingArrayByPMax(point);

    if (!pointForFitting)
        return;

    /* remove from 'pointsForFitting' array */
    removeFromPointsForFittingArray(point);
}

/* -------------------------------------------------------------------------------- */
/* PULSE ANIMATION */
/* -------------------------------------------------------------------------------- */
function insertPulse(left, top, className) {
    let html = `<div id="pulseRing" class="${className}"></div>`;

    $('body').append(html);
    $('#pulseRing').css({ position: 'absolute', left: `${left}px`, top: `${top}px` });

    executeAfter(function () { $('#pulseRing').remove(); }, PULSE_TIMEOUT);
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
        /* hide 'empty' message and show list of segments 
           (works only when fit panel has already been loaded by user and message is still visible) */
        hideFitStartingMessageContainer();

        /* no segments added for empty points list and for 1st point */
        if (isPointsForFittingArrayEmpty() || isFirstItemInPointsForFittingArray())
            return;

        let minX = getPointsForFittingArrayMinX();
        let maxX = getPointsForFittingArrayMaxX();

        if (point.P.X <= minX) {
            let pointAfter = getNextItemInPointsForFittingArray(point);
            await addNewSegmentProcedureAsync(point, pointAfter, isFromUserAction, isLast); // add as 1st segment
        } else if (point.P.X >= maxX) {
            let pointBefore = getPreviousItemInPointsForFittingArray(point);
            await addNewSegmentProcedureAsync(pointBefore, point, isFromUserAction, isLast); // add as last segment
        }
    }
}

function manageRemovedPoint(point) {
    if (segmentsForFitting.length == 0)
        return;

    let minX = getPointsForFittingArrayMinX();
    let maxX = getPointsForFittingArrayMaxX();

    if (point.P.X <= minX) {
        /* remove 1st segment on UI */
        switch (currentFitMode) {
            case FIT_CORE_MODE:
                removeSegmentForFittingUICore(segmentsForFitting[0]);
                break;

            case FIT_PRO_MODE:
                removeSegmentForFittingUIPro(segmentsForFitting[0]);
                break;
        }

        /* remove the 1st segment  */
        removeContinuumSegmentForFittingOnChart(segmentsForFitting[0]);
        /* remove 1st segment from segmentsForFitting */
        removeSegmentForFittingAt(0);
    } else if (point.P.X >= maxX) {
        /* remove last segment on UI */
        switch (currentFitMode) {
            case FIT_CORE_MODE:
                removeSegmentForFittingUICore(segmentsForFitting[segmentsForFitting.length - 1]);
                break;

            case FIT_PRO_MODE:
                removeSegmentForFittingUIPro(segmentsForFitting[segmentsForFitting.length - 1]);
                break;
        }

        /* remove the lastst segment  */
        removeContinuumSegmentForFittingOnChart(segmentsForFitting[segmentsForFitting.length - 1]);
        /* remove last segment from segmentsForFitting */
        removeSegmentForFittingAt(segmentsForFitting.length - 1);
    } else {
        let index = segmentsForFitting.findIndex(p => p.P1.P.X > point.P.X);
        if (index == -1)
            return;
        /* before removing the segment, we need to retrieve the x0 of the previous segment and the
           X1 of the next segment. Then we'll remove 2 segments containing the removed point and
           we'll add a new segment with the retrieved boundaries x0,x1 */
        let p0 = segmentsForFitting[index - 1].P0;
        let p1 = segmentsForFitting[index].P1;
        /* remove n-th segment on UI */
        switch (currentFitMode) {
            case FIT_CORE_MODE:
                removeSegmentForFittingUICore(segmentsForFitting[index]);
                break;

            case FIT_PRO_MODE:
                removeSegmentForFittingUIPro(segmentsForFitting[index]);
                break;
        }

        /* remove segments containing the selected removed point  */
        let segments0 = removeSegmentForFittingAt(index);
        removeContinuumSegmentForFittingOnChart(segments0[0]);

        /* remove n-th segment on UI */
        switch (currentFitMode) {
            case FIT_CORE_MODE:
                removeSegmentForFittingUICore(segmentsForFitting[index - 1]);
                break;

            case FIT_PRO_MODE:
                removeSegmentForFittingUIPro(segmentsForFitting[index - 1]);
                break;
        }

        let segments1 = removeSegmentForFittingAt(index - 1);
        removeContinuumSegmentForFittingOnChart(segments1[0]);

        /* add new segment with p0,p1 */
        addNewSegmentProcedureAsync(p0, p1);
    }

    dxChartRefresh(chartContainer);
    hideSpectraToBeHidden();
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
        orderSegmentsForFitting();

    /* add segment-related UI item  */
    let result;
    switch (currentFitMode) {
        case FIT_CORE_MODE:
            /* create UI element on charms and build the continuum segment on chart */
            result = createSegmentFittingUICore(segment, isFromUserAction, isLast);
            //addSegmentToDictionary(FIT_SEGMENT_CORE, result.Guid, segment.Index);
            break;

        case FIT_PRO_MODE:
            /* create UI element on charms and build the continuum segment on chart */
            result = await createSegmentFittingUIProAsync(segment, isFromUserAction, isLast);
            //addSegmentToDictionary(FIT_SEGMENT_PRO, result.Guid, segment.Index);
            break;
    }

    segmentsForFitting[segment.Index].uiId = result.SegmentId;

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
    //if (loadingCheckObj.IsLoading) {
    //    //console.log('alignSpectrumAsync - loadingCheckObj.IsLoading');
    //    await waitForBooleanValueAsync(() => !loadingCheckObj.IsLoading, 100);
    //}
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
    //console.log(`buildContinuumSegmentAsync - p0: ${p0.X}, p1: ${p1.X}`);
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
    /* add continuum-spectrum points */
    let xValues = processingResult.Points.map(p => p.X);
    let yValues = processingResult.Points.map(p => p.Y);
    addChartSeriesItems(items, xValues, yValues, continuumSpectrum.Id);
    //let pointsNum = processingResult.Points.length;
    //for (var i = 0; i < pointsNum; i++) {
    //    let x = processingResult.Points[i].X;
    //    let index = items.findIndex(p => p.X == x);
    //    if (index > -1)
    //        items[index][continuumSpectrum.Id] = processingResult.Points[i].Y;
    //}

    //console.log(`buildContinuumSegmentAsync - pointsNum: ${pointsNum}`);

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

    let index0 = items.findIndex(p => p.X == segment.P0.P.X);
    let index1 = items.findIndex(p => p.X == segment.P1.P.X);

    if (index0 == -1 || index1 == -1)
        return;

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
    let selectedSpectrum = getSpectrumById(selectedSpectrumForProcessingId);

    /* build spectrum info for being added to 'spectraInfo' */
    let continuumSpectrum = buildSpectrum(
        buildTempContinuumId(),
        0,
        selectedSpectrum.Name,
        selectedSpectrum.SpectrumLevel,
        SPECTRUM_TYPE_CONTINUUM,
        selectedSpectrum.SpectrumSource);
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
/* DELETE CONTINUUM */
/* ################################################################################ */
function removeContinuum() {
    isRemovingContinuum = true;

    try {
        let id = buildTempContinuumId();

        /* retrieve index of spectrum in spectraInfo */
        let index = getSpectrumIndexById(id)

        /* retrieve series name before removing it */
        let seriesname = getSpectrumSeriesNameFromIndex(index);

        /* remove continuum spectrum from chart */
        removeSpectrumFromChart(seriesname, id);

        /* remove from spectraInfo */
        if (index >= 0)
            removeSpectrumByIndex(index);

        /* remove fit points */
        removeFitPointsSeriesPoints();
    } catch (e) {
        console.log(`${removeContinuum.name} - ex: ${e}`);
    }

    isRemovingContinuum = false;
}

function removeFitPointsSeriesPoints() {
    dxChartBeginUpdate(chartContainer);

    /* remove from chart points */
    /* define x coords of all points to be removed from chart */
    let xValues = [];
    /* iterate over all 'pointsForFitting' to remove them
       and save x values for removing points from chart */
    let pointsForFittingNum = pointsForFitting.length;
    for (var i = pointsForFittingNum - 1; i >= 0; i--) {
        /* save point x coord */
        if (currentFitMode == FIT_CORE_MODE)
            xValues.push(pointsForFitting[i].P.X);
        else if (currentFitMode == FIT_PRO_MODE) {
            xValues.push(pointsForFitting[i].PXMax.X);
            xValues.push(pointsForFitting[i].PXMin.X);
        }
    }

    /* remove all points from chart */
    removeFitPointsFromChart(xValues);

    /* remove from series */
    let seriesNum = chartSeries.length;
    for (var i = 0; i < seriesNum; i++) {
        if (chartSeries[i].name == SERIES_FIT_POINT) {
            removeChartSeriesAt(i);
            break;
        }
    }
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    /* reset visual range to make ref whites appear in chart */
    dxChartResetVisualRange(chartContainer);

    /* clear 'pointsForFitting' array  */
    clearPointsForFittingArray();

    /* clear 'segmentsForFitting' array */
    clearSegmentsForFitting();

    /* reset dictionary for ordering segmnents */
    resetSegmentsDictionary();

    /* remove fit points series and clean panel on charms with points/segments settings */
    cleanPointsPanel();
    tryRemoveFitPointsSeries();
}

/* ################################################################################ */
/* BUILD CONTINUUM-REMOVED SPECTRUM */
/* ################################################################################ */
function buildContinuumRemovedSpectrum() {
    try {
        /* retrieve RAW spectrum */
        let rawSpectrum = getSpectrumById(selectedSpectrumForProcessingId);

        /* retrieve aligned spectrum */
        let alignedSpectrum = getSpectrumAlignedProcedure();
        if (alignedSpectrum == null)
            return null;

        /* build spectrum info for being added to 'spactraInfo' */
        let continuumRemovedSpectrum = buildSpectrum(
            buildTempContinuumRemovedId(),
            alignedSpectrum.Id,
            rawSpectrum.Name,
            rawSpectrum.SpectrumLevel,
            SPECTRUM_TYPE_CONTINUUM_REMOVED,
            alignedSpectrum.SpectrumSource);
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
    showByClass('fitButtonDownload');

    /* set hidden the checkbox for removing file on cloud (because of the used HTML & css, we need to do it manually, since the 'd-none' class doesn't work) */
    hideElemMetroUIElem('checkboxRemoveContinuumRemovedSpectrumOnCloud');

    /* refresh legend, if opened */
    refreshCharmsLegend();

    if (isShowBreaksOnValueAxisForContinuumRemovedRequested)
        fitShowBreaksOnValueAxis();

    /* hide ALIGNED spectrum for clarity */
    let alignedSpectrum = getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    if (alignedSpectrum)
        setSpectrumVisibilityByIdAndSpectrumType(alignedSpectrum.Id, SPECTRUM_TYPE_ALIGNED, false);

    /* remove all segments for fitting for clarity */
    let continuumSpectrum = getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM);
    if (continuumSpectrum)
        setSpectrumVisibilityByIdAndSpectrumType(continuumSpectrum.Id, SPECTRUM_TYPE_CONTINUUM, false);

    /* hide points for clarity */
    setSpectrumVisibilityByName(SERIES_FIT_POINTS, false);

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
    try {
        let continuumPoints = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM);
        //let continuumPoints = getPointsFromSeriesPoints(dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM))));

        /* set missing point 0 */
        trySaveMissingPoint(createPointForFitting(createSimplePoint(continuumPoints[0].X, continuumPoints[0].Y)));

        /* set missing point 1 */
        let continuumPointsNum = continuumPoints.length;

        trySaveMissingPoint(createPointForFitting(createSimplePoint(continuumPoints[continuumPointsNum - 1].X, continuumPoints[continuumPointsNum - 1].Y)));

    } catch (e) {
        /* this exception should occur only when this function is called when retrieving from DB. */
    }
}

async function startRemoveContinuumProcedureAsync() {
    setLoadingCircleIsVisible(true);

    /* if continuum removed spectrum is already present, recalculate it and exit */
    if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED)) {
        await tryAutoRecalculateContinuumRemovedAsync();
        return;
    }

    /* reset array to let re-calculate them */
    resetMissingPoints();

    let missingPointBeginning = await calculateMissingPointAsync(MissingPointPositionBeginning);
    let missingPointEnd = await calculateMissingPointAsync(MissingPointPositionEnd);

    if (missingPointBeginning == null && missingPointEnd == null) {
        setLoadingCircleIsVisible(false);
        return;
    }

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
    if (!continuumPoints) {
        showSimpleDialog(ERROR_LABEL, ContinuumRemovalExecutionErrorMessage, ALERT);
        return;
    }

    /* retrieve points of aligned for calculating continuum-removed spectrum */
    let points = getSpectrumPointsByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    if (!points) {
        showSimpleDialog(ERROR_LABEL, ContinuumRemovalExecutionErrorMessage, ALERT);
        return;
    }

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

            setTabEnabled(3, true);
        }
        else
            isOk = false;

        setLoadingCircleIsVisible(false);

        if (isOk)
            addMessage(ContinuumRemovalCompletedMessage, 3000, INFO);
        if (!isOk) {
            addMessage(ContinuumRemovalExecutionErrorMessage, 0, ALERT, displayMessage = false);
            showSimpleDialog(ERROR_LABEL, ContinuumRemovalExecutionErrorMessage, ALERT);
        }
    }

    /* to remove loading when error occurred */
    setLoadingCircleIsVisible(false);
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
    removeFromPointsForFittingArray(missingPoints[0]);
    removeFromPointsForFittingArray(missingPoints[1]);


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
        ParentFile: buildParentFile(parentId),
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
            XStart: segmentsForFitting[i].P0.P.X,
            XEnd: segmentsForFitting[i].P1.P.X,
            FitMethodName: fitFunction.MethodName,
            ParameterValue: segmentsForFitting[i].FitFunctionParameterValue
        });
    }

    return segments;
}

async function saveContinuumRemovedSpectrumProcedureAsync() {
    let spectrum = getSpectrumContinuumRemovedProcedure();

    if (!spectrum) {
        showSimpleDialog(ERROR_LABEL, FitSaveErrorMessage, ALERT);
        return;
    }

    let cond1 = await checkIsSpectrumOfTypeSavedOnCloudAsync(SPECTRUM_TYPE_CONTINUUM_REMOVED, spectrum.Name);
    let cond2 = isSpectrumOfTypeSavedOnCloud(SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (cond1 || cond2)
        askAndExecute(CharmsSpectraProcessingManagementLabel, OverwriteSavedSpectrumQuestion, saveContinuumRemovedSpectrumAsync, [spectrum]);
    else
        saveContinuumRemovedSpectrumAsync(spectrum);
}

async function saveContinuumRemovedSpectrumAsync(spectrum) {
    let isSavingOk = true;

    try {
        setLoadingCircleIsVisible(true);

        /* save aligned for building the parent-child chain */
        //if (!isSpectrumOfTypeSavedOnCloud(SPECTRUM_TYPE_ALIGNED)) {
        //    if (! await saveAlignedSpectrumAsync(false)) {
        //        setLoadingCircleIsVisible(false);
        //        showSimpleDialog(ERROR_LABEL, AlignmentSaveErrorMessage, ALERT);
        //        return;
        //    }
        //}

        /* retrieve parent file */
        /* retrieve aligned spectrum */
        let isAlignedSaved = true;
        let alignedSpectrum = getSpectrumAlignedProcedure();
        if (!Number.isFinite(alignedSpectrum.Id))
            /* if aligned has not been already saved, save it for building the parent-child chain */
            isAlignedSaved = await saveAlignedSpectrumAsync(false);

        if (!isAlignedSaved) {
            setLoadingCircleIsVisible(false);
            showSimpleDialog(ERROR_LABEL, AlignmentSaveErrorMessage, ALERT);
            return;
        }

        //const alignedSpectrum = getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        //if (!alignedSpectrum) {
        //    setLoadingCircleIsVisible(false);
        //    showSimpleDialog(ERROR_LABEL, AlignmentSaveErrorMessage, ALERT);
        //    return;
        //}



        const parentFiles = getContinuumRemovedParentFiles(selectedSpectrumForProcessingId);

        const continuumRemovalSettings = getContinuumRemovalSettings();

        const xml = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeContinuumRemovedModelAsXml",
            spectrum.Name,
            spectrum.SpectrumType,
            getSpectrumPointsById(spectrum.Id),
            continuumRemovalSettings,
            parentFiles);

        const spectrumFile = buildSpectrumFile(alignedSpectrum.Id,
            spectrum.Name,
            spectrum.SpectrumLevel,
            spectrum.SpectrumType,
            spectrum.SpectrumSource,
            xml);

        /* create model for request */
        const saveSpectrumRequest = {
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


                dxChartResetVisualRange(chartContainer);

                /* mantain hidden unwanted spectra */
                hideSpectraToBeHidden();

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
        addMessage(FitSaveSuccessMessage, 3000, INFO);
    else {
        addMessage(FitSaveErrorMessage, 0, ALERT, displayMessage = false);
        showSimpleDialog(ERROR_LABEL, FitSaveErrorMessage, ALERT);
    }
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
    let childSpectrum = getSpectrumContinuumRemovedProcedure();
    if (isAnySpectrumChildById(childSpectrum.Id))
        switchVisibilityOfChildrenSpectraRemovalMessage('continuumRemovedChildrenRemovalWarning', true);

    /* start removal procedure */
    askForRemovingSpectrum(SPECTRUM_TYPE_CONTINUUM_REMOVED, 'checkboxRemoveContinuumRemovedSpectrumOnCloud', 'continuumRemovedDialogRemove');
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

    /* if a band analysis is available, it is removed */
    clearBandAnalysisProcedureCaller();

    /* disable buttons for saving/removing since aligned spectrum is not present anymore */
    setMetroUIButtonEnabled('fitButtonSave', false);
    setMetroUIButtonEnabled('fitButtonRemove', false);
    hideByClass('fitButtonDownload');

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
        loadFitPanelAsync();
    } else {
        /* when the 'fit options' tab has been opened by user action... */
        downloadProcessedSpectrumAsync(SPECTRUM_TYPE_CONTINUUM_REMOVED);
    }
}

async function downloadContinuumRemovalSettingsAsync(id) {
    const model = {
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

        const alignedPoints = getPointsFromSeriesPointsProcedure(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
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
        const segmentsNum = obj.ResponseObject.Segments.length;
        for (var i = 0; i < segmentsNum; i++) {
            let x = obj.ResponseObject.Segments[i].XStart;
            await addPointAsync(x);
        }
        /* add XEnd from last segment to complete continuum */
        await addPointAsync(obj.ResponseObject.Segments[segmentsNum - 1].XEnd, false, true);

        /* enable the band analysis tab */
        setTabEnabled(3, true);
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
    selectedSpectrumTypeForContinuumRemoval = SPECTRUM_TYPE_ALIGNED;
    setMissingPointsFromDownloadedContinuumRemoved();

    /* condition for allowing auto-retry of calculating continuum-removal */
    isBuildingUpContinuum = false;
});

/* ################################################################################ */
/* DOWNLOAD CONTINUUM-REMOVED SPECTRUM */
/* ################################################################################ */
async function downloadContinuumRemovedSpectrumAsCsvAsync() {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (!spectrum)
        return;

    let txt = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeAsTxt",
        spectrum.Name,
        SPECTRUM_TYPE_CONTINUUM_REMOVED,
        getSpectrumPointsById(spectrum.Id),);
    //console.info(txt);

    executeDownloadFile(txt, `${spectrum.Name}_${getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM_REMOVED)}.csv`)
}

async function downloadContinuumRemovedSpectrumAsXmlAsync() {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (!spectrum)
        return;

    /* un-authenticated users do not save spectra on cloud so they cannot have parent files with valid Id */
    let parentFiles = null;
    if (isUserAuthenticated)
        parentFiles = getContinuumRemovedParentFiles(selectedSpectrumForProcessingId);

    let continuumRemovalSettings = getContinuumRemovalSettings();

    let xml = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeContinuumRemovedModelAsXml",
        spectrum.Name,
        spectrum.SpectrumType,
        getSpectrumPointsById(spectrum.Id),
        continuumRemovalSettings,
        parentFiles);

    executeDownloadFile(xml, `${spectrum.Name}_${getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM_REMOVED)}.xml`)
}