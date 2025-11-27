/* ---------- BACK-TO-HOME BUTTON ---------- */
function addBackToHomeButton() {
    addMenuItem(backToHomeButtonId, ButtonBackToHomeLabel, ButtonBackToHomeTooltip, 'mif-home', backToHomeProcedure);
}

function removeBackToHomeButtonProcedure() {
    if (!isButtonAvailable(backToHomeButtonId))
        return;
    animateCSS(`${backToHomeButtonId}`, `bounceOutLeft`, FAST, removeBackToHomeButton);
}

function removeBackToHomeButton() {
    $(`#${backToHomeButtonId}`).remove();
}

/* ---------- BACK-TO-SEARCH BUTTON ---------- */
function addBackToSearchButton() {
    addMenuItem(backToSearchButtonId, ButtonBackToSearchLabel, ButtonBackToSearchTooltip, 'mif-search', backToSearchProcedure);
}

function removeBackToSearchButtonProcedure() {
    if (!isButtonAvailable(backToSearchButtonId))
        return;

    animateCSS(`${backToSearchButtonId}`, `bounceOutLeft`, FAST, removeBackToSearchButton);
}

function removeBackToSearchButton() {
    $(`#${backToSearchButtonId}`).remove();
}

/* ---------- OPEN PROCESS SPECTRA CHARMS BUTTON ---------- */
function addOpenProcessSpectraCharmsButton() {
    addButton(openProcessSpectraCharmsButtonId, ButtonOpenCharmsLabel, 'mif-magic-wand', openCharmsProcessSpectra);
}

function removeOpenProcessSpectraCharmsButtonProcedure() {
    if (!isButtonAvailable(openProcessSpectraCharmsButtonId))
        return;

    animateCSS(`${openProcessSpectraCharmsButtonId}`, `bounceOutUp`, FAST, removeOpenProcessSpectraCharmsButton);
}

function removeOpenProcessSpectraCharmsButton() {
    $(`#${openProcessSpectraCharmsButtonId}`).remove();
}

/* ---------- ZOOM-OUT BUTTON ---------- */
function addZoomOutButton() {
    addButton(zoomOutButtonId, ButtonZoomOutLabel, 'mif-zoom-out', resetZoom);
}

function removeZoomButtonProcedure() {
    if (!isButtonAvailable(zoomOutButtonId))
        return;

    animateCSS(`${zoomOutButtonId}`, `bounceOutUp`, FAST, removeZoomButton);
}

function removeZoomButton() {
    $(`#${zoomOutButtonId}`).remove();
}