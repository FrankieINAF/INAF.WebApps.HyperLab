var CSV = 'CSV';
var XML = 'XML';

var parsedSpectra = [];

/* ################################################################################ */
/* PARSED SPECTRA */
/* ################################################################################ */
function addParsedSpectrum(filename, xml, spectrumType, source, fileType) {
    parsedSpectra.push(createParsedSpectrum(filename, xml, spectrumType, source, fileType));
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
    return parsedSpectra.find(spectrum => spectrum.Filename == filename || spectrum.Filename.startsWith(filename));
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

    showByClassDFlexItem('loadedFilesContainer');

    /* remove locally saved files, if any is available */
    removeItemsFromSessionStorage(STORAGE_ITEM);

    /* read all selected files */
    let filesNum = files.length;
    for (var i = 0; i < filesNum; i++) {
        let file = files[i];
        let filename = file.name;
        //console.log(`LOOP, ${filename}, ${i}`);

        if (isAlreadyParsed(filename))
            continue;

        let reader = new FileReader();

        reader.onload = async function (event) {
            const text = event.target.result;
            let fileExt = CSV;
            if (isXML(text)) {
                fileExt = XML;
                /*  check whether a SLab xml file is being loaded as external file */
                if (source == SPECTRUM_SOURCE_EXTERNAL && isSLabXmlStructure(text) && isUserAuthorized)
                    source = SPECTRUM_SOURCE_SLAB;
                //console.log("XML");
                await manageXmlProcedureAsync(text, filename, source, fileExt);
            } else {
                //console.log(`CSV, ${filename}`);
                manageCsvProcedure(text, filename, source, fileExt);
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
    } else
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

        //console.log(`VALUES, ${values[0]}, ${values[1]}`);
        if (isNumber(values[0]) && isNumber(values[1])) {
            //console.log(`ADDING, ${values[0]}, ${values[1]}`);
            points.push(createSpectrumElement(values[0], values[1]));
        }
    }

    return points;
}

function manageCsvProcedure(text, filename, source, fileExt) {
    let xml = buildSpectrumXml(filename, text, source);
    let isLoaded = xml != null;
    /* save parse spectrum on the in-memory list */
    addParsedSpectrum(filename, xml, SPECTRUM_TYPE_RAW, source, fileExt);
    /* add file item to list of loaded files on UI */
    addFilesListItemAsync(filename, SPECTRUM_TYPE_RAW, source, isLoaded);
}

/* ################################################################################ */
/* BUILD XML */
/* ################################################################################ */

function buildSpectrumXml(filename, text, source) {
    let spectrumType = (source == SPECTRUM_SOURCE_SLAB) ? SPECTRUM_TYPE_RAW : SPECTRUM_TYPE_ALIGNED;

    let info = {
        RawFilename: filename,
        Source: getSpectrumSourceString(source), // defined in _JsCommon.cshtml
        Level: getSpectrumLevelString(SPECTRUM_LEVEL_AVERAGED), // defined in _JsCommon.cshtml
        Type: getSpectrumTypeString(spectrumType), // defined in _JsCommon.cshtml
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
/* READ XML FILE */
/* ################################################################################ */
async function manageXmlProcedureAsync(xml, filename, source, fileExt) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml, "application/xml");

    // Example: Extract data from the XML
    let type = xmlDoc.getElementsByTagName("Type");
    if (type && type.length > 0) {
        /* retrieve spectrumType text and value */
        let spectrumTypeText = type[0].innerHTML;
        let spectrumType = getSpectrumTypeValue(spectrumTypeText);
        /* save parse spectrum on the in-memory list */
        addParsedSpectrum(filename, xml, spectrumType, source, fileExt);
        /* add file item to list of loaded files on UI */
        addFilesListItemAsync(filename, spectrumType, source, true);
    }
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
            if (isUserAuthorized)
                await saveExternalFileAuthenticatedAsync(spectrum.Filename, spectrum.Xml);
            else
                saveExternalFileUnauthenticated(spectrum.Filename, spectrum.Xml);
            break;

        case SPECTRUM_SOURCE_SLAB:
            saveSLabFileProcedure(spectrum.Filename, spectrum.Xml, spectrum.SpectrumType, spectrum.FileType);
            break;

        default:
    }
}

/* ################################################################################ */
/* BUILD LIST ITEM */
/* ################################################################################ */
async function addFilesListItemAsync(filename, spectrumType, source, isLoaded) {
    $('#loadedFilesList').append(getFilesListItem(filename, spectrumType, source, isLoaded, isUserAuthorized));

    if (!isLoaded)
        return;

    saveFileAsync(filename);
    //if (isLoaded) {
    //    switch (source) {
    //        case SPECTRUM_SOURCE_EXTERNAL:
    //            if (isUserAuthorized)
    //                checkIsSpectrumOfTypeAndSourceIsSavedOnCloudAsync(filename, SPECTRUM_TYPE_ALIGNED, source);
    //            break;

    //        default:
    //            checkIsSpectrumOfTypeAndSourceIsSavedOnCloudAsync(filename, spectrumType, source);
    //            break;
    //    }
    //}
}

