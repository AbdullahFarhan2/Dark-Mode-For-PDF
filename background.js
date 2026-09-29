chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;

    if (!isPDF(tab.url)) return;

    const result = await chrome.storage.local.get("mode");
    const mode = result.mode || "original";

    if (mode === "original") return;

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: applyPDFTheme,
        args: [mode]
    }).catch(() => {});
});

function isPDF(url) {
    if (!url) return false;

    return (
        url.toLowerCase().endsWith(".pdf") ||
        url.toLowerCase().includes(".pdf?")
    );
}

function applyPDFTheme(mode) {
    const oldStyle = document.getElementById("pdf-dark-reader-style");

    if (oldStyle) {
        oldStyle.remove();
    }

    if (mode === "original") return;

    const style = document.createElement("style");
    style.id = "pdf-dark-reader-style";

    if (mode === "dark") {
        style.textContent = `
            html {
                background: #2b2b2b !important;
                filter: invert(0.82) hue-rotate(180deg) !important;
            }
        `;
    }

    if (mode === "oled") {
        style.textContent = `
            html {
                background: #000 !important;
                filter: invert(1) !important;
            }
        `;
    }

    if (mode === "invert") {
        style.textContent = `
            html {
                filter: invert(1) !important;
            }
        `;
    }

    if (mode === "reading") {
        style.textContent = `
            html {
                background: #e8e3d5 !important;
                filter: invert(0.88) sepia(0.08) !important;
            }
        `;
    }

    if (mode === "system") {
        style.textContent = `
            @media (prefers-color-scheme: dark) {
                html {
                    background: #2b2b2b !important;
                    filter: invert(0.82) hue-rotate(180deg) !important;
                }
            }

            @media (prefers-color-scheme: light) {
                html {
                    filter: none !important;
                    background: white !important;
                }
            }
        `;
    }

    document.head.appendChild(style);
}