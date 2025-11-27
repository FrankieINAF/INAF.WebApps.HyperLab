var SERIES_HIGHLIGHTENED_BAND = 'highlightenedBandSeries'
var SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT = 'highlightenedBandSeriesMaxValuePoint';
var SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT = 'highlightenedBandSeriesMinValuePoint';

var SERIES_BAND_CENTER = 'BandCenterSeries';
var SERIES_BAND_CENTER_POINT = 'BandCenterSeriesPoint';

var SERIES_FWHM = 'FwhmSeries';
var SERIES_FWHM_POINT = 'FwhmSeriesPoint';

var SERIES_NORMAL_FIT = 'NormalFitSeries'
var SERIES_NORMAL_FIT_POINT = 'NormalFitPoint';

var SERIES_INVERTED_BAND = 'InvertedBandSeries';
var SERIES_INVERTED_BAND_POINT = 'InvertedBandSeriesPoint';

var BAND_AREA_COLOR = '#b21309';
var BAND_LINES_COLOR = '#1496d7';

var lastSelectedSegmentForBand;

var isBandAnalysisAvailable;

var isBandDepthCharmsOpened = false;
var fitPoints;

var bandAnalysis = {
    id: 0,
    boundaries: [],
    area: 0,
    center: 0,
    depth: 0,
    fwhmResult: null,
    isEvaluated: false,
    isSaved: false
}

var bandsAnalysisData;

/* ################################################################################ */
/* CREATE LIST OF SEGMENTS */
/* ################################################################################ */
function createListOfSegmentsForBandAnalysis() {
    /* clear list of segments */
    $('#bandsAnalysisSegmentsListContainer').empty();

    let segmentsNum = segmentsForFitting.length;
    if (segmentsNum == 0)
        return;

    /* create new list of segments */
    let html = `<div class="d-flex flex-column">`;
    for (var i = 0; i < segmentsNum; i++) {
        html += `<div class="d-flex flex-row margin-top-8">`;
        html += `<button class="button light cycle small outline pointer" onclick="${startBandAnalysisProcedureAsync.name}(${segmentsForFitting[i].P0.P.X}, ${segmentsForFitting[i].P1.P.X})" title="${BandAnalysisStartBandAnalysisButtonTitle}"><span class="mif-calculator"></span></button>`;
        html += `<span class="margin-left-16">Segment ${i}:</span>`;
        html += `<span class="margin-left-16">[${segmentsForFitting[i].P0.P.X}, ${segmentsForFitting[i].P1.P.X}]</span>`;
        html += `</div>`;
    }
    html += `</div>`;
    
    $('#bandsAnalysisSegmentsListContainer').html(html);
}

/* ################################################################################ */
/* START BAND ANALYSIS */
/* ################################################################################ */
async function startBandAnalysisProcedureAsync(x0, x1) {
    /* retrieve available analysis data, if present */
    getBandsAnalysisDataAsync();

    setLoadingCircleIsVisible(true);

    /* start retrieving info for evaluating bands analysis data */
    let segmentForFitting = segmentsForFitting.find(s => s.P0.P.X <= x0 && s.P1.P.X >= x1);

    /* if no existing segment in segmentsForFitting is found, no action is required */
    if (!segmentForFitting) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, BandAnalysisSegmentFittingError, ALERT);
        return;
    }

    /* if we're dealing with the same band, no action is required */
    if (lastSelectedSegmentForBand && segmentForFitting.P0.P.X == lastSelectedSegmentForBand.P0.P.X && segmentForFitting.P1.P.X == lastSelectedSegmentForBand.P1.P.X) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, BandAnalysisAlreadyExecutedOnBandWarningMessage, WARNING);
        return;
    }

    /* let's find the series name */
    let spectrum = getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (!spectrum) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, BandAnalysisNoSpectrumFoundErrorMessage, ALERT);
        return;
    }

    let seriesIndex = findChartSeriesIndexByValueFieldId(spectrum.Id);
    if (seriesIndex == -1) {
        seriesIndex = findChartSeriesIndexByValueFieldId(buildTempContinuumRemovedId(selectedSpectrumForProcessing.Id));
        if (seriesIndex == -1) {
            setLoadingCircleIsVisible(false);
            showSimpleDialog(ERROR_LABEL, BandAnalysisNoSpectrumFoundErrorMessage, ALERT);
            return;
        }
    }

    let series = chartSeries[seriesIndex];

    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);

    /* if a band is already highlightened, remove it */
    if (lastSelectedSegmentForBand)
        removeHighlightenedBand(items);

    /* save current segment */
    lastSelectedSegmentForBand = segmentForFitting;

    /* calculate band-depth parameters */
    await executeBandAnalysisProcedureAsync(series, items);

    setLoadingCircleIsVisible(false);
}

