
var conditionsIndex = 0;
var complexSearchConditionsContainer;

var currentlyUsedGroups = [];

var areSavedComplexSearchesAvailable = false;

var DEFAULT_WAIT_ms = 1000;

function setListviewSearchConditionsUI() {
    if (isMobile()) {
        $("#listviewSearchConditions").data("listview").view('icons');
    } else {
        $("#listviewSearchConditions").data("listview").view('list');
    }
}

/* ################################################################################ */
/* MANAGE CONDITIONS */
/* ################################################################################ */
/* add a condition model */
function addConditionModel(model) {
    saveComplexSearchModel.Conditions.push(model);
    setSaveComplexSearchModelSaved(false);
}

function isFirstConditionGroup(index) {
    let items = saveComplexSearchModel.Conditions.filter(x => x.Index < index);
    return (items.length == 0);
}

function isFirstConditionInGroup(conditionType, groupIndex) {
    let groupItems = saveComplexSearchModel.Conditions.filter(x => x.ConditionType == conditionType);

    if (!groupItems)
        return false;

    let groupIndexMin = Math.min(...groupItems.map(o => o.GroupIndex));
    return (groupIndexMin == groupIndex)
}

/* try to remove a condition model, if found */
function tryRemoveConditionModel(conditionType, groupIndex) {
    let index = saveComplexSearchModel.Conditions.findIndex(x => x.ConditionType == conditionType && x.GroupIndex == groupIndex);

    if (index > -1)
        saveComplexSearchModel.Conditions.splice(index, 1);
}

/* remove a condition UI element and, if required, the whole group it belongs to and the previous condition operators group */
function removeConditionProcedure(id, index, groupIndex, conditionType) {
    /* 1) remove condition (and operators) UI item */
    remove(id);

    let isFirstInGroup = isFirstConditionInGroup(conditionType, groupIndex);

    /* 2) remove the related model */
    tryRemoveConditionModel(conditionType, groupIndex);

    /* 3) remove a conditional operator, depending on the position of conditions in the group */
    /* 3.1) check whether removed item is the first or not in the group */
    if (isFirstInGroup) {
        /* if the condition is the 1st in the group, then removed the next conditional operator (UI item + model)... */
        removeMetroUIElemByName(`searchTypeRadio${index}${groupIndex + 1}`);
        tryRemoveConditionOperatorsModelForItem(groupIndex + 1, conditionType);
    } else
        /* ...otherwise remove the previous one (only model, UI item has been already removed @ step 1) */
        tryRemoveConditionOperatorsModelForItem(groupIndex - 1, conditionType);

    /* 4) if no conditions of current conditionType are anymore available, then free the group */
    if (!isAny(conditionType))
        removeFromCurrentlyUsedGroups(conditionType);

    /* manage UI by checking if any other group is available or list of saved conditions must be shown again */
    manageRemovedCondition(conditionType);
}

/* ask whether user wants to remove a conditions group or not. if yes, then remove it */
function removeConditionsGroup(conditionType, id, index) {
    askAndExecute(SearchComplexQueryConditionsManagement, SearchComplexRemoveGroupQuestion, removeConditionsGroupExecute, [conditionType, id, index]);
}

function removeConditionsGroupExecute(conditionType, id, index) {
    try {
        /* 1) remove all condition models */
        let conditions = saveComplexSearchModel.Conditions.filter(x => x.Index == index);

        let conditionsNum = conditions.length;
        for (var i = 0; i < conditionsNum; i++) {
            tryRemoveConditionModel(conditionType, conditions[i].GroupIndex)
        }

        /* 2) remove group */
        removeConditionsGroupProcedure(id, index, conditionType);
    } catch (e) {
        console.log(`removeConditionsGroupExecute - e: ${e}`);
    }
}

/* remove group UI item, from used ones, previous condition operators (if required) */
function removeConditionsGroupProcedure(id, index, conditionType) {
    /* remove group UI item */
    remove(id);

    /* remove group from currently used ones */
    removeFromCurrentlyUsedGroups(conditionType);

    if (isFirstConditionGroup(index))
        /* if current group is the 1st one, then remove the following operators group... */
        removeConditionOperatorsGroup(index + 1);
    else
        /* ...otherwise remove the previous conditions operator, if found */
        removeConditionOperatorsGroup(index - 1);

    /* check whether showing explanation is required or not...  */
    checkComplexSearchesIntroIsRequired();

    /* ...and make the related button available again */
    setGroupButtonInUse(conditionType, false);
}

/* remove the condition operators group preceding conditions group that is currently being removed */
function removeConditionOperatorsGroup(index) {
    /* remove UI item... */
    let items = $(complexSearchConditionsContainer).find(`[tag=${(index)}]`);
    if (items && items.length > 0) {
        /* remove UI element */
        remove(items[0].id);
    }

    /* ...and model */
    tryRemoveConditionOperatorsModelForGroup(index);

    /* set model as changed */
    setSaveComplexSearchModelSaved(false);
}

/* remove operator condition model when removing conditions group */
function tryRemoveConditionOperatorsModelForGroup(index) {
    let conditionIndex = saveComplexSearchModel.Conditions.findIndex(x => x.Index == index && x.ConditionType == CONDITION_OPERATORS);
    if (conditionIndex > -1)
        saveComplexSearchModel.Conditions.splice(conditionIndex, 1);
}

/* remove operator condition model when removing condition within a group */
function tryRemoveConditionOperatorsModelForItem(groupIndex, conditionType) {
    let conditionIndex = saveComplexSearchModel.Conditions.findIndex(x => x.GroupIndex == groupIndex && x.ConditionType == conditionType);
    if (conditionIndex > -1)
        saveComplexSearchModel.Conditions.splice(conditionIndex, 1);
}

/* ################################################################################ */
/* MANAGE USED GROUPS */
/* ################################################################################ */
function addCurrentlyUsedGroup(groupName) {
    currentlyUsedGroups.push(groupName);
}

function emptyCurrentlyUsedGroups() {
    currentlyUsedGroups = [];
}

function isGroupCurrentlyUsed(groupName) {
    let index = currentlyUsedGroups.findIndex(x => x == groupName);
    if (index > -1)
        return true;
    else
        return false;
}

function removeFromCurrentlyUsedGroups(groupName) {
    let index = currentlyUsedGroups.findIndex(x => x == groupName);
    if (index > -1)
        currentlyUsedGroups.splice(index, 1);
}

/* ################################################################################ */
/* MANAGE GROUP-INDEX */
/* ################################################################################ */
function getGroupIndex(key) {
    if (key == CONDITION_OPERATORS)
        return 0;

    let items = saveComplexSearchModel.Conditions.filter(x => x.ConditionType == key);
    if (!items)
        return 0;
    else
        return items.length;
}

function getStrictGroupIndex(key) {
    if (key == CONDITION_OPERATORS)
        return 0;

    let items = saveComplexSearchModel.Conditions.filter(x => x.ConditionType == key && x.ConditionOperatorType == CONDITION_OPERATOR_NONE);
    if (!items)
        return 0;
    else
        return items.length;
}

