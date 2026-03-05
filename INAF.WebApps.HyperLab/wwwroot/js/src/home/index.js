window.mediaQueryHelper = {
    addOrRemoveClass: function (elementId, className, mediaQuery) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const mql = window.matchMedia(mediaQuery);

        function handleMediaQueryChange(e) {
            if (e.matches) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }

        mql.addEventListener('change', handleMediaQueryChange);

        // Initial check
        handleMediaQueryChange(mql);
    }
};

function navigateTo(url) {
    window.location.href = url;
}
