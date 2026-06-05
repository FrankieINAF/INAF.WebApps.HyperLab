var messages = []

function clearMessages() {
    /* clear all messages from UI */
    $('#messagesContainer').empty();

    /* init array for messages */
    initMessages();

    /* close charms since it is empty */
    toggleCharmsMessages();

    /* remove button for showing messages since no one is available */
    removeMessagesCharmsButtonProcedure();
}

function addMessage(content, duration, type, displayMessage = true) {
    var message = buildMessageItem(content);
    messages.push(message);

    const item = buildMessageUIItem(message, type);

    if (displayMessage)
        showCharmsMessagesNotifications(item, duration);

    $('#messagesContainer').prepend(item.Html);

    if (messages.length == 1)
        addOpenMessagesCharmsButton();
}

function buildMessageItem(content) {
    return {
        Content: content,
        Time: luxon.DateTime.now().toLocaleString(luxon.DateTime.TIME_WITH_SECONDS)
    };
}

function buildMessageUIItem(message, type) {
    const guid = generateShortGUID();

    let html = ``;
    html += `<div id="${guid}" class="remark ${type}" style="padding:0.5rem">`;
    html += `   <div class="row cell-fs-12"><span class="text-small fg-black">${message.Time}</span><div>`;
    html += `   <div class="row cell-fs-12"><span class="text-secondary fg-black">${message.Content}</span></div>`;
    html += `</div>`;

    return {
        Html: html,
        Guid: guid
    }
}

function initMessages() {
    messages = [];
}

function showCharmsMessagesNotifications(item, duration) {

    setTimeout(function () {
        //console.log(`Removing message ${item.Guid} after ${duration} ms`);
        $(`#messagesNotifications #${item.Guid}`).remove();
        //animateCSS(`${item.Guid}`, 'fadeOut', function () { $(`#messagesNotifications #${item.Guid}`).remove(); });
        /* if no messages are still present, then animate messages button */
        if ($('#messagesNotifications').children().length == 0) {
            /* close charms */
            if (isExistant('charmMessagesNotifications') && Metro.charms.isOpen('#charmMessagesNotifications'))
                Metro.charms.close('#charmMessagesNotifications');
            /* animate button */
            $('#buttonOpenMessagesCharms').addClass('ani-shuttle');
            setTimeout(function () { $('#buttonOpenMessagesCharms').removeClass('ani-shuttle'); }, 5000);
        }
    }, duration);
    /* add all messages to the charms */
    $('#messagesNotifications').prepend(item.Html);


    if (isExistant('charmMessagesNotifications') && !Metro.charms.isOpen('#charmMessagesNotifications'))
        Metro.charms.open('#charmMessagesNotifications');
}

function toggleCharmsMessages() {
    Metro.charms.toggle('#charmsMessages');
}