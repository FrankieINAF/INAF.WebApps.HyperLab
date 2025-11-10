function clearSearchbox(inputElemId, listId, isTable = false) {
    $(`#${inputElemId}`).val('');
    doSearch(inputElemId, listId, isTable);
}

function doSearch(inputElemId, listId, isTable = false) {
    // Declare variables
    var defaultDisplayType = 'flex';
    if (isTable) {
        defaultDisplayType = 'table-row';
    }
    var input, filter, ul, li, i;
    input = document.getElementById(inputElemId);

    filter = input.value.toUpperCase();
    ul = document.getElementById(listId);
    li = ul.getElementsByTagName('li');

    if (input.value.length > 0) {
        for (i = 0; i < li.length; i++) {
            text = li[i].getAttribute("data-caption");  //nome 
            if (text) {
                if (text.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = defaultDisplayType;
                } else {
                    li[i].style.display = "none";
                }
            } else {
                li[i].style.display = "none";
            }

            if (!isNaN(filter)) { // lv 17/03/20
                text = li[i].id;  //ID = "companyXXX"
                var companyId = text.substring(7, text.length); //companyId
                if (companyId) {
                    if (companyId.toUpperCase().indexOf(filter) > -1) {
                        li[i].style.display = defaultDisplayType;
                    } else {
                        li[i].style.display = "none";
                    }
                } else {
                    li[i].style.display = "none";
                }
            }

        }
    } else {
        for (i = 0; i < li.length; i++) {
            li[i].style.display = defaultDisplayType;
        }
    }

}