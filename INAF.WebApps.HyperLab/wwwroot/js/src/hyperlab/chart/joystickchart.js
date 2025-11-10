var SERIES_JOYSTICK_POINT = 'JoystickPoint';
var joystickPointSeries;

var chartMagnifierSeries;

/* -------------------------------------------------------------------------------- */
/* CHART MAGNIFIER */
/* -------------------------------------------------------------------------------- */
function createChartMagnifier(dataSource, valueAxisVisualRange) {
    /* dispose existant chart, avoiding issues with zoom when recreating */
    disposeChartMagnifier();

    chartMagnifier = chartMagnifierContainer.dxChart({
        /* data */
        dataSource: dataSource,
        animation: false,
        commonPaneSettings: {
            backgroundColor: "#ffffff",
        },
        commonSeriesSettings: {
            argumentField: "X",
            type: "line",
            point: { visible: false },
            maxLabelCount: 10,
        },
        argumentAxis: {
            name: 'argumentAxis',
            argumentType: 'numeric',
            type: 'continuous',
            valueMarginsEnabled: true,
            visible: false,
            label: {
                displayMode: "rotate",
                rotationAngle: 45,
                format: "decimal",
                font: {
                    color: '#ffffff'
                }
            },
            tickInterval: 40,
            minorTickInterval: 20,
        },
        valueAxis: {
            name: 'valueAxis',
            type: 'continuous',
            showZero: false,
            visible: true,
            label: {
                visible: true,
                font: {
                    color: '#ffffff'
                }
            },
            visualRange: valueAxisVisualRange
        },
        series: chartMagnifierSeries,
        scrollBar: {
            visible: false
        },
        size: {
            height: 140,
            width: 160
        },
        commonAxisSettings: {
            grid: {
                visible: true
            },
            minorGrid: {
                visible: false
            },
        },
        crosshair: {
            enabled: false
        },
        legend: {
            visible: false
        },
        /* export options */
        export: {
            enabled: false,
        }
    }).dxChart("instance");

    /* free memory */
    dataSource = 0;

    updateChartMagnifierSeriesVisibility();

    isChartMagnifierLoaded = true;
}

function disposeChartMagnifier() {
    if (!isChartMagnifierLoaded)
        return;

    chartMagnifierContainer.dxChart("dispose");
    $(chartMagnifierContainer).empty();
    $('#chartMagnifier').css('margin', 'auto');
    isChartMagnifierLoaded = false;
}

function roundValue(value) {
    return Math.round(value / 40) * 40;
}


function updateVisualRangesFromDataSource(chartX, chartY) {
    chartMagnifierSeries = chartSeries.filter(x => x.isVisible);

    if (!chartMagnifierSeries || chartMagnifierSeries.length == 0)
        return;

    const valueFields = chartMagnifierSeries.map(x => x.valueField);

    const minorTicksValuesX = chartContainer.dxChart('getArgumentAxis').getTicksValues().minorTicksValues
    const diffX = Math.abs(Math.floor(minorTicksValuesX[1] - minorTicksValuesX[0]) / 5);
    const axisRangeMinX = roundValue(chartX - diffX);
    const axisRangeMaxX = roundValue(chartX + diffX);
    //console.log(`chartX:${chartX}, diffX:${diffX}, axisRangeMinX:${axisRangeMinX}, axisRangeMaxX:${axisRangeMaxX}`);

    const majorTicksValuesY = chartContainer.dxChart('getValueAxis').getTicksValues().majorTicksValues
    const diffY = Math.abs(majorTicksValuesY[1] - majorTicksValuesY[0]);
    const axisRangeMinY = chartY - diffY;
    const axisRangeMaxY = chartY + diffY;
    //console.log(`chartY:${chartY}, diffY:${diffY}, axisRangeMinY:${axisRangeMinY}, axisRangeMaxY:${axisRangeMaxY}`);

    const keys = Object.keys(points[0]);

    let commonValueFields = valueFields.filter(value => keys.includes(value));
    commonValueFields.push('X');

    let magnifierPoints = points.filter(p => p.X >= axisRangeMinX && p.X <= axisRangeMaxX);

    magnifierPoints = magnifierPoints.map(obj =>
        Object.keys(obj)
            .filter(key => commonValueFields.includes(key))
            .reduce((acc, key) => {
                acc[key] = obj[key];
                return acc;
            }, {})
    );

    if (!magnifierPoints || magnifierPoints.length == 0)
        return;

    createChartMagnifier(magnifierPoints, [axisRangeMinY, axisRangeMaxY]);

    setJoystickPointOnChart({ X: chartX, Y: chartY });
}

function updateChartMagnifierSeriesVisibility() {
    const chartSeries = chartContainer.dxChart('getAllSeries');
    const chartSeriesNum = chartSeries.length;
    for (var i = 0; i < chartSeriesNum; i++) {
        const chartMagnifierSeries = chartMagnifierContainer.dxChart('getAllSeries').find(x => x.name == chartSeries[i].name);
        if (!chartMagnifierSeries)
            continue;
        //console.log(`chartSeries[${i}].name:'${chartSeries[i].name}', chartSeries[${i}].isVisible(): ${chartSeries[i].isVisible()}`);
        chartSeries[i].isVisible() ? chartMagnifierSeries.show() : chartMagnifierSeries.hide();
    }

}

function setJoystickPointOnChart(point) {
    /* define the joystick point series */
    joystickPointSeries = {
        valueField: SERIES_JOYSTICK_POINT,
        name: SERIES_JOYSTICK_POINT,
        axis: 'valueAxis',
        color: '#1ba1e2',
        width: 0,
        point: { visible: true },
        isVisible: true
    };

    /* retrieve already available items to add the point to them */
    const items = dxChartGetItems(chartMagnifierContainer);

    const xValues = [ point.X ];
    removePointsFromChart(chartMagnifierContainer, xValues, SERIES_JOYSTICK_POINT);

    /* add the point to the chart and update series to meke it visible */
    setPointOnChart(items, point.X, point.Y, SERIES_JOYSTICK_POINT);

    chartMagnifierSeries.push(joystickPointSeries);

    dxChartUpdateSeries(chartMagnifierContainer, chartMagnifierSeries);

    dxChartRefresh(chartMagnifierContainer);
}