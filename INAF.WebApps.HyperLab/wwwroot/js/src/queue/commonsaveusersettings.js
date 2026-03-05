/* ################################################################################ */
/* SAVE USER SETTINGS */
/* ################################################################################ */
/* items for creating a queue for saving user settings */
//var aQueue;
var aQueue = new AutoQueue();

var saveUserSettingPromise = ({ ...data } = {}) => () => new Promise(async resolve => {
    await saveUserSettingAsync(data);
    resolve();
});

function getQueueItem(key, value) {
    return saveUserSettingPromise({ url: UrlSetUserSetting, model: { Key: key, Value: value } });
}

function enqueueSaveSetting(saveSettingData) {
    aQueue.enqueue(saveSettingData);
}

/* -------------------------------------------------------------------------------- */
/* CALLERS */
/* -------------------------------------------------------------------------------- */
function callEnqueueSaveSetting(key, value, jsDelay, timeout) {
    if (timeout)
        clearTimeout(timeout);

    timeout = setTimeout(function () { enqueueSaveSetting(getQueueItem(key, value)); }, jsDelay);
}

function tryCallEnqueueSaveSetting(key, value, jsDelay = JS_DELAY_200, timeout = null) {
    if (isUserAuthenticated)
        callEnqueueSaveSetting(key, value, jsDelay, timeout);
}

function tryCallEnqueueSaveSetting(key, value, timeout = null) {
    if (isUserAuthenticated)
        callEnqueueSaveSetting(key, value, JS_DELAY_200, timeout);
}