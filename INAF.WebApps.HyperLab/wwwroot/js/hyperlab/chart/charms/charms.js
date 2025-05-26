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

var selectedSpectrumForProcessingId = 0;
var oldSelectedSpectrumForProcessingId = 0;

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
async function closeCharmsAsync(isUserPermissionRequested = true) {

    let callbackAsync = async function () {
        setLoadingCircleIsVisible(true);

        unloadWhiteSpectraForAlignment();

        await removeSpectraProcedureSimpleAsync();

        isCharmsResetRequested = true;

        Metro.charms.close('#charms');

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

function hideCharms() {
    isCharmsResetRequested = false;

    Metro.charms.close('#charms');
}

function isCharmsOpen() {
    return Metro.charms.isOpen('#charms');
}

async function initCharmsPhase1Async() {
    /* hide tabs */
    hideByClassDFlexItem('charmsTabsContainer');

    /* show explanation message */
    showByClassDFlexItem('charmsTabAlignmentStartingMessageContainer');

    /* load from cloud relationships between each spectrum type and its parent */
    getSpectraTypesParentsAsync();

    /* show 1st tab */
    setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_ALIGNMENT);

    /* reset all variables and arrays used for fitting */
    initFit();
}

function onCharmsClosed() {
    /* resize chart */
    updateChartSize();

    /* restore logout button original position */
    $('#logoutButton').removeClass('margin-right-500');

    if (!isCharmsResetRequested)
        return;

    /* init the id of the selected RAW spectrum for processing */
    selectedSpectrumForProcessingId = 0;

    /* disable saving on cloud checkbox 'alignmentCheckboxShowLines' value */
    isCheckboxForShowSegmentsValueToBeSavedOnCloud = false;

    /* remove spectra list from selector */
    $('#spectrumSelectionContainer').empty();

    /* remove event fir checkbox */
    $("#alignmentCheckboxShowLines").off();
}

async function onCharmsOpened() {
    if (isCharmsResetRequested) {
        /* if requested, show lines for alignment */
        if (isCheckboxChecked('alignmentCheckboxShowLines'))
            $("#alignmentCheckboxShowLines").trigger("click");

        //await initCharmsPhase1Async();

        /* fill selector for available RAW files */
        loadSpectraToBeProcessed();

        /* move logout button to make it visible */
        $('#logoutButton').addClass('margin-right-500');

        isCharmsResetRequested = false;
    }
}

function openCharms() {
    let w = $('#renderbody').width();

    w -= (CHARMS_WIDTH);

    $('#charts').css({ width: `${w}px` });
    //$('#charts').css({ transition: TRANSITION_SHORTHAND });
    //$('#charts').css({ transform: `translate(-${(CHARMS_WIDTH - 100)}, 0)` });

    Metro.charms.open('#charms');
}

function setTabsForNoRawSpectra() {
    showTabsContainer();

    /* set tab for alignment as disabled */
    setTabEnabled(0, false);

    /* set fit tab as enabled */
    setTabEnabled(1, true);

    /* set fit tab as selected */
    setTabSelectedProcedure('charmsTabs', OPTIONS_TITLE_FIT);

    /* load panel for smoothing */
    loadSmoothingPanel();
}

function showTabsContainer(callback) {
    /* show tabs with animation */
    showByClass('charmsTabsContainer');
    animateCSS('charmsTabsContainer', 'fadeIn', 'FASTER', callback);
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
    return  {
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
    let parentFile = getSpectrumInfoById(id);

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
            return getSpectrumByIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        } else {
            return getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
        }
    } else {
        return getSpectrumByIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    }
}

function getSpectrumContinuumRemovedProcedure() {
    if (isSLabSpectrumCurrentlySelected) {
        return getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_CONTINUUM_REMOVED);
    } else {
        return getSpectrumByIdAndSpectrumType(selectedSpectrumForProcessingId, SPECTRUM_TYPE_ALIGNED);
    }
}

/* ################################################################################ */
/* SPECTRA TYPES PARENTS */
/* ################################################################################ */
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
            let index = getSpectrumIndexById(spectraForProcessingIds[i]);
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

