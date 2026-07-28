class NetworkAnimation {
    constructor(canvasSelector = '#network-canvas') {
        this.canvas = document.querySelector(canvasSelector);
        if (!this.canvas) return;

        this.ctx    = this.canvas.getContext('2d');
        this.dots   = [];
        this.dotCount          = 100;
        this.connectionDistance = 120;
        this.dotColor          = 'rgba(0,0,0,0.4)';
        this.speed             = 2.0;

        this.resize();
        this.initDots();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.width  = this.canvas.width  = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    initDots() {
        this.dots = Array.from({ length: this.dotCount }, () => ({
            x:      Math.random() * this.width,
            y:      Math.random() * this.height,
            vx:     (Math.random() - 0.5) * this.speed,
            vy:     (Math.random() - 0.5) * this.speed,
            radius: 2.5 + Math.random() * 1.5
        }));
    }

    update() {
        const m = 50;
        for (const d of this.dots) {
            d.x += d.vx;
            d.y += d.vy;
            if (d.x < -m)              d.x = this.width  + m;
            if (d.x > this.width  + m) d.x = -m;
            if (d.y < -m)              d.y = this.height + m;
            if (d.y > this.height + m) d.y = -m;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.dots.length; i++) {
            for (let j = i + 1; j < this.dots.length; j++) {
                const dx   = this.dots[i].x - this.dots[j].x;
                const dy   = this.dots[i].y - this.dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.connectionDistance) {
                    this.ctx.strokeStyle = `rgba(0,0,0,${(1 - dist / this.connectionDistance) * 0.2})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.dots[i].x, this.dots[i].y);
                    this.ctx.lineTo(this.dots[j].x, this.dots[j].y);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.fillStyle = this.dotColor;
        for (const d of this.dots) {
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => new NetworkAnimation())
    : new NetworkAnimation();