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

            // --- GOOGLE APPS SCRIPT INTEGRATION ---
            const scriptURL = 'https://script.google.com/macros/s/AKfycbyz__SL1UpBOZqHlLYYkJQDxT0NxEo_0q9wSJNtex_5Um2XQ-BsMDBdH6oQ-v-JLH97GQ/exec';

            const formData = new FormData(contactForm);
            formData.append('token', 'CONTACT_V1_2025'); // anti-bot token

            fetch(scriptURL, {
                method: 'POST',
                body: formData,
            })
            .then(() => {
                btnTextSpan.textContent = currentLang === 'es' ? '¡Enviado!' : 'Sent!';
                submitBtn.classList.add('success');
                contactForm.reset();
            })
            .then(data => {
                if (data.status === 'rate_limited') {
                    throw new Error('Rate limited');
                }

                if (data.status !== 'success') {
                    throw new Error('Error');
                }
            })
            .catch(err => {
                if (err.message === 'rate_limited') {
                    btnTextSpan.textContent = currentLang === 'es'
                        ? 'Espera unos segundos antes de reenviar'
                        : 'Please wait before sending again';
                } else {
                    btnTextSpan.textContent = currentLang === 'es'
            ? 'Error al enviar'
            : 'Send error';
    }
                submitBtn.classList.add('error');
            })
            .finally(() => {
                setTimeout(() => {
                    submitBtn.classList.remove('loading', 'success', 'error');
                    submitBtn.style.opacity = '1';
                    btnTextSpan.textContent = originalText;
                }, 3000);
            });
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

    // Run Init
    init();

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