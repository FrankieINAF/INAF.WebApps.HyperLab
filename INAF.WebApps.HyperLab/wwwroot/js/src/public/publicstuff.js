async function retrievePublicStuffAsync() {
    const callRetrievePublicFilenameGroupsAsync = retrievePublicFilenameGroupsAsync();
    const callRetrievePublicMineralTypeGroupsAsync = retrievePublicMineralTypeGroupsAsync();
    const callRetrievePublicOriginTypeGroupsAsync = retrievePublicOriginTypeGroupsAsync();
    const callRetrievePublicSampleNameGroupsAsync = retrievePublicSampleNameGroupsAsync();
    const callRetrievePublicSampleTypeGroupsAsync = retrievePublicSampleTypeGroupsAsync();

    await Promise.all([callRetrievePublicFilenameGroupsAsync, callRetrievePublicMineralTypeGroupsAsync, callRetrievePublicOriginTypeGroupsAsync, callRetrievePublicSampleNameGroupsAsync, callRetrievePublicSampleTypeGroupsAsync]);
}

function buildGroupsChart(containerId, items, callback) {
    var labels = items.map(x => x.Item.StringValue);
    var values = items.map(x => x.Count);

    const ctx = document.getElementById(containerId).getContext('2d');
    const myChart = new Chart(ctx, {
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
            },
            onClick: (event, activeElements) => {
                // Controlliamo se l'utente ha cliccato effettivamente su una fetta
                if (activeElements.length > 0) {
                    // Prendiamo il primo elemento attivo (la fetta cliccata)
                    const firstPoint = activeElements[0];

                    // Otteniamo l'indice della fetta e l'indice del dataset
                    const datasetIndex = firstPoint.datasetIndex;
                    const index = firstPoint.index;

                    // Recuperiamo i dati associati a quella fetta
                    const label = myChart.data.labels[index].toLowerCase();

                    let id = 0;
                    const item = items.find(x => x.Item.StringValue.toLowerCase() === label);
                    if (item) {
                        id = item.Item.Id;
                    }

                    callback(id);
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
            buildGroupsChart('chartMineralTypes', items, executeSearchSimpleByMineralType);
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
            buildGroupsChart('chartOriginTypes', items, executeSearchSimpleByOriginType);
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
            buildList('chartSampleNames', items, executeSearchSimpleBySampleName.name);
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
            buildGroupsChart('chartSampleTypes', items, executeSearchSimpleBySampleType);
    } catch (e) {
        console.error('Error retrieving public sample type groups:', e);
    }
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(async function () {
    setLoadingCircleIsVisible(true);

    showPageItems(true);

    await delay(200);

    initializeRequestedLevelsSimple();

    await retrieveArraysForSearchesAsync();

    await retrievePublicStuffAsync();

    setLoadingCircleIsVisible(false);
});