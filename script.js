document.addEventListener('DOMContentLoaded', function () {
    // --- STATE MANAGEMENT ---
    let currentLang = localStorage.getItem('portfolio_lang') || 'es';

    // --- ELEMENTS ---
    const langToggleCheck = document.getElementById('lang-toggle-checkbox');
    const currentYearSpan = document.getElementById('current-year');
    const contactForm = document.getElementById('contact-form');

    // --- INITIALIZATION ---
    function init() {
        // Set Year
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        // Apply Language
        if (currentLang === 'en') {
            langToggleCheck.checked = true;
        } else {
            langToggleCheck.checked = false;
        }
        updateLanguage(currentLang);
        updateActiveNavLink();
    }

    // --- FUNCTIONS ---
    function updateLanguage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // Determine if input/textarea placeholder or textContent
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translations[lang][key];
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });
        currentLang = lang;
        localStorage.setItem('portfolio_lang', lang);
    }

    // --- EVENT LISTENERS ---

    // Language Toggle (Switch)
    if (langToggleCheck) {
        langToggleCheck.addEventListener('change', function () {
            const newLang = this.checked ? 'en' : 'es';
            updateLanguage(newLang);
        });
    }

    // Contact Form Submission (Google Apps Script)
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.submit-btn');
            const btnTextSpan = submitBtn.querySelector('span[data-i18n]');
            const originalText = translations[currentLang]['btn_email'];

            // Prevent double submit
            if (submitBtn.classList.contains('loading')) return;

            submitBtn.classList.add('loading');
            submitBtn.style.opacity = '0.7';
            btnTextSpan.textContent = currentLang === 'es' ? 'Enviando...' : 'Sending...';

            const scriptURL = 'https://script.google.com/macros/s/AKfycbyz__SL1UpBOZqHlLYYkJQDxT0NxEo_0q9wSJNtex_5Um2XQ-BsMDBdH6oQ-v-JLH97GQ/exec';

            const formData = new FormData(contactForm);
            formData.append('token', 'CONTACT_V1_2025');

            fetch(scriptURL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            })
                .then(() => {
                    btnTextSpan.textContent = currentLang === 'es' ? '¡Enviado!' : 'Sent!';
                    submitBtn.classList.add('success');
                    contactForm.reset();

                    // Start Cooldown
                    submitBtn.disabled = true;
                    submitBtn.classList.add('cooldown');
                    submitBtn.classList.remove('loading'); // remove loading immediately

                    let timeLeft = 30;

                    // Initial wait text after "Sent!" message
                    setTimeout(() => {
                        if (submitBtn.classList.contains('success')) {
                            submitBtn.classList.remove('success');
                        }
                        updateButtonTimer();
                    }, 2000);

                    const timerInterval = setInterval(() => {
                        timeLeft--;
                        if (timeLeft <= 0) {
                            clearInterval(timerInterval);
                        } else {
                            updateButtonTimer();
                        }
                    }, 1000);

                    function updateButtonTimer() {
                        btnTextSpan.textContent = currentLang === 'es'
                            ? `Espere ${timeLeft}s...`
                            : `Wait ${timeLeft}s...`;
                    }

                    setTimeout(() => {
                        clearInterval(timerInterval);
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('cooldown');
                        submitBtn.style.opacity = '1';
                        btnTextSpan.textContent = originalText;
                    }, 30000);
                })
                .catch(() => {
                    btnTextSpan.textContent = currentLang === 'es'
                        ? 'Error al enviar'
                        : 'Send error';
                    submitBtn.classList.add('error');

                    // Reset error state after 3s
                    setTimeout(() => {
                        submitBtn.classList.remove('loading', 'error');
                        submitBtn.style.opacity = '1';
                        btnTextSpan.textContent = originalText;
                    }, 3000);
                });
            // Removed finally block as logic is handled in then/catch
        });
    }


    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.visibility = 'hidden';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.visibility = 'visible';
            }
        });
    }

    // Scroll Animations
    const observerOptions = { threshold: 0.1, rootMargin: "0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    document.querySelectorAll('.skill-category, .project-card, .contact-container').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // --- NAVIGATION ACTIVE STATE ---
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        const scrollPosition = window.scrollY + 100; // Offset for header

        // If we are on projects.html, highlight All Projects
        if (window.location.pathname.includes('projects.html')) {
            navLinks.forEach(link => {
                if (link.getAttribute('href').includes('projects.html')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            return;
        }

        // Home Page Scroll Spy
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            // Check if link points to index.html#id or just #id
            if (href.includes(currentSection) && currentSection !== '') {
                // Determine if it's strictly a home link when on home page
                if (!href.includes('projects.html')) {
                    link.classList.add('active');
                }
            } else if (currentSection === '' && window.scrollY < 100 && (href === '#home' || href.endsWith('#home'))) {
                link.classList.add('active'); // Default to home at top
            }
        });
    }

    // --- MASONRY LAYOUT (Horizontal Order) ---
    function initMasonry() {
        const grids = document.querySelectorAll('.masonry-grid');

        grids.forEach(grid => {
            // Save original cards to keep order 1, 2, 3...
            if (!grid.originalCards) {
                // If cards are already inside columns (re-run), we might lose order if we just querySelectorAll.
                // But initMasonry is called on load first, so it captures them.
                // If we resize, we use the cached .originalCards.
                // To be safe against race conditions or multiple inits, check children.
                const currentCards = Array.from(grid.querySelectorAll('.project-card'));
                if (currentCards.length > 0 && !grid.querySelector('.masonry-col')) {
                    grid.originalCards = currentCards;
                }
            }

            // If still no originalCards (e.g. empty grid), skip
            if (!grid.originalCards) return;

            const cards = grid.originalCards;

            // Determine columns based on CSS breakpoints matching styles.css
            const width = window.innerWidth;
            let colCount = 3;
            if (width <= 768) colCount = 1;
            else if (width <= 1024) colCount = 2;

            // Create columns
            const cols = [];
            for (let i = 0; i < colCount; i++) {
                const col = document.createElement('div');
                col.className = 'masonry-col';
                cols.push(col);
            }

            // Distribute cards (Horizontal Order: 1->Col1, 2->Col2, 3->Col3...)
            cards.forEach((card, index) => {
                cols[index % colCount].appendChild(card);
            });

            // Rebuild DOM
            grid.innerHTML = '';
            cols.forEach(col => grid.appendChild(col));
        });
    }

    // Debounce resize for Masonry
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initMasonry, 200);
    });

    // Run Init
    init();
    initMasonry();

    // Listen to scroll for active state
    window.addEventListener('scroll', updateActiveNavLink);

    // --- MOBILE MENU ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // --- TOAST NOTIFICATIONS ---
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.addEventListener('click', function (e) {
            e.preventDefault();
            const email = 'gerard.moreno.campos@gmail.com';

            navigator.clipboard.writeText(email).then(() => {
                showToast();
            }).catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }

    function showToast() {
        const message = translations[currentLang] && translations[currentLang]['toast_email_copied']
            ? translations[currentLang]['toast_email_copied']
            : 'Email copied to clipboard!';

        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Remove any existing toasts
        const existingToast = toastContainer.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Trigger reflow
        void toast.offsetWidth;

        // Show
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 400); // Wait for transition
        }, 3000);
    }
});

// Helper for visible class
const style = document.createElement('style');
style.textContent = `
    .visible { opacity: 1 !important; transform: translateY(0) !important; }
    .success { border-color: #64ffda !important; color: #64ffda !important; }
`;
document.head.appendChild(style);