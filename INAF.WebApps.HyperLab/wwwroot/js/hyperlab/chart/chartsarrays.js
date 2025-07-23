var familyIds = [];

function hideSpectraToBeHidden() {
    let spectraToBeHidden = chartSeries.filter(x => !x.isVisible);
    spectraToBeHidden.forEach(function (item) {
        dxChartHideSeries(chartContainer, item.name);
    });

    return spectraToBeHidden.length;
}

/* ################################################################################ */
/* CONSTANT LINES */
/* ################################################################################ */
var CHART_CONSTANT_LINES_ALIGNMENT = 'chartconstantlinesalignment';
var CHART_CONSTANT_LINES_FIT_POINTS = 'chartconstantlinesfitpoints';

function initConstantLines() {
    chartConstantLines = {};
}

function addOrUpdateConstantLines(taskConstantLines, constantLinesSpecies) {
    chartConstantLines[constantLinesSpecies] = taskConstantLines;
}

function getConstantLines() {
    let keys = Object.keys(chartConstantLines);

    let constantLines = [];
    keys.forEach(function (key) {
        constantLines = constantLines.concat(chartConstantLines[key]);
    });

    return constantLines;
}

function removeConstantLines(constantLinesSpecies) {
    delete chartConstantLines[constantLinesSpecies];
}

function resetShownConstantLines() {
    dxChartUpdateOption(chart, 'argumentAxis.constantLines', []);
}

function updateConstantLines() {
    dxChartUpdateOption(chart, 'argumentAxis.constantLines', getConstantLines());
}

function manageConstantLinesVisualization(selectedTabId) {
    /* manage vertical constant lines visualiztion */
    if (selectedTabId == OPTIONS_TITLE_ALIGNMENT) {
        if (isCheckboxChecked('alignmentCheckboxShowLines'))
            addOrUpdateConstantLines(getAlignmentConstantLines(), CHART_CONSTANT_LINES_ALIGNMENT);

        removeConstantLines(CHART_CONSTANT_LINES_FIT_POINTS);
    }

    if (selectedTabId == OPTIONS_TITLE_FIT) {
        if (isCheckboxChecked('fitChechboxShowLines'))
            addOrUpdateConstantLines(getFitPointsConstantLines(), CHART_CONSTANT_LINES_FIT_POINTS);

        removeConstantLines(CHART_CONSTANT_LINES_ALIGNMENT);
    }

    updateConstantLines();
}

/* ################################################################################ */
/* SPECTRA COLORS */
/* ################################################################################ */
async function loadSpectraTypeColorsAsync() {
    let model = {
        Key: COLOR_WILDCARD
    };

    let url = UrlGetUserSettingsByWildcard;
    if (!isUserAuthenticated)
        url = UrlGetDefaultColors;
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
            //console.log(`spectrumTypeValue: ${spectrumTypeValue} - key: ${key} - color: ${obj.Responses[i].Value}`);
            let item = createSpectraTypeColorKeyValueItem(spectrumTypeValue, key, obj.Responses[i].Value);

            addOrUpdateSpectraTypeColoKeyValueItem(item);
        }
    } else {
        showSimpleDialog(ERROR_LABEL, ChartLoadSpectraTypeColorsErrorMessage, ALERT);
    }
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
        console.log(`${getSpectraTypeColor.name} - ex: ${e}`);
        return null;
    }
}

async function retrieveSpectrumTypeFromStringAsync(key) {
    return await window.dotNetHelper.invokeMethodAsync("retrieveSpectrumTypeFromString", key);
}


/* ################################################################################ */
/* SPECTRA INFO */
/* ################################################################################ */
/* ---- SET ----------------------------------------------------------------------- */
function addSpectrumInfo(spectrumInfo) {
    if (isSpectrumAvailableById(spectrumInfo.Id))
        return;

    spectraInfo.push(spectrumInfo);
}

function updateSpectrumInfoId(index, newId) {
    spectraInfo[index].Id = newId;
}

/* ---- GET ----------------------------------------------------------------------- */
function findIdFromSpectrumTypeAndSpectrumSource(spectrumType) {
    return spectraInfo.filter(x => x.SpectrumType == spectrumType)
}

function findChildrenOf(id, spectrumType, spectrumSource) {
    let spectraToBeRemoved = spectraInfo.filter(x => x.Id != id);

    switch (spectrumSource) {
        case SPECTRUM_SOURCE_EXTERNAL:
            spectraToBeRemoved = spectraToBeRemoved.filter(x => x.SpectrumSource == SPECTRUM_SOURCE_EXTERNAL);
            break;

        default:
            spectraToBeRemoved = spectraToBeRemoved.filter(x => x.SpectrumSource == SPECTRUM_SOURCE_SLAB);
            break;
    }

    spectraToBeRemoved = spectraToBeRemoved.filter(x =>
        x.SpectrumType > spectrumType &&
        x.SpectrumType != SPECTRUM_TYPE_REF &&
        x.SpectrumType != SPECTRUM_TYPE_REF_WHITE)
        .map(x => x.Id);

    return spectraToBeRemoved;
}

