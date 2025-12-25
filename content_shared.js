(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.UI = window.DevLens.UI || {};

    const ID_SHARED_STYLE = 'wd-shared-ui-style';
    
    // Glassmorphism & Common Styles
    if (!document.getElementById(ID_SHARED_STYLE)) {
        const style = document.createElement('style');
        style.id = ID_SHARED_STYLE;
        style.textContent = `
            .wd-window {
                position: fixed;
                top: 50px; left: 50px;
                width: 320px;
                background: rgba(15, 15, 19, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                z-index: 2147483647;
                display: flex; flex-direction: column;
                color: #fff; font-family: 'Inter', sans-serif;
                animation: wdWinFade 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                overflow: hidden;
            }
            .wd-window.minimized { height: 48px; width: 200px; overflow: hidden; }
            
            @keyframes wdWinFade { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

            .wd-win-header {
                padding: 12px 16px;
                background: rgba(255,255,255,0.03);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex; justify-content: space-between; align-items: center;
                cursor: grab;
                user-select: none;
            }
            .wd-win-header:active { cursor: grabbing; }
            
            .wd-win-title { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: #fff; }
            .wd-win-controls { display: flex; gap: 8px; }
            .wd-win-btn { 
                width: 24px; height: 24px; border-radius: 50%; 
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: all 0.2s; font-size: 12px;
                background: rgba(255,255,255,0.1); color: #ccc;
            }
            .wd-win-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
            .wd-win-btn.close:hover { background: #ff4757; }

            .wd-win-body {
                padding: 16px;
                overflow-y: auto;
                max-height: 80vh;
                font-size: 13px; color: #a0a0ba;
            }

            /* Utilities */
            .wd-btn { background: #6c5ce7; border: none; padding: 8px 16px; border-radius: 6px; color: #white; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; transition: all 0.2s; }
            .wd-btn:hover { background: #5f4dd0; transform: translateY(-1px); }
            .wd-btn.small { padding: 4px 10px; font-size: 11px; }
            
            .wd-control-group { margin-bottom: 12px; }
            .wd-control-group label { display: block; color: #888; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            .wd-input { width: 100%; background: #222; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 6px; font-size: 12px; }
            .wd-input:focus { border-color: #6c5ce7; outline: none; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Creates a standard floating window
     * @param {string} id - Unique ID for the container
     * @param {string} title - Title text
     * @param {string} icon - Icon character
     * @param {Object} options - { width, height, onClose, onMinimize }
     */
    window.DevLens.UI.createWindow = (id, title, icon, options = {}) => {
        if (document.getElementById(id)) return document.getElementById(id); // Return existing

        const win = document.createElement('div');
        win.id = id;
        win.className = 'wd-window';
        if (options.width) win.style.width = options.width;
        if (options.height) win.style.height = options.height;

        win.innerHTML = `
            <div class="wd-win-header">
                <div class="wd-win-title"><span>${icon}</span> ${title}</div>
                <div class="wd-win-controls">
                    <div class="wd-win-btn minimize">_</div>
                    <div class="wd-win-btn close">×</div>
                </div>
            </div>
            <div class="wd-win-body" id="${id}-body"></div>
        `;

        document.body.appendChild(win);

        // Events
        const header = win.querySelector('.wd-win-header');
        const closeBtn = win.querySelector('.close');
        const minBtn = win.querySelector('.minimize');
        const body = win.querySelector('.wd-win-body');

        closeBtn.onclick = () => {
            if (options.onClose) options.onClose();
            win.remove();
        };

        minBtn.onclick = () => {
             win.classList.toggle('minimized');
             if (options.onMinimize) options.onMinimize(win.classList.contains('minimized'));
        };

        // Standard Drag Logic
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.onmousedown = (e) => {
            if(e.target.classList.contains('wd-win-btn')) return;
            isDragging = true;
            const rect = win.getBoundingClientRect();
            // We need to use offset from clientX/Y to the element's top-left to allow dragging from any point in header
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            
            // Remove any fixed positioning that might interfere if we want pure manual
            win.style.transform = 'none'; 
            win.style.animation = 'none';
        };

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            win.style.left = (e.clientX - startX) + 'px';
            win.style.top = (e.clientY - startY) + 'px';
            win.style.right = 'auto'; 
            win.style.bottom = 'auto';
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        return { container: win, body: body };
    };

    /**
     * Creates a tabbed interface.
     * @param {string} idPrefix - Prefix for IDs
     * @param {Array<{id:string, label:string, content:string|HTMLElement}>} tabs 
     * @returns {HTMLElement} The tabs container
     */
    window.DevLens.UI.createTabs = (idPrefix, tabs) => {
        const container = document.createElement('div');
        container.className = 'wd-tabs-container';
        
        // Header
        const header = document.createElement('div');
        header.className = 'wd-tabs-header';
        header.style.cssText = 'display:flex; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:16px; gap:2px;';
        
        // Content Wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'wd-tabs-content';

        tabs.forEach((tab, index) => {
            // Tab Button
            const btn = document.createElement('div');
            btn.className = `wd-tab-btn ${index === 0 ? 'active' : ''}`;
            btn.textContent = tab.label;
            btn.dataset.tab = tab.id;
            btn.style.cssText = `
                padding: 8px 12px; 
                font-size: 11px; 
                cursor: pointer; 
                color: ${index === 0 ? '#fff' : '#888'}; 
                border-bottom: 2px solid ${index === 0 ? '#6c5ce7' : 'transparent'};
                transition: all 0.2s;
            `;
            
            btn.onmouseover = () => { if(!btn.classList.contains('active')) btn.style.color = '#ccc'; };
            btn.onmouseout = () => { if(!btn.classList.contains('active')) btn.style.color = '#888'; };

            btn.onclick = () => {
                // Switch Tabs
                header.querySelectorAll('.wd-tab-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.color = '#888';
                    b.style.borderBottomColor = 'transparent';
                });
                btn.classList.add('active');
                btn.style.color = '#fff';
                btn.style.borderBottomColor = '#6c5ce7';

                contentWrapper.querySelectorAll('.wd-tab-pane').forEach(p => p.style.display = 'none');
                contentWrapper.querySelector(`#${idPrefix}-pane-${tab.id}`).style.display = 'block';
            };
            header.appendChild(btn);

            // Tab Pane
            const pane = document.createElement('div');
            pane.id = `${idPrefix}-pane-${tab.id}`;
            pane.className = 'wd-tab-pane';
            pane.style.display = index === 0 ? 'block' : 'none';
            
            if (typeof tab.content === 'string') pane.innerHTML = tab.content;
            else pane.appendChild(tab.content);
            
            contentWrapper.appendChild(pane);
        });

        container.appendChild(header);
        container.appendChild(contentWrapper);
        return container;
    };

})();

