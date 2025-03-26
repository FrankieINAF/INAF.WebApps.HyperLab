/* ################################################################################ */
/* SAVE FILE */
/* ################################################################################ */
function saveExternalFileUnauthenticated(filename, xml) {
    let spectrumFile = {
        Id: 0,
        Filename: filename,
        ParentId: null,
        Type: SPECTRUM_TYPE_ALIGNED,
        Level: SPECTRUM_LEVEL_AVERAGED,
        Source: SPECTRUM_SOURCE_EXTERNAL,
        Xml: xml
    };

    let isOk = true;
    try {
        sessionStorage.setItem(`${STORAGE_ITEM}_filename`, JSON.stringify(spectrumFile));
    } catch (e) {
        isOk = false;
    }

    if (isOk) {
        /* update the list item on UI by changing the cloud icon color */
        updateListItem(filename, isOk);
    }
    else
        showSimpleDialog(ERROR_LABEL, LoadFileSaveOnCloudErrorMessage, ALERT);
}