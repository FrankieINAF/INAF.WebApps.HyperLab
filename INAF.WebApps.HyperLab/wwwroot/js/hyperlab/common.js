var GET = 'GET';
var POST = 'POST';

var APPBAR_HEIGHT = 52;

var DEFAULT_TIMEOUT_FOR_ANIMATE = 400; // animation duration is set to 500 ms by using 'animate__fater' in animateCSS function

var SLOW = 'slow';
var SLOWER = 'slower';
var FAST = 'fast';
var FASTER = 'faster';

var DELAY_2S = 'delay-2s';
var DELAY_3S = 'delay-3s';
var DELAY_4S = 'delay-4s';
var DELAY_5S = 'delay-5s';

var isFirstLoading = true;
var metroActivity;

function isNumber(str) {
    return !isNaN(str);
}

function showPageItems(callback) {
    showByClass('leftMenu');
    animateCSS('leftMenu', 'fadeIn', FASTER);

    showByClass('appbar');
    animateCSS('appbar', 'fadeIn', FASTER);

    showByClass('renderbody');
    animateCSS('renderbody', 'fadeIn', FASTER, callback);
}

/* constants for css transform */
var TRANSITION_DURATION = 250;
var TRANSITION_SHORTHAND = 'all ' + TRANSITION_DURATION + 'ms cubic-bezier(0.4, 0.46, 0.32, 1)';

function animateCSS(element, animation, speed = 'faster', callback = null, delay = null, prefix = 'animate__') {
    // We create a Promise and return it
    return new Promise((resolve, reject) => {
        try {
            const animationName = `${prefix}${animation}`;
            const node = document.querySelector(`#${element}`);

            node.classList.add(`${prefix}animated`, `${animationName}`, `animate__${speed}`);
            if (delay)
                node.classList.add(`animate__${delay}`);

            // When the animation ends, we clean the classes and resolve the Promise
            function handleAnimationEnd(event) {
                event.stopPropagation();
                node.classList.remove(`${prefix}animated`, `${animationName}`, `animate__${speed}`);
                if (delay)
                    node.classList.remove(`animate__${delay}`);
                //resolve('Animation ended');
                if (callback)
                    callback();
            }

            node.addEventListener('animationend', handleAnimationEnd, { once: true });
        } catch (e) {
            console.log(`animateCSS - ex: ${e} - elem: ${element}`);
        }
    });
}

function animateCSSAsync(element, animation, speed = 'faster', callback = null, delay = null, prefix = 'animate__') {
    // We create a Promise and return it
    return new Promise((resolve, reject) => {
        try {
            const animationName = `${prefix}${animation}`;
            const node = document.querySelector(`#${element}`);

            node.classList.add(`${prefix}animated`, `${animationName}`, `animate__${speed}`);
            if (delay)
                node.classList.add(`animate__${delay}`);

            // When the animation ends, we clean the classes and resolve the Promise
            function handleAnimationEnd(event) {
                event.stopPropagation();
                node.classList.remove(`${prefix}animated`, `${animationName}`, `animate__${speed}`);
                if (delay)
                    node.classList.remove(`animate__${delay}`);
                resolve();
            }

            node.addEventListener('animationend', handleAnimationEnd, { once: true });
        } catch (e) {
            console.log(`animateCSS - ex: ${e} - elem: ${element}`);
        }
    });
}

async function waitForBooleanValueAsync(checkFunction, interval = 100) {
    while (!checkFunction()) {
        console.log(`waiting...for ${interval}`);
        await delay(interval);
    }
}

function delay(millisecs) {
    return new Promise(resolve => setTimeout(resolve, millisecs));
}

function executeDownloadFile(data, filename) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // `${spectrum.Name}_${getSpectrumTypeString(SPECTRUM_TYPE_ALIGNED)}.csv`;

    // Append the anchor element to the document and trigger a click to start the download
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the anchor element and revoking the Blob URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function returnTrue() { return true; }

function returnFalse() { return false; }

/* MOBILE/NOT */
var screenDims;
var MOBILE_MAX_WIDTH = 576;
var MOBILE_LARGE_MAX_WIDTH = 576;

function checkScreenDims() {
    //console.log("Your screen resolution is: " + window.screen.width + "x" + window.screen.height);

    screenDims = {
        width: window.screen.width,
        height: window.screen.height
    };
}

