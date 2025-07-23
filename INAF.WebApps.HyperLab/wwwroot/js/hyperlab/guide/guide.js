/* -------------------------------------------------------------------------------- */
/* ---------- OPNE GUIDE ---------- */
/* -------------------------------------------------------------------------------- */
function showGuideChart() {
    showByClassDFlexItem('guideContainer');
    animateCSS('guideContainer', 'fadeIn', 'FASTER', onShowGuideChartCompleted);
}

function onShowGuideChartCompleted() {
    let callbackdone = function () {
        $('#body').removeClass('overflow-y-auto').addClass('overflow-y-hidden');
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
    $('#body').removeClass('overflow-y-hidden').addClass('overflow-y-auto');
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