function isAny(key) {
    let items = saveComplexSearchModel.Conditions.filter(x => x.ConditionType == key);
    if (items.length == 0)
        return false;
    else
        return true;
}

/* ################################################################################ */
/* ADD/REMOVE CONDITIONS */
/* ################################################################################ */
/* -------------------------------------------------------------------------------- */
/* AND/OR OPERATORS */
/* -------------------------------------------------------------------------------- */
function addConditionsOperators(currentIndex = null) {
    let isAndChecked = true;
    let isOrChecked = false;
    let _groupIndex = null;

    let _currentIndex = null;
    if (currentIndex != null) {
        _currentIndex = currentIndex - 1;
        let item = tryGetConditionOperatorsItem(_currentIndex);
        _groupIndex = item.GroupIndex;
        switch (item.ConditionOperatorType) {
            case CONDITION_OPERATOR_OR:
                isAndChecked = false;
                isOrChecked = true;
                break;
            default:
        }
    }  else {
        _currentIndex = conditionsIndex;
        addConditionModel(getConditionModel(_currentIndex, CONDITION_OPERATORS));
    }

    let html = `<div id="${CONDITION_OPERATORS}${_currentIndex}" tag="${_currentIndex}" class="margin-left-4 d-flex flex-justify-center bg-lightGray">`;
    /* FILLER (ONLY MOBILE) */
    //if (isMobile())
    //    html += `<div class="cell-fs-4">&nbsp;</div>`;

    /* AND */
    //html += `<div class="cell-fs-2 cell-md-2 cell-lg-1">`;
    //html += `<div class="d-flex flex-justify-center">`;
    html += `<div class="margin-right-8">`;
    html += getRadioButton(SearchAndLabel, CONDITION_OPERATOR_AND, 'left', _currentIndex, isAndChecked, false, _groupIndex);
    html += `</div>`;
    /* OR */
    html += `<div class="margin-left-8">`;
    html += getRadioButton(SearchOrLabel, CONDITION_OPERATOR_OR, 'right', _currentIndex, isOrChecked, false, _groupIndex);
    html += `</div>`;
    /* FILLER */
    //html += `<div class="cell-fs-4 cell-md-8 cell-lg-10">&nbsp;</div>`;
    //html += `</div>`;

    /* add event on radio-buttons to update the related complexSearchConditions item */
    /* DO NOT USE addRadioButtonAction since it works for and/or belonging to group-conditions
       while the following statements work for and/or between groups */
    let startid = `${searchTypeRadio}${_currentIndex}`;
    $(`[id^='${startid}']`).ready(function () {
        $(`[id^='${startid}']`).click(function () {
            let index = saveComplexSearchModel.Conditions.findIndex(x => x.Index == _currentIndex);
            if (index > -1)
                saveComplexSearchModel.Conditions[index].ConditionOperatorType = $(this).attr('data-tag');
        });
    });

    /* append html to create group */
    $(complexSearchConditionsContainer).append(html);

    conditionsIndex++;
}

function addRadioButtonAction(currentIndex, groupIndex) {
    /* add event on radio-buttons to update the related complexSearchConditions item */
    let startid = `${searchTypeRadio}${currentIndex}`;
    $(`[id^='${startid}']`).ready(function () {
        $(`[id^='${startid}']`).click(function () {
            let index = saveComplexSearchModel.Conditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
            if (index > -1)
                saveComplexSearchModel.Conditions[index].ConditionOperatorType = $(this).attr('data-tag');
        });
    });
}

function getRadioButton(label, conditionOperator, captionPosition, currentIndex, isChecked, useCustomHeight, groupIndex) {
    let html = '';
    html += `<input type="radio" `;
    let groupIndexLabel = (groupIndex != null ? groupIndex : '');
    html += `name="${searchTypeRadio}${currentIndex}${groupIndexLabel}" `;
    html += `id="${searchTypeRadio}${currentIndex}${groupIndexLabel}${label}" `;
    html += `data-role="radio" `;
    html += `data-style="2" `;
    html += `data-caption="${label}" `;
    html += `data-caption-position="${captionPosition}" `;
    html += `data-tag="${conditionOperator}" `;
    html += `data-cls-check="bd-cyan" `;
    let checked = (isChecked ? 'checked' : '');
    let customHeight = (useCustomHeight ? 'group-radio' : '');
    html += `class="d-flex flex-justify-right ${customHeight}" ${checked}>`;
    return html;
}

/* -------------------------------------------------------------------------------- */
/* MATERIAL CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionMaterial(liId, currentIndex = null, groupIndex = null) {
    /* only 1 group per type is allowed, if already present then return */
    if (isGroupCurrentlyUsed(CONDITION_TYPE_MATERIAL))
        return;

    let callback = function () {
        /* set this group currently used */
        addCurrentlyUsedGroup(CONDITION_TYPE_MATERIAL);

        /* add and/or operators between 2 different condition gorups, if needed */
        if (isConditionsOperatorsItemRequired())
            addConditionsOperators(currentIndex);

        /* begin building up condition group */
        let _currentIndex = currentIndex;
        if (_currentIndex == null)
            _currentIndex = conditionsIndex;

        let id = `${CONDITION_TYPE_MATERIAL}${CONDITIONS_CONTAINER}`;

        let html = ``;
        html += `<div id="${id}" tag="${_currentIndex}" class="conditions-group">`;
        html += `   <div class="row cell-fs-12 d-flex flex-justify-between flex-wrap">`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupAddItem}" onclick="addConditionMaterialItem()"><span class="mif-plus"></span></button>`;
        html += `       <label class="flex-center"><span class="text-secondary text-medium">${SearchComplexConditionsOnMaterialLabel}</span></label>`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupRemoveGroup}" onclick="removeConditionsGroup('${CONDITION_TYPE_MATERIAL}', '${id}', ${_currentIndex})"><span class="mif-bin"></span></button>`;
        html += `   </div>`;
        html += `   <div id="${CONDITION_TYPE_MATERIAL}${CONDITIONS_ITEMS}" class="row">`;
        html += getConditionMaterialItem(_currentIndex, groupIndex);
        html += `   </div>`;
        html += `</div>`;

        /* hide the 'select' field and manage variable for incrementing conditionsIndex */
        setMaterialItem(currentIndex, groupIndex);

        /* add actions for and/or radio buttons */
        addRadioButtonAction(currentIndex, groupIndex);

        /* append html to create group */
        $(complexSearchConditionsContainer).append(html);

        /* disable caller button and set message 'group already in use' */
        setGroupButtonInUse(liId);

        /* increment index for grouping conditions */
        conditionsIndex++;
    }

    manageAddedCondition(callback);
}

function addConditionMaterialItem(currentIndex = null, groupIndex = null) {
    let _currentIndex = currentIndex;
    if (_currentIndex == null)
        _currentIndex = getCurrentIndex(CONDITION_TYPE_MATERIAL);

    let html = getConditionMaterialItem(_currentIndex, groupIndex);

    /* realize metro plugin when item has been created */
    setMaterialItem(_currentIndex, groupIndex);

    /* append html to create item */
    $(`#${CONDITION_TYPE_MATERIAL}${CONDITIONS_ITEMS}`).append(html);
}

