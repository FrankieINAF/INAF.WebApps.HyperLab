function clearSegmentsForFitting() {
    segmentsForFitting = [];
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

function getPXMinPXMaxFunctionIndexFromValue(id) {
    let numbers = id.replace(FIT_SEGMENT_PRO, '');
    let functionId = parseInt(numbers.charAt(1));
    let functionIndex = pXMinPXMaxMaxValueFunctions.findIndex(f => f.Id == functionId);
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
        /* update id of P0Button */
        let button0 = $(`#${newId}`).find('div[id$="P0Button"]');
        if (button0 && button0.length > 0) {
            $(`#${button0[0].id}`).off();

            let buttonP0Id = `${fitSegmentType}${segmentsForFitting[i].Index}P0Button`;
            $(`#${button0[0].id}`).attr('id', buttonP0Id);
            let segment = segmentsForFitting[i];
            setPButtonAction(buttonP0Id, P0, segment.Index, segment.P0);
        }
        let button1 = $(`#${newId}`).find('div[id$="P1Button"]');
        if (button1 && button1.length > 0) {
            $(`#${button1[0].id}`).off();

            let buttonP1Id = `${fitSegmentType}${segmentsForFitting[i].Index}P1Button`;
            $(`#${button1[0].id}`).attr('id', buttonP1Id);
            let segment = segmentsForFitting[i];
            setPButtonAction(buttonP1Id, P1, segment.Index, segment.P1);
        }
        //$(`#${newId}`).find('div[id$="P0Button"]').attr('id', `${fitSegmentType}${segmentsForFitting[i].Index}P0Button`);
        $(`#${newId}`).find('span[id$="P0ButtonIcon"]').attr('id', `${fitSegmentType}${segmentsForFitting[i].Index}P0ButtonIcon`);
        /* update id of P1Button */
        $(`#${newId}`).find('div[id$="P1Button"]').attr('id', `${fitSegmentType}${segmentsForFitting[i].Index}P1Button`);
        $(`#${newId}`).find('span[id$="P1ButtonIcon"]').attr('id', `${fitSegmentType}${segmentsForFitting[i].Index}P1ButtonIcon`);
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
function addToPointsForFittingArray(point) {
    pointsForFitting.push(point);
    pointsForFitting.sort((p0, p1) => {
        return p0.P.X - p1.P.X;
    });
}

function clearPointsForFittingArray() {
    pointsForFitting = [];
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

function findInPointsForFittingArrayByP(point) {
    let index = pointsForFitting.findIndex(p => p.P.X >= (point.P.X - POINT_RADIUS) && (p.P.X <= (point.P.X + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function findInPointsForFittingArrayByPMax(point) {
    let index = pointsForFitting.findIndex(p => p.PXMax.X >= (point.PXMax.X - POINT_RADIUS) && (p.PXMax.X <= (point.PXMax.X + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function findInPointsForFittingArrayByPMinX(x) {
    let index = pointsForFitting.findIndex(p => p.PXMin.X >= (x - POINT_RADIUS) && (p.PXMin.X <= (x + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function findInPointsForFittingArrayByPMaxX(x) {
    let index = pointsForFitting.findIndex(p => p.PXMax.X >= (x - POINT_RADIUS) && (p.PXMax.X <= (x + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function findInPointsForFittingArrayByX(x) {
    let index = pointsForFitting.findIndex(p => p.P.X >= (x - POINT_RADIUS) && (p.P.X <= (x + POINT_RADIUS)));

    if (index == -1)
        return null;

    return pointsForFitting[index];
}

function getNextItemInPointsForFittingArray(point) {
    return pointsForFitting.find(p => p.P.X > point.P.X);
}

function getPreviousItemInPointsForFittingArray(point) {
    let pointsBefore = pointsForFitting.filter(p => p.P.X < point.P.X);
    return pointsBefore[pointsBefore.length - 1];
}

function getPointsForFittingArrayMaxX() {
    return Math.max(...pointsForFitting.map(p => p.P.X));
}

function getPointsForFittingArrayMinX() {
    return Math.min(...pointsForFitting.map(p => p.P.X));
}

function isFirstItemInPointsForFittingArray() {
    return pointsForFitting.length == 1;
}

function isExistantInPointsForFittingArray(point) {
    let index = pointsForFitting.findIndex(p => p.P.X == point.P.X && p.P.Y == point.P.Y);
    return (index > -1);
}

function isOnlyOneItemInPointsForFittingArrayAvailable() {
    return (pointsForFitting.length == 1);
}

function isPointsForFittingArrayEmpty() {
    return (pointsForFitting.length == 0);
}

function isPointForFittingInExistingSegment(point) {
    isInExistingSegment = true;

    if (isPointsForFittingArrayEmpty() || isFirstItemInPointsForFittingArray())
        return false;

    let minX = getPointsForFittingArrayMinX();
    let maxX = getPointsForFittingArrayMaxX();

    if (point.P.X <= minX || point.P.X >= maxX)
        isInExistingSegment = false;

    return isInExistingSegment;
}

function removeFromPointsForFittingArray(point) {
    let index = pointsForFitting.findIndex(p => p.P.X >= (point.P.X - POINT_RADIUS) && (p.P.X <= (point.P.X + POINT_RADIUS)));

    if (index == -1)
        return;

    pointsForFitting.splice(index, 1);
}

function updatePointsForFittingArray(oldPoint, newPoint) {
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