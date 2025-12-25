(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.Renderers = window.DevLens.Renderers || {};

    const RENDERER_ID = 'NetworkStudio';

    const render = (container) => {
        container.innerHTML = `
            <div class="wd-toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h2 style="font-size:14px; margin:0;">🌐 Network Studio</h2>
                <div style="display:flex; gap:8px; align-items:center;">
                    <span id="wd-net-status" style="font-size:10px; color:#00b894;">● Recording</span>
                    <button class="wd-btn small" id="wd-net-clear">Clear</button>
                </div>
            </div>
            
            <div class="wd-network-layout" style="display:flex; flex-direction:column; gap:12px; height: calc(100% - 40px);">
                <!-- Request List -->
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); display:flex; flex-direction:column; height:200px; border-radius:8px; overflow:hidden;">
                    <div style="padding:8px 10px; border-bottom:1px solid #333; font-size:10px; font-weight:bold; color:#888; display:grid; grid-template-columns: 30px 40px 1fr 40px;">
                        <span>Sts</span><span>Meth</span><span>Name</span><span>Time</span>
                    </div>
                    <div id="wd-net-list" style="overflow-y:auto; flex:1;"></div>
                </div>
                
                <!-- Details Viewer -->
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); flex:1; display:flex; flex-direction:column; border-radius:8px; overflow:hidden; min-height:100px;">
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
            
            const requests = window.DevLens.NetworkLog || []; 

            const renderRow = (req) => {
                const row = document.createElement('div');
                Object.assign(row.style, {
                        display: 'grid', gridTemplateColumns: '30px 40px 1fr 40px', 
                        padding: '6px 10px', borderBottom: '1px solid #222', 
                        fontSize: '11px', cursor: 'pointer', color: '#ccc'
                });
                
                const color = req.status >= 400 || req.status === 'ERR' ? '#ff7675' : '#00b894';
                const name = req.url.split('/').pop().split('?')[0] || req.url.substring(0,20);
                
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
                    details.textContent = pretty;
                    // Highlight row logic if needed
                };
                list.appendChild(row);
            };

            requests.forEach(renderRow);

            // Live Updates
            // We hook into the same global listener if possible, or poll?
            // Existing implementation in Hub used a global listener on window.DevLens.Inspector.onNetworkRequest
            // We should ensure that callback supports multiple listeners or we chain them.
            // Simplified: We'll assume the Inspector handles multiple listeners or we'll wrap it.
            // Let's attach a new listener.
            if(window.DevLens.Inspector.onNetworkRequest) {
                 window.DevLens.Inspector.onNetworkRequest((req) => {
                     // Check if this container is still in DOM
                     if(!document.contains(list)) return;
                     renderRow(req);
                     // Scroll to bottom
                     list.scrollTop = list.scrollHeight;
                 });
            }

            btnClear.onclick = () => {
                    window.DevLens.NetworkLog = [];
                    list.innerHTML = '';
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
                    const { body } = window.DevLens.UI.createWindow(winId, 'Network Studio', '🌐', { width: '400px', height: '500px' });
                    render(body);
                }
            }
        }
    });
})();
