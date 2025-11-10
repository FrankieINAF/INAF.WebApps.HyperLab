/* ################################################################################ */
/* FILES READING */
/* ################################################################################ */
async function loadSLabFilesAsync(evt, element) {
    console.log(evt);

    if (evt == null)
        return;

    await loadFilesAsync(evt, SPECTRUM_SOURCE_SLAB)
}

/* -------------------------------------------------------------------------------- */
/* READ SPECTRUM TYPE PROCESSING SETTINGS */
/* -------------------------------------------------------------------------------- */
function tryReadAlignmentSettings(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");

    const alignmentNode = xmlDoc.getElementsByTagName('AlignmentSettings')[0];
    if (!alignmentNode)
        return null;

    let numOfPoints = 0;
    const numOfPointsNode = alignmentNode.getElementsByTagName('NumOfPoints')[0];
    if (numOfPointsNode && numOfPointsNode.innerHTML)
        numOfPoints = parseInt(numOfPointsNode.innerHTML);
    else
        numOfPoints = 0;

    const segmentBoundariesNode = alignmentNode.getElementsByTagName('SegmentBoundaries')[0];

    let min = 0;
    const minNode = segmentBoundariesNode.getElementsByTagName('Min')[0];
    if (minNode && minNode.innerHTML)
        min = parseFloat(minNode.innerHTML);

    let max = 0;
    const maxNode = segmentBoundariesNode.getElementsByTagName('Max')[0];
    if (maxNode && maxNode.innerHTML)
        max = parseFloat(maxNode.innerHTML);

    return {
        AlignmentSegmentBoundaries: {
            Min: min,
            Max: max
        },
        IsLoadedFromCloud: false,
        NumOfPoints: numOfPoints
    };
}

function tryReadContinuumRemovalSettings(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");

    const continuumRemovalSettingsNode = xmlDoc.getElementsByTagName('ContinuumRemovalSettings')[0];
    if (!continuumRemovalSettingsNode)
        return null;

    const numOfPointsNode = continuumRemovalSettingsNode.getElementsByTagName('NumOfPoints')[0];
    if (!numOfPointsNode || !numOfPointsNode.innerHTML)
        return null;
    const numOfPoints = parseInt(numOfPointsNode.innerHTML);

    const segmentsNode = continuumRemovalSettingsNode.getElementsByTagName('Segments')[0];
    if (!segmentsNode)
        return null;

    const segmentNodes = segmentsNode.getElementsByTagName('Segment');
    if (!segmentNodes || segmentNodes.length == 0)
        return null;
    let segments = [];
    const segmentNodesNum = segmentNodes.length;
    for (var i = 0; i < segmentNodesNum; i++) {
        let fitMethodName = '';
        const fitMethodNode = segmentNodes[i].getElementsByTagName('FitMethodName')[0];
        if (fitMethodNode && fitMethodNode.innerHTML)
            fitMethodName = fitMethodNode.innerHTML;

        let segmentStart = 0;
        const segmentStartNode = segmentNodes[i].getElementsByTagName('SegmentStart')[0];
        if (segmentStartNode && segmentStartNode.innerHTML)
            segmentStart = parseInt(segmentStartNode.innerHTML);

        let segmentEnd = 0;
        const segmentEndNode = segmentNodes[i].getElementsByTagName('SegmentEnd')[0];
        if (segmentEndNode && segmentEndNode.innerHTML)
            segmentEnd = parseInt(segmentEndNode.innerHTML);

        let parameterValue = 0;
        const parameterValueNode = segmentNodes[i].getElementsByTagName('ParameterValue')[0];
        if (parameterValueNode && parameterValueNode.innerHTML)
            parameterValue = parseInt(parameterValueNode.innerHTML);

        segments.push({
            FitMethodName: fitMethodName,
            SegmentStart: segmentStart,
            SegmentEnd: segmentEnd,
            ParameterValue: parameterValue
        });
    }

    return {
        IsLoadedFromCloud: false,
        NumOfPointsForAveragingMissingPointX: numOfPoints,
        Segments: segments
    };
}

