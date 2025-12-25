(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.Renderers = window.DevLens.Renderers || {};

    const RENDERER_ID = 'DeepInspector';

    const render = (container) => {
        container.innerHTML = `
            <div class="wd-panel-grid" style="display:flex; flex-direction:column; gap:16px;">
                <!-- Tech Stack -->
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
                    <h3 style="font-size:12px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">🛠️ Tech Stack</h3>
                    <div id="wd-stack-list" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                </div>

                <!-- Web Vitals -->
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
                    <h3 style="font-size:12px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">⚡ Web Vitals (Live)</h3>
                    <div id="wd-vitals" style="display:flex; gap:20px;">
                        <div class="wd-vital">
                            <div style="font-size:10px; color:#888">LCP</div>
                            <span id="wd-lcp" style="color:#666; font-weight:bold; font-family:monospace;">--</span>
                        </div>
                        <div class="wd-vital">
                            <div style="font-size:10px; color:#888">CLS</div>
                            <span id="wd-cls" style="color:#666; font-weight:bold; font-family:monospace;">--</span>
                        </div>
                        <div class="wd-vital">
                            <div style="font-size:10px; color:#888">FID</div>
                            <span id="wd-fid" style="color:#666; font-weight:bold; font-family:monospace;">--</span>
                        </div>
                    </div>
                </div>

                <!-- Storage Explorer -->
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; flex:1; display:flex; flex-direction:column;">
                    <h3 style="font-size:12px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">💾 Storage Explorer</h3>
                    <div style="flex:1; max-height: 200px; overflow-y:auto; background:rgba(0,0,0,0.2); border-radius:4px;">
                        <table style="width:100%; text-align:left; border-collapse: collapse; font-size:11px; color:#ccc;">
                            <thead><tr style="border-bottom:1px solid #444; color:#fff; position:sticky; top:0; background:#1e1e24;">
                                <th style="padding:6px">Type</th>
                                <th style="padding:6px">Key</th>
                                <th style="padding:6px">Value</th>
                            </tr></thead>
                            <tbody id="wd-storage-table"></tbody>
                        </table>
                    </div>
                    <button class="wd-btn small" id="wd-refresh-storage" style="margin-top:8px;">Refresh</button>
                </div>
            </div>
        `;

        if (window.DevLens && window.DevLens.Inspector) {
            const Inspector = window.DevLens.Inspector;
            const $ = (sel) => container.querySelector(sel);

            // Stack
            const stack = Inspector.scanTech();
            const stackList = $('#wd-stack-list');
            if(stack.length === 0) stackList.innerHTML = '<span style="color:#666; font-size:11px">No frameworks detected</span>';
            stack.forEach(s => {
                const chip = document.createElement('div');
                chip.innerHTML = `${s.icon} ${s.name}`;
                Object.assign(chip.style, { background:'rgba(255,255,255,0.1)', padding:'2px 8px', borderRadius:'12px', fontSize:'11px', color:'#fff' });
                stackList.appendChild(chip);
            });

            // Vitals
            Inspector.initVitals((metric) => {
                try {
                    const el = $(`#wd-${metric.name.toLowerCase()}`);
                    if(el) {
                        el.textContent = typeof metric.value === 'number' ? metric.value.toFixed(3) : metric.value;
                        el.style.color = metric.rating === 'good' ? '#00b894' : '#ff7675';
                    }
                } catch(e){}
            });

            // Storage
            const refreshStorage = () => {
                const storage = Inspector.scanStorage();
                const table = $('#wd-storage-table');
                table.innerHTML = '';
                if(storage.length === 0) table.innerHTML = '<tr><td colspan="3" style="padding:8px; text-align:center; color:#666">Empty</td></tr>';
                storage.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #333';
                    tr.innerHTML = `
                        <td style="padding:6px; color:#a29bfe">${item.type}</td>
                        <td style="padding:6px; font-weight:500;">${item.key.substring(0,15)}</td>
                        <td style="padding:6px; color:#888; font-family:monospace;">${item.value.substring(0,30)}...</td>
                    `;
                    table.appendChild(tr);
                });
            };
            refreshStorage();
            $('#wd-refresh-storage').onclick = refreshStorage;
        }
    };

    window.DevLens.Renderers[RENDERER_ID] = render;

    // Standalone Listener
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'toggleDeepInspector') {
            const winId = 'wd-win-deep-inspector';
            if (document.getElementById(winId)) {
                document.getElementById(winId).remove();
            } else {
                if (window.DevLens.UI && window.DevLens.UI.createWindow) {
                    const { body } = window.DevLens.UI.createWindow(winId, 'Deep Inspector', '🔍', { width: '320px', height: '450px' });
                    render(body);
                }
            }
        }
    });

})();
