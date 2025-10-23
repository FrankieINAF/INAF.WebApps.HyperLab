import { Globe, Ellipsoid, GeoImage, layer, terrain, EmptyTerrain } from '/lib/openglobus/js/og.es.js';

var viewer = null;
var tooltipElement = null;
var handler = null;
var mercuryEllipsoid = null;

const MercuryRadiusMeters = 2439700.0; // in meters

function initGlobe() {
    mercuryEllipsoid = new Ellipsoid(MercuryRadiusMeters, MercuryRadiusMeters, MercuryRadiusMeters);

    viewer = new Globe({
        target: "map",
        name: "Mercury",
        ellipsoid: mercuryEllipsoid,
        terrain: new EmptyTerrain(),
        imageryLayers: [
            new GeoImage("Mercury Map", {
                url: "/images/maps/mercury_messenger_mdis_basemap_enhancedcolor_mosaic_global_1024.jpg",
                corners: [
                    [-180, -90],
                    [180, -90],
                    [180, 90],
                    [-180, 90]
                ]
            })
        ],
        stars: null,
    });
}


/* ################################################################################ */
/* SHOW TARGETS */
/* ################################################################################ */

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
        
    }
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    showPageItems(true);

    setLoadingCircleIsVisible(true);

    

    const init = async function () {
        try {
            initGlobe();

            await retrieveAndShowTargetsAsync();
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingCircleIsVisible(false);
        }
    };

    executeAfter(init, 500);
});