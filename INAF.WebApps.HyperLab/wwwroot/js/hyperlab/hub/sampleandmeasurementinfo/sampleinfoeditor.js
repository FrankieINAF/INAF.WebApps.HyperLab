var hintRoutines = {
    showHint: function (hint, element) {
        $(hint).addClass("showHint");
        setTimeout(function () { $(hint).removeClass("showHint"); }, 500)
    },

    hideHint: function (hint, element) {
        $(hint).addClass("hideHint");
    }
}

/* ################################################################################ */
/* GRAIN SIZE MANAGEMENT */
/* ################################################################################ */
function buildCommon(values, id) {
    var html = `<select id='${id}' data-role="select">`;
    let valuesNum = values.length;
    for (var i = 0; i < valuesNum; i++) {
        html += `<option value='${values[i].Id}'>${values[i].Value}</option>`;
    }
    html += '</select>';

    return html;
}

function buildLowerLimit(values) {
    if (!$('#grainSizeLowerLimit').is(':empty'))
        return;

    $('#grainSizeLowerLimitSelector').ready(function () {
        let grainSizeLowerLimitSelector = Metro.getPlugin('#grainSizeLowerLimitSelector', 'select');

        if (grainSizeLowerValueId == 0)
            grainSizeLowerValueId = getGrainSizeValueForSelectedSampleData(LOWER_LIMIT);
        grainSizeLowerLimitSelector.val(grainSizeLowerValueId);

        showByClass('grainSizeLowerLimitContainer');
    });

    let html = buildCommon(values, 'grainSizeLowerLimitSelector');
    $('#grainSizeLowerLimit').html(html);
}

function buildUpperLimit(values) {
    if (!$('#grainSizeUpperLimit').is(':empty'))
        return;

    $('#grainSizeUpperLimitSelector').ready(function () {
        let grainSizeUpperLimitSelector = Metro.getPlugin('#grainSizeUpperLimitSelector', 'select');

        if (grainSizeUpperValueId == 0)
            grainSizeUpperValueId = getGrainSizeValueForSelectedSampleData(UPPER_LIMIT);
        grainSizeUpperLimitSelector.val(grainSizeUpperValueId);

        showByClass('grainSizeUpperLimitContainer');
    });

    let html = buildCommon(values, 'grainSizeUpperLimitSelector');
    $('#grainSizeUpperLimit').html(html);
}

function clearLowerLimit() {
    $('#grainSizeLowerLimit').empty();
    hideByClass('grainSizeLowerLimitContainer');
}

function clearUpperLimit() {
    $('#grainSizeUpperLimit').empty();
    hideByClass('grainSizeUpperLimitContainer');
}

function tryBuildGrainSizeValuesSelect(grainSizeValues, grainSizeTypeVal) {
    if (grainSizeValues && grainSizeValues.length > 0) {
        switch (grainSizeTypeVal) {
            case 1:
                buildLowerLimit(grainSizeValues);
                clearUpperLimit();
                break;

            case 2:
                buildLowerLimit(grainSizeValues);
                buildUpperLimit(grainSizeValues);
                break;

            case 3:
                clearLowerLimit();
                buildUpperLimit(grainSizeValues);
                break;
        }
    } else {
        /* clear selectors and hide everything */
        clearLowerLimit();
        clearUpperLimit();
    }
}

function onGrainSizeTypeSelected(val) {
    //console.log(`onGrainSizeTypeSelected: ${val}`);

    let grainSizeTypeVal = parseInt(val);

    switch (grainSizeTypeVal) {
        case 1: // lower limit
            $('#grainSizeValues').text(GrainSizeSelectLowerLimitLabel);
            break;

        case 2: // range
            $('#grainSizeValues').text(GrainSizeSelectRangeLabel);
            break;

        case 3: // upper limit
            $('#grainSizeValues').text(GrainSizeSelectUpperLimitLabel);
            break;
    }

    let selectedSampleData = samplesData.find(x => x.Id == getSampleTypeSelectedValue());
    tryBuildGrainSizeValuesSelect(selectedSampleData.GrainSizeValues, grainSizeTypeVal);
}

function onSampleDataTypeSelected(val) {
    //console.log(`onSampleDataTypeSelected: ${val}`);

    let sampleDataTypeVal = parseInt(val);

    switch (sampleDataTypeVal) {
        case 1: // slab
        case 2: // chip
            hideByClass('grainSizeTypesSelectLabel');
            hideByClass('grainSizeTypesSelect');
            break;

        case 3: // pellet
        case 4: // particulate
            showByClass('grainSizeTypesSelectLabel');
            showByClass('grainSizeTypesSelect');
            onGrainSizeTypeSelected(getGrainSizeTypeSelectedValue());
            break;
    }
}

function getGrainSizeValueForSelectedSampleData(lowerOrUpperLimit) {
    let sampleType = getSampleTypeSelectedValue();

    let grainSizeType = getGrainSizeTypeSelectedValue();

    console.log(`sampleType: ${sampleType}, grainSizeType: ${grainSizeType}`);

    let sampleData = samplesData.find(x => x.Id == getSampleTypeSelectedValue());
    if (lowerOrUpperLimit == LOWER_LIMIT)
        return sampleData.GrainSizeValues[0].Id;
    else
        return sampleData.GrainSizeValues[1].Id;
}

async function getSampleDataValues() {
    let obj = await doAjaxGetNoModelAsync(UrlGetSampleDataValues);
    if (obj) {
        let itemsNum = obj.length;
        for (var i = 0; i < itemsNum; i++) {
            let sampleData = {
                Id: obj[i].Id,
                Value: obj[i].Value,
                GrainSizeValues: []
            };
            if (obj[i].GrainSizeValues && obj[i].GrainSizeValues.length > 0) {
                let grainSizeValuesNum = obj[i].GrainSizeValues.length
                for (var j = 0; j < grainSizeValuesNum; j++) {
                    let grainSizeValue = {
                        Id: obj[i].GrainSizeValues[j].Id,
                        Value: obj[i].GrainSizeValues[j].Value
                    };
                    sampleData.GrainSizeValues.push(grainSizeValue);
                }
            }

            samplesData.push(sampleData)
        }
    }
}

async function initSamplesData() {
    await getSampleDataValues();

    switch (parseInt(getSampleTypeSelectedValue())) {
        case 1: //Slab
        case 2: //Chip
            break;

        case 3: //Pellet
        case 4: //Particulate
            onGrainSizeTypeSelected(getGrainSizeTypeSelectedValue());
            break;
    }
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    sampleTypeSelect = Metro.getPlugin($('#@nameof(SpectrumFileSampleDataValuesContainer.SampleDataSelectedValues)_@nameof(SampleDataSelectedValues.SampleTypeId)'), 'select');

    grainSizeTypeSelect = Metro.getPlugin($('#@nameof(SpectrumFileSampleDataValuesContainer.SampleDataSelectedValues)_@nameof(SampleDataSelectedValues.GrainSizeTypeId)'), 'select');

    initSamplesData();

    setAutocomplete(UrlGetMinerals);

    setMaterialForMixEventHandler();
});