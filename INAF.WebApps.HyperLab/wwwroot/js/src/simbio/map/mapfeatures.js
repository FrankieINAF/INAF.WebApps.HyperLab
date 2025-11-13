import {
    Entity,
    LonLat
} from "/lib/openglobus/js/og.es.js";

import {
    featuresLayer,
    setMapPointerEventsAllowed
} from "./map.js";

var isAllFeatureRequest = false;
var points = [];

var featuresNamesArray = [
    FeatureCategoryAlbedos,
    FeatureCategoryCraters,
    FeatureCategoryDorsa,
    FeatureCategoryFossae,
    FeatureCategoryMontes,
    FeatureCategoryPlanitiae,
    FeatureCategoryRupes,
    FeatureCategoryValles
]

/* ################################################################################ */
/* MANAGE CHECKBOXES */
/* ################################################################################ */
export function initCheckboxFeaturesAll() {
    initCheckboxFeatures(FeatureCategoryAll);
    initCheckboxFeatures(FeatureCategoryAlbedos);
    initCheckboxFeatures(FeatureCategoryCraters);
    initCheckboxFeatures(FeatureCategoryDorsa);
    initCheckboxFeatures(FeatureCategoryFossae);
    initCheckboxFeatures(FeatureCategoryMontes);
    initCheckboxFeatures(FeatureCategoryPlanitiae);
    initCheckboxFeatures(FeatureCategoryRupes);
    initCheckboxFeatures(FeatureCategoryValles);
}

function initCheckboxFeatures(featureCategory) {
    $(`#showHideFeatures${featureCategory}`).on('change', async function () {
        if (isAllFeatureRequest && featureCategory != FeatureCategoryAll)
            return;

        let isChecked = isCheckboxChecked(`showHideFeatures${featureCategory}`);

        if (isChecked) {
            if (featureCategory == FeatureCategoryAll)
                retrieveMapFeaturesAllProcedure(featureCategory);
            else
                retrieveMapFeaturesAsync(featureCategory);
        }
        else {
            if (featureCategory == FeatureCategoryAll)
                removeMapFeaturesAllProcedure();
            else
                removeMapFeatures(featureCategory);
        }
    });
}

/* ################################################################################ */
/* RETRIEVE/REMOVE FEATURES */
/* ################################################################################ */
function removeMapFeatures(featureCategory) {
    const selectedEntities = featuresLayer.getEntities().filter(x => x.properties.type == featureCategory);
    if (selectedEntities == null || selectedEntities.length == 0)
        return false;

    /* remove entities from map */
    featuresLayer.removeEntities(selectedEntities);

    /* remove feature tooltip */
    hideFeatureTooltip();
}

function removeMapFeaturesAllProcedure() {
    featuresNamesArray.forEach(function (featureName) {
        $(`#showHideFeatures${featureName}`).prop('checked', false).trigger('change');
    });

    isAllFeatureRequest = false;

    removeMapFeatures(FeatureCategoryAll);
}

function retrieveMapFeaturesAllProcedure(featureCategory) {
    isAllFeatureRequest = true;

    featuresNamesArray.forEach(function (featureName) {
        $(`#showHideFeatures${featureName}`).prop('checked', true).trigger('change');
    });

    /* execute retrieval for All features */
    retrieveMapFeaturesAsync(featureCategory);
}

async function retrieveMapFeaturesAsync(featureCategory) {
    setLoadingCircleIsVisible(true);

    let text = featureCategory;
    if (featureCategory != 'All') {
        text = featureCategory.charAt(0).toUpperCase();
    }

    const model = {
        Text: text
    };

    let obj = await doAjaxGetAsync(UrlGetFeatures, model);
    if (obj && obj.length > 0) {
        //console.log(obj);
        const featuresNum = obj.length;
        for (let i = 0; i < featuresNum; i++) {
            let lonlat = new LonLat(obj[i].Longitude, obj[i].Latitude);
            addMapFeatureOnGlobus(obj[i], lonlat, featureCategory);
        }
        featuresLayer.addEntities(points);
        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, FeaturesNoItemsAvailableMessage, WARNING);
    }
}

/* -------------------------------------------------------------------------------- */
/* ADD FEATURES ON GLOBUS */
/* -------------------------------------------------------------------------------- */
function addMapFeatureOnGlobus(feature, lonlat, featureCategory) {
    points.push(new Entity({
        'name': feature.Name,
        'properties': {
            'type': featureCategory,
        },
        'lonlat': lonlat,
        'billboard': {
            'src': `/images/simbiomap/features/features${feature.FeatureCategoryName}.png`,
            'size': [48, 48],
            'offset': [0, 0],
            //'alignedAxis': wgs84.lonLatToCartesian(coords).normalize()
        }
    }));
}

/* -------------------------------------------------------------------------------- */
/* MANAGE EVENTS FOR FEATURES */
/* -------------------------------------------------------------------------------- */
export function defineFeaturesEvents() {
    if (!isMobileByOS()) {
        featuresLayer.events.on("mouseleave", function (e) {
            hideByClassDFlexItem('featuresTooltip');
        });
        featuresLayer.events.on("mouseenter", function (e) {
            showFeatureTooltip(e);
        });
    } else {
        featuresLayer.events.on("touchstart", function (e) {
            showFeatureTooltip(e);
        });
    }
}

export function hideFeatureTooltip() {
    hideByClassDFlexItem('featuresTooltip');
    setMapPointerEventsAllowed(true);
}

function showFeatureTooltip(e) {
    let xOffset = 20;
    let yOffset = 0;
    if (!isMobile()) {
        xOffset = 120;
        yOffset = -40;
    }

    $('#featureName').text(e.pickingObject.name);
    $('#featureCategory').text(e.pickingObject.properties.type);
    const lonlat = e.pickingObject.getLonLat();
    $('#featurePosition').text(`Lon: ${lonlat.lon.toFixed(2)}°, Lat: ${lonlat.lat.toFixed(2)}°`);
    $('#featuresTooltip').css({
        left: `${e.clientX + xOffset}px`,
        top: `${e.clientY + yOffset}px`
    });
    showByClassDFlexItem('featuresTooltip');

    if (isMobile()) {
        showByClassDFlexItem('featuresTooltipCloseButton');
        setMapPointerEventsAllowed(false);
    }
}