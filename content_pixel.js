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
        }
    };

    window.DevLens.PixelStudio = PixelStudio;
})();
