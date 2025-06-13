var SERIES_JOYSTICK_POINT = 'JoystickPoint';
var joystickPointSeries;

/* -------------------------------------------------------------------------------- */
/* CHART MAGNIFIER */
/* -------------------------------------------------------------------------------- */
function createChartMagnifier() {
    /* dispose existant chart, avoiding issues with zoom when recreating */
    disposeChartMagnifier();

    let dataSource = chartContainer.dxChart('getDataSource');
    //const series = dxChartGetAllSeries(chartContainer);

    chartMagnifier = chartMagnifierContainer.dxChart({
        /* data */
        dataSource: dataSource,
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
        },
        series: chartSeries,
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
    isChartMagnifierLoaded = false;
}

function roundValue(value) {
    return Math.round(value / 40) * 40;
}


function updateVisualRangesFromDataSource(chartX, chartY) {
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

    chartMagnifierContainer.dxChart("getArgumentAxis").visualRange(axisRangeMinX, axisRangeMaxX);
    chartMagnifierContainer.dxChart("getValueAxis").visualRange(axisRangeMinY, axisRangeMaxY);

    setJoystickPointOnChart({ P: { X: chartX, Y: chartY } });
}

function updateChartMagnifierSeriesVisibility() {
    const chartSeries = chartContainer.dxChart('getAllSeries');
    const chartSeriesNum = chartSeries.length;
    for (var i = 0; i < chartSeriesNum; i++) {
        const chartMagnifierSeries = chartMagnifierContainer.dxChart('getAllSeries').find(x => x.name == chartSeries[i].name);
        //console.log(`chartSeries[${i}].name:'${chartSeries[i].name}', chartSeries[${i}].isVisible(): ${chartSeries[i].isVisible()}`);
        chartSeries[i].isVisible() ? chartMagnifierSeries.show() : chartMagnifierSeries.hide();
    }

}

function setJoystickPointOnChart(point) {
    if (!joystickPointSeries) {
        joystickPointSeries = {
            valueField: SERIES_JOYSTICK_POINT,
            name: SERIES_JOYSTICK_POINT,
            axis: 'valueAxis',
            color: '#1ba1e2',
            width: 0,
            point: { visible: true },
            isVisible: true
        };

        addChartSeries(joystickPointSeries);
    }

    let items = dxChartGetItems(chartMagnifierContainer);

    setPointOnChart(items, point.P.X, point.P.Y, SERIES_JOYSTICK_POINT);
}