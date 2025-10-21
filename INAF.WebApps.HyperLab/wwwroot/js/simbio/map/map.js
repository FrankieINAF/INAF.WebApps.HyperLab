var viewer = null;
var tooltipElement = null;
var handler = null;

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNjkyMTc1NC04ZWNmLTQzMjEtODhmNC00OWNmOTBjMjU0YjkiLCJpZCI6MzUyNjQ0LCJpYXQiOjE3NjEwNDk3MDB9.JcVGQqYP84LJPidLwfzQfMkHuazk1tXWeiQAKuEHh_Y';

function initMapItemTooltip() {
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
}

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

    /* set Mercury as globe */
    viewer.scene.globe.ellipsoid = new Cesium.Ellipsoid(2439700.0, 2439700.0, 2439700.0); // medium Mercury radius in meters
    /* set Mercury imagery */
    const mercuryImagery = new Cesium.SingleTileImageryProvider({
        url: '/images/maps/mercury_messenger_mdis_basemap_enhancedcolor_mosaic_global_1024.jpg',
        rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
    });
    viewer.imageryLayers.addImageryProvider(mercuryImagery);

    /* set background color */
    viewer.scene.backgroundColor = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0);

    viewer.camera.setView({
        // Cesium.Cartesian3.fromDegrees(longitude, latitude, altitudeInMeters)
        // Longitude and Latitude set to 0.0 to center on the intersection of the Equator and the Prime Meridian
        // Altitude set to 9,000,000.0 meters (9,000 km) for a distant global view.
        destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 9000000.0)
    });
}

function addExtrudedRectangle(viewer, west, south, east, north, color, name, extrudedHeightMeters) {
    viewer.entities.add({
        name: name || 'Custom Extruded Rectangle',
        rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
            material: color.withAlpha(0.7),

            /* height and extrudedHeight define the 3D shape */ 
            height: 0,
            /* extrudedHeight is the height to which the rectangle is extruded */
            extrudedHeight: extrudedHeightMeters,

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

    const targetsCount = targets.length;
    for (let i = 0; i < targetsCount; i++) {
        const target = targets[i];
        addExtrudedRectangle(
            viewer,
            target.MinLon, target.MinLat, target.MaxLon, target.MaxLat,
            Cesium.Color.CYAN,
            "Target ID: " + target.Name,
            0
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
    initMapItemTooltip();

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