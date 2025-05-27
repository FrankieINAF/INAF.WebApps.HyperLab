
var showCharmsColorSelectorId = 'buttonShowCharmsColorSelector';
var showCharmsLegendButtonId = 'buttonShowCharmsLegend';
var goToChartsButtonId = 'buttonGoToCharts';
var helpButtonId = 'buttonHelp';

var openMessagesCharmsButtonId = 'buttonOpenMessagesCharms';
var searchButtonId = 'buttonSearch';
var setPublicButtonId = 'buttonSetPublic';
var shareButtonId = 'buttonShare';
var zoomOutButtonId = 'buttonZoomOut';

var OPTIONS_TITLE_ALIGNMENT = 'alignmentoptionstitle';
var OPTIONS_TITLE_FIT = 'fitoptionstitle';
var OPTIONS_TITLE_SMOOTHING = 'smoothingoptionstitle';

var NAVIGATION_BACK_TO_SEARCH = 'navigationbacktosearch';
var NAVIGATION_BACK_CLEAR_CHART = 'navigationbackclearchart';
var NAVIGATION_CREATE_CHART = 'navigationcreatechart';
var NAVIGATION_INIT = 'navigationinit';
var NAVIGATION_SHOW_CHART = 'navigationshowchart';
var navigationStatus = NAVIGATION_INIT;

var STORAGE_ITEM = "storageItem";

var pageW, pageH;

var lightGreen = '#90ee90';
var lightGreenTransparent = '#90ee9099';
var red = '#a8071e';

var usersToShare = [];

function tryHideLogoutButton() {
    if (!isUserAuthenticated)
        hideByClass('logoutButton');
}

function initPageDims() {
    pageW = $('#renderbody').width();
    pageH = $('#renderbody').height();
}

/* ################################################################################ */
/* MANAGE BUTTONS WHEN NAVIGATING BETWEEN SEARCH/CHART PANELS */
/* ################################################################################ */
function manageNavigation() {
    let containerFunction = null;

    switch (navigationStatus) {
        case NAVIGATION_BACK_CLEAR_CHART:
            initChartSeries();
            initSpectraInfo();
            initFitArrays();
            setCloudTextAndIconStatus(SPECTRUM_TYPE_CONTINUUM_REMOVED, false); // reset cloud icon/text in 'fit options' panel

            setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_ALIGNMENT);

            closeCharmsLegend();
            removeBackToSearchButtonProcedure();
            removeBackClearToSearchButtonProcedure();
            removeOpenProcessSpectraCharmsButtonProcedure();
            removeCharmsLegendButtonProcedure();
            removeMessagesCharmsButtonProcedure();
            removeCharmsColorSelectorButtonProcedure();
            containerFunction = function () {
                addSearchButton();
                addCreateChartsButtonProcedure();
            };
            executeAfter(containerFunction, 500);
            break;

        case NAVIGATION_SHOW_CHART:
        case NAVIGATION_CREATE_CHART:
            addCharmsLegendButton();
            addBackClearToSearchButton();
            addOpenProcessSpectraCharmsButton();
            addEnterFullScreenButton();
            break;

        default: // NAVIGATION_INIT

            break;
    }
}

/* ################################################################################ */
/* SHOW/HIDE WARNING IN DIALOG MESSAGE */
/* ################################################################################ */
async function showAndAnimateElementAsync(id, animation, speed) {
    showByClass(id);
    await animateCSS(id, animation, speed)
}

/* ################################################################################ */
/* GET/SET SETTINGS */
/* ################################################################################ */
async function getUserSettingAsync(key) {
    let model = {
        Key: key
    };

    let obj = await doAjaxGetAsync(UrlGetUserSetting, model);
    if (obj.IsOk) {
        return obj;
    } else {
        return null;
    }
}

async function saveUserSettingAsync(data) {
    let obj = await doAjaxPostAsync(data.url, data.model);
    if (obj) {
        //console.log(`${data.url}, IsOk: ${obj.IsOk}`);
        return true;
    } else {
        //console.log(`Error`);
        return false;
    }
}

/* ################################################################################ */
/* SET BUTTONS STATUS */
/* ################################################################################ */
function setButtonAlignEnabled(id, isEnabled, label) {
    setMetroUIButtonEnabled(id, isEnabled);
    $(`#${id}`).prop('title', label);
}

/* ################################################################################ */
/* ADD/REMOVE BUTTONS */
/* ################################################################################ */
/* ---------- OPEN MESSAGES BUTTON ---------- */
function addOpenMessagesCharmsButton() {
    addButton(openMessagesCharmsButtonId, ButtonShowCharmsMessagesLabel, 'mif-chat', toggleCharmsMessages);
}

