var LOWER_LIMIT = 0;
var UPPER_LIMIT = 1;

var selectedId;

var minerals = [];
var monoMineral;
var rock;
var meteoriteClass;

/* ---------- MINERALS ---------- */
function addMineralItem(id, name, percentage) {
    if (minerals.findIndex(x => x.Id == id) == -1)
        minerals.push(createMineralItem(id, name, percentage));
}

function areMineralsAvailable() {
    return (minerals.length > 0);
}

function createMineralItem(id, name, percentage) {
    return {
        Id: id,
        Name: name,
        Percentage: percentage
    }
}

function deleteMineralItem(id) {
    let index = minerals.findIndex(x => x.Id == id);
    if (index == -1)
        return;

    minerals.splice(index, 1);
}

function getMineralItems() {
    return minerals;
}

function isSumOfMineralItemsPercentageGreaterThan100() {
    let sum = 0;
    for (let i = 0; i < minerals.length; i++) {
        sum += minerals[i].Percentage;
    }

    return (sum > 100);
}

function removeMinerals() {
    minerals = [];
}

function updateMineralItemPercentage(id, percentage) {
    let index = minerals.findIndex(x => x.Id == id);
    if (index == -1)
        return;

    minerals[index].Percentage = percentage;
}

/* ---------- MONO-MINERAL ---------- */
function getMonomineral() {
    return monoMineral;
}

function removeMonomineral() {
    monoMineral = null;
}

function setMonomineral(id, name) {
    minerals = [];

    monoMineral = {
        Id: id,
        Name: name
    };

    minerals.push(monoMineral);
}

/* ---------- ROCK ---------- */
function getRock() {
    if (rock)
        return rock;
    else
        return createEmpty();
}

function removeRock() {
    rock = null;
}

function setRock(id, name) {
    rock = {
        Id: id,
        Name: name
    };
}

/* ---------- METEOR CLASS ---------- */
function getMeteoriteClass() {
    if (meteoriteClass)
        return meteoriteClass;
    else
        return createEmpty();
}

function removeMeteoriteClass() {
    meteoriteClass = null;
}

function setMeteoriteClass(id, name) {
    meteoriteClass = {
        Id: id,
        Name: name
    };
}

/* ################################################################################ */
/* INFO - SAVE */
/* ################################################################################ */
/* ---------- SAMPLE DATA ---------- */
function createEmpty() {
    return {
        Id: 0,
        Name: '',
        Percentage: 0
    }
}

function getGrainSizeTypeValues(sampleTypeId) {
    let grainSizeTypeId = 0;
    let grainSizeLowerValueId = null;
    let grainSizeUpperValueId = null;

    if (sampleTypeId == 3 || sampleTypeId == 4) { // 3: Pellet, 4: Particulate
        let grainSizeTypeSelect = Metro.getPlugin("#SampleDataSelectedValues_GrainSizeTypeId", "select");
        if (grainSizeTypeSelect) {
            grainSizeTypeId = parseInt(grainSizeTypeSelect.val());

            let grainSizeLowerLimitSelector = Metro.getPlugin('#grainSizeLowerLimitSelector', 'select');
            if (grainSizeLowerLimitSelector) {
                grainSizeLowerValueId = parseInt(grainSizeLowerLimitSelector.val());
            }

            let grainSizeUpperLimitSelector = Metro.getPlugin('#grainSizeUpperLimitSelector', 'select');
            if (grainSizeUpperLimitSelector) {
                grainSizeUpperValueId = parseInt(grainSizeUpperLimitSelector.val());
            }
        }
    }

    return {
        GrainSizeTypeId: grainSizeTypeId,
        GrainSizeLowerValueId: grainSizeLowerValueId,
        GrainSizeUpperValueId: grainSizeUpperValueId
    };
}

function getMineralTypeId() {
    let mineralTypeId = null;

    let mineralTypeSelector = Metro.getPlugin('#SampleDataSelectedValues_MineralTypeId', 'select');
    if (mineralTypeSelector) {
        mineralTypeId = parseInt(mineralTypeSelector.val());
    }

    return mineralTypeId;
}

function getMinerals(mineralTypeId) {
    let minerals = [];

    switch (mineralTypeId) {
        case 1:
            minerals = [];
            if (areMineralsAvailable())
                minerals.push(getMonomineral());
            else
                minerals.push(createEmpty());
            break;

        case 3: //Mix
            if (areMineralsAvailable())
                minerals = getMineralItems();
            else
                minerals.push(createEmpty());
            break;

        default: // 2
    }

    return minerals;
}