function getConditionMaterialItem(currentIndex = null, groupIndex = null) {
    let isBuildingFromExistingConditions = true;

    let _groupIndex = groupIndex;
    if (groupIndex == null) {
        isBuildingFromExistingConditions = false;
        _groupIndex = getGroupIndex(CONDITION_TYPE_MATERIAL);
    }

    let htmloperators = '';
    if (_groupIndex > 0) {
        htmloperators = buildConditionOperatorsGroup(currentIndex, _groupIndex - 1, CONDITION_TYPE_MATERIAL);

        /* set action for radio buttons to update the related complexSearchConditions item */
        let startid = `${searchTypeRadio}${currentIndex}${groupIndex}`;
        $(`[id^='${startid}']`).ready(function () {
            $(`[id^='${startid}']`).click(function () {
                /* retrieve index/groupIndex from last 2 chars of id */
                let retrievedIndex = parseInt(startid.charAt(startid.length - 2));
                let retrievedGroupIndex = parseInt(startid.charAt(startid.length - 1));
                let index = saveComplexSearchModel.Conditions.findIndex(x => x.Index == retrievedIndex && x.GroupIndex == retrievedGroupIndex);
                if (index > -1)
                    saveComplexSearchModel.Conditions[index].ConditionOperatorType = $(this).attr('data-tag');
            });
        });

        /* update the groupIndex value for next condition model (only if no groupIndex value is passed) */
        if (groupIndex == null)
            _groupIndex = getGroupIndex(CONDITION_TYPE_MATERIAL);
    }

    /* if we're not building up from existings conditions, then add new condition to models */
    if (!isBuildingFromExistingConditions) {
        addConditionModel(getConditionOperatorModel(currentIndex, _groupIndex, CONDITION_TYPE_MATERIAL, CONDITION_OPERATOR_OR, 0));
        _groupIndex = getGroupIndex(CONDITION_TYPE_MATERIAL);
        addConditionModel(getConditionModelWithValueText(currentIndex, CONDITION_TYPE_MATERIAL));
    }

    let inputid = `${CONDITION_TYPE_MATERIAL}Input${currentIndex}${_groupIndex}`;
    let selectid = `${CONDITION_TYPE_MATERIAL}${currentIndex}${_groupIndex}`;

    let html = '';
    html += `<div id="${selectid}Container" class="d-flex flex-column margin-horizontal-4" ${getRemoveButtonOpacityActionsHtml(currentIndex, _groupIndex)}>`;
    /* add radio button condition if required */
    if (_groupIndex > 0) {
        html += `   <div class='d-flex flex-row'>`;
        html += htmloperators;
    }
    html += `   <div class='d-flex flex-row'>`;
    html += '       <div>';
    let valueText = tryGetValueText(currentIndex, _groupIndex, CONDITION_TYPE_MATERIAL);
    if (valueText == null)
        valueText = '';
    html += `           <input id="${inputid}" type="text" value="${valueText}" placeholder="${SearchByMaterialPlaceholder}" class="select-item-width-large" data-role="input" onchange="setMaterialErrorState('${inputid}', false)" data-search-button="true" data-search-button-click="custom" data-on-search-button-click="getMaterialsSuggestions('${inputid}','${selectid}')" />`;
    html += `           <select id="${selectid}" data-role="select" data-cls-select="overlap select-item-width" data-on-change="${manageValueSelection.name}('${selectid}')"></select>`;
    html += '       </div>';
    html += `       <button class="button dark cycle small outline margin-top-4 margin-left-8" onclick="${resetSearchByMaterial.name}('${inputid}')" title="${SearchClearSuggestionsButtonTitle}"><span class="mif-cross-light"></span></button >`;
    html += getRemoveButtonHtml(`${selectid}Container`, currentIndex, _groupIndex, `${CONDITION_TYPE_MATERIAL}`);
    html += `   </div>`;
    if (_groupIndex > 0)
        html += `   </div>`;
    let spanclass = 'field-validation-valid';
    if (_groupIndex > 0)
        spanclass += ' field-validation-text2';
    html += `<div><span id="${inputid}Validation" class='${spanclass}'></span></div>`;
    html += `</div>`;

    /* manage variable for incrementing conditionsIndex */
    $(`#${inputid}`).ready(function () {
        /* enable search for materials suggestions when 'Enter' is pressed */
        $(`#${inputid}`).keydown(function (evt) {
            getMaterialForSearchByEnter(evt, evt.target.id, evt.target.id.replace('Input', ''), manageValueSelection);
        });

        /* the following is used when building up conditions from saved searches */
        if ($(`#${inputid}`).val() != '') {
            getMaterialsSuggestions(inputid, selectid, manageValueSelection);
        }
    });

    return html;
}

function isMaterialType(object, selectedValue, selectedText) {
    let isMaterialTypeFound = false;

    let keys = Object.keys(object);
    keys.forEach(x => {
        if (x == selectedValue && object[x] == selectedText) {
            isMaterialTypeFound = true;
        }
    });

    return isMaterialTypeFound;
}

function manageValueSelection(id) {
    let selectedValue = Metro.getPlugin(`#${id}`, 'select').getSelected();
    //let selectedTexts = Metro.getPlugin(`#${id}`, 'select').getSelectedText();
    let selectedText = '';
    let selectedId = 0;

    let suggestionsItem = suggestions[id];
    let keys = Object.keys(suggestionsItem);
    let keysNum = keys.length;
    let continueLoop = true;
    for (var i = 0; i < keysNum; i++) {
        if (!continueLoop)
            break;
        let item = suggestionsItem[keys[i]];
        let itemKeys = Object.keys(item);
        let itemKeysNum = itemKeys.length;
        for (var j = 0; j < itemKeysNum; j++) {
            if (itemKeys[j] = selectedValue) {
                selectedText = item[itemKeys[j]];
                let tmp = itemKeys[j][0].split('_');
                selectedId = parseInt(tmp[1]);
                continueLoop = false;
                break;
            }
        }
    }

    let materialType = '';
    let isMaterialTypeFound = false;

    if (suggestions[id].Minerals) {
        if (isMaterialType(suggestions[id].Minerals, selectedValue[0], selectedText)) {
            isMaterialTypeFound = true;
            materialType = MATERIAL_TYPE_MINERAL;
        }
    }
    if (!isMaterialTypeFound && suggestions[id].Rocks) {
        if (isMaterialType(suggestions[id].Rocks, selectedValue[0], selectedText)) {
            isMaterialTypeFound = true;
            materialType = MATERIAL_TYPE_ROCK;
        }
    }
    if (!isMaterialTypeFound && suggestions[id].MeteorClasses) {
        if (isMaterialType(suggestions[id].MeteorClasses, selectedValue[0], selectedText)) {
            isMaterialTypeFound = true;
            materialType = MATERIAL_TYPE_METEORCLASS;
        }
    }

    /* retrieve index/groupIndex from last 2 chars of id */
    let currentIndex = parseInt(id.charAt(id.length - 2));
    let groupIndex = parseInt(id.charAt(id.length - 1));

    /* update condition model */
    updateConditionModelForMaterial(selectedId, selectedText, currentIndex, groupIndex, materialType);
}

