var CHARMS_WIDTH = 500;

var IS_SAVED_ON_CLOUD = 'IsSavedOnCloud';

/* define fake parent Ids for processed spectra */
var SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID = 'aligned_id';
var SPECTRUM_OF_TYPE_CONTINUUM_TEMP_ID = 'continuum_id';
var SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID = 'continuumremoved_id';
var SPECTRUM_OF_TYPE_SMOOTHED_BY_SEGMENTS_TEMP_ID = 'smoothed_bySegments_id';
var SPECTRUM_OF_TYPE_SMOOTHED_WHOLE_SPECTRUM_TEMP_ID = 'smoothed_wholeSpectrum_id';

var isCharmsResetRequested = true;

var isSLabSpectrumCurrentlySelected = true;
var isSLabLowerSpectrumTypeHigherThanRaw = false;

var selectedSpectrumForProcessing = null;
var oldSelectedSpectrumForProcessing = null;

var availableFilesOnCloudDictionary = {};

/* save list of spectra Id to being processed */
var spectraForProcessingIds = [];

/* dictionary for associating each available SpectrumType with it parent SpectrumType */
var spectraTypesParents = {};

var isBuildingUpContinuum = false;

function isSLabConditionForSpectrumTypeHigherThanRaw() {
    return isSLabSpectrumCurrentlySelected && isSLabLowerSpectrumTypeHigherThanRaw;
}

function isSLabConditionForSpectrumTypeNotHigherThanRaw() {
    return isSLabSpectrumCurrentlySelected && !isSLabLowerSpectrumTypeHigherThanRaw;
}

/* ################################################################################ */
/* MANAGE CHARMS OPENING/CLOSING */
/* ################################################################################ */
async function closeCharmsProcessSpectraAsync(isUserPermissionRequested = true) {

    let callbackAsync = async function () {
        setLoadingCircleIsVisible(true);

        /* remove button for managing spectrumType-color relationship */
        removeCharmsColorSelectorButtonProcedure();

        /* restore old color for selected spectrum, removing spectrumType-color relationship */
        restoreOldSpectraColor();

        /* reset panels */
        resetCharmsProcessSpectra();

        /* remove white spectra used for alignment */
        unloadWhiteSpectraForAlignment();

        /* remove spectra created during selected spectrum processing */
        await removeSpectraProcedureSimpleAsync();

        /* close charms */
        isCharmsResetRequested = true;
        hideCharmsProcessSpectra();

        setLoadingCircleIsVisible(false);
    };

    if (isUserPermissionRequested) {
        let timeoutCallback = function () {
            setTimeout(async function () {
                callbackAsync();
            }, 200);
        };

        askAndExecute(CharmsSpectraProcessingManagementLabel, CharmsCloseWarningMessage, timeoutCallback);
    }
    else
        await callbackAsync();
}

function hideCharmsProcessSpectra() {
    isCharmsResetRequested = false;

    Metro.charms.close('#charmsProcessSpectra');
}

function isCharmsProcessSpectraOpen() {
    return Metro.charms.isOpen('#charmsProcessSpectra');
}

function onCharmsProcessSpectraClosed() {
    /* resize chart */
    updateChartSize();

    /* restore logout button original position */
    $('#logoutButton').removeClass('margin-right-500');

    if (!isCharmsResetRequested)
        return;

    /* init the id of the selected RAW spectrum for processing */
    selectedSpectrumForProcessing.Id = 0;

    /* disable saving on cloud checkbox 'alignmentCheckboxShowLines' value */
    isCheckboxForShowSegmentsValueToBeSavedOnCloud = false;

    /* remove spectra list from selector */
    $('#spectrumSelectionContainer').empty();

    /* remove event fir checkbox */
    $("#alignmentCheckboxShowLines").off();

    removeEnlargeButtonProcedure();
}

function onCharmsProcessSpectraOpened() {
    if (isCharmsResetRequested) {
        /* if requested, show lines for alignment */
        if (isCheckboxChecked('alignmentCheckboxShowLines'))
            $("#alignmentCheckboxShowLines").trigger("click");

        /* fill selector for available RAW files */
        loadSpectraToBeProcessed();

        /* move logout button to make it visible */
        $('#logoutButton').addClass('margin-right-500');

        addEnlargeButton();

        isCharmsResetRequested = false;
    }
}

function openCharmsProcessSpectra() {
    let w = $('#renderbody').width();

    w -= (CHARMS_WIDTH);

    $('#charts').css({ width: `${w}px` });
    //$('#charts').css({ transition: TRANSITION_SHORTHAND });
    //$('#charts').css({ transform: `translate(-${(CHARMS_WIDTH - 100)}, 0)` });

    Metro.charms.open('#charmsProcessSpectra');
}

function resetCharmsProcessSpectra() {
    /* reset selected spectrum for processing id */
    Metro.getPlugin('#charmsSpectrumSelector', 'select').val(0);

    /* hide tabs */
    hideByClassDFlexItem('charmsTabsContainer');

    /* hide message about RAW file selection */
    showByClassDFlexItem('charmsTabAlignmentStartingMessageContainer');

    /* remove all UI elements from alignment panel */
    $('#alignmentOptionsPanel').empty();

    /* remove all UI elements from fit panel */
    $('#fitOptionsPanel').empty();

    /* remove all UI elements from smoothing panel */
    $('#smoothingoptions').empty();

    /* clear list of segments for band analysis */
    $('#bandsAnalysisSegmentsListContainer').empty();
    /* clear all band analysis related elements on chart */
    clearBandAnalysisProcedureCaller();
}