async function checkIsSpectrumOfTypeAndSourceIsSavedOnCloudAsync(filename, spectrumType, source) {
    /* check on cloud is executed by using only the meaningfull part of the filename */
    let tmp = filename.split('.');
    if (tmp.length > 1) {
        filename = tmp[0];
        /* when we're dealing with XML files we also need to remove the part of filename
           containing the SpectrumType */
        let spectrumTypeText = getSpectrumTypeDescription(spectrumType);
        filename = filename.replace(`_${spectrumTypeText}`, '')
    }

    let model = {
        Filename: filename,
        SpectrumType: spectrumType,
        SpectrumSource: source
    };

    let obj = await doAjaxGetAsync(UrlIsSpectrumTypeSavedOnCloud, model);
    if (obj) {
        /* update list of loaded spectra */
        updateListItem(filename, obj.IsOk, isUserAuthorized);

        if (obj.IsOk) {
            /* update the parsed spectrum id */
            updateParsedSpectrumId(filename, obj.Id);
            /* add the spectrum to the selected spectra */
            addSelectedSpectrum(obj.Id);
        }
    }
}

function getFilesListItem(filename, spectrumType, source, isLoaded, isUserAuthorized) {
    //console.log(`isMobile, ${isMobile()}`);
    if (isMobile())
        return getFilesListItemMobile(filename, spectrumType, source, isLoaded, isUserAuthorized);
    else
        return getFilesListItemDesktop(filename, spectrumType, source, isLoaded, isUserAuthorized);
}

function getFilesListItemDesktop(filename, spectrumType, source, isLoaded, isUserAuthorized) {
    let html = ``;
    html += getContainerDiv(filename);
    html += getBinIconDiv(filename);
    html += getLoadResultIcon(isLoaded);
    html += getFilenameDiv(source, filename);
    if (source == SPECTRUM_SOURCE_SLAB)
        html += getSpectrumTypeDiv(filename, spectrumType, '260');
    else
        html += `<div class="margin-horizontal-16" style="width: 260px">&nbsp;</div>`;
    html += getToSaveIcon(filename, null, isUserAuthorized);
    html += `</div>`;

    return html;
}

function getFilesListItemMobile(filename, spectrumType, source, isLoaded, isUserAuthorized) {
    let html = ``;
    html += getContainerDiv(filename);
    html += `<div id="item_${filename}" class="d-flex flex-row margin-vertical-8">`;
    html += getBinIconDiv(filename);
    html += getLoadResultIcon(isLoaded);
    html += getFilenameDiv(source, filename);
    html += getToSaveIcon(filename, null, isUserAuthorized);
    html += `</div>`;
    if (source == SPECTRUM_SOURCE_SLAB)
        html += getSpectrumTypeDiv(filename, spectrumType, '250');
    html += '<div><hr style="border: 0; height: 1px;" class="bg-cyan margin-top-4"></div>'
    html += `</div>`;

    return html;
}

/* -------------------------------------------------------------------------------- */
/* SAVED */
/* -------------------------------------------------------------------------------- */
function getSavedIcon(filename, isUserAuthorized) {
    if (isUserAuthorized)
        return getSavedOnCloudIcon(filename);
    else
        return getSavedLocallyIcon(filename);
}

function getSavedLocallyIcon(filename) {
    return `<div id="uploaded_${filename}" class="pointer"><span class="mif mif-drive mif-3x fg-cyan pointer" onclick="${saveFileAsync.name}('${filename}')" title="${LoadFileSavedOnCloudLabel}"></span></div>`;
}

function getSavedOnCloudIcon(filename) {
    return `<div id="uploaded_${filename}" class="pointer"><span class="mif mif-cloud-upload mif-3x fg-cyan pointer" onclick="${saveFileAsync.name}('${filename}')" title="${LoadFileSavedOnCloudLabel}"></span></div>`;
}

/* -------------------------------------------------------------------------------- */
/* TO SAVE */
/* -------------------------------------------------------------------------------- */
function getToSaveIcon(filename, color, isUserAuthorized) {
    if (isUserAuthorized)
        return getToSaveOnCloudIcon(filename, color);
    else
        return getToSaveLocallyIcon(filename, color);
}

function getToSaveLocallyIcon(filename, color) {
    let message = '';
    if (color == null || color == 'orange') {
        color = 'orange';
        message = LoadFileNotSavedLocallyMessage;
    } else if (color == 'red')
        message = LoadFileSaveLocallyErrorMessage;
    return `<div id="upload_${filename}" class="pointer" onclick="${saveFileAsync.name}('${filename}')"><span class="mif mif-drive mif-3x fg-${color} pointer" title="${message}"></span></div>`;
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

/* -------------------------------------------------------------------------------- */
/* UPDATE */
/* -------------------------------------------------------------------------------- */
function updateListItem(filename, isSaved, isUserAuthorized) {
    let spectrum = getParsedSpectrum(filename);
    if (isSaved) {
        const content = getSavedIcon(spectrum.Filename, isUserAuthorized);
        $(`#upload_${$.escapeSelector(spectrum.Filename)}`).replaceWith(content);
    } else
        $(`#uploaded_${$.escapeSelector(spectrum.Filename)}`).replaceWith(getToSaveIcon(spectrum.Filename, 'orange', isUserAuthorized));
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