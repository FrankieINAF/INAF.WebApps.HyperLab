/* ################################################################################ */
/* ADD BUTTONS ON TOP-BAR */
/* ################################################################################ */
function addButton(buttonId, buttonTooltip, icon, buttonAction) {
    var item = $('#buttonsAppBar').find(`#${buttonId}`);
    if (item[0])
        return;

    var button = $(`<button id="${buttonId}" class="button light cycle outline pointer" title="${buttonTooltip}" style="float: left; margin:0px 8px 0px 8px"><span class="${icon}"></span></button>`);
    $('#buttonsAppBar').append($(button));
    animateCSS(`${buttonId}`, `bounceInDown`, FAST);

    $(`#${buttonId}`).on('click', function (e) {
        buttonAction();
        e.preventDefault();
        e.stopPropagation();
    });
}

function addImageButton(buttonId, buttonTooltip, imageName, buttonAction) {
    var item = $('#buttonsAppBar').find(`#${buttonId}`);
    if (item[0])
        return;

    var button = $(`<img id="${buttonId}" title="${buttonTooltip}" class="pointer" style="float: left; margin:0px 8px 0px 8px; width: 36px" src="/images/appbars/${imageName}.png"/>`);
    $('#buttonsAppBar').append($(button));
    animateCSS(`${buttonId}`, `bounceInDown`, FAST);

    $(`#${buttonId}`).on('click', function (e) {
        buttonAction();
        e.preventDefault();
        e.stopPropagation();
    });
}

/* ################################################################################ */
/* ADD BUTTON ON LEFT-SIDE MENU */
/* ################################################################################ */
function addMenuItem(id, label, tooltip, mifIcon, action = null, url = null) {
    var item = $('#menuList').find(`#${id}`);
    if (item[0])
        return;

    let html = buildMenuItem(id, label, tooltip, mifIcon, action, url);
    $('#menuList').append($(html));
    animateCSS(`${id}`, `bounceInRight`, FAST);
}

function buildMenuItem(id, label, tooltip, mifIcon, action = null, url = null) {
    let urlOrAction = '';
    if (action != null)
        urlOrAction = `href="javascript:${action.name}()"`;
    else if (url != null)
        urlOrAction = `href="${url}"`;
    let html = `<a id=${id} class="menu-item d-flex" title="${tooltip}" ${urlOrAction}>`;
    html += `<span class="icon"><span class="mif ${mifIcon} fg-white margin-top-8"></span></span>`;
    html += `<span class="caption fg-white margin-top-4">${label}</span>`;
    html += `</a>`;
    return html;
}