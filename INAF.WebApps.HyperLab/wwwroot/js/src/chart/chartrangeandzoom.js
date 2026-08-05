/* series visibility is tracked locally since ECharts does not expose a public getter */
var dxChartHiddenSeriesNames = [];

/* -------------------------------------------------------------------------------- */
/* VISUAL RANGE */
/* -------------------------------------------------------------------------------- */
function computeGlobalRange(targetChart, option, axisIndex) {
    let valmin = Infinity;
    let valmax = -Infinity;

    for (const s of option.series) {
        const series = getSeries(targetChart, s.name);
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

function getYRange(targetChart) {
    const option = targetChart.getOption();
    return computeGlobalRange(targetChart, option, 1);
}

function updateAxisRange(targetchart, axisIndex, extendRange = true) {
    const option = targetchart.getOption();
    const { valmin, valmax } = computeGlobalRange(targetchart, option, axisIndex);

    if (axisIndex === 0) {
        if (extendRange) {
            option.xAxis[0].min = valmin - 10;
            option.xAxis[0].max = valmax + 10;
        } else {
            option.xAxis[0].min = valmin;
            option.xAxis[0].max = valmax;
        }
    } else if (axisIndex === 1) {
        if (extendRange) {
            option.yAxis[0].min = valmin * 0.98;
            option.yAxis[0].max = valmax * 1.02;
        } else {
            option.yAxis[0].min = valmin;
            option.yAxis[0].max = valmax;
        }
    }

    targetchart.setOption(option);
}

function resetVisualRange(targetchart, extendRange = true) {
    updateAxisRange(targetchart, 0, extendRange);
    updateAxisRange(targetchart, 1, extendRange);
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
    const option = chart.getOption();

    let minY = Infinity;
    let maxY = -Infinity;

    for (const s of option.series) {
        if (!s.data) continue;

        for (const p of s.data) {
            const y = Array.isArray(p) ? p[1] : p.value[1];
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    if (!isFinite(minY) || !isFinite(maxY)) return 0;

    const range = maxY - minY;

    // intervallo utile per error bar
    return range / 20; // 5% del range
}


function getYAxisTickInterval() {
    return chart.getOption().yAxis[0].interval;
}