async function executeBandAnalysisProcedureAsync(series, items) {
    await executeBandAnalysisAsync(series, items);

    isBandDepthCharmsOpened = true;
}

async function executeBandAnalysisAsync(series, items) {
    /* retrieve all points of all series from chart */
    //let items = dxChartGetItems(chartContainer);

    /* remove previous analysis and UI items, if available */
    clearBandAnalysisProcedure(items);

    /* find points in range selected by the highlightened band */
    const seriesPoints = dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED)));
    const pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), lastSelectedSegmentForBand.P0.P.X, lastSelectedSegmentForBand.P1.P.X);

    /* extract y values from points */
    const pointsInRangeXValues = pointsInRange.map(p => p.X);
    const pointsInRangeYValues = pointsInRange.map(p => p.Y);

    /* find the min value of the continuum-removed points in the selected range */
    const selectedRangeXMin = Math.min(...pointsInRangeXValues);
    const selectedRangeXMax = Math.max(...pointsInRangeXValues);

    /* show current band boundaries */
    $('#bandAnalysisBandBoundariesMinValue').text(selectedRangeXMin);
    $('#bandAnalysisBandBoundariesMaxValue').text(selectedRangeXMax);

    //console.log(`Selected band boundaries: [${selectedRangeXMin}, ${selectedRangeXMax}]`);
    saveBandBoundaries([selectedRangeXMin, selectedRangeXMax]);

    /* calculate values that fit the input values */
    const fitResult = await window.dotNetHelper.invokeMethodAsync("getAbsorptionBandGaussianFit",
        pointsInRangeXValues,
        pointsInRangeYValues);

    /* retrieve values for next calculations */
    const wavelength = parseInt(fitResult.μ);
    //console.log(`Wavelength (band center): ${wavelength}`);
    const bandCenter = pointsInRange.find(p => p.X == wavelength);
    if (!bandCenter) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, BandAnalysisBandCenterNotFoundErrorMessage, ALERT);
        return;
    }

    //console.log(`μ: ${fitResult.μ}, σ: ${fitResult.σ}`);
    /* 2.0) show band center */
    setBandCenter(parseFloat(fitResult.μ));

    /* 2.1) show band center on chart */
    showBandCenterOnChart(items, wavelength, bandCenter);

    //let invertedYValues = invertYValuesBottomToTop(yValues);
    //showInvertedBand(items, xValues, invertedYValues);

    /* 2.2) show the gaussian fit on chart */
    showGaussianFit(items, pointsInRangeXValues, pointsInRangeYValues, fitResult);

    /* 2.3) highlight the selected band */
    await highlightBandAsync(series.name, lastSelectedSegmentForBand, items);

    /* 3) band depth */
    const bandDepth = evaluateBandDepth(wavelength, bandCenter);

    const fitPointsYValues = fitPoints.map(p => p.Y);

    /* 4) band area */
    evaluateBandAreaAsync(pointsInRangeXValues, fitPointsYValues);

    /* 5) fwhm of spectrum selected band */
    evaluateFwhmAsync(items, pointsInRangeXValues, pointsInRangeYValues, bandCenter.X, bandDepth);

    /* reset visual range to make ref whites appear in chart */
    dxChartResetVisualRange(chartContainer);

    enableByClassElem('bandAnalysisDataButtonSave');
    showByClass('bandAnalysisButtonDownload');

    /* set isEvaluated value */
    saveIsEvaluated(true);

    removeClass('bandAnalysisResultsContainer', 'd-none');
    addClass('bandAnalysisResultsContainer', 'd-flex');
    addClass('bandAnalysisResultsContainer', 'flex-column');

    isBandAnalysisAvailable = true;
}
/* ################################################################################ */
/* BAND ANALYSIS STEPS */
/* ################################################################################ */
async function evaluateBandAreaAsync(xs, ys) {
    let area = await window.dotNetHelper.invokeMethodAsync("evaluateBandArea",
        xs,
        ys);

    setBandArea(parseFloat(area));
}

