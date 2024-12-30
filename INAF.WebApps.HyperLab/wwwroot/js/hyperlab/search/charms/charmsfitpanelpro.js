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

    let buttonP0Id = `${segmentId}${P0}${Button}`;
    let buttonP1Id = `${segmentId}${P1}${Button}`;

    let html = ``;

    /* segment info */
    html += `<div id="${segmentId}" class="d-flex flex-row margin-bottom-8 border-bottom">`;

    html += `<div class="d-flex flex-column">`;

    /* ROW 0 */
    let topPMinPMaxResult;
    if (isFromUserAction) {
        /* find the maximum in the segments defined by the points boundaries */
        topPMinPMaxResult = await calculateMaxValuePointAsync(points, segment.P0, segment.P0.SelectedPXMinPXMaxFitFunctionId);
        /* save the max-y-val point as P for P0 */
        if (topPMinPMaxResult)
            segment.P0.P = topPMinPMaxResult.maxValuePoint;
    }
    /* top spinners */
    html += `<div class="d-flex flex-row">`;
    if (isFromUserAction)
        html += `   <div id="${buttonP0Id}" style="width: 20px; height: 30px;" class="margin-vertical-4 margin-horizontal-4"><span id="${buttonP0Id}Icon" title="${BandAnalysisIconPXMinXMaxFitTitle}" class="mif-chevron-thin-left mif-2x fg-red pointer"></span></div>`;
    else
        html += `   <div class="margin-vertical-4 margin-horizontal-4" style="width: 20px; height: 30px"></div>`;
    html += `   <div class="d-flex flex-justify-between">`;

    let idP0PMin = `${segmentId}${P0}${PXMin}`;
    let p0PMax = (segment.P0.P.X - 1);
    if (!isFromUserAction)
        p0PMax = segment.P0.P.X;
    html += createSpinner(idP0PMin, segment.P0.PXMin.X, p0PMax, false, true);

    html += `   <div class="margin-horizontal-8" style="width: 80px;">`;
    
    let topSpinnerTextElem;
    if (topPMinPMaxResult)
        topSpinnerTextElem = `<p class="text-secondary">${FitProModeCenterLabel}<span id="${segmentId}${P0}Text" class="margin-left-4 text-secondary">${(topPMinPMaxResult.maxValuePoint.X)}</span></p>`;
    else
        topSpinnerTextElem = `<p class="text-secondary">${FitBoundaryLabel}</p>`;
    html += topSpinnerTextElem;
    html += `   </div>`;

    let idP0PMax = `${segmentId}${P0}${PXMax}`;
    html += createSpinner(idP0PMax, segment.P0.PXMax.X, segment.P0.P.X + 1, true, false, isFromUserAction);

    html += `   </div>`;
    html += `</div>`;

    /* ROW 1 */
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

    /* ROW 2 */
    let bottomPMinPMaxResult;
    if (isFromUserAction) {
        /* find the maximum in the segments defined by the points boundaries */
        bottomPMinPMaxResult = await calculateMaxValuePointAsync(points, segment.P1, segment.P0.SelectedPXMinPXMaxFitFunctionId);
        /* save the max-y-val point as P for P1 */
        if (bottomPMinPMaxResult)
            segment.P1.P = bottomPMinPMaxResult.maxValuePoint;
    }
    /* bottom spinners */
    html += `<div class="d-flex flex-row margin-bottom-4">`;
    if (isFromUserAction)
        html += `   <div id="${buttonP1Id}" class="margin-horizontal-4" style="width: 20px; height: 30px;"><span id="${buttonP1Id}Icon" title="${BandAnalysisIconPXMinXMaxFitTitle}" class="mif-chevron-thin-left mif-2x fg-red pointer"></span></div>`;
    else
        html += `   <div class="margin-horizontal-4" style="width: 20px; height: 30px"></div>`;
    html += `   <div class="d-flex flex-justify-between">`;

    let idP1PMin = `${segmentId}${P1}${PXMin}`;
    html += createSpinner(idP1PMin, segment.P1.PXMin.X, segment.P1.P.X - 1, false, true);

    html += `   <div class="margin-horizontal-8" style="width: 80px;">`;
    
    let bottomSpinnerTextElem;
    if (bottomPMinPMaxResult)
        bottomSpinnerTextElem = `<p class="text-secondary">${FitProModeCenterLabel}<span id="${segmentId}${P1}Text" class="margin-left-4 text-secondary">${(bottomPMinPMaxResult.maxValuePoint.X)}</span></p>`;
    else
        bottomSpinnerTextElem = `<p class="text-secondary">${FitBoundaryLabel}</p>`;
    html += bottomSpinnerTextElem;
    html += `   </div>`;

    let idP1PMax = `${segmentId}${P1}${PXMax}`;
    let p1PMax = (segment.P1.P.X + 1);
    if (!isFromUserAction)
        p1PMax = segment.P1.P.X;
    html += createSpinner(idP1PMax, segment.P1.PXMax.X, p1PMax, true, false, isFromUserAction);

    html += `   </div>`;
    html += `</div>`;

    html += `</div>`;

    ///* button for starting band analysis */
    //if (topPMinPMaxResult) {
    //    html += `<div id="${segmentId}BandAnalysisButton" class="flex-align-center d-none">`;
    //    html += `<button class="button light cycle small outline pointer" onclick="${startBandAnalysisProcedureAsync.name}(${segment.P0.P.X}, ${segment.P1.P.X})" title=""><span class="mif-calculator2"></span></button>`;
    //    html += `</div>`;
    //}

    html += `</div>`;

    /* show panels for changing method for finding Max in selected segment */
    setPButtonAction(buttonP0Id, P0, segment.Index, segment.P0);

    /* show panels for changing method for finding Max in selected segment */
    setPButtonAction(buttonP1Id, P1, segment.Index, segment.P1);

    /* add actions for UI elements */
    $(async function () {
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP0PMin}`, 'spinner').toDefault();
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP0PMax}`, 'spinner').toDefault();
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP1PMin}`, 'spinner').toDefault();
        /* required to set value to default value, otherwise value = 0 */
        Metro.getPlugin(`#${idP1PMax}`, 'spinner').toDefault();

        /* action for button for deleting point */
        $(`#${idP0PMax}DeleteButton`).on('click', function () {
            removeSelectedPointFromFitting(createSimplePoint(segment.P0.P.X, segment.P0.P.Y));
        });
        $(`#${idP1PMax}DeleteButton`).on('click', function () {
            removeSelectedPointFromFitting(createSimplePoint(segment.P1.P.X, segment.P1.P.Y));
        });

        /* action to automatically calculate fitted segment depending on selected function */
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

