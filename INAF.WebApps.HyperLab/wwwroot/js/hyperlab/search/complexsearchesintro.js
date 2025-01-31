/* ################################################################################ */
/* SHOW/HIDE SAVED COMPLEX SEARCHES INTRO */
/* ################################################################################ */
function checkComplexSearchesIntroIsRequired() {
    if ($(complexSearchConditionsContainer).children().length == 0) {
        /* remove UI item for saving search */
        removeSaveSearchElement();
        /* show saved searches list */
        showComplexSearchesIntroProcedure();
    }
}

/* -------------------------------------------------------------------------------- */
/* HIDE PROCEDURE */
/* -------------------------------------------------------------------------------- */
function hideComplexSearchesIntroProcedure(extcallback) {
    if (!areSavedComplexSearchesAvailable)
        hideComplexSearchesInfo(extcallback);
    else
        hideComplexSearchesList(extcallback);
}

/* -------------------------------------------------------------------------------- */
/* SHOW PROCEDURE */
/* -------------------------------------------------------------------------------- */
function showComplexSearchesIntroProcedure(isReload = false) {
    if (!areSavedComplexSearchesAvailable)
        showComplexSearchesInfo();
    else
        showComplexSearchesList(isReload);
}

/* -------------------------------------------------------------------------------- */
/* INFO */
/* -------------------------------------------------------------------------------- */
function hideComplexSearchesInfo(extcallback) {
    let id = 'retrievedComplexSearchesInfo';
    let callback = function () {
        hideByClass(id);

        if (extcallback)
            extcallback();
    };

    animateCSS(id, 'backOutRight', FAST, callback);
}

function showComplexSearchesInfo() {
    let id = 'retrievedComplexSearchesInfo';

    showByClass(id);
    animateCSS(id, 'backInUp', FAST);
}

/* -------------------------------------------------------------------------------- */
/* LIST */
/* -------------------------------------------------------------------------------- */
function hideComplexSearchesList(extcallback) {
    let id = 'retrievedComplexSearchesListContainer';
    let callback = function () {
        hideByClass('retrievedComplexSearchesListTitle');
        hideByClass(id);

        if (extcallback)
            extcallback();
    };

    animateCSS(id, 'backOutRight', FAST, callback);
}

function showComplexSearchesList(isReload) {
    let id = 'retrievedComplexSearchesListContainer';

    if (!isReload) {
        showByClass(id);
        showByClass('retrievedComplexSearchesListTitle');
        animateCSS(id, 'backInUp', FAST);
    }
}