function showTabsContainer(callback) {
    /* show tabs with animation */
    showByClass('charmsTabsContainer');
    animateCSS('charmsTabsContainer', 'fadeIn', FASTER, callback);
}

/* ################################################################################ */
/* COMMON PROCEDURES (FOR SLAB/EXTERNAL FILES) */
/* ################################################################################ */
function buildSpectrum(id, parentId, name, spectrumLevel, spectrumType, spectrumSource) {
    return {
        Id: id,
        ParentId: parentId,
        Name: name,
        SpectrumLevel: spectrumLevel,
        SpectrumType: spectrumType,
        SpectrumSource: spectrumSource,
        InsertDateTimeJs: 0
    };
}

function buildSpectrumFile(parentId, name, spectrumLevel, spectrumType, spectrumSource, xml) {
    return {
        Id: 0,
        Filename: name,
        ParentId: fixId(parentId),
        Type: spectrumType,
        Level: spectrumLevel,
        Source: spectrumSource,
        Xml: xml
    };
}

function buildParentFile(id) {
    let parentFile = getSpectrumById(id);

    let parentFileId = fixId(parentFile.Id);
    return {
        Id: parentFileId,
        Filename: parentFile.Name,
        Type: parentFile.SpectrumType,
        Level: parentFile.SpectrumLevel
    };
}

function fixId(id) {
    if (!Number.isFinite(id))
        id = 0;

    return id;
}

function getRefWhiteFile(type) {
    let parentFile = getSpectrumBySpectrumType(type);

    return {
        Id: parentFile.Id,
        Filename: parentFile.Name,
        Type: type,
        Level: parentFile.SpectrumLevel
    };
}

function getSpectrumAlignedProcedure() {
    if (isSLabSpectrumCurrentlySelected) {
        if (isSLabLowerSpectrumTypeHigherThanRaw) {
            return findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_ALIGNED);
        } else {
            return findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_ALIGNED);
        }
    } else {
        return findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_ALIGNED);
    }
}

function getSpectrumContinuumRemovedProcedure() {
    if (isSLabSpectrumCurrentlySelected) {
        return findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    } else {
        return findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, SPECTRUM_TYPE_ALIGNED);
    }
}

function restoreOldSpectraColor() {
    if (selectedSpectrumForProcessing.Id == 0)
        return; // if no spectrum is selected, then do nothing

    let selectedSpectrum = getSpectrumById(selectedSpectrumForProcessing.Id);
    if (!selectedSpectrum || !selectedSpectrum.oldColor)
        return; // if no old color is available, then do nothing

    /* restore old color for selected spectrum */
    updateSpectrumColor(selectedSpectrum, selectedSpectrum.oldColor);

    addMessage(CharmsSelectedSpectrumColorRestoreMessage, 3000, INFO);
}

function updateSpectrumColor(spectrum, color) {
    const seriesName = createSeriesNameFromSpectrumNameAndType(spectrum.Name, spectrum.SpectrumType)

    let index = findChartSeriesIndexByName(seriesName);
    if (index == -1)
        return;

    dxChartUpdateSeriesProperty(chartContainer, index, 'color', color);

    addMessage(CharmsSelectedSpectrumColorUpdateMessage, 3000, INFO);
}

/* ################################################################################ */
/* SPECTRA TYPES PARENTS */
/* ################################################################################ */
function getChildrenSpectraTypes(spectrumType) {
    const keys = Object.keys(spectraTypesParents).filter(
        key => spectraTypesParents[key] === spectrumType
    );

    return keys.map(key => parseInt(key));
}

function getParentSpectrumType(spectrumType) {
    return spectraTypesParents[spectrumType];
}

async function getSpectraTypesParentsAsync() {
    let obj = await doAjaxGetNoModelAsync(UrlGetSpectraTypesParents);
    if (obj) {
        let keys = Object.keys(obj);
        keys.forEach(function (key) {
            let value = obj[key];
            spectraTypesParents[parseInt(key)] = parseInt(value);
        });
    }
}

/* ################################################################################ */
/* CHARTS TO BE PROCESSED */
/* ################################################################################ */
function loadSpectraToBeProcessed() {
    /* close other charms, if opened */
    closeCharmsColorSelector();

    let lowerSpectrumType = SPECTRUM_TYPE_RAW;
    const slabSpectraForCheck = spectraInfo.filter(x => x.SpectrumSource == SPECTRUM_SOURCE_SLAB).map(x => x.SpectrumType);
    if (slabSpectraForCheck.length > 0) {
        lowerSpectrumType = Math.min(...slabSpectraForCheck);
        if (lowerSpectrumType > SPECTRUM_TYPE_RAW)
            isSLabLowerSpectrumTypeHigherThanRaw = true;
    }

    let spectraSLabType = spectraInfo.filter(x => x.SpectrumSource == SPECTRUM_SOURCE_SLAB && x.SpectrumType == lowerSpectrumType).map(x => { return x.Id });
    if (spectraSLabType && spectraSLabType.length > 0)
        spectraForProcessingIds.push(...spectraSLabType);

    let spectraExternalType = spectraInfo.filter(x => x.SpectrumSource == SPECTRUM_SOURCE_EXTERNAL).map(x => { return x.Id });
    if (spectraExternalType && spectraExternalType.length > 0)
        spectraForProcessingIds.push(...spectraExternalType);

    if (spectraForProcessingIds && spectraForProcessingIds.length > 0) {
        let html = ``;
        html += `<select id="charmsSpectrumSelector" data-role="select" `
        html += `data-cls-select="charms-select" `;
        html += `data-on-item-select="${onSelectSpectrum.name}">`;
        html += `<option value="0">${SelectItemLabel}</option>`;
        let spectraNum = spectraForProcessingIds.length;
        for (var i = 0; i < spectraNum; i++) {
            let index = getSpectrumIndexBySpectrumId(spectraForProcessingIds[i]);
            html += `<option value="${spectraForProcessingIds[i]}">${spectraInfo[index].Name}</option>`;
        }
        html += `</select>`;

        $('#spectrumSelectionContainer').html(html);

        if (spectraNum == 1) {
            /* if only one spectrum is available, then select it */
            setTimeout(function () {
                /* set selected file on UI */
                Metro.getPlugin('#charmsSpectrumSelector', 'select').val(spectraForProcessingIds[0]);
                /* start actions for selected spectrum */
                setSelectedSpectrumForProcessing(spectraForProcessingIds[0]);
            }, 1000);
        }
    }
}

