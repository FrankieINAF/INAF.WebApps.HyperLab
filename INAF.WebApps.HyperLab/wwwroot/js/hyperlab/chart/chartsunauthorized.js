/* ################################################################################ */
/* CREATE SPECTRA */
/* ################################################################################ */
function getItemIdFromFilename(filename) {
    let temp = filename.split('.');
    return `id_${temp[0]}`;
}

function getSpectrumInfo(item) {
    return {
        Id: getItemIdFromFilename(item.Filename),
        Name: item.Filename,
        ParentId: 0,
        IsVisible: true,
        SpectrumLevel: parseInt(item.Level),
        SpectrumType: parseInt(item.Type),
        SpectrumSource: parseInt(item.Source),
        InsertDateTimeJs: null,
        EditDateTimeJs: null
    };
}

function getValuesFromXml(id, xml) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml, "text/xml");

    // Trova tutti gli elementi <Element>
    let elements = xmlDoc.getElementsByTagName("Element");

    const results = [];
    for (let element of elements) {
        let wavelength = element.getAttribute("Wavelength");
        let value = element.getAttribute("Value");
        let item = { X: parseFloat(wavelength) };
        item[id] = parseFloat(value);
        results.push(item);
    }

    return results;
}

function parseItemToSpectrum(item) {
    /* create spectrumInfo and add to array */
    let spectrumInfo = getSpectrumInfo(item);
    addSpectrumInfo(spectrumInfo);


    return getValuesFromXml(spectrumInfo.Id, item.Xml);
}

/* ################################################################################ */
/* LOAD SPECTRA */
/* ################################################################################ */