function getOriginTypeId() {
    let originTypeId = null;

    let originTypeSelector = Metro.getPlugin('#SampleDataSelectedValues_OriginTypeId', 'select');
    if (originTypeSelector) {
        originTypeId = parseInt(originTypeSelector.val());
    }

    return originTypeId;
}

/* ---------- MEASUREMENT INFO ---------- */
function getEmissionAngle() {
    try {
        let emissionAngle = Metro.getPlugin('#emissionAngle', 'spinner');
        return parseInt(emissionAngle.val());
    } catch (e) {
        console.log(`getEmissionAngle - e: ${e}`);
    }
}

function getIncidenceAngle() {
    try {
        let incidenceAngle = Metro.getPlugin('#incidenceAngle', 'spinner');
        return parseInt(incidenceAngle.val());
    } catch (e) {
        console.log(`getIncidenceAngle - e: ${e}`);
    }
}

function getNumOfAcquiredSpectra() {
    try {
        let numOfAcquiredSpectraPlugin = Metro.getPlugin('#numOfAcquiredSpectra', 'spinner');
        return parseInt(numOfAcquiredSpectraPlugin.val());
    } catch (e) {
        console.log(`getNumOfAcquiredSpectra - e: ${e}`);
    }
}

function getNumOfAcquisitionsForSpectrum() {
    try {
        let numOfAcquisitionsForSpectrum = Metro.getPlugin('#numOfAcquisitionsForSpectrum', 'spinner');
        return parseInt(numOfAcquisitionsForSpectrum.val());
    } catch (e) {
        console.log(`getNumOfAcquisitionsForSpectrum - e: ${e}`);
    }
}

/* ---------- SAVE ---------- */
function validateField(id) {
    let isFieldValid = ($(`#${id}`).val() != 0);

    let parentDiv = $(`#${id}`).closest('div');
    let spanChildren = parentDiv.find('span.text-danger');

    if (isFieldValid) {
        if (spanChildren.length > 0) {
            spanChildren[0].textContent = '';
            $($(spanChildren)[0]).addClass('field-validation-valid');
        }
    } else {
        let message = $(`#${id}`).attr('data-val-required');
        spanChildren[0].textContent = message;
        $($(spanChildren)[0]).removeClass('field-validation-valid');
    }

    return isFieldValid;
}

function validateForm() {
    let isValid = true;

    let selectFields = $('#formSaveInfo').find('select');
    if (!selectFields || selectFields.length == 0)
        return;

    const selectFieldsCount = selectFields.length;
    for (let i = 0; i < selectFieldsCount; i++) {
        let isFieldValid = validateField(selectFields[i].id);
        if (!isFieldValid) {
            isValid = false;
        }
    }

    return isValid;
}

async function saveInfoProcedure() {
    var formSaveInfo = $('#formSaveInfo');
    formSaveInfo.data('validator', null);
    $.validator.unobtrusive.parse(formSaveInfo);

    const isValidForm = validateForm();

    if (!$(formSaveInfo).valid() || !isValidForm) {
        formSaveInfo.addClass("ani-ring");
        setTimeout(function () {
            formSaveInfo.removeClass("ani-ring");
            $('#saveInfoButton').attr('disabled', false);
        }, 1000);
        var validator = $(formSaveInfo).validate();
        for (var i in validator.errorMap) {
            console.log(i, ":", validator.errorMap[i]);
        }
        return false;
    }
    setLoadingCircleIsVisible(true);
    await saveInfo();
    setLoadingCircleIsVisible(false);
}

