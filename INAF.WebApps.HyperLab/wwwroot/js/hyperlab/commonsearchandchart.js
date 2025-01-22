
var showCharmsColorSelectorId = 'buttonShowCharmsColorSelector';
var showCharmsLegendButtonId = 'buttonShowCharmsLegend';
var goToChartsButtonId = 'buttonGoToCharts';
var helpButtonId = 'buttonHelp';

var searchButtonId = 'buttonSearch';
var shareButtonId = 'buttonShare';
var showChartsButtonId = 'buttonShowCharts';
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

var pageW, pageH;

var lightGreen = '#90ee90';
var lightGreenTransparent = '#90ee9099';
var red = '#a8071e';

var usersToShare = [];

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
        //case NAVIGATION_BACK_TO_SEARCH:
        //    closeCharmsLegend();
        //    removeBackToSearchButtonProcedure();
        //    removeBackClearToSearchButtonProcedure();
        //    removeOpenCharmsButtonProcedure();
        //    removeCharmsLegendButtonProcedure();
        //    removeCharmsColorSelectorButtonProcedure();
        //    containerFunction = function () {
        //        addSearchButton();
        //        addCreateChartsButton();
        //        addGoToChartsButton();
        //    };
        //    executeAfter(containerFunction, 500);
        //    break;

        case NAVIGATION_BACK_CLEAR_CHART:
            initChartSeries();
            initSpectraInfo();
            initFitArrays();
            setCloudTextAndIconStatus(SPECTRUM_TYPE_CONTINUUM_REMOVED, false); // reset cloud icon/text in 'fit options' panel

            setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_ALIGNMENT);

            closeCharmsLegend();
            removeBackToSearchButtonProcedure();
            removeBackClearToSearchButtonProcedure();
            removeOpenCharmsButtonProcedure();
            removeCharmsLegendButtonProcedure();
            removeCharmsColorSelectorButtonProcedure();
            containerFunction = function () {
                addSearchButton();
                addCreateChartsButton();
            };
            executeAfter(containerFunction, 500);
            break;

        case NAVIGATION_SHOW_CHART:
        case NAVIGATION_CREATE_CHART:
            //removeSearchButtonProcedure();
            //removeCreateChartsButtonProcedure();
            addCharmsLegendButton();
            addCharmsColorSelectorButton();
            setNavigationButtonsForChartsPanel();
            break;

        default: // NAVIGATION_INIT

            break;
    }
}

/* ---------- SET NAVIGATION BUTTONS FOR CHARTS PANEL SEARCH PANEL ---------- */
function setNavigationButtonsForChartsPanel() {
    /* add button for back-to-search */
    let containerFunction = function () {
        //addBackToSearchButton();
        addBackClearToSearchButton();
        addOpenCharmsButton();
    };
    executeAfter(containerFunction, 500);
}

/* ################################################################################ */
/* SAVE USER SETTINGS */
/* ################################################################################ */
/* items for creating a queue for saving user settings */
//var aQueue;
//var saveUserSettingPromise = ({ ...data } = {}) => () => new Promise(async resolve => {
//    await saveUserSettingAsync(data);
//    resolve();
//});

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
function isButtonAvailable(buttonId) {
    var item = $('#buttonsAppBar').find(`#${buttonId}`);
    if (item[0])
        return true;
    else
        return false
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
function setCharmsShareLoadingCircle(isvisible) {
    if (isvisible) {
        let html = '<div data-role="activity" data-type="ring" data-style="light"></div>';
        html += `<div class="margin-left-8 margin-top-16"><span>${CharmsShareCheckUserMessage}</span></div>`;
        $('#newUserToShareActivity').html(html);
    } else
        $('#newUserToShareActivity').empty();
}

function addUserToShare(email) {
    if (email) {
        let item = {
            caption: email,
            icon: `<span class="mif-cross fg-light"></span>`
        };
        Metro.getPlugin("#selectedUsersToShareList", 'listview').add(null, item);
        $('#newUserToShare').val('');

        var icons = $('#selectedUsersToShareList').find('.icon');
        if (icons && icons.length > 0) {
            let iconsNum = icons.length;
            for (var i = 0; i < iconsNum; i++) {
                let icon = icons[i];
                //$(caption).addClass('charms-share-listview-caption');
                $(icon).on('click', function () {
                    console.log($($(this.parentElement).find('.data')[0]).children('.caption').text());
                });
            }
        }

        var captions = $('#selectedUsersToShareList').find('.caption');
        if (captions && captions.length > 0) {
            let captionsNum = captions.length;
            for (var i = 0; i < captionsNum; i++) {
                let caption = captions[i];
                $(caption).addClass('charms-share-listview-caption');
            }
        }

        var nodes = $('#selectedUsersToShareList').find('.node');
        if (nodes && nodes.length > 0) {
            let nodesNum = nodes.length;
            for (var i = 0; i < nodesNum; i++) {
                let node = nodes[i];
                $(node).addClass('charms-share-listview-node');
            }
        }
    }
}

async function checkUser() {
    try {
        setCharmsShareLoadingCircle(true);

        let userEmail = $('#newUserToShare').val();

        let model = {
            Text: userEmail
        };

        let obj = await doAjaxGetAsync(UrlCheckUser, model);
        if (obj.IsOk) {
            let userToShareId = parseInt(obj.ResponseObject);

            if (usersToShare.indexOf(userToShareId)) {
                setCharmsShareLoadingCircle(false);
                return;
            }

            let item = {
                id: userToShareId,
                email: userEmail
            };

            usersToShare.push(item);
            addUserToShare(userEmail);
            setCharmsShareLoadingCircle(false);
        } else {
            setCharmsShareLoadingCircle(false);
            showSimpleDialog(ERROR_LABEL, CharmsShareUserNotExistantMessage, ALERT)
        }
    } catch (e) {
        setCharmsShareLoadingCircle(false);
    }
}

function removeUserToShare(element) {

}

function shareSpectra() {

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
    if (Number.isInteger(id))
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
    let destYRangeValuesNum = destYRangeValues.length;
    for (var i = 0; i < destYRangeValuesNum; i++) {
        fitYValues[i] = ((destYRangeValues[i] - destYValuesMin) / (destYValuesMax - destYValuesMin)) * (sourceYValuesMax - sourceYValuesMin) + sourceYValuesMin;
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