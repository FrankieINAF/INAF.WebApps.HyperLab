import {
    Ellipsoid,
    Extent,
    Globe,
    Layer,
    LonLat,
    Entity,
    Vector,
    XYZ,
} from "/lib/openglobus/js/og.es.js";

import {
    defineFeaturesEvents,
    initCheckboxFeaturesAll
} from "./mapfeatures.js";

const MERCURY_RADIUS = 2439400.0;
const FOOTPRINT = 'FOOTPRINT';
const SIM = 'SIM';
const TARGET = 'TARGET';

export var targetsLayer;
export var featuresLayer;

var globe;

export function setMapPointerEventsAllowed(isAllowed) {
    if (isAllowed)
        $('#map').css('pointer-events', 'auto');
    else
        $('#map').css('pointer-events', 'none');
}

/* ################################################################################ */
/* FEATURES DROPDOWN */
/* ################################################################################ */
var isFeaturesDropdownOpen = false;
export function onFeaturesDropdownOpenClose() {
    if (!isFeaturesDropdownOpen) {
        $('#loadHideFeatures').prop('checked', true);
        $('#featuresDropdown').addClass('keep-open');
    } else {
        $('#loadHideFeatures').prop('checked', false);
    }

    isFeaturesDropdownOpen = !isFeaturesDropdownOpen;
}

export function onLoadHideFeaturesClick() {
    if (isFeaturesDropdownOpen)
        $('#featuresDropdown').removeClass('keep-open');
}

/* ################################################################################ */
/* OPENGLOBUS */
/* ################################################################################ */
function showGlobe() {
    const mercuryEllipsoid = new Ellipsoid(MERCURY_RADIUS, MERCURY_RADIUS, MERCURY_RADIUS);
    const mercuryTilesLayer = new XYZ("MercuryTiles", {
        isBaseLayer: true,
        url: "/tiles/mercury/xyz/{z}/{x}/{y}.png",
        attribution: "ESRI",
        visibility: true,
        minZoom: 0,
        maxZoom: 9,
    });

    targetsLayer = new Vector("Entities", {
        'visibility': true,
        'isBaseLayer': false,
        'diffuse': [0, 0, 0],
        'ambient': [1, 1, 1]
    });

    featuresLayer = new Vector("FeaturesLayer", {
        'clampToGround': true,
        'targetsLayer': null,
        'async': false
    });

    globe = new Globe({
        target: "map",
        name: "Mercury",
        ellipsoid: mercuryEllipsoid,
        backgroundColor: "white",
        atmosphereEnabled: false,
        nightTextureSrc: null,
        specularTextureSrc: null,
        sun: {
            enabled: false
        },
        shadows: false,
        layers: [mercuryTilesLayer, targetsLayer, featuresLayer],
        //controls: []
    });

    /* set sky background */
    globe.planet.renderer.controls.SimpleSkyBackground.colorOne = "rgb(0,0,0)";
    globe.planet.renderer.controls.SimpleSkyBackground.colorTwo = "rgb(0,0,0)";

    setDefaultViewExtent();

    /* define targetsLayer layer with events for each target */
    defineTargetsEvents();

    /* define features layer with events for each feature */
    defineFeaturesEvents();
}

function addGeometryEntityByBounds(id, name, type, minLat, maxLat, minLon, maxLon) {
    const coordinates = [[[[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat], [minLon, minLat]]]];

    targetsLayer.add(new Entity({
        'id': id,
        'name': name,
        'properties': {
            'type': type,
        },
        'geometry': {
            'type': "MultiPolygon",
            'coordinates': coordinates,
            'style': {
                'fillColor': "rgba(255,0,0,0.2)",
                'strokeWidth': 0
            }
        }
    }));
}

function addGeometryEntityByCoordsArray(id, name, type, coordsArray) {
    const coordinates = [[[...coordsArray]]];

    targetsLayer.add(new Entity({
        'id': id,
        'name': name,
        'properties': {
            'type': type,
        },
        'geometry': {
            'type': "MultiPolygon",
            'coordinates': coordinates,
            'style': {
                'fillColor': "rgba(0,0,255,0.2)",
                'strokeWidth': 0
            }
        }
    }));
}

