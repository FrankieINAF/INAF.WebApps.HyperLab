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

