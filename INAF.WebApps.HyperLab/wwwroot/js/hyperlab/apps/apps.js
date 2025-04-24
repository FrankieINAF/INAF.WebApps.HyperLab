var osName = '';

function downloadApp() {
    if (osName != 'xWindows')
        return;
    const url = `/Apps/Download?appName=${encodeURIComponent('@appName')}&osName=${encodeURIComponent(osName)}`;
    window.location.href = url;
}

function checkOsName() {
    //console.log('os:' + ua.os.family);
    osName = ua.os.family;
    osName = osName.replace(/\d+/g, '').trim();
    //console.log('osName:"' + osName + '"');
    var text = `Detected ${osName} OS`;
    //console.log('text:' + text);
    document.getElementById('downloadCaption').innerText = text;
}

function disableDownloadButtonDependingOnOS() {
    if (osName != 'xWindows') {
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