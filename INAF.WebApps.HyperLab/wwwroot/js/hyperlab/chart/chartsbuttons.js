/* ---------- BACK-TO-SEARCH BUTTON ---------- */
function addBackToSearchButton() {
    addButton(backToSearchButtonId, ButtonBackToSearchLabel, 'mif-arrow-left', backToSearchProcedure);
}

function removeBackToSearchButtonProcedure() {
    if (!isButtonAvailable(backToSearchButtonId))
        return;

    animateCSS(`${backToSearchButtonId}`, `bounceOutUp`, FAST, removeBackToSearchButton);
}

function removeBackToSearchButton() {
    $(`#${backToSearchButtonId}`).remove();
}

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

/* ---------- CHARMS BUTTON ---------- */
function addOpenCharmsButton() {
    addButton(openCharmsButtonId, ButtonOpenCharmsLabel, 'mif-magic-wand', openCharms);
}

function removeOpenCharmsButtonProcedure() {
    if (!isButtonAvailable(openCharmsButtonId))
        return;

    animateCSS(`${openCharmsButtonId}`, `bounceOutUp`, FAST, removeOpenCharmsButton);
}

function removeOpenCharmsButton() {
    $(`#${openCharmsButtonId}`).remove();
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