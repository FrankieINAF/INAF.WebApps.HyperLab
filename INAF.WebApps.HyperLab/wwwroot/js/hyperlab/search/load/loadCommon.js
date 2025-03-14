var EXTERNAL_FILE = "ExternalFile";
var SLAB_FILE = "SLabFile";

function isXML(text) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    return parseError.length === 0;
}

/* ################################################################################ */
/* FILES READING */
/* ################################################################################ */
async function loadFilesAsync(files, type) {
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
                manageCsvProcedure(text, filename, type);
            }
        };

        reader.readAsText(file);
    }
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

function manageCsvProcedure(text, filename, type) {
    let xml = buildSpectrum(filename, text);
    let isLoaded = xml != null;
    addListItem(filename, type, isLoaded);
    addParsedSpectrum(filename, xml, SPECTRUM_TYPE_RAW);
    //if (xml) {
        
    //}
    //else
    //    showSimpleDialog(ERROR_LABEL, LoadFileReadCsvFileErrorMessage, ALERT);
}


/* ################################################################################ */
/* BUILD LIST ITEM */
/* ################################################################################ */
function addListItem(filename, type, isLoaded) {
    $('#loadedFilesList').append(getListItem(filename, type, isLoaded));
}

function getListItem(filename, type, isLoaded) {
    let html = ``;
    html += `<div class="d-flex flex-column-fs flex-row-sm margin-vertical-8">`;
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
    if (type == SLAB_FILE)
        html += `<div class="flex-self-center-fs margin-horizontal-16" style="width: 260px">${getSpectrumTypeSelect(filename)}</div>`;
    html += getToSaveOnCloudIcon(filename);
    html += `</div>`;

    return html;
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    $('[id^="fileInput"]').on('change', function (e) {
        var files = e.target.files;
        if (this.id === "fileInputSLab")
            loadFilesAsync(files, SLAB_FILE);
        else
            loadFilesAsync(files, EXTERNAL_FILE);
    });
});