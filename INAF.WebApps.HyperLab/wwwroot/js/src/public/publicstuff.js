async function retrievePublicStuffAsync() {
    setLoadingCircleIsVisible(true);

    const callRetrievePublicMineralTypeGroupsAsync = retrievePublicMineralTypeGroupsAsync();
    const callRetrievePublicSampleNameGroupsAsync = retrievePublicSampleNameGroupsAsync();
    const callRetrievePublicSampleTypeGroupsAsync = retrievePublicSampleTypeGroupsAsync();

    await Promise.all([callRetrievePublicMineralTypeGroupsAsync, callRetrievePublicSampleNameGroupsAsync, callRetrievePublicSampleTypeGroupsAsync]);

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
/* SAMPLE NAME GROUPS */
/* -------------------------------------------------------------------------------- */
async function retrievePublicSampleNameGroupsAsync() {
    try {
        const items = await doAjaxGetNoModelAsync(UrlGetPublicSampleNameGroups);
        if (items && items.length > 0) 
            buildGroupsChart('chartSampleNames', items);
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

    retrievePublicStuffAsync();
});