function findChildrenOfIdsOtherThan(id, spectrumSource) {
    let spectraToBeRemoved = spectraInfo.filter(x => x.Id != id);

    switch (spectrumSource) {
        case SPECTRUM_SOURCE_EXTERNAL:
            spectraToBeRemoved = spectraToBeRemoved.filter(x => x.SpectrumSource != SPECTRUM_SOURCE_SLAB);
            break;

        default:
            spectraToBeRemoved = spectraToBeRemoved.filter(x => x.SpectrumSource != SPECTRUM_SOURCE_EXTERNAL);
            break;
    }

    spectraToBeRemoved = spectraToBeRemoved.filter(x =>
        x.SpectrumType > SPECTRUM_TYPE_RAW &&
        x.SpectrumType != SPECTRUM_TYPE_REF &&
        x.SpectrumType != SPECTRUM_TYPE_REF_WHITE)
        .map(x => x.Id);

    return spectraToBeRemoved;
}

function findSpectrumChildrenByIdProcedure(id) {
    familyIds = [];
    findSpectrumChildrenById(id);
}

function findSpectrumChildrenById(id) {
    let spectra = getSpectraByParentId(id);
    //console.log(`id: ${id} - found ${spectra.length} spectra`);
    if (spectra.length == 0)
        return;

    let spectraNum = spectra.length;
    for (var i = 0; i < spectraNum; i++) {
        familyIds.push(spectra[i].Id);
        findSpectrumChildrenById(spectra[i].Id)
    }
}

function getAllSpectraHavingSameNameByRawId(rawId) {
    let rawSpectrum = spectraInfo.find(x => x.Id == rawId);

    return spectraInfo.filter(x => x.Name == rawSpectrum.Name);
}

function getChildSpectrumByIdAndSpectrumType(spectrumId, spectrumType) {
    let childSpectrum;
    let continueLoop = true;

    let id = spectrumId;
    while (continueLoop) {
        let spectra = getSpectraByParentId(id);
        spectra.push(getSpectrumByIdAndSpectrumType(id, spectrumType));
        if (spectra.length == 0)
            continueLoop = false;
        else {
            let spectraNum = spectra.length;
            for (var i = 0; i < spectraNum; i++) {
                if (spectra[i].SpectrumType == spectrumType) {
                    childSpectrum = spectra[i];
                    continueLoop = false;
                }
                else
                    id = spectra[i].Id;
            }
        }
    }

    return childSpectrum;
}

function getChildSpectrumByRawIdAndSpectrumType(rawId, spectrumType) {
    let childSpectrum;
    let continueLoop = true;

    let id = rawId;
    while (continueLoop) {
        let spectra = getSpectraByParentId(id);
        if (spectra.length == 0)
            continueLoop = false;
        else {
            const spectraNum = spectra.length;
            for (var i = 0; i < spectraNum; i++) {
                if (spectra[i].SpectrumType == spectrumType) {
                    childSpectrum = spectra[i];
                    continueLoop = false;
                }
                else
                    id = spectra[i].Id;
            }
        }
    }

    return childSpectrum;
}

function getAncestorSpectrumByIdAndSpectrumType(id, spectrumType) {
    let continueLoop = true;
    let spectrum = getSpectrumByIdAndSpectrumType(id, spectrumType);
    let ancestorSpectrumId = spectrum.ParentId;
    while (continueLoop) {
        let ancestorSpectrum = getParentSpectrumById(ancestorSpectrumId);
        if (ancestorSpectrum == null)
            continueLoop = false;
        else {
            ancestorSpectrumId = ancestorSpectrum.Id;
            if (ancestorSpectrumId == selectedSpectrumForProcessingId)
                continueLoop = false;
        }
    }

    return ancestorSpectrumId;
}

function getSpectraBySpectrumType(spectrumType) {
    return spectraInfo.filter(x => x.SpectrumType == spectrumType);
}

function getSpectraByParentId(parentId) {
    return spectraInfo.filter(x => x.ParentId == parentId);
}

function getSpectrumByIdAndSpectrumType(id, spectrumType) {
    return spectraInfo.find(x => x.Id == id && x.SpectrumType == spectrumType);
}

