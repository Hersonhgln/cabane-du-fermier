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
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ----- 3. Navbar Scroll Effect -----
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ----- 4. Mobile Menu Toggle -----
    const menuBtn    = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon   = document.getElementById('menu-icon');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('active');
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
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
    const filterBtns  = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    // Inject fadeIn keyframe
    const ks = document.createElement('style');
    ks.textContent = `@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(ks);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            productCards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ----- 5b. Add-to-order: cart button selection -----
    /* Create a toast element once */
    const toast = document.createElement('div');
    toast.className = 'order-toast';
    toast.innerHTML = `<span class="toast-icon">🛒</span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);

    let toastTimer = null;
    function showToast(msg) {
        toast.querySelector('.toast-msg').textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    /** Set the product field from the selectedProducts Set */
    const selectedProducts = new Set();
    const productInput = document.getElementById('product');

    function updateProductField() {
        if (productInput) {
            productInput.value = [...selectedProducts].join(', ');
        }
    }

    /* Attach click handler to every cart button */
    document.querySelectorAll('.add-to-order').forEach(btn => {
        btn.addEventListener('click', () => {
            const card      = btn.closest('.product-card');
            const name      = btn.getAttribute('data-product');
            const price     = btn.getAttribute('data-price');

            // Bounce animation
            btn.classList.remove('bounce');
            void btn.offsetWidth; // reflow
            btn.classList.add('bounce');
            btn.addEventListener('animationend', () => btn.classList.remove('bounce'), { once: true });

            if (selectedProducts.has(name)) {
                // Deselect
                selectedProducts.delete(name);
                card.classList.remove('selected');
                showToast(`❌ "${name}" retiré de la commande`);
            } else {
                // Select
                selectedProducts.add(name);
                card.classList.add('selected');
                showToast(`✓ "${name}" ajouté — ${price}`);
            }

            updateProductField();

            // Smooth scroll to the form only on first selection
            if (selectedProducts.size === 1 && !selectedProducts._scrolled) {
                selectedProducts._scrolled = true;
                const formSection = document.getElementById('commander');
                if (formSection) {
                    setTimeout(() => {
                        window.scrollTo({
                            top: formSection.offsetTop - (navbar ? navbar.offsetHeight : 0),
                            behavior: 'smooth'
                        });
                    }, 400);
                }
            }
        });
    });

    // ----- 6. Livraison Toggle + Géolocalisation -----
    const btnNon       = document.getElementById('livraisonNon');
    const btnOui       = document.getElementById('livraisonOui');
    const livraisonVal = document.getElementById('livraisonValue');
    const geoSection   = document.getElementById('geoSection');
    const geoBtn       = document.getElementById('geoBtn');
    const geoBtnText   = document.getElementById('geoBtnText');
    const geoResult    = document.getElementById('geoResult');
    const geoAddress   = document.getElementById('geoAddress');
    const geoReset     = document.getElementById('geoReset');

    /** Reverse geocoding: coordinates → human-readable address */
    function reverseGeocode(lat, lng) {
        return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`)
            .then(r => r.json())
            .then(data => data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
            .catch(() => `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }

    /** Trigger geolocation + reverse geocode */
    function detectLocation() {
        if (!navigator.geolocation) {
            alert('La géolocalisation n\'est pas supportée par votre navigateur.');
            return;
        }

        // Show loading state
        geoBtn.classList.add('loading');
        geoBtnText.textContent = '📡 Localisation en cours…';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const addr = await reverseGeocode(lat, lng);

                // Store values
                document.getElementById('mapLat').value     = lat.toFixed(6);
                document.getElementById('mapLng').value     = lng.toFixed(6);
                document.getElementById('mapAddress').value = addr;

                // Update UI
                geoAddress.textContent = addr;
                geoBtn.style.display    = 'none';
                geoResult.style.display = 'flex';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            },
            (err) => {
                geoBtn.classList.remove('loading');
                geoBtnText.textContent = 'Sélectionner mon emplacement';
                if (typeof lucide !== 'undefined') lucide.createIcons();

                const msgs = {
                    1: 'Accès refusé. Veuillez autoriser la localisation dans les paramètres de votre navigateur.',
                    2: 'Impossible de détecter votre position. Vérifiez votre connexion.',
                    3: 'La demande de localisation a expiré. Réessayez.'
                };
                alert(msgs[err.code] || 'Erreur de géolocalisation.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    /** Reset: hide result, show button again */
    function resetGeo() {
        document.getElementById('mapLat').value     = '';
        document.getElementById('mapLng').value     = '';
        document.getElementById('mapAddress').value = '';
        geoResult.style.display = 'none';
        geoBtn.style.display    = 'flex';
        geoBtn.classList.remove('loading');
        geoBtnText.textContent  = 'Sélectionner mon emplacement';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /* Toggle buttons */
    if (btnNon && btnOui && livraisonVal && geoSection) {
        btnNon.addEventListener('click', () => {
            btnNon.classList.add('active');
            btnOui.classList.remove('active');
            livraisonVal.value = 'Non';
            geoSection.style.display = 'none';
            resetGeo();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        btnOui.addEventListener('click', () => {
            btnOui.classList.add('active');
            btnNon.classList.remove('active');
            livraisonVal.value = 'Oui';
            geoSection.style.display = 'block';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    if (geoBtn)   geoBtn.addEventListener('click', detectLocation);
    if (geoReset) geoReset.addEventListener('click', resetGeo);

    // ----- 7. WhatsApp Order Form -----
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', e => {
            e.preventDefault();

            const name        = document.getElementById('name')?.value.trim()        || '';
            const product     = document.getElementById('product')?.value.trim()     || '';
            const quantity    = document.getElementById('quantity')?.value.trim()    || '';
            const contactInfo = document.getElementById('contactInfo')?.value.trim() || '';
            const livraison   = livraisonVal ? livraisonVal.value : 'Non';

            if (!name || !product || !quantity || !contactInfo) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            const lat     = document.getElementById('mapLat')?.value     || '';
            const lng     = document.getElementById('mapLng')?.value     || '';
            const address = document.getElementById('mapAddress')?.value || '';

            if (livraison === 'Oui' && !lat) {
                alert('📍 Veuillez indiquer votre adresse de livraison sur la carte.');
                document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Compose the WhatsApp message
            let msg = `🛒 *Nouvelle commande — Cabane du Fermier*\n\n`;
            msg += `👤 *Nom :* ${name}\n`;
            msg += `📦 *Produit(s) :* ${product}\n`;
            msg += `🔢 *Quantité :* ${quantity}\n`;
            msg += `📱 *WhatsApp :* ${contactInfo}\n`;
            msg += `🚚 *Livraison à domicile :* ${livraison}\n`;

            if (livraison === 'Oui') {
                msg += `\n📍 *Adresse de livraison :*\n${address}\n`;
                if (lat && lng) {
                    msg += `🗺️ *Voir sur Google Maps :* https://maps.google.com/?q=${lat},${lng}\n`;
                }
            }

            msg += `\nMerci de traiter ma commande. 🙏`;

            window.open(
                `https://wa.me/2290191666617?text=${encodeURIComponent(msg)}`,
                '_blank'
            );
        });
    }

    // ----- 8. Scroll Reveal Animation -----
    const revealEls = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const wh = window.innerHeight;
        revealEls.forEach(el => {
            if (el.getBoundingClientRect().top < wh - 120) el.classList.add('active');
        });
    };
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();

    // ----- 9. Smooth Scroll for Anchor Links -----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - (navbar ? navbar.offsetHeight : 0),
                    behavior: 'smooth'
                });
            }
        });
    });

});