async function initCharmsPhase2Async() {
    /* hide message about RAW file selection */
    hideByClassDFlexItem('charmsTabAlignmentStartingMessageContainer');

    if (isSLabConditionForSpectrumTypeNotHigherThanRaw()) {
        /* set as selected the alignment tab */
        setTabEnabled(0, true);

        //console.log(`onSelectSpectrum - selected: ${selected}`) // selected is Id, i.e: 5
        loadPartialViewWithAjaxGetNoModel(UrlLoadAlignmentPanel, 'alignmentOptionsPanel', onAlignmentPanelLoaded);
    } else {
        setTabsForNoRawSpectra();
    }
    /* check whether continuum-removed version is already available on cloud or not */
    if (await callCheckIsSpectrumOfTypeSavedOnCloudForContinuumRemovedAsync())
        setTabEnabled(1, true);
}

function manageSpectraVisibility(selectedSpectrumId) {
    /* set IsVisible to TRUE for selected spectrum */
    setSpectrumVisibility(selectedSpectrumId, true);
    let seriesName = getSpectrumSeriesNameFromIndex(getSpectrumIndexById(selectedSpectrumId));
    dxChartShowSeries(chartContainer, seriesName);

    /* set IsVisible to FALSE for all other spectra */
    let spectraNum = spectraInfo.length;
    for (var i = 0; i < spectraNum; i++) {
        if (spectraInfo[i].Id != selectedSpectrumId) {
            setSpectrumVisibility(spectraInfo[i].Id, false);
            let seriesName = getSpectrumSeriesNameFromIndex(getSpectrumIndexById(spectraInfo[i].Id));
            dxChartHideSeries(chartContainer, seriesName);
        }
    }
}

/* -------------------------------------------------------------------------------- */
/* SPECTRUM SELECTION MANGEMENT */
/* -------------------------------------------------------------------------------- */
async function callbackYesForSpectrumSelectionManagementAsync(selectedSpectrum, idsToBeRemoved) {
    setLoadingCircleIsVisible(true);

    setTimeout(async function () {
        /* remove previous analysis and UI items, if available */
        clearBandAnalysisProcedureCaller();

        /* disable tab for band analysis */
        setTabEnabled(3, false);

        /* remove previous fit points series */
        tryRemoveFitPointsSeries();

        /* remove spectra from chart */
        removeChartSeriesByFieldsIdProcedure(chartContainer, idsToBeRemoved);

        /* remove spectra from 'spectraInfo' (children of the selected one) */
        removeSpectraById(idsToBeRemoved);

        /* update visibility for all spectra (set visible the selected one, invisible all the other ones) */
        manageSpectraVisibility(selectedSpectrumForProcessingId);

        /* reset charms UI and load segments for alignment */
        await initCharmsPhase1Async();

        if (selectedSpectrum.SpectrumSource == SPECTRUM_SOURCE_EXTERNAL)
            setIsPointClickForFitEnabled(true);

        /* load info for creating UI of alignment panel  */
        await initCharmsPhase2Async();

        setLoadingCircleIsVisible(false);
    }, 250);
}

function onSelectSpectrum(selected) {
    setSelectedSpectrumForProcessing(selected);
}

