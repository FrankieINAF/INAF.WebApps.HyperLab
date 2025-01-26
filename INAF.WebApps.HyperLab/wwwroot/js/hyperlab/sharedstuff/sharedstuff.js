/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    $(`[id^='${checkboxSharedSpectraWithMeBaseId}']`).on('click', function (evt) {
        if (isCheckboxChecked(evt.target.id)) {
            selectedSpectra.push(evt.target.id.replace(checkboxSharedSpectraWithMeBaseId, ''));
            console.log(`Sharing spectra with me: ${evt.target.id}`);

            if (selectedSpectra.length == 1)
                addCreateChartsButton();
        } else {
            selectedSpectra = selectedSpectra.filter(e => e !== evt.target.id.replace(checkboxSharedSpectraWithMeBaseId, ''));
            console.log(`Unsharing spectra with me: ${evt.target.id}`);

            if (selectedSpectra.length == 0)
                removeCreateChartsButtonProcedure();
        }
    });

    showPageItems();
});