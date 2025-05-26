/* ---------- BACK-CLEAR-TO-SEARCH BUTTON ---------- */
function addBackClearToSearchButton() {
    addButton(backClearToSearchButtonId, ButtonBackClearToSearchLabel, 'mif-cross-light', backClearToSearchProcedureAsync);
}

function removeBackClearToSearchButtonProcedure() {
    if (!isButtonAvailable(backClearToSearchButtonId))
        return;

    animateCSS(`${backClearToSearchButtonId}`, `bounceOutUp`, FAST, removeBackClearToSearchButton);
}

function removeBackClearToSearchButton() {
    $(`#${backClearToSearchButtonId}`).remove();
}

/* ---------- OPEN MESSAGES BUTTON ---------- */
function addOpenMessagesCharmsButton() {
    addButton(openMessagesCharmsButtonId, ButtonShowCharmsMessagesLabel, 'mif-chat', toggleCharmsMessages);
}

function removeMessagesCharmsButtonProcedure() {
    if (!isButtonAvailable(openMessagesCharmsButtonId))
        return;

    animateCSS(`${openMessagesCharmsButtonId}`, `bounceOutUp`, FAST, removeMessagesCharmsButton);
}

function removeMessagesCharmsButton() {
    $(`#${openMessagesCharmsButtonId}`).remove();
}

/* ---------- OPEN PROCESS SPECTRA CHARMS BUTTON ---------- */
function addOpenProcessSpectraCharmsButton() {
    addButton(openProcessSpectraCharmsButtonId, ButtonOpenCharmsLabel, 'mif-magic-wand', openCharms);
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