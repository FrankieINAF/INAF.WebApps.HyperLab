import { showGlobe, addRectangleByBounds } from './mapopenglobus.js';

var footprintsArray = null;
var targetsArray = null;

var viewer = null;
var tooltipElement = null;
var handler = null;

var selectedTargetId;

var FOOTPRINT = 'Footprint';
var SIM = 'SIM';
var TARGET = 'Target';

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

        //const flatCoords = footprint.corners.flatMap(corner => [corner.longitude, corner.latitude]);
        //const positions = Cesium.Cartesian3.fromDegreesArray(flatCoords);

        //viewer.entities.add({
        //    id: footprint.Id,
        //    name: `${FOOTPRINT} ${footprint.Id}`,
        //    polygon: {
        //        hierarchy: positions,
        //        /* height and extrudedHeight define the 3D shape */
        //        height: 0,
        //        /* extrudedHeight is the height to which the rectangle is extruded */
        //        extrudedHeight: 0,
        //        material: Cesium.Color.RED.withAlpha(0.5),
        //        outline: true,
        //        outlineColor: Cesium.Color.BLACK
        //    }
        //});
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
        addRectangleByBounds(target.Name, target.MinLat, target.MaxLat, target.MinLon, target.MaxLon);
    }

    setLoadingCircleIsVisible(false);
}

function removeTargets() {
    //let entities = viewer.entities.values.find(x => x.name.includes(SIM));
    //if (!entities)
    //    return;

    ///* remove targets from map */
    //entities.entityCollection.removeAll();
    /* clear in-memory array */
    targetsArray = [];
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

    /* retrieve stps related to footprints */
    retrieveStpsWithFootprintsAsync();

    /* init switch for loading/hiding targets */
    initSwitchLoadHideTargets();
    /* init switch for selecting stp */
    initSwitchShowHideSearchOfFootprints();
});