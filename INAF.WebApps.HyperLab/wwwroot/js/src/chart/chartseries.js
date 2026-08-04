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

function addPointsToChartSeries(seriesName, newPoints) {
    const option = chart.getOption();
    const series = option.series.find(s => s.name === seriesName);
    if (!series) return;

    // Raccogli tutti gli X già presenti nella serie
    const existingXs = new Set(
        series.data.map(p => Array.isArray(p) ? p[0] : p.value[0])
    );

    // Aggiungi solo i punti nuovi
    for (const p of newPoints) {
        const x = p.X;
        const y = p.Y;

        if (!existingXs.has(x)) {
            series.data.push([x, y]);
        }
    }

    // Ordina la serie per X (necessario per serie line)
    series.data.sort((a, b) => a[0] - b[0]);

    chart.setOption(option);
}

function findChartSeriesByName(name) {
    return chart.getOption().series.find(s => s.name === name) ?? null;
}

function findSeriesFromSpectrumId(spectrumId) {
    if (chart.getOption().series.some(s => s.valueField === buildId(spectrumId))) {
        const series = chart.getOption().series.find(s => s.valueField === buildId(spectrumId));
        return getSeries(series.name);
    }

    return null;
}

function findSeriesNameFromSpectrumId(spectrumId) {
    let index = getSpectrumIndexBySpectrumId(spectrumId);
    return getSpectrumSeriesNameFromIndex(index);
}

function getAllSeries() {
    return chart.getOption().series.map(function (s) {
        return {
            name: s.name,
            getColor: function () { return s.color; },
            isVisible: function () { return dxChartHiddenSeriesNames.indexOf(s.name) == -1; },
            hide: function () { hideSeries(s.name); },
            show: function () { showSeries(s.name); }
        };
    });
}

function getSeries(seriesName) {
    const series = chart.getOption().series.find(s => s.name == seriesName);
    return {
        name: series.name,
        getColor: function () { return series.color; },
        isVisible: function () { return dxChartHiddenSeriesNames.indexOf(series.name) == -1; },
        hide: function () { hideSeries(series.name); },
        show: function () { showSeries(series.name); }
    };
}

function getSeriesColor(spectrumId) {
    let index = getSpectrumIndexBySpectrumId(spectrumId);
    if (index < 0)
        return;

    if (spectraInfo[index].Color)
        return spectraInfo[index].Color;
    else {
        let index2 = getAllSeries(chartContainer).findIndex(x => x.name == createSeriesNameFromSpectrumNameAndType(spectraInfo[index].Name, spectraInfo[index].SpectrumType));
        if (index2 < 0)
            return;
        return getAllSeries()[index2].getColor();
    }
}

function getSeriesPoints(seriesName) {
    try {
        const found = chart.getOption().series.find(s => s.name == seriesName);
        if (!found)
            return null;

        return found.data.map(function (p) { return { argument: p[0], value: p[1] }; });
    } catch (e) {
        return null;
    }
}

function hideSeries(seriesName) {
    try {
        if (getSeries(seriesName) == null)
            return;

        chart.dispatchAction({ type: 'legendUnSelect', name: seriesName });
        if (dxChartHiddenSeriesNames.indexOf(seriesName) == -1)
            dxChartHiddenSeriesNames.push(seriesName);

        resetVisualRange();
    } catch (e) {
        console.log(`${hideSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function isChartSeriesAvailableByName(name) {
    return findChartSeriesByName(name) !== null;
}

function removeSeries(seriesName) {
    const option = chart.getOption();

    option.series = option.series.filter(s => {
        const name = Array.isArray(s.name) ? s.name[0] : s.name;
        return name !== seriesName;
    });

    // notMerge = true per evitare che ECharts fonda con le vecchie serie
    chart.setOption(option, true);
}

function setSeriesVisible(container, seriesName, isVisible) {
    try {
        if (isVisible)
            showSeries(seriesName);
        else
            hideSeries(seriesName);
    } catch (e) {
        console.log(`${setSeriesVisible.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function showSeries(seriesName) {
    try {
        if (getSeries(seriesName) == null)
            return;

        chart.dispatchAction({ type: 'legendSelect', name: seriesName });
        dxChartHiddenSeriesNames = dxChartHiddenSeriesNames.filter(x => x != seriesName);

        resetVisualRange();
    } catch (e) {
        console.log(`${showSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function updateSeriesColor(seriesName, newColor) {
    const option = chart.getOption();
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

    chart.setOption(option);
}
