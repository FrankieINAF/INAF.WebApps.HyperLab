var selectedSpectrumType;
var isOnlyShowingColor;

function closeCharmsColorSelector() {
    Metro.getPlugin('#charmsColorSelector', 'charms').close();
}

function toggleCharmsColorSelector() {
    Metro.getPlugin('#charmsColorSelector', 'charms').toggle();
}

async function createSpectraTypesColorList() {
    /* close other charms, if opened */
    Metro.getPlugin('#charms', 'charms').close();
    Metro.getPlugin('#charmsLegend', 'charms').close();

    /* remove the old list */
    $('#spectraTypesColorsListContainer').empty();

    /* load spectra types-colors relationship values */
    await loadSpectraTypeColorsAsync();

    /* create new list */
    let spectraTypeColorsNum = spectraTypeColors.length;
    let html = `<div class="d-flex flex-column">`;
    for (var i = 0; i < spectraTypeColorsNum; i++) {
        html += createSpectraTypesColorListItem(spectraTypeColors[i].SpectrumType, spectraTypeColors[i].Value);
    }
    html += `</div>`;

    $('#spectraTypesColorsListContainer').html(html);
}

function createSpectraTypesColorListItem(spectrumType, color) {
    let html = ``;

    html += `<div id="spectrumType${spectrumType}" class="d-flex flex-justify-start pointer charms-color-select-list-item" onclick="setSpectrumTypeSelected(${spectrumType})">`;
    html += `   <div id="spectrumType${spectrumType}Color" class="dot margin-top-8" style="background-color: ${color}"></div>`;
    html += `   <div class="margin-left-8"><span class="text-leader2">${getSpectrumTypeDescription(spectrumType)}</span></div>`;
    html += `</div>`;

    return html;
}

/* -------------------------------------------------------------------------------- */
/* MANAGE SPECTRUM TYPE COLOR */
/* -------------------------------------------------------------------------------- */
function onSelectColor(color) {
    if (selectedSpectrumType) {
        let key = getSpectraTypeColorsKeyFromSpectrumType(selectedSpectrumType)
        if (key == null)
            return;

        /* show newly selected color for currently selected spectrumType */
        $(`#spectrumType${selectedSpectrumType}Color`).css('background-color', color);

        /* fix color for being saved in setting on cloud and locally */
        let fixedColor = color.replace('#', '').toUpperCase();

        /* update spectraTypeColors */
        let item = createSpectraTypeColorKeyValueItem(selectedSpectrumType, key, fixedColor);
        addOrUpdateSpectraTypeColoKeyValueItem(item);

        /* update series of selected spectrumType with the new color */
        updateSpectraColor(selectedSpectrumType, color);

        /* save setting on cloud */
        isOnlyShowingColor = false;
        saveColorOnCloud(key, fixedColor);
    }
}

function saveColorOnCloud(key, color) {
    if (isOnlyShowingColor)
        return;

    /* fix keyword for being saved  setting on cloud */
    let uppercaseKey = key.toUpperCase();
    let fixedKey = uppercaseKey.slice(0, 5) + "_" + uppercaseKey.slice(5);

    /* enque command for saving this setting */
    callEnqueueSaveSetting(timeoutSpectrumTypeColor, fixedKey, color, JS_DELAY_200);
}

function setSpectrumTypeSelected(spectrumType) {
    selectedSpectrumType = spectrumType;

    let spectraTypeColorsNum = spectraTypeColors.length;
    for (var i = 0; i < spectraTypeColorsNum; i++) {
        if (selectedSpectrumType == spectraTypeColors[i].SpectrumType)
            $(`#spectrumType${spectraTypeColors[i].SpectrumType}`).removeClass('charms-color-select-list-item').addClass('charms-color-select-list-item-selected');
        else
            $(`#spectrumType${spectraTypeColors[i].SpectrumType}`).removeClass('charms-color-select-list-item-selected').addClass('charms-color-select-list-item');
    }

    /* show defined color for selected spectrumType */
    isOnlyShowingColor = true;
    let color = getSpectraTypeColorsValueFromSpectrumType(selectedSpectrumType);
    Metro.getPlugin('#colorSelector', 'color-selector').val(color);
}

function updateSpectraColor(spectrumType, color) {
    let spectra = getSpectraBySpectrumType(spectrumType);

    if (!spectra || spectra.length == 0)
        return;

    let spectraNum = spectra.length;
    for (var i = 0; i < spectraNum; i++) {
        let index = findChartSeriesIndexByName(getSeriesNameFromId(spectra[i].Id));
        if (index == -1)
            continue;

        chartSeries[index].color = color;
    }

    dxChartUpdateSeries(chartContainer, chartSeries);

    dxChartRefresh(chartContainer);
}