function manageSpectraVisibility(selectedSpectrumId) {
    /* show selected spectrum */
    let seriesName = getSpectrumSeriesNameFromIndex(getSpectrumIndexBySpectrumId(selectedSpectrumId));
    dxChartShowSeries(chartContainer, seriesName);

    /* hide all other spectra */
    let spectraNum = spectraInfo.length;
    for (var i = 0; i < spectraNum; i++) {
        if (spectraInfo[i].Id != selectedSpectrumId) {
            dxChartHideSeries(chartContainer, getSeriesNameFromSpectrumId(spectraInfo[i].Id));
        }
    }
}

/* -------------------------------------------------------------------------------- */
/* SPECTRUM SELECTION MANGEMENT */
/* -------------------------------------------------------------------------------- */
async function manageTabsForSelectedSpectrumAsync(selectedSpectrum) {
    switch (selectedSpectrum.SpectrumType) {
        case SPECTRUM_TYPE_RAW:
            await loadAlignmentPanelProcedureAsync();
            break;

        case SPECTRUM_TYPE_ALIGNED:
            await loadAlignmentPanelProcedureAsync();
            await loadSmoothingPanelProcedureAsync();
            break;

        case SPECTRUM_TYPE_CONTINUUM_REMOVED:
            /* load alignment panel and download aligned spectrum together with its settings */
            await loadAlignmentPanelProcedureAsync();
            /* download aligned spectrum */
            await downloadProcessedSpectrumAsync(SPECTRUM_TYPE_ALIGNED);

            /* load fit panel and download continuum-removed settings */
            await loadFitPanelProcedureAsync();
            await downloadContinuumRemovalSettingsAsync(selectedSpectrum.Id);
            /* hide whites used for alignment */
            executeAfter(function () { setRefWhitesHidden(); }, 1000);
            break;

        case SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS:
        case SPECTRUM_TYPE_ALIGNED_SMOOTHED:
        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:
            const parentSpectrumType = await retrieveSpectrumTypeFromSpectrumId(selectedSpectrum.ParentId);
            /* load alignment panel */
            await loadAlignmentPanelProcedureAsync();
            switch (parentSpectrumType) {
                case SPECTRUM_TYPE_ALIGNED:
                    /* download aligned spectrum */
                    await downloadProcessedSpectrumAsync(SPECTRUM_TYPE_ALIGNED, selectedSpectrum.ParentId);
                    break;

                case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                    const spectrumId = await doAjaxGetAsync(UrlGetSpectrumParentIdById, { Id: selectedSpectrum.ParentId });
                    if (spectrumId == 0) {
                        showSimpleDialog(ERROR_LABEL, CharmsRetrieveParentSpectrumErrorMessage, ALERT);
                        return;
                    }
                    /* download aligned spectrum */
                    await downloadProcessedSpectrumAsync(SPECTRUM_TYPE_ALIGNED, spectrumId);
                    /* load fit panel */
                    await loadFitPanelProcedureAsync();
                    /* download continuum-removed spectrum */
                    await downloadProcessedSpectrumAsync(SPECTRUM_TYPE_CONTINUUM_REMOVED, selectedSpectrum.ParentId, false);
                    break;
                default:
            }

            await loadSmoothingPanelProcedureAsync();

            /* set the active tab as the smoothing one */
            setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_SMOOTHING);
            executeAfter(function () {
                /* hide all spectra but the selected one */
                hideSpectraOtherThanType(selectedSpectrum.SpectrumType);
                /* set selected spectrumType as target for smoothing */
                selectTargetSpectrumType();
            }, 500);
            break; 
    }
}