async function saveInfo() {
    const sampleTypeId = parseInt(Metro.getPlugin("#SampleDataSelectedValues_SampleTypeId", "select").val());

    const grainSizeTypeValues = getGrainSizeTypeValues(sampleTypeId);

    const mineralTypeId = getMineralTypeId()

    let isSavingAllowed = true;
    let savingErrorMessage;
    switch (mineralTypeId) {
        case MINERAL_TYPE_MONOMINERALIC:
        case MINERAL_TYPE_MIX:
            if (!areMineralsAvailable()) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoNoMineralSelectedErrorMessage;
            }
            if (isSumOfMineralItemsPercentageGreaterThan100()) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoMineralPercentageExceeds100ErrorMessage;
            }
            break;

        case MINERAL_TYPE_ROCK:
            if (getRock() == null) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoNoRockSelectedErrorMessage;
            }
            break;

        case MINERAL_TYPE_EXTRATERRESTRIAL:
            if (getMeteoriteClass() == null) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoNoMeteorClassSelectedErrorMessage;
            }
            break;

        default:
    }

    if (!isSavingAllowed) {
        showSimpleDialog(ERROR_LABEL, savingErrorMessage, ALERT);
        return;
    }

    setLoadingCircleIsVisible(true);

    const model = {
        FileId: selectedId,
        Name: $('#SampleDataSelectedValues_Name').val(),
        SampleDataSelectedValues: {
            Name: null,
            SampleTypeId: sampleTypeId,
            GrainSizeLowerValueId: grainSizeTypeValues.GrainSizeLowerValueId,
            GrainSizeUpperValueId: grainSizeTypeValues.GrainSizeUpperValueId,
            GrainSizeTypeId: grainSizeTypeValues.GrainSizeTypeId,
            OriginTypeId: getOriginTypeId(),
            MineralTypeId: mineralTypeId,
            Minerals: getMinerals(mineralTypeId),
            Rock: getRock(),
            MeteoriteClass: getMeteoriteClass(),
        },
        SpectrumFileMeasurementInfoValues: {
            NumOfAcquiredSpectra: getNumOfAcquiredSpectra(),
            NumOfAcquisitionsForSpectrum: getNumOfAcquisitionsForSpectrum(),
            EmissionAngle: getEmissionAngle(),
            IncidenceAngle: getIncidenceAngle(),
            InputSpectra: null
        },
    };

    //console.log(model);
    const obj = await doAjaxPostAsync(UrlSaveInfo, model);
    if (obj && obj.IsOk) {
        setLoadingCircleIsVisible(false);
        showInfoBox(INFO_LABEL, UpsertInfoInfoMessage, INFO);
    } else {
        setLoadingCircleIsVisible(false);
        showInfoBox(ERROR_LABEL, UpsertInfoErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* INFO - MEASUREMENT INFO */
/* ################################################################################ */
function loadInfoMeasurementInfo() {
    var model = {
        Id: selectedId
    };

    /* load tab about sample */
    loadPartialViewWithAjaxGet(UrlLoadSpectrumMeasurementInfo, model, 'infoMeasurement');
}

/* ################################################################################ */
/* INFO - SAMPLE DATA */
/* ################################################################################ */
function callSetMineralTypeItems() {
    if (typeof setMineralTypeItems === 'function') // function is not defined when no sample data are available
        setMineralTypeItems();
}

function clearInfo() {
    emptyElem('filename');
    emptyElem('type');
    emptyElem('infoSampleData');
    emptyElem('infoMeasurement');
}

function getGrainSizeTypeSelectedValue() {
    return Metro.getPlugin($(grainSizeTypeElemId), 'select').val();
}

function getSampleTypeSelectedValue() {
    return Metro.getPlugin($(sampleTypeElemId), 'select').val();
}

async function loadFilenameAsync() {
    model = {
        Id: selectedId
    };

    let obj = await doAjaxGetAsync(UrlGetSpectrumFilename, model);
    if (obj) {
        $('#filename').html(obj.Filename);
        let typeDesc = `(<strong>${getSpectrumTypeDescription(obj.Type)}</strong>)`;
        $('#type').html(typeDesc)
    }
}

function loadInfoSampleData() {
    var model = {
        Id: selectedId
    };

    setLoadingCircleIsVisible(true);

    /* load filename on top of panel */
    loadFilenameAsync();

    /* load tab about sample */
    loadPartialViewWithAjaxGet(UrlLoadSpectrumSampleData, model, 'infoSampleData', callSetMineralTypeItems);
}

/* ################################################################################ */
/* MANAGE PANEL INFO POSITION */
/* ################################################################################ */
var samplesData = [];

function hideInfo() {
    let callback = function () {
        setPositionTopRelativePx(`info`, 0);
        clearInfo();
    };
    animateCSS(`info`, `slideOutDown`, FAST, callback);
}

function refreshInfo() {
    loadInfoSampleData();
    loadInfoMeasurementInfo();
}

async function showHideButtonsForInfoPanelAsync() {
    var model = {
        Id: selectedId
    };

    let obj = await doAjaxGetAsync(UrlIsUserStrictlyAuthorizedForSpectrum, model);
    if (obj && obj.IsOk) {
        showByClass('saveInfo');
        showByClass('refreshInfo');
    } else {
        hideByClass('saveInfo');
        hideByClass('refreshInfo');
    }
}

function showInfo(id) {
    //console.log(`showInfo id: ${id}`);

    selectedId = id;

    let pos = $('#info').position();
    setPositionTopRelativePx(`info`, -(pos.top));

    let callbacks = function () {
        showHideButtonsForInfoPanelAsync();
        loadInfoSampleData();
        loadInfoMeasurementInfo();
        showByClass('saveInfo');
        showByClass('refreshInfo');
    };
    animateCSS(`info`, `slideInUp`, FAST, callbacks);
}

/* ################################################################################ */
/* MINERALS MANAGEMENT */
/* ################################################################################ */
/* ---------- MINERAL DELETION ---------- */
function checkMineralsList() {
    let children = $('#selectedMinerals').find('li');
    if (children.length == 0) {
        showEmptyList();
    }
}

function deleteMineralProcedure(mineralId) {
    confirmAndExecute(InfoManagementTitle, MineralDeletionQuestion, deleteMineral, mineralId);
}

async function deleteMineral(mineralId) {
    let id = parseInt(mineralId.replace('mineral', ''));

    /* delete from DB link between spectrum and mineral */
    let model = {
        SpectrumId: selectedId,
        MaterialId: id
    };

    await doAjaxPostAsync(UrlDeleteMineral, model);

    /* delete item from 'minerals' array */
    deleteMineralItem(id);

    /* remove UI item from list */
    $(`#${mineralId}`).remove();

    /* check whether message of empty list should be shown or not */
    checkMineralsList();
}

function showEmptyList() {
    callLoadSpectrumSampleSelectedValuesView();
}

/* ---------- AUTOCOMPLETE ---------- */
function setAutocomplete(url) {
    //$("#mineralsSuggestions").off();
    $("#mineralsSuggestions").autocomplete({
        source: function (request, response) {
            var model = {
                Text: request.term
            };

            $.ajax({
                url: url,
                type: GET,
                async: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: model,
                success: function (data) {
                    //console.log(data);
                    response($.map(data, function (item) {
                        return { label: item.Name, value: item.Name, id: item.Id };
                    }));
                },
                error: function (xhr, status, error) {
                    console.log('autocomplete - materialsSuggestion - ex:' + error);
                }
            });
        },
        nLength: 3,
        select: function (event, ui) {
            //console.log(event);
            //console.log(ui);
            /* select mineral(s) */
            setSelection(ui);

            /* reset input after selection */
            $(this).val('');
            return false;
        }
    });
}

function setLabel(text) {
    $('#materialsSuggestionLabel').text(text);
}

function setSelection(ui) {
    mineralTypeId = getMineralTypeId();
    switch (mineralTypeId) {
        case 1: //Monomineralic
            setMaterialForMonomineralic(ui);
            break;

        case 2: //Amorphous
            // do nothing
            break;

        case 3: //Mix
            setMaterialForMix(ui);
            break;

        case 4: //Rocks

            setMaterialForRock(ui);
            break;

        case 5: //Extraterrestrial
            setMaterialForExtraterrestrial(ui);
            break;
    }
}

/* ---------- UI ---------- */
function removeMaterialForExtraterrestrial() {
    $('#selectedMeteoriteClass').text('');
    $('#MeteoriteClass_Id').val(0);
    removeMeteoriteClass();
}

function removeMaterialForMix() {
    $('#selectedMineralsContainer').empty();
    removeMinerals();
}

function removeMaterialForMonomineralic() {
    $('#selectedMineral').text('');
    $('#Minerals_0_Id').val(0);
    removeMonomineral();
}

function removeMaterialForRock() {
    $('#selectedRock').text('');
    $('#Rock_Id').val(0);
    removeRock();
}

function setMaterialForExtraterrestrial(ui) {
    if ($('#noSelectedMeteorClass').length) {
        /* if no meteorite exists, then remove and add selected meteorite... */
        $('#selectedMeteoriteClassContainer').empty();

        let html = `<span id="selectedMeteoriteClass">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="MeteoriteClass__Id" name="MeteoriteClass.Id" type="hidden" value="${ui.item.id}">`;
        $('#selectedMeteoriteClassContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedMeteoriteClass').text(ui.item.label);
        $('#MeteoriteClass_Id').val(ui.item.id);
    }

    setMeteoriteClass(ui.item.id, ui.item.label);
}

function setMaterialForMix(ui) {
    hideByClass('noSelectedMinerals');

    let id = `mineral${ui.item.id}`;
    let percentageId = `mineralPercentage${ui.item.id}`;
    let html = `<li id="${id}" class="d-flex flex-row flex-align-center flex-justify-between material-row">`;
    html += `<span class="label w-25">${ui.item.label}</span>`;
    html += `<input id="${percentageId}" type="number" min="0" max="100" maxlength="10" value="0">`;
    html += `<span class="mif-bin pointer" onclick="deleteMineralProcedure('${id}')"></span>`;
    html += `</li>`;

    $('#selectedMinerals').append(html);

    setMaterialForMixEventHandler();

    let percentage = parseInt($(`#${percentageId}`).val());
    addMineralItem(ui.item.id, ui.item.label, percentage);
}

function setMaterialForMixEventHandler() {
    $(`[id^="mineralPercentage"]`).off();

    $(`[id^="mineralPercentage"]`).on('keyup input', function () {
        let id = parseInt(this.id.replace('mineralPercentage', ''));
        let percentage = parseInt($(`#${this.id}`).val());
        updateMineralItemPercentage(id, percentage);
        console.log(`${this.id}: ${percentage}`);
    });
}

function setMaterialForMonomineralic(ui) {
    if ($('#noSelectedMonoMineral').length) {
        /* is no mono-mineral exists, then remove and add selected mono-mineral... */
        $('#selectedMonoMineralContainer').empty();

        let html = `<span id="selectedMineral">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="Minerals_0_Id" name="Minerals[0].Id" type="hidden" value="${ui.item.id}">`;
        $('#selectedMonoMineralContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedMineral').text(ui.item.label);
        $('#Minerals_0_Id').val(ui.item.id);
    }

    setMonomineral(ui.item.id, ui.item.label);
}

function setMaterialForRock(ui) {
    if ($('#noSelectedRock').length) {
        /* is no rock exists, then remove and add selected rock... */
        $('#selectedRockContainer').empty();

        let html = `<span id="selectedRock">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="Rock_Id" name="RockId" type="hidden" value="${ui.item.id}">`;
        $('#selectedRockContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedRock').text(ui.item.label);
        $('#Rock_Id').val(ui.item.id);
    }

    setRock(ui.item.id, ui.item.label);
}

function callLoadSpectrumSampleSelectedValuesView() {
    var model = {
        Id: fileId,
        SelectedMineralTypeId: mineralTypeId
    };
    loadPartialViewWithAjaxGet(UrlLoadSpectrumSampleSelectedValuesView, model, 'materialsManagement');
}

function setSelectedMineralType(selected) {
    //console.log(selected);

    mineralTypeId = parseInt(selected);

    let isShowRequired = true;
    switch (mineralTypeId) {
        case 1: //Monomineralic
            removeMeteoriteClass();
            removeMaterialForExtraterrestrial();

            removeMaterialForMix();

            removeRock();
            removeMaterialForRock();

            setAutocomplete(UrlGetMinerals);
            setLabel(SuggestionsForMineralsLabel);
            isShowRequired = true;
            break;

        case 2: //Amorphous
            removeMeteoriteClass();
            removeMaterialForExtraterrestrial();

            removeMaterialForMix();

            removeMonomineral();
            removeMaterialForMonomineralic();

            removeRock();
            removeMaterialForRock();

            isShowRequired = false;
            break;

        case 3: //Mix
            removeMeteoriteClass();
            removeMaterialForExtraterrestrial();

            removeMonomineral();
            removeMaterialForMonomineralic();

            removeRock();
            removeMaterialForRock();

            setAutocomplete(UrlGetMinerals);
            setLabel(SuggestionsForMineralsLabel);
            isShowRequired = true;
            break;

        case 4: //Rock
            removeMeteoriteClass();
            removeMaterialForExtraterrestrial();

            removeMaterialForMix();

            removeMonomineral();
            removeMaterialForMonomineralic();

            setAutocomplete(UrlGetRocks);
            setLabel(SuggestionsForRocksLabel);
            isShowRequired = true;
            break;

        case 5: //Extraterrestrial
            removeMaterialForRock();

            setAutocomplete(UrlGetMeteorClasses);
            setLabel(SuggestionsForMeteoritesLabel);
            isShowRequired = true;
            break;
    }

    if (isShowRequired) {
        showByClass('mineralsSuggestionsLabelContainer');
        showByClass('mineralsSuggestionsContainer');
    } else {
        hideByClass('mineralsSuggestionsLabelContainer');
        hideByClass('mineralsSuggestionsContainer');
    }

    callLoadSpectrumSampleSelectedValuesView();
}
