var isDataChanged = false;

var closeButtonId = 'buttonCloseUpsertUser';


/* ################################################################################ */
/* ADD BUTTONS */
/* ################################################################################ */
async function tryAddButtons() {
    await tryInsertCloseUpsertUserButton();
}

async function tryInsertCloseUpsertUserButton() {
    addButton(addButtonId, CloseUpsertUserLabel, 'mif-cancel', addUser);
}

/* ################################################################################ */
/* FORM METHODS */
/* ################################################################################ */
function setDataChanged() {
    isDataChanged = true;
}

function tryClose() {
    if (!isDataChanged) {
        loadPartialView(UrlUsersList);
        return;
    }

    askAndExecute(UsersManagementTitle, UserChangesDiscardQuestion, loadPartialView, [UrlUsersList]);
}

/* ################################################################################ */
/* PERMISSIONS */
/* ################################################################################ */
async function getRolePermissions(selected) {

    var model = {
        Id: selected[0]
    };

    setLoadingCircleIsVisible(true);
    let obj = await doAjaxPostAsync(UrlGetPermissionsForRole, model);
    if (obj) {
        /* clear previous results */
        $('#rolePermissionsList').empty();
        hide('noRolePermissionsFoundMessage');

        /* show current results */
        var itemsNum = obj.length;
        var html = `<ol class="decimal">`;
        for (i = 0; i < itemsNum; i++) {
            html += `<li>${obj[i].Description}</li>`;
            if (obj[i].Permissions && obj[i].Permissions.length > 0) {
                html += getOrderedList(obj[i].Permissions, 'Description', 'alpha-lower');
            }
        }
        html += `</ol>`;
        show('rolePermissionsListContainer');
        $('#rolePermissionsList').html(html);

        setLoadingCircleIsVisible(false);
    } else {
        hide('rolePermissionsListContainer');
        show('noRolePermissionsFoundMessage');
        setLoadingCircleIsVisible(false);
    }
}

var formAddUser = $('#formAddUser');

/* ################################################################################ */
/* VALIDATION + SUBMIT */
/* ################################################################################ */
formAddUser.data('validator', null);
$.validator.unobtrusive.parse(formAddUser);

async function submitUpsertUser() {
    setLoadingCircleIsVisible(true);

    var serializedform = $(formAddUser).serialize();
    let obj = await doSubmitFormWithAjaxAsync(UrlUpsertUser, serializedform, null);
    if (obj && obj.ControllerOperationStatus == CONTROLLER_OPERATION_OK) {
        setLoadingCircleIsVisible(false);
        loadPartialView(UrlUsersList);
    } else {
        setLoadingCircleIsVisible(false);
        showInfoBox(ERROR_LABEL, upsertErrorMessage, ALERT);
    }
}

/* select the 'user' option as default role */
$('#selectRole').ready(function (e) {
    var select = Metro.getPlugin($('#selectRole'), 'select');
    select.val([2]);
});

/* ################################################################################ */
/* DOCUMENT READY */
/* ################################################################################ */
$(document).ready(function () {
    $("#submitButton").click(function (e) {
        submitUpsertUser();
        e.preventDefault(); // prevent submitting 2 times
    });

    /* actions shorcuts */
    //tryAddButtons();

    if (isError) {
        showInfoBox(ERROR_LABEL, errorMessage, ALERT);
    }
});