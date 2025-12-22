(() => {
    // Check if already exists
    if (document.getElementById('webdevtools-dimensions-overlay')) return;

    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.id = 'webdevtools-dimensions-overlay';
    
    // Style it (Glassmorphism & Premium feel)
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        width: 'auto',
        // minWidth: '180px',
        // padding: '12px 20px',
        // background: 'rgba(15, 15, 19, 0.85)',
        // backdropFilter: 'blur(12px)',
        // webkitBackdropFilter: 'blur(12px)',
        // border: '1px solid rgba(255, 255, 255, 0.15)',
        // borderRadius: '12px',
        // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: '2147483647', // Max z-index
        color: '#ffffff',
        fontWeight: '950',
        fontFamily: "'Inter', sans-serif",
        fontSize: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        cursor: 'move',
        transition: 'transform 0.1s ease',
        userSelect: 'none'
    });

    // // Content
    // const label = document.createElement('div');
    // label.textContent = 'Viewport Dimensions';
    // label.style.color = '#a0a0ba';
    // label.style.fontSize = '11px';
    // label.style.textTransform = 'uppercase';
    // label.style.letterSpacing = '1px';
    // label.style.fontWeight = '600';

    const value = document.createElement('div');
    // Gradient using Scarlet, Neon Red, Raspberry
    value.style.background = 'linear-gradient(90deg, #FF2400, #FF3131, #E30B5C)';
    value.style.webkitBackgroundClip = 'text';
    value.style.webkitTextFillColor = 'transparent';
    value.style.webkitTextStroke = '0.8px white'; // Added stroke as requested
    value.style.fontVariantNumeric = 'tabular-nums';
    value.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'; // Ensure visibility since background was removed

    // overlay.appendChild(label);
    overlay.appendChild(value);
    document.body.appendChild(overlay);

    // Update function
    const updateDimensions = () => {
        value.textContent = `${window.innerWidth} x ${window.innerHeight}`;
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Drag Logic
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    overlay.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        if (e.target === overlay || overlay.contains(e.target)) {
            // Initialize current positions to last known offset
            // so if we don't move, we don't break anything.
            currentX = xOffset;
            currentY = yOffset;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            isDragging = true;
            overlay.style.transition = 'none'; // distinct drag feel
            overlay.style.cursor = 'grabbing';
            overlay.style.borderColor = '#6c5ce7';
        }
    }

    function dragEnd(e) {
        if (!isDragging) return;
        
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        
        // Restore transition for smooth snap
        overlay.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        overlay.style.cursor = 'move';
        overlay.style.borderColor = 'rgba(255, 255, 255, 0.15)';

        // Boundary Checks / Snap Logic
        const rect = overlay.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        let newX = currentX;
        let newY = currentY;
        
        // Check horizontal
        if (rect.left < 0) {
            newX += -rect.left + 20; // Snap to left edge + padding
        } else if (rect.right > winW) {
            newX -= (rect.right - winW) + 20; // Snap to right edge + padding
        }
        
        // Check vertical
        if (rect.top < 0) {
            newY += -rect.top + 20; // Snap to top
        } else if (rect.bottom > winH) {
            newY -= (rect.bottom - winH) + 20; // Snap to bottom
        }
        
        if (newX !== currentX || newY !== currentY) {
            currentX = newX;
            currentY = newY;
            xOffset = newX;
            yOffset = newY;
            setTranslate(newX, newY, overlay);
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, overlay);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // Cleanup listener
    chrome.runtime.onMessage.addListener(function listener(message) {
        if (message.action === 'removeDimensions') {
            window.removeEventListener('resize', updateDimensions);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('mousemove', drag);
            overlay.remove();
            chrome.runtime.onMessage.removeListener(listener);
        }
    });

})();
