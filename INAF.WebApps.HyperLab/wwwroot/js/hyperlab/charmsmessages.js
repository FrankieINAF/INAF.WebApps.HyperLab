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

    if (displayMessage)
        showToast(content, duration, type);

    const html = buildMessageUIItem(message, type);
    $('#messagesContainer').prepend(html);

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
    let html = ``;
    html += `<div class="remark ${type}" style="padding:0.5rem">`;
    html += `   <div class="row cell-fs-12"><span class="text-small fg-black">${message.Time}</span><div>`;
    html += `   <div class="row cell-fs-12"><span class="text-secondary fg-black">${message.Content}</span></div>`;
    html += `</div>`;

    return html;
}

function initMessages() {
    messages = [];
}

function toggleCharmsMessages() {
    Metro.getPlugin('#charmsMessages', 'charms').toggle();
}