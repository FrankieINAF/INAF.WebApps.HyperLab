var selectedSpectra = [];

var publicAndShareButtonId = 'buttonPublicAndShare';
var openMessagesCharmsButtonId = 'buttonOpenMessagesCharms';

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
    selectedSpectra.forEach(function (id) {
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

/* ---------- OPEN MESSAGES BUTTON ---------- */
function addOpenMessagesCharmsButton() {
    addButton(openMessagesCharmsButtonId, ButtonShowCharmsMessagesLabel, 'mif-chat', toggleCharmsMessages);
}

function removeMessagesCharmsButtonProcedure() {
    if (!isButtonAvailable(openMessagesCharmsButtonId))
        return;

    animateCSS(`${openMessagesCharmsButtonId}`, `bounceOutUp`, FAST, removeMessagesCharmsButton);
}

function removeMessagesCharmsButton() {
    $(`#${openMessagesCharmsButtonId}`).remove();
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

/* ################################################################################ */
/* CHARMS SHARE */
/* ################################################################################ */
function closeCharmsShare() {
    if (Metro.charms.isOpen('#charmsShare'))
        Metro.charms.close('#charmsShare');
}

function openCharmsShare() {
    if (!Metro.charms.isOpen('#charmsShare'))
        Metro.charms.open('#charmsShare');
}

function onCharmsShareOpen() {
    NumOfSharedSpectra = NumOfSharedSpectra.replace('r_v', selectedSpectra.length);
    $('#numOfSharedSpectraLabel').text(NumOfSharedSpectra);
}