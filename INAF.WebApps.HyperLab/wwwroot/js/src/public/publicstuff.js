async function retrievePublicStuffAsync() {
    const callRetrievePublicFilenameGroupsAsync = retrievePublicFilenameGroupsAsync();
    const callRetrievePublicMineralTypeGroupsAsync = retrievePublicMineralTypeGroupsAsync();
    const callRetrievePublicOriginTypeGroupsAsync = retrievePublicOriginTypeGroupsAsync();
    const callRetrievePublicSampleNameGroupsAsync = retrievePublicSampleNameGroupsAsync();
    const callRetrievePublicSampleTypeGroupsAsync = retrievePublicSampleTypeGroupsAsync();

    await Promise.all([callRetrievePublicFilenameGroupsAsync, callRetrievePublicMineralTypeGroupsAsync, callRetrievePublicOriginTypeGroupsAsync, callRetrievePublicSampleNameGroupsAsync, callRetrievePublicSampleTypeGroupsAsync]);
}

function buildGroupsChart(containerId, items, callback) {
    const colors = [
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
        '#59a14f', '#edc948', '#b07aa1', '#ff9da7'
    ];

    const container = document.getElementById(containerId);
    const myChart = echarts.init(container, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    const data = items.map((x, index) => ({
        name: x.Item.StringValue,
        value: x.Count,
        itemStyle: { color: colors[index % colors.length] }
    }));

    myChart.setOption({
        tooltip: {
            trigger: 'item'
        },
        legend: {
            bottom: 0
        },
        series: [
            {
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                data: data
            }
        ]
    });

    myChart.on('click', (params) => {
        let id = 0;
        const item = items.find(x => x.Item.StringValue.toLowerCase() === params.name.toLowerCase());
        if (item) {
            id = item.Item.Id;
        }

        callback(id);
    });

    window.addEventListener('resize', () => myChart.resize());
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
    navigationStatus = NAVIGATION_PUBLIC_STUFF;

    setLoadingCircleIsVisible(true);

    showPageItems(true);

    await delay(200);

    initializeRequestedLevelsSimple();

    await retrieveArraysForSearchesAsync();

    await retrievePublicStuffAsync();

    setLoadingCircleIsVisible(false);
});