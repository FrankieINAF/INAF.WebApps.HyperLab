var parsedSpectra = [];

function addParsedSpectrum(filename, xml, spectrumType) {
    parsedSpectra.push(getParsedSpectrum(filename, xml, spectrumType));
}

function getParsedSpectrum(filename, xml, spectrumType) {
    if (spectrumType == null)
        spectrumType = SPECTRUM_TYPE_RAW;

    return {
        Filename: filename,
        Xml: xml,
        SpectrumType: spectrumType
    };
}

function isAlreadyParsed(filename) {
    return parsedSpectra.some(spectrum => spectrum.Filename === filename);
}

function updateParsedFileSpectrumType(filename, spectrumType) {
    let index = parsedSpectra.findIndex(spectrum => spectrum.Filename === filename);
    if (index >= 0)
        parsedSpectra[index].SpectrumType = spectrumType;
}

/* ################################################################################ */
/* SAVE FILE */
/* ################################################################################ */
function saveSLabFile(filename) {
    let index = parsedSpectra.findIndex(spectrum => spectrum.Filename === filename);
    if (index >= 0) {
        let spectrum = parsedSpectra[index];
        //saveSLabFileAsync(spectrum.Filename, spectrum.Xml, spectrum.SpectrumType);
        console.log(filename);
    }
}

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
        if (isOk)
            addSpectrumIdProcedure(obj.Id, index);
    } else
        isOk = false;

    if (!isOk)
        showSimpleDialog(ERROR_LABEL, LoadFileSaveOnCloudErrorMessage, ALERT);
}

/* ################################################################################ */
/* BUILD LIST ITEM */
/* ################################################################################ */
function addListItem(filename) {
    $('#loadedFilesSLabList').append(getListItem(filename));
}

function getListItem(filename) {
    let html = ``;
    html += `<div class="d-flex flex-column-fs flex-row-sm margin-vertical-8">`;
    html += `<div class="flex-self-center-fs"><span class="text-secondary-sm text-light" >${filename}</span></div>`;
    html += `<div class="flex-self-center-fs margin-horizontal-8" style="width: 260px">${getSpectrumTypeSelect(filename)}</div>`;
    html += getToSaveOnCloudIcon(filename);
    html += `</div>`;

    return html;
}

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

function getToSaveOnCloudIcon(filename) {
    return `<div id="upload${filename}" class="pointer" onclick="${saveSLabFile.name}('${filename}')"><span class="mif mif-cloud-upload mif-3x fg-orange pointer" title="${LoadFileNotSavedOnCloudMessage}"></span></div>`;
}

function onSpectrumTypeChange(evt) {
    console.log(evt);

    let tmp = evt[0].split('_');

    let filename = tmp[0];
    let spectrumType = tmp[1];

    updateParsedFileSpectrumType(filename, parseInt(spectrumType));
}