var SegmentsDictionary;

/* ################################################################################ */
/* MANAGE SEGMENTS ORDER WITH DICTIONARY */
/* ################################################################################ */
function addSegmentToDictionary(segmentType, guid, index) {
    //console.log(`addSegmentToDictionary - segmentType: ${segmentType}, guid: ${guid}, index: ${index}`);
    const dictionaryObject = getDictionaryObject(segmentType);

    if (!isAnySegmentWithIndexInDictionary(segmentType, index))
        SegmentsDictionary[dictionaryObject].push(getSegmentDictionaryItem(guid, index));
    else {
        SegmentsDictionary.IsReorderRequired = true;
        /* when an item with current index is already present, then we need to update all index
           values and then we can insert the new item */
        const items = SegmentsDictionary[dictionaryObject].filter(x => x.Index >= index);
        if (items) {
            const itemsNum = items.length;
            for (let i = 0; i < itemsNum; i++) {
                items[i].Index++;
            }

            addSegmentToDictionary(segmentType, guid, index);
        }
    }

    tryOrderSegmentsInDictionary(segmentType);
}

function getSegmentDictionaryItem(guid, index) {
    return {
        Guid: guid,
        Index: index
    };
}

function getSegmentFromDictionaryByGuid(segmentType, guid) {
    const dictionaryObject = getDictionaryObject(segmentType);

    return SegmentsDictionary[dictionaryObject].find(x => x.Guid == guid);
}

function getSegmentFromDictionaryByIndex(segmentType, index) {
    const dictionaryObject = getDictionaryObject(segmentType);

    return SegmentsDictionary[dictionaryObject].find(x => x.Index == index);
}

function getSegmentGuidFromDictionary(segmentType, index) {
    let item = getSegmentFromDictionaryByIndex(segmentType, index);
    if (item)
        return item.Guid;

    return null;
}

function getSegmentIndexFromDictionary(segmentType, guid) {
    let item = getSegmentFromDictionaryByGuid(segmentType, guid);
    if (item)
        return item.Index;

    return -1;
}

function initSegmentsDictionary() {
    SegmentsDictionary = {
        CoreSegments: [],
        ProSegments: [],
        IsReorderRequired: false
    };
}

function isAnySegmentWithIndexInDictionary(segmentType, index) {
    const dictionaryObject = getDictionaryObject(segmentType);

    return SegmentsDictionary[dictionaryObject].some(x => x.Index == index);
}

function tryOrderSegmentsInDictionary(segmentType) {
    if (!SegmentsDictionary.IsReorderRequired)
        return;

    const dictionaryObject = getDictionaryObject(segmentType);
    SegmentsDictionary[dictionaryObject].sort((s0, s1) => {
        return s0.Index - s1.Index;
    });

    SegmentsDictionary.IsReorderRequired = false;
}

function removeSegmentFromDictionary(segmentType, index) {
    const dictionaryObject = getDictionaryObject(segmentType);

    let item = SegmentsDictionary[dictionaryObject].find(x => x.Index == index);
    if (item) {
        SegmentsDictionary[dictionaryObject].splice(item.Index, 1);
        const itemsToBeUpdated = SegmentsDictionary[dictionaryObject].filter(x => x.Index > item.Index);
        if (itemsToBeUpdated) {
            SegmentsDictionary.IsReorderRequired = true;

            const itemsNum = itemsToBeUpdated.length;
            for (let i = 0; i < itemsNum; i++) {
                itemsToBeUpdated[i].Index--;
            }
        }

        tryOrderSegmentsInDictionary(segmentType);

        return true;
    }

    return false;
}

function resetSegmentsDictionary() {
    initSegmentsDictionary();
}

/* -------------------------------------------------------------------------------- */
/* ANCILLARY */
/* -------------------------------------------------------------------------------- */
function getDictionaryObject(segmentType) {
    if (segmentType == FIT_SEGMENT_CORE)
        return 'CoreSegments';
    else if (segmentType == FIT_SEGMENT_PRO)
        return 'ProSegments';
}
/* ################################################################################ */
/* MISCELLANEA */
/* ################################################################################ */
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

    const tmp = id.split('_');
    const guid = tmp[1];
    return getSegmentIndexFromDictionary(fitSegmentType, guid);
}

