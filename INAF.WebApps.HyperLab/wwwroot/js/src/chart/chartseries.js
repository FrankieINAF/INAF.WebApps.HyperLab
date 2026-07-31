function addChartSeries(newseries) {
    const option = chart.getOption();

    // Normalizza: se non è array, lo trasformo in array
    const seriesToAdd = Array.isArray(newseries) ? newseries : [newseries];

    let updated = false;

    for (const serie of seriesToAdd) {
        const exists = option.series.some(s => s.name === serie.name);
        if (!exists) {
            option.series.push(serie);
            updated = true;
        }
    }

    if (updated) {
        chart.setOption(option);
        updateAxisRange(0);
        updateAxisRange(1);
    }
}


function addPointToChartSeries(seriesName, point) {
    const option = chart.getOption();
    const series = option.series.find(s => s.name === seriesName);
    if (series) {
        series.data.push([point.X, point.Y]);
        chart.setOption(option);
    }
}

function findChartSeriesByName(name) {
    return chart.getOption().series.find(s => s.name === name) ?? null;
}

function findSeriesFromSpectrumId(spectrumId) {
    if (chart.getOption().series.some(s => s.valueField === buildId(spectrumId))) {
        const series = chart.getOption().series.find(s => s.valueField === buildId(spectrumId));
        return dxChartGetSeriesByName(series.name);
    }

    return null;
}

function findSeriesNameFromSpectrumId(spectrumId) {
    let index = getSpectrumIndexBySpectrumId(spectrumId);
    return getSpectrumSeriesNameFromIndex(index);
}

function getSeriesColor(spectrumId) {
    let index = getSpectrumIndexBySpectrumId(spectrumId);
    if (index < 0)
        return;

    if (spectraInfo[index].Color)
        return spectraInfo[index].Color;
    else {
        let index2 = dxChartGetAllSeries(chartContainer).findIndex(x => x.name == createSeriesNameFromSpectrumNameAndType(spectraInfo[index].Name, spectraInfo[index].SpectrumType));
        if (index2 < 0)
            return;
        return dxChartGetAllSeries()[index2].getColor();
    }
}

function isChartSeriesAvailableByName(name) {
    return findChartSeriesByName(name) !== null;
}