function setMaterialItem(currentIndex, groupIndex) {
    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getGroupIndex(CONDITION_TYPE_MATERIAL) - 1;

    let selectid = `${CONDITION_TYPE_MATERIAL}${currentIndex}${_groupIndex}`;

    $(`#${selectid}`).ready(function () {
        /* hide the 'select' element and leave the 'input' one visible for searching material... */
        hideMetroUIElem(`${selectid}`);
        /* animate the ui items container */
        animateCSS(`${selectid}Container`, `bounceIn`, FAST);
    });
}

/* -------------------------------------------------------------------------------- */
/* MINERAL CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionMineralType(liId, groupIndex = null) {
    addConditionSelectItem(liId, CONDITION_TYPE_MINERAL_TYPE, mineralTypes, 'mineralTypes', selectMineralType, 'selectMineralType', SearchComplexConditionsOnMineralTypeLabel, groupIndex);
}

/* -------------------------------------------------------------------------------- */
/* ORIGIN TYPE CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionOriginType(liId, groupIndex = null) {
    addConditionSelectItem(liId, CONDITION_TYPE_ORIGIN_TYPE, originTypes, 'originTypes', selectOriginType, 'selectOriginType', SearchComplexConditionsOnOriginTypeLabel, groupIndex);
}

/* -------------------------------------------------------------------------------- */
/* SAMPLE NAME CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionSampleName(liId, currentIndex = null, groupIndex = null) {
    /* only 1 group per type is allowed, if already present then return */
    if (isGroupCurrentlyUsed(CONDITION_TYPE_SAMPLE_NAME))
        return;

    let callback = function () {
        /* set this group currently used */
        addCurrentlyUsedGroup(CONDITION_TYPE_SAMPLE_NAME);

        /* add and/or operators between 2 different condition gorups, if needed */
        if (isConditionsOperatorsItemRequired())
            addConditionsOperators(currentIndex);

        /* begin building up condition group */
        if (currentIndex == null)
            currentIndex = conditionsIndex;

        let id = `${CONDITION_TYPE_SAMPLE_NAME}${CONDITIONS_CONTAINER}`;

        let html = ``;
        html += `<div id="${id}" tag="${currentIndex}" class="conditions-group">`;
        html += `   <div class="row cell-fs-12 d-flex flex-justify-between flex-wrap">`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupAddItem}" onclick="addConditionSampleNameItem()"><span class="mif-plus"></span></button>`;
        html += `       <label class="flex-center"><span class="text-secondary text-medium">${SearchComplexConditionsOnSampleNameLabel}</span></label>`;
        html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupRemoveGroup}" onclick="removeConditionsGroup('${CONDITION_TYPE_SAMPLE_NAME}', '${id}', ${currentIndex})"><span class="mif-bin"></span></button>`;
        html += `   </div>`;
        html += `   <div id="${CONDITION_TYPE_SAMPLE_NAME}${CONDITIONS_ITEMS}" class="row">`;
        html += getConditionSampleNameItem(currentIndex, groupIndex);
        html += `   </div>`;
        html += `</div>`;

        /* realize metro plugin when item has been created */
        setSampleNameItem(currentIndex, groupIndex);

        /* append html to create group */
        $(complexSearchConditionsContainer).append(html);

        /* disable caller button and set title 'group already in use' */
        setGroupButtonInUse(liId);

        /* increment index for grouping conditions */
        conditionsIndex++;
    };

    manageAddedCondition(callback);
}

function addConditionSampleNameItem(currentIndex = null, groupIndex = null) {
    let _currentIndex = currentIndex;
    if (_currentIndex == null)
        _currentIndex = getCurrentIndex(CONDITION_TYPE_SAMPLE_NAME);

    let html = getConditionSampleNameItem(_currentIndex, groupIndex);

    /* realize metro plugin when item has been created */
    setSampleNameItem(_currentIndex, groupIndex);

    /* add actions for and/or radio buttons */
    addRadioButtonAction(_currentIndex, groupIndex - 1);

    /* append html to create item */
    $(`#${CONDITION_TYPE_SAMPLE_NAME}${CONDITIONS_ITEMS}`).append(html);
}

function getConditionSampleNameItem(currentIndex, groupIndex) {
    let isBuildingFromExistingConditions = true;

    let _groupIndex = groupIndex;
    if (groupIndex == null) {
        isBuildingFromExistingConditions = false;
        _groupIndex = getGroupIndex(CONDITION_TYPE_SAMPLE_NAME);
    }

    /* if a condition is already existing, then we need to link the old one and the new one with a condition operator and/or */
    let htmloperators = '';
    if (_groupIndex > 0) {
        htmloperators = buildConditionOperatorsGroup(currentIndex, _groupIndex - 1, CONDITION_TYPE_SAMPLE_NAME);
        /* update the groupIndex value for next condition model (only if no groupIndex value is passed) */
        if (groupIndex == null)
            _groupIndex = getGroupIndex(CONDITION_TYPE_SAMPLE_NAME);
    }

    /* if we're not building up from existings conditions, then add new condition to models */
    if (!isBuildingFromExistingConditions) {
        addConditionModel(getConditionOperatorModel(currentIndex, _groupIndex, CONDITION_TYPE_SAMPLE_NAME, CONDITION_OPERATOR_OR, 0));
        _groupIndex = getGroupIndex(CONDITION_TYPE_SAMPLE_NAME);
        addConditionModel(getConditionModelWithValueText(currentIndex, CONDITION_TYPE_SAMPLE_NAME));
    }

    /* create id */
    let id = `${CONDITION_TYPE_SAMPLE_NAME}${currentIndex}${_groupIndex}`;

    let html = '';

    html += `<div id="${id}Container" class="row margin-horizontal-4 d-flex flex-column" ${getRemoveButtonOpacityActionsHtml(currentIndex, _groupIndex)}>`;
    html += `   <div class="d-flex flex-row">`;
    /* add radio button condition if required */
    if (_groupIndex > 0) {
        html += htmloperators;
    }
    /* try to retrieve value from complexSearchConditions */
    let valueText = tryGetValueText(currentIndex, _groupIndex, CONDITION_TYPE_SAMPLE_NAME);
    if (valueText == null)
        valueText = '';
    html += `       <input data-role="input" class="height-40 select-item-width" data-val="true" data-val-required="The SampleName field is required." `;
    html += `onchange="updateSampleNameModel('${id}', ${currentIndex}, ${_groupIndex})" id="${id}" name="SampleName${currentIndex}${_groupIndex}"  `;
    html += `placeholder="${SearchBySampleNamePlaceholder}" type="text" value="${valueText}"  class="" >`;
    html += getRemoveButtonHtml(`${id}Container`, currentIndex, _groupIndex, `${CONDITION_TYPE_SAMPLE_NAME}`);
    html += `   </div>`;
    let spanclass = 'field-validation-valid';
    if (_groupIndex > 0)
        spanclass += ' field-validation-text';
    html += `<div><span id="${id}Validation" class='${spanclass}'>${SearchFieldTextRequiredMessage}</span></div>`;
    html += '</div>';

    return html;
}

