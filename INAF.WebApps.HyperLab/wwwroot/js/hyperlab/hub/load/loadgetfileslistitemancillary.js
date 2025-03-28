function getBinIconDiv(filename) {
    return `<div class="flex-self-center-fs margin-right-8 pointer"><span class="mif mif-bin pointer" title="${LoadFileRemoveSelectedFileMessage}" onclick="${removeFileFromList.name}('${filename}')"></span></div>`;
}

function getContainerDiv(filename) {
    return `<div id="item_${filename}" class="d-flex flex-column-fs flex-row-sm margin-vertical-8">`;
}

function getFilenameDiv(source, filename) {
    let filenameClass = (source == SPECTRUM_SOURCE_SLAB) ? 'primary' : 'secondary';
    return `<div class="flex-self-center-fs loaded-file-width"><p class="text-secondary-sm text-light text-ellipsis tally ${filenameClass}">${filename}</p></div>`;
}

function getLoadResultIcon(isLoaded) {
    let color = 'fg-green';
    let icon = 'mif-checkmark';
    let message = LoadFileReadFileSuccessMessage;
    if (!isLoaded) {
        color = 'fg-red';
        icon = 'mif-cancel';
        message = LoadFileReadFileErrorMessage;
    }
    return `<div class="flex-self-center-fs margin-right-8 margin-top-4"><span class="mif ${icon} ${color} mif-2x" title="${message}"></span></div>`;
}

function getSpectrumTypeDiv(filename, spectrumType, width) {
    return `<div class="flex-self-center-fs margin-horizontal-16" style="width: ${width}px">${getSpectrumTypeSelect(filename, spectrumType)}</div>`;
}