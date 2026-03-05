var removeSharesButtonId = 'buttonRmoveShares';

var selectedShareItems = [];

/* ---------- REMOVE SHARES BUTTON ---------- */
function addRemoveSharesButton() {
    addButton(removeSharesButtonId, ButtonRemoveSharesLabel, 'mif-bin', removeSharesAsync);
}

function removeRemoveSharesButtonProcedure() {
    if (!isButtonAvailable(removeSharesButtonId))
        return;

    animateCSS(`${removeSharesButtonId}`, `bounceOutUp`, FAST, removeRemoveSharesButton);
}

function removeRemoveSharesButton() {
    $(`#${removeSharesButtonId}`).remove();
}

function groupItemsByUserId(items) {
    return items.reduce((acc, item) => {
        if (!acc[item.UserId]) {
            acc[item.UserId] = [];
        }
        acc[item.UserId].push(item);
        return acc;
    }, {});
}

async function removeSharesAsync() {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let removeSharesResults;

    try {
        let groupedItems = groupItemsByUserId(selectedShareItems);

        let removeShareItems = [];
        /* extract user ids (that are keys in groupedItems) and then iterate on them */
        let keys = Object.keys(groupedItems)
        let keysNum = keys.length;
        for (var i = 0; i < keysNum; i++) {
            let userId = keys[i];
            let spectraId = groupedItems[userId].map(x => x.SpectrumId)
            let removeShareItem = {
                UserId: userId,
                SpectraIds: spectraId
            };
            removeShareItems.push(removeShareItem);
        }

        let model = {
            Shares: removeShareItems
        };

        removeSharesResults = await doAjaxPostAsync(UrlRemoveSharesBetweenOwnerUserAndUsers, model);
        isOk = removeSharesResults.IsOk;
        removeSharesFromList(removeSharesResults);
        setLoadingCircleIsVisible(false);
    } catch (e) {
        isOk = false;
        setLoadingCircleIsVisible(false);
    }

    /* remove buttons since items are supposed to be not available anymore */
    removeRemoveSharesButtonProcedure();
    removeCreateChartsButtonProcedure();

    /* final message for success or error */
    if (isOk)
        showSimpleDialog(INFO_LABEL, RemoveShareSuccessMessage, SUCCESS);
    else {
        /* when an error in creation of shares or in invitations happned, show the specific message */
        if (showRemoveSharesErrors(removeSharesResults) > 0)
            return;
        /* when an error on the back-end happened, show the generic message */
        showSimpleDialog(ERROR_LABEL, RemoveSharesErrorMessage, ALERT);
    }
}

function removeSharesFromList(removeSharesResults) {
    if (removeSharesResults == null)
        return;
    if (removeSharesResults.ResponseObject.length == 0)
        return;

    let itemsToBeRemovedNum = removeSharesResults.ResponseObject.length;
    for (var i = 0; i < itemsToBeRemovedNum; i++) {
        let item = removeSharesResults.ResponseObject[i];
        let itemToBeRemoved = $(`[id$="Spectrum${item.SpectrumId}_User${item.UserId}Container"]`);
        if (itemToBeRemoved != null)
            itemToBeRemoved.remove();
    }
}

function showRemoveSharesErrors(removeSharesResults) {
    let errorsNum = 0;

    if (removeSharesResults == null)
        return errorsNum;
    if (removeSharesResults.ResponseObject.length == 0)
        return errorsNum;

    let groupedItems = groupItemsByUserId(removeSharesResults.ResponseObject);

    if (groupedItems == null || groupedItems.length == 0)
        return errorsNum;

    let html = `<div class='row cell-fs-12 margin-16'>`;

    let keys = Object.keys(groupedItems)
    let keysNum = keys.length;
    for (var i = 0; i < keysNum; i++) {
        let userId = keys[i];
        let errors = groupedItems[userId].filter(x => !x.IsShareOperationCompleted);
        if (errors && errors.length > 0) {
            errorsNum += 1;
            html += `<div class='row cell-fs-12'><p class='text-leader2'>${RemoveSharesForUserErrorMessage.replace('r_v', removeSharesResults.ResponseObject[i].CompleteUserName)}</p></div>`;
        }
    }

    html += `</div>`;

    let options = {
        callback: Metro.noop,
        timeout: 5000,
        showTop: true,
        clsToast: "alert"
    };
    Metro.toast.create(html, null, null, null, options);

    return errorsNum;
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    /* Add action for checkboxes of spectra shared WITH ME */
    $(`[id^='${checkboxSharedSpectraWithMeBaseId}']`).on('click', function (evt) {
        if (isCheckboxChecked(evt.target.id)) {
            selectedSpectra.push(evt.target.id.replace(checkboxSharedSpectraWithMeBaseId, ''));
            //console.log(`Sharing spectra with me: ${evt.target.id}`);

            //addCreateChartsButtonProcedure();
        } else {
            selectedSpectra = selectedSpectra.filter(e => e !== evt.target.id.replace(checkboxSharedSpectraWithMeBaseId, ''));
            //console.log(`Unsharing spectra with me: ${evt.target.id}`);

            if (selectedSpectra.length == 0)
                removeCreateChartsButtonProcedure();
        }
    });
    
    /* Add action for checkboxes of spectra shared BY ME */
    $(`[id^='${checkboxSharedSpectraByMeBaseId}']`).on('click', function (evt) {
        try {
            let temp = evt.target.id.split('_');
            let spectrumId = temp[1].replace('Spectrum', '');
            let userId = temp[2].replace('User', '');
            if (isCheckboxChecked(evt.target.id)) {
                let shareItem = {
                    SpectrumId: spectrumId,
                    UserId: userId
                };
                selectedShareItems.push(shareItem);
                selectedSpectra.push(spectrumId);
                //console.log(`Sharing spectra by me: ${evt.target.id}`);
                //addCreateChartsButtonProcedure();
                if (selectedShareItems.length == 1)
                    addRemoveSharesButton();
            } else {
                selectedShareItems = selectedShareItems.filter(e => e !== id);
                selectedSpectra = selectedSpectra.filter(e => e !== spectrumId);
                //console.log(`Unsharing spectra by me: ${evt.target.id}`);
                if (selectedShareItems.length == 0) {
                    removeCreateChartsButtonProcedure();
                    removeRemoveSharesButtonProcedure();
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    showPageItems(true);
});