function removeMessagesCharmsButtonProcedure() {
    if (!isButtonAvailable(openMessagesCharmsButtonId))
        return;

    animateCSS(`${openMessagesCharmsButtonId}`, `bounceOutUp`, FAST, removeMessagesCharmsButton);
}

function removeMessagesCharmsButton() {
    $(`#${openMessagesCharmsButtonId}`).remove();
}

/* ---------- SET PUBLIC BUTTON ---------- */
function addSetPublicButton() {
    addButton(setPublicButtonId, ButtonSetPublicLabel, 'mif-vpn-publ mif-2x', setAsPublicProcedure);
}

function removeSetPublicButtonProcedure() {
    if (!isButtonAvailable(setPublicButtonId))
        return;

    animateCSS(`${setPublicButtonId}`, `bounceOutUp`, FAST, removeSetPublicButton);
}

function removeSetPublicButton() {
    $(`#${setPublicButtonId}`).remove();
}

/* ---------- SHARE BUTTON ---------- */
function addShareButton() {
    addButton(shareButtonId, ButtonShareLabel, 'mif-share', openCharmsShare);
}

function removeShareButtonProcedure() {
    if (!isButtonAvailable(shareButtonId))
        return;

    animateCSS(`${shareButtonId}`, `bounceOutUp`, FAST, removeShareButton);
}

function removeShareButton() {
    $(`#${shareButtonId}`).remove();
}

/* ################################################################################ */
/* CHARMS SHARE */
/* ################################################################################ */
function closeCharmsShare() {
    if (Metro.charms.isOpen('#charmsShare'))
        Metro.charms.close('#charmsShare');
}

function openCharmsShare() {
    if (!Metro.charms.isOpen('#charmsShare'))
        Metro.charms.open('#charmsShare');
}

function onCharmsShareOpen() {
    NumOfSharedSpectra = NumOfSharedSpectra.replace('r_v', selectedSpectra.length);
    $('#numOfSharedSpectraLabel').text(NumOfSharedSpectra);
}

/* ################################################################################ */
/* SHARE SPECTRA */
/* ################################################################################ */
function addUserToShare(id, email) {
    if (email) {
        let html = `<li id="user${id}" class="d-flex charms-share-listview-item">`;
        html += `<div class="margin-right-16 pointer" onclick="removeUserToShare('${id}')"><span class="mif-bin pointer"></span></div>`;
        html += `<div><span class="charms-share-listview-caption">${email}</span></div>`;
        html += `</li>`;

        $("#selectedUsersToShareList").append(html);

        /* empty the input field for writing user email */
        $('#newUserToShare').val('');

        removeClass('selectedUsersToShareListLabel', 'd-none');
    }
}

function checkShareButtonCanBeEnabled() {
    if (usersToShare.length > 0)
        setMetroUIButtonEnabled('buttonShareSpectra', true);
    else
        setMetroUIButtonEnabled('buttonShareSpectra', false);
}

async function checkUserAsync() {
    try {
        /* remove message, if existant */
        $('#newUserToShareActivity').empty();

        setCharmsShareLoadingCircle(true);

        let userEmail = $('#newUserToShare').val();

        if (!userEmail) {
            setCharmsShareLoadingCircle(false);
            return;
        }

        let model = {
            Text: userEmail
        };

        let isUserExistant = false;
        let obj = await doAjaxGetAsync(UrlCheckUser, model);
        let userToShareId = 0;
        if (obj.IsOk) {
            isUserExistant = true;
            userToShareId = parseInt(obj.ResponseObject);
        } else {
            userToShareId = await generateHash(userEmail);
        }

        if (usersToShare.findIndex(x => x.Id == userToShareId) > -1) {
            setCharmsShareLoadingCircle(false);
            return;
        }

        let item = {
            Id: userToShareId,
            Email: userEmail
        };

        usersToShare.push(item);
        addUserToShare(userToShareId, userEmail);

        checkShareButtonCanBeEnabled();

        setCharmsShareLoadingCircle(false);

        if (!isUserExistant)
            setMessage(CharmsShareUserNotExistantMessage, ICON_WARNING_NAME, COLOR_WARNING_CLASS);
    } catch (e) {
        setCharmsShareLoadingCircle(false);
    }
}

async function generateHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function removeUserToShare(id) {
    let index = usersToShare.findIndex(x => x.Id == id);
    if (index > -1) {
        /* remove from in-memory array */
        usersToShare.splice(index, 1);
        /* remove from listview */
        $(`#user${id}`).remove();

        checkShareButtonCanBeEnabled();

        if (usersToShare.length == 0)
            addClass('selectedUsersToShareListLabel', 'd-none');
    }
}