function getPXMinPXMaxFunctionIndexFromId(id) {
    let numbers = id.replace(FIT_SEGMENT_PRO, '');
    let functionId = parseInt(numbers.charAt(1));
    let functionIndex = pXMinPXMaxMaxValueFunctions.findIndex(f => f.Id == functionId);
    return functionIndex;
}

function onSegmentFunctionSelectBase(val, fitSegmentType, fitSegmentValueType) {
    let temp = val.split('_');
    const functionId = parseInt(temp[2]);
    //console.log(`${onSegmentFunctionSelectBase.name} - val: ${val}, fitSegmentType: ${fitSegmentType}, fitSegmentValueType: ${fitSegmentValueType}, functionId: ${functionId}`);
    /* retrieve info about segment and function */
    const segmentIndex = getFunctionIndexFromValue(val, fitSegmentType);
    //console.log(`${onSegmentFunctionSelectBase.name} - segmentIndex: ${segmentIndex}, functionId: ${functionId}`);
    if (segmentIndex == -1)
        return;
    /* clear the div */
    let segmentContainerId = buildUIElementId(fitSegmentValueType, segmentIndex, 'Container');
    $(`#${segmentContainerId}`).empty();

    /* retrieve the selected fit function */
    let selectedFitFunction = getFitFunctionById(functionId);
    if (!selectedFitFunction)
        return;
    //console.log(`${onSegmentFunctionSelectBase.name} - selectedFitFunction: ${JSON.stringify(selectedFitFunction)}`);
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
        let segmentId = `${fitSegmentValueType}_${segmentIndex}`;
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

/* ################################################################################ */
/* CREATE/REORDER SEGMENTS */
/* ################################################################################ */
function buildUIElementId(prefix, segmentIndex, elementType) {
    if (elementType) {
        return `${prefix}_${segmentIndex}_${elementType}`;
    } else {
        return `${prefix}_${segmentIndex}`;
    }
}

function buildUIElementIdWithGuid(prefix) {
    const guid = generateShortGUID();

    return {
        ElementId: `${prefix}_${guid}`,
        Guid: guid
    };
}

function getUIElementIdWithGuid(prefix, guid) {
    return `${prefix}_${guid}`;
}

function setParameterSpinner(id, parameter, segmentIndex, fitFunction, onFitMethodFunctionParameterChangeFunctionName) {
    let html = `<label>${FitSegmentFunctionParameterLabel}</label>`;
    html += `<input id="${id}" `;
    html += `data-default-value="${parameter.Value}" `;
    html += `data-min-value="${parameter.Minimum}" `;
    html += `data-max-value="${parameter.Maximum}" `;
    html += `data-step="${parameter.Step}" `;
    html += `data-fixed="4" `;
    html += `data-on-plus-click="${onFitMethodFunctionParameterChangeFunctionName}" `;
    html += `data-on-minus-click="${onFitMethodFunctionParameterChangeFunctionName}" `;
    html += `data-repeat-threshold="1000" `;
    html += `type="text" data-role="spinner" data-buttons-position="right">`;
    $(`#${id}_Container`).html(html);
    $(function () {
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

function createPointForFitting(point, spectrumId) {
    let pointBoundaries = createPointBoundariesForFitting(point, spectrumId);

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
    let index = pointsForFitting.findIndex(p => (p.P.X >= (point.X - POINT_RADIUS)) && (p.P.X <= (point.X + POINT_RADIUS)));

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

function createPointBoundariesForFitting(point, spectrumId) {
    let points = getPointsFromSeriesPointsProcedure(spectrumId, selectedSpectrumTypeForContinuumRemoval);

    let minXPoint;
    if (isExistingPointByX(points, point.X - fitPointSemiRange))
        minXPoint = getPointLowerThanX(points, point.X - fitPointSemiRange);
    else {
        let minX = getPointsMinX(points);
        minXPoint = getPointLowerThanX(points, minX);
    }

    let maxXPoint;
    if (isExistingPointByX(points, point.X + fitPointSemiRange))
        maxXPoint = getPointHigherThanX(points, point.X + fitPointSemiRange);
    else {
        let maxX = getPointsMaxX(points);
        maxXPoint = getPointHigherThanX(points, maxX);
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