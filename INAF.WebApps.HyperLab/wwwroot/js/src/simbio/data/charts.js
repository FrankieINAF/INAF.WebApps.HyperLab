async function getObservationsForCarts(stpValue) {
    setLoadingCircleIsVisible(true);

    const model = {
        Value: stpValue,
    };

    const obj = await doAjaxGetAsync(UrlGetObservationsForCharts, model);
    if (obj && obj.IsOk) {
        const observations = obj.ResponseObject;


        setLoadingCircleIsVisible(false);
    } else {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(WARNING_LABEL, ChartsNoObservationsFoundMessage, WARNING);
    }
}