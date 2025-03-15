/* ################################################################################ */
/* FILES READING */
/* ################################################################################ */
async function loadSLabFilesAsync(evt, element) {
    console.log(evt);

    if (evt == null)
        return;

    await loadFilesAsync(evt, SpectrumSourceSLab)
}

/* ################################################################################ */
/* SAVE FILE */
/* ################################################################################ */
async function saveSLabFileAsync(filename, xml, spectrumType) {
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
    let obj = await doAjaxPostAsync(UrlSaveExternalSpectrum, saveSpectrumRequest);
    if (obj) {
        isOk = obj.IsOk;
        updateListItem(filename, isOk);
    } else
        isOk = false;

    if (!isOk)
        showSimpleDialog(ERROR_LABEL, LoadFileSaveOnCloudErrorMessage, ALERT);
}

/* ################################################################################ */
/* BUILD LIST ITEM - SLAB */
/* ################################################################################ */
function getSpectrumTypeSelect(filename) {
    let html = `<select data-role="select" data-on-change="${onSpectrumTypeChange.name}">`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_RAW}" selected>${getSpectrumTypeDescription(2)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_ALIGNED}">${getSpectrumTypeDescription(5)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS}">${getSpectrumTypeDescription(6)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_ALIGNED_SMOOTHED}">${getSpectrumTypeDescription(7)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_CONTINUUM_REMOVED}">${getSpectrumTypeDescription(9)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS}">${getSpectrumTypeDescription(10)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED}">${getSpectrumTypeDescription(11)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_REF}">${getSpectrumTypeDescription(3)}</option>`;
    html += `<option value="${filename}_${SPECTRUM_TYPE_REF_WHITE}">${getSpectrumTypeDescription(4)}</option>`;
    html += `</select>`;
    return html;
}

function onSpectrumTypeChange(evt) {
    console.log(evt);

    let tmp = evt[0].split('_');

    let filename = tmp[0];
    let spectrumType = tmp[1];

    updateParsedFileSpectrumType(filename, parseInt(spectrumType));
}