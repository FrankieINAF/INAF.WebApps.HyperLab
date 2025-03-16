var CSV = 'CSV';
var XML = 'XML';

var parsedSpectra = [];

/* ################################################################################ */
/* PARSED SPECTRA */
/* ################################################################################ */
function addParsedSpectrum(filename, xml, spectrumType, source, fileType) {
    parsedSpectra.push(createParsedSpectrum(filename, xml, spectrumType, source));
}

function createParsedSpectrum(filename, xml, spectrumType, source, fileType) {
    if (spectrumType == null)
        spectrumType = SPECTRUM_TYPE_RAW;

    return {
        Id: 0,
        Filename: filename,
        Xml: xml,
        SpectrumType: spectrumType,
        Source: source,
        FileType: fileType
    };
}

function getParsedSpectrum(filename) {
    return parsedSpectra.find(spectrum => spectrum.Filename == filename);
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

function updateParsedSpectrumId(filename, id) {
    let index = parsedSpectra.findIndex(spectrum => spectrum.Filename == filename);
    if (index >= 0)
        parsedSpectra[index].Id = id;
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
            let fileType = CSV;
            if (isXML(text)) {
                fileType = XML;
                console.log("XML");
                //await readXmlProcedureAsync(text, filename, index);
            } else {
                console.log(`CSV, ${filename}`);
                manageCsvProcedure(text, filename, source, fileType);
            }
        };

        reader.readAsText(file);
    }
}

/* ################################################################################ */
/* FILES REMOVAL */
/* ################################################################################ */
function removeFileFromList(filename) {
    let parsedSpectrum = getParsedSpectrum(filename);
    if (parsedSpectrum == null)
        return;

    if (removeParsedSpectrum(filename)) {
        /* remove the spectrum from the selected spectra */
        removeSelectedSpectrum(parsedSpectrum.Id);
        /* remove the spectrum from the list of loaded spectra on UI */
        $(`#item_${$.escapeSelector(filename)}`).remove(); // escapeSelector is a jQuery function for escaping special characters (.,-,etc)
    }  else
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

function manageCsvProcedure(text, filename, source, fileType) {
    let xml = buildSpectrumXml(filename, text, source);
    let isLoaded = xml != null;
    addListItem(filename, source, isLoaded);
    addParsedSpectrum(filename, xml, SPECTRUM_TYPE_RAW, source, fileType);
}

/* ################################################################################ */
/* BUILD XML */
/* ################################################################################ */

function buildSpectrumXml(filename, text, source) {
    let info = {
        RawFilename: filename,
        Source: getSpectrumSourceString(source), // defined in _JsCommon.cshtml
        Level: getSpectrumLevelString(SPECTRUM_LEVEL_AVERAGED), // defined in _JsCommon.cshtml
        Type: getSpectrumTypeString(SPECTRUM_TYPE_RAW), // defined in _JsCommon.cshtml
    };

    let spectrum = {
        Info: info,
        Elements: parseCSV(text)
    };

    var xml = jsonToXml(spectrum);

    return xml;
}

/* ---------- ANCILLARY ---------- */
function createSpectrumElement(xValue, yValue) {
    return {
        Wavelength: xValue,
        Value: yValue
    };
}

function createXmlNode(doc, key, value) {
    var element = doc.createElement(key);

    if (typeof value === 'object' && !Array.isArray(value)) {
        for (var prop in value) {
            element.appendChild(createXmlNode(doc, prop, value[prop]));
        }
    } else if (Array.isArray(value)) {
        value.forEach(function (item) {
            var child = doc.createElement('Element');
            let keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                child.setAttribute(keys[i], item[keys[i]]);
            }
            element.appendChild(child);
        });
    } else {
        element.textContent = value;
    }
    return element;
}

function jsonToXml(jsObject) {
    var parser = new DOMParser();
    var doc = parser.parseFromString("<Spectrum/>", "application/xml");
    var root = doc.documentElement;

    for (var key in jsObject) {
        root.appendChild(createXmlNode(doc, key, jsObject[key]));
    }

    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(doc);
    return xmlString;
}