// --- Cookie Consent Banner ---
document.addEventListener('DOMContentLoaded', () => {
    const consentMode = localStorage.getItem('cookie_consent');

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="container cookie-content">
            <div class="cookie-text">
                <h3>🍪 Respect de votre vie privée</h3>
                <p>Nous utilisons des cookies pour améliorer votre expérience sur la Cabane du Fermier, analyser notre trafic et vous proposer des offres adaptées.</p>
            </div>
            <div class="cookie-buttons">
                <button class="btn btn-outline cookie-btn-refuse" id="btnRefuseCookies">Refuser</button>
                <button class="btn btn-primary cookie-btn-accept" id="btnAcceptCookies">Tout Accepter</button>
            </div>
        </div>
    `;

    if (!consentMode) {
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
    } else if (consentMode === 'granted') {
        updateGtmConsent('granted');
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'btnAcceptCookies') {
            localStorage.setItem('cookie_consent', 'granted');
            updateGtmConsent('granted');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 500);
        } else if (e.target.id === 'btnRefuseCookies') {
            localStorage.setItem('cookie_consent', 'denied');
            updateGtmConsent('denied');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 500);
        }
    });

    function updateGtmConsent(status) {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'update', {
            'ad_storage': status,
            'ad_user_data': status,
            'ad_personalization': status,
            'analytics_storage': status
        });
        dataLayer.push({'event': 'consent_update'});
    }
});