function defineTargetsEvents() {    
    targetsLayer.events.on("mouseleave", function (e) {
        e.pickingObject.geometry.setFillColor(1, 0, 0, 0.2);
        hideByClassDFlexItem('targetsTooltip');
    });
    targetsLayer.events.on("mouseenter", function (e) {
        e.pickingObject.geometry.bringToFront();
        e.pickingObject.geometry.setFillColor(1, 0, 0, 0.6);

        $('#targetsTooltipContent').text(e.pickingObject.name);
        $('#targetsTooltip').css({
            left: `${e.clientX + 80}px`,
            top: `${e.clientY - 50}px`
        });
        showByClassDFlexItem('targetsTooltip');
    });

    targetsLayer.events.on("lclick", function (e) {
        globe.planet.flyExtent(e.pickingObject.geometry.getExtent());
        if (e.pickingObject.properties.type == TARGET) {
            selectedTargetName = e.pickingObject.name;
            //console.log(`selectedTargetName: ${selectedTargetName}`);
            showCharmsSelectedItem();
        }
    });
    targetsLayer.events.on("touchstart", function (e) {
        globe.planet.flyExtent(e.pickingObject.geometry.getExtent());

        selectedTargetName = e.pickingObject.name;
        showCharmsSelectedItem();
    });
}

function removeEntitiesProcedure(type) {
    const selectedEntities = targetsLayer.getEntities().filter(x => x.properties.type == type);
    if (selectedEntities == null)
        return false;

    /* remove targetsLayer from map */
    targetsLayer.removeEntities(selectedEntities);

    return true;
}

function setDefaultViewExtent() {
    globe.planet.viewExtent(new Extent(new LonLat(-180, -90), new LonLat(180, 90)));
}
/* ################################################################################ */
/* MAP */
/* ################################################################################ */
function initSwitchLoadHideTargets() {
    $('#loadHideTargets').on('change', async function () {
        let isChecked = isCheckboxChecked('loadHideTargets');

        if (isChecked)
            await retrieveTargetsAsync();
        else
            removeTargets();
    });
}

function initSwitchShowHideSearchOfFootprints() {
    $('#showHideSearchOfFootprints').on('change', function () {
        let isChecked = isCheckboxChecked('showHideSearchOfFootprints');

        if (isChecked)
            showByClassDFlexItem('selectStpForFootprintsContainer');
        else
            hideByClassDFlexItem('selectStpForFootprintsContainer');
    });
}

/* -------------------------------------------------------------------------------- */
/* CHARMS FOR SELECTED ITEM */
/* -------------------------------------------------------------------------------- */
async function retrieveStpsWithFootprintsAsync() {
    let stps = await doAjaxGetAsync(UrlGetStpsWithFootprints);
    if (stps == null || stps.length == 0)
        return;

    Metro.getPlugin('#selectStpForFootprints', 'select').addOption('Select STP');
    const stpsCount = stps.length;
    for (var i = 0; i < stpsCount; i++) {
        Metro.getPlugin('#selectStpForFootprints', 'select').addOption(stps[i]);
    }
}

/* ################################################################################ */
/* TARGETS */
/* ################################################################################ */
/* -------------------------------------------------------------------------------- */
/* RETRIEVE TARGETS + DETAILS */
/* -------------------------------------------------------------------------------- */
function removeTargets() {
    if (!removeEntitiesProcedure(TARGET))
        return;

    hideByClassDFlexItem('searchTargetInputContainer');
}

export function restoreDefaultVisualization() {
    /* hide charms for selected target */
    hideCharmsSelectedItem();

    /* remove all previous target values */
    deleteTargetDetails();

    /* restore default visualization of globe */
    setDefaultViewExtent();
}

async function retrieveTargetsAsync() {
    setLoadingCircleIsVisible(true);

    try {
        let targetsLayer = await doAjaxGetNoModelAsync(UrlGetTargetsWithObsCoords);
        if (targetsLayer == null || targetsLayer.length == 0) {
            setLoadingCircleIsVisible(false);
            showSimpleDialog(WARNING_LABEL, TargetsNoItemsAvailableMessage, WARNING);
            return;
        }

        //targetsArray = [];
        const targetsCount = targetsLayer.length;
        for (let i = 0; i < targetsCount; i++) {
            const target = targetsLayer[i];

            //targetsArray.push(target);
            addGeometryEntityByBounds(target.Id, target.Name, TARGET, target.MinLat, target.MaxLat, target.MinLon, target.MaxLon);
        }

        showByClassDFlexItem('searchTargetInputContainer');
        setLoadingCircleIsVisible(false);
    } catch (e) {
        $('#loadHideTargets').prop('checked', false);
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, TargetsGetItemsErrorMessage, ALERT);
    }
}

