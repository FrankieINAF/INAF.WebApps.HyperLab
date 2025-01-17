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

function setMonomineral(id, name) {
    minerals = [];

    monoMineral = {
        Id: id,
        Name: name
    };
}

/* ---------- ROCK ---------- */
function getRock() {
    if (rock)
        return rock;
    else
        return createEmpty();
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
    let grainSizeTypeId = null;
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
async function saveInfo() {
    let sampleTypeId = parseInt(Metro.getPlugin("#SampleDataSelectedValues_SampleTypeId", "select").val());

    let grainSizeTypeValues = getGrainSizeTypeValues(sampleTypeId);

    let mineralTypeId = getMineralTypeId()

    let isSavingAllowed = true;
    let savingErrorMessage;
    switch (mineralTypeId) {
        case MINERAL_TYPE_MONOMINERALIC:
        case MINERAL_TYPE_MIX:
            if (!areMineralsAvailable()) {
                isSavingAllowed = false;
                savingErrorMessage = SaveInfoNoMineralSelectedErrorMessage;
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

    let model = {
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
    let obj = await doAjaxPostAsync(UrlSaveInfo, model);
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
    setMineralTypeItems();
}

function clearInfo() {
    emptyElem('filename');
    emptyElem('type');
    emptyElem('infoSampleData');
    emptyElem('infoMeasurement');
}

function getGrainSizeTypeSelectedValue() {
    return grainSizeTypeSelect.val();
}

function getSampleTypeSelectedValue() {
    return sampleTypeSelect.val();
}

async function loadFilename() {
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
    loadFilename();

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

    let obj = await doAjaxGetAsync(UrlIsUserStrictlyAuthorized, model);
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
                    console.log('autocomplete - mineralsSuggestion - ex:' + error);
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
    $('#mineralsSuggestionLabel').text(text);
}

function setSelection(ui) {
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

function setMaterialForExtraterrestrial(ui) {
    if ($('#noSelectedMeteorClass').length) {
        /* if no meteorite exists, then remove and add selected meteorite... */
        $('#selectedMeteorClassContainer').empty();

        let html = `<span id="selectedMeteorClass">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="MeteoriteClass__Id" name="MeteoriteClass.Id" type="hidden" value="${ui.item.id}">`;
        $('#selectedMeteorClassContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedMeteorClass').text(ui.item.label);
        $('#MeteoriteClass__Id').val(ui.item.id);
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
        html += `<input data-val="true" data-val-required="The Id field is required." id="Minerals_0__Id" name="Minerals[0].Id" type="hidden" value="${ui.item.id}">`;
        $('#selectedMonoMineralContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedMineral').text(ui.item.label);
        $('#Minerals_0__Id').val(ui.item.id);
    }

    setMonomineral(ui.item.id, ui.item.label);
}

function setMaterialForRock(ui) {
    if ($('#noSelectedRock').length) {
        /* is no rock exists, then remove and add selected rock... */
        $('#selectedRockContainer').empty();

        let html = `<span id="selectedRock">${ui.item.label}</span>`;
        html += `<input data-val="true" data-val-required="The Id field is required." id="Rock__Id" name="RockId" type="hidden" value="${ui.item.id}">`;
        $('#selectedRockContainer').html(html);
    } else {
        /* ...otherwise replace value */
        $('#selectedRock').text(ui.item.label);
        $('#Rock__Id').val(ui.item.id);
    }

    setRock(ui.item.id, ui.item.label)
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
            setAutocomplete(UrlGetMinerals);
            setLabel(SuggestionsForMineralsLabel);
            isShowRequired = true;
            break;

        case 2: //Amorphous
            isShowRequired = false;
            break;

        case 3: //Mix
            setAutocomplete(UrlGetMinerals);
            setLabel(SuggestionsForMineralsLabel);
            isShowRequired = true;
            break;

        case 4: //Rock
            setAutocomplete(UrlGetRocks);
            setLabel(SuggestionsForRocksLabel);
            isShowRequired = true;
            break;

        case 5: //Extraterrestrial
            setAutocomplete(UrlGetMeteorClasses);
            setLabel(SuggestionsForMeteorsLabel);
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