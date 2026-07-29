var CHART_CONSTANT_LINES_ALIGNMENT = 'chartconstantlinesalignment';
var CHART_CONSTANT_LINES_FIT_POINTS = 'chartconstantlinesfitpoints';

function initConstantLines() {
    chartConstantLines = {};
}

function addOrUpdateConstantLines(taskConstantLines, constantLinesSpecies) {
    chartConstantLines[constantLinesSpecies] = taskConstantLines;
}

function getConstantLines() {
    let keys = Object.keys(chartConstantLines);

    let constantLines = [];
    keys.forEach(function (key) {
        constantLines = constantLines.concat(chartConstantLines[key]);
    });

    return constantLines;
}

function removeConstantLines(constantLinesSpecies) {
    delete chartConstantLines[constantLinesSpecies];
}

function resetShownConstantLines() {
    dxChartUpdateOption(chart, 'argumentAxis.constantLines', []);
}

function updateConstantLines() {
    dxChartUpdateOption(chart, 'argumentAxis.constantLines', getConstantLines());
}

function manageConstantLinesVisualization(selectedTabId) {
    /* manage vertical constant lines visualiztion */
    if (selectedTabId == OPTIONS_TITLE_ALIGNMENT) {
        if (isCheckboxChecked('alignmentCheckboxShowLines'))
            addOrUpdateConstantLines(getAlignmentConstantLines(), CHART_CONSTANT_LINES_ALIGNMENT);

        removeConstantLines(CHART_CONSTANT_LINES_FIT_POINTS);
    }

    if (selectedTabId == OPTIONS_TITLE_FIT) {
        if (isCheckboxChecked('fitChechboxShowLines'))
            addOrUpdateConstantLines(getFitPointsConstantLines(), CHART_CONSTANT_LINES_FIT_POINTS);

        removeConstantLines(CHART_CONSTANT_LINES_ALIGNMENT);
    }

    updateConstantLines();
}