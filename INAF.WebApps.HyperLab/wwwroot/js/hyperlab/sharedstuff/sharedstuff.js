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
        setLoadingCircleIsVisible(false);
    } catch (e) {
        isOk = false;
        setLoadingCircleIsVisible(false);
    }

    if (isOk)
        showSimpleDialog(INFO_LABEL, RemoveShareSuccessMessage, SUCCESS);
    else {
        /* when an error in creation of shares or in invitations happned, show the specific message */
        if (showSharesErrors(removeSharesResults) > 0)
            return;
        /* when an error on the back-end happened, show the generic message */
        showSimpleDialog(ERROR_LABEL, RemoveSharesErrorMessage, ALERT);
    }
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    $(`[id^='${checkboxSharedSpectraWithMeBaseId}']`).on('click', function (evt) {
        if (isCheckboxChecked(evt.target.id)) {
            selectedSpectra.push(evt.target.id.replace(checkboxSharedSpectraWithMeBaseId, ''));
            //console.log(`Sharing spectra with me: ${evt.target.id}`);

            if (selectedSpectra.length == 1)
                addCreateChartsButton();
        } else {
            selectedSpectra = selectedSpectra.filter(e => e !== evt.target.id.replace(checkboxSharedSpectraWithMeBaseId, ''));
            //console.log(`Unsharing spectra with me: ${evt.target.id}`);

            if (selectedSpectra.length == 0)
                removeCreateChartsButtonProcedure();
        }
    });

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
                if (selectedShareItems.length == 1) {
                    addCreateChartsButton();
                    addRemoveSharesButton();
                }
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

    showPageItems();
});