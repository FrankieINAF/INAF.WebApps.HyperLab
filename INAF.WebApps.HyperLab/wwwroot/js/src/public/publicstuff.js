async function retrievePublicStuffAsync() {
    setLoadingCircleIsVisible(true);

    const callRetrievePublicFilenameGroupsAsync = retrievePublicFilenameGroupsAsync();
    const callRetrievePublicMineralTypeGroupsAsync = retrievePublicMineralTypeGroupsAsync();
    const callRetrievePublicOriginTypeGroupsAsync = retrievePublicOriginTypeGroupsAsync();
    const callRetrievePublicSampleNameGroupsAsync = retrievePublicSampleNameGroupsAsync();
    const callRetrievePublicSampleTypeGroupsAsync = retrievePublicSampleTypeGroupsAsync();

    await Promise.all([callRetrievePublicFilenameGroupsAsync, callRetrievePublicMineralTypeGroupsAsync, callRetrievePublicOriginTypeGroupsAsync, callRetrievePublicSampleNameGroupsAsync, callRetrievePublicSampleTypeGroupsAsync]);

    setLoadingCircleIsVisible(false);
}

function buildGroupsChart(containerId, items) {
    var labels = items.map(x => x.Item.StringValue);
    var values = items.map(x => x.Count);

    const ctx = document.getElementById(containerId).getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
                    '#59a14f', '#edc948', '#b07aa1', '#ff9da7'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function buildList(containerId, items, callbackName) {
    let html = `<ul data-role="listview" data-view="list" data-selectable="false" style="background: transparent;">`;
    const itemsNumber = items.length;
    for (var i = 0; i < itemsNumber; i++) {
        html += `<li class="margin-top-8" data-icon="<span class='mif mif-search'></span>" onclick="${callbackName}('${items[i].Item.StringValue}')"><span class="text-ellipsis">${items[i].Item.StringValue}</span></li>`;
    }
    html += "</ul>";

    $(`#${containerId}`).html(html);
}

/* -------------------------------------------------------------------------------- */
/* FILENAME GROUPS */
/* -------------------------------------------------------------------------------- */
async function retrievePublicFilenameGroupsAsync() {
    try {
        const items = await doAjaxGetNoModelAsync(UrlGetPublicFilenameGroups);
        if (items && items.length > 0)
            buildList('chartFileNames', items, executeSearchSimpleByFilename.name);
    } catch (e) {
        console.error('Error retrieving public filename groups:', e);
    }
}


/* -------------------------------------------------------------------------------- */
/* MINERAL TYPE GROUPS */
/* -------------------------------------------------------------------------------- */
async function retrievePublicMineralTypeGroupsAsync() {
    try {
        const items = await doAjaxGetNoModelAsync(UrlGetPublicMineralTypeGroups);
        if (items && items.length > 0)
            buildGroupsChart('chartMineralTypes', items);
    } catch (e) {
        console.error('Error retrieving public mineral type groups:', e);
    }
}

/* -------------------------------------------------------------------------------- */
/* ORIGIN TYPE GROUPS */
/* -------------------------------------------------------------------------------- */
async function retrievePublicOriginTypeGroupsAsync() {
    try {
        const items = await doAjaxGetNoModelAsync(UrlGetPublicOriginTypeGroups);
        if (items && items.length > 0)
            buildGroupsChart('chartOriginTypes', items);
    } catch (e) {
        console.error('Error retrieving public origin type groups:', e);
    }
}

/* -------------------------------------------------------------------------------- */
/* SAMPLE NAME GROUPS */
/* -------------------------------------------------------------------------------- */
async function retrievePublicSampleNameGroupsAsync() {
    try {
        const items = await doAjaxGetNoModelAsync(UrlGetPublicSampleNameGroups);
        if (items && items.length > 0) 
            buildList('chartSampleNames', items);
    } catch (e) {
        console.error('Error retrieving public sample name groups:', e);
    }
}

/* -------------------------------------------------------------------------------- */
/* SAMPLE TYPE GROUPS */
/* -------------------------------------------------------------------------------- */
async function retrievePublicSampleTypeGroupsAsync() {
    try {
        const items = await doAjaxGetNoModelAsync(UrlGetPublicSampleTypeGroups);
        if (items && items.length > 0)
            buildGroupsChart('chartSampleTypes', items);
    } catch (e) {
        console.error('Error retrieving public sample type groups:', e);
    }
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(async function () {
    showPageItems(true);

    await delay(200);

    initializeRequestedLevelsSimple();

    retrievePublicStuffAsync();
});