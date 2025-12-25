document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const toggle = document.getElementById('island-mode-toggle');
    const hubCard = document.getElementById('hub-tool');
    const studioCards = document.querySelectorAll('.studio-card');
    const allTools = document.querySelectorAll('.tool-card');

    // --- State Management ---
    const updateIslandMode = (enabled) => {
        if (enabled) {
            hubCard.classList.remove('hidden');
            hubCard.style.display = 'flex'; // Ensure flex
            studioCards.forEach(c => {
                c.classList.add('hidden');
                c.style.display = 'none';
            });
        } else {
            hubCard.classList.add('hidden');
            hubCard.style.display = 'none';
            studioCards.forEach(c => {
                c.classList.remove('hidden');
                c.style.display = 'flex';
            });
        }
        // Save state
        chrome.storage.local.set({ islandMode: enabled });
    };

    // --- Init ---
    chrome.storage.local.get(['islandMode', 'activeTools'], (result) => {
        const isIsland = result.islandMode !== undefined ? result.islandMode : true; // Default true
        toggle.checked = isIsland;
        updateIslandMode(isIsland);

        // Active State
        const activeTools = result.activeTools || {};
        allTools.forEach(tool => {
            const name = tool.dataset.tool;
            if (activeTools[name]) tool.classList.add('active');
        });
    });

    // --- Event Listeners ---
    toggle.addEventListener('change', (e) => {
        updateIslandMode(e.target.checked);
    });

    allTools.forEach(tool => {
        tool.addEventListener('click', () => {
            const toolName = tool.dataset.tool;
            
            // Map tool names to actions
            // Simple tools (ruler, etc) -> toggle status
            // Studios (Standalones) -> open standalone window
            // Hub -> open Hub
            
            // Visual toggle (for simple tools mainly)
            // For complex tools (studios), we don't necessarily keep them "active" in the popup 
            // the same way unless we want to track if window is open.
            // Let's just toggle for now.
            
            tool.classList.toggle('active');
            const isActive = tool.classList.contains('active');

            // Save state
            chrome.storage.local.get(['activeTools'], (result) => {
                const activeTools = result.activeTools || {};
                activeTools[toolName] = isActive;
                chrome.storage.local.set({ activeTools });
            });

            // Dispatch Action
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]?.id) {
                    if (toolName === 'hub') {
                        // Hub (Island Mode)
                        chrome.tabs.sendMessage(tabs[0].id, { action: isActive ? 'openHub' : 'removeHub' })
                           .catch(() => injectAndRun(tabs[0].id, 'openHub'));
                    } else if (toolName === 'design-studio') {
                        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleDesignStudio' })
                           .catch(() => injectAndRun(tabs[0].id, 'toggleDesignStudio'));
                    } else if (toolName === 'deep-inspector') {
                        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleDeepInspector' });
                    } else if (toolName === 'network-studio') {
                        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleNetworkStudio' });
                    } else if (toolName === 'privacy-studio') {
                         chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePrivacyStudio' });
                    } else {
                        // Simple tools
                         chrome.tabs.sendMessage(tabs[0].id, { 
                            action: 'toggleTool', 
                            tool: toolName, 
                            isActive: isActive 
                        });
                    }
                }
            });
        });
    });

    // Helper: If message fails, script might not be loaded (but manifest should load them).
    // If we rely on manifest 'document_end', they should be there.
    // However, if we want to be safe or if we removed them from manifest to lazily load:
    const injectAndRun = (tabId, action) => {
        // Not implemented fully since we use manifest injection.
        // But if we wanted to:
        // chrome.scripting.executeScript({ ... })
    };
});
