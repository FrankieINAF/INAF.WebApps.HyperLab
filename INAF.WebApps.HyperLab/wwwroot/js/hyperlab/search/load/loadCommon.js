var parsedSpectra = [];

/* ################################################################################ */
/* PARSED SPECTRA */
/* ################################################################################ */
function addParsedSpectrum(filename, xml, spectrumType, source) {
    parsedSpectra.push(createParsedSpectrum(filename, xml, spectrumType, source));
}

function createParsedSpectrum(filename, xml, spectrumType, source) {
    if (spectrumType == null)
        spectrumType = SPECTRUM_TYPE_RAW;

    return {
        Filename: filename,
        Xml: xml,
        SpectrumType: spectrumType,
        Type: source
    };
}

function isAlreadyParsed(filename) {
    return parsedSpectra.some(spectrum => spectrum.Filename == filename);
}

function removeParsedSpectrum(filename) {
    let index = parsedSpectra.findIndex(spectrum => spectrum.Filename == filename);
    if (index >= 0) {
        parsedSpectra.splice(index, 1);
        return true;
    }

    return false;
}

function updateParsedFileSpectrumType(filename, spectrumType) {
    let index = parsedSpectra.findIndex(spectrum => spectrum.Filename == filename);
    if (index >= 0)
        parsedSpectra[index].SpectrumType = spectrumType;
}

/* ################################################################################ */
/* FILES READING */
/* ################################################################################ */
function isXML(text) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    return parseError.length === 0;
}

async function loadFilesAsync(files, source) {
    if (files == null || files.length == 0)
        return;

    showByClassDFlexItem('loadedFilesContainer', true);

    let filesNum = files.length;
    for (var i = 0; i < filesNum; i++) {
        let file = files[i];
        //let filename = removeFileExtension(file.name);
        let filename = file.name;
        //console.log(`LOOP, ${filename}, ${i}`);

        if (isAlreadyParsed(filename))
            continue;

        let reader = new FileReader();

        reader.onload = async function (event) {
            const text = event.target.result;
            if (isXML(text)) {
                console.log("XML");
                //await readXmlProcedureAsync(text, filename, index);
            } else {
                console.log(`CSV, ${filename}`);
                manageCsvProcedure(text, filename, source);
            }
        };

        reader.readAsText(file);
    }
}

/* ################################################################################ */
/* FILES REMOVAL */
/* ################################################################################ */
function removeFileFromList(filename) {
    if (removeParsedSpectrum(filename))
        $(`#item_${$.escapeSelector(filename)}`).remove(); // escapeSelector is a jQuery function for escaping special characters (.,-,etc)
    else
        showSimpleDialog(ERROR_LABEL, LoadFileRemoveFileErrorMessage, ALERT);
}

/* ################################################################################ */
/* READ CSV FILE */
/* ################################################################################ */
function parseCSV(text) {
    const lines = text.split('\n');
    let points = [];
    const separators = /[,\t; ]+/;

    for (let i = 0; i < lines.length; i++) {
        const values = lines[i].split(separators).map(value => value.trim()).filter(value => value !== ""); // Trim spaces and tabs and remove empty strings
        if (values.length < 2)
            continue;

        if (!Number.isNaN(values[0]) && !Number.isNaN(values[1])) {
            points.push(createSpectrumElement(values[0], values[1]));
        }
    }

    return points;
}

function manageCsvProcedure(text, filename, source) {
    let xml = buildSpectrum(filename, text);
    let isLoaded = xml != null;
    addListItem(filename, source, isLoaded);
    addParsedSpectrum(filename, xml, SPECTRUM_TYPE_RAW, source);
}

/* ################################################################################ */
/* FILES SAVING COMMON */
/* ################################################################################ */