function evaluateBandDepth(wavelength, bandCenter) {
    /* retrieve the point on fittedPoints corresponding to the band center */
    let bandCenterFittedPoint = fitPoints.find(p => p.X == wavelength);

    let bandDepth = bandCenterFittedPoint.Y - bandCenter.Y;
    setBandDepth(bandDepth);

    return bandDepth;
}

async function evaluateFwhmAsync(items, xs, ys, bandCenterX, bandDepth) {
    let fwhmResult = await window.dotNetHelper.invokeMethodAsync("evaluateFwhm",
        xs,
        ys,
        bandCenterX,
        bandDepth);

    if (!fwhmResult)
        return;

    setFwhm(fwhmResult);

    showFwhm(items, fwhmResult.leftMargin, fwhmResult.rightMargin)
}

async function rebuildFwhmAsync(items, xs, ys, fwhmLeftMargin, fwhmRightMargin) {
    let fwhmResult = await window.dotNetHelper.invokeMethodAsync("rebuildFwhm",
        xs,
        ys,
        fwhmLeftMargin,
        fwhmRightMargin);

    if (!fwhmResult)
        return;

    setFwhm(fwhmResult);

    showFwhm(items, fwhmResult.leftMargin, fwhmResult.rightMargin);
}

function setBandArea(bandArea) {
    setTextField('bandAnalysisBandAreaValue', bandArea.toFixed(3));

    saveBandArea(bandArea);
}

function setBandCenter(bandCenterX) {
    setTextField('bandAnalysisBandCenterValue', bandCenterX.toFixed(3));
    showByClass('bandAnalysisBandCenterUnit');

    saveBandCenter(bandCenterX);
}

function setBandDepth(bandDepth) {
    setTextField('bandAnalysisBandDepthValue', parseFloat(bandDepth).toFixed(3));

    saveBandDepth(bandDepth);
}

function setFwhm(fwhmResult) {
    setTextField('bandAnalysisBandFwhmValue', fwhmResult.fwhm);
    showByClass('bandAnalysisBandFwhmUnit');

    saveBandFwhm(fwhmResult);
}

function showBandCenterOnChart(items, wavelength, bandCenter) {
    setPointOnChart(items, wavelength, bandCenter.Y, SERIES_BAND_CENTER_POINT);

    let bandCenterSeries = createSeriesFromSpectrumName(SERIES_BAND_CENTER_POINT, SERIES_BAND_CENTER, '#9933ff', true, true);
    bandCenterSeries.point.size = 12;
    addChartSeries(bandCenterSeries);

    dxChartUpdateSeries(chartContainer, chartSeries);

    hideSpectraToBeHidden();
}

