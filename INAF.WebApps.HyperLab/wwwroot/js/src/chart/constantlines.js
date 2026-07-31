var CHART_CONSTANT_LINES_ALIGNMENT = 'chartconstantlinesalignment';
var CHART_CONSTANT_LINES_FIT_POINTS = 'chartconstantlinesfitpoints';

function initConstantLines() {
    chartConstantLines = {};
}

function addOrUpdateConstantLines(name, constantLines, targetSeries) {
    removeConstantLines(name, targetSeries);

    const option = chart.getOption();
    const index = option.series.findIndex(s => s.name === targetSeries);
    if (index < 0)
        return;

    option.series[index].markLine = constantLines;

    chart.setOption(option);
}

function buildConstantLinesForSeries(name, coords, color) {
    return {
        silent: true,
        symbol: 'none',
        showSymbol: true,
        lineStyle: { color: color, width: 2, type: 'dashed' },
        label: {
            show: true,
            color: color,
            fontSize: 12,
            padding: [3, 5],
            formatter: '{c}'
        },
        data: coords.map(function (l) { return { xAxis: l }; })
    };
}

function getConstantLines() {
    let keys = Object.keys(chartConstantLines);

    let constantLines = [];
    keys.forEach(function (key) {
        constantLines = constantLines.concat(chartConstantLines[key]);
    });

    return constantLines;
}

function removeConstantLines(name, targetSeries) {
    const option = chart.getOption();
    const series = option.series.find(s => s.name === targetSeries);
    if (!series)
        return;
    if (!series.markLine || !series.markLine.data) return;

    // mantain only the lines that do not match the name to be removed
    series.markLine.data = series.markLine.data.filter(line => line.name !== name);

    chart.setOption(option);
}

function updateConstantLines() {
    const option = chart.getOption();
    option.xAxis[0].markLine = { data: getConstantLines() };
    chart.setOption(option);
}

function manageConstantLinesVisualization(selectedTabId) {
    /* manage vertical constant lines visualiztion */
    if (selectedTabId == OPTIONS_TITLE_ALIGNMENT) {
        if (isCheckboxChecked('alignmentCheckboxShowLines'))
            addOrUpdateConstantLines(getAlignmentConstantLines(), CHART_CONSTANT_LINES_ALIGNMENT);

        removeConstantLines(CHART_CONSTANT_LINES_FIT_POINTS, SERIES_FIT_POINTS);
    }

    if (selectedTabId == OPTIONS_TITLE_FIT) {
        if (isCheckboxChecked('fitChechboxShowLines'))
            addOrUpdateConstantLines(getFitPointsConstantLines(), CHART_CONSTANT_LINES_FIT_POINTS);

        removeConstantLines(CHART_CONSTANT_LINES_ALIGNMENT);
    }

    updateConstantLines();
}