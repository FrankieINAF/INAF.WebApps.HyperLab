var requestedLevels = [];

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
        RequestedLevels: requestedLevels
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

    let model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleByMineralType, model, 'searchResultsContainer');
}

async function searchSimpleByOriginType() {
    let plugin = Metro.getPlugin('#selectOriginType', 'select');

    let model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleByOriginType, model, 'searchResultsContainer');
}

async function searchSimpleBySampleName() {
    let text = $('#selectSampleName').val();

    if (!text) {
        showSimpleDialog(WARNING_LABEL, SearchBySampleNameEmptyErrorMessage, WARNING);
        return;
    }

    let model = {
        Text: text,
        RequestedLevels: requestedLevels
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleGroupsBySampleName, model, 'searchResultsContainer');
}

async function searchSimpleBySampleType() {
    var plugin = Metro.getPlugin('#selectSampleDataType', 'select');

    var model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxPost(UrlSearchSimpleBySampleType, model, 'searchResultsContainer');
}