function cloneUIElement(elementId, elementIdParent) {

    let clonedElement = $(`#${elementId}`).clone();

    $(`#${elementIdParent}`).append(clonedElement);
}

function createSimplePoint(x, y) {
    return {
        X: x,
        Y: y
    };
}

function defineUtcOffset() {
    UTC_OFFSET = 'UTC' + (UTC_OFFSET_HOURS > 0 ? '+' + UTC_OFFSET_HOURS : UTC_OFFSET_HOURS);
}

function isAnyItem(array) {
    return (array && array.length > 0);
}

function isMobile() {
    checkScreenDims();
    if (screenDims.width <= MOBILE_MAX_WIDTH) {
        return true;
    } else {
        return false;
    }
}

$(document).ready(function () {
    luxon.Settings.defaultLocale = 'utc';
    luxon.Settings.defaultZoneName = 'utc';

    defineUtcOffset();

    /* check screen dimensions */
    checkScreenDims();
});

function navigateTo(url) {
    window.location.href = url;
}

/* -------------------------------------------------------------------------------- */
/* ---------- SESSION STORAGE ---------- */
/* -------------------------------------------------------------------------------- */
function getItemsFromSessionStorage(requestedKey) {
    let items = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        let key = sessionStorage.key(i);
        if (key.startsWith(requestedKey)) {
            let value = sessionStorage.getItem(key);
            items.push(JSON.parse(value));
        }
    }

    return items;
}

function removeItemsFromSessionStorage(requestedKey) {
    for (let i = 0; i < sessionStorage.length; i++) {
        let key = sessionStorage.key(i);
        if (key.startsWith(requestedKey)) {
            sessionStorage.removeItem(key);
            i--; // Decrementa l'indice per compensare la rimozione dell'elemento
        }
    }

}

/* -------------------------------------------------------------------------------- */
/* ---------- DIALOGS/NOTIFICATIONS ---------- */
/* -------------------------------------------------------------------------------- */
var ALERT = 'alert';
var INFO = 'info';
var SUCCESS = 'success';
var WARNING = 'warning';
var appToast;

var ICON_INFO_NAME = 'mif-info';
var ICON_WARNING_NAME = 'mif-warning';
var ICON_ERROR_NAME = 'mif-cross-light';

var COLOR_INFO_CLASS = 'fg-green';
var COLOR_WARNING_CLASS = 'fg-yellow';
var COLOR_ERROR_CLASS = 'fg-red';

function showDialogWithAction(title, content, cls, caption1, callback1) {
    Metro.dialog.create({
        title: title,
        content: content,
        clsDialog: cls,
        closeButton: true,
        actions: [
            {
                caption: caption1,
                cls: "js-dialog-close info",
                onclick: function () {
                    callback1();
                }
            },
        ]
    });
}

function showDialogWithActions(title, content, cls, caption1, caption2, callbackYes, callbackNo) {
    Metro.dialog.create({
        title: title,
        content: content,
        clsDialog: cls,
        closeButton: true,
        actions: [
            {
                caption: caption1,
                cls: "js-dialog-close info",
                onclick: function () {
                    callbackYes();
                }
            },
            {
                caption: caption2,
                cls: "js-dialog-close",
                onclick: function () {
                    if (callbackNo)
                        callbackNo();
                }
            }
        ]
    });
}

function showSimpleDialog(title, content, cls) {
    Metro.dialog.create({
        title: title,
        content: content,
        clsDialog: cls,
        closeButton: true
    });
}

function showInfoBox(label, message, infoBoxType) {
    Metro.infobox.create(
        `<h3>${label}</h3><p>${message}</p>`, infoBoxType
    );
}

function showToast(message, timeout, type) {
    if (appToast)
        Metro.toast.remove(appToast);

    appToast = Metro.toast.create(message, null, timeout, type);
}

function addReturnListenerToElem(id, callback) {
    $(`#${id}`).on('keyup', function (evt) {
        if (evt.which == 13)
            callback();
    });
}

function executeCallback(callback, args) {
    callback.apply(this, args);
}

