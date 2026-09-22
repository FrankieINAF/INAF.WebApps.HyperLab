var osName = '';

function downloadApp() {
    if (osName != 'Windows')
        return;
    const url = `/Apps/DownloadApp?appName=${encodeURIComponent(appName)}&osName=${encodeURIComponent(osName)}`;
    window.location.href = url;
}

function downloadUserManual() {
    const url = `/Apps/DownloadUserManual?appName=${encodeURIComponent(appName)}`;
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