function setSampleNameItem(currentIndex, groupIndex = null) {
    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getStrictGroupIndex(CONDITION_TYPE_SAMPLE_NAME) - 1;

    let id = `${CONDITION_TYPE_SAMPLE_NAME}${currentIndex}${_groupIndex}`;
    $(`#${id}`).ready(function () {
        /* create Metro plugin for current html element */
        //Metro.makePlugin(`#${id}`, 'input');
        /* animate the ui items container */
        animateCSS(`${id}`, `bounceIn`, FAST);
    });
}

function updateSampleNameModel(id, currentIndex, groupIndex) {
    /* retrieve text */
    let text = $(`#${id}`).val();

    /* update UI */
    if (text.length > 0)
        setInputFieldErrorState(id, false);
    else
        setInputFieldErrorState(id, true);

    /* update condition model with text */
    let index = saveComplexSearchModel.Conditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
    if (index > -1)
        saveComplexSearchModel.Conditions[index].ValueText = text;
}

/* -------------------------------------------------------------------------------- */
/* SAMPLE TYPE CONDITION */
/* -------------------------------------------------------------------------------- */
function addConditionSampleType(liId, groupIndex = null) {
    addConditionSelectItem(liId, CONDITION_TYPE_SAMPLE_TYPE, sampleTypes, 'sampleTypes', selectSampleDataType, 'selectSampleDataType', SearchComplexConditionsOnSampleDataTypeLabel, groupIndex);
}

/* -------------------------------------------------------------------------------- */
/* SELECT ITEM CONDITION (MINERAL-TYPE, ORIGIN-TYPE, SAMPLE-TYPE) */
/* -------------------------------------------------------------------------------- */
function addConditionSelectItem(liId, conditionType, itemsArray, itemsArrayName, selectItemCallback, selectItemCallbackName, groupLabel, currentIndex = null, groupIndex = null) {
    /* only 1 group per type is allowed, if already present then return */
    if (isGroupCurrentlyUsed(conditionType))
        return;

    let callback = function () {
        /* set this group currently used */
        addCurrentlyUsedGroup(conditionType);

        /* add and/or operators between 2 different condition gorups, if needed */
        if (isConditionsOperatorsItemRequired())
            addConditionsOperators(currentIndex);

        /* begin building up condition group */
        let _currentIndex = currentIndex;
        if (_currentIndex == null)
            _currentIndex = conditionsIndex;

        let id = `${conditionType}${CONDITIONS_CONTAINER}`;

        /* build html for select item */
        let itemhtml = getSelectItem(itemsArray, _currentIndex, groupIndex, selectItemCallback, conditionType)

        let functionhtml = `addConditionSelectItemOtherItems('${conditionType}', ${itemsArrayName}, ${selectItemCallbackName})`;

        /* add actions for and/or radio buttons */
        addRadioButtonAction(_currentIndex, groupIndex);

        /* build html for select + condition item */
        let html = buildConditionsGroupWithSelectItems(id, _currentIndex, conditionType, itemhtml, functionhtml, groupLabel);

        /* realize metro plugin when item has been created */
        animateSelectItem(conditionType, _currentIndex);

        /* append html to create group */
        $(complexSearchConditionsContainer).append(html);

        /* disable caller button and set message 'group already in use' */
        setGroupButtonInUse(liId);

        /* increment index for grouping conditions */
        conditionsIndex++;
    }

    manageAddedCondition(callback);
}

function addConditionSelectItemOtherItems(conditionType, itemsArray, callback, currentIndex = null, groupIndex = null) {
    let _currentIndex = currentIndex;
    if (_currentIndex == null)
        _currentIndex = getCurrentIndex(conditionType);

    if (!isAddingOtherConditionAllowedForGroup(itemsArray.length, conditionType))
        return;

    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getGroupIndex(conditionType);

    let html = getSelectItem(itemsArray, _currentIndex, _groupIndex, callback, conditionType);

    /* realize metro plugin when item has been created */
    animateSelectItem(conditionType, _currentIndex);

    /* append html to create item */
    $(`#${conditionType}${CONDITIONS_ITEMS}`).append(html);
}

function getSelectItem(arrayItems, currentIndex, groupIndex, selectType, conditionType) {
    let _groupIndex = groupIndex;
    if (_groupIndex == null)
        _groupIndex = getGroupIndex(conditionType);

    let id = `${conditionType}${currentIndex}${getStrictGroupIndex(conditionType)}Container`;

    let html = '';
    html += `<div id="${id}" class="d-flex flex-row margin-horizontal-4" ${getRemoveButtonOpacityActionsHtml(currentIndex, _groupIndex)}>`;
    /* add radio button condition if required */
    if (_groupIndex > 0) {
        html += buildConditionOperatorGroup(currentIndex, _groupIndex - 1, conditionType);
        /* update the groupIndex value for next condition model (only if no groupIndex value is passed) */
        if (groupIndex == null)
            _groupIndex = getGroupIndex(conditionType);
    }
    html += `   <div class="d-flex flex-justify-start">`;
    let selectid = `${selectType}${currentIndex}${_groupIndex}`;
    html += `       <select id="${selectid}" data-role="select" data-cls-select="select-item-width" data-on-change="updateConditionModelForSelectItem('${selectid}', ${currentIndex}, ${_groupIndex})">`;

    let arrayItemsNum = arrayItems.length;
    for (var i = 0; i < arrayItemsNum; i++) {
        html += `       <option value="${arrayItems[i].key}">${arrayItems[i].value}</option>`;
    }

    html += `       </select>`;
    html += getRemoveButtonHtml(`${id}`, currentIndex, _groupIndex, `${conditionType}`);
    html += `   </div>`;
    html += `</div>`;

    /* add condition to models */
    let _itemValue = arrayItems[0].key;
    let _itemId = 0;

    let item = tryGetComplexSearchConditionsItem(currentIndex, _groupIndex, conditionType)
    if (item) {
        _itemValue = item.ValueId;
        _itemId = item.Id;

        $(`#${selectid}`).ready(function () {
            var select = Metro.getPlugin(`#${selectid}`, 'select');
            select.val(_itemValue);

            $(`#${selectid}`).on('change', function () {

            });
        });
    } else {
        addConditionModel(getConditionOperatorModel(currentIndex, _groupIndex, conditionType, CONDITION_OPERATOR_OR, 0));
        _groupIndex = getGroupIndex(conditionType);
        addConditionModel(getConditionModelWithValueId(currentIndex, conditionType, _itemValue, _itemId));
    }

    return html;
}

