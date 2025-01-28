/* ################################################################################ */
/* VALIDATION + SUBMIT */
/* ################################################################################ */
formRegistration.data('validator', null);
$.validator.unobtrusive.parse(formRegistration);

$("#submitButton").click(function () {
    if (!$(formRegistration).valid()) {
        formRegistration.addClass("ani-ring");
        setTimeout(function () {
            formRegistration.removeClass("ani-ring");

            $('#submitButton').attr('disabled', false);
        }, 1000);

        var validator = $(formRegistration).validate();

        for (var i in validator.errorMap) {
            console.log(i, ":", validator.errorMap[i]);
        }

        return false;
    }

    setLoadingCircleIsVisible(true);
    $(formRegistration).submit();
});

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(document).ready(function () {
    Metro.makePlugin("#Name", "input");
    Metro.makePlugin("#LastName", "input");
    Metro.makePlugin("#Email", "input");
    Metro.makePlugin("#Password", "input");
    Metro.makePlugin("#ConfirmPassword", "input");

    $('.input').addClass('required');
});