function showGaussianFit(items, xValues, yValues, fitResult) {
    let invertedYValues = invertYValuesBottomToTop(yValues);

    let yValuesYMax = Math.max(...yValues);
    let fixedFitResultYValues = [];

    let invertedYValuesNum = invertedYValues.length;
    for (var i = 0; i < invertedYValuesNum; i++) {
        fixedFitResultYValues[i] = yValuesYMax + fitResult.yValues[i];
    }

    let updatedFixedFitResultYValues = updateSegmentYRange(invertedYValues, fixedFitResultYValues);

    let invertedFitResultYValues = [];
    for (var i = 0; i < invertedYValuesNum; i++) {
        invertedFitResultYValues[i] = yValuesYMax - Math.abs(updatedFixedFitResultYValues[i] - yValuesYMax);
    }

    dxChartBeginUpdate(chartContainer);

    addChartSeriesItems(items, xValues, invertedFitResultYValues, SERIES_NORMAL_FIT_POINT);

    let normalFitSeries = createSeriesFromSpectrumName(SERIES_NORMAL_FIT_POINT, SERIES_NORMAL_FIT, BAND_LINES_COLOR, true, false);
    addChartSeries(normalFitSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    hideSpectraToBeHidden();
}

function showFwhm(items, leftMargin, rightMargin) {
    dxChartBeginUpdate(chartContainer);

    let indexLeftMargin = items.findIndex(p => p.X == leftMargin.X);
    if (indexLeftMargin > -1)
        items[indexLeftMargin][SERIES_FWHM_POINT] = leftMargin.Y;

    let indexRightMargin = items.findIndex(p => p.X == rightMargin.X);
    if (indexRightMargin > -1)
        items[indexRightMargin][SERIES_FWHM_POINT] = rightMargin.Y;

    let fwhmSeries = createSeriesFromSpectrumName(SERIES_FWHM_POINT, SERIES_FWHM, BAND_LINES_COLOR, false, false);
    addChartSeries(fwhmSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    hideSpectraToBeHidden();
    dxChartResetVisualRange(chartContainer);
}

// ONLY FOR DEVELOPMENT
function showInvertedBand(items, xValues, invertedYValues) {
    dxChartBeginUpdate(chartContainer);

    addChartSeriesItems(items, xValues, invertedYValues, SERIES_INVERTED_BAND_POINT);

    let invertedBandSeries = createSeriesFromSpectrumName(SERIES_INVERTED_BAND_POINT, SERIES_INVERTED_BAND, '#9933ff', true, false);
    addChartSeries(invertedBandSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    hideSpectraToBeHidden();
}

/* -------------------------------------------------------------------------------- */
/* CLEAR BAND ANALYSIS */
/* -------------------------------------------------------------------------------- */
function clearBandAnalysisProcedureCaller() {
    if (!isBandAnalysisAvailable)
        return;

    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);

    clearBandAnalysisProcedure(items);
}

function clearBandAnalysisProcedure(items) {
    if (!isBandAnalysisAvailable)
        return;

    disableByClassElem('bandAnalysisDataButtonSave');
    hideByClass('bandAnalysisButtonDownload');

    /* remove highlitened band */
    removeHighlightenedBand(items);

    /* remove band center */
    clearBandCenter(items);

    /* remove gaussian fit */
    clearBandAnalysisNormalFit(items);

    /* remove fwhm fit */
    clearFwhm(items);

    clearTextFields();

    hideSpectraToBeHidden();

    isBandAnalysisAvailable = false;
}

function clearBandAnalysisNormalFit(items) {
    if (items.length == 0)
        return;

    /* remove chart series */
    removeChartSeriesByFieldIdProcedure(chartContainer, items, SERIES_NORMAL_FIT_POINT);
}

function clearBandCenter(items) {
    if (items.length == 0)
        return;

    /* remove chart series */
    removeChartSeriesByFieldIdProcedure(chartContainer, items, SERIES_BAND_CENTER_POINT);
}

function clearFwhm(items) {
    if (items.length == 0)
        return;

    /* remove chart series */
    removeChartSeriesByFieldIdProcedure(chartContainer, items, SERIES_FWHM_POINT);
}

function clearTextFields() {
    setTextField('bandAnalysisBandCenterValue', '-');
    setTextField('bandAnalysisBandFwhmValue', '-');
    setTextField('bandAnalysisBandDepthValue', '-');
    setTextField('bandAnalysisBandAreaValue', '-');

    hideByClass('bandAnalysisBandFwhmUnit');
    hideByClass('bandAnalysisBandCenterUnit');
}

/* ################################################################################ */
/* MANAGE BAND ANALYSIS OBJECT */
/* ################################################################################ */
function saveBandArea(bandArea) {
    bandAnalysis.area = bandArea;
}

function saveBandBoundaries(boundaries) {
    bandAnalysis.boundaries = boundaries;
}

function saveBandCenter(bandCenter) {
    bandAnalysis.center = bandCenter;
}

function saveBandDepth(bandDepth) {
    bandAnalysis.depth = bandDepth;
}

function saveBandFwhm(fwhmResult) {
    bandAnalysis.fwhmResult = fwhmResult;
}

function saveIsEvaluated(isEvaluated) {
    bandAnalysis.isEvaluated = isEvaluated;
}

/* ################################################################################ */
/* BAND HIGHLIGHTENING */
/* ################################################################################ */
function initLastSelectedSegmentForBand() {
    lastSelectedSegmentForBand = null;
}

async function highlightBandAsync(seriesName, segmentForFitting, items) {
    /* retrieve (continuum-removed) series points between the 2 points which define the band  */
    let seriesPoints = dxChartGetSeriesPoints(chartContainer, seriesName);
    let pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), segmentForFitting.P0.P.X, segmentForFitting.P1.P.X);

    /* extract the x values */
    let xArray = pointsInRange.map(p => { return p.X });

    /* extract the y values of the points belonging to the band */
    let minValArray = pointsInRange.map(p => { return p.Y });

    /* retrieve y values along the line connecting the 2 points which define the band */
    let processingResult = await window.dotNetHelper.invokeMethodAsync("fitSegmentAsync",
        pointsInRange,
        fitFunctions[0]); //fitFunctions[0] is 'linear fit'. DO NOT CHANGE IT SINCE WE WANT TO HIGHLIGHT BAND BY FILLING AREA
    let maxValArray = processingResult.Points.map(p => { return p.Y });

    /* save fitted points in memory */
    fitPoints = processingResult.Points;

    dxChartBeginUpdate(chartContainer);

    let seriesPointsNum = seriesPoints.length;
    for (var i = 0; i < seriesPointsNum; i++) {
        let index = items.findIndex(p => p.X == xArray[i]);
        if (index > -1) {
            items[index][SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT] = minValArray[i];
            items[index][SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT] = maxValArray[i];
        }
    }

    let bandSeries = {
        type: 'rangeArea',
        argumentField: 'X',
        rangeValue1Field: SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT,
        rangeValue2Field: SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT,
        name: SERIES_HIGHLIGHTENED_BAND,
        axis: 'valueAxis',
        color: BAND_AREA_COLOR,
        showInLegend: false,
        isVisible: true
    };
    addChartSeries(bandSeries);
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    //hideSpectraToBeHidden();

    dxChartResetVisualRange(chartContainer);
}