function setSelectedSpectrumForProcessing(selected) {
    let selectedValue = Number.isFinite(selected) ? parseInt(selected) : selected;
    if (selectedValue == selectedSpectrumForProcessingId)
        return; // if we're opening charms and the selected spectrum is the already selected one, then do nothing

    /* remember the previous id value */
    oldSelectedSpectrumForProcessingId = selectedSpectrumForProcessingId;

    /* remember new id of selected spectrum */
    selectedSpectrumForProcessingId = selectedValue;

    const selectedSpectrum = getSpectrumInfoById(selectedSpectrumForProcessingId);
    /* fix color for using spectrumType-color association */
    updateSelectedSpectrumColor(selectedSpectrum);
    if (selectedSpectrum.SpectrumSource == SPECTRUM_SOURCE_EXTERNAL)
        isSLabSpectrumCurrentlySelected = false;

    /* find ids of spectra to be removed when changing selected spectrum */
    findSpectrumChildrenByIdProcedure(selectedSpectrumForProcessingId);
    if (isAnyItem(familyIds)) { // familyIds is filled-up during 'findSpectrumChildrenByIdProcedure'
        let callbackYes = async function () {
            await callbackYesForSpectrumSelectionManagementAsync(selectedSpectrum, familyIds);
        };
        let callbackNo = function () {
            selectedSpectrumForProcessingId = oldSelectedSpectrumForProcessingId;

            Metro.getPlugin('#charmsSpectrumSelector', 'select').val(oldSelectedSpectrumForProcessingId);
        };
        showDialogWithActions(WARNING_LABEL, CharmsDeleteProcessedSpectraQuestion, WARNING, YES_LABEL, NO_LABEL, callbackYes, callbackNo);
    } else {
        setTimeout(async function () {
            /* update visibility for all spectra */
            manageSpectraVisibility(selectedSpectrumForProcessingId);

            /* reset charms UI and load segments for alignment */
            await initCharmsPhase1Async();

            if (selectedSpectrum.SpectrumSource == SPECTRUM_SOURCE_EXTERNAL || isSLabLowerSpectrumTypeHigherThanRaw)
                setIsPointClickForFitEnabled(true);

            /* load info for creating UI of alignment panel  */
            initCharmsPhase2Async();
        }, 250);
    }
}

function updateSelectedSpectrumColor(selectedSpectrum) {
    const seriesName = createSeriesNameFromSpectrumNameAndType(selectedSpectrum.Name, selectedSpectrum.SpectrumType)
    const color = getSpectrumTypeColor(getSpectrumTypeString(selectedSpectrum.SpectrumType));

    let index = findChartSeriesIndexByName(seriesName);
    if (index == -1)
        return;

    dxChartBeginUpdate(chartContainer);
    chartSeries[index].color = color;
    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartEndUpdate(chartContainer);

    addMessage(CharmsSelectedSpectrumColorUpdateMessage, 3000, INFO);
}

/* ################################################################################ */
/* DOWNLOAD PROCESSED SPECTRUM */
/* ################################################################################ */
async function downloadProcessedSpectrumAsync(spectrumType) {
    if (isAnyChildSpectrumByRawIdAndSpectrumTypeAvailable(selectedSpectrumForProcessingId, spectrumType)) {
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

    setLoadingCircleIsVisible(true);

    let model = {
        ParentId: selectedSpectrumForProcessingId,
        SpectrumType: spectrumType
    }

    let obj = await doAjaxPostAsync(UrlGetProcessedSpectrum, model);
    if (obj) {
        setLoadingCircleIsVisible(true); // trick for avoiding mysterious disappearing of loading

        /* save spectrum into 'spectraInfo' */
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
                buildContinuumRemovedSpectrumCompleted();

                /* retrieve and show settings used for removing continuum from currently selected spectrum */
                isBuildingUpContinuum = true; // used to avoid removing loading while building up continuum
                await downloadContinuumRemovalSettingsAsync(obj.SpectraInfo.Id);

                ///* save boundaries points as missing points to enable continuum-removed recalculation if points are added/removed */
                //setMissingPointsFromDownloadedContinuumRemoved(obj.Points, Object.keys(obj.Points[0]));
                break;

            default:
        }

        /* set text of cloud icon */
        setCloudTextAndIconStatus(spectrumType, true);

        if (!isBuildingUpContinuum)
            setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, CharmsCloudDownloadErrorMessage, ALERT);
    }
}

async function getSpectrumByParentIdAndSpectrumTypeAsync(parentId, spectrumType) {
    let model = {
        Id: parentId,
        SpectrumType: spectrumType
    };

    let obj = await doAjaxGetAsync(UrlGetSpectrumIdByParentIdAndSpectrumType, model);
    if (obj && obj.IsOk) {

    }
}

