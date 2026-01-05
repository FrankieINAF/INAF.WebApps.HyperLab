/* ################################################################################ */
/* VALIDATION + SUBMIT */
/* ################################################################################ */
formPasswordReset.data('validator', null);
$.validator.unobtrusive.parse(formPasswordReset);

$("#submitButton").on('click', function () {
    if (!$(formPasswordReset).valid()) {
        formPasswordReset.addClass("ani-ring");
        setTimeout(function () {
            formPasswordReset.removeClass("ani-ring");

            $('#submitButton').attr('disabled', false);
        }, 1000);

        var validator = $(formPasswordReset).validate();

        for (var i in validator.errorMap) {
            console.log(i, ":", validator.errorMap[i]);
        }

        return false;
    }

    setLoadingCircleIsVisible(true);
    $(formPasswordReset).trigger('submit');
});

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(function () {
    Metro.makePlugin("#Password", "input");
    Metro.makePlugin("#ConfirmPassword", "input");

    $('.input').addClass('required');
});