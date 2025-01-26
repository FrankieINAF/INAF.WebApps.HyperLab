function addButton(buttonId, buttonTooltip, icon, buttonAction) {
    var item = $('#buttonsAppBar').find(`#${buttonId}`);
    if (item[0])
        return;

    var button = $(`<button id="${buttonId}" class="button light cycle outline" title="${buttonTooltip}" style="float: left; margin:0px 8px 0px 8px"><span class="${icon}"></span></button>`);
    $('#buttonsAppBar').append($(button));
    animateCSS(`${buttonId}`, `bounceInDown`, FAST);

    $(`#${buttonId}`).on('click', function (e) {
        buttonAction();
        e.preventDefault();
        e.stopPropagation();
    });
}