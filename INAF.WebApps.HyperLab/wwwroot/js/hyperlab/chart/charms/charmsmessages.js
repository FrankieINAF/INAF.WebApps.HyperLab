var messages = []

function clearMessages() {
    $('#messagesContainer').empty();

    initMessages();
}

function createCharmsMessages() {

}

function addMessage(content, duration, type) {
    messages.push(content);

    showToast(content, duration, type);

    const html = buildMessageItem(content, type);
    $('#messagesContainer').append(html);
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