/* ################################################################################ */
/* SET SPECTRA AS PUBLIC */
/* ################################################################################ */
function setAsPublicProcedure() {
    showDialogWithAction(WARNING_LABEL, SetAsPublicQuestion, WARNING, YES_LABEL, setAsPublicAsync);
}

async function setAsPublicAsync() {
    let isOk = true;

    setLoadingCircleIsVisible(true);

    let model = {
        SpectraIds: selectedSpectra
    };

    try {
        let obj = await doAjaxPostAsync(UrlSetSpectraAsPublic, model);
        if (obj.IsOk) {
            setLoadingCircleIsVisible(false);
            showSimpleDialog(INFO_LABEL, SetAsPublicSuccessMessage, SUCCESS);
        } else
            isOk = false;
    } catch (e) {
        isOk = false;
    }

    if (!isOk) {
        setLoadingCircleIsVisible(false);
        showSimpleDialog(ERROR_LABEL, SetAsPublicErrorMessage, ALERT);
    }
}

/* ---------- PUBLIC AND SHARE BUTTONS ---------- */
function addPublicAndShareButtons() {
    var item = $('#buttonsAppBar').find(`#${publicAndShareButtonId}`);
    if (item[0])
        return;

    let html = `<div id="${publicAndShareButtonId}" class="multi-action" style="height: 36px">`;
    html += `<button class="action-button rotate-minus bg-transparent second fg-white" title="${ButtonPublicAndShareLabel}" onclick="$(this).toggleClass('active')" >`;
    html += `<span class="icon"><span class="mif-external"></span></span>`;
    html += `</button >`;
    html += `<ul class="actions drop-bottom">`;
    html += `<li class="bg-cyan" title="${ButtonShareLabel}" onclick="${openCharmsShare.name}()"><a href="#"><span class="mif-share pointer"></a></li>`;
    html += `<li class="bg-cyan" title="${ButtonSetPublicLabel}" onclick="${setAsPublicProcedure.name}()"><a href="#"><span class="mif-vpn-publ pointer"></a></span></li>`;
    html += `</ul>`;
    html += `</div >`;

    $('#buttonsAppBar').append($(html));
    animateCSS(`${publicAndShareButtonId}`, `bounceInDown`, FAST);
}

function removePublicAndShareButtonsProcedure() {
    if (!isButtonAvailable(publicAndShareButtonId))
        return;

    animateCSS(`${publicAndShareButtonId}`, `bounceOutUp`, FAST, removePublicAndShareButtons);
}

function removePublicAndShareButtons() {
    $(`#${publicAndShareButtonId}`).remove();
}