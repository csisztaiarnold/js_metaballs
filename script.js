const initMetaballs = config => {
    const {
        elementId = 'metaballs',
        numberOfBalls = 6,
        speed = 1.5,
        color = [0, 0, 0, 180],
        minRadius = 20,
        maxRadius = 140
    } = config;

    const canvas = document.getElementById(elementId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let image;

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
            zIndex: 0,
            pointerEvents: 'none'
        });

        image = ctx.createImageData(width, height);
    };

    window.addEventListener('resize', resize);

    const balls = Array.from({ length: numberOfBalls }, () => {
        const r = minRadius + Math.random() * (maxRadius - minRadius);
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            r,
            rSq: r * r,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed
        };
    });

    image = ctx.createImageData(width, height);

    const animate = () => {
        const data = image.data;
        for (let i = 3; i < data.length; i += 4) data[i] = 0;

        const rSqArr = balls.map(ball => ball.rSq);
        const vxArr = balls.map(ball => ball.vx);
        const vyArr = balls.map(ball => ball.vy);
        const xArr = balls.map(ball => ball.x);
        const yArr = balls.map(ball => ball.y);
        const nBalls = balls.length;

        for (let y = 0; y < height; y++) {
            const yOffset = y * width * 4;
            for (let x = 0; x < width; x++) {
                let sum = 0;
                for (let i = 0; i < nBalls; i++) {
                    const dx = x - xArr[i];
                    const dy = y - yArr[i];
                    const distSq = dx * dx + dy * dy + 1;
                    sum += rSqArr[i] / distSq;
                }
                if (sum > 1.1) {
                    const idx = yOffset + (x << 2);
                    data[idx] = color[0];
                    data[idx + 1] = color[1];
                    data[idx + 2] = color[2];
                    data[idx + 3] = color[3];
                }
            }
        }

        ctx.putImageData(image, 0, 0);

        for (let i = 0; i < nBalls; i++) {
            xArr[i] += vxArr[i];
            yArr[i] += vyArr[i];
            if (xArr[i] < 0 || xArr[i] > width) vxArr[i] *= -1;
            if (yArr[i] < 0 || yArr[i] > height) vyArr[i] *= -1;
            balls[i].x = xArr[i];
            balls[i].y = yArr[i];
            balls[i].vx = vxArr[i];
            balls[i].vy = vyArr[i];
        }

        requestAnimationFrame(animate);
    };

    resize();
    animate();
};
