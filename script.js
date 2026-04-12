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

    // ----- 6. Livraison Toggle + Leaflet Map -----
    const btnNon      = document.getElementById('livraisonNon');
    const btnOui      = document.getElementById('livraisonOui');
    const livraisonVal = document.getElementById('livraisonValue');
    const mapSection  = document.getElementById('mapSection');

    let leafletMap = null;
    let marker     = null;

    /** Build the custom green teardrop icon */
    function mkIcon() {
        return L.divIcon({
            className: '',
            html: `<div style="
                width:32px;height:32px;
                background:linear-gradient(135deg,#2d6a4f,#52b788);
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                border:3px solid #fff;
                box-shadow:0 3px 10px rgba(27,67,50,.4);
            "></div>`,
            iconSize:   [32, 32],
            iconAnchor: [16, 32]
        });
    }

    /** Place / move marker and read back the address */
    function placeMarker(lat, lng, address) {
        if (!leafletMap) return;
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng], { icon: mkIcon(), draggable: true }).addTo(leafletMap);
            marker.on('dragend', ev => {
                const p = ev.target.getLatLng();
                reverseGeocode(p.lat, p.lng);
            });
        }
        document.getElementById('mapLat').value = lat.toFixed(6);
        document.getElementById('mapLng').value  = lng.toFixed(6);
        if (address) {
            document.getElementById('mapAddress').value    = address;
            document.getElementById('mapLocationText').textContent = address;
        } else {
            reverseGeocode(lat, lng);
        }
        leafletMap.setView([lat, lng], 15);
    }

    /** Reverse geocoding: coordinates → human-readable address */
    function reverseGeocode(lat, lng) {
        document.getElementById('mapLocationText').textContent = '📍 Localisation en cours…';
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            .then(r => r.json())
            .then(data => {
                const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                document.getElementById('mapAddress').value    = addr;
                document.getElementById('mapLocationText').textContent = addr;
            })
            .catch(() => {
                const fb = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                document.getElementById('mapAddress').value    = fb;
                document.getElementById('mapLocationText').textContent = fb;
            });
    }

    /** Forward geocoding: text → coordinates (Bénin first, then worldwide) */
    function searchAddress(query) {
        if (!query.trim()) return;
        document.getElementById('mapLocationText').textContent = '🔍 Recherche en cours…';

        const bjUrl  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=bj`;
        const allUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

        fetch(bjUrl)
            .then(r => r.json())
            .then(res => res.length ? res : fetch(allUrl).then(r => r.json()))
            .then(res => {
                if (res && res.length > 0) {
                    placeMarker(parseFloat(res[0].lat), parseFloat(res[0].lon), res[0].display_name);
                } else {
                    document.getElementById('mapLocationText').textContent =
                        '❌ Adresse introuvable — cliquez directement sur la carte.';
                }
            })
            .catch(() => {
                document.getElementById('mapLocationText').textContent =
                    '❌ Erreur réseau. Cliquez directement sur la carte.';
            });
    }

    /** Initialize Leaflet map (only once) */
    function initMap() {
        if (leafletMap) { leafletMap.invalidateSize(); return; }

        // Centred on Cotonou, Bénin
        leafletMap = L.map('map').setView([6.3654, 2.4183], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(leafletMap);

        leafletMap.on('click', e => placeMarker(e.latlng.lat, e.latlng.lng, null));

        // Give the DOM time to render before forcing tile refresh
        setTimeout(() => leafletMap.invalidateSize(), 250);
    }

    /* Toggle buttons */
    if (btnNon && btnOui && livraisonVal && mapSection) {
        btnNon.addEventListener('click', () => {
            btnNon.classList.add('active');
            btnOui.classList.remove('active');
            livraisonVal.value = 'Non';
            mapSection.style.display = 'none';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        btnOui.addEventListener('click', () => {
            btnOui.classList.add('active');
            btnNon.classList.remove('active');
            livraisonVal.value = 'Oui';
            mapSection.style.display = 'block';
            initMap();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    /* Map search — button & Enter key */
    const mapSearchBtn   = document.getElementById('mapSearchBtn');
    const mapSearchInput = document.getElementById('mapSearchInput');
    if (mapSearchBtn && mapSearchInput) {
        mapSearchBtn.addEventListener('click', () => searchAddress(mapSearchInput.value));
        mapSearchInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); searchAddress(mapSearchInput.value); }
        });
    }

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
