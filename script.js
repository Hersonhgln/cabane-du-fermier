/* ============================================
   CABANE DU FERMIER — Main Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ----- 1. Initialize Lucide Icons -----
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ----- 2. Dynamic Year in Footer -----
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ----- 3. Navbar Scroll Effect -----
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    // ----- 4. Mobile Menu Toggle -----
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('active');
            // Switch icon
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            });
        });
    }

    // ----- 5. Product Filter -----
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Fade in animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);

    // ----- 6. WhatsApp Order Form -----
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name')?.value.trim() || '';
            const product = document.getElementById('product')?.value.trim() || '';
            const quantity = document.getElementById('quantity')?.value.trim() || '';
            const contactInfo = document.getElementById('contactInfo')?.value.trim() || '';
            const livraison = document.getElementById('livraison')?.value.trim() || '';

            if (!name || !product || !quantity || !contactInfo) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            // Build WhatsApp message
            let message = `🛒 *Nouvelle commande — Cabane du Fermier*\n\n`;
            message += `👤 *Nom :* ${name}\n`;
            message += `📦 *Produit(s) :* ${product}\n`;
            message += `🔢 *Quantité :* ${quantity}\n`;
            message += `📱 *WhatsApp :* ${contactInfo}\n`;
            if (livraison) {
                message += `🚚 *Livraison :* ${livraison}\n`;
            }
            message += `\nMerci de traiter ma commande. 🙏`;

            const phone = '2290191666617';
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        });
    }

    // ----- 7. Scroll Reveal Animation -----
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const revealPoint = 120;
            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll(); // trigger on load

    // ----- 8. Smooth Scroll for Anchor Links -----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetEl.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
