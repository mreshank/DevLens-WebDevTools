document.addEventListener('DOMContentLoaded', () => {
    const tools = document.querySelectorAll('.tool-card');

    // Load active state from storage
    chrome.storage.local.get(['activeTools'], (result) => {
        const activeTools = result.activeTools || {};
        tools.forEach(tool => {
            const toolName = tool.dataset.tool;
            if (activeTools[toolName]) {
                tool.classList.add('active');
            }
        });
    });

    tools.forEach(tool => {
        tool.addEventListener('click', () => {
            const toolName = tool.dataset.tool;
            
            // Toggle visual state
            tool.classList.toggle('active');
            const isActive = tool.classList.contains('active');

            // Save state
            chrome.storage.local.get(['activeTools'], (result) => {
                const activeTools = result.activeTools || {};
                activeTools[toolName] = isActive;
                chrome.storage.local.set({ activeTools });
            });

            // Send message to active tab
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: toggleFeature,
                        args: [toolName, isActive]
                    });
                }
            });
            
            // Also notify background script if needed (for more complex logic)
            chrome.runtime.sendMessage({
                action: 'toggleTool',
                tool: toolName,
                isActive: isActive
            });
        });
    });
});

// This function will be injected, but for complex features we should use files.
// We are essentially just using this to trigger the 'real' connection or just simple toggles.
// Actually, for better architecture, we should inject the specific content scripts active in the manifest or dynamically.
// Let's rely on the background script to handle the heavy lifting of injection based on the message.
function toggleFeature(toolName, isActive) {
    console.log(`Toggling ${toolName}: ${isActive}`);
    // This is just a placeholder; the real logic happens via background script injection
}
