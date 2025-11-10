var formLogin = $('#formLogin');
var confirmation = '@confirmation';

/* ################################################################################ */
/* VALIDATION + SUBMIT */
/* ################################################################################ */
formLogin.data('validator', null);
$.validator.unobtrusive.parse(formLogin);

$("#submitButton").click(function () {
    if (!$(formLogin).valid()) {
        formLogin.addClass("ani-ring");
        setTimeout(function () {
            formLogin.removeClass("ani-ring");

            $('#submitButton').attr('disabled', false);
        }, 1000);

        var validator = $(formLogin).validate();

        for (var i in validator.errorMap) {
            console.log(i, ":", validator.errorMap[i]);
        }

        return false;
    }

    setLoadingCircleIsVisible(true);
    $(formLogin).submit();
});


function setConfirmationCompletedMessageVisibility(isVisible) {
    if (isVisible)
        $('#confirmationCompletedMessage').removeClass('display-none-important');
    else
        $('#confirmationCompletedMessage').addClass('display-none-important');
}

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    Metro.makePlugin("#UserName", "input");
    Metro.makePlugin("#Password", "input");

    $('.input').addClass('required');

    if (confirmation === 1) {
        setConfirmationCompletedMessageVisibility(true);
    }
});