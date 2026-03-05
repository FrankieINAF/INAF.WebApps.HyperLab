function setLogoIsVisible(isVisible) {
    let img = $('#leftMenu').find('img')[0];

    if (!isVisible)
        $(img).addClass('d-none');
    else
        $(img).removeClass('d-none');
}


function setLogoHidden() {
    setLogoIsVisible(false);
}

function setLogoVisible() {
    setLogoIsVisible(true);
}

function setMenuCollapsed() {
    $('#mainContainer').addClass('compacted js-compact');
    setLogoHidden();
}

function setMenuExpanded() {
    $('#mainContainer').removeClass('compacted js-compact');
    setLogoVisible();
}