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
$(function(){
    var hash = location.hash;
    var target = hash.length > 0 ? hash.substr(1) : "dashboard";
    var link = $(".navview-menu a[href*="+target+"]");
    var menu = link.closest("ul[data-role=dropdown]");
    var node = link.parent("li").addClass("active");

    //function getContent(target){
    //    window.on_page_functions = [];
    //    $.get(target + ".html").then(
    //        function(response){
    //            $("#content-wrapper").html(response);

    //            window.on_page_functions.forEach(function(func){
    //                Metro.utils.exec(func, []);
    //            });
    //        }
    //    );
    //}

    //getContent(target);

    if (menu.length > 0) {
        Metro.getPlugin(menu, "dropdown").open();
    }

    $(".navview-menu").on(Metro.events.click, "a", function(e){
        var href = $(this).attr("href");
        var pane = $(this).closest(".navview-pane");
        var hash;

        if (Metro.utils.isValue(href) && href.indexOf(".html") > -1) {
            document.location.href = href;
            return false;
        }

        if (href === "#") {
            return false;
        }

        hash = href.substr(1);
        href = hash + ".html";

        getContent(hash);

        if (pane.hasClass("open")) {
            pane.removeClass("open");
        }

        pane.find("li").removeClass("active");
        $(this).closest("li").addClass("active");

        window.history.pushState(href, href, "index.html#"+hash);

        return false;
    });
});