async function manageSelectedSpectrumAsync(selectedSpectrum, idsToBeRemoved) {
    /* remember the previous id value */
    oldSelectedSpectrumForProcessing = selectedSpectrumForProcessing;

    setLoadingCircleIsVisible(true);

    setTimeout(async function () {
        showTabsContainer();

        /* load from cloud relationships between each spectrum type and its parent */
        await getSpectraTypesParentsAsync();

        const parentSpectrumType = getParentSpectrumType(selectedSpectrum.SpectrumType);
        if (parentSpectrumType != null)
            checkIsSpectrumOfTypeSavedOnCloudAsync(parentSpectrumType, selectedSpectrum.Name, false);

        /* reset all variables and arrays used for fitting */
        initFit();

        /* manage selected tab visualization */
        setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_ALIGNMENT);

        /* hide message about RAW file selection */
        hideByClassDFlexItem('charmsTabAlignmentStartingMessageContainer');

        /* add button for managing spectrumType-color relationship */
        addCharmsColorSelectorButton();

        /* remove previous analysis and UI items, if available */
        if (idsToBeRemoved != null) {
            clearBandAnalysisProcedureCaller();

            /* disable tab for band analysis */
            setTabEnabled(3, false);

            /* remove previous fit points series */
            tryRemoveFitPointsSeries();

            /* remove spectra from chart */
            removeChartSeriesByFieldsIdProcedure(chartContainer, idsToBeRemoved);

            /* remove spectra from 'spectraInfo' (children of the selected one) */
            removeSpectraById(idsToBeRemoved);
        }

        /* update visibility for all spectra (set visible the selected one, invisible all the other ones) */
        manageSpectraVisibility(selectedSpectrumForProcessing.Id);

        if (selectedSpectrum.SpectrumSource == SPECTRUM_SOURCE_EXTERNAL || isSLabLowerSpectrumTypeHigherThanRaw) {
            setIsPointClickForFitEnabled(true);
            setJoystickVisible(true);
        }

        /* manage enabled/disabled tabs depending on SpectrumType of selected spectrum  */
        await manageTabsForSelectedSpectrumAsync(selectedSpectrum);

        /* reset visual range to allow lines out of current visual range to be visualized */
        dxChartResetVisualRange(chartContainer);

        setLoadingCircleIsVisible(false);
    }, 250);
}

function onSelectSpectrum(selected) {
    setSelectedSpectrumForProcessing(selected);
}

async function setSelectedSpectrumForProcessing(selected) {
    let selectedValue = Number.isFinite(selected) ? parseInt(selected) : selected;
    if (selectedSpectrumForProcessing && selectedValue == selectedSpectrumForProcessing.Id)
        return; // if we're opening charms and the selected spectrum is the already selected one, then do nothing

    /* remember new id of selected spectrum */
    //selectedSpectrumForProcessing.Id = selectedValue;

    selectedSpectrumForProcessing = getSpectrumById(selected);

    /* fix color for using spectrumType-color association */
    updateSelectedSpectrumColorToSpectrumTypeColor(selectedSpectrumForProcessing);
    addMessage(SpectrumTypeColorRelationshipMessage, 3000, INFO);

    if (selectedSpectrumForProcessing.SpectrumSource == SPECTRUM_SOURCE_EXTERNAL)
        isSLabSpectrumCurrentlySelected = false;

    /* find ids of spectra to be removed when changing selected spectrum */
    findSpectrumChildrenByIdProcedure(selectedSpectrumForProcessing.Id);
    if (isAnyItem(familyIds)) { // familyIds is filled-up during 'findSpectrumChildrenByIdProcedure'
        let callbackYes = async function () {
            await manageSelectedSpectrumAsync(selectedSpectrumForProcessing, familyIds);
        };
        let callbackNo = function () {
            selectedSpectrumForProcessing = oldSelectedSpectrumForProcessing;

            /* restore old selected spectrum, no different spectrum selection is set and nothing changes */
            Metro.getPlugin('#charmsSpectrumSelector', 'select').val(selectedSpectrumForProcessing.Id);
        };

        showDialogWithActions(WARNING_LABEL, CharmsDeleteProcessedSpectraQuestion, WARNING, YES_LABEL, NO_LABEL, callbackYes, callbackNo);
    } else
        await manageSelectedSpectrumAsync(selectedSpectrumForProcessing);
}

function updateSelectedSpectrumColorToSpectrumTypeColor(selectedSpectrum) {
    const seriesName = createSeriesNameFromSpectrumNameAndType(selectedSpectrum.Name, selectedSpectrum.SpectrumType)
    const color = getSpectrumTypeColor(getSpectrumTypeString(selectedSpectrum.SpectrumType));

    let index = findChartSeriesIndexByName(seriesName);
    if (index == -1)
        return;

    const oldColor = dxChartGetSeriesByName(chartContainer, seriesName).getColor();

    if (oldColor == color)
        return; // if color is the same, then do nothing

    selectedSpectrum.oldColor = oldColor; // save old color for restoring it later, if needed

    updateSpectrumColor(selectedSpectrum, color);

    addMessage(CharmsSelectedSpectrumColorUpdateMessage, 3000, INFO);
}

/* ################################################################################ */
/* MANAGE TEXT OF CLOUD ICON */
/* ################################################################################ */
function getTextIdFromSpectrumType(spectrumType) {
    let desc = getSpectrumTypeDescription(spectrumType);

    let temp = desc.split(' ');

    if (temp.includes('smoothed')) {
        // Normalize spectrumType: remove any prefix before the 'Smoothed' token so
        // downstream code always sees types that start with 'Smoothed' (e.g.
        // 'AlignedSmoothedBySegments' -> 'SmoothedBySegments').
        const smIndex = temp.indexOf('smoothed');
        if (smIndex > -1)
            temp = temp.slice(smIndex);
    }

    temp[0] = firstLetterLowerCase(temp[0]);

    if (temp.length > 0) {
        for (var i = 1; i < temp.length; i++) {
            temp[i] = firstLetterUpperCase(temp[i]);
        }
    }

    return temp.join('');
}

