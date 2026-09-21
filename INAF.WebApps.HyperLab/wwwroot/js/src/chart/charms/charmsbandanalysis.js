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
var BAND_CENTER_COLOR = '#9933ff';

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
    clearBandAnalysisProcedure();

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
    let spectrum = getSpectrumByLowerSpectrumTypeIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    if (!spectrum) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, BandAnalysisNoSpectrumFoundErrorMessage, ALERT);
        return;
    }

    let series = findChartSeriesByValueFieldId(chart, spectrum.Id);
    if (!series) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, BandAnalysisNoSpectrumFoundErrorMessage, ALERT);
        return;
    }

    //let series = chartSeries[seriesIndex];

    /* retrieve all points of all series from chart */
    //let items = dxChartGetItems(chartContainer);

    /* if a band is already highlightened, remove it */
    //if (lastSelectedSegmentForBand)
    //    removeHighlightenedBand(items);

    /* save current segment */
    lastSelectedSegmentForBand = segmentForFitting;

    /* calculate band-depth parameters */
    await executeBandAnalysisProcedureAsync(series);

    setLoadingCircleIsVisible(false);
}

async function executeBandAnalysisProcedureAsync(series) {
    await executeBandAnalysisAsync(series);

    isBandDepthCharmsOpened = true;
}