/* -------------------------------------------------------------------------------- */
/* CONDITIONS BUILDER FUNCTIONS */
/* -------------------------------------------------------------------------------- */
function buildConditionOperatorGroup(currentIndex, groupIndex, conditionType) {
    /* try to retrieve info from complexSearchConditions */
    let item = tryGetComplexSearchConditionsItem(currentIndex, groupIndex, conditionType)

    let isOrChecked = true;
    let conditionOperatorType = CONDITION_OPERATOR_OR;
    let conditionOperatorId = 0;

    if (!item)
        addConditionModel(getConditionOperatorModel(currentIndex, groupIndex, conditionType, conditionOperatorType, conditionOperatorId));

    let html = '';
    html += `   <div class="d-flex flex-column margin-horizontal-4">`;
    html += getRadioButton(SearchOrLabel, CONDITION_OPERATOR_OR, 'right', currentIndex, isOrChecked, true, groupIndex);
    html += `   </div>`;

    return html;
}

function buildConditionOperatorsGroup(currentIndex, groupIndex, conditionType) {
    /* try to retrieve info from complexSearchConditions */
    let item = tryGetComplexSearchConditionsItem(currentIndex, groupIndex, conditionType)

    let isAndChecked = false;
    let isOrChecked = true;
    let conditionOperatorType = CONDITION_OPERATOR_OR;
    let conditionOperatorId = 0;

    if (item) {
        /* if info are available, then retrieve them.... */
        conditionOperatorType = item.ConditionOperatorType;
        conditionOperatorId = item.Id;
        switch (item.ConditionOperatorType) {
            case CONDITION_OPERATOR_AND:
                isAndChecked = true;
                isOrChecked = false;
                break;

            default:
        }
    } else
        /* ...else add condition model for 'and' operator */
        addConditionModel(getConditionOperatorModel(currentIndex, groupIndex, conditionType, conditionOperatorType, conditionOperatorId));

    let html = '';
    html += `   <div class="d-flex flex-column margin-horizontal-4">`;
    html += getRadioButton(SearchAndLabel, CONDITION_OPERATOR_AND, 'right', currentIndex, isAndChecked, true, groupIndex);
    html += getRadioButton(SearchOrLabel, CONDITION_OPERATOR_OR, 'right', currentIndex, isOrChecked, true, groupIndex);
    html += `   </div>`;

    return html;
}

function buildConditionsGroupWithSelectItems(id, currentIndex, conditionType, itemhtml, addItemFunctionHtml, groupTitle) {
    let html = '';
    html += `<div id="${id}" tag="${currentIndex}" class="conditions-group">`;
    html += `   <div class="row cell-fs-12 d-flex flex-justify-between flex-wrap">`;
    html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupAddItem}" onclick="${addItemFunctionHtml}"><span class="mif-plus"></span></button>`;
    html += `       <label class="flex-center"><span class="text-secondary text-medium">${groupTitle}</span></label>`;
    html += `       <button class="flex-start button dark cycle mini outline" title="${SearchComplexGroupRemoveGroup}" onclick="removeConditionsGroup('${conditionType}', '${id}', ${currentIndex})"><span class="mif-bin"></span></button>`;
    html += `   </div>`;
    html += `   <div id="${conditionType}${CONDITIONS_ITEMS}" class="row">`;
    html += itemhtml;
    html += `   </div>`;
    html += `</div>`;

    return html;
}

function animateSelectItem(conditionType, currentIndex) {
    let groupIndex = getGroupIndex(conditionType);

    let id = `${conditionType}${currentIndex}${groupIndex}`;
    $(`#${id}`).ready(function () {
        /* animate the ui items container */
        animateCSS(`${id}`, `bounceIn`, FAST);
    });
}

function updateConditionModel(index, valueId, valueText) {
    saveComplexSearchModel.Conditions[index].ValueId = valueId;
    saveComplexSearchModel.Conditions[index].ValueText = valueText;
}

function updateConditionModelForMaterial(valueId, valueText, currentIndex, groupIndex, materialType) {
    let index = saveComplexSearchModel.Conditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
    if (index > -1) {
        saveComplexSearchModel.Conditions[index].ValueId = valueId;
        saveComplexSearchModel.Conditions[index].ValueText = valueText;
        saveComplexSearchModel.Conditions[index].MaterialType = materialType
    }
}

function updateConditionModelForSelectItem(id, currentIndex, groupIndex) {
    let plugin = Metro.getPlugin(`#${id}`, 'select');
    if (!plugin)
        return;
    //console.log(`${id} val: ${plugin.val()}`);

    let index = saveComplexSearchModel.Conditions.findIndex(x => x.Index == currentIndex && x.GroupIndex == groupIndex);
    if (index > -1) {
        let valueId = parseInt(plugin.val());
        let valueText = '';
        switch (saveComplexSearchModel.Conditions[index].ConditionType) {
            case CONDITION_TYPE_MINERAL_TYPE:
                valueText = mineralTypes[valueId];
                break;
            case CONDITION_TYPE_ORIGIN_TYPE:
                valueText = originTypes[valueId];
                break;
            case CONDITION_TYPE_SAMPLE_TYPE:
                valueText = sampleTypes[valueId];
                break;
        }

        updateConditionModel(index, valueId, valueText);
    }
}

/* -------------------------------------------------------------------------------- */
/* COMMON FOR CONDITIONS */
/* -------------------------------------------------------------------------------- */
function buildConditionModel(id, currentIndex, conditionType, materialType, valueId, valueText, conditionOperatorType) {
    return {
        Id: id,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: materialType, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: valueId,
        ValueText: valueText,
        ConditionOperatorType: conditionOperatorType
    };
}

function getChildren() {
    return $(complexSearchConditionsContainer).children('[id^="Condition"]');
}

function getCurrentIndex(conditionType) {
    let items = saveComplexSearchModel.Conditions.filter(x => x.ConditionType == conditionType);
    if (items && items.length > 0)
        return items[0].Index;
    else
        return 0;
}

function getConditionModel(currentIndex, conditionType) {
    return {
        Id: 0,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: 0,
        ValueText: '',
        ConditionOperatorType: CONDITION_OPERATOR_AND
    };
}

function getConditionModelWithValueId(currentIndex, conditionType, itemValueId, itemId) {
    let _itemId = 0;
    if (itemId)
        _itemId = itemId;
    return {
        Id: _itemId,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: itemValueId,
        ValueText: '',
        ConditionOperatorType: CONDITION_OPERATOR_NONE
    };
}

function getConditionModelWithValueText(currentIndex, conditionType, valueText, id) {
    let _valueText = '';
    if (valueText)
        _valueText = valueText;

    let _id = 0;
    if (id)
        _id = id;

    return {
        Id: _id,
        Index: currentIndex,
        GroupIndex: getGroupIndex(conditionType),
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: 0,
        ValueText: _valueText,
        ConditionOperatorType: CONDITION_OPERATOR_NONE
    };
}

