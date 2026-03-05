var LOADED_SPECTRUM = "loadedSpectrum";
var EXTERNAL = "External";

/* ################################################################################ */
/* FILES READING */
/* ################################################################################ */
async function loadExternalFilesAsync(evt, element) {
    console.log(evt);

    if (evt == null)
        return;

    await loadFilesAsync(evt, SPECTRUM_SOURCE_EXTERNAL)
}

/* ################################################################################ */
/* SAVE FILE */
/* ################################################################################ */
async function saveExternalFileAuthenticatedAsync(filename, xml) {
    let spectrumFile = {
        Id: 0,
        Filename: filename,
        ParentId: null,
        Type: SPECTRUM_TYPE_ALIGNED,
        Level: SPECTRUM_LEVEL_AVERAGED,
        Source: SPECTRUM_SOURCE_EXTERNAL,
        Xml: xml
    };

    let saveSpectrumRequest = {
        spectrumFile: spectrumFile,
    };

    let isOk = true;
    let obj = await doAjaxPostAsync(UrlSaveExternalSpectrum, saveSpectrumRequest);
    if (obj) {
        isOk = obj.IsOk;
        if (isOk) {
            /* update the list item on UI by changing the cloud icon color */
            updateListItem(filename, isOk);
            /* update the parsed spectrum id */
            updateParsedSpectrumId(filename, obj.Id);
            /* add the spectrum to the selected spectra */
            addSelectedSpectrum(obj.Id);
        }
    } else
        isOk = false;

    if (!isOk)
        showSimpleDialog(ERROR_LABEL, LoadFileSaveOnCloudErrorMessage, ALERT);
}
