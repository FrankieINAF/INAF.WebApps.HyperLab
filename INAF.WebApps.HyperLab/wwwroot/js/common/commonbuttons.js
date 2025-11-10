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