function tryReadSmoothingSettings(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");

    const smoothingSettingsNode = xmlDoc.getElementsByTagName('SmoothingSettings')[0];
    if (!smoothingSettingsNode)
        return null;

    const segmentsNode = smoothingSettingsNode.getElementsByTagName('Segments')[0];

    const segmentNodes = segmentsNode.getElementsByTagName('Segment');
    if (!segmentNodes || segmentNodes.length == 0)
        return null;

    let segments = [];
    const segmentNodesNum = segmentNodes.length;
    for (var i = 0; i < segmentNodesNum; i++) {
        let segmentStart = 0;
        const segmentStartNode = segmentNodes[i].getElementsByTagName('Start')[0];
        if (segmentStartNode && segmentStartNode.innerHTML)
            segmentStart = parseInt(segmentStartNode.innerHTML);

        let segmentEnd = 0;
        const segmentEndNode = segmentNodes[i].getElementsByTagName('End')[0];
        if (segmentEndNode && segmentEndNode.innerHTML)
            segmentEnd = parseInt(segmentEndNode.innerHTML);

        let segmentWindowSize = 0;
        const segmentWindowSizeNode = segmentNodes[i].getElementsByTagName('WindowSize')[0];
        if (segmentWindowSizeNode && segmentWindowSizeNode.innerHTML)
            segmentWindowSize = parseInt(segmentWindowSizeNode.innerHTML);

        let segmentPolynomialOrder = 0;
        const segmentPolynomialOrderNode = segmentNodes[i].getElementsByTagName('PolynomialOrder')[0];
        if (segmentPolynomialOrderNode && segmentPolynomialOrderNode.innerHTML)
            segmentPolynomialOrder = parseInt(segmentPolynomialOrderNode.innerHTML);

        segments.push({
            SegmentStart: segmentStart,
            SegmentEnd: segmentEnd,
            PolynomialOrder: segmentPolynomialOrder,
            WindowSize: segmentWindowSize,
        });
    }

    return {
        IsLoadedFromCloud: false,
        Segments: segments
    };
}

/* -------------------------------------------------------------------------------- */
/* PARENT FILES */
/* -------------------------------------------------------------------------------- */
function buildParentFileForLoad(id, spectrumType, spectrumLevel = 1) {
    return {
        Id: id,
        Filename: '',
        ParentId: 0,
        Type: spectrumType,
        Level: spectrumLevel
    };
}

function tryReadParentFiles(xml, areAllParentFilesRequired = false) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");

    const parentFilesNode = xmlDoc.getElementsByTagName('ParentFiles')[0];
    if (!parentFilesNode)
        return null;

    const parentFileIdNode = parentFilesNode.getElementsByTagName('ParentFileId')[0];
    if (!parentFileIdNode || !parentFileIdNode.innerHTML)
        return null;
    const parentFileId = parseInt(parentFileIdNode.innerHTML);

    let refFileId = 0;
    const refFileNode = parentFilesNode.getElementsByTagName('RefFileId')[0];
    if (areAllParentFilesRequired) {
        if (!refFileNode || !refFileNode.innerHTML)
            return null;
    }
    if (refFileNode && refFileNode.innerHTML)
        refFileId = parseInt(refFileNode.innerHTML);

    let refWhiteFileId = 0;
    const refWhiteFileIdNode = parentFilesNode.getElementsByTagName('RefWhiteFileId')[0];
    if (areAllParentFilesRequired) {
        if (!refWhiteFileIdNode || !refWhiteFileIdNode.innerHTML)
            return null;
    }
    if (refWhiteFileIdNode && refWhiteFileIdNode.innerHTML)
        refWhiteFileId = parseInt(refWhiteFileIdNode.innerHTML);

    return {
        ParentFile: buildParentFileForLoad(parentFileId, SPECTRUM_TYPE_RAW),
        RefFile: buildParentFileForLoad(refFileId, SPECTRUM_TYPE_REF),
        RefWhiteFile: buildParentFileForLoad(refWhiteFileId, SPECTRUM_TYPE_REF_WHITE)
    };
}

/* ################################################################################ */
/* SAVE FILE */
/* ################################################################################ */
function saveSLabFileProcedure(filename, xml, spectrumType, fileType) {
    /* when a file is saved from a CSV, for spectra with type different from RAW, alignment, smoothing, continuum-removal
       settings are not available and user must be warned about it */
    let isWarningRequested = fileType != XML;
    if (spectrumType == SPECTRUM_TYPE_RAW)
        isWarningRequested = false;

    if (isWarningRequested) {
        let message = '';
        switch (spectrumType) {
            case SPECTRUM_TYPE_ALIGNED:
                message = LoadFileMissingAlignmentSettingsWarningMessage;
                break;

            case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                message = LoadFileMissingContinuumRemovalSettingsWarningMessage;
                break;

            case SPECTRUM_TYPE_ALIGNED_SMOOTHED:
            case SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
                message = LoadFileMissingSmoothingSettingsWarningMessage;
                break;
        }

        let args = [filename, xml, spectrumType, true];
        askAndExecute(CharmsSpectraProcessingManagementLabel, message, saveSLabFileAsync, args);
    } else
        saveSLabFileAsync(filename, xml, spectrumType, false);
}

