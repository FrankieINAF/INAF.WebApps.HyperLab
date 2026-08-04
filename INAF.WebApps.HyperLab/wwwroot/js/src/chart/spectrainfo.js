/* ---- RETRIEVE REQUIRED SPECTRUM ------------------------------------------------ */
async function tryGetRequiredSpectrumAsync(currentSpectrumType, requiredSpectrumType) {
    const spectrum = getSpectrumByNameAndSpectrumType(selectedSpectrumForProcessing.Name, currentSpectrumType);
    if (!spectrum)
        return null;

    const requiredSpectrum = getSpectrumByNameAndSpectrumType(selectedSpectrumForProcessing.Name, requiredSpectrumType);
    if (!requiredSpectrum) {
        const obj = await checkIsSpectrumOfTypeSavedOnCloudAsync(requiredSpectrumType, selectedSpectrumForProcessing.Name, false);
        if (!obj || !obj.IsOk)
            return null;

        return await downloadProcessedSpectrumAsync(requiredSpectrumType, obj.Id);
    }

    return requiredSpectrum;
}

/* ---- SET ----------------------------------------------------------------------- */
function addSpectrumInfo(spectrumInfo) {
    if (isSpectrumAvailableById(spectrumInfo.Id))
        return;

    spectraInfo.push(spectrumInfo);
}

function updateSpectrumInfoId(index, newId) {
    spectraInfo[index].Id = newId;
}

/* ---- FIND ---------------------------------------------------------------------- */
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

function findSpectrumByIdAndSpectrumType(id, spectrumType) {
    var queue = [];

    var root = getSpectrumById(id);
    if (root) queue.push(root);

    var rootChildren = getSpectraByParentId(id) || [];
    for (var i = 0; i < rootChildren.length; i++) {
        queue.push(rootChildren[i]);
    }

    while (queue.length > 0) {
        var spectrum = queue.shift();
        if (!spectrum)
            continue;

        if (spectrum.SpectrumType == spectrumType) {
            return spectrum;
        } else {
            var children = getSpectraByParentId(spectrum.Id) || [];
            for (var j = 0; j < children.length; j++) {
                queue.push(children[j]);
            }
        }
    }

    return null;
}

/* ---- GET ----------------------------------------------------------------------- */
function getAllSpectraTypesButRefOnes() {
    const spectraTypes = spectraInfo.map(x => x.SpectrumType);
    return spectraTypes.filter(x =>
        x != SPECTRUM_TYPE_REF &&
        x != SPECTRUM_TYPE_REF_WHITE);
}

function getSpectraForLegend() {
    const goodSpectraTypes = getAllSpectraTypesButRefOnes();


    const minGoodSpectrumType = Math.min(...goodSpectraTypes);

    return spectraInfo.filter(x =>
        x.SpectrumType == minGoodSpectrumType);
}

function getAllSpectraHavingSameNameByRawId(rawId) {
    let rawSpectrum = spectraInfo.find(x => x.Id == rawId);

    return spectraInfo.filter(x => x.Name == rawSpectrum.Name);
}

function getSpectraByName(filename) {
    return spectraInfo.filter(x => x.Name == filename);
}

function getSpectrumByNameAndSpectrumType(filename, spectrumType) {
    return spectraInfo.find(x => x.Name == filename && x.SpectrumType == spectrumType);
}

function getSpectraBySpectrumType(spectrumType) {
    return spectraInfo.filter(x => x.SpectrumType == spectrumType);
}

function getSpectraByParentId(parentId) {
    return spectraInfo.filter(x => x.ParentId == parentId);
}

function getSpectrumById(id) {
    return spectraInfo.find(x => x.Id == id);
}

function getSpectrumByLowerSpectrumTypeIdAndSpectrumType(id, spectrumType) {
    let spectrum = spectraInfo.find(x => x.Id == id);
    if (!spectrum)
        return null;

    let spectrumName = spectrum.Name;

    return spectraInfo.find(x => x.Name == spectrumName && x.SpectrumType == spectrumType);
}

function getSpectrumByName(filename) {
    return spectraInfo.find(x => x.Name == filename);
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

function getSpectrumBySeriesValueField(valueField) {
    const series = chart.getOption().series.find(x => x.valueField == valueField);
    if (!series)
        return null;

    return getSpectrumBySeriesName(series.name);
}

function getSpectrumBySpectrumType(spectrumType) {
    return spectraInfo.find(x => x.SpectrumType == spectrumType);
}

function getSpectrumIndexBySpectrumId(id) {
    return spectraInfo.findIndex(x => x.Id == id);
}

function getSpectrumIndexByIdAndSpectrumType(id, spectrumType) {
    return spectraInfo.findIndex(x => x.Id == id && x.SpectrumType == spectrumType);
}

function getSpectrumIndexByParentIdAndSpectrumType(parentId, spectrumType) {
    return spectraInfo.findIndex(x => x.ParentId == parentId && x.SpectrumType == spectrumType);
}

function getSpectrumNameBySpectrumId(id) {
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
    let childSpectrum = findSpectrumByIdAndSpectrumType(rawId, spectrumType);

    return (childSpectrum != null);
}

function isAnySpectrumByLowerSpectrumTypeIdAndSpectrumType(rawId, spectrumType) {
    let spectrum = getSpectrumByLowerSpectrumTypeIdAndSpectrumType(rawId, spectrumType);
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
        let index = getSpectrumIndexBySpectrumId(id);
        if (index < 0)
            return;
        /* remove spectrum info */
        removeSpectrumByIndex(index);
    });
}

function removeSpectrumByIndex(index) {
    return spectraInfo.splice(index, 1);
}

/* ################################################################################ */
/* SET SPECTRA VISIBILITY */
/* ################################################################################ */
function hideSpectraOtherThanType(spectrumType) {
    let spectraNum = spectraInfo.length;
    for (var i = 0; i < spectraNum; i++) {
        let series = findSeriesFromSpectrumId(spectraInfo[i].Id);
        if (!series)
            continue;

        if (spectraInfo[i].SpectrumType != spectrumType)
            hideSeries(series.name);
    }

    addMessage(SpectraHiddenMessage.replace('r_v', getSpectrumTypeDescription(spectrumType)), 3000, INFO);
}

function hideSpectraOtherThanTypes(spectrumTypes) {
    let spectraNum = spectraInfo.length;
    for (var i = 0; i < spectraNum; i++) {
        let series = findSeriesFromSpectrumId(spectraInfo[i].Id);
        if (!series)
            continue;

        if (!spectrumTypes.includes(spectraInfo[i].SpectrumType))
            hideSeries(series.name);
    }
}

function setSpectrumVisibilityByIdAndSpectrumType(id, spectrumType, isVisible) {
    let spectrum = findSpectrumByIdAndSpectrumType(id, spectrumType);
    if (!spectrum)
        return;

    let series = findSeriesFromSpectrumId(spectrum.Id);
    if (!series)
        return;

    if (isVisible)
        hideSeries(series.name);
    else {
        showSeries(series.name);
        addMessage(AutoSetSpectrumInvisibleMessage.replace('r_v', getSpectrumTypeDescription(spectrumType)), 3000, INFO);
    }
}

function setSpectrumVisibilityByName(name, isVisible) {
    let series = getSeries(name);
    if (!series)
        return;

    if (isVisible)
        showSeries(series.name);
    else
        hideSeries(series.name);
}