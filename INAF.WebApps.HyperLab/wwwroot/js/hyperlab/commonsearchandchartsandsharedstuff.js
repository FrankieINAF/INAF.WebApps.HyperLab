var showChartsButtonId = 'buttonShowCharts';

function isButtonAvailable(buttonId) {
    var item = $('#buttonsAppBar').find(`#${buttonId}`);
    if (item[0])
        return true;
    else
        return false
}