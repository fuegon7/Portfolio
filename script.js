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

    // Contact Form Submission (For GAS)
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.querySelector('span[data-i18n]').textContent;
            const btnTextSpan = submitBtn.querySelector('span[data-i18n]');

            // Loading State
            btnTextSpan.textContent = currentLang === 'es' ? 'Enviando...' : 'Sending...';
            submitBtn.style.opacity = '0.7';

            // --- GOOGLE APPS SCRIPT INTEGRATION ---
            const scriptURL = 'https://script.google.com/macros/s/AKfycbzA_q_dUNeRPAqNVpmHtkNVNQYiE7cYtoc_EyIky1-R83OADKGZNeX7Uyq8D5KxNOb2NQ/exec';
            fetch(scriptURL, { method: 'POST', body: new FormData(contactForm) })
                .then(response => {
                    console.log(response);
                })

            // Simulation for now
            setTimeout(() => {
                btnTextSpan.textContent = currentLang === 'es' ? '¡Enviado!' : 'Sent!';
                submitBtn.classList.add('success');
                contactForm.reset();

                setTimeout(() => {
                    btnTextSpan.textContent = translations[currentLang]['btn_email'];
                    submitBtn.classList.remove('success');
                    submitBtn.style.opacity = '1';
                }, 3000);
            }, 1500);
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

    // Run Init
    init();

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