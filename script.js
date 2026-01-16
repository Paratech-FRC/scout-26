// ========================================
// PARTICLE SYSTEM
// ========================================

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = ['#00F0FF', '#6B8CFF', '#FF006E'][Math.floor(Math.random() * 3)];
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Connect particles
    particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                ctx.strokeStyle = a.color;
                ctx.globalAlpha = (1 - distance / 100) * 0.2;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        });
    });
    
    requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ========================================
// NAVIGATION
// ========================================

const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(8px, 8px)' : '';
    spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(8px, -8px)' : '';
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
        
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// SCROLL ANIMATIONS
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(element => {
    observer.observe(element);
});

// ========================================
// PARALLAX EFFECTS
// ========================================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroContent = hero.querySelector('.hero-content');
        const floatingShapes = hero.querySelectorAll('.shape');
        
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 800);
        }
        
        floatingShapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.1);
            const rotation = scrolled * 0.1;
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${rotation}deg)`;
        });
    }
    
    document.querySelectorAll('.section-background').forEach((bg, index) => {
        const section = bg.closest('.section');
        const rect = section.getBoundingClientRect();
        const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        
        if (scrollPercent >= 0 && scrollPercent <= 1) {
            bg.style.transform = `translateY(${scrollPercent * 100}px)`;
        }
    });
});

// ========================================
// GLITCH EFFECT
// ========================================

const glitchText = document.querySelector('.glitch');
if (glitchText) {
    setInterval(() => {
        const shouldGlitch = Math.random() > 0.85;
        if (shouldGlitch) {
            glitchText.style.textShadow = `
                ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 var(--color-neon-pink),
                ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 var(--color-neon-blue)
            `;
            
            setTimeout(() => {
                glitchText.style.textShadow = `
                    0 0 10px var(--color-neon-cyan),
                    0 0 20px var(--color-neon-cyan),
                    0 0 40px var(--color-neon-cyan)
                `;
            }, 100);
        }
    }, 2000);
}

// ========================================
// CURSOR GLOW EFFECT
// ========================================

const createCursorGlow = () => {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(glow);
    
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });
    
    const animateGlow = () => {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;
        requestAnimationFrame(animateGlow);
    };
    
    animateGlow();
};

if (window.innerWidth > 1024) {
    createCursorGlow();
}

// ========================================
// CARD HOVER EFFECTS
// ========================================

const cards = document.querySelectorAll('.team-card, .stat-card, .info-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ========================================
// FORM HANDLING
// ========================================

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const button = contactForm.querySelector('button');
        const originalText = button.querySelector('span').textContent;
        button.querySelector('span').textContent = 'Mensagem Enviada!';
        button.style.background = 'var(--color-neon-cyan)';
        button.style.color = 'var(--color-bg-primary)';
        
        setTimeout(() => {
            contactForm.reset();
            button.querySelector('span').textContent = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 3000);
    });
}

// ========================================
// DYNAMIC STATS COUNTER
// ========================================

const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
};

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const number = entry.target.querySelector('.stat-number');
            const targetText = number.textContent;
            const targetNumber = parseInt(targetText.replace(/\D/g, ''));
            
            if (!isNaN(targetNumber)) {
                number.textContent = '0';
                animateCounter(number, targetNumber);
            }
            
            entry.target.classList.add('counted');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
    statObserver.observe(card);
});

// ========================================
// MOUSE TRAIL EFFECT
// ========================================

const createMouseTrail = () => {
    const trail = [];
    const maxTrail = 20;
    
    document.addEventListener('mousemove', (e) => {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--color-neon-cyan);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            box-shadow: 0 0 10px var(--color-neon-cyan);
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(dot);
        trail.push(dot);
        
        if (trail.length > maxTrail) {
            const oldDot = trail.shift();
            oldDot.remove();
        }
        
        setTimeout(() => {
            dot.style.opacity = '0';
            dot.style.transform = 'translate(-50%, -50%) scale(0)';
            dot.style.transition = 'all 0.5s ease';
        }, 50);
        
        setTimeout(() => {
            dot.remove();
        }, 600);
    });
};

if (window.innerWidth > 1024) {
    createMouseTrail();
}

// ========================================
// SCROLL PROGRESS INDICATOR
// ========================================

const createScrollProgress = () => {
    const progress = document.createElement('div');
    progress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-pink));
        box-shadow: 0 0 10px var(--color-neon-cyan);
        z-index: 10000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progress);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progress.style.width = `${scrolled}%`;
    });
};

createScrollProgress();

// ========================================
// RANDOM LIGHTNING EFFECTS
// ========================================

const createLightning = () => {
    setInterval(() => {
        if (Math.random() > 0.95) {
            const lightning = document.createElement('div');
            const x = Math.random() * window.innerWidth;
            
            lightning.style.cssText = `
                position: fixed;
                top: 0;
                left: ${x}px;
                width: 2px;
                height: 100vh;
                background: linear-gradient(180deg, var(--color-neon-cyan), transparent);
                box-shadow: 0 0 20px var(--color-neon-cyan);
                pointer-events: none;
                z-index: 9997;
                animation: lightningFlash 0.3s ease-out;
            `;
            
            document.body.appendChild(lightning);
            
            setTimeout(() => {
                lightning.remove();
            }, 300);
        }
    }, 3000);
};

const style = document.createElement('style');
style.textContent = `
    @keyframes lightningFlash {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(style);

createLightning();

// ========================================
// BUTTON RIPPLE EFFECT
// ========================================

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Paratech 9302 - Website Carregado');
    document.body.classList.add('loaded');
    
    const criticalImages = [
        './assets/logo.png',
        './assets/background.png',
        './assets/robot.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

window.addEventListener('scroll', debounce(() => {
    // Additional scroll-based animations
}, 10));