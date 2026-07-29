async function loadSpectraTypeColorsAsync() {
    let model = {
        Key: COLOR_WILDCARD
    };

    let url = UrlGetUserSettingsByWildcard;
    if (!await isPublicOrAuthorizedAsync())
        url = UrlGetColors;
    let obj = await doAjaxGetAsync(url, model);
    if (obj && obj.Responses && obj.IsOk) {
        spectraTypeColors = [];

        let colorsNum = obj.Responses.length;
        for (var i = 0; i < colorsNum; i++) {
            let key = obj.Responses[i].Key
                .replace('COLOR_', '')
                .replace('_DEFAULT', '')
                .toLowerCase();
            let spectrumTypeValue = await retrieveSpectrumTypeFromStringAsync(key);
            if (spectrumTypeValue == null) {

                return false;
            }
            //console.log(`spectrumTypeValue: ${spectrumTypeValue} - key: ${key} - color: ${obj.Responses[i].Value}`);
            let item = createSpectraTypeColorKeyValueItem(spectrumTypeValue, key, obj.Responses[i].Value);

            addOrUpdateSpectraTypeColoKeyValueItem(item);
        }
    } else {
        showSimpleDialog(ERROR_LABEL, ChartLoadSpectraTypeColorsErrorMessage, ALERT);
        return false;
    }

    return true;
}

/* -------------------------------------------------------------------------------- */
/* ---------- SPECTRA TYPE COLORS ---------- */
/* -------------------------------------------------------------------------------- */

function addOrUpdateSpectraTypeColoKeyValueItem(colorKeyValueItem) {
    let index = spectraTypeColors.findIndex(x => x.Key == colorKeyValueItem.Key);
    if (index == -1)
        spectraTypeColors.push(colorKeyValueItem);
    else
        spectraTypeColors[index].Value = colorKeyValueItem.Value;

    /* re-order array items by spectrumType value descending */
    spectraTypeColors.sort((col1, col2) => {
        return col1.SpectrumType - col2.SpectrumType;
    });
}

function createSpectraTypeColorKeyValueItem(spectrumTypeValue, key, color) {
    return {
        SpectrumType: spectrumTypeValue,
        Key: key,
        Value: `#${color}`
    }
}

function getSpectraTypeColorsKeyFromSpectrumType(spectrumType) {
    let item = spectraTypeColors.find(x => x.SpectrumType == spectrumType);
    if (item == null)
        return null;

    return item.Key;
}

function getSpectraTypeColorsValueFromSpectrumType(spectrumType) {
    let item = spectraTypeColors.find(x => x.SpectrumType == spectrumType);
    if (item == null)
        return null;

    return item.Value;
}

function getSpectrumTypeColor(spectrumTypeDescription) {
    try {
        let key = spectrumTypeDescription.replace(/\s/g, '').toLowerCase(); // fix spectrumType description, if needed

        let item = spectraTypeColors.find(x => x.Key == key);
        return item.Value;
    } catch (e) {
        console.log(`${getSpectrumTypeColor.name} - ex: ${e}`);
        return null;
    }
}

async function retrieveSpectrumTypeFromStringAsync(key) {
    try {
        return await window.dotNetHelper.invokeMethodAsync("retrieveSpectrumTypeFromString", key);
    } catch (e) {
        console.log(`${retrieveSpectrumTypeFromStringAsync.name} - ex: ${e}`);
    }
}