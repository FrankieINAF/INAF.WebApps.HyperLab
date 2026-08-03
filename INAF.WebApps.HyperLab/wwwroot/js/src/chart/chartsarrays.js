var familyIds = [];

function hideSpectraToBeHidden() {
    let spectraToBeHidden = dxChartGetAllSeries().filter(x => !x.isVisible());
    spectraToBeHidden.forEach(function (item) {
        dxChartHideSeries(item.name);
    });

    return spectraToBeHidden.length;
}

/* ################################################################################ */
/* CHARTS SERIES ITEMS */
/* ################################################################################ */
// function addChartSeriesItems(items, xValues, yValues, seriesName) {
//     let xValuesNum = xValues.length;
//     for (var i = 0; i < xValuesNum; i++) {
//         let index = items.findIndex(p => p.X == xValues[i]);
//         if (index > -1) {
//             items[index][seriesName] = yValues[i];
//         }
//     }
// }

// function deleteChartSeriesItems(items, seriesName) {
//     items.forEach(function (item) {
//         delete item[seriesName];
//     });
// }

/* ################################################################################ */
/* CHARTS SERIES */
/* ################################################################################ */
// function addChartSeries(series) {
//     if (chartSeries.findIndex(x => x.name == series.name) == -1)
//         chartSeries.push(series);
// }

// function findChartSeriesIndexByValueFieldId(valueField) {
//     return chartSeries.findIndex(x => x.valueField == valueField);
// }

// function findChartSeriesIndexByName(name) {
//     return chartSeries.findIndex(x => x.name == name);
// }

// function getSeriesColor(id) {
//     let index = getSpectrumIndexBySpectrumId(id);
//     if (index < 0)
//         return;

//     if (spectraInfo[index].Color)
//         return spectraInfo[index].Color;
//     else {
//         let index2 = dxChartGetAllSeries(chartContainer).findIndex(x => x.name == createSeriesNameFromSpectrumNameAndType(spectraInfo[index].Name, spectraInfo[index].SpectrumType));
//         if (index2 < 0)
//             return;
//         return dxChartGetAllSeries(chartContainer)[index2].getColor();
//     }
// }

// function findSeriesFromSpectrumId(spectrumId) {
//     let seriesName = getSeriesNameFromSpectrumId(spectrumId);
//     return dxChartGetSeriesByName(chartContainer, seriesName);
// }

// function getSeriesIndexByValueField(valueField) {
//     return chartSeries.findIndex(x => x.valueField == valueField);
// }



// function getSeriesPoints(id) {
//     let index = getSpectrumIndexBySpectrumId(id);
//     if (index < 0)
//         return;

//     return dxChartGetSeriesPoints(chartContainer, getSpectrumSeriesNameFromIndex(index));
// }

// function removeChartSeriesAt(index) {
//     if (index < 0)
//         return;

//     chartSeries.splice(index, 1);
// }

// function initChartSeries() {
//     chartSeries = [];
// }



/* ################################################################################ */
/* COMPLEX OPERATIONS ON CHARTS SERIES */
/* ################################################################################ */
function removeChartSeriesByFieldId(chartContainer, fieldId) {
    let items = dxChartGetItems(chartContainer);

    /* remove series */
    let index = findChartSeriesIndexByValueFieldId(fieldId);
    if (index > -1) {
        removeChartSeriesAt(index);
        deleteChartSeriesItems(items, fieldId);
    }
}

function removeChartSeriesByFieldIdProcedure(chartContainer, items, fieldId) {
    /* remove series */
    let index = findChartSeriesIndexByValueFieldId(fieldId);
    if (index > -1) {
        removeChartSeriesAt(index);
        deleteChartSeriesItems(items, fieldId);
    }
}

function removeChartSeriesByFieldsIdProcedure(chartContainer, fieldsId) {
    let items = dxChartGetItems(chartContainer);
    fieldsId.forEach(function (fieldId) {
        /* remove series */
        let index = findChartSeriesIndexByValueFieldId(fieldId);
        if (index > -1) {
            removeChartSeriesAt(index);
            deleteChartSeriesItems(items, fieldId);
        }
    });
}

function removeChartSeriesByNameProcedure(chartContainer, seriesName) {
    /* remove series */
    let index = findChartSeriesIndexByName(seriesName);
    if (index > -1) {
        removeChartSeriesAt(index);
    }
}

function removePointsFromChart(chartContainer, xValues, seriesName) {
    let items = dxChartGetItems(chartContainer);

    let xValuesNum = xValues.length;
    for (var i = 0; i < xValuesNum; i++) {
        let index = items.findIndex(p => p.X == xValues[i]);
        if (items[index][seriesName])
            delete items[index][seriesName];
    }

    dxChartRefresh(chartContainer);
}