function setCloudTextAndIconStatus(spectrumType, isSpectrumFromCloud) {
    let temp = getTextIdFromSpectrumType(spectrumType);
    let textId = `${temp}CloudText`;
    let iconId = `${temp}CloudIcon`;

    if (isSpectrumFromCloud) {
        $(`#${iconId}`).removeClass('mif-cloud-download').addClass('mif-cloud');
        $(`#${textId}`).text(CharmsUsingAlreadySavedOnCloudMessage);
    } else {
        $(`#${iconId}`).removeClass('mif-cloud').addClass('mif-cloud-download');
        $(`#${textId}`).text(CharmsAlreadySavedOnCloudMessage);
    }

    $(`#${textId}`).addClass('ani-pass');
    setTimeout(function () { $(`#${textId}`).removeClass('ani-pass'); }, 5000);
}

/* ################################################################################ */
/* CLOUD TASKS */
/* ################################################################################ */
function addOrUpdateAvailableFileOnCloudDictionary(spectrumType, isOk, id) {
    const dictionaryItem = {
        IsOk: isOk,
        Id: id
    }
    availableFilesOnCloudDictionary[spectrumType] = dictionaryItem;
}

async function checkIsSpectrumOfTypeSavedOnCloudAsync(spectrumType, filename = null, isUIUpdateRequired = true) {
    if (!isUserAuthenticated)
        return null;

    let file;
    if (filename != null)
        file = getSpectrumByName(filename);
    else
        file = getSpectrumById(selectedSpectrumForProcessing.Id);

    if (file == null) {
        showSimpleDialog(WARNING_LABEL, CharmsRetrieveFileInfoErrorMessage, WARNING);
        return false;
    }

    let model = {
        Filename: file.Name,
        SpectrumType: spectrumType,
        SpectrumSource: file.SpectrumSource,
        SpectrumLevel: file.SpectrumLevel
    };

    let obj = await doAjaxGetAsync(UrlIsSpectrumTypeSavedOnCloud, model);
    if (obj) {
        //console.log(`checkIsSpectrumOfTypeSavedOnCloudAsync - spectrumType: ${spectrumType}, isOk: ${obj.IsOk}, id: ${obj.Id}`);
        addOrUpdateAvailableFileOnCloudDictionary(spectrumType, obj.IsOk, obj.Id);
        /* save status of spectrum in 'spectraInfo' */
        saveSavedOnCloudStatus(obj.IsOk, spectrumType);

        if (isUIUpdateRequired)
            /* show/hide icon on panel  */
            setCloudIconOnPanel(obj.IsOk, spectrumType);

        return obj;
    }
    else
        return null;
}

async function deleteRecursivelySpectrumChildrenOnCloudAsync(rawId, spectrumType) {
    let isRemovalOk = true;

    try {
        let model = {
            Id: rawId,
            SpectrumType: spectrumType
        };

        isRemovalOk = await doAjaxPostAsync(UrlDeleteRecursivelySpectrumChildren, model);
    } catch (e) {
        isRemovalOk = false;
        console.log(`deleteRecursivelySpectrumChildrenOnCloud - ex: ${e}`);
    }

    return isRemovalOk;
}

async function retrieveSpectrumTypeFromSpectrumId(id) {
    const model = { 
        Id: id
    };

    const obj = await doAjaxGetAsync(UrlGetSpectrumTypeById, model);
    if (obj && obj.IsOk) {
        return parseInt(obj.Value);
    } else {
        console.log(`${getSpectrumTypeFromSpectrumId.name} - error retrieving spectrum type for spectrum id: ${id}`);
        return 0;
    }
}

function isSpectrumOfTypeSavedOnCloud(spectrumType) {
    let spectrum = findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, spectrumType);
    if (!spectrum)
        return false;

    return spectrum.IsSavedOnCloud;
}

function saveSavedOnCloudStatus(isSavedOnCloud, spectrumType) {
    let spectrum = findSpectrumByIdAndSpectrumType(selectedSpectrumForProcessing.Id, spectrumType);
    if (!spectrum)
        return;

    spectrum.IsSavedOnCloud = isSavedOnCloud;
}

function setCloudIconOnPanel(isSavedOnCloud, spectrumType) {
    let temp = getTextIdFromSpectrumType(spectrumType);

    let divId = `${temp}SavedOnCloud`;

    (isSavedOnCloud ? showFlex(divId) : hide(divId));
}

