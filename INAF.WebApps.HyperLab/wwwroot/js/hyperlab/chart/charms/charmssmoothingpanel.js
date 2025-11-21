var BY_SEGMENTS = "BySegments";
var BY_WHOLE_SPECTRUM = "ByWholeSpectrum";

var X_START = "XStart";
var X_END = "XEnd";

var WINDOW_SIZE = "WindowSize";
var POLYNOMIAL_ORDER = "PolynomialOrder";

var isAutoSaveSmoothingSettingsEnabled = false;
var timeoutSmoothingSettings;

var currentSmoothingType;
var smoothingSegmentsOptions;
var smoothingWholeSpectrumOptions;


var INCREASE = 'increase';
var DECREASE = 'decrease';

var smoothingsDictionary = {};

function getSrcSpectrumTypeVal() {
    return Metro.getPlugin('#srcSpectrumTypeList', 'select').val();
}

function setSrcSpectrumTypeVal(value) {
    Metro.getPlugin('#srcSpectrumTypeList', 'select').val(value);
}

async function onSrcSpectrumTypeSelected(selected) {
    //console.log(`onSrcSpectrumTypeSelected - selected: ${selected}`);

    const smoothingType = getSmoothingType();
    const destSpectrumType = await getDestSpectrumTypeAsync(smoothingType, getSrcSpectrumType());

    /* update cloud icons on panel */
    setCloudIconOnPanel(smoothingsDictionary[destSpectrumType], destSpectrumType);

    const srcSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, destSpectrumType);
    setButtonsEnabled(srcSpectrum != null, smoothingType);
}

function setButtonsEnabled(areEnabled, smoothingType) {
    switch (smoothingType) {
        case BY_SEGMENTS:
            setMetroUIButtonEnabled('smoothingBySegmentsButtonSave', areEnabled);
            setMetroUIButtonEnabled('smoothingBySegmentsButtonRemove', areEnabled);
            const buttonDownloadBySegments = $('#smoothingBySegmentsButtonDownload').children('button')[0];
            if (($(buttonDownloadBySegments)).hasClass('active'))
                $(buttonDownloadBySegments).toggleClass('active');
            setMetroUIButtonEnabled('smoothingBySegmentsButtonDownload', areEnabled);
            break;
        case BY_WHOLE_SPECTRUM:
            setMetroUIButtonEnabled('smoothingByWholeSpectrumButtonSave', areEnabled);
            setMetroUIButtonEnabled('smoothingByWholeSpectrumButtonRemove', areEnabled);
            const buttonDownloadByWholeSpectrum = $('#smoothingByWholeSpectrumButtonDownload').children('button')[0];
            if (($(buttonDownloadByWholeSpectrum)).hasClass('active'))
                $(buttonDownloadByWholeSpectrum).toggleClass('active');
            $('#smoothingByWholeSpectrumButtonDownload').toggleClass('active');
            setMetroUIButtonEnabled('smoothingByWholeSpectrumButtonDownload', areEnabled);
            break;
    }
}

