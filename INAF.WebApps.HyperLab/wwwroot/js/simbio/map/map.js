
var footprintsArray = null;
var targetsArray = null;

var viewer = null;
var tooltipElement = null;
var handler = null;

var selectedTargetId;

var FOOTPRINT = 'Footprint';
var SIM = 'SIM';
var TARGET = 'Target';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNjkyMTc1NC04ZWNmLTQzMjEtODhmNC00OWNmOTBjMjU0YjkiLCJpZCI6MzUyNjQ0LCJpYXQiOjE3NjEwNDk3MDB9.JcVGQqYP84LJPidLwfzQfMkHuazk1tXWeiQAKuEHh_Y';

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

/* ################################################################################ */
/* RETRIEVE TARGETS FROM BACK-END */
/* ################################################################################ */
function initEventsOnTargets() {
    handler.setInputAction(function (movement) {
        // Identify the 3D object under the cursor position
        const pickedObject = viewer.scene.pick(movement.endPosition);

        // Check if a valid object was picked AND if it's one of your named entities
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && pickedObject.id.name) {
            const pickedEntity = pickedObject.id;

            // SHOW THE TOOLTIP

            // Position the tooltip relative to the mouse cursor position (offset by 15px)
            tooltipElement.style.left = movement.endPosition.x + 15 + 'px';
            tooltipElement.style.top = movement.endPosition.y + 15 + 'px';

            // Update the content with the entity's name
            tooltipElement.innerHTML = pickedEntity.name;
            tooltipElement.style.display = 'block';
        } else {
            // HIDE THE TOOLTIP if no named entity is under the cursor
            tooltipElement.style.display = 'none';
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (click) {
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && pickedObject.id.name) {
            const entity = pickedObject.id;

            /* try to extract the target rectngle */
            const rect = entity.rectangle?.coordinates?.getValue();
            if (Cesium.defined(rect)) {
                /* zoom to selected item */
                viewer.camera.flyTo({
                    destination: rect // margine opzionale
                });
                /* open charms for selected item */
                selectedTargetId = entity.id;
                showCharmsSelectedItem();
            } else {
                console.log("No rectangle coordinates defined for this entity.");
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

}

async function retrieveTargetDetailsAsync(targetId) {
    const model = {
        Id: targetId
    };

    const obj = await doAjaxGetAsync(UrlGetTargetInfo, model);
    if (obj != null) {
        console.log(obj);
        $('#targetName').text(obj.Name);

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
        $('#observedBy').text(observedByText);

        $('#category').text(obj.Category);
        $('#observationMode').text(obj.ObsMode);
        $('#observationType').text(obj.ObsType);

        $('#latRange').text(`[${obj.MinLat.toFixed(6)}, ${obj.MaxLat.toFixed(6)}]`);
        $('#latCenter').text(obj.CenterLat.toFixed(6));
        $('#lonRange').text(`[${obj.MinLon.toFixed(6)}, ${obj.MaxLon.toFixed(6)}]`);
        $('#lonCenter').text(obj.CenterLon.toFixed(6));
        $('#area').text(obj.AreaGeod.toLocaleString('en-US'));
        $('#coveragePercentage').text(obj.CoveragePercentage.toFixed(2));
        let litRef = obj.LiteratureRef;
        if (litRef)
            $('#litRef').attr('href', obj.LiteratureRef);
        else
            litRef = '-';
        $('#litRef').text(litRef);

    } else {
        showSimpleDialog(ERROR_LABEL, TargetGetInfoErrorMessage, ALERT);
    }
}

/* -------------------------------------------------------------------------------- */
/* CHARMS FOR SELECTED ITEM */
/* -------------------------------------------------------------------------------- */
function hideCharmsSelectedItem() {
    Metro.charms.close('#charmsSelectedItem');
}

function showCharmsSelectedItem() {
    Metro.charms.open('#charmsSelectedItem');
}

function onCharmsSelectedItemOpened() {
    retrieveTargetDetailsAsync(selectedTargetId);
}

/* ################################################################################ */
/* SHOW THE GLOBE */
/* ################################################################################ */
function showGlobe() {
    viewer = new Cesium.Viewer('map', {
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        imageryProvider: false,
        //imageryProvider: new Cesium.UrlTemplateImageryProvider({
        //    url: "/tiles/mercury/{z}/{x}/{y}.png",
        //    tilingScheme: new Cesium.GeographicTilingScheme(),
        //    maximumLevel: 7,
        //    credit: "Valentina Galluzzi"
        //}),

        creditContainer: document.createElement("div"),

        /* options */
        /* remove full screen button */
        fullscreenButton: false,
        /* remove navigation help button */
        navigationHelpButton: true,
        /* remove levels selector */
        baseLayerPicker: false,
        /* remove search bar */
        geocoder: false,
        /* remove home button */
        homeButton: false,
        /* remove timeline bar */
        timeline: false,
        /* remove animation widget (with Play/Pause) */
        animation: false,
        /* remove space background */
        skyBox: false,
        /* remove atmosphere */
        skyAtmosphere: false,
    });

    /* set Mercury imagery */
    const mercuryImagery = new Cesium.SingleTileImageryProvider({
        url: '/images/maps/mercury_messenger_mdis_basemap_enhancedcolor_mosaic_global_1024.jpg',
        rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
    });
    viewer.imageryLayers.addImageryProvider(mercuryImagery);

    /* set background color */
    viewer.scene.backgroundColor = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0);

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 3.5 * Cesium.Ellipsoid.WGS84.maximumRadius)
    });
}