function getParentSpectrumById(id) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    if (spectrum == null)
        return null;

    if (spectrum.ParentId == null)
        return null;

    return spectraInfo.find(x => x.Id == spectrum.ParentId);
}

function getSpectrumByRawIdAndSpectrumType(rawId, spectrumType) {
    let spectrum;

    let rawSpectrum = spectraInfo.find(x => x.Id == rawId);
    let rawSpectrumName = rawSpectrum.Name;

    spectrum = spectraInfo.find(x => x.Name == rawSpectrumName && x.SpectrumType == spectrumType);

    return spectrum;
}

function getSpectrumBySeriesName(seriesName) {
    let tmp = seriesName.split(' ');
    if (tmp.length < 2)
        return null;

    const spectrumName = tmp[0];
    const spectrumTypeString = tmp[1].replace('(', '').replace(')', '');
    const spectrumType = getSpectrumTypeValue(spectrumTypeString);

    return spectraInfo.find(x => x.Name == spectrumName && x.SpectrumType == spectrumType);
}

function getSpectrumBySpectrumType(spectrumType) {
    return spectraInfo.find(x => x.SpectrumType == spectrumType);
}

function getSpectrumIndexById(id) {
    return spectraInfo.findIndex(x => x.Id == id);
}

function getSpectrumIndexByIdAndSpectrumType(id, spectrumType) {
    return spectraInfo.findIndex(x => x.Id == id && x.SpectrumType == spectrumType);
}

function getSpectrumIndexByParentIdAndSpectrumType(parentId, spectrumType) {
    return spectraInfo.findIndex(x => x.ParentId == parentId && x.SpectrumType == spectrumType);
}

function getSpectrumInfoById(id) {
    return spectraInfo.find(x => x.Id == id);
}

function getSpectrumNameById(id) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    return spectrum.Name;
}

function getSpectrumSeriesNameFromIndex(index) {
    return `${spectraInfo[index].Name} (${getSpectrumTypeDescription(spectraInfo[index].SpectrumType)})`;
}

function getSpectrumSeriesNameFromSpectrum(spectrumInfo) {
    return `${spectrumInfo.Name} (${getSpectrumTypeDescription(spectrumInfo.SpectrumType)})`;
}

function getSpectrumTypeById(id) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    return getSpectrumTypeDescription(spectrum.SpectrumType);
}

function getSpectrumTypeValueBySeriesName(seriesName) {
    let spectrumType = SPECTRUM_TYPE_NONE;

    let spectraNum = spectraInfo.length;
    for (var i = 0; i < spectraNum; i++) {
        let currentSeriesName = getSpectrumSeriesNameFromIndex(i);
        if (currentSeriesName == seriesName) {
            spectrumType = spectraInfo[i].SpectrumType;
            break;
        }
    }

    return spectrumType;
}

function getSpectrumTypeValueById(id) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    return spectrum.SpectrumType;
}

function initSpectraInfo() {
    spectraInfo = [];
}

function isAnySpectrumChildById(id) {
    findSpectrumChildrenByIdProcedure(id);
    return (familyIds.length > 0);
}

function isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(rawId, spectrumType) {
    let childSpectrum = getChildSpectrumByRawIdAndSpectrumType(rawId, spectrumType);

    return (childSpectrum != null);
}

function isAnySpectrumByRawIdAndSpectrumType(rawId, spectrumType) {
    let spectrum = getSpectrumByRawIdAndSpectrumType(rawId, spectrumType);
    return (spectrum != null);
}

function isSpectrumAvailableById(id) {
    return (spectraInfo.findIndex(x => x.Id == id) > -1);
}

function isSpectrumAvailableByIdAndType(id, spectrumType) {
    return (spectraInfo.findIndex(x => x.Id == id && x.SpectrumType == spectrumType) > -1);
}

function isSpectrumAvailableByType(spectrumType) {
    return (spectraInfo.findIndex(x => x.SpectrumType == spectrumType) > -1);
}

function removeSpectraById(ids) {
    ids.forEach(function (id) {
        let index = getSpectrumIndexById(id);
        if (index > -1) {
            /* retrieve id on chart series */
            const seriesId = buildId(id);
            /* remove chart series */
            removeChartSeriesByFieldId(chartContainer, seriesId);
            /* remove spectrum info */
            removeSpectrumByIndex(index);
        }
    });
}

function removeSpectrumByIndex(index) {
    return spectraInfo.splice(index, 1);
}

/* ################################################################################ */
/* CHARTS SERIES ITEMS */
/* ################################################################################ */
function addChartSeriesItems(items, xValues, yValues, seriesName) {
    let xValuesNum = xValues.length;
    for (var i = 0; i < xValuesNum; i++) {
        let index = items.findIndex(p => p.X == xValues[i]);
        if (index > -1) {
            items[index][seriesName] = yValues[i];
        }
    }
}

