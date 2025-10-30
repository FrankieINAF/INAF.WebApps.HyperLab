import {
    Ellipsoid,
    Extent,
    Globe,
    LonLat,
    XYZ,
    Entity,
    Vector
} from "/lib/openglobus/js/og.es.js";

var globe;
var targets;

export function showGlobe() {
    const mercuryEllipsoid = new Ellipsoid(2439400.0, 2439400.0, 2439400.0);

    //const mercuryTiles = new XYZ("MercuryRaster", {
    //    isBaseLayer: true,
    //    url: "/tiles/mercury/{z}/{x}/{y}.png", // percorso alle tile
    //    attribution: "ESRI",
    //    visibility: true,
    //    minZoom: 0,
    //    maxZoom: 7
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
        viewExtent: new Extent(new LonLat(-180, -90), new LonLat(180, 90))
    });

    /* set sky background */
    globe.planet.renderer.controls.SimpleSkyBackground.colorOne = "rgb(255,255,255)";
    globe.planet.renderer.controls.SimpleSkyBackground.colorTwo = "rgb(255,255,255)";

    /* define targets layer with events for each target */
    targets = new Vector("Targets", {
        'visibility': true,
        'isBaseLayer': false,
        'diffuse': [0, 0, 0],
        'ambient': [1, 1, 1]
    });
    targets.addTo(globe.planet);

    targets.events.on("mouseleave", function (e) {
        e.pickingObject.geometry.setFillColor(1, 0, 0, 0.2);
        tooltipElement.style.display = 'none';
    });
    targets.events.on("mouseenter", function (e) {
        e.pickingObject.geometry.bringToFront();
        e.pickingObject.geometry.setFillColor(1, 0, 0, 0.6);

        tooltipElement.innerHTML = e.pickingObject.name;
        tooltipElement.style.left = e.clientX + 15 + 'px';
        tooltipElement.style.top = e.clientY + 15 + 'px';
        tooltipElement.style.display = 'block';
    });

    targets.events.on("lclick", function (e) {
        globe.planet.flyExtent(e.pickingObject.geometry.getExtent());

        selectedTargetId = e.pickingObject.id;
        showCharmsSelectedItem();
    });
    targets.events.on("touchstart", function (e) {
        globe.planet.flyExtent(e.pickingObject.geometry.getExtent());

        selectedTargetId = e.pickingObject.id;
        showCharmsSelectedItem();
    });
}

export function addRectangleByBounds(id, name, minLat, maxLat, minLon, maxLon) {
    const coordinates = [[[[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat], [minLon, minLat]]]];

    targets.add(new Entity({
        'id': id,
        'name': name,
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

