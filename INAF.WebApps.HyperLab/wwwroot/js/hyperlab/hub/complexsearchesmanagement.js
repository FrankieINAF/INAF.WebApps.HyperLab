var currentSearchInfoId = 0;

var requestedLevelsComplex = [];


var saveComplexSearchModel = {
    Id: 0,
    Name: '',
    Conditions: [],
    IsAnyChange: false
};

function resetSaveComplexSearchModel() {
    saveComplexSearchModel = {
        Id: 0,
        Name: '',
        Conditions: [],
        IsAnyChange: false
    };
}

function setSaveComplexSearchModelSaved(isSaved) {
    saveComplexSearchModel.IsAnyChange = !isSaved;
}

/* ################################################################################ */
/* DELETE COMPLEX SEARCH */
/* ################################################################################ */
function deleteComplexSearchAndBackToListProcedure(itemId) {
    askAndExecute(SearchComplexQueryConditionsManagement, SavedComplexSearchesDeleteQuestion, deleteComplexSearchAndBackToListAsync, [itemId]);
}

async function deleteComplexSearchAndBackToListAsync(itemId) {
    setLoadingCircleIsVisible(true);

    let model = {
        Id: itemId
    };

    let obj = await doAjaxPostAsync(UrlDeleteComplexSearch, model);
    if (obj && obj.IsOk) {
        setLoadingCircleIsVisible(false);
        backToList(true);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesDeleteErrorMessage, ALERT);
    }
}

/* WITH RELOAD */
function deleteComplexSearchAndReloadProcedure(itemId) {
    askAndExecute(SearchComplexQueryConditionsManagement, SavedComplexSearchesDeleteQuestion, deleteComplexSearchAndReloadAsync, [itemId]);
}