function getConditionOperatorModel(currentIndex, groupIndex, conditionType, operatorValue, operatorId) {
    let _operatorId = 0;
    if (operatorId)
        _operatorId = operatorId;
    return {
        Id: _operatorId,
        Index: currentIndex,
        GroupIndex: groupIndex,
        ConditionType: conditionType,
        MaterialType: MATERIAL_TYPE_NONE, // used only for conditionType = CONDITION_TYPE_MATERIAL
        ValueId: 0,
        ValueText: '',
        ConditionOperatorType: operatorValue
    };
}

function isAddingOtherConditionAllowedForGroup(arrayValuesNum, conditionType) {
    let groupIndex = getStrictGroupIndex(conditionType);
    if (groupIndex == arrayValuesNum) {
        let text = SearchComplexMaxNumOfConditionsReachedMessage.replace('r_v', arrayValuesNum);
        showSimpleDialog(WARNING_LABEL, text, WARNING);
        return false;
    }

    return true;
}

function isConditionsOperatorsItemRequired() {
    return (getChildren().length > 0);
}

function isSameGroupAlreadyPresent(conditionType) {
    let items = saveComplexSearchModel.Conditions.filter(x => x.ConditionType == conditionType);

    if (items && items.length > 0)
        return true;
    else
        return false;
}

function manageAddedCondition(callback) {
    /* when no any condition group is available, use animation to remove the explanation before adding the 1st group,
    otherwise add the new group */
    if ($('#complexSearchConditionsContainer').children().length == 0)
        hideComplexSearchesIntroProcedure(callback);
    else
        callback();
}

function manageRemovedCondition(conditionType) {
    if ($(`#${conditionType}${CONDITIONS_ITEMS}`).children().length == 0) {
        /* when no any condition is available in a group, then remove it... */
        $(`#${conditionType}${CONDITIONS_CONTAINER}`).remove();
        /* ...and make the related button available again */
        setGroupButtonInUse(conditionType, false);
    }

    /* if no group is present, then show explanation */
    checkComplexSearchesIntroIsRequired();
}

function setGroupButtonInUse(liId, isInUse = true) {
    if (isInUse) {
        $(`#${liId}`).addClass('group-in-use');
        $(`#${liId}`).attr('title', SearchComplexGroupAlreadyInUseLabel);
    } else {
        $(`#${liId}`).removeClass('group-in-use');
        $(`#${liId}`).attr('title', '');
    }
}

/* -------------------------------------------------------------------------------- */
/* REMOVE BUTTON */
/* -------------------------------------------------------------------------------- */
function getRemoveButtonOpacityActionsHtml(currentIndex, groupIndex) {
    return `onmouseover="showRemoveButton(${currentIndex}, ${groupIndex})" onmouseout="hideRemoveButton(${currentIndex}, ${groupIndex})"`;
}

function getRemoveButtonId(currentIndex,  groupIndex) {
    return `removeButton${currentIndex}${groupIndex}`;
}

function getRemoveButtonHtml(id, currentIndex, groupIndex, conditionType) {
    return `<button id="${getRemoveButtonId(currentIndex, groupIndex)}" class="button dark cycle small outline remove-button opacity-0 disabled" onclick="removeConditionProcedure('${id}',${currentIndex}, ${groupIndex}, '${conditionType}')"><span class="mif-bin"></span></button>`;
}

function hideRemoveButton(currentIndex, groupIndex) {
    let id = getRemoveButtonId(currentIndex, groupIndex);

    if ($(`#${id}`).hasClass('opacity-1')) {
        let callback = function () {
            $(`#${id}`).removeClass('opacity-1').addClass('opacity-0 disabled');
        };
        animateCSS(id, 'fadeOut', FAST, callback, DELAY_2S);
    }
}

function showRemoveButton(currentIndex, groupIndex) {
    let id = getRemoveButtonId(currentIndex, groupIndex);

    if (!$(`#${id}`).hasClass('opacity-1')) {
        $(`#${id}`).removeClass('opacity-0 disabled').addClass('opacity-1');
        animateCSS(id, 'fadeIn', FAST);
    }
}

/* -------------------------------------------------------------------------------- */
/* RETRIEVE VALUES FROM COMPLEX_SEARCH_CONDITIONS */
/* -------------------------------------------------------------------------------- */
function tryGetComplexSearchConditionsItem(index, groupIndex, conditionType) {
    let _index = saveComplexSearchModel.Conditions.findIndex(x => x.ConditionType == conditionType && x.Index == index && x.GroupIndex == groupIndex);

    if (_index == -1)
        return null;

    return saveComplexSearchModel.Conditions[_index];
}

function tryGetConditionOperatorsItem(index) {
    let _index = saveComplexSearchModel.Conditions.findIndex(x => x.Index == index);

    if (_index == -1)
        return null;

    return saveComplexSearchModel.Conditions[_index];
}

function tryGetValueText(index, groupIndex, conditionType) {
    let item = tryGetComplexSearchConditionsItem(index, groupIndex, conditionType);
    if (item)
        return item.ValueText;
    else
        return null;
}

/* ################################################################################ */
/* BUILD FROM SAVED ONE */
/* ################################################################################ */
async function buildAndRunComplexSearchProcedureAsync(id) {
    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetSavedComplexSearchInfo, model);
    if (obj) {
        //buildAndRunComplexSearch(obj);
        if (buildComplexSearch(obj)) {
            setTimeout(() => { search(); }, 2 * DEFAULT_WAIT_ms);
        } else {
            setLoadingCircleIsVisible(false);
            showSimpleDialog(ERROR_LABEL, SavedComplexSearchInfoShowErrorMessage, ALERT);
        }

        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesRetrieveInfoErrorMessage, ALERT);
    }
}

async function buildComplexSearchProcedureAsync(id) {
    let model = {
        Id: id
    };

    let obj = await doAjaxGetAsync(UrlGetSavedComplexSearchInfo, model);
    if (obj) {
        buildComplexSearch(obj);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SavedComplexSearchesRetrieveInfoErrorMessage, ALERT);
    }
}

