/* -------------------------------------------------------------------------------- */
/* ---------- OPNE GUIDE ---------- */
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
/* ---------- DATA ANALYSIS GUIDE ---------- */
/* -------------------------------------------------------------------------------- */
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