/* -------------------------------------------------------------------------------- */
/* DOWNLOAD PROCESSED SPECTRUM */
/* -------------------------------------------------------------------------------- */
async function downloadProcessedSpectrumAsync(spectrumType, spectrumId = null, areBreaksVisible = true) {
    if (spectrumId == null)
        spectrumId = selectedSpectrumForProcessing.Id;

    //console.log(`downloadProcessedSpectrumAsync - spectrumId: ${spectrumId}, spectrumType: ${spectrumType}`);
    if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(spectrumId, spectrumType)) {
        let message;
        switch (spectrumType) {
            case SPECTRUM_TYPE_ALIGNED:
                message = AlignedNoDownloadBecauseAlreadyPresentMessage;
                break;
            case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                message = ContinuumRemovedNoDownloadBecauseAlreadyPresentMessage;
                break;
        }
        showSimpleDialog(WARNING_LABEL, message, WARNING);
        return;
    }

    if (!availableFilesOnCloudDictionary[spectrumType] || !availableFilesOnCloudDictionary[spectrumType].IsOk) {
        setLoadingCircleIsVisible(false);
        //console.log(`downloadProcessedSpectrumAsync - spectrumType: ${spectrumType} is not available on cloud`);
        return;
    }


    setLoadingCircleIsVisible(true);

    const model = {
        Id: availableFilesOnCloudDictionary[spectrumType].Id,
        SpectrumType: spectrumType
    }

    let obj = await doAjaxGetAsync(UrlGetProcessedSpectrumById, model);
    if (obj) {
        setLoadingCircleIsVisible(true); // trick for avoiding mysterious disappearing of loading

        /* save spectrum into 'spectraInfo' */
        //console.log(`downloadProcessedSpectrumAsync - saving spectrumType: ${spectrumType} with ParentId: ${obj.SpectraInfo.ParentId}`);
        addSpectrumInfo(obj.SpectraInfo);

        /* add processed spectrum to chart */
        addProcessedSpectrum(obj.SpectraInfo, obj.Points, spectrumType);

        switch (spectrumType) {
            case SPECTRUM_TYPE_ALIGNED:
                /* actions needed to update UI after aligned spectrum has been added */
                buildAlignedSpectrumCompleted();

                /* retrieve and show settings used for aligning currently selected spectrum */
                await downloadAlignmentSettingsAsync(obj.SpectraInfo.Id);
                break;

            case SPECTRUM_TYPE_CONTINUUM_REMOVED:
                /* actions needed to update UI after aligned spectrum has been added */
                buildContinuumRemovedSpectrumCompleted(areBreaksVisible);

                /* retrieve and show settings used for removing continuum from currently selected spectrum */
                isBuildingUpContinuum = true; // used to avoid removing loading while building up continuum
                selectedSpectrumTypeForContinuumRemoval = SPECTRUM_TYPE_ALIGNED; // used for building up points for continuum
                await downloadContinuumRemovalSettingsAsync(obj.SpectraInfo.Id, areBreaksVisible);
                break;

            case SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS:
            case SPECTRUM_TYPE_ALIGNED_SMOOTHED:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
            case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:

                break;

            default:
        }

        /* set text of cloud icon */
        setCloudTextAndIconStatus(spectrumType, true);

        if (!isBuildingUpContinuum)
            setLoadingCircleIsVisible(false);

        return obj.SpectraInfo;
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, CharmsCloudDownloadErrorMessage, ALERT);
        return null;
    }
}

/* ################################################################################ */
/* REMOVE FILE COMMMON */
/* ################################################################################ */
async function removeSpectraProcedureAsync(spectrumType, dialogId, checkboxId) {
    if (dialogId)
        Metro.dialog.close(`#${dialogId}`);

    setLoadingCircleIsVisible(true);

    executeAfter(async function () {
        /* retrieve all spectra, children of selected RAW spectrum, ordered in descending order */
        let spectra = buildFamilyTreeForSpectrum(selectedSpectrumForProcessing.Id);

        if (spectra.length == 0) {
            setLoadingCircleIsVisible(false);
            return;
        }

        /* filter only spectra with spectrumType greater than or equal to the selected one for being removed */
        let spectraToBeRemoved = spectra.filter(x => x.SpectrumType >= spectrumType);

        if (spectraToBeRemoved.length == 0) {
            setLoadingCircleIsVisible(false);
            return;
        }

        /* check whether removal on cloud is requested or not */
        let isRemovalOnCloudRequested = false;
        if (checkboxId)
            isRemovalOnCloudRequested = isCheckboxChecked(checkboxId);

        /* loop on spectraToBeRemoved for removing them */
        spectraToBeRemoved.forEach(async function (spectrumToBeRemoved) {
            await removeSpectrumProcedureAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
        });

        /* if removal on cloud is requested, then we have to remove all spectra obtained by next processing steps */
        if (isRemovalOnCloudRequested)
            await deleteRecursivelySpectrumChildrenOnCloudAsync(selectedSpectrumForProcessing.Id, spectrumType);

        setLoadingCircleIsVisible(false);
    }, JS_DELAY_200);
}

async function removeSpectraProcedureSimpleAsync() {
    /* retrieve all spectra, children of selected RAW spectrum, ordered in descending order */
    let spectra = buildFamilyTreeForSpectrum(selectedSpectrumForProcessing.Id);

    if (spectra.length == 0)
        return;

    /* loop on spectraToBeRemoved for removing them */
    spectra.forEach(async function (spectrumToBeRemoved) {
        await removeSpectrumProcedureAsync(spectrumToBeRemoved);
    });

    hideSpectraToBeHidden();

    dxChartRefresh(chartContainer);
    dxChartResetVisualRange(chartContainer);
}

async function removeSpectrumProcedureAsync(spectrumToBeRemoved, isRemovalOnCloudRequested = false) {
    switch (spectrumToBeRemoved.SpectrumType) {
        case SPECTRUM_TYPE_ALIGNED:
            await removeAlignedSpectrumAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
            break;

        case SPECTRUM_TYPE_CONTINUUM_REMOVED:
            await removeContinuumRemovedSpectrumAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
            removeContinuum();
            break;

        case SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS:
        case SPECTRUM_TYPE_ALIGNED_SMOOTHED:
        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS:
        case SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED:
            removeSmoothedSpectrumAsync(spectrumToBeRemoved, isRemovalOnCloudRequested);
            break;
    }
}

