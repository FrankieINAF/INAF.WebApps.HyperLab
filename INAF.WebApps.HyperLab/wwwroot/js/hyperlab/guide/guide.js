/* -------------------------------------------------------------------------------- */
/* ---------- OPNE GUIDE ---------- */
/* -------------------------------------------------------------------------------- */
function showGuideChart() {
    showByClassDFlexItem('guideContainer');
    animateCSS('guideContainer', 'fadeIn', 'FASTER', onShowGuideChartCompleted);
}

function onShowGuideChartCompleted() {
    let callbackdone = function () {
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
    $('#guide').empty();
    hideByClassDFlexItem('guideContainer');
}

/* -------------------------------------------------------------------------------- */
/* ---------- DATA ANALYSIS GUIDE ---------- */
/* -------------------------------------------------------------------------------- */
function showGuideMagicWand() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartMagicWand, 'guide');
}

function showAlignmentPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsAlignmentPanel, 'guide');
}

function showContinuumRemovalPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsContinuumRemovalPanel, 'guide');
}

function showSmoothingPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsSmoothingPanel, 'guide');
}

function showBandAnalysisPanel() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideSpectraHubChartPanelsBandAnalysisPanel, 'guide');
}