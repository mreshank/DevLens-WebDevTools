(() => {
    window.DevLens = window.DevLens || {};
    window.DevLens.Renderers = window.DevLens.Renderers || {};

    const RENDERER_ID = 'DeepInspector';

    const render = (container) => {
        // Use tabs for Inspector too? 
        // Plan didn't explicitly say tabs for Inspector, just "Add Accessibility Scan".
        // But tabs might be cleaner. Let's stack them for now to keep it simple or use tabs if it gets crowded.
        // Let's use tabs since we have the utility now!
        
        const generalContent = `
             <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; margin-bottom:12px;">
                <h3 style="font-size:12px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">🛠️ Tech Stack</h3>
                <div id="wd-stack-list" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>

            <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
                <h3 style="font-size:12px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">⚡ Web Vitals</h3>
                <div id="wd-vitals" style="display:flex; gap:20px;">
                    <div class="wd-vital"><div style="font-size:10px; color:#888">LCP</div><span id="wd-lcp" style="color:#666; font-weight:bold; font-family:monospace;">--</span></div>
                    <div class="wd-vital"><div style="font-size:10px; color:#888">CLS</div><span id="wd-cls" style="color:#666; font-weight:bold; font-family:monospace;">--</span></div>
                    <div class="wd-vital"><div style="font-size:10px; color:#888">FID</div><span id="wd-fid" style="color:#666; font-weight:bold; font-family:monospace;">--</span></div>
                </div>
            </div>
        `;

        const storageContent = `
             <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; height:300px; display:flex; flex-direction:column;">
                <div style="flex:1; overflow-y:auto; background:rgba(0,0,0,0.2); border-radius:4px;">
                    <table style="width:100%; text-align:left; border-collapse: collapse; font-size:11px; color:#ccc;">
                        <thead><tr style="border-bottom:1px solid #444; color:#fff; position:sticky; top:0; background:#1e1e24;">
                            <th style="padding:6px">Type</th><th style="padding:6px">Key</th><th style="padding:6px">Value</th>
                        </tr></thead>
                        <tbody id="wd-storage-table"></tbody>
                    </table>
                </div>
                <button class="wd-btn small" id="wd-refresh-storage" style="margin-top:8px;">Refresh</button>
            </div>
        `;

        const auditContent = `
             <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; margin-bottom:12px;">
                <h3 style="font-size:12px; margin-bottom:10px;">Accessibility Check</h3>
                <div id="wd-a11y-list" style="display:flex; flex-direction:column; gap:4px; font-size:11px;">
                    <div>Scanning...</div>
                </div>
            </div>
            <div class="wd-panel" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
                <h3 style="font-size:12px; margin-bottom:10px;">SEO Metadata</h3>
                <div id="wd-seo-list" style="display:flex; flex-direction:column; gap:6px; font-size:11px; color:#ccc;"></div>
            </div>
        `;

        if (window.DevLens.UI && window.DevLens.UI.createTabs) {
             const tabs = window.DevLens.UI.createTabs('wd-insp', [
                { id: 'gen', label: 'Overview', content: generalContent },
                { id: 'stor', label: 'Storage', content: storageContent },
                { id: 'audit', label: 'Audit (New)', content: auditContent }
            ]);
            container.appendChild(tabs);
        } else {
            container.innerHTML = generalContent + storageContent + auditContent;
        }

        if (window.DevLens && window.DevLens.Inspector) {
            const Inspector = window.DevLens.Inspector;
            const $ = (sel) => container.querySelector(sel);

            // 1. General Logic
            const stack = Inspector.scanTech();
            const stackList = $('#wd-stack-list');
            if(stackList) {
                if(stack.length === 0) stackList.innerHTML = '<span style="color:#666; font-size:11px">No frameworks detected</span>';
                stack.forEach(s => {
                    const chip = document.createElement('div');
                    chip.innerHTML = `${s.icon} ${s.name}`;
                    Object.assign(chip.style, { background:'rgba(255,255,255,0.1)', padding:'2px 8px', borderRadius:'12px', fontSize:'11px', color:'#fff' });
                    stackList.appendChild(chip);
                });
            }

            Inspector.initVitals((metric) => {
                try {
                    const el = $(`#wd-${metric.name.toLowerCase()}`);
                    if(el) {
                        el.textContent = typeof metric.value === 'number' ? metric.value.toFixed(3) : metric.value;
                        el.style.color = metric.rating === 'good' ? '#00b894' : '#ff7675';
                    }
                } catch(e){}
            });

            // 2. Storage Logic
            const refreshStorage = () => {
                const storage = Inspector.scanStorage();
                const table = $('#wd-storage-table');
                if(!table) return;
                table.innerHTML = '';
                if(storage.length === 0) table.innerHTML = '<tr><td colspan="3" style="padding:8px; text-align:center; color:#666">Empty</td></tr>';
                storage.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #333';
                    tr.innerHTML = `
                        <td style="padding:6px; color:#a29bfe">${item.type}</td>
                        <td style="padding:6px; font-weight:500;">${item.key.substring(0,10)}</td>
                        <td style="padding:6px; color:#888; font-family:monospace;">${item.value.substring(0,25)}...</td>
                    `;
                    table.appendChild(tr);
                });
            };
            refreshStorage();
            const btnRefresh = $('#wd-refresh-storage');
            if(btnRefresh) btnRefresh.onclick = refreshStorage;

            // 3. Audit Logic (A11y & SEO)
            const runAudit = () => {
                const a11yList = $('#wd-a11y-list');
                const seoList = $('#wd-seo-list');
                if(!a11yList || !seoList) return;

                // A11y
                const images = document.querySelectorAll('img');
                const missingAlt = Array.from(images).filter(img => !img.alt && !img.getAttribute('role') === 'presentation');
                const inputs = document.querySelectorAll('input');
                const missingLabel = Array.from(inputs).filter(i => !i.labels || i.labels.length === 0);
                
                a11yList.innerHTML = '';
                const addIssue = (msg, count) => {
                    const div = document.createElement('div');
                    div.innerHTML = `<span style="color:${count > 0 ? '#ff7675' : '#00b894'}">●</span> ${msg}: <strong>${count}</strong>`;
                    a11yList.appendChild(div);
                };
                addIssue('Images missing Alt', missingAlt.length);
                addIssue('Inputs missing Labels', missingLabel.length);
                
                // SEO
                seoList.innerHTML = '';
                const title = document.title || 'Missing Title';
                const desc = document.querySelector('meta[name="description"]')?.content || 'Missing Description';
                const h1 = document.querySelectorAll('h1').length;
                
                seoList.innerHTML = `
                    <div style="margin-bottom:4px;"><strong style="color:#a29bfe">Title:</strong> ${title.substring(0,40)}...</div>
                    <div style="margin-bottom:4px;"><strong style="color:#a29bfe">Desc:</strong> ${desc.substring(0,40)}...</div>
                    <div><strong style="color:#a29bfe">H1 Count:</strong> <span style="color:${h1===1 ? '#00b894' : '#fdcb6e'}">${h1}</span></div>
                `;
            };
            
            // Run audit once, maybe expose a refresh button later
            runAudit();
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
                    const { body } = window.DevLens.UI.createWindow(winId, 'Deep Inspector', '🔍', { width: '350px', height: '500px' });
                    render(body);
                }
            }
        }
    });

})();
