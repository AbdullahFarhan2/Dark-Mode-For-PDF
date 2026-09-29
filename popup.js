const buttons = document.querySelectorAll("button");

buttons.forEach(button => {
    button.addEventListener("click", async () => {
        const mode = button.dataset.mode;

        await chrome.storage.local.set({ mode });

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.id) return;

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: applyPDFTheme,
            args: [mode]
        });
    });
});

chrome.storage.local.get("mode", result => {
    const mode = result.mode || "original";

    buttons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );
    });
});

function applyPDFTheme(mode) {
    const oldStyle = document.getElementById("pdf-dark-reader-style");

    if (oldStyle) {
        oldStyle.remove();
    }

    if (mode === "original") {
        return;
    }

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