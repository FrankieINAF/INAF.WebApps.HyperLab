/* -------------------------------------------------------------------------------- */
/* ---------- SHOW GUIDE FOR HUB PAGE ---------- */
/* -------------------------------------------------------------------------------- */
function showGuideHub() {
    showByClassDFlexItem('guideContainer');
    animateCSS('guideContainer', 'fadeIn', 'FASTER', onShowGuideHubCompleted);
}

function onShowGuideHubCompleted() {
    let callbackdone = function () {
        $('#body').removeClass('overflow-y-hidden').addClass('overflow-y-auto');
        $('html').removeClass('overflow-y-hidden').addClass('overflow-y-auto hide-scrollbar');
        loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubMenu, 'guideMenu');
    };
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHub, 'guide', callbackdone);
}

function showGuideComplexSearch() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubComplexSearch, 'guide');
}

function showGuideLoadLocalFiles() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubLoadLocalFiles, 'guide');
}

function showGuideSimpleSearch() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubSimpleSearch, 'guide');
}

function backToGuideHubMainMenu() {
    onShowGuideHubCompleted();
}

/* -------------------------------------------------------------------------------- */
/* ---------- SHOW GUIDE FOR CHART PAGE ---------- */
/* -------------------------------------------------------------------------------- */
function showGuideChart() {
    showByClassDFlexItem('guideContainer');
    animateCSS('guideContainer', 'fadeIn', 'FASTER', onShowGuideChartCompleted);
}

function onShowGuideChartCompleted() {
    let callbackdone = function () {
        $('#body').removeClass('overflow-y-hidden').addClass('overflow-y-auto');
        $('html').removeClass('overflow-y-hidden').addClass('overflow-y-auto hide-scrollbar');
        loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartMenu, 'guideMenu');
    };
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChart, 'guide', callbackdone);
}

/* -------------------------------------------------------------------------------- */
/* ---------- CLOSE GUIDE ---------- */
/* -------------------------------------------------------------------------------- */
function closeGuide() {
    animateCSS('guideContainer', 'fadeOut', 'FASTER', onCloseGuideCompleted);
}

function onCloseGuideCompleted() {
    $('#body').removeClass('overflow-y-auto').addClass('overflow-y-hidden');
    $('html').removeClass('overflow-y-auto hide-scrollbar').addClass('overflow-y-hidden');
    $('#guide').empty();
    hideByClassDFlexItem('guideContainer');
}

/* -------------------------------------------------------------------------------- */
/* ---------- OTHER GUIDEs ---------- */
/* -------------------------------------------------------------------------------- */
function showGuideColorPicker() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartColorPicker, 'guide');
}

function showGuideLegend() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartLegend, 'guide');
}

function showGuideMessages() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartMessages, 'guide');
}

/* -------------------------------------------------------------------------------- */
/* ---------- DATA ANALYSIS GUIDES ---------- */
/* -------------------------------------------------------------------------------- */
function backToGuideChartMainMenu() {
    onShowGuideChartCompleted();
}

function backToGuideMagicWand() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartMagicWand, 'guide');
}

function showGuideMagicWand() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartMagicWand, 'guide');
}

function showGuideAlignmentPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsAlignmentPanel, 'guide');
}

function showGuideContinuumRemovalPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsContinuumRemovalPanel, 'guide');
}

function showGuideSmoothingPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsSmoothingPanel, 'guide');
}

function showGuideBandAnalysisPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsBandAnalysisPanel, 'guide');
}

/* -------------------------------------------------------------------------------- */
/* ---------- SHOW CORE/PRO MODE GIFs ---------- */
/* -------------------------------------------------------------------------------- */
function hideGuideCoreGif() {
    animateCSS('coreModeGif', 'fadeOut', 'FASTER', onHideGuideCoreGifCompleted);
}

function onHideGuideCoreGifCompleted() {
    $('#coreModeGif').empty();

    showByClassDFlexItem('coreModeGifButton');
    animateCSS('coreModeGifButton', 'fadeIn', 'FASTER');
}

function hideGuideProGif() {
    animateCSS('proModeGif', 'fadeOut', 'FASTER', onHideGuideProGifCompleted);
}

function onHideGuideProGifCompleted() {
    $('#proModeGif').empty();
    showByClassDFlexItem('proModeGifButton');
}

function showGuideCoreGif() {
    animateCSS('coreModeGifButton', 'fadeOut', 'FASTER', onShowGuideCoreGifCompleted);
}

function onShowGuideCoreGifCompleted() {
    hideByClassDFlexItem('coreModeGifButton');
    const callback = function () {
        showByClassDFlexItem('coreModeGif');
    };
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsContinuumRemovalPanelCoreModeGif, 'coreModeGif', callback);
}

function showGuideProGif() {
    hideByClassDFlexItem('proModeGifButton');
    const callback = function () {
        showByClassDFlexItem('proModeGif');
    };
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsContinuumRemovalPanelProModeGif, 'proModeGif', callback);
}