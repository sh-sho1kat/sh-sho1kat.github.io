// ============================================
//        INTERACTIVE SPACE BACKGROUND
// ============================================
const canvas = document.createElement('canvas');
canvas.id = 'spaceCanvas';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let mouseX = width / 2;
let mouseY = height / 2;
let targetMouseX = width / 2;
let targetMouseY = height / 2;

// Star layers (3 layers for parallax depth)
const layers = [
    { speed: 0.03, stars: [], count: 200, size: 1, opacity: 0.4 },
    { speed: 0.06, stars: [], count: 150, size: 1.5, opacity: 0.6 },
    { speed: 0.1, stars: [], count: 100, size: 2.2, opacity: 0.9 }
];

// Shooting stars array
const shootingStars = [];
let shootingStarTimer = 0;

// Nebula clouds array
const nebulaClouds = [];

// ---------- CREATE STARS ----------
function createStars() {
    layers.forEach(layer => {
        layer.stars = [];
        for (let i = 0; i < layer.count; i++) {
            layer.stars.push({
                x: Math.random() * width * 1.5 - width * 0.25,
                y: Math.random() * height * 1.5 - height * 0.25,
                baseX: 0,
                baseY: 0,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.02 + Math.random() * 0.03
            });
        }
        layer.stars.forEach(star => {
            star.baseX = star.x;
            star.baseY = star.y;
        });
    });
}

// ---------- CREATE NEBULA CLOUDS ----------
function createNebulaClouds() {
    nebulaClouds.length = 0;
    const colors = [
        'rgba(108, 99, 255, 0.015)',
        'rgba(78, 205, 196, 0.012)',
        'rgba(255, 107, 157, 0.01)',
        'rgba(108, 99, 255, 0.01)'
    ];
    for (let i = 0; i < 5; i++) {
        nebulaClouds.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 150 + Math.random() * 250,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 0.02 + Math.random() * 0.02
        });
    }
}

// ---------- CREATE SHOOTING STAR ----------
function createShootingStar() {
    const side = Math.random();
    let x, y, angle;

    if (side < 0.5) {
        x = Math.random() * width;
        y = -10;
        angle = Math.PI / 4 + Math.random() * (Math.PI / 4);
    } else {
        x = width + 10;
        y = Math.random() * height * 0.5;
        angle = Math.PI * 0.6 + Math.random() * (Math.PI / 4);
    }

    shootingStars.push({
        x: x,
        y: y,
        length: 80 + Math.random() * 100,
        speed: 8 + Math.random() * 8,
        angle: angle,
        opacity: 1,
        decay: 0.015 + Math.random() * 0.01,
        width: 1 + Math.random() * 1.5
    });
}

// ---------- DRAW STARS ----------
function drawStars(time) {
    layers.forEach(layer => {
        layer.stars.forEach(star => {
            const offsetX = (mouseX - width / 2) * layer.speed;
            const offsetY = (mouseY - height / 2) * layer.speed;

            star.x = star.baseX + offsetX;
            star.y = star.baseY + offsetY;

            // Twinkle
            star.twinkle += star.twinkleSpeed;
            const twinkleFactor = 0.5 + 0.5 * Math.sin(star.twinkle);
            const currentOpacity = layer.opacity * twinkleFactor;
            const currentSize = layer.size * (0.8 + 0.4 * twinkleFactor);

            // Star dot
            ctx.beginPath();
            ctx.arc(star.x, star.y, currentSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
            ctx.fill();

            // Glow for close/bright stars
            if (layer.size > 1.5 && twinkleFactor > 0.7) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, currentSize * 3, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, currentSize * 3
                );
                gradient.addColorStop(0, `rgba(108, 99, 255, ${currentOpacity * 0.3})`);
                gradient.addColorStop(1, 'rgba(108, 99, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        });
    });
}

// ---------- DRAW NEBULA CLOUDS ----------
function drawNebulaClouds() {
    nebulaClouds.forEach(cloud => {
        const offsetX = (mouseX - width / 2) * cloud.speed;
        const offsetY = (mouseY - height / 2) * cloud.speed;

        const gradient = ctx.createRadialGradient(
            cloud.x + offsetX, cloud.y + offsetY, 0,
            cloud.x + offsetX, cloud.y + offsetY, cloud.radius
        );
        gradient.addColorStop(0, cloud.color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cloud.x + offsetX, cloud.y + offsetY, cloud.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

// ---------- DRAW SHOOTING STARS ----------
function drawShootingStars() {
    shootingStars.forEach((star, index) => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= star.decay;

        if (star.opacity <= 0) {
            shootingStars.splice(index, 1);
            return;
        }

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.7, `rgba(108, 99, 255, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.width;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.width * 2, 0, Math.PI * 2);
        const headGlow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.width * 4
        );
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        headGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = headGlow;
        ctx.fill();
    });
}

// ---------- ANIMATION LOOP ----------
function animate(time) {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse following
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    drawNebulaClouds();
    drawStars(time);
    drawShootingStars();

    // Random shooting stars
    shootingStarTimer++;
    if (shootingStarTimer > 200 + Math.random() * 300) {
        createShootingStar();
        shootingStarTimer = 0;
    }

    requestAnimationFrame(animate);
}

// ---------- EVENT LISTENERS ----------
document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
});

document.addEventListener('touchmove', (e) => {
    targetMouseX = e.touches[0].clientX;
    targetMouseY = e.touches[0].clientY;
});

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createStars();
    createNebulaClouds();
});

// ---------- INITIALIZE SPACE ----------
createStars();
createNebulaClouds();
animate(0);


// ============================================
//            TYPEWRITER EFFECT
// ============================================
const typewriterElement = document.getElementById('typewriter');
const phrases = [
    'Competitive Programmer',
    'Full-Stack Developer',
    'Problem Solver',
    'ICPC Regionalist'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 30 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 500;
    }

    setTimeout(typeWriter, speed);
}

typeWriter();


// ============================================
//            NAVBAR SCROLL EFFECT
// ============================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// ============================================
//              MOBILE MENU
// ============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});


// ============================================
//            COUNTER ANIMATION
// ============================================
const statNumbers = document.querySelectorAll('.stat-number');
let countersStarted = false;

function animateCounters() {
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target + (target === 50 ? 'th' : '+');
            }
        };
        updateCounter();
    });
}


// ============================================
//            SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            if (entry.target.closest('#competitive') && !countersStarted) {
                countersStarted = true;
                animateCounters();
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.about-card, .timeline-item, .stat-card, .achievement-card, .project-card, .skill-category, .contact-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});


// ============================================
//              SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});