async function saveFileAsync(filename) {
    let index = parsedSpectra.findIndex(spectrum => spectrum.Filename === filename);
    if (index == -1)
        return;

    let spectrum = parsedSpectra[index];
    switch (spectrum.Type) {
        case SpectrumSourceExternal:
            await saveExternalSpectrumAsync(spectrum.Filename, spectrum.Xml, spectrum.SpectrumType);
            break;

        case SpectrumSourceSLab:
            await saveSLabFileAsync(spectrum.Filename, spectrum.Xml, spectrum.SpectrumType);
            break;

        default:
    }
}

/* ################################################################################ */
/* BUILD LIST ITEM */
/* ################################################################################ */
function addListItem(filename, source, isLoaded) {
    $('#loadedFilesList').append(getListItem(filename, source, isLoaded));

    if (isLoaded && source == SpectrumSourceSLab) {
        checkIsSpectrumOfTypeAndSourceIsSavedOnCloudAsync(filename, SPECTRUM_TYPE_RAW, source);
    }
}

async function checkIsSpectrumOfTypeAndSourceIsSavedOnCloudAsync(filename, spectrumType, source) {
    let model = {
        Filename: filename,
        SpectrumType: spectrumType,
        SpectrumSource: source
    };

    let obj = await doAjaxGetAsync(UrlIsSpectrumTypeSavedOnCloud, model);
    if (obj)
        updateListItem(filename, obj.IsOk);
}

function getListItem(filename, source, isLoaded) {
    let html = ``;
    html += `<div id="item_${filename}" class="d-flex flex-column-fs flex-row-sm margin-vertical-8">`;
    html += `<div class="flex-self-center-fs margin-right-8 pointer"><span class="mif mif-bin pointer" title="${LoadFileRemoveSelectedFileMessage}" onclick="${removeFileFromList.name}('${filename}')"></span></div>`;
    let color = 'fg-green';
    let icon = 'mif-checkmark';
    let message = LoadFileReadFileSuccessMessage;
    if (!isLoaded) {
        color = 'fg-red';
        icon = 'mif-cancel';
        message = LoadFileReadFileErrorMessage;
    }
    html += `<div class="flex-self-center-fs margin-right-8 margin-top-4"><span class="mif ${icon} ${color} mif-2x" title="${message}"></span></div>`;
    html += `<div class="flex-self-center-fs w-50-sm"><span class="text-secondary-sm text-light">${filename}</span></div>`;
    if (source == SpectrumSourceSLab)
        html += `<div class="flex-self-center-fs margin-horizontal-16" style="width: 260px">${getSpectrumTypeSelect(filename)}</div>`;
    html += getToSaveOnCloudIcon(filename);
    html += `</div>`;

    return html;
}

function getSavedOnCloudIcon(filename) {
    return `<div id="uploaded_${filename}"><span class="mif mif-cloud-upload mif-3x fg-cyan" title="${LoadFileSavedOnCloudLabel}"></span></div>`;
}

function getToSaveOnCloudIcon(filename, color) {
    let message = '';
    if (color == null) {
        color = 'orange';
        message = LoadFileNotSavedOnCloudMessage;
    } else if (color == 'red')
        message = LoadFileSaveOnCloudErrorMessage;
    return `<div id="upload_${filename}" class="pointer" onclick="${saveFileAsync.name}('${filename}')"><span class="mif mif-cloud-upload mif-3x fg-${color} pointer" title="${message}"></span></div>`;
}

function updateListItem(filename, isSaved) {
    if (isSaved)
        $(`#upload_${$.escapeSelector(filename)}`).replaceWith(getSavedOnCloudIcon(filename));
    else
        $(`#uploaded_${$.escapeSelector(filename) }`).replaceWith(getToSaveOnCloudIcon(filename, 'red'));
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    $('[id^="fileInput"]').on('change', function (e) {
        var files = e.target.files;
        if (this.id === "fileInputSLab")
            loadFilesAsync(files, SpectrumSourceSLab);
        else
            loadFilesAsync(files, SpectrumSourceExternal);
    });
});