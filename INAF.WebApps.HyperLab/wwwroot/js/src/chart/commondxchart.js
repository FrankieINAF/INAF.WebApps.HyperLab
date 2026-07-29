/* series visibility is tracked locally since ECharts does not expose a public getter */
var dxChartHiddenSeriesNames = [];

function dxChartGetChart(container) {
    return chart;
}

/* -------------------------------------------------------------------------------- */
/* VISUAL RANGE */
/* -------------------------------------------------------------------------------- */
function dxChartGetYValuesBoundaries() {
    const items = dxChartGetItems();

    const keys = Object.keys(items[0]);
    const goodKeys = keys.filter(x => x.includes('id'));

    let values = [];
    items.forEach(item => {
        goodKeys.forEach(key => {
            values.push(item[key]);
        });
    });

    const minYValue = Math.min(...values);
    const maxYValue = Math.max(...values);

    return { minYValue, maxYValue };
}

function dxChartGetVisualRangeX() {
    const axis = chart.getOption().xAxis[0];
    return [axis.min, axis.max];
}

function dxChartGetVisualRangeY() {
    const axis = chart.getOption().yAxis[0];
    return [axis.min, axis.max];
}

function dxChartResetVisualRange() {
    chart.setOption({
        xAxis: { min: null, max: null },
        yAxis: { min: null, max: null }
    });
    chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
}

function dxChartResetZoom(visualRangeX, visualRangeY) {
    try {
        chart.setOption({
            xAxis: { min: visualRangeX[0], max: visualRangeX[1] },
            yAxis: { min: visualRangeY[0], max: visualRangeY[1] }
        });
    } catch (e) {
        console.log(`resetZoom - ex: ${e}`);
    }
}

function dxChartSetVisualRangeY(visualRange) {
    chart.setOption({
        yAxis: { min: visualRange[0], max: visualRange[1] }
    });
}

/* -------------------------------------------------------------------------------- */
/* SERIES */
/* -------------------------------------------------------------------------------- */
function dxChartGetAllSeries() {
    return chart.getOption().series.map(function (s) {
        return {
            name: s.name,
            getColor: function () { return s.color; },
            isVisible: function () { return dxChartHiddenSeriesNames.indexOf(s.name) == -1; },
            hide: function () { dxChartHideSeries(s.name); },
            show: function () { dxChartShowSeries(s.name); }
        };
    });
}

function dxChartGetSeriesByName(seriesName) {
    const series = chart.getOption().series.find(s => s.name == seriesName);
    return {
        name: series.name,
        getColor: function () { return series.color; },
        isVisible: function () { return dxChartHiddenSeriesNames.indexOf(series.name) == -1; },
        hide: function () { dxChartHideSeries(series.name); },
        show: function () { dxChartShowSeries(series.name); }
    };
}

function dxChartGetSeriesPoints(seriesName) {
    try {
        const found = chart.getOption().series.find(s => s.name == seriesName);
        if (!found)
            return null;

        return found.data.map(function (p) { return { argument: p[0], value: p[1] }; });
    } catch (e) {
        return null;
    }
}

function dxChartHideSeries(seriesName) {
    try {
        if (dxChartGetSeriesByName(seriesName) == null)
            return;

        chart.dispatchAction({ type: 'legendUnSelect', name: seriesName });
        if (dxChartHiddenSeriesNames.indexOf(seriesName) == -1)
            dxChartHiddenSeriesNames.push(seriesName);

        dxChartResetVisualRange();
    } catch (e) {
        console.log(`${dxChartHideSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function dxChartSetSeriesVisible(container, seriesName, isVisible) {
    try {
        if (isVisible)
            dxChartShowSeries(seriesName);
        else
            dxChartHideSeries(seriesName);
    } catch (e) {
        console.log(`${dxChartSetSeriesVisible.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function dxChartShowSeries(seriesName) {
    try {
        if (dxChartGetSeriesByName(seriesName) == null)
            return;

        chart.dispatchAction({ type: 'legendSelect', name: seriesName });
        dxChartHiddenSeriesNames = dxChartHiddenSeriesNames.filter(x => x != seriesName);

        dxChartResetVisualRange();
    } catch (e) {
        console.log(`${dxChartShowSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function dxChartUpdateSeriesProperty(container, chartSeriesIndex, propertyName, propertyValue) {
    const series = chart.getOption().series;
    if (!series[chartSeriesIndex])
        return;

    const patch = {};
    patch[propertyName] = propertyValue;
    series[chartSeriesIndex] = Object.assign({}, series[chartSeriesIndex], patch);

    chart.setOption({ series: series }, { replaceMerge: 'series' });
}

/* -------------------------------------------------------------------------------- */
/* ITEMS */
/* -------------------------------------------------------------------------------- */
function dxChartGetItems(container) {
    return points;
}

function dxChartRefresh(container) {
    chart.resize();
}

function dxChartUpdateOption(chartInstance, optionName, value) {
    const patch = {};
    patch[optionName] = value;
    chartInstance.setOption(patch);
}

/* -------------------------------------------------------------------------------- */
/* AXES */
/* -------------------------------------------------------------------------------- */
/* 'unofficial' for values not explicitly defined but used by chart */
function dxChartGetUnofficialValueAxisMinorTickInterval(container) {
    return chart.getOption().yAxis[0].minorTick?.splitNumber;
}

function dxChartGetUnofficialValueAxisTickInterval(container) {
    return chart.getOption().yAxis[0].interval;
}

function dxChartGetValueAxisMinorTickInterval(container) {
    return chart.getOption().yAxis[0].minorTick?.splitNumber;
}

function dxChartGetValueAxisTickInterval(container) {
    return chart.getOption().yAxis[0].interval;
}