function removeHighlightenedBand(items) {
    let pointsInRange = items.filter(p => p.X >= lastSelectedSegmentForBand.P0.P.X && p.X <= lastSelectedSegmentForBand.P1.P.X);

    dxChartBeginUpdate(chartContainer);

    let pointsInRangeNum = pointsInRange.length;
    for (var i = 0; i < pointsInRangeNum; i++) {
        let index = items.findIndex(p => p.X == pointsInRange[i].X);
        if (index > -1) {
            delete items[index][SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT];
            delete items[index][SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT];
        }
    }

    removeChartSeriesByNameProcedure(chartContainer, SERIES_HIGHLIGHTENED_BAND);

    dxChartEndUpdate(chartContainer);

    dxChartResetVisualRange(chartContainer);

    hideSpectraToBeHidden();

    /* reset visual range to make ref whites appear in chart */
    //dxChartResetVisualRange(chartContainer);
}

/* ################################################################################ */
/* RETRIEVE BAND ANALYSIS DATA LIST */
/* ################################################################################ */
async function getBandsAnalysisDataAsync() {
    let model = {
        FileId: selectedSpectrumForProcessing.Id,
    };

    let obj = await doAjaxGetAsync(UrlGetBandsAnalysisData, model);
    if (obj && obj.IsOk) {
        bandsAnalysisData = obj.ResponseObject;

        buildListOfAvailableBandsAnalysisData(obj.ResponseObject);
    }
}

