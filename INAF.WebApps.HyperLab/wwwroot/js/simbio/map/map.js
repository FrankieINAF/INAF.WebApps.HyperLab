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

const MERCURY_RADIUS = 2439400.0;

var globe;
var entities;

var FOOTPRINT = 'FOOTPRINT';
var SIM = 'SIM';
var TARGET = 'TARGET';

/* ################################################################################ */
/* OPENGLOBUS */
/* ################################################################################ */
function showGlobe() {
    const mercuryEllipsoid = new Ellipsoid(MERCURY_RADIUS, MERCURY_RADIUS, MERCURY_RADIUS);
    const minLon = -180.0;
    const minLat = -90.0;
    const maxLon = 180.0;
    const maxLat = 90;
    const mercuryTiles = new XYZ("MercuryRaster", {
        isBaseLayer: true,
        url: "/tiles/mercury/xyz_old/{z}/{x}/{y}.png", // percorso alle tile TMS
        attribution: "ESRI",
        visibility: true,
        minZoom: 0,
        maxZoom: 7,
    });
    //mercuryTiles.setExtent(new Extent(new LonLat(minLon, minLat), new LonLat(maxLon, maxLat)));
    //const mercuryTiles = new XYZ("MercuryRaster", {
    //    isBaseLayer: true,
    //    url: "/tiles/mercury/tms_old/{z}/{x}/{y}.png",
    //    maxZoom: 7,
    //    minZoom: 0,
    //});

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
        layers: [],
        //controls: []
    });

    globe.planet.addLayer(mercuryTiles);

    /* set sky background */
    globe.planet.renderer.controls.SimpleSkyBackground.colorOne = "rgb(255,255,255)";
    globe.planet.renderer.controls.SimpleSkyBackground.colorTwo = "rgb(255,255,255)";

    setDefaultViewExtent();

    /* define entities layer with events for each target */
    defineTargetsEvents();
}

function addGeometryEntityByBounds(id, name, type, minLat, maxLat, minLon, maxLon) {
    const coordinates = [[[[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat], [minLon, minLat]]]];

    entities.add(new Entity({
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

    entities.add(new Entity({
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
    entities = new Vector("Targets", {
        'visibility': true,
        'isBaseLayer': false,
        'diffuse': [0, 0, 0],
        'ambient': [1, 1, 1]
    });
    entities.addTo(globe.planet);

    entities.events.on("mouseleave", function (e) {
        e.pickingObject.geometry.setFillColor(1, 0, 0, 0.2);
        hideByClassDFlexItem('tooltip');
    });
    entities.events.on("mouseenter", function (e) {
        e.pickingObject.geometry.bringToFront();
        e.pickingObject.geometry.setFillColor(1, 0, 0, 0.6);

        $('#tooltipContent').text(e.pickingObject.name);
        $('#tooltip').css({
            left: `${e.clientX + 20}px`,
            top: `${e.clientY + 20}px`
        });
        showByClassDFlexItem('tooltip');
    });

    entities.events.on("lclick", function (e) {
        globe.planet.flyExtent(e.pickingObject.geometry.getExtent());
        //console.log('ciao');
        if (e.pickingObject.properties.type == TARGET) {
            selectedTargetName = e.pickingObject.name;
            //console.log(`selectedTargetName: ${selectedTargetName}`);
            showCharmsSelectedItem();
        }
    });
    entities.events.on("touchstart", function (e) {
        globe.planet.flyExtent(e.pickingObject.geometry.getExtent());

        selectedTargetName = e.pickingObject.name;
        showCharmsSelectedItem();
    });
}

function removeEntitiesProcedure(type) {
    const selectedEntities = entities.getEntities().filter(x => x.properties.type == type);
    if (selectedEntities == null)
        return false;

    /* remove entities from map */
    entities.removeEntities(selectedEntities);

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
            showByClassDFlexItem('selectStpContainer');
        else
            hideByClassDFlexItem('selectStpContainer');
    });
}

/* -------------------------------------------------------------------------------- */
/* CHARMS FOR SELECTED ITEM */
/* -------------------------------------------------------------------------------- */
async function retrieveStpsWithFootprintsAsync() {
    let stps = await doAjaxGetAsync(UrlGetStpsWithFootprints);
    if (stps == null || stps.length == 0)
        return;

    Metro.getPlugin('#selectStp', 'select').addOption('Select STP');
    const stpsCount = stps.length;
    for (var i = 0; i < stpsCount; i++) {
        Metro.getPlugin('#selectStp', 'select').addOption(stps[i]);
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

    /* clear in-memory array */
    targetsArray = [];

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

    let entities = await doAjaxGetNoModelAsync(UrlGetTargetsWithObsCoords);
    if (entities == null || entities.length == 0) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, TargetsNoItemsAvailableMessage, WARNING);
        return;
    }

    //targetsArray = [];
    const targetsCount = entities.length;
    for (let i = 0; i < targetsCount; i++) {
        const target = entities[i];

        //targetsArray.push(target);
        addGeometryEntityByBounds(target.Id, target.Name, TARGET, target.MinLat, target.MaxLat, target.MinLon, target.MaxLon);
    }

    showByClassDFlexItem('searchTargetInputContainer');

    setLoadingCircleIsVisible(false);
}

async function retrieveTargetDetailsAsync(selectedTargetName) {
    const model = {
        Text: selectedTargetName
    };

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

    } else {
        showSimpleDialog(ERROR_LABEL, TargetGetInfoErrorMessage, ALERT);
    }
}

export function searchForTarget() {
    const text = $(`#searchTargetInput`).val();

    if (text == null || text.trim() == ''){
        showSimpleDialog(WARNING_LABEL, TargetsSearchEmptyFieldMessage, WARNING);
        return;
    }

    const selectedEntity = entities.getEntities().find(x => x.properties.type == TARGET && x.name == text);
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
        $('#litRef').attr('href', literatureRef);
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
    //targetsArray = [];

    showPageItems(true);

    showGlobe();

    /* retrieve stps related to footprints */
    retrieveStpsWithFootprintsAsync();

    /* init switch for loading/hiding entities */
    initSwitchLoadHideTargets();
    /* init switch for selecting stp */
    initSwitchShowHideSearchOfFootprints();

    addReturnListenerToElem('searchTargetInput', searchForTarget);
});