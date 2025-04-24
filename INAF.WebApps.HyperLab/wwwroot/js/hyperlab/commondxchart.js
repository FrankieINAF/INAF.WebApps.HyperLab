function dxChartGetChart(container) {
    return $(container).dxChart('instance');
}

/* -------------------------------------------------------------------------------- */
/* CHART UPDATE */
/* -------------------------------------------------------------------------------- */
function dxChartBeginUpdate(container) {
    $(container).dxChart('instance').beginUpdate();
}

function dxChartEndUpdate(container) {
    $(container).dxChart('instance').endUpdate();
}

/* -------------------------------------------------------------------------------- */
/* VISUAL RANGE */
/* -------------------------------------------------------------------------------- */
function dxChartGetVisualRangeX(container) {
    return container.dxChart("getArgumentAxis", "argumentAxis").visualRange();
}

function dxChartGetVisualRangeY(container) {
    return container.dxChart("getValueAxis", "valueAxis").visualRange();
}

function dxChartResetVisualRange(container) {
    $(container).dxChart('instance').resetVisualRange();
}

function dxChartResetZoom(container, visualRangeX, visualRangeY) {
    try {
        container.dxChart("getValueAxis", "valueAxis").visualRange(visualRangeY[0], visualRangeY[1]);
        container.dxChart("getArgumentAxis", "argumentAxis").visualRange(visualRangeX[0], visualRangeX[1]);
    } catch (e) {
        console.log(`resetZoom - ex: ${e}`);
    }
}

function dxChartSetVisualRangeY(container, visualRange) {
    container.dxChart("getValueAxis", "valueAxis").visualRange(visualRange);
}

/* -------------------------------------------------------------------------------- */
/* SERIES */
/* -------------------------------------------------------------------------------- */
function dxChartGetAllSeries(container) {
    return $(container).dxChart('instance').getAllSeries();
}

function dxChartGetSeriesByName(container, seriesName) {
    return $(container).dxChart('instance').getSeriesByName(seriesName);
}

function dxChartGetSeriesPoints(container, seriesName) {
    try {
        return $(container).dxChart('instance').getSeriesByName(seriesName).getAllPoints();
    } catch (e) {
        return null
    }
}

function dxChartHideSeries(container, seriesName) {
    try {
    if (dxChartGetSeriesByName(container, seriesName) == null)
            return;

        if (container.dxChart("getSeriesByName", seriesName).isVisible())
            container.dxChart("getSeriesByName", seriesName).hide();
    } catch (e) {
        console.log(`${dxChartHideSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function dxChartSetSeriesVisible(container, seriesName) {
    if (container.dxChart("getSeriesByName", seriesName).isVisible())
        container.dxChart("getSeriesByName", seriesName).hide();
    else
        container.dxChart("getSeriesByName", seriesName).show();

    dxChartResetVisualRange(container);
}

function dxChartShowSeries(container, seriesName) {
    if (!container.dxChart("getSeriesByName", seriesName).isVisible())
        container.dxChart("getSeriesByName", seriesName).hide();
}

function dxChartUpdateSeries(container, chartSeries) {
    $(container).dxChart('instance').option("series", chartSeries);
}

/* -------------------------------------------------------------------------------- */
/* ITEMS */
/* -------------------------------------------------------------------------------- */
function dxChartGetItems(container) {
    return $(container).dxChart('instance').getDataSource().items();
}

function dxChartRefresh(container) {
    $(container).dxChart('instance').refresh();
}

function dxChartUpdateOption(chart, optionName, value) {
    chart.option(optionName, value);
}

/* -------------------------------------------------------------------------------- */
/* AXES */
/* -------------------------------------------------------------------------------- */
/* 'unofficial' for values not explicitly defined but used by chart */
function dxChartGetUnofficialValueAxisMinorTickInterval(container) {
    return $(container).dxChart("instance").getValueAxis()['_minorTickInterval'];
}

function dxChartGetUnofficialValueAxisTickInterval(container) {
    return $(container).dxChart("instance").getValueAxis()['_tickInterval'];
}

function dxChartGetValueAxisMinorTickInterval(container) {
    return $(container).dxChart("instance").option('valueAxis.minorTickInterval')
}

function dxChartGetValueAxisTickInterval(container) {
    return $(container).dxChart("instance").option('valueAxis.tickInterval')
}