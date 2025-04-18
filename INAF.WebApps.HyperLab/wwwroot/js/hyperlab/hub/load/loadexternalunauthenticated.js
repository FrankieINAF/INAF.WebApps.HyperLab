/* ################################################################################ */
/* SAVE FILE */
/* ################################################################################ */
function saveExternalFileUnauthenticated(filename, xml) {
    const spectrumFile = buildSpectrumFile(null,
        filename,
        SPECTRUM_LEVEL_AVERAGED,
        SPECTRUM_TYPE_ALIGNED,
        SPECTRUM_SOURCE_EXTERNAL,
        xml);

    let isOk = true;
    try {
        sessionStorage.setItem(`${STORAGE_ITEM}_${filename}`, JSON.stringify(spectrumFile));
        addCreateChartsButton();
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