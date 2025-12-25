(() => {
    const ID_HUB_DOCK = 'wd-hub-dock';
    const ID_HUB_DASHBOARD = 'wd-hub-dashboard';
    
    if (document.getElementById(ID_HUB_DOCK)) return;

    // --- Styles ---
    // Start Network Spy immediately
    if (window.DevLens && window.DevLens.Inspector && window.DevLens.Inspector.enableNetworkSpy) {
        window.DevLens.NetworkLog = window.DevLens.NetworkLog || [];
        window.DevLens.Inspector.enableNetworkSpy();
        
        // Global listener to capture data even when tab is closed
        window.DevLens.Inspector.onNetworkRequest((data) => {
            window.DevLens.NetworkLog.push(data);
            if (window.DevLens.NetworkLog.length > 50) window.DevLens.NetworkLog.shift(); // Keep last 50
            
            // If UI is open, append row
            const list = document.getElementById('wd-net-list');
            if (list) {
                const req = data;
                const row = document.createElement('div');
                Object.assign(row.style, {
                         display: 'grid', gridTemplateColumns: '40px 50px 1fr 50px', 
                         padding: '8px 10px', borderBottom: '1px solid #222', 
                         fontSize: '12px', cursor: 'pointer', color: '#ccc'
                });
                const color = req.status >= 400 || req.status === 'ERR' ? '#ff7675' : '#00b894';
                const name = req.url.split('/').pop().split('?')[0] || req.url;
                row.innerHTML = `
                    <span style="color:${color}">${req.status}</span>
                    <span style="font-weight:bold">${req.method}</span>
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${req.url}">${name}</span>
                    <span style="color:#888">${req.time}ms</span>
                `;
                row.onclick = () => {
                        let pretty = req.response;
                        try {
                            const json = JSON.parse(req.response);
                            pretty = JSON.stringify(json, null, 2);
                        } catch(e) {}
                        const details = document.getElementById('wd-net-details');
                        if(details) details.textContent = pretty;
                };
                list.appendChild(row);
                list.scrollTop = list.scrollHeight;
            }
        });
    }

    const style = document.createElement('style');
    style.id = 'wd-hub-style';
    style.textContent = `
        /* Dock Container */
        #${ID_HUB_DOCK} {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 15, 19, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 8px 16px;
            display: flex;
            gap: 12px;
            z-index: 2147483647;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            animation: wdDockSlideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes wdDockSlideUp { from { transform: translate(-50%, 100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

        #${ID_HUB_DOCK}:hover {
            transform: translateX(-50%) scale(1.02);
            background: rgba(15, 15, 19, 0.85);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 15px 50px rgba(0,0,0,0.5);
        }

        /* Dock Icons */
        .wd-dock-item {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;
            background: rgba(255,255,255,0.05);
            color: #fff;
        }
        .wd-dock-item:hover {
            transform: translateY(-5px) scale(1.1);
            background: rgba(255,255,255,0.15);
        }
        .wd-dock-item.active {
            box-shadow: 0 0 15px currentColor;
        }
        .wd-dock-tooltip {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #000;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            white-space: nowrap;
        }
        .wd-dock-item:hover .wd-dock-tooltip { opacity: 1; }

        /* Dashboard Overlay */
        #${ID_HUB_DASHBOARD} {
            position: fixed;
            inset: 40px;
            background: rgba(10, 10, 14, 0.95);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.1);
            z-index: 2147483646;
            display: none;
            opacity: 0;
            transform: scale(0.95);
            transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            overflow: hidden;
            display: grid;
            grid-template-columns: 240px 1fr;
            box-shadow: 0 0 100px rgba(0,0,0,0.8);
        }
        #${ID_HUB_DASHBOARD}.open {
            opacity: 1;
            transform: scale(1);
        }

        /* Sidebar */
        .wd-sidebar {
            border-right: 1px solid rgba(255,255,255,0.08);
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .wd-brand {
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            color: #fff;
        }
        .wd-nav-item {
            padding: 10px 12px;
            border-radius: 8px;
            color: #a0a0ba;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .wd-nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .wd-nav-item.active { background: #6c5ce7; color: #fff; }

        /* Content Area */
        .wd-main {
            padding: 32px;
            overflow-y: auto;
            color: #fff;
            font-family: 'Inter', sans-serif;
        }
        .wd-hero {
            text-align: center;
            margin-top: 10vh;
        }
        .wd-hero h1 {
            font-size: 48px;
            background: linear-gradient(135deg, #fff 0%, #a0a0ba 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
        }
        .wd-hero p { color: #888; font-size: 16px; max-width: 400px; margin: 0 auto; }
        
        /* Grid for Apps */
        .wd-app-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        .wd-app-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .wd-app-card:hover {
            background: rgba(255,255,255,0.06);
            transform: translateY(-4px);
            border-color: rgba(255,255,255,0.1);
        }
        .wd-app-icon { font-size: 32px; margin-bottom: 12px; }
        .wd-app-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .wd-app-desc { font-size: 11px; color: #888; }

        /* Close Button */
        .wd-close-dashboard {
            position: absolute; top: 20px; right: 20px;
            width: 32px; height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s;
        }
        .wd-close-dashboard:hover { background: rgba(255,71,87,0.8); }
    `;
    document.head.appendChild(style);

    // --- Dock UI ---
    const dock = document.createElement('div');
    dock.id = ID_HUB_DOCK;
    
    // Dock Items Config
    const dockItems = [
        { id: 'home', icon: '⚡', label: 'Hub' },
        { id: 'pixel', icon: '🎨', label: 'Design Studio', bg: '#6c5ce7' },
        { id: 'inspector', icon: '🔍', label: 'Inspector', bg: '#0984e3' },
        { id: 'network', icon: '🌐', label: 'Network Studio', bg: '#00b894' },
        { id: 'privacy', icon: '🛡️', label: 'Privacy', bg: '#d63031' }
    ];

    dockItems.forEach(item => {
        const btn = document.createElement('div');
        btn.className = 'wd-dock-item';
        btn.innerHTML = `${item.icon}<div class="wd-dock-tooltip">${item.label}</div>`;
        if(item.bg) btn.style.setProperty('--hover-color', item.bg);
        
        btn.onclick = () => {
            if (item.id === 'home') toggleDashboard();
            else {
                // For now, toggle dashboard and navigate to section
                openDashboard(item.id);
            }
        };
        dock.appendChild(btn);
    });

    document.body.appendChild(dock);

    // --- Dashboard UI ---
    const dashboard = document.createElement('div');
    dashboard.id = ID_HUB_DASHBOARD;
    dashboard.innerHTML = `
        <div class="wd-sidebar">
            <div class="wd-brand">⚡ DevLens</div>
            <div class="wd-nav-item active" data-tab="overview">🏠 Overview</div>
            <div class="wd-nav-item" data-tab="pixel">🎨 Design Studio</div>
            <div class="wd-nav-item" data-tab="inspector">🔍 Deep Inspector</div>
            <div class="wd-nav-item" data-tab="network">🌐 Network Studio</div>
            <div class="wd-nav-item" data-tab="privacy">🛡️ Network & Privacy</div>
            <div class="wd-nav-item" data-tab="settings">⚙️ Settings</div>
        </div>
        <div class="wd-main" id="wd-hub-content">
            <!-- Content Injected Here -->
        </div>
        <div class="wd-close-dashboard" id="wd-close-hub">✕</div>
    `;
    document.body.appendChild(dashboard);

    // --- Logic ---
    let isDashboardOpen = false;
    const contentArea = dashboard.querySelector('#wd-hub-content');
    const closeBtn = dashboard.querySelector('#wd-close-hub');
    const navItems = dashboard.querySelectorAll('.wd-nav-item');

    function toggleDashboard() {
        if (isDashboardOpen) closeDashboard();
        else openDashboard('overview');
    }

    function openDashboard(tabId = 'overview') {
        dashboard.style.display = 'grid';
        // Force reflow
        dashboard.offsetHeight;
        dashboard.classList.add('open');
        isDashboardOpen = true;
        
        // Hide dock while dashboard is huge? Or keep it?
        // Let's keep dock for fast switching if z-index is managed via stacking context interaction or just hide it.
        dock.style.transform = 'translate(-50%, 100px)'; // Hide dock

        loadTab(tabId);
    }

    function closeDashboard() {
        dashboard.classList.remove('open');
        setTimeout(() => {
            dashboard.style.display = 'none';
        }, 300);
        isDashboardOpen = false;
        dock.style.transform = 'translate(-50%, 0)'; // Show dock
    }

    closeBtn.onclick = closeDashboard;

    // Navigation Logic
    navItems.forEach(nav => {
        nav.onclick = () => {
            navItems.forEach(n => n.classList.remove('active'));
            nav.classList.add('active');
            loadTab(nav.dataset.tab);
        };
    });

    function loadTab(tab) {
        // Update Nav State
        navItems.forEach(n => {
            if (n.dataset.tab === tab) n.classList.add('active');
            else n.classList.remove('active');
        });

        contentArea.innerHTML = '';

        if (tab === 'overview') {
            contentArea.innerHTML = `
                <div class="wd-hero">
                    <h1>Welcome to DevLens Hub</h1>
                    <p>Your ultimate command center for web development, design, and privacy auditing.</p>
                </div>
                <div class="wd-app-grid">
                    <div class="wd-app-card" onclick="document.querySelector('[data-tab=pixel]').click()">
                        <div class="wd-app-icon">🎨</div>
                        <div class="wd-app-title">Design Studio Ultimate</div>
                        <div class="wd-app-desc">Visual Editor, Fonts, Palette.</div>
                    </div>
                    <div class="wd-app-card" onclick="document.querySelector('[data-tab=inspector]').click()">
                        <div class="wd-app-icon">🔍</div>
                        <div class="wd-app-title">Deep Inspector</div>
                        <div class="wd-app-desc">Tech Stack, Storage, Web Vitals.</div>
                    </div>
                    <div class="wd-app-card" onclick="document.querySelector('[data-tab=privacy]').click()">
                        <div class="wd-app-icon">🛡️</div>
                        <div class="wd-app-title">Privacy Radar</div>
                        <div class="wd-app-desc">Trust Score & Tracker Blocking.</div>
                    </div>
                </div>
            `;
        } else if (tab === 'pixel') {
            // --- DESIGN STUDIO ULTIMATE ---
            contentArea.innerHTML = `
                <div class="wd-toolbar">
                    <h2>🎨 Design Studio Ultimate</h2>
                    <button class="wd-btn" id="wd-pixel-start">Start Inspector</button>
                    <span id="wd-pixel-status" style="margin-left:10px; font-size:12px; color:#888;">Inactive</span>
                </div>
                
                <div class="wd-panel-grid" style="grid-template-columns: 1fr 1fr;">
                    
                    <!-- EDITOR COLUMN -->
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        
                        <!-- Visual Editor -->
                        <div class="wd-panel">
                            <h3>Visual Editor <span id="wd-sel-tag" style="color:#6c5ce7; font-size:12px;">(Select Element)</span></h3>
                            <div id="wd-style-editor" style="display:none;">
                                <!-- Spacing -->
                                <div class="wd-control-group">
                                    <label>Dimensions</label>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                                        <input type="text" placeholder="Width" data-prop="width">
                                        <input type="text" placeholder="Height" data-prop="height">
                                    </div>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px;">
                                        <input type="text" placeholder="Margin" data-prop="margin">
                                        <input type="text" placeholder="Padding" data-prop="padding">
                                    </div>
                                </div>

                                <!-- Typography -->
                                <div class="wd-control-group" style="margin-top:16px;">
                                    <label>Typography</label>
                                    <div style="display:flex; gap:8px; margin-bottom:8px;">
                                        <input type="color" data-prop="color" style="width:30px; height:30px; padding:0; border:none; background:none;" title="Text Color">
                                        <input type="text" placeholder="Size (px)" data-prop="fontSize" style="width:60px;">
                                        <select id="wd-font-select" style="flex:1; background:#333; color:#fff; border:1px solid #444; border-radius:4px;">
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
                                    <div style="display:flex; gap:8px;">
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
                                    <label>Layout (Flex)</label>
                                    <div style="display:flex; gap:8px; margin-bottom:8px;">
                                        <button class="wd-btn-sm" onclick="window.DevLens.PixelStudio.applyStyle('display','flex')">Make Flex</button>
                                        <button class="wd-btn-sm" onclick="window.DevLens.PixelStudio.applyStyle('display','grid')">Make Grid</button>
                                    </div>
                                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                                        <button class="wd-btn-icon" title="Justify Start" onclick="window.DevLens.PixelStudio.applyStyle('justifyContent','flex-start')">├</button>
                                        <button class="wd-btn-icon" title="Justify Center" onclick="window.DevLens.PixelStudio.applyStyle('justifyContent','center')">┼</button>
                                        <button class="wd-btn-icon" title="Justify End" onclick="window.DevLens.PixelStudio.applyStyle('justifyContent','flex-end')">┤</button>
                                        <button class="wd-btn-icon" title="Justify Between" onclick="window.DevLens.PixelStudio.applyStyle('justifyContent','space-between')">|||</button>
                                        <button class="wd-btn-icon" title="Align Center" onclick="window.DevLens.PixelStudio.applyStyle('alignItems','center')">✛</button>
                                    </div>
                                </div>
                            </div>
                            <div id="wd-style-placeholder" style="color:#666; font-style:italic; padding:20px 0;">
                                Click an element on the page to start designing.
                            </div>
                        </div>
                    </div>

                    <!-- ASSETS & PALETTE COLUMN -->
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        
                        <!-- Palette Generator -->
                        <div class="wd-panel">
                             <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <h3>Site Palette</h3>
                                <button class="wd-btn small" id="wd-scan-colors">Scan</button>
                             </div>
                             <div id="wd-palette-grid" style="display:flex; flex-wrap:wrap; gap:8px;">
                                 <em style="color:#666; font-size:12px">Click 'Scan' to generate.</em>
                             </div>
                        </div>

                        <!-- Assets -->
                        <div class="wd-panel" style="flex:1; display:flex; flex-direction:column;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <h3>Assets <span id="wd-asset-count" style="font-size: 11px; color:#666"></span></h3>
                            </div>
                            <!-- Toolbar injected by previous step here -->
                             <div class="wd-asset-toolbar" style="margin-bottom:10px;">
                                <button class="wd-btn small" id="wd-asset-dl-all">Download Selected (0)</button>
                             </div>
                            
                            <div id="wd-asset-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; overflow-y: auto;"></div>
                        </div>
                    </div>

                </div>
                <style>
                    .wd-control-group label { display:block; color:#888; font-size:11px; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px; }
                    .wd-control-group input { background: #222; border: 1px solid #444; color: #fff; padding: 6px; border-radius: 4px; font-size:12px; width:100%; box-sizing:border-box; }
                    .wd-btn-icon { background:#333; border:1px solid #444; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; }
                    .wd-btn-icon:hover { background:#444; }
                    .wd-btn-sm { background:#6c5ce7; border:none; color:#fff; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px; }
                </style>
            `;

            if (window.DevLens && window.DevLens.PixelStudio) {
                // Asset Scan
                const assets = window.DevLens.PixelStudio.scanAssets();
                
                // Asset Logic (Re-implementing bulk logic since we overwrote HTML)
                const grid = contentArea.querySelector('#wd-asset-grid');
                contentArea.querySelector('#wd-asset-count').textContent = `(${assets.length} found)`;
                const selected = new Set();
                const btnDl = contentArea.querySelector('#wd-asset-dl-all');

                const updateBtn = () => {
                    btnDl.textContent = `Download Selected (${selected.size})`;
                    btnDl.style.opacity = selected.size > 0 ? '1' : '0.5';
                };

                btnDl.onclick = () => {
                   if (selected.size === 0) return;
                   const urls = Array.from(selected);
                   chrome.runtime.sendMessage({ action: 'downloadAssets', urls: urls });
                   alert(`Downloading ${selected.size} assets...`);
                   selected.clear();
                   updateBtn();
                   grid.querySelectorAll('img.selected').forEach(i => i.classList.remove('selected'));
                };

                assets.forEach(a => {
                    const container = document.createElement('div');
                    container.style.position = 'relative'; 
                    const img = document.createElement('img');
                    img.src = a.src;
                    img.style.width = '100%'; img.style.height = '60px'; img.style.objectFit = 'contain'; img.style.background = '#000'; img.style.borderRadius = '4px'; img.style.border = '1px solid #333'; img.style.cursor = 'pointer';
                    img.onclick = () => {
                        if (selected.has(a.src)) {
                            selected.delete(a.src);
                            img.style.borderColor = '#333'; img.style.transform = 'scale(1)'; img.classList.remove('selected');
                        } else {
                            selected.add(a.src);
                            img.style.borderColor = '#6c5ce7'; img.style.transform = 'scale(0.95)'; img.classList.add('selected');
                        }
                        updateBtn();
                    };
                    container.appendChild(img);
                    grid.appendChild(container);
                });

                // Palette Logic
                const btnScan = contentArea.querySelector('#wd-scan-colors');
                const pGrid = contentArea.querySelector('#wd-palette-grid');
                btnScan.onclick = () => {
                     btnScan.textContent = 'Scanning...';
                     // Small delay to render text
                     setTimeout(() => {
                         const colors = window.DevLens.PixelStudio.scanColors();
                         pGrid.innerHTML = '';
                         colors.forEach(c => {
                             const swatch = document.createElement('div');
                             swatch.title = `${c.color} (${c.count} uses)`;
                             Object.assign(swatch.style, { width:'32px', height:'32px', borderRadius:'50%', background:c.color, border:'2px solid rgba(255,255,255,0.1)', cursor:'pointer' });
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
                const btn = contentArea.querySelector('#wd-pixel-start');
                const status = contentArea.querySelector('#wd-pixel-status');
                const editor = contentArea.querySelector('#wd-style-editor');
                const placeholder = contentArea.querySelector('#wd-style-placeholder');
                const tagLabel = contentArea.querySelector('#wd-sel-tag');
                const fontSelect = contentArea.querySelector('#wd-font-select');
                
                // Font Swap
                fontSelect.onchange = () => {
                     window.DevLens.PixelStudio.loadGoogleFont(fontSelect.value);
                };

                // Type Style Buttons
                editor.querySelectorAll('.wd-btn-icon[data-prop]').forEach(b => {
                    b.onclick = () => window.DevLens.PixelStudio.applyStyle(b.dataset.prop, b.dataset.val);
                });

                // Content Mode Toggle
                const btnEdit = contentArea.querySelector('#wd-text-edit-toggle');
                let isEditing = false;
                btnEdit.onclick = () => {
                    isEditing = !isEditing;
                    document.designMode = isEditing ? 'on' : 'off';
                    btnEdit.style.background = isEditing ? '#e17055' : '#333';
                    btnEdit.style.color = isEditing ? '#fff' : '#e17055';
                    if(isEditing) alert('Content Mode ON: You can now type anywhere on the page!');
                };

                // Selection Listener
                window.DevLens.PixelStudio.on('select', (data) => {
                    if(tab === 'pixel') {
                        if(dashboard.style.display === 'none') openDashboard('pixel');
                        placeholder.style.display = 'none';
                        editor.style.display = 'block';
                        tagLabel.textContent = `<${data.tagName}>`;
                        
                        // Populate Inputs
                        editor.querySelectorAll('input[data-prop]').forEach(inp => {
                            const prop = inp.dataset.prop;
                            if (inp.type === 'color') {
                                // Convert rgb to hex for input type=color? Or just rely on text input?
                                // input type=color needs hex. data.style.color is usually rgb.
                                // We'll skip complex conversion for now and rely on text inputs, 
                                // BUT I added a color input. Let's make it a text/color hybrid or just text for simplicity in this turn.
                            } else {
                                inp.value = data.style[prop] || '';
                            }
                            inp.oninput = () => window.DevLens.PixelStudio.applyStyle(prop, inp.value);
                        });
                    }
                });

                btn.onclick = () => {
                    if (btn.classList.contains('active')) {
                        window.DevLens.PixelStudio.disableInspector();
                        btn.classList.remove('active');
                        btn.textContent = 'Start Inspector';
                        status.textContent = 'Inactive';
                        dashboard.classList.remove('minimized'); 
                    } else {
                        closeDashboard(); 
                        window.DevLens.PixelStudio.enableInspector();
                        btn.classList.add('active');
                        btn.textContent = 'Stop Inspector';
                        status.textContent = 'active - CLICK to select';
                    }
                };
            }


        } else if (tab === 'inspector') {
             // --- DEEP INSPECTOR APP ---
             contentArea.innerHTML = `
                <h2>🔍 Deep Inspector</h2>
                <div class="wd-panel-grid" style="grid-template-columns: 1fr 2fr;">
                    <!-- Tech Stack -->
                    <div class="wd-panel">
                        <h3>Tech Stack</h3>
                        <div id="wd-stack-list" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;"></div>
                    </div>
                    <!-- Web Vitals -->
                    <div class="wd-panel">
                        <h3>Web Vitals (Live)</h3>
                        <div id="wd-vitals" style="display:flex; gap:20px; margin-top:10px;">
                            <div class="wd-vital"><div>LCP</div><span id="wd-lcp" style="color:#888">--</span></div>
                            <div class="wd-vital"><div>CLS</div><span id="wd-cls" style="color:#888">--</span></div>
                        </div>
                    </div>
                </div>
                
                <!-- Storage Explorer -->
                <div class="wd-panel" style="margin-top:20px;">
                    <h3>Storage Explorer</h3>
                    <div style="max-height: 300px; overflow-y:auto; margin-top:10px;">
                        <table style="width:100%; text-align:left; border-collapse: collapse; font-size:12px; color:#ccc;">
                            <thead><tr style="border-bottom:1px solid #444; color:#fff;">
                                <th style="padding:8px">Type</th>
                                <th style="padding:8px">Key</th>
                                <th style="padding:8px">Value</th>
                            </tr></thead>
                            <tbody id="wd-storage-table"></tbody>
                        </table>
                    </div>
                </div>
            `;
            
            if (window.DevLens && window.DevLens.Inspector) {
                // Stack
                const stack = window.DevLens.Inspector.scanTech();
                const stackList = contentArea.querySelector('#wd-stack-list');
                if(stack.length === 0) stackList.innerHTML = '<span style="color:#666">No framework detected</span>';
                stack.forEach(s => {
                    const chip = document.createElement('div');
                    chip.className = 'wd-stack-chip';
                    chip.innerHTML = `${s.icon} ${s.name}`;
                    Object.assign(chip.style, { background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'20px', fontSize:'12px' });
                    stackList.appendChild(chip);
                });

                // Vitals
                window.DevLens.Inspector.initVitals((metric) => {
                    try {
                        const el = contentArea.querySelector(`#wd-${metric.name.toLowerCase()}`);
                        if(el) {
                            el.textContent = typeof metric.value === 'number' ? metric.value.toFixed(3) : metric.value;
                            el.style.color = metric.rating === 'good' ? '#00b894' : '#ff7675';
                        }
                    } catch(e){}
                });

                // Storage
                const storage = window.DevLens.Inspector.scanStorage();
                const table = contentArea.querySelector('#wd-storage-table');
                storage.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #333';
                    tr.innerHTML = `
                        <td style="padding:8px; color:#a29bfe">${item.type}</td>
                        <td style="padding:8px; font-weight:500;">${item.key.substring(0,20)}</td>
                        <td style="padding:8px; color:#888; font-family:monospace;">${item.value.substring(0,40)}...</td>
                    `;
                    table.appendChild(tr);
                });
            }

        } else if (tab === 'network') {
            // --- NETWORK STUDIO PRO ---
            contentArea.innerHTML = `
                <div class="wd-toolbar">
                    <h2>🌐 Network Studio Pro</h2>
                    <button class="wd-btn small" id="wd-net-clear">Clear</button>
                    <span id="wd-net-status" style="margin-left:auto; font-size:12px; color:#666;">recording activity...</span>
                </div>
                <div class="wd-network-layout" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; height: calc(100% - 50px);">
                    <!-- Request List -->
                    <div class="wd-panel" style="overflow:hidden; display:flex; flex-direction:column; padding:0;">
                        <div style="padding:10px; border-bottom:1px solid #333; font-size:11px; font-weight:bold; color:#888; display:grid; grid-template-columns: 40px 50px 1fr 50px;">
                            <span>Stat</span><span>Meth</span><span>Name</span><span>Time</span>
                        </div>
                        <div id="wd-net-list" style="overflow-y:auto; flex:1;"></div>
                    </div>
                    
                    <!-- Details/JSON Viewer -->
                    <div class="wd-panel" style="overflow:hidden; display:flex; flex-direction:column;">
                         <h3 style="border-bottom:1px solid #333; padding-bottom:8px; margin-bottom:0;">Response</h3>
                         <div id="wd-net-details" style="overflow:auto; flex:1; padding-top:10px; font-family:monospace; font-size:12px; color:#a29bfe; white-space:pre-wrap;">
                             Select a request to view details.
                         </div>
                    </div>
                </div>
            `;
            
            if (window.DevLens && window.DevLens.Inspector) {
                const list = contentArea.querySelector('#wd-net-list');
                const details = contentArea.querySelector('#wd-net-details');
                const btnClear = contentArea.querySelector('#wd-net-clear');
                
                // Keep track of requests
                const requests = window.DevLens.NetworkLog || []; 

                const renderRow = (req) => {
                    const row = document.createElement('div');
                    Object.assign(row.style, {
                         display: 'grid', gridTemplateColumns: '40px 50px 1fr 50px', 
                         padding: '8px 10px', borderBottom: '1px solid #222', 
                         fontSize: '12px', cursor: 'pointer', color: '#ccc'
                    });
                    
                    const color = req.status >= 400 || req.status === 'ERR' ? '#ff7675' : '#00b894';
                    const name = req.url.split('/').pop().split('?')[0] || req.url;
                    
                    row.innerHTML = `
                        <span style="color:${color}">${req.status}</span>
                        <span style="font-weight:bold">${req.method}</span>
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${req.url}">${name}</span>
                        <span style="color:#888">${req.time}ms</span>
                    `;
                    
                    row.onclick = () => {
                        // Show Details
                        // Try parsing JSON
                        let pretty = req.response;
                        try {
                            const json = JSON.parse(req.response);
                            pretty = JSON.stringify(json, null, 2);
                        } catch(e) {}
                        details.textContent = pretty;
                    };
                    list.appendChild(row);
                };

                // Render existing
                requests.forEach(renderRow);

                // Listen for new (if we aren't already global listening somewhere)
                // Ideally, we listen once globally and push to array.
                // Let's attach a listener here just for UI updates if tab is open.
                // NOTE: We need a global storage for requests otherwise they disappear on tab switch.
            }

            // Bind Clear
            contentArea.querySelector('#wd-net-clear').onclick = () => {
                 window.DevLens.NetworkLog = [];
                 contentArea.querySelector('#wd-net-list').innerHTML = '';
                 contentArea.querySelector('#wd-net-details').textContent = 'Cleared.';
            };
        } else if (tab === 'privacy') {
            // ... (keep existing privacy code, simplified below for brevity or reuse) ...
            // Re-injecting previous Privacy Code for consistency
            contentArea.innerHTML = `
                <h2>🛡️ Privacy Radar</h2>
                <div class="wd-panel-grid" style="grid-template-columns: 1fr 1fr;">
                    <div class="wd-panel">
                        <h3>Trust Score</h3>
                        <div id="wd-trust-score" style="font-size: 48px; font-weight: 800; color: #00b894;">100</div>
                        <div style="color:#666; font-size:12px">Based on trackers & cookies</div>
                    </div>
                    <div class="wd-panel">
                        <h3>Network</h3>
                        <div id="wd-network-stats">Loading...</div>
                    </div>
                </div>
                <div class="wd-panel" style="margin-top:20px;">
                     <h3>Detected Trackers</h3>
                     <ul id="wd-tracker-list" style="list-style:none; padding:0; font-size:13px; color:#ccc;"></ul>
                </div>
            `;
             if (window.DevLens && window.DevLens.Inspector) {
                const privacy = window.DevLens.Inspector.scanPrivacy();
                const network = window.DevLens.Inspector.scanNetwork();
                const scoreEl = contentArea.querySelector('#wd-trust-score');
                scoreEl.textContent = privacy.score;
                if (privacy.score < 50) scoreEl.style.color = '#ff4757';
                else if (privacy.score < 80) scoreEl.style.color = '#ffa502';

                const list = contentArea.querySelector('#wd-tracker-list');
                if (privacy.trackers.length === 0) list.innerHTML = '<li>✅ No common trackers detected.</li>';
                else {
                    privacy.trackers.forEach(t => {
                        const li = document.createElement('li');
                        li.textContent = `⚠️ ${t.name}`;
                        li.style.marginBottom = '4px';
                        li.style.color = '#ff6b6b';
                        list.appendChild(li);
                    });
                }
                const netStats = contentArea.querySelector('#wd-network-stats');
                netStats.innerHTML = `
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12px;">
                        <div>Images: <span style="color:#fff">${network.img}</span></div>
                        <div>Fetch: <span style="color:#fff">${network.fetch}</span></div>
                    </div>
                `;
            }

        } else if (tab === 'settings') {
             contentArea.innerHTML = `<h1>Settings</h1><p>Version 2.0.0 (Deep Dive)</p>`;
        }
    }


    // Cleanup
    chrome.runtime.onMessage.addListener(function listener(message) {
        if (message.action === 'removeHub') {
            style.remove();
            dock.remove();
            dashboard.remove();
            chrome.runtime.onMessage.removeListener(listener);
        }
    });

})();
