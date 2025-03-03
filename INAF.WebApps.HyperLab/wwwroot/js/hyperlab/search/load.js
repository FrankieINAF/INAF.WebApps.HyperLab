var LOADED_SPECTRUM = "loadedSpectrum";
var EXTERNAL = "External";

var clonedLoadFileButton = null;

/* ################################################################################ */
/* LOAD FILE BUTTONS MANAGEMENT */
/* ################################################################################ */
function cloneLoadFileButton(elementId) {
    clonedLoadFileButton = $(`#${elementId}`).clone();
}

function addLoadFileButton(elementId, elementIdParent) {

    let tmp = elementId.split('_');
    let itemsCount = $(`[id^='${tmp[0]}']`).length;
    let intValue = itemsCount;

    let clonedElement = clonedLoadFileButton.clone();

    let id = clonedElement.attr('id');
    let newId = updateUIElemId(id, intValue);
    clonedElement.attr('id', newId);
    $(`#${elementIdParent}`).append(clonedElement);

    updateChildrenIds(newId, 'fileSavedCheckmark', intValue);
    updateChildrenIds(newId, 'fileError', intValue);
    updateChildrenIds(newId, 'fileInput', intValue);
}

function updateChildrenIds(parentId, idToBeSearched, intValue) {
    var items = $(`#${parentId}`).find(`[id^=${idToBeSearched}]`);
    if (items && items.length > 0) {
        let item = items[0];
        let itemId = $(item).attr('id');
        let newId = updateUIElemId(itemId, intValue);

        $(item).attr('id', newId);
    }
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

async function loadFileAsync(evt, element) {
    const file = evt[0];
    if (!file)
        return;

    let filename = removeFileExtension(file.name);

    let tmp = element.id.split('_');
    let index = tmp[1];

    let reader = new FileReader();
    reader.onload = async function (event) {
        const text = event.target.result;
        if (isXML(text)) {
            await readXmlProcedureAsync(text, filename, index);
        } else {
            readCsvProcedure(text, filename, index);
        }
    };
    reader.readAsText(file);
}

function readCsvProcedure(text, filename, index) {
    let xml = buildSpectrum(filename, text);
    if (xml) 
        saveExternalFileAsync(filename, xml, index);
    else 
        showSimpleDialog(ERROR_LABEL, LoadFileReadCsvFileErrorMessage, ALERT);
}

async function readXmlProcedureAsync(text, filename, index) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(text, "application/xml");

    // Example: Extract data from the XML
    let type = xmlDoc.getElementsByTagName("Type");
    if (type && type.length > 0) {
        console.log(type[0].innerHTML);

        let model = {
            Text: type[0].innerHTML
        };

        let isOk = true;
        let obj = await doAjaxGetAsync(UrlGetSpectrumTypeByTypeLabel, model);
        if (obj) {
            isOk = obj.IsOk;
            if (isOk) {
                await retrieveExternalFileIdAsync(filename, obj.Id, index)
            }
        } else
            isOk = false;

        if (!isOk)
            showSimpleDialog(ERROR_LABEL, LoadFileReadXmlFileErrorMessage, ALERT);
    }
}

function removeFileExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

/* ################################################################################ */
/* SAVE/RETRIEVE FILE */
/* ################################################################################ */
function addSpectrumIdProcedure(id, index) {
    selectedSpectra.push(id);
    addCreateChartsButtonProcedure();
    showByClass(`fileSavedCheckmark_${index}`);
}

async function retrieveExternalFileIdAsync(filename, typeId, index) {
    let spectrumTypeText = getSpectrumTypeDescription(typeId);
    filename = filename.replace(`_${spectrumTypeText}`, '')
                       .replace('.xml', '');

    let model = {
        Text: filename,
        Type: spectrumTypeText
    };

    let isOk = true;
    let obj = await doAjaxGetAsync(UrlGetSpectrumIdByNameAndSpectrumType, model);
    if (obj) {
        if (obj.Id > 0)
            addSpectrumIdProcedure(obj.Id, index);
        else {
            showByClass(`fileError_${index}`);
            showSimpleDialog(ERROR_LABEL, LoadFileReadXmlRetrieveIdErrorMessage, ALERT);
        }
    } else
        isOk = false;

    if (!isOk)
        showSimpleDialog(ERROR_LABEL, LoadFileRetrieveSpectrumTypeErrorMessage, ALERT);
}

async function saveExternalFileAsync(filename, xml, index) {
    let spectrumFile = {
        Id: 0,
        Filename: filename,
        ParentId: null,
        Type: SPECTRUM_TYPE_ALIGNED,
        Level: SPECTRUM_LEVEL_AVERAGED,
        Source: SPECTRUM_SOURCE_EXTERNAL,
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
/* BUILD XML */
/* ################################################################################ */

function buildSpectrum(filename, text) {
    let info = {
        RawFilename: filename,
        Type: EXTERNAL
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

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    cloneLoadFileButton('fileLoad_0');
});