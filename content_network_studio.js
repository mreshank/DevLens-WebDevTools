(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.Renderers = window.DevLens.Renderers || {};

    const RENDERER_ID = 'NetworkStudio';

    const render = (container) => {
        container.innerHTML = `
            <div class="wd-toolbar" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <h2 style="font-size:14px; margin:0;">🌐 Network Studio</h2>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <span id="wd-net-status" style="font-size:10px; color:#00b894;">● Live</span>
                        <button class="wd-btn small" id="wd-net-clear">Clear</button>
                    </div>
                </div>
                <div style="display:flex; gap:6px; width:100%;">
                    <input type="text" id="wd-net-search" class="wd-input" placeholder="Filter URL..." style="flex:1; padding:4px 8px; font-size:11px;">
                    <select id="wd-net-filter-type" class="wd-input" style="width:70px; padding:4px; font-size:11px;">
                        <option value="all">All</option>
                        <option value="xhr">XHR/Fetch</option>
                        <option value="js">JS</option>
                        <option value="css">CSS</option>
                        <option value="img">Img</option>
                    </select>
                </div>
            </div>
            
            <div class="wd-network-layout" style="display:flex; flex-direction:column; gap:12px; height: calc(100% - 70px);">
                <!-- Request List -->
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); display:flex; flex-direction:column; flex:1; border-radius:8px; overflow:hidden;">
                    <div style="padding:8px 10px; border-bottom:1px solid #333; font-size:10px; font-weight:bold; color:#888; display:grid; grid-template-columns: 30px 40px 1fr 40px;">
                        <span>Sts</span><span>Meth</span><span>Name</span><span>Time</span>
                    </div>
                    <div id="wd-net-list" style="overflow-y:auto; flex:1;"></div>
                </div>
                
                <!-- Details Viewer -->
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); height:150px; display:flex; flex-direction:column; border-radius:8px; overflow:hidden;">
                        <div style="padding:8px; border-bottom:1px solid #333; font-size:11px; color:#aaa; font-weight:600;">Response Details</div>
                        <div id="wd-net-details" style="overflow:auto; flex:1; padding:8px; font-family:monospace; font-size:11px; color:#a29bfe; white-space:pre-wrap;">
                            Click a request...
                        </div>
                </div>
            </div>
        `;

        if (window.DevLens && window.DevLens.Inspector) {
            const list = container.querySelector('#wd-net-list');
            const details = container.querySelector('#wd-net-details');
            const btnClear = container.querySelector('#wd-net-clear');
            const searchInput = container.querySelector('#wd-net-search');
            const typeSelect = container.querySelector('#wd-net-filter-type');
            
            // State
            let allRequests = window.DevLens.NetworkLog || []; 
            let filterText = '';
            let filterType = 'all';

            const getType = (req) => {
                // Heuristic type detection
                const url = req.url.toLowerCase();
                if (req.type === 'xmlhttprequest' || req.type === 'fetch') return 'xhr'; // if captured by spy
                if (url.endsWith('.js') || url.includes('.js?')) return 'js';
                if (url.endsWith('.css') || url.includes('.css?')) return 'css';
                if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)/)) return 'img';
                return 'other';
            };

            const refreshList = () => {
                list.innerHTML = '';
                const filtered = allRequests.filter(r => {
                    const matchText = r.url.toLowerCase().includes(filterText);
                    const type = getType(r);
                    const matchType = filterType === 'all' || 
                                     (filterType === 'xhr' && (type === 'xhr' || type === 'other')) || // Loose matching for XHR
                                      filterType === type;
                    return matchText && matchType;
                });

                filtered.forEach(req => {
                    const row = document.createElement('div');
                    Object.assign(row.style, {
                            display: 'grid', gridTemplateColumns: '30px 40px 1fr 40px', 
                            padding: '6px 10px', borderBottom: '1px solid #222', 
                            fontSize: '11px', cursor: 'pointer', color: '#ccc'
                    });
                    
                    const color = req.status >= 400 || req.status === 'ERR' ? '#ff7675' : '#00b894';
                    const name = req.url.split('/').pop().split('?')[0] || req.url.substring(0,25);
                    
                    row.innerHTML = `
                        <span style="color:${color}">${req.status}</span>
                        <span style="font-weight:bold">${req.method}</span>
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${req.url}">${name}</span>
                        <span style="color:#888">${req.time}</span>
                    `;
                    
                    row.onclick = () => {
                        let pretty = req.response;
                        try {
                            const json = JSON.parse(req.response);
                            pretty = JSON.stringify(json, null, 2);
                        } catch(e) {}
                        
                        // Truncate if massive
                        if(pretty && pretty.length > 50000) pretty = pretty.substring(0, 50000) + '... (Truncated)';
                        
                        details.innerHTML = `<div style="margin-bottom:8px; color:#fff; word-break:break-all;"><strong>URL:</strong> ${req.url}</div>` + pretty;
                        
                         // Highlight row
                         Array.from(list.children).forEach(c => c.style.background = 'transparent');
                         row.style.background = 'rgba(108, 92, 231, 0.2)';
                    };
                    list.appendChild(row);
                });
            };
            
            // Listeners
            searchInput.oninput = (e) => { filterText = e.target.value.toLowerCase(); refreshList(); };
            typeSelect.onchange = (e) => { filterType = e.target.value; refreshList(); };

            // Initial Render
            refreshList();

            // Live Updates
            if(window.DevLens.Inspector.onNetworkRequest) {
                 window.DevLens.Inspector.onNetworkRequest((req) => {
                     // We add to our local ref of global log?
                     // Actually Inspector callbacks might be triggered, but we need to push to our local allRequests if it refers to the same array reference in window.DevLens.NetworkLog
                     // Re-fetch reference just in case
                     allRequests = window.DevLens.NetworkLog || [];
                     
                     if(!document.contains(list)) return;
                     
                     // Optimization: Only render if matches
                     const matchText = req.url.toLowerCase().includes(filterText);
                     const type = getType(req);
                     const matchType = filterType === 'all' || (filterType === 'xhr' && (type === 'xhr' || type === 'other')) || filterType === type;
                     
                     if (matchText && matchType) {
                         refreshList(); // Full refresh is safest to keep sort order if we wanted, or just append. 
                         // For performance, let's just refresh for now as rate isn't massive usually.
                         list.scrollTop = list.scrollHeight;
                     }
                 });
            }

            btnClear.onclick = () => {
                    window.DevLens.NetworkLog = [];
                    allRequests = [];
                    refreshList();
                    details.textContent = 'Cleared.';
            };
        }
    };

    window.DevLens.Renderers[RENDERER_ID] = render;

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'toggleNetworkStudio') {
            const winId = 'wd-win-network-studio';
            if (document.getElementById(winId)) {
                document.getElementById(winId).remove();
            } else {
                if (window.DevLens.UI && window.DevLens.UI.createWindow) {
                    const { body } = window.DevLens.UI.createWindow(winId, 'Network Studio', '🌐', { width: '450px', height: '600px' });
                    render(body);
                }
            }
        }
    });
})();
