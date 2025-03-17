/* ################################################################################ */
/* FILES READING */
/* ################################################################################ */
async function loadSLabFilesAsync(evt, element) {
    console.log(evt);

    if (evt == null)
        return;

    await loadFilesAsync(evt, SPECTRUM_SOURCE_SLAB)
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

    let spectrumFile = {
        Id: 0,
        Filename: filename,
        ParentId: null,
        Type: spectrumType,
        Level: SPECTRUM_LEVEL_AVERAGED,
        Source: SPECTRUM_SOURCE_SLAB,
        Xml: xml
    }

    let saveSpectrumRequest = {
        spectrumFile: spectrumFile,
    };

    let isOk = true;

    let url = UrlSaveSpectrumOfTypeRaw;
    if (!isRawUrlRequested) {

        switch (spectrumType) {
            case SPECTRUM_TYPE_ALIGNED:
                url = UrlSaveSpectrumOfTypeAligned;
                break;

            case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                url = UrlSaveSpectrumOfTypeContinuumRemoved;
                break;

            case SPECTRUM_TYPE_ALIGNED_SMOOTHED:
            case SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
                url = UrlSaveSpectrumOfTypeSmoothed;
                break;

            default:
                url = UrlSaveSpectrumOfTypeRaw
                break;
        }
    }

    let obj = await doAjaxPostAsync(url, saveSpectrumRequest);
    if (obj) {
        isOk = obj.IsOk;
        /* update the list item on UI by changing the cloud icon color */
        updateListItem(filename, isOk);
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
