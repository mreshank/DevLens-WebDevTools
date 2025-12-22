(() => {
    // Unique IDs
    const STYLE_ID = 'webdevtools-outliner-style';
    const OVERLAY_ID = 'webdevtools-outliner-overlay';

    // Prevent duplicate injection
    if (document.getElementById(OVERLAY_ID)) return;

    // Default Configuration
    let config = {
        color: '#ff4757',
        width: 1,
        style: 'solid'
    };

    // --- Inject Style ---
    let styleTag = document.getElementById(STYLE_ID);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = STYLE_ID;
        document.head.appendChild(styleTag);
    }

    function updateStyle() {
        // Exclude our overlay and its children from the outline
        const exclude = `:not(#${OVERLAY_ID}):not(#${OVERLAY_ID} *)`;
        styleTag.textContent = `
            *${exclude} {
                outline: ${config.width}px ${config.style} ${config.color} !important;
                background: ${config.color}0D !important; /* 5% opacity tint */
            }
            *${exclude}:hover {
                outline-width: ${parseInt(config.width) + 1}px !important;
                background: ${config.color}1A !important; /* 10% opacity tint */
                cursor: crosshair;
            }
        `;
    }

    updateStyle();

    // --- Create Overlay UI ---
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    
    // Inline Styles for isolation
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        padding: '0',
        background: '#0f0f13',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)',
        webkitBackdropFilter: 'blur(16px)',
        zIndex: '2147483647',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        animation: 'wdSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
    });

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes wdSlideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        #${OVERLAY_ID} .wd-header { padding: 12px 16px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; cursor: move; }
        #${OVERLAY_ID} .wd-title { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        #${OVERLAY_ID} .wd-close { cursor: pointer; opacity: 0.6; font-size: 18px; line-height: 1; transition: opacity 0.2s; }
        #${OVERLAY_ID} .wd-close:hover { opacity: 1; }
        #${OVERLAY_ID} .wd-icon { font-size: 16px; }
        #${OVERLAY_ID} .wd-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        
        #${OVERLAY_ID} .wd-control { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #a0a0ba; }
        #${OVERLAY_ID} input[type="color"] { width: 40px; height: 28px; border: none; padding: 0; background: none; cursor: pointer; border-radius: 4px; }
        #${OVERLAY_ID} input[type="range"] { width: 100px; accent-color: #6c5ce7; }
        #${OVERLAY_ID} select { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; outline: none; }
        
        #${OVERLAY_ID} .wd-footer { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 8px; }
        #${OVERLAY_ID} .wd-btn { flex: 1; padding: 8px; border-radius: 6px; border: none; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        #${OVERLAY_ID} .wd-btn-hide { background: rgba(255,255,255,0.1); color: #fff; }
        #${OVERLAY_ID} .wd-btn-hide:hover { background: rgba(255,255,255,0.15); }
    `;
    overlay.appendChild(styleSheet);

    overlay.innerHTML += `
        <div class="wd-header" id="wd-drag-handle">
            <div class="wd-title"><span class="wd-icon">🔳</span> Outliner Settings</div>
            <div class="wd-close" id="wd-outliner-close">×</div>
        </div>
        <div class="wd-body">
            <div class="wd-control">
                <span>Color</span>
                <input type="color" id="wd-outliner-color" value="${config.color}">
            </div>
            <div class="wd-control">
                <span>Width (${config.width}px)</span>
                <input type="range" id="wd-outliner-width" min="1" max="10" value="${config.width}">
            </div>
            <div class="wd-control">
                <span>Style</span>
                <select id="wd-outliner-style">
                    <option value="solid" selected>Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                </select>
            </div>
        </div>
        <div class="wd-footer">
            <button class="wd-btn wd-btn-hide" id="wd-btn-hide">Hide Panel (Keep Outlines)</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // --- Event Listeners ---
    const els = {
        color: overlay.querySelector('#wd-outliner-color'),
        width: overlay.querySelector('#wd-outliner-width'),
        style: overlay.querySelector('#wd-outliner-style'),
        hideBtn: overlay.querySelector('#wd-btn-hide'),
        closeBtn: overlay.querySelector('#wd-outliner-close'),
        handle: overlay.querySelector('#wd-drag-handle')
    };

    els.color.oninput = (e) => { config.color = e.target.value; updateStyle(); };
    els.width.oninput = (e) => { 
        config.width = e.target.value; 
        e.target.previousElementSibling.textContent = `Width (${config.width}px)`;
        updateStyle(); 
    };
    els.style.onchange = (e) => { config.style = e.target.value; updateStyle(); };
    
    // Close (Exit) Mechanism
    els.closeBtn.onclick = () => {
        styleTag.remove();
        overlay.remove();
    };
    
    // Hide Panel Mechanism
    els.hideBtn.onclick = () => {
        // We remove the overlay but keep the styleTag
        // Just animating it out looks nicer
        overlay.style.transition = 'all 0.3s ease';
        overlay.style.opacity = '0';
        overlay.style.transform = 'translate(-50%, -10px) scale(0.95)';
        setTimeout(() => overlay.remove(), 300);
        
        // Show a small toast to explain how to bring it back? Or rely on Popup toggle.
        // User said "removes this overlay but still works and can be normally desabled in the extention menu"
        // So relying on popup to fully disable is fine.
        // If they want settings back, they might have to toggle off/on again.
    };

    // --- Drag Logic ---
    let isDragging = false, startX, startY, initialLeft, initialTop;
    els.handle.onmousedown = (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = overlay.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        overlay.style.transform = 'none'; // Clear center transform for manual positioning
        overlay.style.left = `${initialLeft}px`; 
        overlay.style.top = `${initialTop}px`;
        overlay.style.margin = '0'; // Clear centering margin if any
        
        document.body.style.userSelect = 'none';
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        overlay.style.left = `${initialLeft + dx}px`;
        overlay.style.top = `${initialTop + dy}px`;
    };

    document.onmouseup = () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
        }
    };

    // --- Cleanup Listener ---
    chrome.runtime.onMessage.addListener(function listener(message) {
        if (message.action === 'removeOutliner') {
            styleTag.remove();
            if (document.getElementById(OVERLAY_ID)) {
                document.getElementById(OVERLAY_ID).remove();
            }
            chrome.runtime.onMessage.removeListener(listener);
        }
    });

})();
