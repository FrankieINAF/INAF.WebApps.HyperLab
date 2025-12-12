async function retrieveObservationsForChartsAsync(stpValue) {
    setLoadingCircleIsVisible(true);

    const model = {
        Value: stpValue,
    };

    const obj = await doAjaxGetAsync(UrlGetObservationsForCharts, model);
    if (obj && obj.IsOk) {
        const observations = obj.ResponseObject;
        console.log(observations);

        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, ChartsNoObservationsFoundMessage, WARNING);
    }
}

async function retrieveStpsAsync() {
    const obj = await doAjaxGetNoModelAsync(UrlGetStps);
    if (obj) {
        const stps = obj.ResponseObject;

        Metro.getPlugin('#selectStpForChart', 'select').addOption('Select STP');
        const stpsCount = stps.length;
        for (var i = 0; i < stpsCount; i++) {
            Metro.getPlugin('#selectStpForChart', 'select').addOption(stps[i]);
        }
    } else {
        showSimpleDialog(WARNING_LABEL, ChartsNoStpsFoundMessage, WARNING);
    }
}