function closeGuide() {

}

function showGuideChart() {
    showByClassDFlexItem('guideContainer');
    animateCSS('guideContainer', 'fadeIn', 'FAST', onShowGuideCompleted);
}

function onShowGuideCompleted() {
    loadPartialViewWithAjaxGetNoModel(UrlGuideGeneralInfo, 'guideSection');
}