function buildFamilyTreeForSpectrum(id) {
    findSpectrumChildrenByIdProcedure(id);

    let spectra = [];
    familyIds.forEach(function (id) {
        spectra.push(getSpectrumById(id));
    });

    /* re-order array items */
    spectra.sort((spectrum1, spectrum2) => {
        return spectrum2.SpectrumType - spectrum1.SpectrumType;
    });

    return spectra;
}

async function getChildrenSpectraTypesAsync(spectrumType) {
    return await doAjaxGetNoModelAsync(`${UrlGetChildrenSpectraTypes}?SpectrumTypeId=${spectrumType}`);
}

function getIsSpectrumSavedOnCloud(spectrumType) {
    let index = getSpectrumIndexByParentIdAndSpectrumType(selectedSpectrumForProcessing.Id, spectrumType);

    /* check whether aligned spectrum has been saved on cloud or not */
    let isSpectrumSavedOnCloud = false;
    try {
        if (spectraInfo[index][IS_SAVED_ON_CLOUD])
            isSpectrumSavedOnCloud = spectraInfo[index][IS_SAVED_ON_CLOUD];
    } catch (e) { }

    return isSpectrumSavedOnCloud;
}

/* show dialog for asking user whether spectrum is to be deleted or not */
function askForRemovingSpectrum(spectrumType, checkBoxId, dialogId) {
    let isSpectrumSavedOnCloud = getIsSpectrumSavedOnCloud(spectrumType);

    /* if aligned spectrum has been saved on cloud, then show checkbox for removing it from cloud */
    if (isSpectrumSavedOnCloud && checkBoxId)
        showFlexElemMetroUIElem(checkBoxId);

    /* open dialog for removing aligned spectrum */
    if (dialogId)
        Metro.dialog.open(`#${dialogId}`);
}

function removeSpectrumFromChart(seriesname, id) {
    /* remove from series and chart */
    let idItem = buildId(id);

    dxChartBeginUpdate(chartContainer);

    /* remove from chart points */
    let items = dxChartGetItems(chartContainer);
    if (items && items.length > 0) {
        let itemsNum = items.length;
        for (var i = 0; i < itemsNum; i++) {
            if (items[i][idItem])
                delete items[i][idItem];
        }
    }

    /* remove from series */
    let seriesNum = chartSeries.length;
    for (var i = 0; i < seriesNum; i++) {
        if (chartSeries[i].name == seriesname) {
            removeChartSeriesAt(i);
            break;
        }
    }
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    /* reset visual range to make ref whites appear in chart */
    dxChartResetVisualRange(chartContainer);
}

async function removeSpectrumOnCloudAsync(id) {
    let isRemovalOk = true;

    try {
        const model = {
            Id: id
        };

        isRemovalOk = await doAjaxPostAsync(UrlDeleteSpectrum, model);
    } catch (e) {
        isRemovalOk = false;
        console.log(`removeSpectrumOnCloudAsync - ex: ${e}`);
    }

    return isRemovalOk;
}

async function removeSpectrumOnCloudProcedureAsync(id, successMessage, errorMessage) {
    let isRemovalOk = true;

    try {
        setLoadingCircleIsVisible(true);

        isRemovalOk = await removeSpectrumOnCloudAsync(id);

        let childrenSpectraTypes = await getChildrenSpectraTypesAsync(SPECTRUM_TYPE_ALIGNED);
        /* aggiungere rimozione children */

    } catch (e) {
        isRemovalOk = false;
        console.log(`removeSpectrumOnCloudProcedureAsync - ex: ${e}`);
    }

    setLoadingCircleIsVisible(false);

    if (isRemovalOk)
        showSimpleDialog(INFO_LABEL, successMessage, SUCCESS);
    else
        showSimpleDialog(ERROR_LABEL, errorMessage, ALERT);
}

function switchVisibilityOfChildrenSpectraRemovalMessage(id, isVisible) {
    if (isVisible) {
        $(`#${id}`).removeClass('d-none').addClass('d-flex');
    } else {
        $(`#${id}`).removeClass('d-flex').addClass('d-none');
    }
}

/* ################################################################################ */
/* COMMON */
/* ################################################################################ */
function addProcessedSpectrum(processedSpectrum, processedPoints, spectrumType) {
    /* update chart with new aligned spectrum */
    dxChartBeginUpdate(chartContainer);

    /* create chart series for aligned spectrum */
    let spectrumSeriesName = createSeriesNameFromSpectrumNameAndType(processedSpectrum.Name, processedSpectrum.SpectrumType);

    /* create the value of 'valueField' field for chart */
    let idItem = buildId(processedSpectrum.Id);

    let color = getSpectrumTypeColor(getSpectrumTypeString(spectrumType));
    let newChartSeries = createSeriesFromSpectrumName(idItem, spectrumSeriesName, color, true);
    addChartSeries(newChartSeries);

    /* retrieve current items */
    let items = dxChartGetItems(chartContainer);
    /* get id of raw spectrum */
    let rawId = buildId(selectedSpectrumForProcessing.Id);

    /* retrieve keys of 'alignedPoint' entity and uses the right one for adding point to spectrum:
       when adding from locally calculated aligned spectrum, the key is 'Y', while when adding
       from downloaded aligned spectrum, the key is 'idnn' */
    let keys = Object.keys(processedPoints[0]);

    let key = 'Y';
    const hasYKey = keys.includes('Y');
    if (!hasYKey) {
        let idPattern = /^id\d+$/;
        let hasIdKey = keys.some(key => idPattern.test(key));
        let idKeyIndex = keys.findIndex(key => idPattern.test(key));
        key = keys[idKeyIndex];
    }

    /* loop over items to add aligned point */
    let itemsNum = items.length;
    let counter = 0;
    for (var i = 0; i < itemsNum; i++) {
        if (items[i][rawId]) {
            items[i][idItem] = processedPoints[counter][key];
            counter++;
        }
    }

    /* update chart series */
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    /* reset visual range to make ref whites appear in chart */
    dxChartResetVisualRange(chartContainer);
}

