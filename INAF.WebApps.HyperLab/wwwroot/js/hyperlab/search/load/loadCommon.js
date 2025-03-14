/* ################################################################################ */
/* READ CSV FILE */
/* ################################################################################ */
function parseCSV(text) {
    const lines = text.split('\n');
    let points = [];
    const separators = /[,\t; ]+/;

    for (let i = 0; i < lines.length; i++) {
        const values = lines[i].split(separators).map(value => value.trim()).filter(value => value !== ""); // Trim spaces and tabs and remove empty strings
        if (values.length < 2)
            continue;

        if (!Number.isNaN(values[0]) && !Number.isNaN(values[1])) {
            points.push(createSpectrumElement(values[0], values[1]));
        }
    }

    return points;
}

function readCsvProcedure(text, filename, index) {
    let xml = buildSpectrum(filename, text);
    if (xml)
        saveExternalFileAsync(filename, xml, index);
    else
        showSimpleDialog(ERROR_LABEL, LoadFileReadCsvFileErrorMessage, ALERT);
}