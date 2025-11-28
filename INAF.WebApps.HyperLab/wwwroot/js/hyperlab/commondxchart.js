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
function dxChartGetYValuesBoundaries(container) {
    const items = dxChartGetItems(container);

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

        container.dxChart("getSeriesByName", seriesName).hide();

        dxChartResetVisualRange(container);
    } catch (e) {
        console.log(`${dxChartHideSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function dxChartSetSeriesVisible(container, seriesName, isVisible) {
    try {
        if (isVisible)
            container.dxChart("getSeriesByName", seriesName).show();
        else
            container.dxChart("getSeriesByName", seriesName).hide();

        dxChartResetVisualRange(container);
    } catch (e) {
        console.log(`${dxChartSetSeriesVisible.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function dxChartShowSeries(container, seriesName) {
    try {
        if (dxChartGetSeriesByName(container, seriesName) == null)
            return;

        container.dxChart("getSeriesByName", seriesName).show();

        dxChartResetVisualRange(container);
    } catch (e) {
        console.log(`${dxChartShowSeries.name} - seriesName: ${seriesName} - ex: ${e}`);
    }
}

function dxChartUpdateSeries(container, chartSeries) {
    $(container).dxChart('instance').option("series", chartSeries);
}

function dxChartUpdateSeriesProperty(container, chartSeriesIndex, propertyName, propertyValue) {
    $(container).dxChart('instance').option(`series[${chartSeriesIndex}].${propertyName}`, propertyValue);
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