function disableDownloadButtonDependingOnOS() {
    if (osName != 'Windows') {
        $('#buttonDownload').attr('title', TemporaryOnlyWindowsSupportedMessage);
    }
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    checkOsName();

    disableDownloadButtonDependingOnOS();
});