async function retrieveTargetDetailsAsync(selectedTargetName) {
    const model = {
        Text: selectedTargetName
    };

    let isOk = true;
    try {
        const obj = await doAjaxGetAsync(UrlGetTargetInfo, model);
        if (obj != null) {
            //console.log(obj);

            let observedByText = '';
            if (obj.ObservedByHRIC)
                observedByText += HRIC;
            if (obj.ObservedBySTC) {
                if (observedByText.length > 0)
                    observedByText += ', ';
                observedByText += STC;
            }
            if (obj.ObservedByVIHI) {
                if (observedByText.length > 0)
                    observedByText += ', ';
                observedByText += VIHI;
            }

            writeTargetDetails(
                obj.Name,
                observedByText,
                obj.Category,
                obj.ObsMode,
                obj.ObsType,
                obj.MinLat.toFixed(6),
                obj.MaxLat.toFixed(6),
                obj.CenterLat.toFixed(6),
                obj.MinLon.toFixed(6),
                obj.MaxLon.toFixed(6),
                obj.CenterLon.toFixed(6),
                obj.AreaGeod.toLocaleString('en-US'),
                obj.CoveragePercentage.toFixed(2),
                obj.LiteratureRef);

        } else
            isOk = false;
    } catch (e) {
        isOk = false;
    }

    if (!isOk)
        showSimpleDialog(ERROR_LABEL, TargetGetInfoErrorMessage, ALERT);
}

export function searchForTarget() {
    const text = $(`#searchTargetInput`).val();

    if (text == null || text.trim() == '') {
        showSimpleDialog(WARNING_LABEL, TargetsSearchEmptyFieldMessage, WARNING);
        return;
    }

    const selectedEntity = targetsLayer.getEntities().find(x => x.properties.type == TARGET && x.name == text);
    if (selectedEntity == null)
        return;

    globe.planet.flyExtent(selectedEntity.geometry.getExtent());

    selectedTargetName = selectedEntity.name;
    showCharmsSelectedItem();
}

function deleteTargetDetails() {
    writeTargetDetails(
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '');
}

function writeTargetDetails(name,
    observedByText,
    category,
    obsMode,
    obsType,
    minLat,
    maxLat,
    centerLat,
    minLon,
    maxLon,
    centerLon,
    areaGeod,
    coveragePercentage,
    literatureRef) {
    $('#targetName').text(name);

    $('#observedBy').text(observedByText);

    $('#category').text(category);
    $('#observationMode').text(obsMode);
    $('#observationType').text(obsType);

    $('#latRange').text(`[${minLat}, ${maxLat}]`);
    $('#latCenter').text(centerLat);
    $('#lonRange').text(`[${minLon}, ${maxLon}]`);
    $('#lonCenter').text(centerLon);
    $('#area').text(areaGeod);
    $('#coveragePercentage').text(coveragePercentage);
    let litRef = literatureRef;
    if (litRef)
        $('#litRef').attr('href', literatureRef).attr('target', '_blank');
    else
        litRef = '-';
    $('#litRef').text(litRef);
}

/* -------------------------------------------------------------------------------- */
/* OPEN/CLOSE CHARM TARGET */
/* -------------------------------------------------------------------------------- */
export function hideCharmsSelectedItem() {
    Metro.charms.close('#charmsSelectedItem');
}

export function onCharmsSelectedItemOpened() {
    retrieveTargetDetailsAsync(selectedTargetName);
}

function showCharmsSelectedItem() {
    Metro.charms.open('#charmsSelectedItem');
}

/* ################################################################################ */
/* FOOTPRINTS */
/* ################################################################################ */
function removeFootprints() {
    if (!removeEntitiesProcedure(FOOTPRINT))
        return;

    /* clear in-memory array */
    footprintsArray = [];
}

export async function retrieveFootprintsByStpAsync(val) {
    if (val == null || val == SelectorSelectStpValue)
        return;

    /* remove footprints from previous search, if available */
    removeFootprints();

    setLoadingCircleIsVisible(true);

    const model = {
        Value: val
    };

    let footprints = await doAjaxGetAsync(UrlGetFootprintsByStp, model);
    if (footprints == null || footprints.length == 0) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, FootprintsNoItemsAvailable, WARNING);
        return;
    }

    const footprintsCount = footprints.length;
    for (var i = 0; i < footprintsCount; i++) {
        const footprint = footprints[i];

        footprintsArray.push(footprint);

        const coordsArray = footprint.corners.map(corner => [corner.longitude, corner.latitude]);
        coordsArray.push(coordsArray[0]);
        //console.log(coordsArray);
        addGeometryEntityByCoordsArray(footprint.Id, `${FOOTPRINT} ${footprint.Id}`, FOOTPRINT, coordsArray);
    }

    setLoadingCircleIsVisible(false);
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    footprintsArray = [];

    showPageItems(true);

    showGlobe();

    /* init all checkboxes for showing/hiding features */
    initCheckboxFeaturesAll();

    /* init switch for loading/hiding targetsLayer */
    initSwitchLoadHideTargets();

    /* init switch for selecting stp */
    initSwitchShowHideSearchOfFootprints();

    /* retrieve stps related to footprints */
    retrieveStpsWithFootprintsAsync();

    addReturnListenerToElem('searchTargetInput', searchForTarget);
});