async function retrievePublicStuffAsync() {
    setLoadingCircleIsVisible(true);

    const callRetrievePublicSampleNameGroupsAsync = retrievePublicSampleNameGroupsAsync();
    const callRetrievePublicSampleTypeGroupsAsync = retrievePublicSampleTypeGroupsAsync();

    await Promise.all([callRetrievePublicSampleNameGroupsAsync, callRetrievePublicSampleTypeGroupsAsync]);

    setLoadingCircleIsVisible(false);
}

function buildGroupsChart(containerId, items) {
    var labels = items.Select(x => x.Item.StringValue).ToList();
    var values = items.Select(x => x.Count).ToList();

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
/* SAMPLE NAME GROUPS */
/* -------------------------------------------------------------------------------- */
async function retrievePublicSampleNameGroupsAsync() {
    try {
        const items = await doAjaxGetNoModelAsync(UrlGetPublicSampleNameGroups);
        if (items && items.length > 0) 
            buildGroupsChart('chartSampleNames', items);
    } catch (e) {
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
    }
}

function buildSampleTypeGroupsChart(items) {


}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(async function () {
    showPageItems(true);

    await delay(1000);

    retrievePublicStuffAsync();
});