/* MISCELLANEA */
function askAndExecute(mytitle, mymessage, mycallback, args) {
    Metro.dialog.create({
        title: mytitle,
        content: mymessage,
        clsDialog: "warning",
        actions: [
            {
                caption: YES_LABEL,
                cls: "js-dialog-close info",
                onclick: function () {
                    executeCallback(mycallback, args);
                }
            },
            {
                caption: NO_LABEL,
                cls: "js-dialog-close",
            }
        ]
    });
}

function askAndExecuteWithTimeout(mytitle, mymessage, mycallback, args, timeInterval) {
    Metro.dialog.create({
        title: mytitle,
        content: mymessage,
        clsDialog: "warning",
        actions: [
            {
                caption: YES_LABEL,
                cls: "js-dialog-close info",
                onclick: function () {
                    setTimeout(function () {
                        executeCallback(mycallback, args);
                    }), timeInterval;
                }
            },
            {
                caption: NO_LABEL,
                cls: "js-dialog-close",
            }
        ]
    });
}

function confirmAndExecute(mytitle, mymessage, mycallback, elemId, status) {
    Metro.dialog.create({
        title: mytitle,
        content: mymessage,
        clsDialog: "warning",
        actions: [
            {
                caption: YES_LABEL,
                cls: "js-dialog-close info",
                onclick: function () {
                    if (status) {
                        mycallback(elemId, status);
                    } else {
                        mycallback(elemId);
                    }
                }
            },
            {
                caption: NO_LABEL,
                cls: "js-dialog-close"
            }
        ]
    });
}

function decimalToHex(decimal) {
    return (decimal).toString(16);
}

function disableByClassElem(id) {
    $(`#${id}`).addClass('disabled');
}

function emptyElem(id) {
    $(`#${id}`).empty();
}

function enableByClassElem(id) {
    $(`#${id}`).removeClass('disabled');
}

function executeAfter(callback, timeout) {
    if (!callback)
        return;

    setTimeout(function () { callback(); }, timeout);
}

function executeMultipleAfter(callbacksContainer, timeout) {
    setTimeout(callbacksContainer, timeout);
}

function firstLetterLowerCase(text) {
    return text.charAt(0).toLowerCase() + text.slice(1);
}

