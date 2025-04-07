var requestedLevelsSimple = [];

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
async function searchSimpleByFilename() {
    let text = $('#selectFilename').val();

    if (!text) {
        showSimpleDialog(WARNING_LABEL, SearchByFilenameEmptyErrorMessage, WARNING);
        return;
    }

    let model = {
        Text: text,
        RequestedLevels: requestedLevelsSimple
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleGroupsByFilename, model, 'searchResultsContainer');

}

async function searchSimpleByMaterial() {
    let model = getMaterialForSearch();

    if (!model)
        return;

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleGroupsByMaterial, model, 'searchResultsContainer');
}

async function searchSimpleByMineralType() {
    let plugin = Metro.getPlugin('#selectMineralType', 'select');

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleByMineralType, getModelFromPlugin(plugin), 'searchResultsContainer');
}

async function searchSimpleByOriginType() {
    let plugin = Metro.getPlugin('#selectOriginType', 'select');

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleByOriginType, getModelFromPlugin(plugin), 'searchResultsContainer');
}

async function searchSimpleBySampleName() {
    let text = $('#selectSampleName').val();

    if (!text) {
        showSimpleDialog(WARNING_LABEL, SearchBySampleNameEmptyErrorMessage, WARNING);
        return;
    }

    let model = {
        Text: text,
        RequestedLevels: requestedLevelsSimple
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleGroupsBySampleName, model, 'searchResultsContainer');
}

async function searchSimpleBySampleType() {
    var plugin = Metro.getPlugin('#selectSampleDataType', 'select');

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleBySampleType, getModelFromPlugin(plugin), 'searchResultsContainer');
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
