(() => {
    const ID_RULER_H = 'wd-ruler-h';
    const ID_RULER_V = 'wd-ruler-v';
    const ID_OVERLAY = 'wd-ruler-overlay';
    const ID_CROSSHAIR_X = 'wd-crosshair-x';
    const ID_CROSSHAIR_Y = 'wd-crosshair-y';
    const ID_GUIDE_CONTAINER = 'wd-guide-container';
    const ID_TOAST = 'wd-ruler-toast';

    if (document.getElementById(ID_OVERLAY)) return; // Prevent duplicate

    // Default configuration
    let config = {
        opacity: 1,
        color: '#0f0f13' // Default dark theme
    };

    // --- Styles ---
    const style = document.createElement('style');
    style.id = 'wd-ruler-style';
    style.textContent = `
        .wd-ruler { position: fixed; background: var(--wd-ruler-bg, #0f0f13); z-index: 2147483645; overflow: hidden; user-select: none; opacity: var(--wd-ruler-opacity, 1); transition: background 0.2s, opacity 0.2s; }
        #${ID_RULER_H} { top: 0; left: 0; width: 100%; height: 30px; border-bottom: 1px solid rgba(255,255,255,0.2); cursor: ns-resize; }
        #${ID_RULER_V} { top: 0; left: 0; width: 30px; height: 100%; border-right: 1px solid rgba(255,255,255,0.2); cursor: ew-resize; }
        
        /* Ticks via gradients */
        #${ID_RULER_H}::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: 
                repeating-linear-gradient(90deg, transparent 0, transparent 49px, rgba(255,255,255,0.3) 49px, rgba(255,255,255,0.3) 50px),
                repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(255,255,255,0.1) 9px, rgba(255,255,255,0.1) 10px);
        }
        #${ID_RULER_V}::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: 
                repeating-linear-gradient(0deg, transparent 0, transparent 49px, rgba(255,255,255,0.3) 49px, rgba(255,255,255,0.3) 50px),
                repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(255,255,255,0.1) 9px, rgba(255,255,255,0.1) 10px);
        }

        /* Guides */
        .wd-guide { position: fixed; background: #00b894; z-index: 2147483646; pointer-events: auto; }
        .wd-guide:hover { background: #55efc4; cursor: grab; }
        .wd-guide-h { height: 1px; width: 100%; left: 0; cursor: ns-resize; }
        .wd-guide-v { width: 1px; height: 100%; top: 0; cursor: ew-resize; }

        /* Crosshair */
        .wd-crosshair { position: fixed; background: rgba(255, 71, 87, 0.8); pointer-events: none; z-index: 2147483644; display: none; }
        #${ID_CROSSHAIR_X} { height: 1px; width: 100%; left: 0; border-top: 1px dashed rgba(255, 71, 87, 0.8); background: transparent; }
        #${ID_CROSSHAIR_Y} { width: 1px; height: 100%; top: 0; border-left: 1px dashed rgba(255, 71, 87, 0.8); background: transparent; }

        /* Numbers on Ruler (Simple Markers) */
        .wd-ruler-num { position: absolute; font-size: 9px; color: rgba(255,255,255,0.5); font-family: monospace; }
        
        /* Overlay UI */
        #${ID_OVERLAY} {
            position: fixed; bottom: 20px; right: 20px; width: 240px;
            background: #0f0f13; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.5); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            z-index: 2147483647; font-family: 'Inter', sans-serif; color: #fff;
            display: flex; flex-direction: column; overflow: hidden;
            animation: wdFadeUp 0.3s ease;
        }
        @keyframes wdFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .wd-head { padding: 12px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; cursor: move; }
        .wd-lbl { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .wd-close { cursor: pointer; opacity: 0.6; } .wd-close:hover { opacity: 1; }
        
        .wd-content { padding: 12px; font-size: 12px; display: flex; flex-direction: column; gap: 8px; }
        .wd-row { display: flex; justify-content: space-between; align-items: center; color: #a0a0ba; }
        .wd-val { font-family: monospace; color: #6c5ce7; font-size: 13px; }
        
        .wd-btn { width: 100%; padding: 8px; margin-top: 4px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: #fff; cursor: pointer; font-size: 11px; font-weight: 600; }
        .wd-btn:hover { background: rgba(255,255,255,0.15); }
        .wd-btn.active { background: #6c5ce7; }

        .wd-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }

        /* Sliders */
        input[type="range"] { width: 100px; accent-color: #6c5ce7; height: 4px; }
        input[type="color"] { width: 24px; height: 24px; border: none; padding: 0; background: none; cursor: pointer; border-radius: 4px; }

        /* Toast */
        #${ID_TOAST} {
            position: fixed; top: 40px; left: 50%; transform: translateX(-50%);
            background: rgba(15, 15, 19, 0.9); border: 1px solid #6c5ce7; border-radius: 30px;
            padding: 8px 24px; color: #fff; font-size: 13px; font-family: 'Inter', sans-serif;
            z-index: 2147483647; pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: wdToastFade 4s forwards;
        }
        @keyframes wdToastFade { 
            0% { opacity: 0; transform: translate(-50%, -10px); }
            10% { opacity: 1; transform: translate(-50%, 0); }
            80% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -10px); }
        }
    `;
    document.head.appendChild(style);

    // --- Elements ---
    const rulerH = document.createElement('div'); rulerH.id = ID_RULER_H; rulerH.className = 'wd-ruler';
    const rulerV = document.createElement('div'); rulerV.id = ID_RULER_V; rulerV.className = 'wd-ruler';
    
    // Add numbers to rulers (Every 100px)
    function createTicks() {
        rulerH.innerHTML = ''; rulerV.innerHTML = '';
        for (let i = 0; i < window.innerWidth; i += 100) {
            const num = document.createElement('span');
            num.className = 'wd-ruler-num';
            num.style.left = (i + 5) + 'px'; num.style.top = '2px';
            num.textContent = i;
            rulerH.appendChild(num);
        }
        for (let i = 0; i < window.innerHeight; i += 100) {
            if (i===0) continue; // skip 0 overlap
            const num = document.createElement('span');
            num.className = 'wd-ruler-num';
            num.style.top = (i + 5) + 'px'; num.style.left = '2px';
            num.style.writingMode = 'vertical-rl';
            num.textContent = i;
            rulerV.appendChild(num);
        }
    }
    createTicks();
    window.addEventListener('resize', createTicks);

    const guideContainer = document.createElement('div'); guideContainer.id = ID_GUIDE_CONTAINER;

    const crossX = document.createElement('div'); crossX.id = ID_CROSSHAIR_X; crossX.className = 'wd-crosshair';
    const crossY = document.createElement('div'); crossY.id = ID_CROSSHAIR_Y; crossY.className = 'wd-crosshair';

    const overlay = document.createElement('div'); overlay.id = ID_OVERLAY;
    overlay.innerHTML = `
        <div class="wd-head" id="wd-ruler-drag">
            <div class="wd-lbl">📏 Ruler</div>
            <div class="wd-close" id="wd-ruler-close">×</div>
        </div>
        <div class="wd-content">
            <div class="wd-row"><span>X:</span> <span class="wd-val" id="wd-cur-x">0</span>px</div>
            <div class="wd-row"><span>Y:</span> <span class="wd-val" id="wd-cur-y">0</span>px</div>
            
            <div class="wd-divider"></div>
            
            <div class="wd-row">
                <span>Opacity</span>
                <input type="range" id="wd-opt-opacity" min="0.1" max="1" step="0.1" value="1">
            </div>
            <div class="wd-row">
                <span>Theme</span>
                <input type="color" id="wd-opt-color" value="#0f0f13">
            </div>

            <div class="wd-divider"></div>

            <button class="wd-btn" id="wd-btn-crosshair">Toggle Crosshair</button>
            <button class="wd-btn" id="wd-btn-clear">Clear Guides</button>
        </div>
    `;

    // Toast hint
    const toast = document.createElement('div');
    toast.id = ID_TOAST;
    toast.textContent = "💡 Tip: Drag from the top/left bars to create guides!";

    document.body.append(style, rulerH, rulerV, guideContainer, crossX, crossY, overlay, toast);

    // Auto-remove toast after animation
    setTimeout(() => { if(toast) toast.remove(); }, 4100);

    // --- State ---
    let crosshairEnabled = false;
    let isDraggingOverlay = false;
    let guideDrag = null; // { el, type: 'h'|'v', offset }

    // --- Logic ---
    const ui = {
        x: overlay.querySelector('#wd-cur-x'),
        y: overlay.querySelector('#wd-cur-y'),
        btnCross: overlay.querySelector('#wd-btn-crosshair'),
        btnClear: overlay.querySelector('#wd-btn-clear'),
        close: overlay.querySelector('#wd-ruler-close'),
        drag: overlay.querySelector('#wd-ruler-drag'),
        // settings
        optOpacity: overlay.querySelector('#wd-opt-opacity'),
        optColor: overlay.querySelector('#wd-opt-color')
    };

    // Apply Settings
    function applySettings() {
        document.documentElement.style.setProperty('--wd-ruler-opacity', config.opacity);
        document.documentElement.style.setProperty('--wd-ruler-bg', config.color);
    }

    ui.optOpacity.oninput = (e) => { config.opacity = e.target.value; applySettings(); };
    ui.optColor.oninput = (e) => { config.color = e.target.value; applySettings(); };

    // Mouse Move (Global)
    document.addEventListener('mousemove', (e) => {
        // Update Coords
        ui.x.textContent = e.clientX;
        ui.y.textContent = e.clientY;

        // Crosshair
        if (crosshairEnabled) {
            crossX.style.top = e.clientY + 'px';
            crossY.style.left = e.clientX + 'px';
        }

        // Overlay Drag
        if (isDraggingOverlay) {
            overlay.style.right = 'auto'; overlay.style.bottom = 'auto'; // reset fixed
            overlay.style.left = (e.clientX - ui.drag.offsetX) + 'px';
            overlay.style.top = (e.clientY - ui.drag.offsetY) + 'px';
        }

        // Guide Drag (Creation or Move)
        if (guideDrag) {
            e.preventDefault();
            if (guideDrag.type === 'h') {
                guideDrag.el.style.top = e.clientY + 'px';
            } else {
                guideDrag.el.style.left = e.clientX + 'px';
            }
        }
    });

    // Create Guides
    function createGuide(type, pos) {
        const g = document.createElement('div');
        g.className = `wd-guide wd-guide-${type}`;
        if (type === 'h') g.style.top = pos + 'px';
        else g.style.left = pos + 'px';
        
        g.onmousedown = (e) => {
            if (e.button !== 0) return; // Only left click
            e.preventDefault(); // prevent selection
            guideDrag = { el: g, type };
        };
        
        guideContainer.appendChild(g);
        return g;
    }

    // Ruler Mousedown -> Create Guide Drag
    rulerH.onmousedown = (e) => {
        e.preventDefault();
        const g = createGuide('h', e.clientY);
        guideDrag = { el: g, type: 'h' };
    };
    rulerV.onmousedown = (e) => {
        e.preventDefault();
        const g = createGuide('v', e.clientX);
        guideDrag = { el: g, type: 'v' };
    };

    // Global Mouseup
    document.addEventListener('mouseup', () => {
        isDraggingOverlay = false;
        
        // If dropping guide back onto ruler (area < 30px), remove it
        if (guideDrag) {
            const rect = guideDrag.el.getBoundingClientRect();
            if (guideDrag.type === 'h' && rect.top < 30) guideDrag.el.remove();
            if (guideDrag.type === 'v' && rect.left < 30) guideDrag.el.remove();
            guideDrag = null;
        }
    });

    // Overlay Controls
    ui.btnCross.onclick = () => {
        crosshairEnabled = !crosshairEnabled;
        ui.btnCross.classList.toggle('active');
        crossX.style.display = crosshairEnabled ? 'block' : 'none';
        crossY.style.display = crosshairEnabled ? 'block' : 'none';
    };

    ui.btnClear.onclick = () => {
        guideContainer.innerHTML = '';
    };

    ui.close.onclick = removeRuler;

    // Overlay Drag Start
    ui.drag.onmousedown = (e) => {
        isDraggingOverlay = true;
        const rect = overlay.getBoundingClientRect();
        ui.drag.offsetX = e.clientX - rect.left;
        ui.drag.offsetY = e.clientY - rect.top;
    };

    // --- Cleanup ---
    function removeRuler() {
        style.remove();
        rulerH.remove();
        rulerV.remove();
        guideContainer.remove();
        crossX.remove();
        crossY.remove();
        overlay.remove();
        if(toast) toast.remove();
        window.removeEventListener('resize', createTicks);
    }

    chrome.runtime.onMessage.addListener(function listener(message) {
        if (message.action === 'removeRuler') {
            removeRuler();
            chrome.runtime.onMessage.removeListener(listener);
        }
    });

})();
