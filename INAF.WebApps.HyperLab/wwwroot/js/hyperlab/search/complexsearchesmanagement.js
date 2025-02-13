var currentSearchInfoId = 0;

var saveComplexSearchModel = {
    Id: 0,
    Name: '',
    Conditions: []
};

/* ################################################################################ */
/* DELETE COMPLEX SEARCH */
/* ################################################################################ */
function deleteComplexSearchProcedure(itemId, itemName) {
    askAndExecute(SearchComplexQueryConditionsManagement, SavedComplexSearchesDeleteQuestion, deleteComplexSearch, [itemId, itemName]);
}

async function deleteComplexSearch(itemId, itemName) {
    setLoadingCircleIsVisible(true);

    let model = {
        Id: itemId
    };

    let obj = await doAjaxPostAsync(UrlDeleteComplexSearch, model);
    if (obj && obj.IsOk) {
        let plugin = Metro.getPlugin('#retrievedComplexSearchesTable', 'table');
        plugin.deleteItem(2, itemName); // 2 is index of name in column
        plugin.resetView();
        setLoadingCircleIsVisible(false);
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

function tryAddSaveSearchElement() {
    if ($('#complexSearchTopBar').children().length > 0)
        return;

    let html = '';
    html += `<div id="saveSearchGroup" class="d-flex flex-justify-between complex-search-title">`;
    // add button save search
    html += '   <div class="d-flex flex-start">';
    html += `       <button id="buttonBackToList" class=" button primary cycle outline margin-top-8 margin-left-8 d-none" title="${ComplexSearchBackToListLabel}" onclick="removeSearch(true)"><span class="mif-arrow-left"></span></button>`;
    html += `       <button class="button primary cycle outline margin-top-8 margin-left-8" title="${SaveComplexSearchLabel}" onclick="saveSearch()"><span class="mif-floppy-disk"></span></button>`;
    html += '   </div>';
    // add title
    html += `   <div id='searchTitleInput' class="flex-center flex-row d-none">`;
    html += `       <div class="flex-center flex-column">`;
    html += `           <input data-role="input" class="search-name-width height-40 margin-top-8" data-val="true" data-val-required="The search name field is required." id="SearchName" name="SearchName" onchange="updateSearchNameErrorStatus()" placeholder="${SaveComplexSearchNamePlaceholder}" type="text" value="" data-role-input="true">`;
    html += `           <div><span id="SearchNameValidation" class='field-validation-valid'>${SearchFieldTextRequiredMessage}</span></div>`;
    html += `       </div>`;
    html += `       <span id='searchSavedCheckmark' class='mif-checkmark fg-green margin-top-20 margin-horizontal-8 d-none'></span>`;
    html += `       <button class="flex-end button dark cycle outline mini margin-top-16 margin-left-8" title="${SearchComplexHideTitle}" onclick="setEnabledSearchTitle(false)"><span class="mif-cross-light"></span></button>`;
    html += `   </div>`;
    // add search generic title
    html += `   <div id="searchTitleLabel" class="d-flex flex-center flex-row margin-top-16">`;
    html += `       <button class="flex-start button dark cycle mini outline margin-right-8" title="${SearchComplexEditTitle}" onclick="setEnabledSearchTitle(true)"><span class="mif-pencil"></span></button>`;
    html += `       <label class="flex-end text-bold">${SearchComplexTitle}</label>`;
    html += `   </div>`;
    // add button remove search
    html += `   <button class="flex-end button dark cycle outline margin-top-8 margin-left-8" title="${SearchComplexClearLabel}" onclick="removeSearchProcedure()"><span class="mif-bin"></span></button>`;
    html += `</div>`;

    $(`#SearchName`).ready(function () {
        /* create Metro plugin for current html element */
        Metro.makePlugin(`#SearchName`, 'input');
        /* animate the ui items container */
        animateCSS(`SearchName`, `bounceIn`, FAST);
    });

    $('#complexSearchTopBar').html(html);
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
function removeSearchProcedure() {
    confirmAndExecute(SearchComplexManagementLabel, SearchComplexRemoveQuestion, removeSearch);
}

function removeSearch(isReloadRequired = false) {
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
        complexSearchConditions = [];

        /* reset the idex used incondition models */
        conditionsIndex = 0;

        /* check whether saved complex-searches-explanation/list is required */
        if (isReloadRequired) {
            showByClass('retrievedComplexSearchesListContainer');
            getSavedComplexSearches(true);
        }  else
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

async function saveSearch() {
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
    saveComplexSearchModel.Conditions = complexSearchConditions

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

            /* show button to go back to searches list */
            showByClass('buttonBackToList');
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

        let popoverhtml = ``;
        popoverhtml += `<button class="button info cycle mini outline" `;
        popoverhtml += `        data-role="popover" `;
        popoverhtml += `        data-popover-text="<div id='complexSearch${obj[i].Id}Info'></div>" `;
        popoverhtml += `        data-popover-position="right" `;
        popoverhtml += `        data-popover-hide="0" `;
        popoverhtml += `        title = "${SavedComplexSearchesShowDetailedInfoLabel}" `;
        popoverhtml += `        data-on-popover-show="expandComplexSearchInfo(${obj[i].Id})"`;
        popoverhtml += `        data-on-popover-hide="freeCurrentSearchInfoId()" `;
        popoverhtml += `        data-cls-popover="bg-light drop-shadow" `;
        popoverhtml += `        data-hide-on-leave="true">`;
        popoverhtml += `    <span class="mif-list"></span>`;
        popoverhtml += `</button>`;
        /* main row */
        html += `   <tr class="pointer">`;
        html += `       <td>${popoverhtml}</td>`;
        html += `       <td><button class="button primary cycle mini outline" title="${SavedComplexSearchesExecuteLabel}" onclick="buildAndRunComplexSearchProcedure(${obj[i].Id})"><span class="mif-done"></span></button></td>`;
        html += `       <td>${obj[i].Name}</td>`;
        html += `       <td>${datetime}</td>`;
        html += `       <td>${conditionTypes}</td>`;
        html += `       <td><button class="button dark cycle mini outline" title="${SavedComplexSearchesDeleteLabel}" onclick="deleteComplexSearchProcedure(${obj[i].Id}, '${obj[i].Name}')"><span class="mif-bin"></span></button></td>`;
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

/* ################################################################################ */
/* COMPLEX SEARCH INFO */
/* ################################################################################ */
async function expandComplexSearchInfo(id) {
    console.log(id);
    if (currentSearchInfoId == id)
        return;

    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetSavedComplexSearchInfo, model)
    if (obj) {
        setCurrentSearchInfoId(id);
        /* build the info panel and show it */
        buildComplexSearchInfo(id, obj);

        /* show 'shrink' icon and hide 'expand' icon */
        hideByClass(`complexSearch${id}IconExpand`);
        showByClass(`complexSearch${id}IconShrink`);
    } else {
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesRetrieveInfoErrorMessage, ALERT);
    }
}

function shrinkComplexSearchInfo(id) {
    /* remove info about complex search */
    $(`#complexSearch${id}Info`).empty();

    /* hide 'shrink' icon and show 'expand' icon */
    showByClass(`complexSearch${id}IconExpand`);
    hideByClass(`complexSearch${id}IconShrink`);
}

/* -------------------------------------------------------------------------------- */
/* BUILD COMPLEX SEARCH INFO PANEL */
/* -------------------------------------------------------------------------------- */
function buildComplexSearchInfo(id, obj) {
    //console.log(obj);
    let html = ``;

    let isOk = true;

    /* find max-value for Index */
    let indexMax = Math.max(...obj.Conditions.map(o => o.Index))

    /* build-up complex search UI */
    for (var i = 0; i <= indexMax; i++) {
        try {
            /* test whether next group is a condition-group or a conditions-opertor item */
            let testItemIndex = obj.Conditions.findIndex(x => x.Index == i && x.GroupIndex == 0);
            let testItem = obj.Conditions[testItemIndex];

            if (testItem.ConditionOperatorType == CONDITION_OPERATOR_NONE) {
                /* if we're dealing with a conditions-group, then let's' retrieve all items belonging to the group 
                   and build-up the info element... */
                let items = obj.Conditions.filter(x => x.Index == i);
                html += getConditionRow(items);
            } else {
                /* ...otherwise let's add the condition between the previous group and the next one */
                html += getConditionOperatorsRow(obj.Conditions[i]);
            }
        } catch (e) {
            console.log(e);
            isOk = false;
            continueLoop = false;
        }
    }

    if (isOk)
        $(`#complexSearch${id}Info`).html(html);
    else
        showComplexSearchInfoError(id);
}

function getConditionRow(conditionGroupItems) {
    let html = ``;

    html += `<div class="row cell-fs-12">`;

    /* 1) retrieve condition type */
    let conditionType = conditionGroupItems[0].ConditionTypeDescription;

    /* 1.1) if condition is of material type, then fix the name */
    if (conditionGroupItems[0].ConditionType == CONDITION_TYPE_MATERIAL)
        conditionType = conditionGroupItems[0].MaterialType;

    /* 1.2) set condition type in html */
    html += `<span class="text-secondary"><strong>${conditionType}</strong>:&nbsp;</span>`;

    /* 2) set values in html */
    let value = ``;
    let itemsNum = conditionGroupItems.length;
    for (var i = 0; i < itemsNum; i++) {
        if (conditionGroupItems[i].ConditionOperatorType == CONDITION_OPERATOR_NONE)
            value += `${conditionGroupItems[i].ValueText}`;
        else
            value += ` <i>${conditionGroupItems[i].ConditionOperatorType.toLowerCase()}</i> `;
    }
    html += `<span class="text-secondary">${value}</span>`;


    html += `</div>`;

    return html;
}

function getConditionOperatorsRow(condition) {
    return `<span class="text-secondary"><strong>${condition.ConditionOperatorType.toLowerCase()}</strong></span>`;
}

function showComplexSearchInfoError(id) {
    let html = '';
    html += `<div class="remark alert">${SavedComplexSearchesInfoErrorMessage}</div>`;

    $(`#complexSearch${id}Info`).html(html);
}

/* -------------------------------------------------------------------------------- */
/* MANAGE currentSearchInfoId */
/* -------------------------------------------------------------------------------- */
function freeCurrentSearchInfoId() {
    currentSearchInfoId = 0;
}

function setCurrentSearchInfoId(id) {
    currentSearchInfoId = id;
}