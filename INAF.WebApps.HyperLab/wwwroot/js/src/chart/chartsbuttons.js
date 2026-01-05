/* ---------- ENLARGE (RESET VISUAL RANGE) BUTTON ---------- */
function addEnlargeButton() {
    addButton(enlargeButtonId, ButtonEnlargeLabel, 'mif-enlarge2', enlargeVisualRange);
}

function removeEnlargeButtonProcedure() {
    if (!isButtonAvailable(enlargeButtonId))
        return;

    animateCSS(`${enlargeButtonId}`, `bounceOutUp`, FAST, removeEnlargeButton);
}

function removeEnlargeButton() {
    $(`#${enlargeButtonId}`).remove();
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