function setCharmsShareLoadingCircle(isvisible) {
    if (isvisible) {
        let html = `<div data-role="activity" data-type="ring" data-style="light"></div>`;
        html += `<div class="margin-left-8 margin-top-16"><span>${CharmsShareCheckUserMessage}</span></div>`;
        $('#newUserToShareActivity').html(html);
    } else
        $('#newUserToShareActivity').empty();
}

function setMessage(message, messageIcon, messageClass) {
    let html = `<div class="margin-top-8 d-flex">`;
    html += `<div><span class="${messageIcon} mif-2x ${messageClass}"></span></div>`;
    html += `<div class="${messageClass} margin-left-16 text-leader2">${message}</div>`;
    html += `</div>`;
    $('#newUserToShareActivity').html(html);

    setTimeout(function () { $('#newUserToShareActivity').empty(); }, 5000);
}

async function shareSpectraAsync() {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let shareResults;

    try {
        let users = usersToShare.map(user => {
            return {
                Id: user.Id.toString(),
                Email: user.Email
            };
        });
        let model = {
            SpectraIds: selectedSpectra,
            UsersToShare: users
        };

        shareResults = await doAjaxPostAsync(UrlAddSharesBetweenOwnerUserAndUsers, model);
        isOk = shareResults.IsOk;
        setLoadingCircleIsVisible(false);
    } catch (e) {
        isOk = false;
        setLoadingCircleIsVisible(false);
    }

    if (isOk)
        setMessage(CharmsShareSpectraSharedInfoMessage, ICON_INFO_NAME, COLOR_INFO_CLASS);
    else {
        /* when an error in creation of shares or in invitations happned, show the specific message */
        if (showAddSharesErrors(shareResults) > 0)
            return;
        /* when an error on the back-end happened, show the generic message */
        setMessage(CharmsShareSpectraSharedErrorMessage, ICON_ERROR_NAME, COLOR_ERROR_CLASS);
    }
}

function showAddSharesErrors(shareResults) {
    let errorsNum = 0;

    if (shareResults == null)
        return errorsNum;
    if (shareResults.ResponseObject.length == 0)
        return errorsNum;

    let html = `<div class='row cell-fs-12 margin-16'>`;
    let shareResultsNum = shareResults.ResponseObject.length;
    for (var i = 0; i < shareResultsNum; i++) {
        if (!shareResults.ResponseObject[i].IsShareOperationCompleted) {
            errorsNum += 1;
            html += `<div class='row cell-fs-12'><p class='text-leader2'>${CharmsShareShareNotCreatedForUserErrorMessage.replace('r_v', shareResults.ResponseObject[i].Email)}</p></div>`;
        }

        if (shareResults.ResponseObject[i].IsErrorInInvitation) {
            errorsNum += 1;
            html += `<div class='row cell-fs-12'><p class='text-leader2'>${CharmsShareInvitationNotCreatedErrorMessage.replace('r_v', shareResults.ResponseObject[i].Email)}</p></div>`;
        }
    }
    html += `</div>`;

    let options = {
        callback: Metro.noop,
        timeout: 5000,
        showTop: true,
        clsToast: "alert"
    };
    Metro.toast.create(html, null, null, null, options);

    return errorsNum;
}

/* ################################################################################ */
/* SET SPECTRA AS PUBLIC */
/* ################################################################################ */
function setAsPublicProcedure() {
    showDialogWithAction(WARNING_LABEL, SetAsPublicQuestion, WARNING, YES_LABEL, setAsPublicAsync);
}

async function setAsPublicAsync() {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let model = {
        SpectraIds: selectedSpectra
    };

    try {
        let obj = await doAjaxPostAsync(UrlSetSpectraAsPublic, model);
        if (obj.IsOk) {
            setLoadingCircleIsVisible(false);
            showSimpleDialog(INFO_LABEL, SetAsPublicSuccessMessage, SUCCESS);
        } else
            isOk = false;
    } catch (e) {
        isOk = false;
    }

    if (!isOk) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SetAsPublicErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* DOWNLOAD PROCEDURE */
/* ################################################################################ */
async function downloadSpectrumAsCsvAsync(id) {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let model = {
        Id: id
    };

    try {
        let obj = await doAjaxGetAsync(UrlGetSpectrumAsCsv, model);
        if (obj.IsOk) {
            setLoadingCircleIsVisible(false);
            executeDownloadFile(obj.ResponseObject.Csv, `${obj.ResponseObject.Filename}_${getSpectrumTypeString(obj.ResponseObject.TypeId)}.csv`)
        } else
            isOk = false;
    } catch (e) {
        isOk = false;
    }

    if (!isOk) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DownloadSpectrumErrorMessage, ALERT);
    }
}

