(() => {
    const ID_HUB_DOCK = 'wd-hub-dock';
    const ID_HUB_DASHBOARD = 'wd-hub-dashboard';
    const ID_HUB_STYLE = 'wd-hub-style';

    window.DevLens = window.DevLens || {};

    const initHub = () => {
        if (document.getElementById(ID_HUB_DOCK)) return; // Already exists

        // --- Styles ---
        // Start Network Spy (Logic can remain global, just ensure it's on)
        if (window.DevLens.Inspector && window.DevLens.Inspector.enableNetworkSpy) {
            window.DevLens.NetworkLog = window.DevLens.NetworkLog || [];
            window.DevLens.Inspector.enableNetworkSpy();
            // Ensure we don't double-bind listeners if possible, 
            // but Inspector.onNetworkRequest usually allows multiple or we just rely on existing.
        }

        if (!document.getElementById(ID_HUB_STYLE)) {
            const style = document.createElement('style');
            style.id = ID_HUB_STYLE;
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
        }

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
            dashboard.offsetHeight; // force reflow
            dashboard.classList.add('open');
            isDashboardOpen = true;
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
            navItems.forEach(n => {
                if (n.dataset.tab === tab) n.classList.add('active');
                else n.classList.remove('active');
            });

            contentArea.innerHTML = '';
            const Renderers = window.DevLens.Renderers || {};

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
                if (Renderers.DesignStudio) Renderers.DesignStudio(contentArea);
                else contentArea.innerHTML = 'Error: Design Studio module not loaded.';
            } else if (tab === 'inspector') {
                if (Renderers.DeepInspector) Renderers.DeepInspector(contentArea);
                else contentArea.innerHTML = 'Error: Deep Inspector module not loaded.';
            } else if (tab === 'network') {
                if (Renderers.NetworkStudio) Renderers.NetworkStudio(contentArea);
                else contentArea.innerHTML = 'Error: Network Studio module not loaded.';
            } else if (tab === 'privacy') {
                if (Renderers.PrivacyStudio) Renderers.PrivacyStudio(contentArea);
                else contentArea.innerHTML = 'Error: Privacy Studio module not loaded.';
            } else if (tab === 'settings') {
                 contentArea.innerHTML = `<h1>Settings</h1><p>Version 2.0.0 (Island Mode)</p>`;
            }
        }
    };

    // Auto-init on load if desired (but we can wait for message if we want to be stealthy)
    // Manifest 'run_at': 'document_end' means it runs.
    // If we want it ON by default (as per Island Mode), we should init.
    // However, if the user toggled it OFF in popup, we shouldn't show the dock.
    // But content scripts run regardless of popup state usually unless we check storage.
    
    // We can check storage before init.
    chrome.storage.local.get(['islandMode'], (result) => {
        if (result.islandMode !== false) { // Default true
            initHub();
        }
    });

    // Cleanup & Toggle Listener
    chrome.runtime.onMessage.addListener(function listener(message) {
        if (message.action === 'removeHub') {
            const dock = document.getElementById(ID_HUB_DOCK);
            const dash = document.getElementById(ID_HUB_DASHBOARD);
            if(dock) dock.remove();
            if(dash) dash.remove();
            // We usually don't remove style unless we are sure no other tools need it? 
            // Hub style is specific to hub.
            const style = document.getElementById(ID_HUB_STYLE);
            if(style) style.remove();
        } else if (message.action === 'openHub') {
            initHub();
            // If already exists, initHub returns early, so we need to ensure dashboard opens if just clicked from popup
            setTimeout(() => {
                // Access internal function via variable isn't possible from here easily since inside closure?
                // We need to expose openDashboard or click logic.
                // Re-query elements
                 const dock = document.getElementById(ID_HUB_DOCK);
                 if(dock) {
                     // Simulate click on Home? Or just call logic if we exposed it.
                     // Since we can't expose easily without namespace, let's just create a global helper or simulate click.
                     // Or better: make initHub idempotent and open dashboard.
                     // BUT initHub() returns early.
                     // Quick hack: click the dock home button if it exists.
                     const homeBtn = dock.querySelector('.wd-dock-item'); // First item is Home
                     if(homeBtn) homeBtn.click();
                 }
            }, 100);
        }
    });

})();
