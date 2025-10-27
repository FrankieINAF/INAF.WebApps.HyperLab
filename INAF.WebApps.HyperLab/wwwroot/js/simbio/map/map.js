var targetsArray = [];
var viewer = null;
var tooltipElement = null;
var handler = null;

var selectedTargetId;

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNjkyMTc1NC04ZWNmLTQzMjEtODhmNC00OWNmOTBjMjU0YjkiLCJpZCI6MzUyNjQ0LCJpYXQiOjE3NjEwNDk3MDB9.JcVGQqYP84LJPidLwfzQfMkHuazk1tXWeiQAKuEHh_Y';

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
        $('#litRef').attr('href', obj.LiteratureRef);
        $('#litRef').text(obj.LiteratureRef);

    } else {
        showSimpleDialog(ERROR_LABEL, GetTargetInfoErrorMessage, ALERT);
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

function addExtrudedRectangle(viewer, west, south, east, north, color, id, name) {
    viewer.entities.add({
        id: id,
        name: name || 'Custom Extruded Rectangle',
        rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
            material: color.withAlpha(0.7),

            /* height and extrudedHeight define the 3D shape */
            height: 0,
            /* extrudedHeight is the height to which the rectangle is extruded */
            extrudedHeight: 0,

            fill: true,
            outline: true,
            outlineColor: Cesium.Color.BLACK
        }
    });
}

/* ################################################################################ */
/* RETRIEVE TARGETS FROM BACK-END */
/* ################################################################################ */
async function retrieveAndShowTargetsAsync() {
    let targets = await doAjaxGetNoModelAsync(UrlGetTargetsWithObsCoords);
    if (targets == null || targets.length == 0)
        return;

    targetsArray = [];
    const targetsCount = targets.length;
    for (let i = 0; i < targetsCount; i++) {
        const target = targets[i];

        targetsArray.push(target);

        addExtrudedRectangle(
            viewer,
            target.MinLon, target.MinLat, target.MaxLon, target.MaxLat,
            Cesium.Color.CYAN,
            target.Id,
            "Target: " + target.Name
        );
    }
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    showPageItems(true);

    setLoadingCircleIsVisible(true);

    tooltipElement = document.getElementById('tooltip');

    showGlobe();

    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    initEventsOnTargets();

    const init = async function () {
        try {
            await retrieveAndShowTargetsAsync();
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingCircleIsVisible(false);
        }
    };

    executeAfter(init, 500);
});