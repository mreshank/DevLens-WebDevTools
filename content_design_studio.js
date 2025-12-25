(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.Renderers = window.DevLens.Renderers || {};

    const RENDERER_ID = 'DesignStudio';

    const render = (container) => {
        // --- Toolbar ---
        const toolbar = document.createElement('div');
        toolbar.className = 'wd-toolbar';
        toolbar.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 style="font-size:16px; margin:0;">🎨 Design Studio</h2>
                <div>
                    <button class="wd-btn small" id="wd-pixel-start">Start Inspector</button>
                </div>
            </div>
            <div id="wd-pixel-status" style="font-size:11px; color:#666; margin-top:4px;">Inactive - <span id="wd-sel-tag">None selected</span></div>
        `;
        container.appendChild(toolbar);

        // --- Tabs Content ---
        
        // 1. Layout Tab
        const layoutContent = `
            <div class="wd-control-group">
                <label>Dimensions</label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    <input type="text" class="wd-input" placeholder="Width" data-prop="width">
                    <input type="text" class="wd-input" placeholder="Height" data-prop="height">
                </div>
            </div>
            <div class="wd-control-group">
                <label>Spacing</label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    <input type="text" class="wd-input" placeholder="Margin" data-prop="margin">
                    <input type="text" class="wd-input" placeholder="Padding" data-prop="padding">
                </div>
            </div>
            <div class="wd-control-group">
                <label>Display</label>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <button class="wd-btn small" id="wd-make-block" data-val="block">Block</button>
                    <button class="wd-btn small" id="wd-make-flex" data-val="flex">Flex</button>
                    <button class="wd-btn small" id="wd-make-grid" data-val="grid">Grid</button>
                </div>
                <div style="display:flex; gap:4px; flex-wrap:wrap;">
                    <button class="wd-btn-icon" title="Justify Start" data-flex-j="flex-start">├</button>
                    <button class="wd-btn-icon" title="Justify Center" data-flex-j="center">┼</button>
                    <button class="wd-btn-icon" title="Justify End" data-flex-j="flex-end">┤</button>
                    <button class="wd-btn-icon" title="Justify Between" data-flex-j="space-between">|||</button>
                    <button class="wd-btn-icon" title="Align Center" data-flex-a="center">✛</button>
                </div>
            </div>
        `;

        // 2. Typography Tab
        const typoContent = `
             <div class="wd-control-group">
                <label>Font & Color</label>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div style="position:relative; width:30px; height:30px; overflow:hidden; border-radius:4px; border:1px solid #444;">
                        <input type="color" data-prop="color" style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; cursor:pointer; padding:0; border:none;">
                    </div>
                    <input type="text" class="wd-input" placeholder="Size" data-prop="fontSize" style="width:60px;">
                    <select id="wd-font-select" class="wd-input" style="flex:1;">
                        <option value="">Font Family...</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Playfair Display">Playfair Display</option>
                    </select>
                </div>
            </div>
            <div class="wd-control-group">
                 <label>Style & Align</label>
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
             <div class="wd-control-group">
                <label>Line Height & Spacing</label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    <input type="text" class="wd-input" placeholder="Line Height" data-prop="lineHeight">
                    <input type="text" class="wd-input" placeholder="Letter Spacing" data-prop="letterSpacing">
                </div>
            </div>
        `;

        // 3. Effects Tab (NEW)
        const effectsContent = `
            <div class="wd-control-group">
                <label>Background</label>
                <div style="display:flex; gap:8px; align-items:center;">
                    <div style="position:relative; width:40px; height:30px; overflow:hidden; border-radius:4px; border:1px solid #444;">
                         <input type="color" data-prop="backgroundColor" style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; cursor:pointer; padding:0; border:none;">
                    </div>
                    <input type="text" class="wd-input" placeholder="Color Details (e.g. #fff)" data-prop="backgroundColor">
                </div>
            </div>
             <div class="wd-control-group">
                <label>Border</label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
                     <input type="text" class="wd-input" placeholder="Width" data-prop="borderWidth">
                     <input type="text" class="wd-input" placeholder="Radius" data-prop="borderRadius">
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    <select class="wd-input" data-prop="borderStyle">
                        <option value="none">None</option>
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                    </select>
                    <div style="position:relative; height:30px; overflow:hidden; border-radius:4px; border:1px solid #444;">
                        <input type="color" data-prop="borderColor" style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; cursor:pointer;">
                    </div>
                </div>
            </div>
             <div class="wd-control-group">
                <label>Opacity & Cursor</label>
                 <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    <input type="range" class="wd-input" min="0" max="1" step="0.1" data-prop="opacity" title="Opacity">
                    <select class="wd-input" data-prop="cursor">
                        <option value="auto">Auto</option>
                        <option value="pointer">Pointer</option>
                        <option value="default">Default</option>
                        <option value="not-allowed">Not Allowed</option>
                    </select>
                </div>
            </div>
        `;

        // 4. Assets Tab
        const assetsContent = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="font-size:12px; margin:0;">Page Assets <span id="wd-asset-count" style="font-size: 10px; color:#666"></span></h3>
                <button class="wd-btn small" id="wd-asset-dl-all">Download</button>
            </div>
            <div id="wd-asset-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; max-height:250px; overflow-y: auto;"></div>
        `;
        
        // Create Tabs Container
        if (window.DevLens.UI && window.DevLens.UI.createTabs) {
            const tabsContainer = window.DevLens.UI.createTabs('wd-ds', [
                { id: 'layout', label: 'Layout', content: layoutContent },
                { id: 'typo', label: 'Text', content: typoContent },
                { id: 'effects', label: 'Effects', content: effectsContent },
                { id: 'assets', label: 'Assets', content: assetsContent }
            ]);
            tabsContainer.style.marginTop = '12px';
            container.appendChild(tabsContainer);
        } else {
            container.innerHTML += '<div style="color:red; padding:10px;">Error: UI.createTabs not found. Reload extension.</div>';
            return;
        }

        // --- Logic & Listeners ---
        
        if (window.DevLens && window.DevLens.PixelStudio) {
            const Pixel = window.DevLens.PixelStudio;
            const $ = (sel) => container.querySelector(sel);
            const $$ = (sel) => container.querySelectorAll(sel);

            // Asset Logic
            const refreshAssets = () => {
                const assets = Pixel.scanAssets();
                const grid = $('#wd-asset-grid');
                if(!grid) return;
                
                $('#wd-asset-count').textContent = `(${assets.length})`;
                grid.innerHTML = ''; 

                const selected = new Set();
                const btnDl = $('#wd-asset-dl-all');

                 const updateBtn = () => {
                    btnDl.textContent = selected.size > 0 ? `Download (${selected.size})` : 'Download All';
                    // btnDl.style.opacity = selected.size > 0 ? '1' : '0.5';
                };

                btnDl.onclick = () => {
                   let urls = [];
                   if (selected.size > 0) urls = Array.from(selected);
                   else urls = assets.map(a => a.src); // Download all if none selected

                   if(urls.length === 0) return;
                   
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
            refreshAssets();

            // Inspector Logic
            const btn = $('#wd-pixel-start');
            const status = $('#wd-pixel-status');
            const tagLabel = $('#wd-sel-tag');
            const fontSelect = $('#wd-font-select');
            
            // Font Swap
            if(fontSelect) fontSelect.onchange = () => Pixel.loadGoogleFont(fontSelect.value);

            // Style Inputs (Global for all inputs with data-prop)
            $$('input[data-prop], select[data-prop]').forEach(inp => {
                const handler = () => Pixel.applyStyle(inp.dataset.prop, inp.value);
                inp.oninput = handler; 
                inp.onchange = handler; // For selects/color
            });

            // Style Buttons
            $$('.wd-btn-icon[data-prop]').forEach(b => {
                b.onclick = () => Pixel.applyStyle(b.dataset.prop, b.dataset.val);
            });

            // Flex Shortcuts
            const btnFlex = $('#wd-make-flex');
            if(btnFlex) {
                $('#wd-make-block').onclick = () => Pixel.applyStyle('display', 'block');
                $('#wd-make-flex').onclick = () => Pixel.applyStyle('display', 'flex');
                $('#wd-make-grid').onclick = () => Pixel.applyStyle('display', 'grid');
                $$('[data-flex-j]').forEach(b => b.onclick = () => Pixel.applyStyle('justifyContent', b.dataset.flexJ));
                $$('[data-flex-a]').forEach(b => b.onclick = () => Pixel.applyStyle('alignItems', b.dataset.flexA));
            }

            // Content Mode
            const btnEdit = $('#wd-text-edit-toggle');
            if(btnEdit) {
                let isEditing = false;
                btnEdit.onclick = () => {
                    isEditing = !isEditing;
                    document.designMode = isEditing ? 'on' : 'off';
                    btnEdit.style.background = isEditing ? '#e17055' : 'transparent';
                    btnEdit.style.color = isEditing ? '#fff' : '#e17055';
                };
            }

            // Inspector Toggle
            const toggleInspector = () => {
                if (btn.classList.contains('active')) {
                    Pixel.disableInspector();
                    btn.classList.remove('active');
                    btn.textContent = 'Start Inspector';
                    status.innerHTML = 'Inactive';
                    btn.style.background = '#6c5ce7';
                } else {
                    Pixel.enableInspector();
                    btn.classList.add('active');
                    btn.textContent = 'Stop Inspector';
                    status.innerHTML = 'Active - Click element to edit';
                    btn.style.background = '#e17055';
                }
            };
            btn.onclick = toggleInspector;

            // Selection Listener
            const onSelect = (data) => {
                if (!document.contains(container)) return; 
                
                tagLabel.textContent = `<${data.tagName}>`;
                tagLabel.style.color = '#fff';
                tagLabel.style.background = '#6c5ce7';
                tagLabel.style.padding = '2px 6px';
                tagLabel.style.borderRadius = '4px';

                // Populate Inputs
                $$('input[data-prop], select[data-prop]').forEach(inp => {
                    const prop = inp.dataset.prop;
                    // Dont overwrite generic color inputs if they are being used for interaction? 
                    // Actually we want to read the current values.
                    // Special handling for color inputs might be needed if computed style is rgb() and input expects hex
                    if (data.style[prop]) {
                        inp.value = data.style[prop];
                         // Convert rgb to hex for color inputs if needed (complex, skipping for brevity unless requested)
                    }
                });
            };
            
            Pixel.on('select', onSelect);
        }
    };

    window.DevLens.Renderers[RENDERER_ID] = render;

    // Standalone Listener
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'toggleDesignStudio') {
            const winId = 'wd-win-design-studio';
            if (document.getElementById(winId)) {
                document.getElementById(winId).remove();
            } else {
                if (window.DevLens.UI && window.DevLens.UI.createWindow) {
                    const { body } = window.DevLens.UI.createWindow(winId, 'Design Studio', '🎨', { width: '360px', height: '600px' });
                    render(body);
                }
            }
        }
    });

})();
