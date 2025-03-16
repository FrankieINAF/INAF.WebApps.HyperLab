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

    updateChildrenIds(newId, 'fileExternalSavedCheckmark', intValue);
    updateChildrenIds(newId, 'fileExternalError', intValue);
    updateChildrenIds(newId, 'fileExternalInput', intValue);
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
async function loadExternalFileAsync(evt, element) {
    const file = evt[0];
    if (!file)
        return;

    //let filename = removeFileExtension(file.name);
    let filename = file.name;

    let tmp = element.id.split('_');
    let index = tmp[1];

    let reader = new FileReader();
    reader.onload = async function (event) {
        const text = event.target.result;
        if (isXML(text)) {
            await manageXmlProcedureAsync(text, filename, index);
        } else {
            manageCsvProcedure(text, filename, index, SPECTRUM_SOURCE_EXTERNAL);
        }
    };
    reader.readAsText(file);
}

async function manageXmlProcedureAsync(text, filename, index) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(text, "application/xml");

    // Example: Extract data from the XML
    let type = xmlDoc.getElementsByTagName("Type");
    if (type && type.length > 0) {
        //console.log(type[0].innerHTML);

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
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    cloneLoadFileButton('fileExternalLoad_0');
});