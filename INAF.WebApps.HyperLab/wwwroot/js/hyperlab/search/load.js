var LOADED_SPECTRUM = "loadedSpectrum";
var EXTERNAL = "External";
var numOfLoadedSPectra = 0;

var loadedSpectraIds = [];

function addLoadFileButton(elementId, elementIdParent) {

    let tmp = elementId.split('_');
    let itemsCount = $(`[id^='${tmp[0]}']`).length;
    let intValue = itemsCount;

    let clonedElement = $(`#${elementId}`).clone();

    let id = clonedElement.attr('id');
    let newId = updateUIElemId(id, intValue);
    clonedElement.attr('id', newId);
    $(`#${elementIdParent}`).append(clonedElement);

    updateChildrenIds(newId, 'fileSavedCheckmark', intValue);
    updateChildrenIds(newId, 'fileInput', intValue);
}

function updateChildrenIds(parentId, idToBeSearched, intValue) {
    var items = $(`#${parentId}`).find(`[id^=${idToBeSearched}]`);
    if (items && items.length > 0) {
        let item = items[0];
        let itemId = $(item).attr('id');
        let newId = updateUIElemId(itemId, intValue);
        //let tmp = itemId.split('_');
        //let newId = tmp[0] + '_' + index;

        $(item).attr('id', newId);
    }
}

function createSpectrumElement(xValue, yValue) {
    return {
        Wavelength: xValue,
        Value: yValue
    };
}

function removeFileExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

async function loadFileAsync(evt, element) {
    const file = evt[0];
    if (!file)
        return;

    let filename = removeFileExtension(file.name);

    const reader = new FileReader();
    reader.onload = async function (event) {
        const text = event.target.result;
        numOfLoadedSPectra++;
        let xml = buildSpectrum(filename, text);
        if (xml) {
            await saveExternalFileAsync(filename, xml);
        }
    };
    reader.readAsText(file);
}

/* ################################################################################ */
/* SAVE FILE */
/* ################################################################################ */
async function saveExternalFileAsync(filename, xml) {
    let spectrumFile = {
        Id: 0,
        Filename: filename,
        ParentId: null,
        Type: SPECTRUM_TYPE_RAW,
        Level: SPECTRUM_LEVEL_AVERAGED,
        Source: SPECTRUM_SOURCE_SLAB,
        Xml: xml
    }

    let saveSpectrumRequest = {
        spectrumFile: spectrumFile,
    };

    let isOk = true;
    let obj = await doAjaxPostAsync(UrlSaveSpectrumOfTypeRaw, saveSpectrumRequest);
    if (obj) {
        if (obj.IsOk) {
            loadedSpectraIds.push(obj.Id);
            var items = $(`#${newId}`).find('[id^=fileSavedCheckmark]');
        } else
            isOk = false;
    } else
        isOk = false;

    if (!isOk)
        showSimpleDialog(WARNING_LABEL, LoadFileSaveOnCloudErrorMessage, WARNING);
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

function parseCSV(text) {
    const lines = text.split('\n');
    let points = [];

    for (let i = 0; i < lines.length; i++) {
        const values = lines[i].split(',');
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