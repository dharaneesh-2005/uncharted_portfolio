// Hero Parallax
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.getElementById('hero');

    // Safety check just in case
    if (!heroSection) return;

    if (scrolled < window.innerHeight) {
        document.querySelectorAll('.layer').forEach(layer => {
            const speed = layer.dataset.speed || 0.5;
            layer.style.transform = `translateY(${scrolled * speed}px)`;
        });

        document.querySelectorAll('.name-part, .subtitle, .role-text').forEach(el => {
            el.style.transform = `translateY(${scrolled * 0.4}px)`;
            el.style.opacity = 1 - (scrolled / window.innerHeight);
        });
    }
});

// Canvas & Frame Animation Code
const canvas = document.getElementById('parallax-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const animationSection = document.querySelector('.animation-section');

if (canvas && ctx && animationSection) {
    const frameCount1 = 192;
    const frameCount2 = 192;
    const totalFrames = frameCount1 + frameCount2;
    const frames = [];
    let imagesLoaded = 0;
    let currentFrame = -1;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();

    // Preload frames
    // Preload frames
    for (let i = 0; i < frameCount1; i++) {
        const img = new Image();
        img.src = `resource/1/frame_${String(i).padStart(3, '0')}.webp`;
        img.onload = () => { imagesLoaded++; if (imagesLoaded === 1) drawFrame(0); };
        img.onerror = () => { console.warn(`Frame 1/${i} missing`); };
        frames.push(img);
    }
    for (let i = 0; i < frameCount2; i++) {
        const img = new Image();
        img.src = `resource/2/frame_${String(i).padStart(3, '0')}.webp`;
        img.onload = () => { imagesLoaded++; };
        img.onerror = () => { console.warn(`Frame 2/${i} missing`); };
        frames.push(img);
    }

    // Set scroll height for animation
    const animationScrollHeight = 4000; // Increased for smoother scrolling
    animationSection.style.height = `${animationScrollHeight}px`;

    function drawFrame(index) {
        if (!frames[index]) return;
        const img = frames[index];
        if (img && img.complete) {
            // "Zoomed out" logic: Use Math.min to ensure the whole image fits (contain), 
            // or a slightly larger multiplier to fill decently without extreme zooming.
            // Switching to 'contain' style to satisfy "zoomed out" request.
            // If we want it to cover but not zoom IN too much, we might need a different approach,
            // but let's try Math.max but with a check or just standard Object-fit containment for valid 'whole picture' view.

            // However, parallax usually requires covering the frame. 
            // If the user says "huge", maybe the container is just too big for the image resolution?
            // Let's try to fit the image fully visible (contain) and fill the bars with a color.

            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;

            // Fill background to blend bars if any
            ctx.fillStyle = '#0f0d0c'; // Dark background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw image
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // "Old Film" Overlay - Make it subtler
            ctx.fillStyle = 'rgba(121, 85, 72, 0.1)';
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    function renderAnimation() {
        if (!animationSection) return;

        // Use requestAnimationFrame for smoother Visual updates
        // But the scroll logic calculates frameIndex.

        const sectionTop = animationSection.offsetTop;
        const scrollY = window.pageYOffset;
        const sectionHeight = animationSection.offsetHeight;
        const windowHeight = window.innerHeight;

        // Calculate if we are within the animation section's scroll range
        if (scrollY >= sectionTop && scrollY <= (sectionTop + sectionHeight)) {
            const scrollInThisSection = scrollY - sectionTop;
            const scrollableDistance = sectionHeight - windowHeight;

            // Map scroll to frame index
            const progress = Math.max(0, Math.min(1, scrollInThisSection / scrollableDistance));
            const frameIndex = Math.min(
                totalFrames - 1,
                Math.floor(progress * totalFrames)
            );

            if (frameIndex !== currentFrame && frameIndex >= 0) {
                currentFrame = frameIndex;
                requestAnimationFrame(() => drawFrame(frameIndex));
            }
        }
    }

    window.addEventListener('scroll', renderAnimation);
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (currentFrame >= 0) drawFrame(currentFrame);
    });
}

// Intersection Observer for Content Sections
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // Staggered animation for skills
            if (entry.target.id === 'skills') {
                const markers = entry.target.querySelectorAll('.skill-marker');
                markers.forEach((el, i) => {
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, i * 200);
                });
            }

            // Stats Counter Animation
            if (entry.target.id === 'achievements') {
                const stats = entry.target.querySelectorAll('.stat-number');
                stats.forEach(stat => {
                    const target = +stat.getAttribute('data-count');
                    const duration = 2000;
                    const increment = target / (duration / 16);

                    let current = 0;
                    const updateCount = () => {
                        current += increment;
                        if (current < target) {
                            stat.innerText = Math.ceil(current) + "+";
                            requestAnimationFrame(updateCount);
                        } else {
                            stat.innerText = target + "+";
                        }
                    };
                    updateCount();
                });
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.content-section').forEach(section => {
    // Initial state
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
    observer.observe(section);
});