async function getSpectrumIdByParentIdAndSpectrumTypeAsync(parentId, spectrumType, callback) {
    let model = {
        Id: parentId,
        SpectrumType: spectrumType
    };

    let obj = await doAjaxGetAsync(UrlGetSpectrumIdByParentIdAndSpectrumType, model);
    if (obj && obj.IsOk) {
        if (callback)
            callback(obj.Id);
    }
}

function getTextIdFromSpectrumType(spectrumType) {
    let desc = getSpectrumTypeDescription(spectrumType);

    let temp = desc.split(' ');

    temp[0] = firstLetterLowerCase(temp[0]);

    if (temp.length > 0) {
        for (var i = 1; i < temp.length; i++) {
            temp[i] = firstLetterUpperCase(temp[i]);
        }
    }

    return temp.join('');
}

/* ################################################################################ */
/* MANAGE TEXT OF CLOUD ICON */
/* ################################################################################ */
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
/* CHECK IS SAVED ON CLOUD */
/* ################################################################################ */
async function checkIsSpectrumOfTypeSavedOnCloudAsync(name, spectrumType, spectrumSource) {
    if (!isUserAuthenticated)
        return false;

    if (spectrumSource == null)
        spectrumSource = SPECTRUM_SOURCE_SLAB;

    let model = {
        Filename: name,
        SpectrumType: spectrumType,
        SpectrumSource: spectrumSource
    };

    let obj = await doAjaxGetAsync(UrlIsSpectrumTypeSavedOnCloud, model);
    if (obj) {
        /* save status of spectrum in 'spectraInfo' */
        saveSavedOnCloudStatus(obj.IsOk, spectrumType);

        /* show/hide icon on panel  */
        setCloudIconOnPanel(obj.IsOk, spectrumType);

        return obj.IsOk;
    }
    else
        return false;
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

function isSpectrumOfTypeSavedOnCloud(spectrumType) {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, spectrumType);
    if (!spectrum)
        return false;

    return spectrum.IsSavedOnCloud;
}

function saveSavedOnCloudStatus(isSavedOnCloud, spectrumType) {
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(selectedSpectrumForProcessingId, spectrumType);
    if (!spectrum)
        return;

    spectrum.IsSavedOnCloud = isSavedOnCloud;
}

function setCloudIconOnPanel(isSavedOnCloud, spectrumType) {
    let temp = getTextIdFromSpectrumType(spectrumType);

    let divId = `${temp}SavedOnCloud`;

    (isSavedOnCloud ? showFlex(divId) : hide(divId));
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
        let spectra = buildFamilyTreeForSpectrum(selectedSpectrumForProcessingId);

        if (spectra.length == 0)
            return;

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
            await deleteRecursivelySpectrumChildrenOnCloudAsync(selectedSpectrumForProcessingId, spectrumType);

        setLoadingCircleIsVisible(false);
    }, JS_DELAY_200);
}