function buildListOfAvailableBandsAnalysisData(listObj) {
    let bandsNum = listObj.length;

    if (bandsNum == 0) {
        setBandsAnalysisDataDownloadVisibile(false);
        return;
    }

    let html = ``;
    html += `<div class="margin-horizontal-8 margin-vertical-8">`;
    for (var i = 0; i < bandsNum; i++) {
        html += `<div class="margin-vertical-4">`;
        html += `<span class="mif-file-download fg-white pointer margin-right-8" onclick="${downloadBandAnalysisDataProcedure.name}(${listObj[i].Id})" title="${BandAnalysisDownloadBandsAnalysisLabel}"></span>&nbsp;<span>[</span><span>${listObj[i].LeftBoundary}</span>,&nbsp;<span>${listObj[i].RightBoundary}</span><span>]</span>`;
        html += `</div>`;
    }
    html += `</div>`;

    $('#bandsAnalysisDataList').html(html);

    setBandsAnalysisDataDownloadVisibile(true);
}

function setBandsAnalysisDataDownloadVisibile(isVisible) {
    if (isVisible) {
        removeClass('availableBandsAnalysisData', 'd-none');
        addClass('availableBandsAnalysisData', 'd-flex');
        addClass('availableBandsAnalysisData', 'flex-column');
    } else {
        removeClass('availableBandsAnalysisData', 'd-flex');
        removeClass('availableBandsAnalysisData', 'flex-column');
        addClass('availableBandsAnalysisData', 'd-none');
    }
}

/* ################################################################################ */
/* DOWNLOAD SELECTED BAND ANALYSIS DATA */
/* ################################################################################ */
function downloadBandAnalysisDataProcedure(id) {
    if (bandAnalysis.isEvaluated)
        askAndExecuteWithTimeout(BandAnalysisManagementLabel, BandAnalysisReplaceBandsAnalysisQuestion, downloadBandAnalysisDataAsync, [id], 400);
    else
        downloadBandAnalysisDataAsync(id);
}

async function downloadBandAnalysisDataAsync(id) {
    setLoadingCircleIsVisible(true);

    /* retrieve all points of all series from chart */
    let items = dxChartGetItems(chartContainer);
    clearBandAnalysisProcedure(items);

    dxChartResetVisualRange(chartContainer);

    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetBandAnalysisData, model);
    if (obj && obj.IsOk) {
        saveBandBoundaries([obj.ResponseObject[0].LeftBoundary, obj.ResponseObject.RightBoundary]);
        setBandCenter(obj.ResponseObject[0].BandCenterX);
        setBandDepth(obj.ResponseObject[0].BandDepth);
        setBandArea(obj.ResponseObject[0].BandArea);

        /* find points in range selected by the highlightened band */
        let seriesPoints = dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromSpectrum(getSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED)));
        let pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), obj.ResponseObject[0].LeftBoundary, obj.ResponseObject[0].RightBoundary);

        /* extract y values from points */
        let pointsInRangeXValues = pointsInRange.map(p => p.X);
        let pointsInRangeYValues = pointsInRange.map(p => p.Y);

        /* calculate values that fit the input values */
        let fitResult = await window.dotNetHelper.invokeMethodAsync("getAbsorptionBandGaussianFit",
            pointsInRangeXValues,
            pointsInRangeYValues);
        showGaussianFit(items, pointsInRangeXValues, pointsInRangeYValues, fitResult);

        dxChartResetVisualRange(chartContainer);

        /* build-up fwhm starting from retrieved data */
        await rebuildFwhmAsync(items,
            pointsInRangeXValues,
            pointsInRangeYValues,
            obj.ResponseObject[0].FwhmLeftMargin,
            obj.ResponseObject[0].FwhmRightMargin);

        /* 2.1) show band center on chart */
        let wavelength = parseInt(obj.ResponseObject[0].BandCenterX);

        let bandCenter = pointsInRange.find(p => p.X == wavelength);

        /* show band center */
        showBandCenterOnChart(items, wavelength, bandCenter);

        dxChartResetVisualRange(chartContainer);

        hideSpectraToBeHidden();

        setLoadingCircleIsVisible(false);
    }
}
/* ################################################################################ */
/* SAVE BAND ANALYSIS DATA */
/* ################################################################################ */
async function saveBandAnalysisDataProcedureAsync() {
    setLoadingCircleIsVisible(true);

    let model = {
        FileId: selectedSpectrumForProcessing.Id,
        LeftBoundary: bandAnalysis.boundaries[0],
        RightBoundary: bandAnalysis.boundaries[1],
    };

    let isResponseOk = true;

    let obj = await doAjaxPostAsync(UrlIsBandOverlappingWithExistingOne, model);
    if (obj) {
        if (!obj.BoolValue)
            await saveBandAnalysisDataAsync();
        else
            askAndExecute(BandAnalysisManagementLabel, BandAnalysisCheckOverlapQuestion, saveBandAnalysisDataAsync);
    }
    else
        isResponseOk = false;

    setLoadingCircleIsVisible(false);

    if (!isResponseOk)
        showSimpleDialog(ERROR_LABEL, BandAnalysisCheckOverlapErrorMessage, ALERT);
}