function firstLetterUpperCase(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function hexToDecimal(hex) {
    return parseInt(hex.replace('#', ''), 16);
}

function isCheckboxChecked(id) {
    return $(`#${id}`).is(':checked');
}

function setLoadingCircleIsVisible(isVisible) {
    try {
        if (isVisible) {
            if (metroActivity)
                return;

            metroActivity = Metro.activity.open({
                style: 'light',
                type: 'ring',
                overlayClickClose: false
            });
        } else {
            if (metroActivity) {
                Metro.activity.close(metroActivity);
                metroActivity = null;
            }
        }
    } catch (e) {
        console.log('setLoadingCircleIsVisible - ex:' + e.message);
    }
}

function tryClearAppBar() {
    try { $('#buttonsAppBar').empty(); } catch (ex) { console.log(`tryClearAppBar - ex: ${ex}`); }
}

function updateUIElemId(oldId, intValue) {
    let tmp = oldId.split('_');
    let newId = tmp[0] + '_' + (parseInt(tmp[1]) + intValue);
    return newId;
}

function varToString(varObj) {
    return Object.keys(varObj)[0];
}

/* amt > 0 for lighten, amt < 0 for darken */
function lightenDarkenColor(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col, 16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    var b = ((num >> 8) & 0x00ff) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    var g = (num & 0x0000ff) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

/* SHOW/HIDE ELEMENTS */
function hide(id) {
    $(`#${id}`).css('display', 'none');
}

function hideByClass(id) {
    $(`#${id}`).addClass('d-none');
}

function hideByClassDFlexItem(id) {
    $(`#${id}`).removeClass('d-flex').addClass('d-none');
}

function hideElem(elem) {
    $(elem).css('display', 'none');
}

function isVisibleByClass(id) {
    return !$(`#${id}`).hasClass('d-none');
}

function remove(id) {
    $(`#${id}`).remove();
}

function removeClass(id, classname) {
    $(`#${id}`).removeClass(classname);
}

function addClass(id, classname) {
    $(`#${id}`).addClass(classname);
}

function setElemVisible(elemId, isVisible) {
    if (isVisible)
        $('#' + elemId).css('display', 'block');
    else
        $('#' + elemId).css('display', 'none');
}

function show(id) {
    $(`#${id}`).css('display', 'block');
}

function showByClass(id) {
    $(`#${id}`).removeClass('d-none');
}

function showByClassDFlexItem(id) {
    $(`#${id}`).addClass('d-flex').removeClass('d-none');
}

function showElem(elem) {
    $(elem).css('display', 'block');
}

function showFlexElem(elem) {
    $(elem).css('display', 'flex');
}

function showFlex(id) {
    $(`#${id}`).css('display', 'flex');
}

function showFlexElem(elem) {
    $(elem).css('display', 'flex');
}

function showInlineFlexElem(elem) {
    $(elem).css('display', 'inline-flex');
}

/* MANAGE METRO UI ELEMENTS */
function addCLassToMetroUIElem(id, classname) {
    if (($(`#${id}`)).length > 0)
        $(`#${id}`).parent().addClass(classname);
}

function hideElemMetroUIElem(id) {
    if (($(`#${id}`)).length > 0)
        hideElem($(`#${id}`).parent()[0]);
}

function hideMetroUIElem(id) {
    if (($(`#${id}`)).length > 0)
        hide($(`#${id}`).parent()[0].id);
}

function removeMetroUIElemByName(name) {
    $(`[name="${name}"]`).parent().remove();
}

function removeCLassToMetroUIElem(id, classname) {
    $(`#${id}`).parent().removeClass(classname);
}

function setMetroUIButtonEnabled(id, isEnabled) {
    if (isEnabled) {
        $(`#${id}`).removeClass('disabled');
    } else {
        $(`#${id}`).addClass('disabled');
    }
}

function setTextField(id, text) {
    $(`#${id}`).text(text);
}

function showByClassMetroUIElem(id) {
    let parent = $(`#${id}`).parent()[0];
    $(parent).removeClass('d-none');
}

function showElemMetroUIElem(id) {
    showElem($(`#${id}`).parent()[0]);
}

function showFlexElemMetroUIElem(id) {
    showFlexElem($(`#${id}`).parent()[0]);
}

function showFlexMetroUIElem(id) {
    showFlex($(`#${id}`).parent()[0].id)
}

/* HTML LISTS */
function getOrderedList(items, property, listStyle) {
    var html = `<ol class="${listStyle}">`;
    var itemsNum = items.length;
    for (j = 0; j < itemsNum; j++) {
        html += `<li>${items[j][property]}</li>`;
    }
    html += `</ol>`;

    return html;
}

/* CONTACTS */
function sendMail(email) {
    var link = `mailto:${email}`;

    window.location.href = link;
    return false;
}

/* IMAGE SELECTION */
function onImageChange(evt, id) {
    const files = evt.target.files;
    var logoPreview = $(`#${id}`);

    if (files) {
        var reader = new FileReader();
        reader.onload = function () {
            $(`#${id}`).attr("src", reader.result);
        }
        reader.readAsDataURL(evt.target.files[0]);
    }
}

/* -------------------------------------------------------------------------------- */
/* ---------- ELEMENT POSITION/DIMENSION ---------- */
/* -------------------------------------------------------------------------------- */
/* ABSOLUTE */
function setPositionAbsoluteComplete(id, top, left) {
    $(`#${id}`).css({ position: 'absolute', top: `${(top)}px`, left: `${left}` });
}

function setPositionLeftAbsolutePx(id, top) {
    $(`#${id}`).css({ position: 'absolute', left: `${top}px` });
}

function setPositionTopAbsolutePx(id, top) {
    $(`#${id}`).css({ position: 'absolute', top: `${top}px` });
}

/* RELATIVE */
//function setPositionCompleteRelativePxPercent(id, top, left) {
//    $(`#${id}`).css({ top: `${(top)}px`, left: `${left}%` });
//}

function setPositionLeftRelativePercent(id, left) {
    $(`#${id}`).css({ left: `${left}%` });
}

function setPositionLeftRelativePx(id, left) {
    $(`#${id}`).css({ left: `${left}px` });
}

function setPositionTopRelativePx(id, top) {
    $(`#${id}`).css({ top: `${top}px` });
}

/* -------------------------------------------------------------------------------- */
/* ---------- FORMAT DATETIME ---------- */
/* -------------------------------------------------------------------------------- */
function dateTimeToDate(dateTime) {
    return dateTime.split('T')[0];
}

function formatDate(jsDateTime) {
    return dateTimeToDate(luxonToISONoOffset(luxonMillisToDateTime(jsDateTime)));
}
/* -------------------------------------------------------------------------------- */
/* ---------- LUXON ---------- */
/* -------------------------------------------------------------------------------- */
function luxonMillisToDateTime(jsDateTime) {
    return luxon.DateTime.fromMillis(jsDateTime);
}

function luxonToISONoOffset(currentDateTime) {
    return currentDateTime.toISO({ includeOffset: false });
}

function luxonToLocaleString(currentDateTime) {
    return currentDateTime.toUTC().toLocaleString(luxon.DateTime.DATE_SHORT)
}

function luxonAddSeconds(currentDateTime, value) {
    return currentDateTime.plus({ seconds: value });
}

/* -------------------------------------------------------------------------------- */
/* ---------- ASYNC/AWAIT AJAX REQUESTS ---------- */
/* -------------------------------------------------------------------------------- */
async function doAjaxGetNoModelAsync(url, failcallback) {
    let result;

    try {
        result = $.ajax({
            type: GET,
            url: url,
            async: true,
            contentType: "application/json",
            dataType: "json",
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.message);
        if (failcallback)
            failcallback();
    }

    return result;
}

async function doAjaxGetNoModelCorsAsync(url, failcallback) {
    let result;

    try {
        result = $.ajax({
            type: GET,
            url: url,
            async: true,
            crossDomain: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
            }
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.message);
        if (failcallback)
            failcallback();
    }

    return result;
}

async function doAjaxGetAsync(url, model, failcallback) {
    let result;

    try {
        result = $.ajax({
            type: GET,
            url: url,
            async: true,
            contentType: "application/json",
            dataType: "json",
            data: model
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.message);
        if (failcallback)
            failcallback();
    }

    return result;
}

async function doAjaxGetHtmlAsync(url, failcallback) {
    let result;

    try {
        result = await $.ajax({
            type: GET,
            url: url,
            async: true,
            contentType: "application/json; charset=utf-8",
            dataType: "html"
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.responseText);
        if (failcallback)
            failcallback();
    }

    return result;
}

async function doAjaxPostAsync(url, model, failcallback) {
    let result;

    try {
        result = await $.ajax({
            type: POST,
            url: url,
            async: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(model),
            headers: {
                RequestVerificationToken:
                    $('input:hidden[name="__RequestVerificationToken"]').val()
            }
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.responseText);
        if (failcallback)
            failcallback();
    }

    return result;
}

async function doAjaxPostDefaultContentTypeAsync(url, model, failcallback) {
    let result;

    try {
        result = await $.ajax({
            type: POST,
            url: url,
            async: true,
            dataType: "json",
            data: model,
            headers: {
                RequestVerificationToken:
                    $('input:hidden[name="__RequestVerificationToken"]').val()
            }
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.responseText);
        if (failcallback)
            failcallback();
    }

    return result;
}

async function doAjaxPostHtmlAsync(url, model, failcallback) {
    let result;

    try {
        result = await $.ajax({
            type: POST,
            url: url,
            async: true,
            contentType: "application/json; charset=utf-8",
            dataType: "html",
            data: JSON.stringify(model)
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.responseText);
        if (failcallback)
            failcallback();
    }

    return result;
}

async function doAjaxPostNoModelAsync(url, failcallback) {
    let result;

    try {
        result = await $.ajax({
            type: POST,
            url: url,
            async: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                RequestVerificationToken:
                    $('input:hidden[name="__RequestVerificationToken"]').val()
            }
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.message);
        if (failcallback)
            failcallback();
    }

    return result;
}

/* -------------------------------------------------------------------------------- */
/* ---------- ASYNC/AWAIT PARTIAL VIEW ---------- */
/* -------------------------------------------------------------------------------- */
function loadPartialViewWithAjaxGet(url, model, targetId, donecallback, failcallback) {
    setLoadingCircleIsVisible(true);

    $.ajax({
        type: GET,
        url: url,
        cache: false,
        async: true,
        dataType: "html",
        data: model,
    }).done(function (obj) {
        $(`#${targetId}`).html(obj);

        if (donecallback)
            donecallback();

        setLoadingCircleIsVisible(false);
    }).fail(function (xhr, status, error) {
        if (failcallback)
            fail(xhr, status, error);
        else {
            console.log(`${url} - xhr:` + xhr);
            console.log(`${url} - status:` + status);
            console.log(`${url} - error:` + error);
        }
        setLoadingCircleIsVisible(false);
    });
}

function loadPartialViewWithAjaxGetNoModel(url, targetId, donecallback, failcallback) {
    setLoadingCircleIsVisible(true);

    $.ajax({
        type: GET,
        url: url,
        cache: false,
        async: true,
        dataType: "html",
    }).done(function (obj) {
        $(`#${targetId}`).html(obj);

        if (donecallback)
            donecallback();

        setLoadingCircleIsVisible(false);
    }).fail(function (xhr, status, error) {
        if (failcallback)
            fail(xhr, status, error);
        else {
            console.log(`${url} - xhr:` + xhr);
            console.log(`${url} - status:` + status);
            console.log(`${url} - error:` + error);
        }
        setLoadingCircleIsVisible(false);
    });
}

function loadPartialViewWithAjaxPost(url, model, targetId, donecallback, failcallback) {
    setLoadingCircleIsVisible(true);

    $.ajax({
        type: POST,
        url: url,
        cache: false,
        async: true,
        dataType: "html",
        data: model,
        headers: {
            RequestVerificationToken:
                $('input:hidden[name="__RequestVerificationToken"]').val()
        }
    }).done(function (obj) {
        $(`#${targetId}`).html(obj);

        if (donecallback)
            donecallback();

        setLoadingCircleIsVisible(false);
    }).fail(function (xhr, status, error) {
        if (failcallback)
            fail(xhr, status, error);
        else {
            console.log(`${url} - xhr:` + xhr);
            console.log(`${url} - status:` + status);
            console.log(`${url} - error:` + error);
        }
        setLoadingCircleIsVisible(false);
    });
}

/* -------------------------------------------------------------------------------- */
/* ---------- PROMISES FROM AJAX REQUESTS ---------- */
/* -------------------------------------------------------------------------------- */
function getAjaxGetPromise(url) {
    return $.ajax({
        type: 'GET',
        url: url,
        async: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });
}

function getAjaxPostPromise(url, model) {
    return $.ajax({
        type: POST,
        url: url,
        async: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(model),
        headers: {
            RequestVerificationToken:
                $('input:hidden[name="__RequestVerificationToken"]').val()
        }
    });
}

function killPromise(promise) {
    if (promise && promise.readyState < 4)
        promise.abort();
}

/* ##################################################################################  */
/* SUBMIT FORM WITH AJAX REQUESTS */
/* ##################################################################################  */
async function doSubmitFormWithAjaxAsync(url, serializedform, failcallback) {
    let result;

    try {
        result = await $.ajax({
            url: url,
            type: POST,
            async: true,
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: serializedform
        });
    } catch (e) {
        console.log(`${url} - ex:` + e.message);
        if (failcallback)
            failcallback();
    }

    return result;
}

/* ##################################################################################  */
/* JQUERY EXTENSIONS */
/* ##################################################################################  */
$.extend(
    {
        redirectPost: function (location, args) {
            var form = '';
            $.each(args, function (key, value) {
                form += '<input type="hidden" name="' + key + '" value="' + value + '">';
            });
            $('<form action="' + location + '" method="POST">' + form + '</form>').appendTo('body').submit();
        }
    });


/* ##################################################################################  */
/* FORM VALIDATION */
/* ##################################################################################  */
function isFormValid(formElem) {
    if (!$(formElem).valid()) {
        var validator = $(formElem).validate();

        for (var i in validator.errorMap) {
            console.log(i, ":", validator.errorMap[i]);
        }

        return false;
    }

    return true;
}

function submitForm(formObj) {
    if (isFormValid(formObj)) {
        setLoadingCircleIsVisible(true);

        $(formObj).submit();
    }
}

/* ##################################################################################  */
/* DOCUMENT READY */
/* ##################################################################################  */
$(document).ready(function () {
    checkScreenDims();
});