async function downloadSpectrumAsXmlAsync(id) {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let model = {
        Id: id
    };

    try {
        let obj = await doAjaxGetAsync(UrlGetSpectrumAsXml, model);
        if (obj.IsOk) {
            setLoadingCircleIsVisible(false);
            executeDownloadFile(obj.ResponseObject.Xml, `${obj.ResponseObject.Filename}_${getSpectrumTypeString(obj.ResponseObject.TypeId)}.xml`)
        } else
            isOk = false;
    } catch (e) {
        isOk = false;
    }

    if (!isOk) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, DownloadSpectrumErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* MANAGE OVERFLOW-Y */
/* ################################################################################ */
function setOverflowYAuto(isRequired = false) {
    if (isMobile() || isRequired)
        $('#search').removeClass('overflow-y-hidden').addClass('overflow-y-auto');
}

function setOverflowYHidden() {
    if (!isMobile())
        $('#search').removeClass('overflow-y-auto').addClass('overflow-y-hidden');
}

/* ################################################################################ */
/* OTHER */
/* ################################################################################ */
function buildId(id) {
    if (isNumber(id))
        return `id${id}`;
    else
        return id;
}

function createSeriesFromSpectrumName(idItem, spectrumName, color, isPointVisible = false, showInLegend = true) {
    return {
        type: 'line',
        valueField: idItem,
        name: spectrumName,
        axis: 'valueAxis',
        color: color,
        point: { visible: isPointVisible },
        showInLegend: showInLegend
    };
}

function createSeriesNameFromSpectrumNameAndType(name, spectrumType) {
    return `${name} (${getSpectrumTypeDescription(spectrumType)})`;
}

function getIdValue(idItem) {
    let idValue = idItem
        .replace(SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_CONTINUUM_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_SMOOTHED_BY_SEGMENTS_TEMP_ID, '')
        .replace(SPECTRUM_OF_TYPE_SMOOTHED_WHOLE_SPECTRUM_TEMP_ID, '')
        .replace('id', '');
    return parseInt(idValue);
}

function invertYValuesBottomToTop(yValues) {
    let selectedRangeYMax = Math.max(...yValues);

    let invertedYValues = [];
    let yValuesNum = yValues.length;
    for (var i = 0; i < yValuesNum; i++) {
        invertedYValues[i] = selectedRangeYMax + Math.abs(selectedRangeYMax - yValues[i]);
        //console.log(invertedYValues[i]);
    }

    return invertedYValues;
}

function invertYValuesTopToBottom(yValues) {
    let selectedRangeYMin = Math.min(...yValues);

    let invertedYValues = [];
    let yValuesNum = yValues.length;
    for (var i = 0; i < yValuesNum; i++) {
        invertedYValues[i] = selectedRangeYMin - Math.abs(selectedRangeYMin - yValues[i]);
        //console.log(invertedYValues[i]);
    }

    return invertedYValues;
}

function isSeriesAlreadyPresent(name) {
    let series = dxChartGetAllSeries(chartContainer);

    let index = series.findIndex(x => x.name == name);

    return (index > -1);
}

function updateSegmentYRange(sourceYValues, destYRangeValues) {
    /* extract min-max for yvalues in range */
    let sourceYValuesMin = Math.min(...sourceYValues);
    let sourceYValuesMax = Math.max(...sourceYValues);
    //console.log(`rangeYValuesMin: ${rangeYValuesMin}, rangeYValuesMax: ${rangeYValuesMax}`);

    let destYValuesMin = Math.min(...destYRangeValues);
    let destYValuesMax = Math.max(...destYRangeValues);

    /* create a new y-array with fitvalues mapped to original y-values-interval */
    let fitYValues = [];
    let sourceYValuesRange = (sourceYValuesMax - sourceYValuesMin);
    let destYValuesRange = (destYValuesMax - destYValuesMin);
    let destYRangeValuesNum = destYRangeValues.length;
    for (var i = 0; i < destYRangeValuesNum; i++) {
        fitYValues[i] = ((destYRangeValues[i] - destYValuesMin) / destYValuesRange) * sourceYValuesRange + sourceYValuesMin;
    }

    return fitYValues;
}

/* ################################################################################ */
/* BUBBLES */
/* ################################################################################ */
function showBubble(id) {
    let callbackShow = function () {
        let callbackHide = function () {
            hide(id);
        };
        setTimeout(function () { animateCSS(id, 'fadeOut', FAST, callbackHide) }, 2000);
    };

    show(id);
    animateCSS(id, 'fadeIn', FAST, callbackShow);
}