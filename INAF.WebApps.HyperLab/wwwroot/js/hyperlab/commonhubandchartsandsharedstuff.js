var selectedSpectra = [];


var showChartsButtonId = 'buttonShowCharts';

function isButtonAvailable(buttonId) {
    var item = $('#buttonsAppBar').find(`#${buttonId}`);
    if (item[0])
        return true;
    else
        return false
}

function navigateToChart() {
    // Remove any previous hidden inputs added by this function
    $('#formNavigateToChart input[type="hidden"][name="SelectedSpectra[]"]').remove();

    // For each value in selectedSpectra, add a hidden input to the form with id 'formNavigateToChart'
    selectedSpectra.forEach(function(id) {
        var input = $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'SelectedSpectra[]')
            .val(id);
        $('#formNavigateToChart').append(input);
    });

    // Optionally, you can submit the form here if needed:
    $('#formNavigateToChart').submit();

    //var ids = selectedSpectra.join(',');
    //var url = `${UrlChart}?Ids=${ids}`;
    //navigateTo(url);
}

/* ---------- CHARTS BUTTON ---------- */
function addCreateChartsButtonProcedure() {
    if (selectedSpectra.length >= 1)
        addCreateChartsButton();
}

function addCreateChartsButton() {
    if (isButtonAvailable(showChartsButtonId))
        return;

    addButton(showChartsButtonId, ButtonGraphSelectedSpectraLabel, 'mif-chart-line', navigateToChart);
}

function removeCreateChartsButtonProcedure() {
    if (!isButtonAvailable(showChartsButtonId))
        return;

    /* show the 'create chart' button */
    animateCSS(`${showChartsButtonId}`, `bounceOutUp`, FAST, removeCreateChartsButton);
}

function removeCreateChartsButton() {
    $(`#${showChartsButtonId}`).remove();
}