/* ################################################################################ */
/* RETRIEVE FOOTPRINTS */
/* ################################################################################ */
async function retrieveFootprintsByStpAsync(val) {
    if (val == null || val == SelectorSelectStpValue)
        return;

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

        const flatCoords = footprint.corners.flatMap(corner => [corner.longitude, corner.latitude]);
        const positions = Cesium.Cartesian3.fromDegreesArray(flatCoords);

        viewer.entities.add({
            id: footprint.Id,
            name: `${FOOTPRINT} ${footprint.Id}`,
            polygon: {
                hierarchy: positions,
                /* height and extrudedHeight define the 3D shape */
                height: 0,
                /* extrudedHeight is the height to which the rectangle is extruded */
                extrudedHeight: 0,
                material: Cesium.Color.RED.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.BLACK
            }
        });
    }

    setLoadingCircleIsVisible(false);
}

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
/* RETRIEVE TARGETS FROM BACK-END */
/* ################################################################################ */
async function retrieveTargetsAsync() {
    setLoadingCircleIsVisible(true);

    let targets = await doAjaxGetNoModelAsync(UrlGetTargetsWithObsCoords);
    if (targets == null || targets.length == 0) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, TargetsNoItemsAvailableMessage, WARNING);
        return;
    }

    targetsArray = [];
    const targetsCount = targets.length;
    for (let i = 0; i < targetsCount; i++) {
        const target = targets[i];

        targetsArray.push(target);

        viewer.entities.add({
            id: target.Id,
            name: `${TARGET}: ${target.Name}` || 'Custom Extruded Rectangle',
            rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(target.MinLon, target.MinLat, target.MaxLon, target.MaxLat),
                material: Cesium.Color.CYAN.withAlpha(0.7),
                /* height and extrudedHeight define the 3D shape */
                height: 0,
                /* extrudedHeight is the height to which the rectangle is extruded */
                extrudedHeight: 0,
                fill: true,
                outline: true,
                outlineColor: Cesium.Color.BLACK
            }
        });
        //addEntities(
        //    viewer,
        //    target.MinLon, target.MinLat, target.MaxLon, target.MaxLat,
        //    Cesium.Color.CYAN,
        //    target.Id,
        //    "Target: " + target.Name
        //);
    }

    setLoadingCircleIsVisible(false);
}

function removeTargets() {
    let entities = viewer.entities.values.find(x => x.name.includes(SIM));
    if (!entities)
        return;

    /* remove targets from map */
    entities.entityCollection.removeAll();
    /* clear in-memory array */
    targetsArray = [];
    //const entitiesNum = entities.length;
    //for (var i = 0; i < entitiesNum; i++) {
    //    viewer.entities.removeById(entities[i].id);
    //}
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    footprintsArray = [];
    targetsArray = [];

    showPageItems(true);

    tooltipElement = document.getElementById('tooltip');

    showGlobe();

    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    initEventsOnTargets();

    /* retrieve stps related to footprints */
    retrieveStpsWithFootprintsAsync();

    /* init switch for loading/hiding targets */
    initSwitchLoadHideTargets();
    /* init switch for selecting stp */
    initSwitchShowHideSearchOfFootprints();
});