async function removeSpectraProcedureSimpleAsync() {
    /* retrieve all spectra, children of selected RAW spectrum, ordered in descending order */
    let spectra = buildFamilyTreeForSpectrum(selectedSpectrumForProcessingId);

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
        spectra.push(getSpectrumInfoById(id));
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
    let index = getSpectrumIndexByParentIdAndSpectrumType(selectedSpectrumForProcessingId, spectrumType);

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
        let model = {
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
/* MANAGE POINTS */
/* ################################################################################ */
function extractSpectrumXMax(points) {
    return Math.max(...points.map(p => p.X));
}

function extractSpectrumXMin(points) {
    return Math.min(...points.map(p => p.X));
}

function extractSpectrumRange(points, x0, x1) {
    if (x1 <= x0)
        return null;

    return points.filter(p => p.X >= x0 && p.X <= x1);
}

function getPointHigherThanX(points, x) {
    /* find the 1st point with X greater-equal to x */
    let point = points.find(p => p.X >= x);
    if (!point)
        return null;

    return point;
}

function getPointLowerThanX(points, x) {
    /* find the 1st point with X lower-equal to x */
    /* 1) filter all points with X lower-equal to x */
    let lowerXPoints = points.filter(p => p.X <= x);
    if (lowerXPoints.length == 0)
        return null;

    /* 2) retrieve the last point */
    let point = lowerXPoints[lowerXPoints.length - 1];
    if (!point)
        return null;

    return point;
}

function getPointsMaxX(points) {
    return points[points.length - 1].X
}

function getPointsMinX(points) {
    return points[0].X
}

function getPointFromSeriesPoints(seriesPoints, x) {
    let seriesPoint = seriesPoints.find(p => parseFloat(p.argument) == x);

    return {
        X: parseFloat(seriesPoint.argument),
        Y: parseFloat(seriesPoint.value)
    };
}

function getPointsFromSeriesPoints(seriesPoints) {
    return seriesPoints.map(x => { return { X: parseFloat(x.argument), Y: parseFloat(x.value), YStdDev: 0 }; });
}

function getPointsFromSeriesPointsProcedure(rawId, spectrumType) {
    /* retrieve series points */
    let seriesPoints = getSeriesPointsProcedure(rawId, spectrumType);
    return getPointsFromSeriesPoints(seriesPoints);
}

function getPointAtFromSeriesPoints(seriesPoints, index) {
    return seriesPoints[index].map(x => { return { X: parseFloat(x.argument), Y: parseFloat(x.value) }; });
}

function getSeriesPointsProcedure(rawId, spectrumType) {
    //selectedSpectrumTypeForContinuumRemoval
    let spectrum = getChildSpectrumByRawIdAndSpectrumType(rawId, spectrumType);
    if (!spectrum && (!isSLabSpectrumCurrentlySelected || isSLabLowerSpectrumTypeHigherThanRaw))
        spectrum = getSpectrumByIdAndSpectrumType(selectedSpectrumForProcessingId, selectedSpectrumTypeForContinuumRemoval);
    /* retrieve index of spectrum in spectraInfo */
    let index = getSpectrumIndexById(spectrum.Id);
    /* retrieve series name */
    let seriesname = getSpectrumSeriesNameFromIndex(index);
    /* retrieve series points */
    return dxChartGetSeriesPoints(chartContainer, seriesname);
}

function getSpectrumPointsById(id) {
    let index = getSpectrumIndexById(id);
    if (index < 0)
        return;

    let seriesPoints = dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromIndex(index));
    if (!seriesPoints)
        return null;

    return getPointsFromSeriesPoints(seriesPoints);
}

function getSpectrumPointsByRawIdAndSpectrumType(rawId, spectrumType) {
    let spectrum = getSpectrumByRawIdAndSpectrumType(rawId, spectrumType);
    return getSpectrumPointsById(spectrum.Id);
}

function getSpectrumPointsBySpectrumType(spectrumType) {
    let spectrum = getSpectrumBySpectrumType(spectrumType);
    return getSpectrumPointsById(spectrum.Id);
}

function isExistingPointByX(points, x) {
    let index = points.findIndex(p => p.X == x);
    return (index >= 0);
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
    let rawId = buildId(selectedSpectrumForProcessingId);

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

function buildTempAlignedId() {
    return `${SPECTRUM_OF_TYPE_ALIGNED_TEMP_ID}${selectedSpectrumForProcessingId}`;
}

function buildTempContinuumId() {
    return `${SPECTRUM_OF_TYPE_CONTINUUM_TEMP_ID}${selectedSpectrumForProcessingId}`;
}

function buildTempContinuumRemovedId() {
    return `${SPECTRUM_OF_TYPE_CONTINUUM_REMOVED_TEMP_ID}${selectedSpectrumForProcessingId}`;
}

function buildTempSmoothedSpectrumId(spectrumType, smoothingType) {
    let key;

    switch (smoothingType) {
        case BY_SEGMENTS:
            key = SPECTRUM_OF_TYPE_SMOOTHED_BY_SEGMENTS_TEMP_ID;
            break;

        case BY_WHOLE_SPECTRUM:
            key = SPECTRUM_OF_TYPE_SMOOTHED_WHOLE_SPECTRUM_TEMP_ID;
            break;
    }
    return `${getSpectrumTypeString(spectrumType)}_${key}${selectedSpectrumForProcessingId}`;
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
    let index = getSpectrumIndexById(newIdValue);
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