function buildTempAlignedId(id) {
    return `${SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID}${id}`;
}

function buildTempContinuumId(id) {
    return `${SPECTRUM_OF_TYPE_CONTINUUM_TEMP_ID}${id}`;
}

function buildTempContinuumRemovedId(id) {
    return `${SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID}${id}`;
}

function buildTempSmoothedSpectrumId(id, spectrumType, smoothingType) {
    let key;

    switch (smoothingType) {
        case BY_SEGMENTS:
            key = SPECTRUM_OF_TYPE_SMOOTHED_BY_SEGMENTS_TEMP_ID;
            break;

        case BY_WHOLE_SPECTRUM:
            key = SPECTRUM_OF_TYPE_SMOOTHED_WHOLE_SPECTRUM_TEMP_ID;
            break;
    }
    return `${getSpectrumTypeString(spectrumType)}_${key}${id}`;
}

function getIdValueFromTempAlignedId(id) {
    return parseInt(id.replace(SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID, ''));
}

function getIdValueFromTempContinuumRemoved(id) {
    return parseInt(id.replace(SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID, ''));
}

function getTempAlignedIdValue(id) {
    return id.replace(SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID, '');
}

function getYCoord(x, points) {
    let point = points.find(p => p.X >= x && p.X <= x);
    if (point)
        return point.Y;
    else
        return 0;
}

function isSpectrumOfType(destId, destSpectrumType) {
    let id = destId;

    var idRegex = new RegExp('^id[0-9]+');
    if (idRegex.test(destId)) {
        id = parseInt(destId.replace('id', ''));
    }

    let index = getSpectrumIndexByIdAndSpectrumType(id, destSpectrumType);
    return (index > -1);
}

function updateProcessedSpectrumSeries(oldId, newId, newIdValue, isPointVisible = false) {
    /* remove series containing oldId */
    let chartSeriesNum = chartSeries.length;
    for (var i = 0; i < chartSeriesNum; i++) {
        if (chartSeries[i].valueField == oldId) {
            removeChartSeriesAt(i);
            break;
        }
    }

    /* add series with newId */
    let index = getSpectrumIndexBySpectrumId(newIdValue);
    let color = getSpectrumTypeColor(getSpectrumTypeString(spectraInfo[index].SpectrumType));
    let processedSeries = createSeriesFromSpectrumName(newId, getSpectrumSeriesNameFromIndex(index), color, isPointVisible);
    addChartSeries(processedSeries);

    /* update chart series */
    dxChartUpdateSeries(chartContainer, chartSeries);
}

function updateProcessedSpectrumValueField(oldId, newId) {
    let items = dxChartGetItems(chartContainer);

    if (items && items.length > 0) {
        let itemsNum = items.length;
        for (var i = 0; i < itemsNum; i++) {
            if (items[i][oldId]) {
                let value = items[i][oldId];
                delete items[i][oldId];
                items[i][newId] = value;
            }
        }
    }
}

/* ################################################################################ */
/* TABS */
/* ################################################################################ */
function isTabEnabled(index) {
    let children = $('#charmsTabs').children('li');
    if (children && children.length > 0) {
        let tab = $(children[index]);
        if (tab.hasClass('disabled'))
            return false;
        else
            return true;
    }
    return false;
}

function setTabEnabled(index, isEnabled) {
    let children = $('#charmsTabs').children('li');

    function setEnabled(item) {
        if (isEnabled)
            $(item).removeClass('disabled');
        else
            $(item).addClass('disabled');
    }

    let childrenNum = children.length;
    for (var i = 0; i < childrenNum; i++) {
        //let isItemEnabled = isEnabled;
        //if (i != index)
        //    isItemEnabled = !isEnabled;

        setEnabled(children[index]);
    }
}

function setTabSelectedProcedure(containerId, selectedTabId) {
    showSelectedTab(containerId, selectedTabId);

    manageConstantLinesVisualization(selectedTabId);
}

function showSelectedTab(containerId, selectedTabId) {
    let tabs = $(`#${containerId}`).find('li');
    if (tabs && tabs.length > 0) {
        let tabsNum = tabs.length;
        for (var i = 0; i < tabsNum; i++) {
            /* change visualization of tabs + show/hide the tab related panel */
            let currentTabId = $(tabs[i]).find('a').attr('id');
            let currentPanelId = currentTabId.replace('title', '');
            if (currentTabId == selectedTabId) {
                $(tabs[i]).addClass('active');
                show(currentPanelId);
            } else {
                $(tabs[i]).removeClass('active');
                hide(currentPanelId);
            }
        }
    }
}

/* ################################################################################ */
/* OPEN/CLOSE SETTINGS */
/* ################################################################################ */
function toggleDropDown(id) {
    if ($(`#${id}`).hasClass('keep-open')) {
        $(`#${id}`).removeClass('keep-open');

        setTimeout(function () { $(`#${id}`).addClass('keep-open') }, 500);
    }
}