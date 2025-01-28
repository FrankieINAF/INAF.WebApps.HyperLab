var selectedSpectra = [];

function navigateToChart() {
    var ids = selectedSpectra.join(',');
    var url = `${UrlChart}?Ids=${ids}`;
    navigateTo(url);
}

/* ---------- CHARTS BUTTON ---------- */
function addCreateChartsButton() {
    addButton(showChartsButtonId, ButtonGraphSelectedSpectraLabel, 'mif-chart-line', navigateToChart);
}

function removeCreateChartsButtonProcedure() {
    if (!isButtonAvailable(showChartsButtonId))
        return;

    /* show the 'create chart' button */
    animateCSS(`${showChartsButtonId}`, `bounceOutUp`, FAST, removeCreateChartsButton);
}

function removeCreateChartsButton() {
    $(`#${showChartsButtonId}`).remove();
}

