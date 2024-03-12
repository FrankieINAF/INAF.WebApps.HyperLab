function createList(id, listText, useSearch = true, searchLabel, usePagination = true, itemsForPagination = null) {

    if (!itemsForPagination)
        itemsForPagination = 10;

    var text = '';
    text += `<ul id="${id}" data-role="list" class="items-list"`;
    if (usePagination) {
        text += `data-show-pagination="${usePagination}" data-items="${itemsForPagination}" data-show-list-info="true"`;
        text += 'data-pagination-wrapper=".customPagination"';
    }
    else
        text += `data-show-pagination="${usePagination}" data-show-list-info="true"`;
    if (useSearch) {
        text += 'data-search-wrapper=".customSearch"';
        text += `data-list-search-title="${searchLabel}"`;
    }
    text += `data-list-info-title="${DataListInfoTitle}"`;
    text += 'data-sort-class="mlabel"'
    text += `data-show-search="${useSearch}"`;
    text += 'data-show-activity="false">';

    text += listText;

    text += '</ul>';

    return text;
}