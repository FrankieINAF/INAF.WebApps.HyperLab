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

const loadingCheckObj = {
    IsLoading: false,
    IsError: false,

    setError: function (isError) {
        this.IsError = isError;
    },

    setIsLoading: function (isLoading) {
        this.IsLoading = isLoading;
    },

    startLoading: function () {
        this.setIsLoading(true);
        this.setError(false);
    },

    stopLoading: function () {
        this.setIsLoading(false);
    },

    reset: function () {
        this.setIsLoading(false);
        this.setError(false);
    }
};

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
    /* enable event management for switch for loading whites spectra */
    initSwitchLoadWhiteSpectraForAlignment();

    /* automatically raise event for loading ref whites */
    setWhitesSwitchChecked(true);

    /* enable event management for switch for auto-aligning spectrum */
    await initSwitchLoadAutoAlignSpectrumAsync();

    /* enable event management for switch for auto-loading aligned spectrum */
    await initSwitchLoadAutoDownloadAlignedSpectrumAsync();

    initCheckBoxForShowingLines();

    buildSliders();
    await loadSelectedSegmentAsync();
    await loadNumOfPointsForAlignmentAsync();

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
            enqueueSaveSetting(getQueueItem(ALIGNMENT_SHOW_LINES, value));
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

        enqueueSaveSetting(getQueueItem(ALIGNMENT_AUTO_ALIGN_SPECTRUM, (isChecked ? '1' : '0')));

        if (isChecked) {
            /* show message for saved settings */
            showBubble('charmsSwitchAutoAlignSpectrumBubble');

            /* if auto align is enabled, then disable auto download */
            setSwitchAutoDownloadAlignedSpectrumAsync(false);
            enqueueSaveSetting(getQueueItem(ALIGNMENT_AUTO_DOWNLOAD_ALIGNED_SPECTRUM, '0'));
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

        enqueueSaveSetting(getQueueItem(ALIGNMENT_AUTO_DOWNLOAD_ALIGNED_SPECTRUM, (isChecked ? '1' : '0')));

        if (isChecked) {
            /* show message for saved settings */
            showBubble('charmsSwitchAutoDownloadAlignedSpectrumBubble');

            /* if auto download is enabled, then disable auto align */
            setSwitchAutoAlignSpectrum(false);
            enqueueSaveSetting(getQueueItem(ALIGNMENT_AUTO_ALIGN_SPECTRUM, '0'));
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
    loadingCheckObj.reset();
    loadingCheckObj.startLoading();

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

        loadingCheckObj.stopLoading();
        /* enable button for alignment and change title */
        setButtonAlignEnabled('alignmentButtonExecute', true, AlignmentButtonExecuteLabel);
    } else {
        loadingCheckObj.setError(true);
        loadingCheckObj.stopLoading();
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
    //if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED)) {
    //    showSimpleDialog(WARNING_LABEL, AlignedNoProcessBecauseAlreadyPresentMessage, WARNING);
    //    return;
    //}
    setLoadingCircleIsVisible(true);

    if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED))
        await removeSpectraProcedureAsync(SPECTRUM_TYPE_ALIGNED);

    let points = getSpectrumPointsById(selectedSpectrumForProcessingId);
    if (!points) {
        setLoadingCircleIsVisible(false);
        return;
    }

    /* check whether ref whites are going to be retrieved or not */
    if (loadingCheckObj.IsLoading) {
        //console.log('alignSpectrumAsync - loadingCheckObj.IsLoading');
        await waitForBooleanValueAsync(() => !loadingCheckObj.IsLoading, 400);
    }

    if (loadingCheckObj.IsError) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, AlignmentNoRefWhitesAvailableErrorMessage, ALERT);
        return;
    }

    if (isSpectrumAvailableByType(SPECTRUM_TYPE_REF_WHITE)) {
        let refWhiteYValuesMax = getRefWhiteYMax();

        let refSpectrumPoints = getSpectrumPointsBySpectrumType(SPECTRUM_TYPE_REF);

        points = await window.dotNetHelper.invokeMethodAsync("normalizePoints",
            points,
            refWhiteYValuesMax,
            refSpectrumPoints);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, AlignmentNoRefWhitesAvailableErrorMessage, ALERT);
        return;
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

    setLoadingCircleIsVisible(false);

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
    //loadPartialViewWithAjaxGetNoModel(UrlLoadSmoothingPanel, 'smoothingoptions');

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

    /* reset visual range to make all available spectra visible */
    //dxChartResetVisualRange(chartContainer);

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
    askForRemovingSpectrum(SPECTRUM_TYPE_ALIGNED, 'checkboxRemoveAlignedSpectrumOnCloud', 'alignedDialogRemove');
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