var viewer = null;
var tooltipElement = null;
var handler = null;
var mercuryEllipsoid = null;

const MercuryRadiusMeters = 2439700.0; // in meters

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
    // Mercury radius in meters: 2,439,700.0 m (The three radii define a sphere/ellipsoid)
    mercuryEllipsoid = new Cesium.Ellipsoid(MercuryRadiusMeters, MercuryRadiusMeters, MercuryRadiusMeters);

    const mercuryProjection = new Cesium.GeographicProjection(mercuryEllipsoid);

    viewer = new Cesium.Viewer('map', {
        globe: new Cesium.Globe(mercuryEllipsoid),
        mapProjection: mercuryProjection,
        terrainProvider: new Cesium.EllipsoidTerrainProvider({ ellipsoid: mercuryEllipsoid }),
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

    viewer.scene.mapProjection = mercuryProjection;
    viewer.scene.camera.projection = mercuryProjection;

    /* set Mercury imagery */
    const mercuryImagery = new Cesium.SingleTileImageryProvider({
        url: '/images/maps/mercury_messenger_mdis_basemap_enhancedcolor_mosaic_global_1024.jpg',
        rectangle: Cesium.Rectangle.MAX_VALUE
    });
    viewer.imageryLayers.addImageryProvider(mercuryImagery);

    /* set background color */
    viewer.scene.backgroundColor = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0);

    // Get the equatorial radius of the WGS84 ellipsoid (Cesium's default)
    const globeRadius = mercuryEllipsoid.maximumRadius;

    // Calculate the range needed to make the globe visually 'fill' the container.
    // A factor between 3.0 and 4.0 times the radius provides an optimal, close-up global view.
    const distanceToFill = globeRadius * 2.5;

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, distanceToFill),
        range: distanceToFill,
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0)
    });

    viewer.scene.globe.depthTestAgainstTerrain = false;

}

/* ################################################################################ */
/* SHOW TARGETS */
/* ################################################################################ */
function addMercuryRectangle(name, west, south, east, north,
    color = Cesium.Color.RED.withAlpha(0.5)) {
    const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

    const rectangleGeometry = new Cesium.RectangleGeometry({
        rectangle: rectangle,
        height: 0, // Appoggiato sulla superficie
        extrudedHeight: 0,
        ellipsoid: mercuryEllipsoid
    });

    const geometryInstance = new Cesium.GeometryInstance({
        geometry: rectangleGeometry,
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
        },
        id: name
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: geometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true
        }),
        releaseGeometryInstances: false
    }));



    const centerLon = (west + east) / 2;
    const centerLat = (south + north) / 2;

    // 🔁 Conversione in Cartographic e poi in Cartesian3 usando ellissoide di Mercurio
    const centerCartographic = Cesium.Cartographic.fromDegrees(centerLon, centerLat, 0);
    const centerCartesian = mercuryEllipsoid.cartographicToCartesian(centerCartographic);

    // 📍 Aggiunta del punto centrale come entità
    viewer.entities.add({
        position: centerCartesian,
        point: {
            pixelSize: 8,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2
        },
        //label: {
        //    text: name,
        //    font: '14px sans-serif',
        //    fillColor: Cesium.Color.WHITE,
        //    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        //    outlineWidth: 2,
        //    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        //    pixelOffset: new Cesium.Cartesian2(0, -12)
        //}
    });

}




// mostra i rettangoli ma sono proettati sulla superficie della terra, molto più grande di Mercurio
//function addExtrudedRectangle(viewer, coordinates, color, name, extrudedHeightMeters) {
//    viewer.entities.add({
//        name: name || 'Custom Extruded Rectangle',
//        rectangle: {
//            coordinates: coordinates,
//            material: color.withAlpha(0.7),

//            /* height and extrudedHeight define the 3D shape */ 
//            height: 0,
//            /* extrudedHeight is the height to which the rectangle is extruded */
//            extrudedHeight: extrudedHeightMeters,
//            fill: true,
//            outline: true,
//            outlineColor: Cesium.Color.BLACK
//        }
//    });
//}

