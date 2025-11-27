/* ################################################################################ */
/* CHARMS LEGEND */
/* ################################################################################ */
function closeCharmsLegend() {
    if (Metro.charms.isOpen('#charmsLegend'))
        Metro.charms.close('#charmsLegend');
}

function createCharmsLegend() {
    /* close other charms, if opened */
    closeCharmsColorSelector();

    /* find raw spectra */
    let rawSpectra = getSpectraForLegend();

    if (!rawSpectra || rawSpectra.length == 0)
        return;

    initSpectraTree();

    /* add ref spectrum to list */
    const refSpectrums = getSpectraBySpectrumType(SPECTRUM_TYPE_REF);
    if (refSpectrums.length > 0)
        addSpectrumToSpectraTree(refSpectrums[0].Id);

    /* add ref-white spectrum to list */
    const refWhiteSpectrums = getSpectraBySpectrumType(SPECTRUM_TYPE_REF_WHITE);
    if (refWhiteSpectrums.length > 0)
        addSpectrumToSpectraTree(refWhiteSpectrums[0].Id);

    /* build array with spectra */
    const rawSpectraNum = rawSpectra.length;
    for (var i = 0; i < rawSpectraNum; i++) {
        addSpectrumToSpectraTree(rawSpectra[i].Id);

        findSpectrumChildrenByIdProcedure(rawSpectra[i].Id);
        //let children = getChildrenIdsForSpectrum(rawSpectra[i].Id);
        if (familyIds && familyIds.length > 0) {
            //console.log(children);
            familyIds.forEach(function (id) {
                addSpectrumChildToSpectraTree(rawSpectra[i].Id, id);
            });
        }

        if (selectedSpectrumForProcessing && rawSpectra[i].Id == selectedSpectrumForProcessing.Id) {
            const continuumSpectra = getSpectraBySpectrumType(SPECTRUM_TYPE_CONTINUUM);
            if (continuumSpectra.length > 0) {
                addSpectrumChildToSpectraTree(selectedSpectrumForProcessing.Id, continuumSpectra[0].Id);

            }
        }
    }

    /* destroy previous legend */
    $('#legend').empty();

    /* build legend */
    let spectreTreeItemsNum = getSpectraTreeItemsNum();
    for (var i = 0; i < spectreTreeItemsNum; i++) {
        let rawSpectrumId = spectraTree[i].Id;
        let name = `${getSpectrumNameById(rawSpectrumId)} (${getSpectrumTypeById(rawSpectrumId)})`;

        if (name == SERIES_HIGHLIGHTED_SEGMENT)
            continue;

        let rawcolor = getSeriesColor(rawSpectrumId);

        let opacity = 1;
        let series = getSeriesFromId(rawSpectrumId);
        if (!series.isVisible()) opacity = 0.5;

        let mainliobj = $('<li/>', {
            id: `legendItem${i}`,
            class: 'fg-white'
        });
        $(mainliobj).on('click', function (evt) {
            onNodeClick(evt);
        });
        $(mainliobj).attr('data-caption', name);
        let item = `<span id='spectrum${rawSpectrumId}' `;
        item += getSquareClass(rawcolor, series.isVisible());
        item += `onclick='onSeriesClick(${rawSpectrumId})' onmouseover='onSeriesMouseOver(${rawSpectrumId})' onmouseout='onSeriesMouseOut(${rawSpectrumId})'></span>`
        $(mainliobj).attr('data-icon', item);

        if (spectraTree[i].Children.length > 0) {
            let ulobj = $('<ul/>');
            let childrenNum = spectraTree[i].Children.length;
            for (var j = 0; j < childrenNum; j++) {
                let childId = spectraTree[i].Children[j];

                let childcolor = getSeriesColor(childId);

                let isOpaque = true;

                let series = getSeriesFromId(childId);
                if (!series.isVisible()) {
                    opacity = 0.5;
                    isOpaque = false;
                }

                let childIdForEvent = childId;
                if (!Number.isInteger(childId))
                    childIdForEvent = `"${childId}"`;

                let childliobj = $('<li/>', {
                    class: 'fg-light'
                });
                $(childliobj).attr('data-caption', getSpectrumTypeById(childId));
                let html = `<span id='spectrum${childId}' `;
                html += getSquareClass(childcolor, isOpaque);
                html += `onclick='onSeriesClick(${childIdForEvent})' onmouseover='onSeriesMouseOver(${childIdForEvent})' onmouseout='onSeriesMouseOut(${childIdForEvent})'></span>`;
                html += `class="fg-white"></li>`;
                $(childliobj).attr('data-icon', html);

                $(childliobj).appendTo($(ulobj));
            }
            $(ulobj).appendTo(mainliobj);
        }

        $(mainliobj).appendTo('#legend');
    }

    Metro.makePlugin('#legend', 'treeview');
}

function getSquareClass(childcolor, isOpaque) {
    let backgroundColor = `background-color: ${childcolor}`;
    if (!isOpaque)
        backgroundColor = `background-color: transparent;`;

    return `class='colored-square pointer' style='${backgroundColor}; color: ${childcolor}; border: 3px solid ${childcolor}' `;
}

function refreshCharmsLegend() {
    if (Metro.charms.isOpen('#charmsLegend'))
        createCharmsLegend();
}

function toggleCharmsLegend() {
    Metro.getPlugin('#charmsLegend', 'charms').toggle();
}

/* ---------- LEGEND EVENTS ---------- */
/* this is used just to remove the 'selected' effect (which hides the spectrum name) when clicking on text */
function onNodeClick(evt) {
    executeAfter(function () {
        $(`#${evt.currentTarget.id}`).removeClass('current');
    }, 50);
}

function onSeriesClick(id) {
    const series = getSeriesFromId(id);

    const isSeriesContinuum = series.name.includes(getSpectrumTypeString(8));

    if (series.isVisible()) {
        series.hide()
        $(`#spectrum${id}`).css('background-color', 'transparent');
        if (isSeriesContinuum)
            setSpectrumVisibilityByName(SERIES_FIT_POINTS, false);
    } else {
        series.show();
        if (isSeriesContinuum)
            setSpectrumVisibilityByName(SERIES_FIT_POINTS, true);
        const colorValue = $(`#spectrum${id}`).css('color');
        $(`#spectrum${id}`).css('background-color', colorValue);
    }

    /* reset visual range to allow lines out of current visual range to be visualized */
    dxChartResetVisualRange(chartContainer);
}

function onSeriesMouseOut(id) {
    let seriesName = getSeriesNameFromId(id);
    let series = dxChartGetSeriesByName(chartContainer, seriesName);
    series.clearSelection();
}

function onSeriesMouseOver(id) {
    let seriesName = getSeriesNameFromId(id);
    let series = dxChartGetSeriesByName(chartContainer, seriesName);
    series.select();
}

/* ---------- SPECTRA TREE ---------- */
function addSpectrumToSpectraTree(id) {
    if (spectraTree.findIndex(x => x == id) == -1)
        spectraTree.push(getSpectraTreeItem(id));
}

function addSpectrumChildToSpectraTree(parentId, id) {
    let spectraTreeItem = spectraTree.find(x => x.Id == parentId);
    if (!spectraTreeItem)
        return;

    if (spectraTreeItem.Children.findIndex(x => x == id) == -1)
        spectraTreeItem.Children.push(id);
}

function getSpectraTreeItem(id) {
    return {
        Id: id,
        Children: []
    };
}

function getSpectraTreeItemsNum() {
    return spectraTree.length;
}

function initSpectraTree() {
    spectraTree = [];
}