function deleteChartSeriesItems(items, seriesName) {
    items.forEach(function (item) {
        delete item[seriesName];
    });
}

/* ################################################################################ */
/* CHARTS SERIES */
/* ################################################################################ */
function addChartSeries(series) {
    if (chartSeries.findIndex(x => x.name == series.name) == -1)
        chartSeries.push(series);
}

function findChartSeriesIndexByValueFieldId(valueField) {
    return chartSeries.findIndex(x => x.valueField == valueField);
}

function findChartSeriesIndexByName(name) {
    return chartSeries.findIndex(x => x.name == name);
}

function getSeriesColor(id) {
    let index = getSpectrumIndexById(id);
    if (index < 0)
        return;

    if (spectraInfo[index].Color)
        return spectraInfo[index].Color;
    else {
        let index2 = dxChartGetAllSeries(chartContainer).findIndex(x => x.name == createSeriesNameFromSpectrumNameAndType(spectraInfo[index].Name, spectraInfo[index].SpectrumType));
        if (index2 < 0)
            return;
        return dxChartGetAllSeries(chartContainer)[index2].getColor();
    }
}

function getSeriesFromId(id) {
    let seriesName = getSeriesNameFromId(id);
    return dxChartGetSeriesByName(chartContainer, seriesName);
}

function getSeriesIndexByValueField(valueField) {
    return chartSeries.findIndex(x => x.valueField == valueField);
}

function getSeriesNameFromId(id) {
    let index = getSpectrumIndexById(id);
    return getSpectrumSeriesNameFromIndex(index);
}

function getSeriesPoints(id) {
    let index = getSpectrumIndexById(id);
    if (index < 0)
        return;

    return dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromIndex(index));
}

function removeChartSeriesAt(index) {
    if (index < 0)
        return;

    chartSeries.splice(index, 1);
}

function initChartSeries() {
    chartSeries = [];
}

function isChartSeriesAvailableByName(name) {
    let index = chartSeries.findIndex(x => x.name == name);
    return (index > -1);
}

/* ################################################################################ */
/* COMPLEX OPERATIONS ON CHARTS SERIES */
/* ################################################################################ */
function removeChartSeriesByFieldId(chartContainer, fieldId) {
    let items = dxChartGetItems(chartContainer);

    dxChartBeginUpdate(chartContainer);

    /* remove series */
    let index = findChartSeriesIndexByValueFieldId(fieldId);
    if (index > -1) {
        removeChartSeriesAt(index);
        deleteChartSeriesItems(items, fieldId);
        dxChartUpdateSeries(chartContainer, chartSeries);
    }

    dxChartEndUpdate(chartContainer);
}

function removeChartSeriesByFieldIdProcedure(chartContainer, items, fieldId) {
    dxChartBeginUpdate(chartContainer);

    /* remove series */
    let index = findChartSeriesIndexByValueFieldId(fieldId);
    if (index > -1) {
        removeChartSeriesAt(index);
        deleteChartSeriesItems(items, fieldId);
        dxChartUpdateSeries(chartContainer, chartSeries);
    }

    dxChartEndUpdate(chartContainer);
}

function removeChartSeriesByFieldsIdProcedure(chartContainer, fieldsId) {
    let items = dxChartGetItems(chartContainer);
    dxChartBeginUpdate(chartContainer);
    fieldsId.forEach(function (fieldId) {
        /* remove series */
        let index = findChartSeriesIndexByValueFieldId(fieldId);
        if (index > -1) {
            removeChartSeriesAt(index);
            deleteChartSeriesItems(items, fieldId);
            dxChartUpdateSeries(chartContainer, chartSeries);
        }
    });
    dxChartEndUpdate(chartContainer);
}

function removeChartSeriesByNameProcedure(chartContainer, seriesName) {
    /* remove series */
    let index = findChartSeriesIndexByName(seriesName);
    if (index > -1) {
        removeChartSeriesAt(index);
        dxChartUpdateSeries(chartContainer, chartSeries);
    }
}

function removePointsFromChart(chartContainer, xValues, seriesName) {
    let items = dxChartGetItems(chartContainer);

    dxChartBeginUpdate(chartContainer);

    let xValuesNum = xValues.length;
    for (var i = 0; i < xValuesNum; i++) {
        let index = items.findIndex(p => p.X == xValues[i]);
        if (items[index][seriesName])
            delete items[index][seriesName];
    }

    dxChartEndUpdate(chartContainer);

    dxChartRefresh(chartContainer);
}