function createScaledRectangle(ellipsoid, data) {
    // 1. Convert the four corner degrees to Cartographic (using Radians)
    const cartographicCorners = [
        Cesium.Cartographic.fromDegrees(data.MinLon, data.MinLat), // SW
        Cesium.Cartographic.fromDegrees(data.MaxLon, data.MinLat), // SE
        Cesium.Cartographic.fromDegrees(data.MinLon, data.MaxLat), // NW
        Cesium.Cartographic.fromDegrees(data.MaxLon, data.MaxLat)  // NE
    ];

    // 2. Convert the Cartographic corners to 3D Cartesian coordinates, 
    //    using the custom ellipsoid for correct scaling.
    const cartesianCorners = ellipsoid.cartographicArrayToCartesianArray(cartographicCorners);
    //console.log(cartesianCorners);
    // 3. Create the final Cesium.Rectangle from the scaled Cartesian points.
    //    We explicitly pass the custom ellipsoid here for calculation consistency.
    //    NOTE: Although the documentation might be confusing, passing the ellipsoid 
    //    here ensures the final conversion back to Lon/Lat (radians) is correct.
    return Cesium.Rectangle.fromCartesianArray(cartesianCorners, ellipsoid);
}

/* ################################################################################ */
/* RETRIEVE TARGETS FROM BACK-END */
/* ################################################################################ */
async function retrieveAndShowTargetsAsync() {
    let targets = await doAjaxGetNoModelAsync(UrlGetTargetsWithObsCoords);
    if (targets == null || targets.length == 0)
        return;

    //const cartographic = Cesium.Cartographic.fromDegrees(0, 0, MercuryRadiusMeters);
    //const cartesian = mercuryEllipsoid.cartographicToCartesian(cartographic);

    //viewer.entities.add({
    //    position: cartesian,
    //    point: {
    //        pixelSize: 100,
    //        color: Cesium.Color.RED
    //    }
    //});


    const targetsCount = targets.length;
    for (let i = 0; i < targetsCount; i++) {
        const target = targets[i];
        //console.log("Adding target:", target.Name, target.MinLon, target.MinLat, target.MaxLon, target.MaxLat);
        addMercuryRectangle("Target: " + target.Name,
            target.MinLon,
            target.MinLat,
            target.MaxLon,
            target.MaxLat);
        //const scaledCoordinates = createScaledRectangle(mercuryEllipsoid, target);
        //const rectangle = [scaledCoordinates.west, scaledCoordinates.south, scaledCoordinates.east, scaledCoordinates.north];
        //const rectangle = Cesium.Rectangle.fromDegrees(
        //    target.MinLon,
        //    target.MinLat,
        //    target.MaxLon,
        //    target.MaxLat
        //);
        //addExtrudedRectangle(
        //    viewer,
        //    rectangle,
        //    Cesium.Color.CYAN,
        //    "Target: " + target.Name,
        //    0
        //);
    }

    viewer.scene.requestRender();
}

function addDebugPointOnMercury(longitude, latitude, height = 0) {
    const cartographic = Cesium.Cartographic.fromDegrees(longitude, latitude, height);
    const cartesian = mercuryEllipsoid.cartographicToCartesian(cartographic);

    viewer.entities.add({
        position: cartesian,
        point: {
            pixelSize: 10,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2
        },
        label: {
            text: `(${longitude}, ${latitude})`,
            font: '14px sans-serif',
            fillColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15)
        }
    });

    //viewer.camera.setView({
    //    destination: cartesian,
    //    orientation: {
    //        heading: Cesium.Math.toRadians(0),
    //        pitch: Cesium.Math.toRadians(-90),
    //        roll: 0
    //    }
    //});

    viewer.zoomTo(viewer.entities);

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
            //addDebugPointOnMercury(0, 0, 0);
            await retrieveAndShowTargetsAsync();
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingCircleIsVisible(false);
        }
    };

    executeAfter(init, 500);
});