async function callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(filename = null, spectrumType) {
    return await checkIsSpectrumOfTypeSavedOnCloudAsync(spectrumType, filename);
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

function loadSmoothingPanel() {
    /* load panel for smoothing */
    let callback = async function () {
        /* check which smoothed spectra are already saved on cloud */
        const callAlignedSmoothedBySegments = callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(null, SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS, false);
        const callAlignedSmoothed = callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(null, SPECTRUM_TYPE_ALIGNED_SMOOTHED, false);
        const callContinuumRemovedSmoothedBySegments = callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(null, SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS, false);
        const callContinuumRemovedSmoothed = callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(null, SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED, false);
        
        /* wait for all calls to complete */
        const [resAlignedSmoothedBySegments, resAlignedSmoothed, resContinuumRemovedSmoothedBySegments, resContinuumRemovedSmoothed] = await Promise.all([callAlignedSmoothedBySegments, callAlignedSmoothed, callContinuumRemovedSmoothedBySegments, callContinuumRemovedSmoothed]);

        /* store results in dictionary */
        smoothingsDictionary[SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS] = resAlignedSmoothedBySegments;
        smoothingsDictionary[SPECTRUM_TYPE_ALIGNED_SMOOTHED] = resAlignedSmoothed;
        smoothingsDictionary[SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS] = resContinuumRemovedSmoothedBySegments; 
        smoothingsDictionary[SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED] = resContinuumRemovedSmoothed;

        const currentSrcSpectrumTypeVal = getSrcSpectrumTypeVal();
        setCloudIconOnPanel(smoothingsDictionary[currentSrcSpectrumTypeVal], currentSrcSpectrumTypeVal);
    }
    loadPartialViewWithAjaxGetNoModel(UrlLoadSmoothingPanel, 'smoothingoptions', callback);
}

/* ################################################################################ */
/* AUTO SAVE SMOOTHING SETTINGS */
/* ################################################################################ */
async function initSwitchAutoSaveSmoothingSegmentsAsync() {
    await loadAutoSaveSmoothingSegmentsAsync();

    $('#charmsSwitchAutoSaveSmoothingSegments').on('change', async function () {
        let isChecked = isCheckboxChecked('charmsSwitchAutoSaveSmoothingSegments');

        tryCallEnqueueSaveSetting(SMOOTHING_AUTO_SAVE_SEGMENTS_SETTINGS, (isChecked ? '1' : '0'));

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

    findSpectrumChildrenByIdProcedure(selectedSpectrumForProcessingId);
    if (!isSLabSpectrumCurrentlySelected || isSLabConditionForSpectrumTypeHigherThanRaw())
        familyIds.push(selectedSpectrumForProcessingId);

    familyIds.forEach(function (item) {
        const spectrumInfo = getSpectrumById(item);
        if (!spectrumInfo)
            return;
        /* check if the spectrum is available by id and type */

        srcSpectrumTypes.forEach(function (item2) {
            if (spectrumInfo.SpectrumType == item2)
                availableNum++;
        });
    });

    return availableNum;
}

function selectTargetSpectrumType() {
    let availableNum = getAvailableSrcSpectrumTypesNum();

    /* get the current src spectrum type andd set as selected in select element even if it is hidden because
       its value is used by the smoothingsDictionary */
    let srcSpectrumType = getSrcSpectrumType();
    setSrcSpectrumTypeVal(srcSpectrumType);

    if (availableNum == 1) {
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
        if (isSLabSpectrumCurrentlySelected) {
            if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED))
                srcSpectrumType = SPECTRUM_TYPE_ALIGNED;
            else if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED))
                srcSpectrumType = SPECTRUM_TYPE_CONTINUUM_REMOVED;
        } else {
            if (isSpectrumAvailableByType(SPECTRUM_TYPE_ALIGNED))
                srcSpectrumType = SPECTRUM_TYPE_ALIGNED;
            else if (isSpectrumAvailableByType(SPECTRUM_TYPE_CONTINUUM_REMOVED))
                srcSpectrumType = SPECTRUM_TYPE_CONTINUUM_REMOVED;
        }
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
    html += getSmoothingSegmentUISpinner(segmentType, WINDOW_SIZE, index, null, 0, 30);
    html += `       </div>`;
    html += `       <div class="cell-fs-5">`;
    html += getSmoothingSegmentUISpinner(segmentType, POLYNOMIAL_ORDER, index, null, 0, 3);
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

    let windowSizeId = `${segmentType}${WINDOW_SIZE}${index}`;
    $(`#${windowSizeId}`).ready(function () {
        Metro.getPlugin(`#${windowSizeId}`, 'spinner').val(smoothingSegment.WindowSize);
        $(`#${windowSizeId}`).on('change', function (evt) {
            onSmoothingSegmentBySegmentsWindowSizeChangeEventAsync(evt.target.id);
        });
    });

    let polynomialOrderId = `${segmentType}${POLYNOMIAL_ORDER}${index}`;
    $(`#${polynomialOrderId}`).ready(function () {
        Metro.getPlugin(`#${polynomialOrderId}`, 'spinner').val(smoothingSegment.PolynomialOrder);
        $(`#${polynomialOrderId}`).on('change', function (evt) {
            onSmoothingSegmentBySegmentsPolynomialOrderChangeEventAsync(evt.target.id);
        });
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
    if (onValueChangeName) {
        html += `       data-on-plus-click="${onValueChangeName}"`;
        html += `       data-on-minus-click="${onValueChangeName}"`;
    }
    html += `       data-cls-spinner-button="fg-white">`;
    return html;
}

function getSmoothingType() {
    let children = $('#smoothingTypeTabs').children();
    if ($(children[0]).hasClass('active'))
        return BY_SEGMENTS;
    else
        return BY_WHOLE_SPECTRUM;

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
    let index = extractIndex(this.id, X_START);
    updateSmoothingSegment(index, X_START, request);

    /* to avoid overlapping between 2 segments boundaries, when a segment lower boundary changes, the previous upper boundary changes consequently */
    if (index > 0 && index < getSmoothingSegmentsNum()) {
        updateSmoothingSegmentUIProperty(BY_SEGMENTS, index - 1, X_END, request);
    }

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

async function onSmoothingSegmentBySegmentsXEndChangeAsync(curr, request, real) {
    let index = extractIndex(this.id, X_END);
    updateSmoothingSegment(index, X_END, request);

    /* to avoid overlapping between 2 segments boundaries, when a segment upper boundary changes, the next lower boundary changes consequently */
    if (index >= 0 && index < (getSmoothingSegmentsNum() - 1)) {
        updateSmoothingSegmentUIProperty(BY_SEGMENTS, index + 1, X_START, request);
    }

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

async function onSmoothingSegmentBySegmentsPolynomialOrderChangeEventAsync(id) {
    //console.log(`onSmoothingSegmentBySegmentsWindowSizeChangeAsync - request: ${request}`);
    let index = extractIndex(id, POLYNOMIAL_ORDER);
    let request = parseInt(Metro.getPlugin(`#${id}`, 'spinner').val());
    //console.log(`onSmoothingSegmentBySegmentsPolynomialOrderChangeEventAsync - index: ${index}, request: ${request}`);
    updateSmoothingSegment(index, POLYNOMIAL_ORDER, request);

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

async function onSmoothingSegmentBySegmentsWindowSizeChangeEventAsync(id) {
    //console.log(`onSmoothingSegmentBySegmentsWindowSizeChangeAsync - request: ${request}`);
    let index = extractIndex(id, WINDOW_SIZE);
    let request = parseInt(Metro.getPlugin(`#${id}`, 'spinner').val());
    //console.log(`onSmoothingSegmentBySegmentsWindowSizeChangeEventAsync - index: ${index}, request: ${request}`);
    updateSmoothingSegment(index, WINDOW_SIZE, request);

    await trySaveSmoothingSettingsAsync(BY_SEGMENTS);
}

function extractIndex(id, replaceValue) {
    let _index = id.replace(BY_SEGMENTS, '').replace(replaceValue, '');
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
            segments = [smoothingWholeSpectrumOptions];
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

        tryCallEnqueueSaveSetting(timeoutSmoothingSettings, key, xml);
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
    currentSmoothingType = smoothingType;

    setLoadingCircleIsVisible(true);

    /* retrieve spectrumType of spectrum to be processed */
    let srcSpectrumType = getSrcSpectrumType();

    /* retrieve points of continuum for removing it from aligned */
    let toBeSmoothedPoints = getSpectrumPointsBySpectrumType(srcSpectrumType);
    if (!toBeSmoothedPoints) {
        setLoadingCircleIsVisible(false);
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
        setLoadingCircleIsVisible(false);
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

        setLoadingCircleIsVisible(false);

        let infoMessage = '';
        switch (smoothingType) {
            case BY_SEGMENTS:
                infoMessage = SmoothingBySegmentsCompletedMessage;
                break;

            case BY_WHOLE_SPECTRUM:
                infoMessage = SmoothingByWholeSpectrumCompletedMessage;
                break;
        }
        addMessage(infoMessage, 3000, INFO);
    }
    else {
        setLoadingCircleIsVisible(false);
        addMessage(SmoothingExecutionErrorMessage, 0, ALERT, displayMessage = false);
        showSimpleDialog(ERROR_LABEL, SmoothingExecutionErrorMessage, ALERT);
    }
}

function buildSmoothedSpectrum(smoothingType, srcSpectrumType, destSpectrumType) {
    try {
        /* retrieve RAW spectrum */
        let baseSpectrum = getSpectrumById(selectedSpectrumForProcessingId);

        /* retrieve info about parent spectrum */
        let srcSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, srcSpectrumType);
        if (srcSpectrum == null && srcSpectrumType == SPECTRUM_TYPE_ALIGNED)
            srcSpectrum = baseSpectrum;

        /* build spectrum info for being added to 'spectraInfo' */
        let smoothedSpectrum = buildSpectrum(buildTempSmoothedSpectrumId(srcSpectrumType, smoothingType),
            srcSpectrum.Id,
            baseSpectrum.Name,
            baseSpectrum.SpectrumLevel,
            destSpectrumType,
            baseSpectrum.SpectrumSource);
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
    showByClass(`smoothing${smoothingType}ButtonDownload`);

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
        ParentFile: buildParentFile(parentId),
        RefFile: null,
        RefWhiteFile: null
    };
}

async function saveSmoothedSpectrumProcedureAsync(smoothingType) {
    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(smoothingType, getSrcSpectrumType());

    let spectrum = getSpectrumById(buildTempSmoothedSpectrumId(getSrcSpectrumType(), smoothingType));
    if (!spectrum)
        spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, getSrcSpectrumType());

    if (!spectrum) {
        showSimpleDialog(ERROR_LABEL, SmoothedSaveErrorMessage, ALERT);
        return;
    }

    let cond1 = await checkIsSpectrumOfTypeSavedOnCloudAsync(destSpectrumType, spectrum.Name);
    let cond2 = isSpectrumOfTypeSavedOnCloud(destSpectrumType);
    if (cond1 || cond2)
        askAndExecute(CharmsSpectraProcessingManagementLabel, OverwriteSavedSpectrumQuestion, saveSmoothedSpectrumAsync, [spectrum, smoothingType, destSpectrumType, true]);
    else
        saveSmoothedSpectrumAsync(spectrum, smoothingType, destSpectrumType);
}

async function saveSmoothedSpectrumAsync(spectrum, smoothingType, destSpectrumType, showLoadingAndMessage = true) {
    let isSavingOk = true;

    try {
        const srcSpectrumType = getSrcSpectrumType();

        if (showLoadingAndMessage)
            setLoadingCircleIsVisible(true);

        /* retrieve parent file */
        /* usually the 1st method works... */
        let srcSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, srcSpectrumType);
        /* but when an aligned spectrum is the main parent, we need this second search to get info */
        if (!srcSpectrum)
            srcSpectrum = getSpectrumById(selectedSpectrumForProcessingId);
        if (srcSpectrum.Id == buildTempSmoothedSpectrumId(srcSpectrumType, smoothingType))
            srcSpectrum.Id = 0;

        const parentFiles = getSmoothedParentFiles(srcSpectrum.Id);

        let smoothingOptions;
        switch (smoothingType) {
            case BY_SEGMENTS:
                smoothingOptions = smoothingSegmentsOptions;
                break;

            case BY_WHOLE_SPECTRUM:
                smoothingOptions = [smoothingWholeSpectrumOptions];
                break;
        }

        const smoothingSettings = {
            Segments: smoothingOptions
        };

        const xml = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeSmoothedModelAsXml",
            spectrum.Name,
            spectrum.SpectrumType,
            getSpectrumPointsById(spectrum.Id),
            smoothingSettings,
            parentFiles);

        const spectrumFile = buildSpectrumFile(srcSpectrum.Id,
            spectrum.Name,
            spectrum.SpectrumLevel,
            spectrum.SpectrumType,
            spectrum.SpectrumSource,
            xml);

        /* create model for request */
        const saveSpectrumRequest = {
            SpectrumFile: spectrumFile,
            SmoothingSettings: smoothingSettings,
            ParentFiles: parentFiles, // defined in charms.js
        };

        /* execute request and process response */
        const obj = await doAjaxPostAsync(UrlSaveSpectrumOfTypeSmoothed, saveSpectrumRequest);
        if (obj) {
            if (obj.IsOk) {
                const index = getSpectrumIndexById(spectrum.Id);

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

        if (isSavingOk) {
            let smoothedSavingMessage = '';
            switch (smoothingType) {
                case BY_SEGMENTS:
                    smoothedSavingMessage = SmoothedBySegmentsSaveSuccessMessage;
                    break;

                case BY_WHOLE_SPECTRUM:
                    smoothedSavingMessage = SmoothedByWholeSpectrumSaveSuccessMessage;
                    break;
            }
            addMessage(smoothedSavingMessage, 3000, INFO);
        }
        else {
            addMessage(SmoothedSaveErrorMessage, 0, ALERT, displayMessage = false);
            showSimpleDialog(ERROR_LABEL, SmoothedSaveErrorMessage, ALERT);
        }
    }
}

/* ################################################################################ */
/* REMOVE SMOOTHED SPECTRUM */
/* ################################################################################ */
async function callRemoveSpectraProcedureAsync(dialogId, checkboxId) {
    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(currentSmoothingType, getSrcSpectrumType());

    removeSpectraProcedureAsync(destSpectrumType, dialogId, checkboxId);
}

async function removeSmoothedSpectrumProcedure(smoothingType) {
    currentSmoothingType = smoothingType;

    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(smoothingType, getSrcSpectrumType());

    askForRemovingSpectrum(destSpectrumType, 'checkboxRemoveSmoothedSpectrumOnCloud', 'smoothedDialogRemove');
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
    hideByClass(`smoothing${smoothingType}ButtonDownload`);

    /* refresh legend, if opened */
    refreshCharmsLegend();

    /* hide selected spectra for improving visualization */
    hideSpectraToBeHidden();

    /* set text of cloud icon */
    setCloudTextAndIconStatus(SPECTRUM_TYPE_ALIGNED, false);
    await callCheckIsSpectrumOfTypeSavedOnCloudForSmoothedAsync(smoothedSpectrum.Name, smoothedSpectrum.SpectrumType);
}

/* ################################################################################ */
/* DOWNLOAD SMOOTHED SPECTRUM */
/* ################################################################################ */
async function downloadSmoothedSpectrumAsCsvAsync() {
    /* retrieve spectrumType of spectrum to be processed */
    let srcSpectrumType = getSrcSpectrumType();

    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(currentSmoothingType, srcSpectrumType);

    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, destSpectrumType);
    if (!spectrum)
        return;

    let txt = await window.dotNetHelper.invokeMethodAsync("getSpectrumOfTypeAsTxt",
        spectrum.Name,
        destSpectrumType,
        getSpectrumPointsById(spectrum.Id),);
    //console.info(txt);

    executeDownloadFile(txt, `${spectrum.Name}_${getSpectrumTypeString(destSpectrumType)}.csv`)
}

async function downloadSmoothedSpectrumAsXmlAsync() {
    /* retrieve spectrumType of spectrum to be processed */
    let srcSpectrumType = getSrcSpectrumType();

    /* retrieve spectrumType of processed spectrum */
    let destSpectrumType = await getDestSpectrumTypeAsync(currentSmoothingType, srcSpectrumType);

    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, destSpectrumType);
    if (!spectrum)
        return;

    /* retrieve parent file */
    let srcSpectrum = null;
    switch (spectrum.SpectrumSource) {
        case SPECTRUM_SOURCE_SLAB:
            srcSpectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, srcSpectrumType);
            break;

        case SPECTRUM_SOURCE_EXTERNAL:
            srcSpectrum = getChildSpectrumByIdAndSpectrumType(selectedSpectrumForProcessingId, srcSpectrumType);
            break;

        default:
    }
    if (srcSpectrum.Id == buildTempSmoothedSpectrumId(srcSpectrumType, currentSmoothingType))
        srcSpectrum.Id = 0;

    /* un-authenticated users do not save spectra on cloud so they cannot have parent files with valid Id */
    let parentFiles = null;
    if (isUserAuthenticated)
        parentFiles = getSmoothedParentFiles(srcSpectrum.Id);
    //let parentFiles = getSmoothedParentFiles(srcSpectrum.Id);
    //if (!Number.isInteger(parentFiles.ParentFile.Id))
    //    parentFiles.ParentFile.Id = 0;

    let smoothingOptions;
    switch (currentSmoothingType) {
        case BY_SEGMENTS:
            smoothingOptions = smoothingSegmentsOptions;
            break;

        case BY_WHOLE_SPECTRUM:
            smoothingOptions = [smoothingWholeSpectrumOptions];
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

    executeDownloadFile(xml, `${spectrum.Name}_${getSpectrumTypeString(destSpectrumType)}.xml`)
}