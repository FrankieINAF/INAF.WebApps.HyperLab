// Elenchi di valori ammessi
var allowedTypeValues = [
    getSpectrumTypeString(SPECTRUM_TYPE_RAW),
    getSpectrumTypeString(SPECTRUM_TYPE_REF),
    getSpectrumTypeString(SPECTRUM_TYPE_REF_WHITE),
    getSpectrumTypeString(SPECTRUM_TYPE_ALIGNED),
    getSpectrumTypeString(SPECTRUM_TYPE_ALIGNED),
    getSpectrumTypeString(SPECTRUM_TYPE_ALIGNED_SMOOTHED_BY_SEGMENTS),
    getSpectrumTypeString(SPECTRUM_TYPE_ALIGNED_SMOOTHED),
    getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM),
    getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM_REMOVED),
    getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED_BY_SEGMENTS),
    getSpectrumTypeString(SPECTRUM_TYPE_CONTINUUM_REMOVED_SMOOTHED),
];
var allowedLevelValues = [
    getSpectrumLevelString(SPECTRUM_SOURCE_EXTERNAL),
    getSpectrumLevelString(SPECTRUM_SOURCE_SLAB)
];

// Funzione aggiornata per validare la struttura
function isSLabXmlStructure(text) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");

    // Controlla che ci sia il nodo <Spectrum>
    const spectrum = xmlDoc.querySelector("Spectrum");
    if (!spectrum) return false;

    // Controlla che ci sia il nodo <Info> e i suoi figli
    const info = spectrum.querySelector("Info");
    if (!info) return false;

    const rawFilename = info.querySelector("RawFilename");
    const type = info.querySelector("Type");
    const level = info.querySelector("Level");

    if (!rawFilename || !type || !level) return false;

    // Verifica i valori dei nodi <Type> e <Level>
    if (!allowedTypeValues.includes(type.textContent.trim())) return false;
    if (!allowedLevelValues.includes(level.textContent.trim())) return false;

    // Controlla che ci sia il nodo <Elements> e almeno un <Element>
    const elements = spectrum.querySelector("Elements");
    if (!elements) return false;

    const elementList = elements.querySelectorAll("Element");
    if (elementList.length === 0) return false;

    // Controlla che ogni <Element> abbia gli attributi richiesti
    for (const element of elementList) {
        if (!element.hasAttribute("Wavelength") || !element.hasAttribute("Value")) {
            return false;
        }
    }

    return true; // La struttura è valida
}
