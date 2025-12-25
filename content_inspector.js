(() => {
    // Ensure namespace
    window.DevLens = window.DevLens || {};

    const Inspector = {
        
        // --- Tech Stack ---
        scanTech: () => {
            const stack = [];
            
            // Check Globals
            if (window.React || document.querySelector('[data-reactroot], [data-reactid]')) stack.push({ name: 'React', icon: '⚛️' });
            if (window.Vue || document.querySelector('[data-v-]')) stack.push({ name: 'Vue.js', icon: '🟢' });
            if (window.angular || document.querySelector('.ng-binding, [ng-app], [data-ng-app]')) stack.push({ name: 'Angular', icon: '🅰️' });
            if (window.jQuery || window.$) stack.push({ name: 'jQuery', icon: '💲' });
            if (window.gsap) stack.push({ name: 'GSAP', icon: '🎭' });
            if (window.__NEXT_DATA__) stack.push({ name: 'Next.js', icon: '▲' });
            if (window.__NUXT__) stack.push({ name: 'Nuxt.js', icon: '⛰️' });
            
            // Check Styles
            const styles = Array.from(document.styleSheets).flatMap(s => {
                try { return Array.from(s.cssRules).map(r => r.selectorText).join(' '); } catch(e){ return ''; }
            }).join(' ');
            if (styles.includes('tw-') || styles.includes('text-center') && styles.includes('flex')) stack.push({ name: 'Tailwind CSS', icon: '🌬️' });
            if (styles.includes('bootstrap')) stack.push({ name: 'Bootstrap', icon: '🅱️' });

            return [...new Set(stack.map(s => JSON.stringify(s)))].map(s => JSON.parse(s));
        },

        // --- Storage Explorer ---
        scanStorage: () => {
            const ls = Object.entries(localStorage).map(([k,v]) => ({ key: k, value: v, type: 'Local' }));
            const ss = Object.entries(sessionStorage).map(([k,v]) => ({ key: k, value: v, type: 'Session' }));
            const cookies = document.cookie.split(';').filter(c=>c.trim()).map(c => {
                const [k, v] = c.split('=');
                return { key: k.trim(), value: v, type: 'Cookie' };
            });
            return [...ls, ...ss, ...cookies];
        },

        setStorage: (type, key, value) => {
            if (type === 'Local') localStorage.setItem(key, value);
            else if (type === 'Session') sessionStorage.setItem(key, value);
            else if (type === 'Cookie') document.cookie = `${key}=${value}; path=/`;
        },

        deleteStorage: (type, key) => {
            if (type === 'Local') localStorage.removeItem(key);
            else if (type === 'Session') sessionStorage.removeItem(key);
            else if (type === 'Cookie') document.cookie = `${key}=; max-age=0; path=/`;
        },

        // --- Web Vitals ---
        initVitals: (cb) => {
            if (!window.PerformanceObserver) return;
            
            try {
                // LCP
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    cb({ name: 'LCP', value: lastEntry.startTime, rating: lastEntry.startTime < 2500 ? 'good' : 'poor' });
                }).observe({ type: 'largest-contentful-paint', buffered: true });

                // CLS
                let clsValue = 0;
                new PerformanceObserver((entryList) => {
                   for (const entry of entryList.getEntries()) {
                       if (!entry.hadRecentInput) clsValue += entry.value;
                   }
                   cb({ name: 'CLS', value: clsValue, rating: clsValue < 0.1 ? 'good' : 'poor' });
                }).observe({ type: 'layout-shift', buffered: true });
                
            } catch (e) { console.log('Vitals not supported'); }
        },

        // --- Privacy Radar ---
        scanPrivacy: () => {
            const scripts = Array.from(document.scripts);
            const trackers = [];
            const knownTrackers = [
                'google-analytics.com', 'googletagmanager.com', 'facebook.net', 'hotjar.com', 
                'doubleclick.net', 'criteo.com', 'fullstory.com', 'segment.io', 'tiktok.com'
            ];

            let score = 100;
            scripts.forEach(s => {
                if (s.src) {
                    const match = knownTrackers.find(t => s.src.includes(t));
                    if (match) {
                        trackers.push({ name: match, src: s.src });
                        score -= 10;
                    }
                }
            });
            const cookies = document.cookie.split(';').length;
            if (cookies > 0) score -= (cookies * 0.5); // penalty per cookie

            return {
                score: Math.max(0, Math.round(score)),
                trackers: trackers,
                cookieCount: cookies
            };
        },

        // --- SEO Scanner ---
        scanSEO: () => {
            const getMeta = (name) => {
                const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
                return el ? el.content : null;
            };
            return {
                title: document.title,
                description: getMeta('description') || getMeta('og:description') || 'Missing',
                image: getMeta('og:image'),
                url: getMeta('og:url') || window.location.href,
                h1: document.querySelector('h1') ? document.querySelector('h1').innerText : 'Missing H1',
            };
        },

        // --- Network Waterfall (Performance based) ---
        scanNetwork: () => {
            const resources = performance.getEntriesByType('resource');
            const stats = { total: resources.length, size: 0, js: 0, css: 0, img: 0, fetch: 0, other: 0 };

            resources.slice(-50).forEach(r => { 
                const size = r.transferSize || r.decodedBodySize || 0;
                stats.size += size;
                const ext = r.name.split('.').pop().split('?')[0].toLowerCase();
                if (['js', 'mjs'].includes(ext) || r.initiatorType === 'script') { stats.js++; }
                else if (['css'].includes(ext) || r.initiatorType === 'css') { stats.css++; }
                else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext) || r.initiatorType === 'img') { stats.img++; }
                else if (r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest') { stats.fetch++; }
                else stats.other++;
            });
            return stats;
        },

        // --- Network Studio Pro (Real-time Spy) ---
        enableNetworkSpy: () => {
             if (document.getElementById('wd-network-spy-script')) return;

             const script = document.createElement('script');
             script.id = 'wd-network-spy-script';
             script.textContent = `
                (() => {
                    const XHR = XMLHttpRequest.prototype;
                    const originalOpen = XHR.open;
                    const originalSend = XHR.send;
                    const originalFetch = window.fetch;

                    // Spy XHR
                    XHR.open = function(method, url) {
                        this._wd_method = method;
                        this._wd_url = url;
                        this._wd_startTime = Date.now();
                        return originalOpen.apply(this, arguments);
                    };

                    XHR.send = function(body) {
                        this.addEventListener('load', function() {
                            const time = Date.now() - this._wd_startTime;
                            window.postMessage({
                                source: 'wd-network-spy',
                                type: 'xhr',
                                method: this._wd_method,
                                url: this._wd_url,
                                status: this.status,
                                time: time,
                                response: this.responseType === '' || this.responseType === 'text' ? this.responseText : '[Blob/ArrayBuffer]'
                            }, '*');
                        });
                        return originalSend.apply(this, arguments);
                    };

                    // Spy Fetch
                    window.fetch = async (...args) => {
                        const startTime = Date.now();
                        const url = (args[0] && typeof args[0] === 'object') ? args[0].url : args[0];
                        const method = (args[1] && args[1].method) || 'GET';
                        
                        try {
                            const response = await originalFetch(...args);
                            const clone = response.clone();
                            
                            clone.text().then(text => {
                                window.postMessage({
                                    source: 'wd-network-spy',
                                    type: 'fetch',
                                    method: method,
                                    url: url,
                                    status: response.status,
                                    time: Date.now() - startTime,
                                    response: text
                                }, '*');
                            }).catch(() => {});

                            return response;
                        } catch (err) {
                            window.postMessage({
                                source: 'wd-network-spy',
                                type: 'fetch',
                                method: method,
                                url: url,
                                status: 'ERR',
                                time: Date.now() - startTime,
                                response: err.message
                            }, '*');
                            throw err;
                        }
                    };
                })();
             `;
             (document.head || document.documentElement).appendChild(script);
        },

        onNetworkRequest: (cb) => {
            window.addEventListener('message', (event) => {
                if (event.data && event.data.source === 'wd-network-spy') {
                    cb(event.data);
                }
            });
        }
    };

    window.DevLens.Inspector = Inspector;
})();
