/* ################################################################################ */
/* SAVE USER SETTINGS */
/* ################################################################################ */
/* items for creating a queue for saving user settings */
var aQueue;
var saveUserSettingPromise = ({ ...data } = {}) => () => new Promise(async resolve => {
    await saveUserSettingAsync(data);
    resolve();
});

function getQueueItem(key, value) {
    return saveUserSettingPromise({ url: UrlSetUserSetting, model: { Key: key, Value: value } });
}

function callEnqueueSaveSetting(timeout, key, value, jsDelay) {
    if (timeout)
        clearTimeout(timeout);

    timeout = setTimeout(function () { enqueueSaveSetting(getQueueItem(key, value)); }, jsDelay);
}

function enqueueSaveSetting(saveSettingData) {
    aQueue.enqueue(saveSettingData);
}