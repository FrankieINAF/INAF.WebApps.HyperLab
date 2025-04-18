var FIT_POINT_CORE = 'FitPointCore';

/* ################################################################################ */
/* POINTS */
/* ################################################################################ */
function addPointUI(point) {
    let index = pointsForFitting.findIndex(p => p.P.X === point.P.X);

    if (index === -1)
        return;

    let wl = parseInt(point.P.X);
    let pointUIId = buildUIElementId(FIT_POINT_CORE, wl);
    let html = ``;
    html += `<div id="${pointUIId}" class="d-flex padding-bottom-8 margin-top-8 border-bottom">`;
    html += `<div class="pointer"><span class="mif mif-bin" title="${FitPointAtRemoveLabel}" onclick="${removePointUICore.name}(${index})"></span></div>`;
    let pointLabel = FitPointAtLabel.replace('r_v', wl);
    html += `<div class="margin-left-16"><p class="text-light">${pointLabel}</p></div>`;
    html += '</div>';

    $('#fitPointsListCore').append(html);
}

function removePointUICore(index) {
    let pointComplex = pointsForFitting[index];

    let point = pointComplex.P;

    removeSelectedPointFromFitting(point);

    let id = buildUIElementId(FIT_POINT_CORE, parseInt(pointComplex.P.X));
    $(`#${id}`).remove();
}

/* ################################################################################ */
/* SEGMENTS */
/* ################################################################################ */
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

    const segmentWithGuidResult = buildUIElementIdWithGuid(FIT_SEGMENT_CORE);
    const rangeLabelId = buildUIElementId(FIT_SEGMENT_CORE, segment.Index, 'RangeLabel');
    const segmentSelectId = buildUIElementId(FIT_SEGMENT_CORE, segment.Index, 'Select');
    const segmentContainerId = buildUIElementId(FIT_SEGMENT_CORE_VALUE, segment.Index, 'Container');
    let html = ``;
    html += `<div id="${segmentWithGuidResult.ElementId}" class="d-flex flex-column padding-bottom-8 margin-top-16 border-bottom">`;
    html += `    <div><span id="${rangeLabelId}">${rangeLabel}</span></div>`;
    html += `    <div class="d-flex flex-row">`;
    /*              rectangle for highlighting segment */
    //html += `       <div class="select-segment-rectangle pointer" onmouseover="${highlightSegmentForFitting.name}('${segmentId}')" onmouseout="${lowlightSegmentForFitting.name}('${segmentId}')">`;
    html += `       <div class="select-segment-rectangle pointer">`;
    html += `       </div>`;
    /*               column for functions */
    html += `        <div class="d-flex flex-column margin-top-8" style="width: 50%">`;
    html += `           <label>${FitSegmentFunctionsLabel}</label>`;
    html += `           <select id="${segmentSelectId}" data-role="select" data-on-item-select="${onSegmentFunctionSelectCoreAsync.name}">`;
    let fitFunctionsNum = fitFunctions.length;
    for (var i = 0; i < fitFunctionsNum; i++) {
        let value = buildUIElementId(segmentWithGuidResult.ElementId, fitFunctions[i].Id);
        html += `<option value="${value}">${fitFunctions[i].Name}</option>`;
    }
    html += `           </select>`;
    html += `        </div>`;
    /*               column for function parameter */
    html += `        <div id="${segmentContainerId}" class="d-flex flex-column margin-left-8 margin-top-8" style="width: 50%">`;
    html += `        </div>`;
    html += `    </div>`;
    html += `</div>`;

    $(async function () {
        //console.log('------------------------------------------------------------------------------------------')
        //console.log(`createSegmentFittingUICore - ready - segmentSelectId: ${segmentSelectId}`);
        await onSegmentFunctionSelectCoreAsync(Metro.getPlugin(`#${segmentSelectId}`, 'select').val());
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
        SegmentId: segmentWithGuidResult.ElementId,
        Guid: segmentWithGuidResult.Guid,
        Html: html
    };
}

async function onSegmentFunctionSelectCoreAsync(val, option, item) {
    //console.log(`onSegmentFunctionSelectCoreAsync ${val}`);

    let result = onSegmentFunctionSelectBase(val, FIT_SEGMENT_CORE, FIT_SEGMENT_CORE_VALUE);
    if (!result)
        return;

    /* add/update continuum segment */
    await buildContinuumSegmentAsync(result.SelectedFitFunction, segmentsForFitting[result.SegmentIndex].P0.P, segmentsForFitting[result.SegmentIndex].P1.P);
}

function removeSegmentForFittingUICore(segment) {
    const guid = getSegmentGuidFromDictionary(FIT_SEGMENT_CORE, segment.Index);

    if (!guid)
        return;

    removeSegmentFromDictionary(FIT_SEGMENT_CORE, segment.Index)
    //$(`#${getUIElementIdWithGuid(FIT_SEGMENT_CORE, guid)}`).remove();

    const segmentId = getUIElementIdWithGuid(FIT_SEGMENT_CORE, guid);
    let callback = function () { $(`#${segmentId}`).remove(); };
    animateCSS(segmentId, 'slideOutRight', FASTER, callback);
}