function createSpinner(id, defaultValue, boundaryValue, isMinValueAllowed, isMaxValueAllowed, isDeleteButtonRequired = false) {
    let html = `   <input id="${id}" `;
    html += `   data-cls-spinner="width-130" `;
    html += `   data-default-value="${defaultValue}" `;
    if (isMinValueAllowed)
        html += `   data-min-value="${boundaryValue}" `; // only min-value for right boundary
    if (isMaxValueAllowed)
        html += `   data-max-value="${boundaryValue}" `; // only max-value for left boundary
    html += `   data-step="${1}" `;
    //html += `   data-fixed="4" `;
    html += `   data-on-plus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-on-minus-click="${onBoundaryValueChangeByButtonPro.name}" `;
    html += `   data-cls-spinner-button="fg-white" `;
    html += `   data-cls-spinner-button-plus="bg-cyan" `;
    html += `   data-cls-spinner-button-minus="bg-cyan" `;
    html += `   data-on-change="${onBoundaryValueChangeByEnter.name}" `;
    html += `   data-repeat-threshold="1000" `;
    html += `   type="text" data-role="spinner" data-buttons-position="right">`;

    if (isDeleteButtonRequired) {
        /*          column for delete button */
        html += `   <div id="${id}DeleteButton" class="margin-left-8 padding-vertical-4">`;
        html += `       <button class="button light cycle small outline" title="${FitButtonDeletePointLabel}"><span class="mif-bin"></span></button>`;
        html += `   </div>`;
    }

    return html;
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
        pointForFitting = findInPointsForFittingArrayByPMinX(curr);
    else if (id.includes(PXMax))
        pointForFitting = findInPointsForFittingArrayByPMaxX(curr);

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

function setPButtonAction(buttonPId, P, segmentIndex, segmentP) {
    $(function () {
        $(`#${buttonPId}`).on('click', function () {
            if (!isAppendixAlreadyAvailable) {
                /* show panel for fitting the PXMin-PXMax segment */
                showPXMinPXMaxFitting(P, `${buttonPId}`, segmentIndex, segmentP);

                /* set icon for button used for showing/hiding the PXMin-PXMax fit */
                setIconForPXMinXMaxFit(`${buttonPId}Icon`, false);

                /* highlight button container */
                setIconParentDivForPXMinPXMaxFit(buttonPId, true);
            } else {
                /* hide panel for fitting the PXMin-PXMax segment */
                hidePXMinPXMaxFitting(`${buttonPId}${Appendix}`);

                /* set icon for button used for showing/hiding the PXMin-PXMax fit */
                setIconForPXMinXMaxFit(`${buttonPId}Icon`, true);

                /* lowlight button container */
                setIconParentDivForPXMinPXMaxFit(buttonPId, false);
            }
        });
    });
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
        newSeriesPoints[i][`${spectrumInfo.Id}`] = segmentSeriesPoints[i].Y;
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

async function pXMinPXMaxFitFunctionSelectProManagementAsync(val, textId = null, isNextSegmentUpdateRequired = true) {
    /* remove fit-series */
    tryRemovePXMinPXMaxMaxValueSeries();

    /* retrieve the function value */
    let numbers = val.replace(FIT_SEGMENT_PRO, '');
    let functionId = parseInt(numbers.charAt(1));

    /* retrieve info about segment and function */
    let functionIndex = getPXMinPXMaxFunctionIndexFromId(val);

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

    /* update next segment, if existant and if current point is P1 */
    if (P0P1Val == P0 || isNextSegmentUpdateRequired == false)
        return;

    let currentSegmentBaseId = val.slice(0, val.length - 4);
    let _currentSegmentIndex = val.slice(val.length - 4, val.length - 3);
    let currentSegmentIndex = parseInt(_currentSegmentIndex);

    let nextSegmentId = `${currentSegmentBaseId}${currentSegmentIndex + 1}`;
    if ($(`#${nextSegmentId}`).length == 0)
        return;

    let nextVal = `${nextSegmentId}${functionId}${P0}`;
    let nextTextId = `${nextSegmentId}${P0}Text`;
    console.log(`val:${val}, textId:${textId}`);
    console.log(`nextVal:${nextVal}, nextTextId:${nextTextId}`);
    console.log('-------------------');
    pXMinPXMaxFitFunctionSelectProManagementAsync(nextVal, nextTextId, false);
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

    updatePointsForFittingArray(oldPointForFitting, maxPoint);

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