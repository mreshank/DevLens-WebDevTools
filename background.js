chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleTool') {
        const { tool, isActive } = request;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            const tabId = tabs[0].id;

            if (tool === 'dimensions') {
                if (isActive) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content_dimensions.js']
                    });
                } else {
                    chrome.tabs.sendMessage(tabId, { action: 'removeDimensions' });
                }
            } else if (tool === 'outliner') {
                 if (isActive) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content_outliner.js']
                    });
                } else {
                    chrome.tabs.sendMessage(tabId, { action: 'removeOutliner' });
                }
            } else if (tool === 'color-picker') {
                if (isActive) {
                    // Start EyeDropper
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content_color_picker.js']
                    });
                } else {
                    chrome.tabs.sendMessage(tabId, { action: 'removeColorPicker' });
                }
            } else if (tool === 'ruler') {
                if (isActive) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content_ruler.js']
                    });
                } else {
                    chrome.tabs.sendMessage(tabId, { action: 'removeRuler' });
                }
            } else if (tool === 'hub') {
                if (isActive) {
                    // Inject Libraries first, then Hub
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content_pixel.js', 'content_inspector.js', 'content_hub.js']
                    });
                } else {
                    chrome.tabs.sendMessage(tabId, { action: 'removeHub' });
                }
            }
        });
    }
});
