(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.Renderers = window.DevLens.Renderers || {};

    const RENDERER_ID = 'DesignStudio';

    /**
     * Renders the Design Studio UI into a container
     * @param {HTMLElement} container 
     * @param {Object} callbacks - Optional overrides or context
     */
    const render = (container) => {
        container.innerHTML = `
            <div class="wd-toolbar">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="font-size:16px; margin:0;">🎨 Design Studio</h2>
                    <div>
                        <button class="wd-btn small" id="wd-pixel-start">Start Inspector</button>
                    </div>
                </div>
                <div id="wd-pixel-status" style="font-size:11px; color:#666; margin-top:4px;">Inactive</div>
            </div>
            
            <div class="wd-panel-grid" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                
                <!-- Visual Editor -->
                <div class="wd-panel">
                    <h3 style="font-size:13px; border-bottom:1px solid #333; padding-bottom:6px; margin-bottom:12px;">
                        Visual Editor <span id="wd-sel-tag" style="color:#6c5ce7; font-size:11px; margin-left:8px;">(Select Element)</span>
                    </h3>
                    
                    <div id="wd-style-editor" style="display:none;">
                        <!-- Spacing -->
                        <div class="wd-control-group">
                            <label>Dimensions & Spacing</label>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                                <input type="text" class="wd-input" placeholder="Width" data-prop="width">
                                <input type="text" class="wd-input" placeholder="Height" data-prop="height">
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px;">
                                <input type="text" class="wd-input" placeholder="Margin" data-prop="margin">
                                <input type="text" class="wd-input" placeholder="Padding" data-prop="padding">
                            </div>
                        </div>

                        <!-- Typography -->
                        <div class="wd-control-group" style="margin-top:16px;">
                            <label>Typography</label>
                            <div style="display:flex; gap:8px; margin-bottom:8px;">
                                <input type="color" data-prop="color" style="width:30px; height:30px; padding:0; border:none; background:none; cursor:pointer;" title="Text Color">
                                <input type="text" class="wd-input" placeholder="Size (px)" data-prop="fontSize" style="width:70px;">
                                <select id="wd-font-select" class="wd-input" style="flex:1;">
                                    <option value="">Swap Font...</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Open Sans">Open Sans</option>
                                    <option value="Lato">Lato</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Playfair Display">Playfair Display</option>
                                </select>
                            </div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <button class="wd-btn-icon" data-prop="fontWeight" data-val="bold">B</button>
                                <button class="wd-btn-icon" data-prop="fontStyle" data-val="italic">I</button>
                                <button class="wd-btn-icon" data-prop="textDecoration" data-val="underline">U</button>
                                <button class="wd-btn-icon" data-prop="textAlign" data-val="left">⇤</button>
                                <button class="wd-btn-icon" data-prop="textAlign" data-val="center">↔</button>
                                <button class="wd-btn-icon" data-prop="textAlign" data-val="right">⇥</button>
                                <button class="wd-btn-icon" id="wd-text-edit-toggle" title="Edit Text Content" style="color:#e17055">✎</button>
                            </div>
                        </div>

                        <!-- Layout (Flex) -->
                        <div class="wd-control-group" style="margin-top:16px;">
                            <label>Layout</label>
                            <div style="display:flex; gap:8px; margin-bottom:8px;">
                                <button class="wd-btn small" id="wd-make-flex">Flex</button>
                                <button class="wd-btn small" id="wd-make-grid">Grid</button>
                            </div>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                                <button class="wd-btn-icon" title="Justify Start" data-flex-j="flex-start">├</button>
                                <button class="wd-btn-icon" title="Justify Center" data-flex-j="center">┼</button>
                                <button class="wd-btn-icon" title="Justify End" data-flex-j="flex-end">┤</button>
                                <button class="wd-btn-icon" title="Justify Between" data-flex-j="space-between">|||</button>
                                <button class="wd-btn-icon" title="Align Center" data-flex-a="center">✛</button>
                            </div>
                        </div>
                    </div>
                    <div id="wd-style-placeholder" style="color:#666; font-style:italic; padding:20px 0; text-align:center;">
                        Click 'Start Inspector' & select an element.
                    </div>
                </div>

                <!-- Tools Row -->
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <!-- Palette Generator -->
                    <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h3 style="font-size:12px; margin:0;">Site Palette</h3>
                            <button class="wd-btn small" id="wd-scan-colors">Scan</button>
                            </div>
                            <div id="wd-palette-grid" style="display:flex; flex-wrap:wrap; gap:6px; min-height:40px;">
                                <em style="color:#666; font-size:11px">No colors scanned.</em>
                            </div>
                    </div>

                    <!-- Assets -->
                    <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h3 style="font-size:12px; margin:0;">Assets <span id="wd-asset-count" style="font-size: 10px; color:#666"></span></h3>
                        </div>
                            <div class="wd-asset-toolbar" style="margin-bottom:8px;">
                            <button class="wd-btn small" id="wd-asset-dl-all" style="width:100%;">Download (0)</button>
                            </div>
                        <div id="wd-asset-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; max-height:100px; overflow-y: auto;"></div>
                    </div>
                </div>

            </div>
            
            <style>
                .wd-btn-icon { background:#333; border:1px solid #444; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:0.2s; }
                .wd-btn-icon:hover { background:#444; border-color:#666; }
            </style>
        `;

        if (window.DevLens && window.DevLens.PixelStudio) {
            const Pixel = window.DevLens.PixelStudio;
            
            // --- Helper Selectors (Scoped to container) ---
            const $ = (sel) => container.querySelector(sel);
            const $$ = (sel) => container.querySelectorAll(sel);

            // Asset Logic
            const refreshAssets = () => {
                const assets = Pixel.scanAssets();
                const grid = $('#wd-asset-grid');
                $('#wd-asset-count').textContent = `(${assets.length})`;
                grid.innerHTML = ''; // clear

                const selected = new Set();
                const btnDl = $('#wd-asset-dl-all');

                const updateBtn = () => {
                    btnDl.textContent = `Download (${selected.size})`;
                    btnDl.style.opacity = selected.size > 0 ? '1' : '0.5';
                };

                btnDl.onclick = () => {
                   if (selected.size === 0) return;
                   const urls = Array.from(selected);
                   chrome.runtime.sendMessage({ action: 'downloadAssets', urls: urls });
                   selected.clear();
                   updateBtn();
                   grid.querySelectorAll('img.selected').forEach(i => i.classList.remove('selected'));
                };

                assets.forEach(a => {
                    const img = document.createElement('img');
                    img.src = a.src;
                    Object.assign(img.style, { width:'100%', height:'40px', objectFit:'contain', background:'#000', borderRadius:'4px', border:'1px solid #333', cursor:'pointer' });
                    img.onclick = () => {
                        if (selected.has(a.src)) {
                            selected.delete(a.src);
                            img.style.borderColor = '#333'; img.classList.remove('selected');
                        } else {
                            selected.add(a.src);
                            img.style.borderColor = '#6c5ce7'; img.classList.add('selected');
                        }
                        updateBtn();
                    };
                    grid.appendChild(img);
                });
            };
            refreshAssets(); // Initial scan

            // Palette Logic
            const btnScan = $('#wd-scan-colors');
            const pGrid = $('#wd-palette-grid');
            btnScan.onclick = () => {
                 btnScan.textContent = '...';
                 setTimeout(() => {
                     const colors = Pixel.scanColors();
                     pGrid.innerHTML = '';
                     if(colors.length === 0) pGrid.innerHTML = '<em style="color:#666; font-size:11px">No colors found.</em>';
                     colors.forEach(c => {
                         const swatch = document.createElement('div');
                         swatch.title = `${c.color} (${c.count} uses)`;
                         Object.assign(swatch.style, { width:'24px', height:'24px', borderRadius:'50%', background:c.color, border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer' });
                         swatch.onclick = () => {
                             navigator.clipboard.writeText(c.color);
                             swatch.style.transform = 'scale(1.2)';
                             setTimeout(()=>swatch.style.transform='scale(1)', 200);
                         };
                         pGrid.appendChild(swatch);
                     });
                     btnScan.textContent = 'Scan';
                 }, 50);
            };

            // Inspector Logic
            const btn = $('#wd-pixel-start');
            const status = $('#wd-pixel-status');
            const editor = $('#wd-style-editor');
            const placeholder = $('#wd-style-placeholder');
            const tagLabel = $('#wd-sel-tag');
            const fontSelect = $('#wd-font-select');

            // Font Swap
            fontSelect.onchange = () => Pixel.loadGoogleFont(fontSelect.value);

            // Style Buttons
            $$('.wd-btn-icon[data-prop]').forEach(b => {
                b.onclick = () => Pixel.applyStyle(b.dataset.prop, b.dataset.val);
            });

            // Flex Shortcuts
            $('#wd-make-flex').onclick = () => Pixel.applyStyle('display', 'flex');
            $('#wd-make-grid').onclick = () => Pixel.applyStyle('display', 'grid');
            $$('[data-flex-j]').forEach(b => b.onclick = () => Pixel.applyStyle('justifyContent', b.dataset.flexJ));
            $$('[data-flex-a]').forEach(b => b.onclick = () => Pixel.applyStyle('alignItems', b.dataset.flexA));

            // Content Mode
            const btnEdit = $('#wd-text-edit-toggle');
            let isEditing = false;
            btnEdit.onclick = () => {
                isEditing = !isEditing;
                document.designMode = isEditing ? 'on' : 'off';
                btnEdit.style.background = isEditing ? '#e17055' : '#333';
                btnEdit.style.color = isEditing ? '#fff' : '#e17055';
            };

            // Inspector Toggle
            const toggleInspector = () => {
                if (btn.classList.contains('active')) {
                    Pixel.disableInspector();
                    btn.classList.remove('active');
                    btn.textContent = 'Start Inspector';
                    status.textContent = 'Inactive';
                    btn.style.background = '#6c5ce7';
                } else {
                    // Minimize window if standalone? Maybe just keep open to see tools
                    Pixel.enableInspector();
                    btn.classList.add('active');
                    btn.textContent = 'Stop Inspector';
                    status.textContent = 'Active - Click element to edit';
                    btn.style.background = '#e17055';
                }
            };
            btn.onclick = toggleInspector;

            // Handling Selection (Global Event)
            // We need a unique listener for this renderer instance or just update if we are visible
            const onSelect = (data) => {
                if (!document.contains(container)) return; // Stop if UI removed

                placeholder.style.display = 'none';
                editor.style.display = 'block';
                tagLabel.textContent = `<${data.tagName}>`;

                // Populate Inputs
                $$('input[data-prop]').forEach(inp => {
                    const prop = inp.dataset.prop;
                    if (inp.type !== 'color') {
                       inp.value = data.style[prop] || '';
                    }
                    inp.oninput = () => Pixel.applyStyle(prop, inp.value);
                });
            };
            
            // Register listener safely (PixelStudio might broadcast to all subscribers)
            Pixel.on('select', onSelect);
        }
    };

    // Register Renderer
    window.DevLens.Renderers[RENDERER_ID] = render;

    // Standalone Listener
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'toggleDesignStudio') {
            const winId = 'wd-win-design-studio';
            if (document.getElementById(winId)) {
                document.getElementById(winId).remove();
            } else {
                if (window.DevLens.UI && window.DevLens.UI.createWindow) {
                    const { body } = window.DevLens.UI.createWindow(winId, 'Design Studio', '🎨', { width: '340px', height: '500px' });
                    render(body);
                }
            }
        }
    });

})();