async function saveSLabFileAsync(filename, xml, spectrumType, isRawUrlRequested) {
    xml = updateNodeValue(xml, 'Type', getSpectrumTypeString(spectrumType));

    const spectrumFile = buildSpectrumFile(null,
        filename,
        SPECTRUM_LEVEL_AVERAGED,
        spectrumType,
        SPECTRUM_SOURCE_SLAB,
        xml);

    const saveSpectrumRequest = {
        spectrumFile: spectrumFile,
    };

    let isOk = true;

    let savingErrorMessage = '';
    let isSavingEnabled = true;
    let areAllParentFilesRequired = false;

    let url = UrlSaveSpectrumOfTypeRaw;
    if (!isRawUrlRequested) {

        switch (spectrumType) {
            case SPECTRUM_TYPE_ALIGNED:
                url = UrlSaveSpectrumOfTypeAligned;

                areAllParentFilesRequired = true;

                const alignmentSettings = tryReadAlignmentSettings(xml);
                if (!alignmentSettings) {
                    isSavingEnabled = false;
                    savingErrorMessage = LoadFileSaveMissingAlignmentSettingsErrorMessage;
                }
                else
                    saveSpectrumRequest.AlignmentSettings = alignmentSettings;
                break;

            case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                url = UrlSaveSpectrumOfTypeContinuumRemoved;

                const continuumRemovalSettings = tryReadContinuumRemovalSettings(xml);
                if (!continuumRemovalSettings) {
                    isSavingEnabled = false;
                    savingErrorMessage = LoadFileSaveMissingContinuumRemovalSettingsErrorMessage;
                }
                else
                    saveSpectrumRequest.ContinuumRemovalSettings = continuumRemovalSettings;
                break;

            case SPECTRUM_TYPE_ALIGNED_SMOOTHED:
            case SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
                url = UrlSaveSpectrumOfTypeSmoothed;

                const smoothingSettings = tryReadSmoothingSettings(xml);
                if (!smoothingSettings) {
                    isSavingEnabled = false;
                    savingErrorMessage = LoadFileSaveMissingSmoothingSettingsErrorMessage;
                }
                else
                    saveSpectrumRequest.SmoothingSettings = smoothingSettings;
                break;

            default:
                url = UrlSaveSpectrumOfTypeRaw
                break;
        }

        const parentFiles = tryReadParentFiles(xml, areAllParentFilesRequired);
        if (!parentFiles) {
            isSavingEnabled = false;
            savingErrorMessage = LoadFileSaveMissingParentFilesErrorMessage;
        }
        else
            saveSpectrumRequest.ParentFiles = parentFiles;
    }

    if (!isSavingEnabled) {
        showSimpleDialog(ERROR_LABEL, savingErrorMessage, ALERT);
        return;
    }

    let obj = await doAjaxPostAsync(url, saveSpectrumRequest);
    if (obj) {
        isOk = obj.IsOk;
        /* update the list item on UI by changing the cloud icon color */
        updateListItem(filename, isOk);
        /* update the parsed spectrum id */
        updateParsedSpectrumId(filename, obj.Id);
        /* add the spectrum to the selected spectra */
        addSelectedSpectrum(obj.Id);
    } else
        isOk = false;

    if (!isOk)
        showSimpleDialog(ERROR_LABEL, LoadFileSaveOnCloudErrorMessage, ALERT);
}

/* ################################################################################ */
/* BUILD LIST ITEM - SLAB */
/* ################################################################################ */
function getSpectrumTypeSelect(filename, spectrumType) {

    let html = `<select data-role="select" data-on-change="${onSpectrumTypeChange.name}">`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_RAW}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_RAW, spectrumType)}>${getSpectrumTypeDescription(2)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_ALIGNED}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_ALIGNED, spectrumType)}>${getSpectrumTypeDescription(5)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS, spectrumType)}>${getSpectrumTypeDescription(6)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_ALIGNED_SMOOTHED}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_ALIGNED_SMOOTHED, spectrumType)}>${getSpectrumTypeDescription(7)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_CONTINUUM_REMOVED}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_CONTINUUM_REMOVED, spectrumType)}>${getSpectrumTypeDescription(9)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS, spectrumType)}>${getSpectrumTypeDescription(10)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED, spectrumType)}>${getSpectrumTypeDescription(11)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_REF}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_REF, spectrumType)}>${getSpectrumTypeDescription(3)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_REF_WHITE}" ${getSpectrumTypeSelectString(SPECTRUM_TYPE_REF_WHITE, spectrumType)}>${getSpectrumTypeDescription(4)}</option>`;
    html += `</select>`;
    return html;
}

function getSpectrumTypeSelectString(testSpectrumType, spectrumType) {
    return (testSpectrumType == spectrumType) ? 'selected' : '';
}

function onSpectrumTypeChange(evt) {
    console.log(evt);

    let tmp = evt[0].split('_');

    let filename = tmp[0];
    let spectrumType = tmp[1];

    updateParsedFileSpectrumType(filename, parseInt(spectrumType));

    let parsedSpectrum = getParsedSpectrum(filename);
    checkIsSpectrumOfTypeAndSourceIsSavedOnCloudAsync(filename, spectrumType, parsedSpectrum.Source);
}
