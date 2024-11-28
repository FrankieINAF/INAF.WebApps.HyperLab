/* ################################################################################ */
/* ANCILLARY FOR SEARCH-BY-MATERIAL */
/* ################################################################################ */
function getMaterialForSearch() {
    let model = null;

    if (!suggestions)
        return null;

    try {
        let selectedValues = Metro.getPlugin('#selectMaterial', 'select').getSelected();
        let selectedTexts = Metro.getPlugin('#selectMaterial', 'select').getSelectedText();

        if (suggestions['selectMaterial'].Minerals) {
            if (selectedValues && selectedTexts) {
                model = {
                    Id: parseInt(selectedValues[0]),
                    Text: selectedTexts[0],
                    Type: MATERIAL_TYPE_MINERAL,
                };
            }
        } else if (suggestions['selectMaterial'].Rocks) {

        } else if (suggestions['selectMaterial'].MeteorClasses) {

        }

        //console.log(model);
    } catch (e) {
        console.log(`getMaterialForSearch - ex: ${e}`);
        showSimpleDialog(ERROR_LABEL, SearchByMaterialErrorMessage, ALERT);
    }

    return model;
}

/* ################################################################################ */
/* SEARCH */
/* ################################################################################ */
async function searchSimpleByMaterial() {
    let model = getMaterialForSearch();

    if (!model)
        return;

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleGroupsByMaterial, model, 'searchResultsContainer');
}

async function searchSimpleByMineralType() {
    let plugin = Metro.getPlugin('#selectMineralType', 'select');

    let model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleByMineralType, model, 'searchResultsContainer');
}

async function searchSimpleByOriginType() {
    let plugin = Metro.getPlugin('#selectOriginType', 'select');

    let model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleByOriginType, model, 'searchResultsContainer');
}

async function searchSimpleBySampleName() {
    let text = $('#selectSampleName').val();

    if (!text) {
        showSimpleDialog(WARNING_LABEL, SearchBySampleNameEmptyErrorMessage, WARNING);
        return;
    }

    let model = {
        Text: text
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleGroupsBySampleName, model, 'searchResultsContainer');
}

async function searchSimpleBySampleType() {
    var plugin = Metro.getPlugin('#selectSampleDataType', 'select');

    var model = {
        Id: parseInt(plugin.val())
    };

    setLoadingCircleIsVisible(true);

    loadPartialViewWithAjaxGet(UrlSearchSimpleBySampleType, model, 'searchResultsContainer');
}