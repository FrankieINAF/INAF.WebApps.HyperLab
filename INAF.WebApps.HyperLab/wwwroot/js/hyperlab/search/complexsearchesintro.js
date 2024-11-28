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
    let id;
    if (!areSavedComplexSearchesAvailable)
        hideComplexSearchesInfo(extcallback);
    else
        hideComplexSearchesList(extcallback);
}

/* -------------------------------------------------------------------------------- */
/* SHOW PROCEDURE */
/* -------------------------------------------------------------------------------- */
function showComplexSearchesIntroProcedure() {
    if (!areSavedComplexSearchesAvailable)
        showComplexSearchesInfo();
    else
        showComplexSearchesList();
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

function showComplexSearchesList() {
    let id = 'retrievedComplexSearchesListContainer';

    showByClass(id);
    showByClass('retrievedComplexSearchesListTitle');
    animateCSS(id, 'backInUp', FAST);
}

