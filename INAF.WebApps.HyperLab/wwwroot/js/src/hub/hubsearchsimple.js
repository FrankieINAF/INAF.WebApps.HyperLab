
/* ################################################################################ */
/* ANCILLARY FOR SEARCH-BY-MATERIAL */
/* ################################################################################ */
function getMaterialForSearch() {
    let model = null;

    if (!suggestions)
        return null;

    try {
        let selectedValue = Metro.getPlugin('#selectMaterial', 'select').val();

        let tmp = selectedValue.split('_');
        let materialName = tmp[0];
        let type = tmp[0].slice(0, -1);

        let text = suggestions['selectMaterial'][materialName][Metro.getPlugin('#selectMaterial', 'select').val()];

        model = {
            Id: parseInt(tmp[1]),
            Text: text,
            Type: type,
            RequestedLevels: requestedLevelsSimple
        };
    } catch (e) {
        console.log(`getMaterialForSearch - ex: ${e}`);
        showSimpleDialog(ERROR_LABEL, SearchByMaterialErrorMessage, ALERT);
    }

    return model;
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
function searchSimpleByFilename() {
    let text = $('#selectFilename').val();

    executeSearchSimpleByFilename(text);
}

function searchSimpleByMaterial() {
    let model = getMaterialForSearch();

    if (!model)
        return;

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxJsonPost(UrlSearchSimpleGroupsByMaterial, model, 'searchResultsContainer');
}

function searchSimpleByMineralType() {
    let plugin = Metro.getPlugin('#selectMineralType', 'select');

    executeSearchSimpleByMineralType(parseInt(plugin.val()));
}

function searchSimpleByOriginType() {
    let plugin = Metro.getPlugin('#selectOriginType', 'select');

    executeSearchSimpleByOriginType(parseInt(plugin.val()));
}

function searchSimpleBySampleName() {
    let text = $('#selectSampleName').val();

    executeSearchSimpleBySampleName(text);
}

function searchSimpleBySampleType() {
    var plugin = Metro.getPlugin('#selectSampleDataType', 'select');

    executeSearchSimpleBySampleType(parseInt(plugin.val()));
}

/* -------------------------------------------------------------------------------- */
/* COMMON */
/* -------------------------------------------------------------------------------- */
function getModelFromPlugin(plugin) {
    return {
        Id: parseInt(plugin.val()),
        RequestedLevels: requestedLevelsSimple
    };
}

function setSearchField(searchType, value) {

}
