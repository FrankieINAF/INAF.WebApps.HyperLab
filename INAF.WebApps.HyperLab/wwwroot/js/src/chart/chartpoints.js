function createPoint(x, y, keyName) {
    return {
        X: x,
        [keyName]: y
    };
}

function extractSpectrumXMax(points) {
    return Math.max(...points.map(p => p.X));
}

function extractSpectrumXMin(points) {
    return Math.min(...points.map(p => p.X));
}

function extractSpectrumRange(points, x0, x1) {
    if (x1 <= x0)
        return null;

    return points.filter(p => p.X >= x0 && p.X <= x1);
}

function getPointHigherThanX(points, x) {
    /* find the 1st point with X greater-equal to x */
    let point = points.find(p => p.X >= x);
    if (!point)
        return null;

    return point;
}

function getPointLowerThanX(points, x) {
    /* find the 1st point with X lower-equal to x */
    /* 1) filter all points with X lower-equal to x */
    let lowerXPoints = points.filter(p => p.X <= x);
    if (lowerXPoints.length == 0)
        return null;

    /* 2) retrieve the last point */
    let point = lowerXPoints[lowerXPoints.length - 1];
    if (!point)
        return null;

    return point;
}

function getPointsMaxX(points) {
    return points[points.length - 1].X
}

function getPointsMinX(points) {
    return points[0].X
}

function getPointFromSeriesPoints(seriesPoints, x) {
    let seriesPoint = seriesPoints.find(p => parseFloat(p.argument) == x);

    return {
        X: parseFloat(seriesPoint.argument),
        Y: parseFloat(seriesPoint.value)
    };
}

function getPointsFromSeriesPoints(seriesPoints) {
    return seriesPoints.map(x => { return { X: parseFloat(x.argument), Y: parseFloat(x.value), YStdDev: 0 }; });
}

function getPointsFromSeriesPointsProcedure(spectrumId, spectrumType) {
    const spectrum = getSpectrumByLowerSpectrumTypeIdAndSpectrumType(spectrumId, spectrumType);
    /* retrieve series points */
    let seriesPoints = getSeriesPointsProcedure(spectrum.Id, spectrumType);
    return getPointsFromSeriesPoints(seriesPoints);
}

function getPointAtFromSeriesPoints(seriesPoints, index) {
    return seriesPoints[index].map(x => { return { X: parseFloat(x.argument), Y: parseFloat(x.value) }; });
}

function getSeriesPointsProcedure(spectrumId, spectrumType) {
    const spectrum = findSpectrumByIdAndSpectrumType(spectrumId, spectrumType);
    /* retrieve index of spectrum in spectraInfo */
    let index = getSpectrumIndexBySpectrumId(spectrum.Id);
    /* retrieve series name */
    let seriesname = getSpectrumSeriesNameFromIndex(index);
    /* retrieve series points */
    return getSeriesPoints(seriesname);
}

function getSpectrumPointsById(id) {
    let index = getSpectrumIndexBySpectrumId(id);
    if (index < 0)
        return;

    let seriesPoints = getSeriesPoints(getSpectrumSeriesNameFromIndex(index));
    if (!seriesPoints)
        return null;

    return getPointsFromSeriesPoints(seriesPoints);
}

function getSpectrumPointsByRawIdAndSpectrumType(spectrumId, spectrumType) {
    let spectrum = getSpectrumByLowerSpectrumTypeIdAndSpectrumType(spectrumId, spectrumType);
    return getSpectrumPointsById(spectrum.Id);
}

function getSpectrumPointsBySpectrumType(spectrumType) {
    let spectrum = getSpectrumBySpectrumType(spectrumType);
    return getSpectrumPointsById(spectrum.Id);
}

function isExistingPointByX(points, x) {
    let index = points.findIndex(p => p.X == x);
    return (index >= 0);
}

function getSpectrumPointsByIdAndSpectrumType(spectrumId, spectrumType) {
    console.log(`getSpectrumPointsByIdAndSpectrumType - spectrumId: ${spectrumId}, spectrumType: ${spectrumType}`);
}

function getSpectrumPointsByIdAndSpectrumTypeProcedure(spectrumId, spectrumType) {
    let spectrumPoints = getSpectrumPointsByRawIdAndSpectrumType(spectrumId, spectrumType);
    if (!spectrumPoints)
        spectrumPoints = getSpectrumPointsByIdAndSpectrumType(spectrumId, spectrumType);

    return spectrumPoints.map(function (p) { return { X: p.X, Y: p.Y } });
}