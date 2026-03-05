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

    if (SELECTED_SEARCH_TYPE == SEARCH_COMPLEX_TYPE) {
        /* retrieve index/groupIndex from last 2 chars of id */
        let currentIndex = parseInt(id.charAt(id.length - 2));
        let groupIndex = parseInt(id.charAt(id.length - 1));

        /* update condition model */
        updateConditionModelForMaterial(selectedId, selectedText, currentIndex, groupIndex, materialType);
    }
}
