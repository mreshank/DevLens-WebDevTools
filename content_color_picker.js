(() => {
    const ID = 'webdevtools-color-studio';
    if (document.getElementById(ID)) return;

    // --- Helpers ---
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    }

    function hexToHsl(hex) {
        const rgb = hexToRgb(hex);
        if (!rgb) return '';
        let { r, g, b } = rgb;
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) h = s = 0;
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    const PALETTES = {
        "Material": ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#9e9e9e", "#607d8b"],
        "Flat UI": ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"],
        "Neon": ["#ff00ff", "#00ffff", "#00ff00", "#ffff00", "#ff0000", "#7df9ff", "#ff6eff", "#b0ff00"]
    };

    // --- UI Structure ---
    const overlay = document.createElement('div');
    overlay.id = ID;
    // Base styles
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '320px',
        height: 'auto',
        maxHeight: '85vh',
        backgroundColor: '#0f0f13',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(24px)',
        webkitBackdropFilter: 'blur(24px)',
        zIndex: '2147483647',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'wdSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes wdSlideIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .wd-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); cursor: move; }
        .wd-title { font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .wd-dot { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(135deg, #FF3131, #E30B5C); box-shadow: 0 0 8px #E30B5C; }
        .wd-close { cursor: pointer; opacity: 0.6; font-size: 18px; line-height: 1; transition: opacity 0.2s; }
        .wd-close:hover { opacity: 1; }

        .wd-tabs { display: flex; padding: 8px 8px 0; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .wd-tab { flex: 1; text-align: center; padding: 8px 4px; font-size: 11px; color: #a0a0ba; cursor: pointer; border-radius: 6px 6px 0 0; transition: all 0.2s; font-weight: 500; }
        .wd-tab:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .wd-tab.active { background: rgba(255,255,255,0.08); color: #6c5ce7; border-bottom: 2px solid #6c5ce7; }

        .wd-content { padding: 16px; min-height: 200px; max-height: 480px; overflow-y: auto; }
        .wd-section { display: none; }
        .wd-section.active { display: block; animation: wdFadeIn 0.2s ease; }
        @keyframes wdFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        /* Components */
        .wd-btn { width: 100%; padding: 10px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .wd-btn-primary { background: linear-gradient(135deg, #6c5ce7, #a55eea); color: #fff; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3); }
        .wd-btn-primary:hover { box-shadow: 0 6px 16px rgba(108, 92, 231, 0.5); transform: translateY(-1px); }
        .wd-btn-secondary { background: rgba(255,255,255,0.1); color: #fff; }
        .wd-btn-secondary:hover { background: rgba(255,255,255,0.15); }
        
        .wd-input-group { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
        .wd-label { font-size: 10px; color: #a0a0ba; font-weight: 700; width: 30px; }
        .wd-val { font-family: monospace; font-size: 11px; color: #fff; flex: 1; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wd-val:hover { color: #6c5ce7; }

        .wd-checkbox-group { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 11px; color: #a0a0ba; cursor: pointer; }
        .wd-checkbox-group input { accent-color: #6c5ce7; }

        /* Grid for Palette/Analyzer */
        .wd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(24px, 1fr)); gap: 6px; margin-top: 12px; }
        .wd-color-chip { aspect-ratio: 1; border-radius: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); position: relative; }
        .wd-color-chip:hover { transform: scale(1.1); z-index: 2; border-color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.5); }
        
        /* Gradient Tool */
        .wd-slider { width: 100%; margin: 12px 0; accent-color: #6c5ce7; }
        .wd-color-input { width: 100%; height: 32px; border: none; padding: 0; background: none; cursor: pointer; }
        .wd-grad-type { display: flex; background: rgba(255,255,255,0.1); border-radius: 6px; padding: 2px; margin-bottom: 12px; }
        .wd-grad-opt { flex: 1; text-align: center; font-size: 10px; padding: 4px; cursor: pointer; color: #aaa; border-radius: 4px; }
        .wd-grad-opt.selected { background: #6c5ce7; color: #fff; }
    `;
    overlay.appendChild(styleSheet);

    overlay.innerHTML += `
        <div class="wd-header" id="wd-drag-handle">
            <div class="wd-title"><div class="wd-dot"></div> Color Studio</div>
            <div class="wd-close" id="wd-btn-close">×</div>
        </div>
        
        <div class="wd-tabs">
            <div class="wd-tab active" data-tab="picker">Picker</div>
            <div class="wd-tab" data-tab="analyzer">Analyzer</div>
            <div class="wd-tab" data-tab="gradient">Gradient</div>
            <div class="wd-tab" data-tab="palette">Palette</div>
        </div>

        <div class="wd-content">
            <!-- PICKER TAB -->
            <div class="wd-section active" id="tab-picker">
                <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                    <div id="wd-picker-preview" style="width: 60px; height: 60px; border-radius: 12px; background: #333; border: 1px solid rgba(255,255,255,0.1);"></div>
                    <button id="wd-btn-eyedropper" class="wd-btn wd-btn-primary" style="flex: 1;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.74 5.74c.98.98.98 2.58 0 3.56l-6.55 6.55-3.81.85.85-3.81 6.55-6.55z"/><path d="M11 6.31A5.02 5.02 0 0 1 12 2.69"/></svg>
                        Pick Color
                    </button>
                </div>
                
                <label class="wd-checkbox-group">
                    <input type="checkbox" id="wd-auto-copy" checked>
                    Auto-copy picked color
                </label>

                <div class="wd-input-group"><span class="wd-label">HEX</span><div class="wd-val" id="wd-val-hex">#000000</div></div>
                <div class="wd-input-group"><span class="wd-label">RGB</span><div class="wd-val" id="wd-val-rgb">rgb(0,0,0)</div></div>
                <div class="wd-input-group"><span class="wd-label">HSL</span><div class="wd-val" id="wd-val-hsl">hsl(0,0%,0%)</div></div>
                
                <div style="margin-top: 16px;">
                    <div style="font-size: 11px; color: #a0a0ba; margin-bottom: 8px; font-weight: 600;">RECENT HISTORY</div>
                    <div class="wd-grid" id="wd-history-grid" style="grid-template-columns: repeat(8, 1fr);"></div>
                </div>
            </div>

            <!-- ANALYZER TAB -->
            <div class="wd-section" id="tab-analyzer">
                <button id="wd-btn-analyze" class="wd-btn wd-btn-secondary" style="margin-bottom: 12px;">
                    ⚡ Analyze Page Colors (Deep)
                </button>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                     <div id="wd-analyzer-stats" style="font-size: 11px; color: #a0a0ba;"></div>
                     <button id="wd-btn-export-css" class="wd-btn wd-btn-secondary" style="width: auto; padding: 4px 8px; font-size: 10px; display: none;">Export CSS</button>
                </div>
                <div class="wd-grid" id="wd-analyzer-grid"></div>
            </div>

            <!-- GRADIENT TAB -->
            <div class="wd-section" id="tab-gradient">
                <div id="wd-grad-preview" style="height: 100px; border-radius: 8px; background: linear-gradient(90deg, #6c5ce7, #00b894); margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);"></div>
                
                <div class="wd-grad-type">
                    <div class="wd-grad-opt selected" data-type="linear">Linear</div>
                    <div class="wd-grad-opt" data-type="radial">Radial</div>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <input type="color" id="wd-grad-c1" class="wd-color-input" value="#6c5ce7">
                    </div>
                    <div style="flex: 1;">
                        <input type="color" id="wd-grad-c2" class="wd-color-input" value="#00b894">
                    </div>
                </div>
                
                <div id="wd-grad-deg-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #a0a0ba;">
                    <span>Angle: <span id="wd-grad-deg-val">90</span>°</span>
                    <input type="range" id="wd-grad-deg" class="wd-slider" min="0" max="360" value="90" style="width: 60%;">
                </div>

                <div class="wd-input-group" style="margin-top: 12px;">
                    <div class="wd-val" id="wd-grad-css" style="font-size: 10px;">linear-gradient(90deg, #6c5ce7, #00b894)</div>
                </div>
                <button id="wd-btn-copy-grad" class="wd-btn wd-btn-secondary">Copy CSS</button>
            </div>

            <!-- PALETTE TAB -->
            <div class="wd-section" id="tab-palette">
                <select id="wd-palette-select" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; margin-bottom: 12px; outline: none;">
                    <option value="Material">Material Design</option>
                    <option value="Flat UI">Flat UI</option>
                    <option value="Neon">Neon</option>
                </select>
                <div class="wd-grid" id="wd-palette-grid"></div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // --- State & DOM refs ---
    const dom = {
        tabs: overlay.querySelectorAll('.wd-tab'),
        sections: overlay.querySelectorAll('.wd-section'),
        close: overlay.querySelector('#wd-btn-close'),
        pickBtn: overlay.querySelector('#wd-btn-eyedropper'),
        handle: overlay.querySelector('#wd-drag-handle'),
        // Picker
        pPreview: overlay.querySelector('#wd-picker-preview'),
        pHex: overlay.querySelector('#wd-val-hex'),
        pRgb: overlay.querySelector('#wd-val-rgb'),
        pHsl: overlay.querySelector('#wd-val-hsl'),
        pHistory: overlay.querySelector('#wd-history-grid'),
        pAutoCopy: overlay.querySelector('#wd-auto-copy'),
        // Analyzer
        aBtn: overlay.querySelector('#wd-btn-analyze'),
        aGrid: overlay.querySelector('#wd-analyzer-grid'),
        aStats: overlay.querySelector('#wd-analyzer-stats'),
        aExport: overlay.querySelector('#wd-btn-export-css'),
        // Gradient
        gPreview: overlay.querySelector('#wd-grad-preview'),
        gC1: overlay.querySelector('#wd-grad-c1'),
        gC2: overlay.querySelector('#wd-grad-c2'),
        gDeg: overlay.querySelector('#wd-grad-deg'),
        gDegVal: overlay.querySelector('#wd-grad-deg-val'),
        gCss: overlay.querySelector('#wd-grad-css'),
        gCopy: overlay.querySelector('#wd-btn-copy-grad'),
        gTypes: overlay.querySelectorAll('.wd-grad-opt'),
        gDegCont: overlay.querySelector('#wd-grad-deg-container'),
        // Palette
        palSelect: overlay.querySelector('#wd-palette-select'),
        palGrid: overlay.querySelector('#wd-palette-grid')
    };

    let state = {
        color: '#6c5ce7',
        history: [],
        grad: { c1: '#6c5ce7', c2: '#00b894', deg: 90, type: 'linear' },
        analyzedColors: []
    };

    // Load State
    chrome.storage.local.get(['colorHistory', 'autoCopy'], (res) => {
        if (res.colorHistory) state.history = res.colorHistory;
        if (typeof res.autoCopy !== 'undefined') dom.pAutoCopy.checked = res.autoCopy;
        renderHistory();
    });

    // --- Logic: Tabs ---
    dom.tabs.forEach(tab => {
        tab.onclick = () => {
            dom.tabs.forEach(t => t.classList.remove('active'));
            dom.sections.forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            overlay.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active');
        };
    });

    dom.close.onclick = () => overlay.remove();

    // --- Logic: Picker ---
    function updatePicker(hex) {
        state.color = hex;
        dom.pPreview.style.backgroundColor = hex;
        dom.pHex.textContent = hex;
        dom.pRgb.textContent = `rgb(${hexToRgb(hex).r}, ${hexToRgb(hex).g}, ${hexToRgb(hex).b})`;
        dom.pHsl.textContent = hexToHsl(hex);
        
        // Add to history
        if (!state.history.includes(hex)) {
            state.history.unshift(hex);
            if (state.history.length > 16) state.history.pop();
            chrome.storage.local.set({ colorHistory: state.history });
            renderHistory();
        }
    }

    function renderHistory() {
        dom.pHistory.innerHTML = '';
        state.history.forEach(c => {
            const chip = document.createElement('div');
            chip.className = 'wd-color-chip';
            chip.style.backgroundColor = c;
            chip.title = c;
            chip.onclick = () => { updatePicker(c); copyToClipboard(c); };
            dom.pHistory.appendChild(chip);
        });
    }

    dom.pAutoCopy.onchange = (e) => {
        chrome.storage.local.set({ autoCopy: e.target.checked });
    }

    dom.pickBtn.onclick = async () => {
        if (!window.EyeDropper) return alert('EyeDropper not supported');
        overlay.style.opacity = '0';
        try {
            const ed = new window.EyeDropper();
            const res = await ed.open();
            overlay.style.opacity = '1';
            updatePicker(res.sRGBHex);
            if (dom.pAutoCopy.checked) {
                copyToClipboard(res.sRGBHex);
            }
        } catch (e) {
            overlay.style.opacity = '1';
        }
    };

    [dom.pHex, dom.pRgb, dom.pHsl].forEach(el => el.onclick = () => copyToClipboard(el.textContent));

    // --- Logic: Analyzer (Deep Scan) ---
    dom.aBtn.onclick = () => {
        dom.aBtn.textContent = 'Scanning...';
        dom.aGrid.innerHTML = '';
        dom.aExport.style.display = 'none';
        
        // Using requestIdleCallback to not freeze main thread on large sites
        requestIdleCallback(() => {
            const colorCounts = {};
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                // Deep Scan: check border, slice fill/stroke for SVGs
                const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
                
                props.forEach(prop => {
                    const c = style[prop];
                    if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' && c !== 'none') {
                        // Standardize rgb/rgba spaces to avoid duplicates like "rgb(0, 0, 0)" vs "rgb(0,0,0)"
                        // simple stripping for now
                        const val = c.replace(/\s/g, ''); 
                        colorCounts[val] = (colorCounts[val] || 0) + 1;
                    }
                });
            });

            // Sort by count
            const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 64);
            state.analyzedColors = sorted.map(s => s[0]); // store for export

            dom.aStats.textContent = `Scanned ${elements.length} nodes. Found ${Object.keys(colorCounts).length} colors.`;
            dom.aBtn.textContent = '⚡ Analyze Page Colors (Deep)';
            dom.aExport.style.display = 'block';

            sorted.forEach(([color, count]) => {
                const chip = document.createElement('div');
                chip.className = 'wd-color-chip';
                chip.style.backgroundColor = color;
                chip.title = `${color} (${count} occurences)`;
                chip.onclick = () => {
                   copyToClipboard(color);
                };
                dom.aGrid.appendChild(chip);
            });
        });
    };

    dom.aExport.onclick = () => {
        if (!state.analyzedColors.length) return;
        let css = ':root {\n';
        state.analyzedColors.forEach((c, i) => {
            css += `  --color-${i + 1}: ${c};\n`;
        });
        css += '}';
        copyToClipboard(css);
        alert('CSS Variables copied to clipboard!');
    };

    // --- Logic: Gradient (Radial & Linear) ---
    function updateGradient() {
        const { c1, c2, deg, type } = state.grad;
        let css = '';
        if (type === 'linear') {
            css = `linear-gradient(${deg}deg, ${c1}, ${c2})`;
            dom.gDegCont.style.display = 'flex'; // show angle
        } else {
            css = `radial-gradient(circle, ${c1}, ${c2})`;
            dom.gDegCont.style.display = 'none'; // hide angle
        }
        dom.gPreview.style.background = css;
        dom.gCss.textContent = css;
        dom.gDegVal.textContent = deg;
    }

    dom.gTypes.forEach(opt => {
        opt.onclick = () => {
            dom.gTypes.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            state.grad.type = opt.dataset.type;
            updateGradient();
        };
    });

    dom.gC1.oninput = (e) => { state.grad.c1 = e.target.value; updateGradient(); };
    dom.gC2.oninput = (e) => { state.grad.c2 = e.target.value; updateGradient(); };
    dom.gDeg.oninput = (e) => { state.grad.deg = e.target.value; updateGradient(); };
    dom.gCopy.onclick = () => copyToClipboard(dom.gCss.textContent);

    // --- Logic: Palette ---
    function renderPalette(name) {
        dom.palGrid.innerHTML = '';
        const colors = PALETTES[name] || [];
        colors.forEach(c => {
            const chip = document.createElement('div');
            chip.className = 'wd-color-chip';
            chip.style.backgroundColor = c;
            chip.title = c;
            chip.onclick = () => { updatePicker(c); copyToClipboard(c); };
            dom.palGrid.appendChild(chip);
        });
    }
    
    dom.palSelect.onchange = (e) => renderPalette(e.target.value);
    renderPalette('Material'); // Init

    // --- Logic: Drag ---
    let isDragging = false, startX, startY, initialLeft, initialTop;
    dom.handle.onmousedown = (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = overlay.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        overlay.style.transition = 'none';
        document.body.style.userSelect = 'none';
    };
    document.onmousemove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        overlay.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    document.onmouseup = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        isDragging = false;
        overlay.style.transition = '';
        overlay.style.transform = '';
        overlay.style.left = `${initialLeft + dx}px`;
        overlay.style.top = `${initialTop + dy}px`;
        document.body.style.userSelect = '';
    };

    // --- Utils ---
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        // Quick visual feedback
        const el = document.activeElement;
        if(el) {
            const original = el.style.borderColor;
            el.style.borderColor = '#00b894';
            setTimeout(() => el.style.borderColor = original || 'rgba(255,255,255,0.1)', 300);
        }
    }

    // --- Cleanup Listener ---
    chrome.runtime.onMessage.addListener(function listener(message) {
        if (message.action === 'removeColorPicker') {
            if (document.getElementById(ID)) {
                document.getElementById(ID).remove();
            }
            chrome.runtime.onMessage.removeListener(listener);
        }
    });

})();
