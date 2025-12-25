(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.Renderers = window.DevLens.Renderers || {};

    const RENDERER_ID = 'PrivacyStudio';

    const render = (container) => {
        container.innerHTML = `
            <div class="wd-panel-grid" style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:flex; gap:16px;">
                    <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:16px; border-radius:8px; flex:1; text-align:center;">
                        <h3 style="font-size:12px; color:#888; margin-bottom:8px;">Trust Score</h3>
                        <div id="wd-trust-score" style="font-size: 36px; font-weight: 800; color: #00b894;">--</div>
                    </div>
                    <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:16px; border-radius:8px; flex:1;">
                        <h3 style="font-size:12px; color:#888; margin-bottom:8px;">Network Stats</h3>
                        <div id="wd-network-stats" style="font-size:12px;">Scanning...</div>
                    </div>
                </div>
                
                <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; flex:1; min-height:200px; display:flex; flex-direction:column;">
                     <h3 style="font-size:12px; margin-bottom:10px;">Detected Trackers</h3>
                     <ul id="wd-tracker-list" style="list-style:none; padding:0; font-size:12px; color:#ccc; overflow-y:auto; flex:1;"></ul>
                </div>
            </div>
        `;

        if (window.DevLens && window.DevLens.Inspector) {
            const Inspector = window.DevLens.Inspector;
            const privacy = Inspector.scanPrivacy();
            const network = Inspector.scanNetwork();
            
            const scoreEl = container.querySelector('#wd-trust-score');
            scoreEl.textContent = privacy.score;
            if (privacy.score < 50) scoreEl.style.color = '#ff4757';
            else if (privacy.score < 80) scoreEl.style.color = '#ffa502';

            const list = container.querySelector('#wd-tracker-list');
            if (privacy.trackers.length === 0) list.innerHTML = '<li style="color:#00b894">✅ No common trackers detected.</li>';
            else {
                privacy.trackers.forEach(t => {
                    const li = document.createElement('li');
                    li.textContent = `⚠️ ${t.name}`;
                    li.style.marginBottom = '6px';
                    li.style.color = '#ff6b6b';
                    li.style.borderBottom = '1px dashed #333';
                    li.style.paddingBottom = '4px';
                    list.appendChild(li);
                });
            }
            
            const netStats = container.querySelector('#wd-network-stats');
            netStats.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr; gap:4px;">
                    <div>Images: <span style="color:#fff; font-weight:bold;">${network.img}</span></div>
                    <div>Fetch/XHR: <span style="color:#fff; font-weight:bold;">${network.fetch}</span></div>
                    <div>Scripts: <span style="color:#fff; font-weight:bold;">${document.scripts.length}</span></div>
                </div>
            `;
        }
    };

    window.DevLens.Renderers[RENDERER_ID] = render;

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'togglePrivacyStudio') {
            const winId = 'wd-win-privacy-studio';
            if (document.getElementById(winId)) {
                document.getElementById(winId).remove();
            } else {
                if (window.DevLens.UI && window.DevLens.UI.createWindow) {
                    const { body } = window.DevLens.UI.createWindow(winId, 'Privacy Radar', '🛡️', { width: '300px', height: '400px' });
                    render(body);
                }
            }
        }
    });

})();
