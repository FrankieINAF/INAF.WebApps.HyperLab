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

function addMessage(content, duration, type) {
    messages.push(content);

    showToast(content, duration, type);

    const html = buildMessageItem(content, type);
    $('#messagesContainer').append(html);

    if (messages.length == 1)
        addOpenMessagesCharmsButton();
}

function buildMessageItem(content, type) {
    let html = ``;
    html += `<div class="remark ${type}">`;
    html += `   <span class="text-secondary fg-black">${content}</span>`;
    html += `</div>`;

    return html;
}

function initMessages() {
    messages = [];
}

function toggleCharmsMessages() {
    Metro.getPlugin('#charmsMessages', 'charms').toggle();
}