function buildComplexSearch(obj) {
    //console.log(obj);
    let isOk = true;

    /* save id of currently shown complex search */
    saveComplexSearchModel.Id = obj.Id;

    /* find max-value for Index */
    let indexMax = Math.max(...obj.Conditions.map(o => o.Index));

    /* try to add the top element for saving search */
    addComplexSearchTopBar(obj.Id);

    /* loop on groups */
    for (var i = 0; i <= indexMax; i++) {
        try {
            /* 1) build in-memory models */
            let items = obj.Conditions.filter(x => x.Index == i);
            items.forEach(x => {
                addConditionModel(buildConditionModel(x.Id, x.Index, x.ConditionType, x.MaterialType, x.ValueId, x.ValueText, x.ConditionOperatorType));
            });

            /* 2) build UI items */
            items.forEach(x => {
                if (x.ConditionOperatorType == CONDITION_OPERATOR_NONE) {
                    //console.log(`${x.ConditionType}, index: ${x.Index}, groupIndex: ${x.GroupIndex}`);
                    switch (x.ConditionType) {
                        case CONDITION_TYPE_MATERIAL:
                            if (x.GroupIndex == 0)
                                addConditionMaterial(x.ConditionType, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionMaterialItem(x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_MINERAL_TYPE:
                            if (x.GroupIndex == 0)
                                addConditionSelectItem(x.ConditionType, x.ConditionType, mineralTypes, 'mineralTypes', selectMineralType, 'selectSampleDataType', SearchComplexConditionsOnMineralTypeLabel, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSelectItemOtherItems(x.ConditionType, mineralTypes, selectMineralType, x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_ORIGIN_TYPE:
                            if (x.GroupIndex == 0)
                                addConditionSelectItem(x.ConditionType, x.ConditionType, originTypes, 'originTypes', selectOriginType, 'selectSampleDataType', SearchComplexConditionsOnOriginTypeLabel, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSelectItemOtherItems(x.ConditionType, originTypes, selectOriginType, x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_SAMPLE_NAME:
                            if (x.GroupIndex == 0)
                                addConditionSampleName(x.ConditionType, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSampleNameItem(x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;

                        case CONDITION_TYPE_SAMPLE_TYPE:
                            if (x.GroupIndex == 0)
                                addConditionSelectItem(x.ConditionType, x.ConditionType, sampleTypes, 'sampleTypes', selectSampleDataType, 'selectSampleDataType', SearchComplexConditionsOnSampleDataTypeLabel, x.Index, x.GroupIndex);
                            else
                                setTimeout(() => { addConditionSelectItemOtherItems(x.ConditionType, sampleTypes, selectSampleDataType, x.Index, x.GroupIndex); }, DEFAULT_WAIT_ms);
                            break;
                    }
                }
            });
        } catch (e) {
            console.log(e);
            isOk = false;
            continueLoop = false;
        }
    }

    if (isOk) {
        let name = obj.Name;
        setTimeout(() => { setSearchName(name); }, DEFAULT_WAIT_ms);
        setTimeout(() => { setSaveComplexSearchModelSaved(true); }, 2 * DEFAULT_WAIT_ms);
    }

    return isOk;
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
async function executeComplexSearchAsync() {
    let model = {
        Id: saveComplexSearchModel.Id
    };

    loadPartialViewWithAjaxGet(UrlSearchComplex, model, 'searchResultsContainer');
}

/* -------------------------------------------------------------------------------- */
/* VALIDATION BEFORE START SEARCHING */
/* -------------------------------------------------------------------------------- */
function getError(conditionType, index, groupIndex, msg) {
    return {
        ConditionType: conditionType,
        Index: index,
        GroupIndex: groupIndex,
        Msg: msg
    };
}

function showErrors(errors) {
    let errorsNum = errors.length;
    for (var i = 0; i < errorsNum; i++) {
        switch (errors[i].ConditionType) {
            case CONDITION_TYPE_MATERIAL:
                showErrorMaterial(errors[i]);
                break;

            case CONDITION_TYPE_SAMPLE_NAME:
                showErrorSampleName(errors[i]);
                break;
        }
    }
}

function showErrorSampleName(error) {
    let id = `${error.ConditionType}${error.Index}${error.GroupIndex}`;
    setInputFieldErrorState(id, true)
}

function showErrorMaterial(error) {
    let inputid = `${error.ConditionType}Input${error.Index}${error.GroupIndex}`;

    setMaterialErrorState(inputid, true, error.Msg)
}

function validateFields() {
    let result1 = validateSampleNameTextFields();
    let result2 = validateMaterialTextFields();

    if (result1.IsOk && result2.IsOk)
        return true;
    else {
        if (result1.Errors && result1.Errors.length > 0)
            showErrors(result1.Errors);

        if (result2.Errors && result2.Errors.length > 0)
            showErrors(result2.Errors);
    }

    return false;
}

function validateMaterialTextFields() {
    let result = {
        IsOk: true,
        Errors: []
    };

    /* check whether empty text fields are present or not */
    let textItems = $(`#${CONDITION_TYPE_MATERIAL}${CONDITIONS_ITEMS}`).find(`input[type=text][id^="ConditionMaterial"]`);
    if (textItems.length == 0)
        return result;

    let textItemsNum = textItems.length;
    for (var i = 0; i < textItemsNum; i++) {
        let s = textItems[i].id.replace(`${CONDITION_TYPE_MATERIAL}Input`, '');
        let index = parseInt(s.charAt(0));
        let groupIndex = parseInt(s.charAt(1));
        /* 1) check whether text has been inserted or not */
        let text = $(`#${textItems[i].id}`).val();
        if (text == '') {
            result.Errors.push(getError(CONDITION_TYPE_MATERIAL, index, groupIndex, SearchFieldTextRequiredMessage));
            result.IsOk = false;
            continue;
        }

        /* 2) is previous check is passed, check whether list of suggestions has been retrieved or not */
        let relatedSelectItem = $(`#${textItems[i].id.replace('Input', '')}`);
        if (!$(`#${relatedSelectItem[0].id}`).val()) {
            result.Errors.push(getError(CONDITION_TYPE_MATERIAL, index, groupIndex, SearchSuggestionsNotRetrievedMessage));
            result.IsOk = false;
            continue;
        }
    }

    return result;
}

function validateSampleNameTextFields() {
    let result = {
        IsOk: true,
        Errors: []
    };

    /* check whether empty text fields are present or not */
    let items = saveComplexSearchModel.Conditions.filter(x => x.ConditionType == CONDITION_TYPE_SAMPLE_NAME && x.ConditionOperatorType == CONDITION_OPERATOR_NONE && x.ValueText == '');
    if (items.length == 0)
        return result;

    /* validate text fields */
    let itemsNum = items.length;
    for (var i = 0; i < itemsNum; i++) {

        result.Errors.push(getError(CONDITION_TYPE_SAMPLE_NAME, items[i].Index, items[i].GroupIndex, SearchSuggestionsNotRetrievedMessage));
        result.IsOk = false;
    }

    return result;
}

/* -------------------------------------------------------------------------------- */
/* MANAGE ERROR UI */
/* -------------------------------------------------------------------------------- */
function setMaterialErrorState(inputid, isError, msg) {
    if (isError) {
        addCLassToMetroUIElem(inputid, 'border-color-error');

        $(`#${inputid}Validation`).text(msg);
        $(`#${inputid}Validation`).removeClass('field-validation-valid').addClass('field-validation-invalid');
    } else {
        removeCLassToMetroUIElem(inputid, 'border-color-error');

        $(`#${inputid}Validation`).text('');
        $(`#${inputid}Validation`).removeClass('field-validation-invalid').addClass('field-validation-valid');
    }
}

function setInputFieldErrorState(id, isError) {
    if (isError) {
        addCLassToMetroUIElem(id, 'border-color-error');
        $(`#${id}Validation`).removeClass('field-validation-valid').addClass('field-validation-invalid');
    } else {
        removeCLassToMetroUIElem(id, 'border-color-error');
        $(`#${id}Validation`).removeClass('field-validation-invalid').addClass('field-validation-valid');
    }
}