async function saveBandAnalysisDataAsync() {

    setLoadingCircleIsVisible(true);

    let model = {
        Id: 0,
        FileId: selectedSpectrumForProcessing.Id,
        LeftBoundary: bandAnalysis.boundaries[0],
        RightBoundary: bandAnalysis.boundaries[1],
        BandArea: bandAnalysis.area,
        BandCenter: bandAnalysis.center,
        BandDepth: bandAnalysis.depth,
        FwhmLeftMargin: bandAnalysis.fwhmResult.leftMargin.X,
        FwhmRightMargin: bandAnalysis.fwhmResult.rightMargin.X,
    }

    let isSavingOk = true;

    let obj = await doAjaxPostAsync(UrlSaveBandAnalysisData, model);
    if (obj) {
        if (obj.IsOk) {
            bandAnalysis.id = obj.Id;
            bandAnalysis.isSaved = true;
        } else
            isSavingOk = false;
    } else
        isSavingOk = false;

    setLoadingCircleIsVisible(false);

    if (isSavingOk)
        showSimpleDialog(INFO_LABEL, BandAnalysisSaveSuccessMessage, SUCCESS);
    else
        showSimpleDialog(ERROR_LABEL, BandAnalysisSaveErrorMessage, ALERT);
}

/* ################################################################################ */
/* DOWNLOAD BAND ANALYSIS DATA */
/* ################################################################################ */
async function exportCommonProcedureAsync (methodName) {
    const spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (!spectrum)
        return;

    const model = {
        Id: 0,
        FileId: selectedSpectrumForProcessing.Id,
        LeftBoundary: bandAnalysis.boundaries[0],
        RightBoundary: bandAnalysis.boundaries[1],
        BandArea: bandAnalysis.area,
        BandCenterX: bandAnalysis.center,
        BandDepth: bandAnalysis.depth,
        FwhmLeftMargin: bandAnalysis.fwhmResult.leftMargin.X,
        FwhmRightMargin: bandAnalysis.fwhmResult.rightMargin.X,
        Fwhm: bandAnalysis.fwhmResult.fwhm,
    }

    const txt = await window.dotNetHelper.invokeMethodAsync(methodName,
        spectrum.Name,
        model);

    if (!txt)
        return;

    return {
        Name: spectrum.Name,
        Text: txt,
        Model: model
    };
}

async function exportBandAnalysisDataAsCsvAsync() {
    const result = await exportCommonProcedureAsync("getBandAnalysisAsTxt");

    executeExportFile(result.Text, `${result.Name}_${BandAnalysisForFileLabel}_${result.Model.LeftBoundary}-${result.Model.RightBoundary}.csv`)
}

async function exportBandAnalysisDataAsXmlAsync() {
    let result = await downloadCommonProcedureAsync("getBandAnalysisAsXml");

    executeExportFile(result.Text, `${result.Name}_${BandAnalysisForFileLabel}_${result.Model.LeftBoundary}-${result.Model.RightBoundary}.xml`)
}