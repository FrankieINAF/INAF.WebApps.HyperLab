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
    const lowerSpectrumType = Math.min(...spectraInfo.map(x => x.SpectrumType));
    let rawSpectra = getSpectraBySpectrumType(lowerSpectrumType);

    if (!rawSpectra || rawSpectra.length == 0)
        return;

    initSpectraTree();

    /* add ref spectrum to list */
    let refSpectrums = getSpectraBySpectrumType(SPECTRUM_TYPE_REF);
    if (refSpectrums.length > 0)
        addSpectrumToSpectraTree(refSpectrums[0].Id);

    /* add ref-white spectrum to list */
    let refWhiteSpectrums = getSpectraBySpectrumType(SPECTRUM_TYPE_REF_WHITE);
    if (refWhiteSpectrums.length > 0)
        addSpectrumToSpectraTree(refWhiteSpectrums[0].Id);

    /* build array with spectra */
    let rawSpectraNum = rawSpectra.length;
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
            class: 'fg-white'
        });
        $(mainliobj).attr('data-caption', name);
        $(mainliobj).attr('data-icon', `<span id='spectrum${rawSpectrumId}' class='mif-chevron-right pointer' style='background-color: ${rawcolor}; color: ${rawcolor}; opacity: ${opacity}' onclick='onSeriesClick(${rawSpectrumId})' onmouseover='onSeriesMouseOver(${rawSpectrumId})' onmouseout='onSeriesMouseOut(${rawSpectrumId})'></span>>`);

        if (spectraTree[i].Children.length > 0) {
            let ulobj = $('<ul/>');
            let childrenNum = spectraTree[i].Children.length;
            for (var j = 0; j < childrenNum; j++) {
                let childId = spectraTree[i].Children[j];

                let childcolor = getSeriesColor(childId);

                let opacity = 1;
                let series = getSeriesFromId(rawSpectrumId);
                if (!series.isVisible()) opacity = 0.5;

                let childIdForEvent = childId;
                if (!Number.isInteger(childId))
                    childIdForEvent = `"${childId}"`;

                let childliobj = $('<li/>', {
                    class: 'fg-light'
                });
                $(childliobj).attr('data-caption', getSpectrumTypeById(childId));
                let html = `<span id='spectrum${childId}' class='mif-chevron-right pointer' style='background-color: ${childcolor}; color: ${childcolor}; opacity: ${opacity}' `;
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

function refreshCharmsLegend() {
    if (Metro.charms.isOpen('#charmsLegend'))
        createCharmsLegend();
}

function toggleCharmsLegend() {
    Metro.getPlugin('#charmsLegend', 'charms').toggle();
}

/* ---------- LEGEND EVENTS ---------- */
function onSeriesClick(id) {
    let series = getSeriesFromId(id);
    if (series.isVisible()) {
        series.hide()
        $(`#spectrum${id}`).css({ opacity: 0.5 });
    } else {
        series.show();
        $(`#spectrum${id}`).css({ opacity: 1 });
    }
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