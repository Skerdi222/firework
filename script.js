const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.01;
        this.gravity = 0.08;
        this.size = Math.random() * 4 + 2;
        this.resistance = 0.97;
        this.brightness = Math.random() * 0.5 + 0.5;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    update() {
        this.velocity.x *= this.resistance;
        this.velocity.y *= this.resistance;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

class Rocket {
    constructor(x, targetY) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = targetY;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.8,
            y: -7
        };
        this.exploded = false;
        this.trail = [];
        this.colorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    }

    draw() {
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            ctx.globalAlpha = (i / this.trail.length) * 0.7;

            const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 4);
            gradient.addColorStop(0, this.colorScheme[0]);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.colorScheme[0];
        ctx.fillStyle = this.colorScheme[0];
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) {
            this.trail.shift();
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.y <= this.targetY) {
            this.exploded = true;
        }
    }
}

class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.alpha = Math.random();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.15 + 0.05;
        this.twinkleSpeed = Math.random() * 0.015 + 0.005;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.8;

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#e0e7ff');
        gradient.addColorStop(1, 'rgba(224, 231, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    update() {
        this.y += this.speed;
        this.alpha += this.twinkleSpeed;

        if (this.alpha > 1 || this.alpha < 0.2) {
            this.twinkleSpeed *= -1;
        }

        if (this.y > canvas.height) {
            this.reset();
        }
    }
}

const particles = [];
const rockets = [];
const stars = [];

for (let i = 0; i < 200; i++) {
    stars.push(new Star());
}

const colorSchemes = [
    ['#667eea', '#764ba2', '#f093fb'],
    ['#4facfe', '#00f2fe', '#43e97b'],
    ['#fa709a', '#fee140', '#feca57'],
    ['#ff6b6b', '#ee5a6f', '#c44569'],
    ['#a8edea', '#fed6e3', '#d299c2'],
    ['#30cfd0', '#330867', '#667eea'],
    ['#ffecd2', '#fcb69f', '#ff6b6b']
];

function createFirework(x) {
    const targetY = Math.random() * (canvas.height * 0.35) + canvas.height * 0.15;
    rockets.push(new Rocket(x, targetY));
}

function explode(x, y, colorScheme) {
    const particleCount = 120;
    for (let i = 0; i < particleCount; i++) {
        const color = colorScheme[Math.floor(Math.random() * colorScheme.length)];
        particles.push(new Particle(x, y, color));
    }
}

function animate() {
    ctx.fillStyle = 'rgba(10, 14, 39, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    rockets.forEach((rocket, index) => {
        if (rocket.exploded) {
            explode(rocket.x, rocket.y, rocket.colorScheme);
            rockets.splice(index, 1);
        } else {
            rocket.update();
            rocket.draw();
        }
    });

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
            particle.draw();
        }
    });

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    createFirework(e.clientX);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    createFirework(touch.clientX);
});

setTimeout(() => createFirework(canvas.width * 0.25), 600);
setTimeout(() => createFirework(canvas.width * 0.75), 1300);
setTimeout(() => createFirework(canvas.width * 0.5), 2100);

animate();