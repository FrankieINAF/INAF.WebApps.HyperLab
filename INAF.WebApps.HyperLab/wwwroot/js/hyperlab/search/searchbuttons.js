/* ---------- INIT BUTTONS IN SEARCH PANEL ---------- */
function initButtonsInSearchPanel() {
    //removeBackToSearchButton();
    addSearchButton();
    addHelpButton();
}

/* ---------- GO-TO-CHARTS BUTTON ---------- */
function addGoToChartsButton() {
    isChartLoadRequired = false;
    addButton(goToChartsButtonId, ButtonBackToSearchLabel, 'mif-arrow-right', showChartsProcedure);
}

function removeGoToChartsButtonProcedure() {
    if (!isButtonAvailable(goToChartsButtonId))
        return;

    animateCSS(`${goToChartsButtonId}`, `bounceOutUp`, FAST, removeGoToChartsButton);
}

function removeGoToChartsButton() {
    $(`#${goToChartsButtonId}`).remove();
}

/* ---------- SHOW-CHARTS BUTTON ---------- */
function addCreateChartsButton() {
    addButton(showChartsButtonId, ButtonGraphSelectedSpectraLabel, 'mif-chart-line', navigateToChart);
}

//function removeCreateChartsButtonProcedure() {
//    if (!isButtonAvailable(showChartsButtonId))
//        return;

//    /* show the 'create chart' button */
//    animateCSS(`${showChartsButtonId}`, `bounceOutUp`, FAST, removeCreateChartsButton);
//}

function removeCreateChartsButton() {
    $(`#${showChartsButtonId}`).remove();
}
