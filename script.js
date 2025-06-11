/**
 * Simple metaballs implementation with vanilla JavaScript.
 * Creates fluid-like animated blobs that can be optionally controlled with the mouse.
 */
const initMetaballs = config => {

    const {
        elementId = 'metaballs',
        numberOfBalls = 6,
        speed = 1.5,
        color = [0, 0, 0, 180],
        minRadius = 20,
        maxRadius = 140,
        mouseControl = false
    } = config;

    const canvas = document.getElementById(elementId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let width = window.innerWidth;
    let height = window.innerHeight;
    let image;
    let isDragging = false;
    let draggedBallIndex = -1;
    let animationId = null;

    const balls = [];

    /**
     * Draw the canvas and set ball positions.
     */
    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        Object.assign(canvas.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0
        });

        image = ctx.createImageData(width, height);

        for (let i = 0; i < balls.length; i++) {
            if (balls[i].x > width) balls[i].x = width * Math.random();
            if (balls[i].y > height) balls[i].y = height * Math.random();
        }
    };

    /**
     * Handle mouse down event, detect if a ball was clicked.
     */
    const handleMouseDown = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        try {
            const pixelData = ctx.getImageData(mouseX, mouseY, 1, 1).data;

            if (pixelData[3] > 0) {
                let closestBall = -1;
                let minDistance = Infinity;

                for (let i = 0; i < balls.length; i++) {
                    const dx = mouseX - balls[i].x;
                    const dy = mouseY - balls[i].y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < minDistance) {
                        minDistance = distSq;
                        closestBall = i;
                    }
                }

                if (closestBall !== -1) {
                    isDragging = true;
                    draggedBallIndex = closestBall;
                    balls[closestBall].vx = 0;
                    balls[closestBall].vy = 0;
                    canvas.style.cursor = 'grabbing';
                }
            }
        } catch (e) {
            console.warn('Error accessing pixel data:', e);
        }
    };

    /**
     * Handle mouse move event for dragging balls.
     */
    const handleMouseMove = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        if (!isDragging) {
            if (!canvas._mouseMoveTimeout) {
                canvas._mouseMoveTimeout = requestAnimationFrame(() => {
                    try {
                        const pixelData = ctx.getImageData(mouseX, mouseY, 1, 1).data;
                        canvas.style.cursor = pixelData[3] > 0 ? 'grab' : 'default';
                    } catch (e) {
                    }
                    canvas._mouseMoveTimeout = null;
                });
            }
        } else if (draggedBallIndex !== -1) {
            balls[draggedBallIndex].x = mouseX;
            balls[draggedBallIndex].y = mouseY;
        }
    };

    /**
     * Handle mouse up event, release dragged ball.
     */
    const handleMouseUp = () => {
        if (isDragging && draggedBallIndex !== -1) {
            balls[draggedBallIndex].vx = (Math.random() - 0.5) * speed;
            balls[draggedBallIndex].vy = (Math.random() - 0.5) * speed;
            canvas.style.cursor = 'grab';
        }
        isDragging = false;
        draggedBallIndex = -1;
    };

    if (mouseControl) {
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    window.addEventListener('resize', resize);

    for (let i = 0; i < numberOfBalls; i++) {
        const r = minRadius + Math.random() * (maxRadius - minRadius);
        balls.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r,
            rSq: r * r,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed
        });
    }

    image = ctx.createImageData(width, height);

    /**
     * The animation loop.
     */
    const animate = () => {
        const data = image.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0;
        }

        const threshold = 1.1;

        for (let y = 0; y < height; y++) {
            const yOffset = y * width * 4;
            for (let x = 0; x < width; x++) {
                let sum = 0;

                for (let i = 0; i < balls.length; i++) {
                    const dx = x - balls[i].x;
                    const dy = y - balls[i].y;
                    const distSq = dx * dx + dy * dy + 1;
                    sum += balls[i].rSq / distSq;
                }

                if (sum > threshold) {
                    const idx = yOffset + x * 4;
                    data[idx] = color[0];
                    data[idx + 1] = color[1];
                    data[idx + 2] = color[2];
                    data[idx + 3] = color[3];
                }
            }
        }

        ctx.putImageData(image, 0, 0);

        for (let i = 0; i < balls.length; i++) {
            if (isDragging && draggedBallIndex === i) continue;

            balls[i].x += balls[i].vx;
            balls[i].y += balls[i].vy;

            const damping = 0.97;

            if (balls[i].x < 0 || balls[i].x > width) {
                balls[i].vx *= -damping;
                balls[i].x = balls[i].x < 0 ? 0 : width;
            }

            if (balls[i].y < 0 || balls[i].y > height) {
                balls[i].vy *= -damping;
                balls[i].y = balls[i].y < 0 ? 0 : height;
            }
        }
        animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (mouseControl) {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        window.removeEventListener('resize', resize);
    };
};