function updateNodeValue(xmlString, nodeName, newValue) {
    // Parse the XML string into a DOM object
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Find the node by its name
    var node = xmlDoc.getElementsByTagName(nodeName)[0];
    if (node) {
        // Update the node's value
        node.textContent = newValue;
    } else {
        console.error(`Node with name ${nodeName} not found.`);
        return xmlString; // Return the original XML string if the node is not found
    }

    // Serialize the updated XML back to a string
    var serializer = new XMLSerializer();
    var updatedXmlString = serializer.serializeToString(xmlDoc);

    return updatedXmlString;
}

/* ################################################################################ */
/* FILES SAVING COMMON */
/* ################################################################################ */

async function saveFileAsync(filename) {
    let index = parsedSpectra.findIndex(spectrum => spectrum.Filename === filename);
    if (index == -1)
        return;

    let spectrum = parsedSpectra[index];
    switch (spectrum.Source) {
        case SPECTRUM_SOURCE_EXTERNAL:
            await saveExternalSpectrumAsync(spectrum.Filename, spectrum.Xml, spectrum.SpectrumType);
            break;

        case SPECTRUM_SOURCE_SLAB:
            await saveSLabFileProcedure(spectrum.Filename, spectrum.Xml, spectrum.SpectrumType, spectrum.FileType);
            break;

        default:
    }
}

/* ################################################################################ */
/* BUILD LIST ITEM */
/* ################################################################################ */
function addListItem(filename, source, isLoaded) {
    $('#loadedFilesList').append(getListItem(filename, source, isLoaded));

    if (isLoaded && source == SPECTRUM_SOURCE_SLAB) {
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
    if (obj) {
        /* update list of loaded spectra */
        updateListItem(filename, obj.IsOk);

        if (obj.IsOk) {
            /* update the parsed spectrum id */
            updateParsedSpectrumId(filename, obj.Id);
            /* add the spectrum to the selected spectra */
            addSelectedSpectrum(obj.Id);
        }
    }
}

function getListItem(filename, source, isLoaded) {
    if (isMobile())
        return getListItemMobile(filename, source, isLoaded);
    else
        return getListItemDesktop(filename, source, isLoaded);
}

function getListItemDesktop(filename, source, isLoaded) {
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
    html += `<div class="flex-self-center-fs width-250"><span class="text-secondary-sm text-light">${filename}</span></div>`;
    if (source == SPECTRUM_SOURCE_SLAB)
        html += `<div class="flex-self-center-fs margin-horizontal-16" style="width: 260px">${getSpectrumTypeSelect(filename)}</div>`;
    html += getToSaveOnCloudIcon(filename);
    html += `</div>`;

    return html;
}

function getListItemMobile(filename, source, isLoaded) {
    let html = ``;
    html += `<div id="item_${filename}" class="d-flex flex-column-fs flex-row-sm margin-vertical-8">`;
    html += `<div id="item_${filename}" class="d-flex flex-row margin-vertical-8">`;
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
    html += `<div class="flex-self-center-fs width-250"><span class="text-secondary-sm text-light">${filename}</span></div>`;
    html += getToSaveOnCloudIcon(filename);
    html += `</div>`;
    if (source == SPECTRUM_SOURCE_SLAB)
        html += `<div class="flex-self-center-fs margin-horizontal-16" style="width: 250px">${getSpectrumTypeSelect(filename)}</div>`;
    html += '<div><hr style="border: 0; height: 1px;" class="bg-cyan margin-top-4"></div>'
    html += `</div>`;

    return html;
}

function getSavedOnCloudIcon(filename) {
    return `<div id="uploaded_${filename}" class="pointer"><span class="mif mif-cloud-upload mif-3x fg-cyan pointer" onclick="${saveFileAsync.name}('${filename}')" title="${LoadFileSavedOnCloudLabel}"></span></div>`;
}

function getToSaveOnCloudIcon(filename, color) {
    let message = '';
    if (color == null || color == 'orange') {
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
        $(`#uploaded_${$.escapeSelector(filename) }`).replaceWith(getToSaveOnCloudIcon(filename, 'orange'));
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    $('[id^="fileInput"]').on('change', function (e) {
        var files = e.target.files;
        if (this.id === "fileInputSLab")
            loadFilesAsync(files, SPECTRUM_SOURCE_SLAB);
        else
            loadFilesAsync(files, SPECTRUM_SOURCE_EXTERNAL);
    });
});