async function deleteComplexSearchAndReloadAsync(itemId) {
    setLoadingCircleIsVisible(true);

    let model = {
        Id: itemId
    };

    let obj = await doAjaxPostAsync(UrlDeleteComplexSearch, model);
    if (obj && obj.IsOk) {
        setLoadingCircleIsVisible(false);
        getSavedComplexSearches(true);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesDeleteErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* SAVE COMPLEX SEARCH */
/* ################################################################################ */
/* -------------------------------------------------------------------------------- */
/* UI ELEMENTS OPERATORS */
/* -------------------------------------------------------------------------------- */
function tryAddComplexSearchTopBar(id = -1, requestedLevels = null) {
    if ($('#complexSearchTopBar').children().length > 0)
        return;

    let html = '';
    html += `<div class="d-flex flex-column">`;

    /* SEARCH TOP BAR */
    html += `<div id="saveSearchGroup" class="d-flex flex-justify-between complex-search-title">`;
    // add button save search
    html += '   <div class="d-flex flex-start">';
    html += `       <button id="buttonBackToList" class=" button primary cycle outline margin-top-8 margin-left-8" title="${ComplexSearchBackToListLabel}" onclick="${backToListProcedure.name}(true)"><span class="mif-arrow-left"></span></button>`;
    html += `       <button class="button primary cycle outline margin-top-8 margin-left-8" title="${SaveComplexSearchLabel}" onclick="${saveSearchAsync.name}()"><span class="mif-floppy-disk"></span></button>`;
    html += `       <button class="button primary cycle outline margin-top-8 margin-left-8" title="${SavedComplexSearchesExecuteLabel}" onclick="${executeComplexSearchAsync.name}()"><span class="mif-checkmark"></span></button>`;
    html += '   </div>';
    // add title
    html += `   <div id='searchTitleInput' class="flex-center flex-row d-none">`;
    html += `       <div class="flex-center flex-column">`;
    html += `           <input data-role="input" class="search-name-width height-40 margin-top-8" data-val="true" data-val-required="The search name field is required." id="SearchName" name="SearchName" onchange="${updateSearchNameErrorStatus.name}()" placeholder="${SaveComplexSearchNamePlaceholder}" type="text" value="" data-role-input="true">`;
    html += `           <div><span id="SearchNameValidation" class='field-validation-valid'>${SearchFieldTextRequiredMessage}</span></div>`;
    html += `       </div>`;
    html += `       <span id='searchSavedCheckmark' class='mif-checkmark fg-green margin-top-20 margin-horizontal-8 d-none'></span>`;
    html += `       <button class="flex-end button dark cycle outline mini margin-top-16 margin-left-8" title="${SearchComplexHideTitle}" onclick="${setEnabledSearchTitle.name}(false)"><span class="mif-cross-light"></span></button>`;
    html += `   </div>`;
    // add search generic title
    html += `   <div id="searchTitleLabel" class="d-flex flex-center flex-row margin-top-16">`;
    html += `       <button class="flex-start button dark cycle mini outline margin-right-8" title="${SearchComplexEditTitle}" onclick="${setEnabledSearchTitle.name}(true)"><span class="mif-pencil"></span></button>`;
    html += `       <label class="flex-end text-bold">${SearchComplexTitle}</label>`;
    html += `   </div>`;
    // add button remove search
    let disabledText = (id > 0) ? '' : 'disabled';
    html += `   <button class="flex-end button primary cycle outline margin-top-8 margin-left-8" ${disabledText} title="${SearchComplexClearLabel}" onclick="${deleteComplexSearchAndBackToListProcedure.name}(${id})"><span class="mif-bin"></span></button>`;
    html += `</div>`;

    /* REQUESTED LEVELS */
    html += '<div class="d-flex flex-column margin-top-8">';
    html += `   <input id="selectLevelAveragedComplex"`;
    html += `          value = "2" `;
    html += `          type="checkbox" `;
    html += `          data-role="checkbox" `;
    html += `          data-caption="${SearchShowAveragedAcquisitionLabel}" `;
    html += `          data-cls-check="bd-cyan" `;
    html += `          data-style="2" >`;
    html += `   <input id="selectLevelSingleAcquisitionComplex" `;
    html += `          value="1" `;
    html += `          type = "checkbox" `;
    html += `          data-role="checkbox" `;
    html += `          data-caption="${SearchShowSingleAcquisitionLabel}" `;
    html += `          data-cls-check="bd-cyan" `;
    html += `          data-style="2" >`;
    html += `</div>`;

    html += `</div>`;

    $(function () {
        /* create Metro plugin for current html element */
        Metro.makePlugin(`#SearchName`, 'input');
        /* animate the ui items container */
        animateCSS(`SearchName`, `bounceIn`, FAST);

        $('#selectLevelAveragedComplex, #selectLevelSingleAcquisitionComplex').on('change', function (evt) {
            var checkbox = $(this);
            var value = parseInt(checkbox.val());

            if (checkbox.is(':checked')) {
                // Add item to the array if checked
                if (!requestedLevelsComplex.includes(value)) {
                    requestedLevelsComplex.push(value);
                }
            } else {
                // Remove item from the array if unchecked
                var index = requestedLevelsComplex.indexOf(value);
                if (index > -1) {
                    requestedLevelsComplex.splice(index, 1);
                }
            }
        });

        if (requestedLevels == null)
            // Programmatically set the checkbox as checked
            executeAfter(function () { $('#selectLevelAveragedComplex').prop('checked', true).trigger('change'); }, 500);
        else {
            requestedLevelsComplex = requestedLevels;
            requestedLevelsComplex.forEach(function (item) {
                $(`#selectLevel${item == 2 ? 'Averaged' : 'SingleAcquisition'}Complex`).prop('checked', true).trigger('change');
            });
        }
    });

    $('#complexSearchTopBar').html(html);
}

function setEnabledSearchTitle(isEnabled) {
    if (isEnabled) {
        $('#searchTitleInput').addClass('d-flex');

        $('#searchTitleLabel').removeClass('d-flex');
        hideByClass('searchTitleLabel');
    } else {
        $('#searchTitleLabel').addClass('d-flex');
        showByClass('searchTitleLabel');

        $('#searchTitleInput').removeClass('d-flex');

        $('#SearchName').val('');
    }
}

function removeSaveSearchElement() {
    $('#saveSearchGroup').remove();
}

function setSearchName(name) {
    $(`#SearchName`).val(name);

    updateSearchNameErrorStatus();

    setEnabledSearchTitle(true);
}

function updateSearchNameErrorStatus() {
    /* retrieve text */
    let text = $(`#SearchName`).val();

    /* update UI */
    if (text.length > 0)
        setInputFieldErrorState(`SearchName`, false);
    else
        setInputFieldErrorState(`SearchName`, true);
}

/* -------------------------------------------------------------------------------- */
/* CLOSE SHOWN COMPLEX SEARCH */
/* -------------------------------------------------------------------------------- */
function backToListProcedure(isReloadRequired) {
    if (saveComplexSearchModel.IsAnyChange)
        confirmAndExecute(SearchComplexManagementLabel, ComplexSearchBackToListUnsavedChangesQuestion, backToList, [isReloadRequired]);
    else
        backToList(isReloadRequired);
}

function backToList(isReloadRequired = false) {
    let callback = function () {
        /* remove search title */
        $('#complexSearchTopBar').empty();
        /* remove conditions */
        $(complexSearchConditionsContainer).empty();

        /* set groups not-in-use anymore */
        let inUseGroups = $('#listviewSearchConditions').find('.group-in-use');
        if (inUseGroups && inUseGroups.length > 0) {
            $(inUseGroups).each(function (index) {
                setGroupButtonInUse(this.id, false);
            });
        }

        /* empty the in-memory list of used groups */
        emptyCurrentlyUsedGroups();

        /* empty complex search conditions array */
        resetSaveComplexSearchModel();

        /* reset the idex used incondition models */
        conditionsIndex = 0;

        /* check whether saved complex-searches-explanation/list is required */
        if (isReloadRequired) {
            showByClass('retrievedComplexSearchesListContainer');
            getSavedComplexSearches(true);
        } else
            checkComplexSearchesIntroIsRequired();

        /* remove search result, if present */
        clearSearchResults();
    };
    animateCSS('complexSearchContainer', 'backOutRight', FASTER, callback);
}

/* -------------------------------------------------------------------------------- */
/* SAVE PROCEDURE */
/* -------------------------------------------------------------------------------- */
function isSearchNameAvailable() {
    let isAvaiable = false;

    let text = $('#SearchName').val();
    if (text && text.length > 0)
        isAvaiable = true;

    return isAvaiable;
}

async function saveSearchAsync() {
    /* check whether a nema for current search has been set or not */
    if (!isSearchNameAvailable()) {
        setInputFieldErrorState(`SearchName`, true);
        showSimpleDialog(WARNING_LABEL, SaveComplexSearchNoNameErrorMessage, WARNING);
        return;
    }

    /* check whether fields have been filled or not */
    if (!validateFields()) {
        showSimpleDialog(WARNING_LABEL, SearchComplexValidationErrorsMessage, WARNING);
        return;
    }

    setLoadingCircleIsVisible(true);

    saveComplexSearchModel.Name = $('#SearchName').val();

    saveComplexSearchModel.RequestedLevels = requestedLevelsComplex;

    let isNewSearch = (saveComplexSearchModel.Id == 0);

    let obj = await doAjaxPostDefaultContentTypeAsync(UrlSaveComplexSearch, saveComplexSearchModel);
    if (obj) {
        setLoadingCircleIsVisible(false);
        if (obj.IsOk) {
            /* update model Id for being used in case of edit */
            saveComplexSearchModel.Id = obj.Id;
            /* show checkmark to warn search has been saved */
            showByClass('searchSavedCheckmark');
            animateCSS('searchSavedCheckmark', 'pulse', FAST);

            /* set model as updated */
            setSaveComplexSearchModelSaved(true);
            if (isNewSearch)
                showSimpleDialog(INFO_LABEL, SaveComplexSearchSavedMessage, SUCCESS);
            else
                showSimpleDialog(INFO_LABEL, SaveComplexSearchUpdatedMessage, SUCCESS);
        } else {
            showSimpleDialog(ERROR_LABEL, obj.ExMsg, ALERT);
        }
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SaveComplexSearchErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* RETRIEVE SAVED COMPLEX SEARCHES */
/* ################################################################################ */
function buildSavedComplexSearchesTable(obj) {
    $('#retrievedComplexSearchesList').empty();

    let html = ``;

    let tableid = 'retrievedComplexSearchesTable';

    html += `<table id="${tableid}" `;
    html += `class="table compact striped row-hover" `;
    html += `data-role="table" `;
    html += `data-static-view="true" `;
    html += `data-view-save-mode="client" `;
    html += `data-view-save-path="TABLE:${tableid}:KEYS">`;
    html += `   <thead>`;
    html += `       <tr>`;
    html += `           <th>&nbsp;</th>`;
    html += `           <th>&nbsp;</th>`;
    html += `           <th>${SavedComplexSearchesNameLabel}</th>`;
    html += `           <th>${SavedComplexSearchesDateLabel}</th>`;
    html += `           <th>${SavedComplexSearchesConditionsLabel}</th>`;
    html += `           <th>&nbsp;</th>`;
    html += `       </tr>`;
    html += `   </thead>`;
    html += `   <tbody>`;
    let itemsNum = obj.length;
    for (var i = 0; i < itemsNum; i++) {
        let datetime = formatDate(obj[i].InsertDateTimeJs);

        let conditionTypes = '';
        if (obj[i].ConditionTypes && obj[i].ConditionTypes.length > 0) {
            conditionTypes = obj[i].ConditionTypes.join(', ');
        }

        /* main row */
        html += `   <tr class="pointer">`;
        html += `       <td><button class="button primary cycle mini outline" title="${SavedComplexSearchesShowDetailedInfoLabel}" onclick="${buildComplexSearchProcedureAsync.name}(${obj[i].Id})"><span class="mif-list"></span></button></td>`;
        html += `       <td><button class="button primary cycle mini outline" title="${SavedComplexSearchesExecuteLabel}" onclick="${buildAndRunComplexSearchProcedureAsync.name}(${obj[i].Id})"><span class="mif-done"></span></button></td>`;
        html += `       <td>${obj[i].Name}</td>`;
        html += `       <td>${datetime}</td>`;
        html += `       <td>${conditionTypes}</td>`;
        html += `       <td><button class="button primary cycle mini outline" title="${SavedComplexSearchesDeleteLabel}" onclick="${deleteComplexSearchAndReloadProcedure.name}(${obj[i].Id})"><span class="mif-bin"></span></button></td>`;
        html += `   </tr>`;
    }
    html += `   </tbody>`;
    html += `</table>`;

    /* append html with list and animate it */
    $('#retrievedComplexSearchesList').html(html);
}

async function getSavedComplexSearches(isReloadRequired = false) {
    if (areComplexSearchesRetrieved && !isReloadRequired)
        return;

    setLoadingCircleIsVisible(true);

    let obj = await doAjaxGetNoModelAsync(UrlGetSavedComplexSearches)
    if (obj && obj.length > 0) {
        /* hide info */
        let callback = function () {
            /* build the list with available items */
            buildSavedComplexSearchesTable(obj);
            /* hide explanation on complex searches */
            hideByClass('retrievedComplexSearchesInfo');
            /* set saved complex searches available */
            areSavedComplexSearchesAvailable = true;
            showComplexSearchesIntroProcedure(isReloadRequired);
        };
        if (isReloadRequired)
            callback();
        else
            animateCSS('retrievedComplexSearchesInfo', 'backOutRight', FASTER, callback);

        /* set list as retrieved */
        areComplexSearchesRetrieved = true;
    }

    setLoadingCircleIsVisible(false);
}