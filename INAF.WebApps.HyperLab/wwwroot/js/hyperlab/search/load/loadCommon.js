var EXTERNAL_FILE = "ExternalFile";
var SLAB_FILE = "SLabFile";

function isXML(text) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    return parseError.length === 0;
}

/* ################################################################################ */
/* FILES READING */
/* ################################################################################ */
async function loadFilesAsync(evt, element) {
    console.log(evt);

    if (evt == null)
        return;

    let filesNum = evt.length;
    for (var i = 0; i < filesNum; i++) {
        let file = evt[i];
        //let filename = removeFileExtension(file.name);
        let filename = file.name;
        //console.log(`LOOP, ${filename}, ${i}`);

        if (isAlreadyParsed(filename))
            continue;

        let reader = new FileReader();

        reader.onload = async function (event) {
            const text = event.target.result;
            if (isXML(text)) {
                console.log("XML");
                //await readXmlProcedureAsync(text, filename, index);
            } else {
                console.log(`CSV, ${filename}`);
                manageCsvProcedure(text, filename, SLAB_FILE);
            }
        };

        reader.readAsText(file);
    }
}

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

function manageCsvProcedure(text, filename, type) {
    let xml = buildSpectrum(filename, text);
    if (xml) {
        switch (type) {
            case EXTERNAL_FILE:
                saveExternalFileAsync(filename, xml, index);
                break;
            case SLAB_FILE:
                addListItem(filename);
                addParsedSpectrum(filename, xml, SPECTRUM_TYPE_RAW);
                break;
            default:
        }
    }
    else
        showSimpleDialog(ERROR_LABEL, LoadFileReadCsvFileErrorMessage, ALERT);
}