async function executeBandAnalysisAsync(series) {
    /* remove previous analysis and UI items, if available */
    //clearBandAnalysisProcedure(items);

    /* find points in range selected by the highlightened band */
    const seriesPoints = getSeriesPoints(chart, series.name);
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
    showBandCenterOnChart(wavelength, bandCenter);

    //let invertedYValues = invertYValuesBottomToTop(yValues);
    //showInvertedBand(items, xValues, invertedYValues);

    /* 2.2) show the gaussian fit on chart */
    showGaussianFit(pointsInRangeXValues, pointsInRangeYValues, fitResult);

    /* 2.3) highlight the selected band */
    await highlightBandAsync(seriesPoints, lastSelectedSegmentForBand);

    ///* 3) band depth */
    const bandDepth = evaluateBandDepth(wavelength, bandCenter);

    const fitPointsYValues = fitPoints.map(p => p.Y);

    /* 4) band area */
    await evaluateBandAreaAsync(pointsInRangeXValues, fitPointsYValues);

    /* 5) fwhm of spectrum selected band */
    evaluateFwhmAsync(pointsInRangeXValues, pointsInRangeYValues, bandCenter.X, bandDepth);

    /* reset visual range to make ref whites appear in chart */
    resetVisualRange(chart);

    enableByClassElem('bandAnalysisDataButtonSave');
    showByClass('bandAnalysisButtonDownload');

    /* set isEvaluated value */
    saveIsEvaluated(true);

    removeClass('bandAnalysisResultsContainer', 'd-none');
    addClass('bandAnalysisResultsContainer', 'd-flex');
    addClass('bandAnalysisResultsContainer', 'flex-column');

    hideSpectraToBeHidden();
    resetVisualRange(chart);

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

async function evaluateFwhmAsync(xs, ys, bandCenterX, bandDepth) {
    const fwhmResult = await window.dotNetHelper.invokeMethodAsync("evaluateFwhm",
        xs,
        ys,
        bandCenterX,
        bandDepth);

    if (!fwhmResult)
        return;

    setFwhm(fwhmResult);

    showFwhm(xs, fwhmResult.leftMargin, fwhmResult.rightMargin)
}

async function rebuildFwhmAsync(xs, ys, fwhmLeftMargin, fwhmRightMargin) {
    const fwhmResult = await window.dotNetHelper.invokeMethodAsync("rebuildFwhm",
        xs,
        ys,
        fwhmLeftMargin,
        fwhmRightMargin);

    if (!fwhmResult)
        return;

    setFwhm(fwhmResult);

    showFwhm(xs, fwhmResult.leftMargin, fwhmResult.rightMargin);
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

function showBandCenterOnChart(wavelength, bandCenter) {
    const bandCenterSeries = createSeriesFromSpectrumName(SERIES_BAND_CENTER_POINT, SERIES_BAND_CENTER, BAND_CENTER_COLOR, true, true);
    bandCenterSeries.point.size = 12;
    addChartSeries(chart, bandCenterSeries);

    hideSpectraToBeHidden();
}

function showGaussianFit(xValues, yValues, fitResult) {
    const invertedYValues = invertYValuesBottomToTop(yValues);

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

    const points = xValues.map((x, i) => ([x, invertedFitResultYValues[i]]));
    let normalFitSeries = createSeriesFromSpectrumName(SERIES_NORMAL_FIT_POINT, SERIES_NORMAL_FIT, BAND_LINES_COLOR, false, false);
    normalFitSeries.point.size = 12;
    normalFitSeries.data = points;
    
    addChartSeries(chart, normalFitSeries);
}

function showFwhm(xs, leftMargin, rightMargin) {
    let indexLeftMargin = xs.findIndex(p => p == leftMargin.X);

    let indexRightMargin = xs.findIndex(p => p == rightMargin.X);
    if (indexRightMargin <= 0 || indexRightMargin <= 0)
        return;

    const fwhmPoints = [[leftMargin.X, leftMargin.Y], [rightMargin.X, rightMargin.Y]];

    const fwhmSeries = createSeriesFromSpectrumName(SERIES_FWHM_POINT, SERIES_FWHM, BAND_LINES_COLOR, false, false);
    fwhmSeries.point.size = 12;
    fwhmSeries.data = fwhmPoints;
    addChartSeries(chart, fwhmSeries);
}

// ONLY FOR DEVELOPMENT
function showInvertedBand(xValues, invertedYValues) {
    addPointToChartSeries(chart, xValues, invertedYValues, SERIES_INVERTED_BAND_POINT);

    const invertedBandSeries = createSeriesFromSpectrumName(SERIES_INVERTED_BAND_POINT, SERIES_INVERTED_BAND, BAND_CENTER_COLOR, true, false);
    addChartSeries(chart, invertedBandSeries);

    hideSpectraToBeHidden();
}

/* -------------------------------------------------------------------------------- */
/* CLEAR BAND ANALYSIS */
/* -------------------------------------------------------------------------------- */
function clearBandAnalysisProcedureCaller() {
    if (!isBandAnalysisAvailable)
        return;

    clearBandAnalysisProcedure();
}

function clearBandAnalysisProcedure() {
    if (!isBandAnalysisAvailable)
        return;

    disableByClassElem('bandAnalysisDataButtonSave');
    hideByClass('bandAnalysisButtonDownload');

    /* remove highlitened band */
    removeHighlightenedBand();

    /* remove band center */
    clearBandCenter();

    /* remove gaussian fit */
    clearBandAnalysisNormalFit();

    /* remove fwhm fit */
    clearFwhm();

    clearTextFields();

    hideSpectraToBeHidden();

    isBandAnalysisAvailable = false;
}

function clearBandAnalysisNormalFit() {
    /* remove chart series */
    removeSeries(chart, SERIES_NORMAL_FIT);
}

function clearBandCenter() {
    /* remove chart series */
    removeSeries(chart, SERIES_BAND_CENTER_POINT);
}

function clearFwhm() {
    /* remove chart series */
    removeSeries(chart, SERIES_FWHM);
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

async function highlightBandAsync(seriesPoints, segmentForFitting) {
    /* retrieve (continuum-removed) series points between the 2 points which define the band  */
    const pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), segmentForFitting.P0.P.X, segmentForFitting.P1.P.X);

    /* extract the x values */
    const xArray = pointsInRange.map(p => { return p.X });

    /* extract the y values of the points belonging to the band */
    const minValArray = pointsInRange.map(p => { return p.Y });

    /* retrieve y values along the line connecting the 2 points which define the band */
    const processingResult = await window.dotNetHelper.invokeMethodAsync("fitSegmentAsync",
        pointsInRange,
        fitFunctions[0]); //fitFunctions[0] is 'linear fit'. DO NOT CHANGE IT SINCE WE WANT TO HIGHLIGHT BAND BY FILLING AREA
    const maxValArray = processingResult.Points.map(p => { return p.Y });

    /* save fitted points in memory */
    fitPoints = processingResult.Points;

    const bandSeriesPointsMaxValue = [];
    const bandSeriesPointsMinValue = [];
    const seriesPointsNum = seriesPoints.length;
    for (var i = 0; i < seriesPointsNum; i++) {
        //console.log(`xArray[${i}]: ${xArray[i]}, maxValArray[${i}]: ${maxValArray[i]}, minValArray[${i}]: ${minValArray[i]}`);
        const index = seriesPoints.findIndex(p => p.argument == xArray[i]);
        bandSeriesPointsMaxValue.push([xArray[i], (maxValArray[i] - minValArray[i])]);
        bandSeriesPointsMinValue.push([xArray[i], minValArray[i]]);
    }

    const bandSeries = [{
        name: SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT,
        type: 'line',
        argumentField: 'X',
        lineStyle: {
            color: BAND_AREA_COLOR,
            width: 1
        },
        areaStyle: {
            opacity: 0
        },
        stack: 'band',
        data: bandSeriesPointsMinValue,
        showInLegend: false,

    },
    {
        name: SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT,
        type: 'line',
        argumentField: 'X',
        lineStyle: {
            color: BAND_AREA_COLOR,
            width: 1
        },
        areaStyle: {
            color: BAND_AREA_COLOR
        },
        stack: 'band',
        data: bandSeriesPointsMaxValue,
        showInLegend: false,
    }];
    addChartSeries(chart, bandSeries);

    resetVisualRange(chart);
}

function removeHighlightenedBand() {
    removeSeries(chart, SERIES_HIGHLIGHTENED_BAND_MIN_VALUE_POINT);
    removeSeries(chart, SERIES_HIGHLIGHTENED_BAND_MAX_VALUE_POINT);

    resetVisualRange(chart);
}

/* ################################################################################ */
/* RETRIEVE BAND ANALYSIS DATA LIST */
/* ################################################################################ */
async function getBandsAnalysisDataAsync() {
    if (!isUserAuthorized)
        return;

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
    clearBandAnalysisProcedure();

    resetVisualRange(chart);

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
        let seriesPoints = getSeriesPoints(chart, getSpectrumSeriesNameFromSpectrum(getSpectrumByLowerSpectrumTypeIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED)));
        let pointsInRange = extractSpectrumRange(getPointsFromSeriesPoints(seriesPoints), obj.ResponseObject[0].LeftBoundary, obj.ResponseObject[0].RightBoundary);

        /* extract y values from points */
        let pointsInRangeXValues = pointsInRange.map(p => p.X);
        let pointsInRangeYValues = pointsInRange.map(p => p.Y);

        /* calculate values that fit the input values */
        let fitResult = await window.dotNetHelper.invokeMethodAsync("getAbsorptionBandGaussianFit",
            pointsInRangeXValues,
            pointsInRangeYValues);
        showGaussianFit(items, pointsInRangeXValues, pointsInRangeYValues, fitResult);

        resetVisualRange(chart);

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

        resetVisualRange(chart);

        //hideSpectraToBeHidden();

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
        if (!obj.Value)
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
async function exportCommonProcedureAsync(methodName) {
    const spectrum = findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED);
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