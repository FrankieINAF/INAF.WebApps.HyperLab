function addChartSeries(targetChart, newseries) {
    const option = targetChart.getOption();

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
        targetChart.setOption(option);
        updateAxisRange(targetChart, 0);
        updateAxisRange(targetChart, 1);
    }
}

function addPointsToChartSeries(targetChart, seriesName, newPoints) {
    const option = targetChart.getOption();
    const series = option.series.find(s => s.name === seriesName);
    if (!series) return;

    // retrieve all existant X values already present in the series
    const existingXs = new Set(
        series.data.map(p => Array.isArray(p) ? p[0] : p.value[0])
    );

    // Add only new points
    for (const p of newPoints) {
        const x = p.X;
        const y = p.Y;

        if (!existingXs.has(x)) {
            series.data.push([x, y]);
        }
    }

    // Sort the series by X (necessary for line series)
    series.data.sort((a, b) => a[0] - b[0]);

    targetChart.setOption(option);
}

function findChartSeriesByName(targetChart, name) {
    return targetChart.getOption().series.find(s => s.name === name) ?? null;
}

function findSeriesFromSpectrumId(targetChart, spectrumId) {
    if (targetChart.getOption().series.some(s => s.valueField === buildId(spectrumId))) {
        const series = targetChart.getOption().series.find(s => s.valueField === buildId(spectrumId));
        return getSeries(targetChart, series.name);
    }

    return null;
}

function findSeriesNameFromSpectrumId(spectrumId) {
    let index = getSpectrumIndexBySpectrumId(spectrumId);
    return getSpectrumSeriesNameFromIndex(index);
}

function getAllSeries(targetChart) {
    return targetChart.getOption().series.map(function (s) {
        return {
            name: s.name,
            getColor: function () { return s.color; },
            isVisible: function () { return dxChartHiddenSeriesNames.indexOf(s.name) == -1; },
            hide: function () { hideSeries(targetChart, s.name); },
            show: function () { showSeries(targetChart, s.name); }
        };
    });
}

function getSeries(targetChart, seriesName) {
    const series = targetChart.getOption().series.find(s => s.name == seriesName);
    return {
        name: series.name,
        getColor: function () { return series.color; },
        isVisible: function () { return dxChartHiddenSeriesNames.indexOf(series.name) == -1; },
        hide: function () { hideSeries(targetChart, series.name); },
        show: function () { showSeries(targetChart, series.name); }
    };
}

function getSeriesNameFromSelectedSpectrumNameAndSpectrumType(selectedSpectrumName, spectrumType) {
    const spectrum = getSpectrumByNameAndSpectrumType(selectedSpectrumName, spectrumType);
    if (!spectrum)
        return null;
    return createSeriesNameFromSpectrumNameAndType(spectrum.Name, spectrum.SpectrumType);
}

function getSeriesColor(targetChart, spectrumId) {
    let index = getSpectrumIndexBySpectrumId(spectrumId);
    if (index < 0)
        return;

    if (spectraInfo[index].Color)
        return spectraInfo[index].Color;
    else {
        let index2 = getAllSeries(targetChart).findIndex(x => x.name == createSeriesNameFromSpectrumNameAndType(spectraInfo[index].Name, spectraInfo[index].SpectrumType));
        if (index2 < 0)
            return;
        return getAllSeries(targetChart)[index2].getColor();
    }
}

function getSeriesPoints(targetChart, seriesName) {
    try {
        const found = targetChart.getOption().series.find(s => s.name == seriesName);
        if (!found)
            return null;

        return found.data.map(function (p) { return { argument: p[0], value: p[1] }; });
    } catch (e) {
        return null;
    }
}

function hideSeries(targetChart, seriesName) {
    try {
        if (getSeries(targetChart, seriesName) == null)
            return;

        targetChart.dispatchAction({ type: 'legendUnSelect', name: seriesName });
        if (dxChartHiddenSeriesNames.indexOf(seriesName) == -1)
            dxChartHiddenSeriesNames.push(seriesName);

        resetVisualRange(targetChart);
    } catch (e) {
        console.log(`${hideSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function isChartSeriesAvailableByName(targetChart, name) {
    return findChartSeriesByName(targetChart, name) !== null;
}

function removeSeries(targetChart, seriesName) {
    const option = targetChart.getOption();

    option.series = option.series.filter(s => {
        const name = Array.isArray(s.name) ? s.name[0] : s.name;
        return name !== seriesName;
    });

    // notMerge = true per evitare che ECharts fonda con le vecchie serie
    targetChart.setOption(option, true);
}

function setSeriesVisible(targetChart, seriesName, isVisible) {
    try {
        if (isVisible)
            showSeries(targetChart, seriesName);
        else
            hideSeries(targetChart, seriesName);
    } catch (e) {
        console.log(`${setSeriesVisible.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function showSeries(targetChart, seriesName) {
    try {
        if (getSeries(targetChart, seriesName) == null)
            return;

        targetChart.dispatchAction({ type: 'legendSelect', name: seriesName });
        dxChartHiddenSeriesNames = dxChartHiddenSeriesNames.filter(x => x != seriesName);

        resetVisualRange(targetChart);
    } catch (e) {
        console.log(`${showSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function updateSeriesColor(targetChart, seriesName, newColor) {
    const option = targetChart.getOption();
    const series = option.series.find(s => s.name === seriesName);
    if (!series) return;

    // line color
    series.lineStyle = {
        ...series.lineStyle,
        color: newColor
    };

    // point color
    series.itemStyle = {
        ...series.itemStyle,
        color: newColor
    };

    // symbol color (scatter, line with showSymbol)
    series.color = newColor;

    targetChart.setOption(option);
}

/* -------------------------------------------------------------------------------- */
/* ADD FIT POINT */
/* -------------------------------------------------------------------------------- */
function addFitPointToChartSeries(targetChart, point) {
    const option = targetChart.getOption();
    const series = option.series.find(s => s.name === SERIES_FIT_POINTS);
    if (series) {
        series.data.push([point.X, point.Y]);
        targetChart.setOption(option);
    }
}