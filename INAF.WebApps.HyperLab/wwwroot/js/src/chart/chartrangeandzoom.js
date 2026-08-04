/* series visibility is tracked locally since ECharts does not expose a public getter */
var dxChartHiddenSeriesNames = [];

/* -------------------------------------------------------------------------------- */
/* VISUAL RANGE */
/* -------------------------------------------------------------------------------- */
function getYRange() {
    const option = chart.getOption();
    return computeGlobalRange(option, 1);
}

function computeGlobalRange(option, axisIndex) {
    let valmin = Infinity;
    let valmax = -Infinity;

    for (const s of option.series) {
        const series = getSeries(s.name);
        if (series.name == SERIES_FIT_POINTS || series.name == SERIES_ALIGNMENT_CONSTANT_LINES || !series.isVisible())
            continue;

        if (Array.isArray(s.data)) {
            for (const point of s.data) {
                const val = Array.isArray(point) ? point[axisIndex] : point;
                if (typeof val === "number") {
                    if (val < valmin) valmin = val;
                    if (val > valmax) valmax = val;
                }
            }
            //console.log(`computeGlobalRange - series: ${s.name}, valmin: ${valmin}, valmax: ${valmax}`);
        }
    }

    return { valmin, valmax };
}

function updateAxisRange(axisIndex) {
    const option = chart.getOption();
    const { valmin, valmax } = computeGlobalRange(option, axisIndex);

    if (axisIndex === 0) {
        option.xAxis[0].min = valmin - 10;
        option.xAxis[0].max = valmax + 10;
    } else if (axisIndex === 1) {
        option.yAxis[0].min = valmin * 0.98;
        option.yAxis[0].max = valmax * 1.02;
    }

    chart.setOption(option);
}

function resetVisualRange() {
    updateAxisRange(0);
    updateAxisRange(1);
}

function resetZoom(visualRangeX, visualRangeY) {
    try {
        chart.setOption({
            xAxis: { min: visualRangeX[0], max: visualRangeX[1] },
            yAxis: { min: visualRangeY[0], max: visualRangeY[1] }
        });
    } catch (e) {
        console.log(`resetZoom - ex: ${e}`);
    }
}

function setVisualRange(visualRange) {
    chart.setOption({
        yAxis: { min: visualRange[0], max: visualRange[1] }
    });
}

/* -------------------------------------------------------------------------------- */
/* AXES */
/* -------------------------------------------------------------------------------- */
/* 'unofficial' for values not explicitly defined but used by chart */
function getYAxisMinorTickInterval() {
    return chart.getOption().yAxis[0].minorTick?.splitNumber;
}

function getYAxisTickInterval() {
    return chart.getOption().yAxis[0].interval;
}