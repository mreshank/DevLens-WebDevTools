(() => {
    // Ensure namespace
    window.DevLens = window.DevLens || {};

    const PixelStudio = {
        state: {
            inspecting: false,
            selectedEl: null,
            callbacks: {}
        },

        on: (event, callback) => {
            PixelStudio.state.callbacks[event] = callback;
        },

        emit: (event, data) => {
            if (PixelStudio.state.callbacks[event]) PixelStudio.state.callbacks[event](data);
        },

        // --- Asset Extractor ---
        scanAssets: () => {
            const images = Array.from(document.images).map(img => ({
                type: 'image',
                src: img.src,
                width: img.naturalWidth,
                height: img.naturalHeight
            }));
            // Background images
            const allEls = document.querySelectorAll('*');
            allEls.forEach(el => {
                const bg = window.getComputedStyle(el).backgroundImage;
                if (bg && bg !== 'none' && bg.startsWith('url')) {
                    const src = bg.slice(5, -2).replace(/['"]/g, ''); 
                    if (src) images.push({ type: 'bg', src: src, width: 0, height: 0 });
                }
            });
            // SVGs
            const svgs = Array.from(document.querySelectorAll('svg')).map((svg) => {
                const serializer = new XMLSerializer();
                const source = serializer.serializeToString(svg);
                const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
                return { type: 'svg', src: src, width: svg.clientWidth, height: svg.clientHeight };
            });
            return [...new Map([...images, ...svgs].map(item => [item.src, item])).values()];
        },

        // --- Inspector Core ---
        enableInspector: () => {
            if (PixelStudio.state.inspecting) return;
            PixelStudio.state.inspecting = true;
            
            // Create Box Model Overlays
            const overlay = document.createElement('div');
            overlay.id = 'wd-box-model-overlay';
            Object.assign(overlay.style, {
                position: 'fixed', pointerEvents: 'none', zIndex: '2147483640', top: '0', left: '0', width: '0', height: '0'
            });

            // Layers
            const createLayer = (color) => {
                const div = document.createElement('div');
                Object.assign(div.style, { position: 'absolute', background: color, display:'none' });
                overlay.appendChild(div);
                return div;
            };

            const marginLayer = createLayer('rgba(255, 159, 67, 0.5)'); // Orange
            const borderLayer = createLayer('rgba(254, 202, 87, 0.5)'); // Yellow
            const paddingLayer = createLayer('rgba(29, 209, 161, 0.5)'); // Green
            const contentLayer = createLayer('rgba(84, 160, 255, 0.5)'); // Blue
            
            // Info Label
            const label = document.createElement('div');
            Object.assign(label.style, {
                position: 'absolute', background: '#000', color: '#fff', padding: '4px 8px', 
                borderRadius: '4px', fontSize: '11px', pointerEvents: 'none', zIndex: '2147483641',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)', whiteSpace: 'nowrap'
            });
            document.body.appendChild(overlay);
            document.body.appendChild(label);

            const updateHighlight = (el) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                
                const getVal = (prop) => parseFloat(style[prop]) || 0;
                
                const mt = getVal('marginTop');
                const mr = getVal('marginRight');
                const mb = getVal('marginBottom');
                const ml = getVal('marginLeft');
                
                const bt = getVal('borderTopWidth');
                const br = getVal('borderRightWidth');
                const bb = getVal('borderBottomWidth');
                const bl = getVal('borderLeftWidth');
                
                const pt = getVal('paddingTop');
                const pr = getVal('paddingRight');
                const pb = getVal('paddingBottom');
                const pl = getVal('paddingLeft');

                // Helper to set geometry
                const setGeom = (layer, top, left, width, height) => {
                    layer.style.top = top + 'px';
                    layer.style.left = left + 'px';
                    layer.style.width = width + 'px';
                    layer.style.height = height + 'px';
                    layer.style.display = 'block';
                };

                // Margin (Outer)
                setGeom(marginLayer, rect.top - mt, rect.left - ml, rect.width + ml + mr, rect.height + mt + mb);
                // We fake the "hole" by stacking. Lower layers are larger.
                // Border
                setGeom(borderLayer, rect.top, rect.left, rect.width, rect.height);
                // Padding
                setGeom(paddingLayer, rect.top + bt, rect.left + bl, rect.width - bl - br, rect.height - bt - bb);
                // Content
                setGeom(contentLayer, rect.top + bt + pt, rect.left + bl + pl, rect.width - bl - br - pl - pr, rect.height - bt - bb - pt - pb);

                // --- Smart Guides (Distance to Viewport) ---
                if (!document.getElementById('wd-guide-lines')) {
                    const guideContainer = document.createElement('div');
                    guideContainer.id = 'wd-guide-lines';
                    Object.assign(guideContainer.style, { position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:'2147483639' });
                    overlay.appendChild(guideContainer);
                }
                const guides = overlay.querySelector('#wd-guide-lines');
                guides.innerHTML = ''; // Clear previous

                const createLine = (x, y, w, h, distText, isVert) => {
                    const line = document.createElement('div');
                    Object.assign(line.style, {
                        position: 'absolute', background: 'rgba(255, 107, 129, 0.6)', 
                        left: x+'px', top: y+'px', width: w+'px', height: h+'px'
                    });
                    
                    const label = document.createElement('div');
                    label.textContent = Math.round(distText) + 'px';
                    Object.assign(label.style, {
                        position: 'absolute', color: '#ff6b81', fontSize: '10px', fontWeight: 'bold',
                        background: 'rgba(0,0,0,0.7)', padding: '2px 4px', borderRadius: '4px'
                    });
                    
                    if (isVert) { // Vertical line
                        label.style.left = '4px'; label.style.top = '50%'; label.style.transform = 'translateY(-50%)';
                    } else { // Horizontal line
                        label.style.top = '-18px'; label.style.left = '50%'; label.style.transform = 'translateX(-50%)';
                    }
                    
                    line.appendChild(label);
                    guides.appendChild(line);
                };

                // Top Guide
                if (rect.top > 0) createLine(rect.left + rect.width/2, 0, 1, rect.top, rect.top, true);
                // Bottom Guide
                if (rect.bottom < window.innerHeight) createLine(rect.left + rect.width/2, rect.bottom, 1, window.innerHeight - rect.bottom, window.innerHeight - rect.bottom, true);
                // Left Guide
                if (rect.left > 0) createLine(0, rect.top + rect.height/2, rect.left, 1, rect.left, false);
                // Right Guide
                if (rect.right < window.innerWidth) createLine(rect.right, rect.top + rect.height/2, window.innerWidth - rect.right, 1, window.innerWidth - rect.right, false);


                // Label Position
                label.style.top = (rect.top - 30 < 0 ? rect.bottom + 10 : rect.top - 30) + 'px';
                label.style.left = rect.left + 'px';
                label.innerHTML = `<span style="color:#54a0ff">${el.tagName.toLowerCase()}</span> <span style="color:#888">|</span> ${Math.round(rect.width)} × ${Math.round(rect.height)}`;

                return {
                    tagName: el.tagName.toLowerCase(),
                    id: el.id,
                    classes: Array.from(el.classList),
                    rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
                    style: {
                        color: style.color,
                        background: style.backgroundColor,
                        fontSize: style.fontSize,
                        fontFamily: style.fontFamily,
                        margin: style.margin,
                        padding: style.padding,
                        border: style.border
                    },
                    computed: style
                };
            };

            const handler = (e) => {
                if (e.target.closest('#wd-hub-dashboard') || e.target.closest('#wd-hub-dock') || e.target.closest('#wd-box-model-overlay')) return;
                
                const data = updateHighlight(e.target);
                PixelStudio.emit('hover', data);
            };

            const clickHandler = (e) => {
                if (e.target.closest('#wd-hub-dashboard') || e.target.closest('#wd-hub-dock')) return;
                e.preventDefault();
                e.stopPropagation();
                
                // Select Element
                PixelStudio.state.selectedEl = e.target;
                
                // Stop Inspecting momentarily? Or just notify selection
                const data = updateHighlight(e.target);
                PixelStudio.emit('select', data);

                // Flash animation
                e.target.animate([
                    { outline: '4px solid #fff', outlineOffset: '-4px' },
                    { outline: '4px solid transparent', outlineOffset: '-4px' }
                ], { duration: 400 });
            };

            document.addEventListener('mouseover', handler, { capture: true });
            document.addEventListener('click', clickHandler, { capture: true });

            PixelStudio.cleanup = () => {
                document.removeEventListener('mouseover', handler, { capture: true });
                document.removeEventListener('click', clickHandler, { capture: true });
                if(overlay) overlay.remove();
                if(label) label.remove();
                PixelStudio.state.inspecting = false;
            };
        },

        disableInspector: () => {
            if (PixelStudio.cleanup) PixelStudio.cleanup();
        },

        applyStyle: (prop, value) => {
            if (PixelStudio.state.selectedEl) {
                PixelStudio.state.selectedEl.style[prop] = value;
            }
        },

        // --- Design Studio Ultimate ---
        scanColors: () => {
            const colorCounts = {};
            const addColor = (c) => {
                if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return;
                colorCounts[c] = (colorCounts[c] || 0) + 1;
            };

            const all = document.querySelectorAll('*');
            all.forEach(el => {
                const style = window.getComputedStyle(el);
                addColor(style.color);
                addColor(style.backgroundColor);
                addColor(style.borderColor);
            });

            // Sort by frequency
            return Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20) // Top 20
                .map(([color, count]) => ({ color, count }));
        },

        loadGoogleFont: (fontName) => {
            if (!fontName) return;
            const id = 'wd-google-font-' + fontName.replace(/\s+/g, '-').toLowerCase();
            if (!document.getElementById(id)) {
                const link = document.createElement('link');
                link.id = id;
                link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            // Apply to selected
            if (PixelStudio.state.selectedEl) {
                PixelStudio.state.selectedEl.style.fontFamily = `"${fontName}", sans-serif`;
            }
        }
    };

    window.DevLens.PixelStudio = PixelStudio;
})();
