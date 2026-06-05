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

    // ----- 5b. Cart Logic & Dynamic Ordering -----
    const cart = {}; // cart state: key = productId + "_" + optionId, value = { product, optionId, optionName, price, qty }

    function updateCartUI() {
        let total = 0;
        const listEl = document.getElementById('cart-items-list');
        const emptyMsg = document.getElementById('cart-empty-msg');
        const totalContainer = document.getElementById('cart-total-container');
        const totalPriceEl = document.getElementById('cart-total-price');
        const submitBtn = document.getElementById('submitOrderBtn');

        if (!listEl) return;

        listEl.innerHTML = '';
        let hasItems = false;

        Object.values(cart).forEach(item => {
            if (item.qty > 0) {
                hasItems = true;
                const subtotal = item.price * item.qty;
                total += subtotal;

                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.product}</span>
                        <span class="cart-item-option">${item.optionName} x ${item.qty}</span>
                    </div>
                    <span class="cart-item-price">${subtotal} F</span>
                `;
                listEl.appendChild(li);
            }
        });

        if (hasItems) {
            emptyMsg.style.display = 'none';
            listEl.style.display = 'flex';
            totalContainer.style.display = 'flex';
            totalPriceEl.textContent = total + ' F';
            submitBtn.removeAttribute('disabled');
        } else {
            emptyMsg.style.display = 'flex';
            listEl.style.display = 'none';
            totalContainer.style.display = 'none';
            submitBtn.setAttribute('disabled', 'true');
        }

        // Update product cards UI
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.getAttribute('data-product-id');
            const activeOptionBtn = card.querySelector('.option-pill.active');
            if (activeOptionBtn) {
                const optionId = activeOptionBtn.getAttribute('data-option');
                const cartKey = productId + "_" + optionId;
                const qty = cart[cartKey] ? cart[cartKey].qty : 0;
                
                const addBtn = card.querySelector('.add-btn');
                const qtyControl = card.querySelector('.qty-control');
                const qtyVal = card.querySelector('.qty-val');
                const badge = card.querySelector('.product-selected-badge');

                if (qty > 0) {
                    if (addBtn) addBtn.style.display = 'none';
                    if (qtyControl) qtyControl.style.display = 'flex';
                    if (qtyVal) qtyVal.textContent = qty;
                    if (badge) badge.style.opacity = '1';
                } else {
                    if (addBtn) addBtn.style.display = 'inline-flex';
                    if (qtyControl) qtyControl.style.display = 'none';
                    if (badge) badge.style.opacity = '0';
                }
            }
        });
    }

    function updateCardPriceDisplay(card, optionBtn) {
        const price = optionBtn.getAttribute('data-price');
        const display = card.querySelector('.product-price-display');
        if (display) display.textContent = price + ' F';
    }

    // Option pills click handlers
    document.querySelectorAll('.option-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            // Remove active class from siblings
            card.querySelectorAll('.option-pill').forEach(sib => sib.classList.remove('active'));
            btn.classList.add('active');
            updateCardPriceDisplay(card, btn);
            updateCartUI(); // Update UI to reflect the selected option's quantity
        });
    });

    // Add to cart button
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const productId = card.getAttribute('data-product-id');
            const productName = card.querySelector('.product-name').textContent;
            const activeOptionBtn = card.querySelector('.option-pill.active');
            
            if (activeOptionBtn) {
                const optionId = activeOptionBtn.getAttribute('data-option');
                const optionName = activeOptionBtn.getAttribute('data-name');
                const price = parseInt(activeOptionBtn.getAttribute('data-price'));
                const cartKey = productId + "_" + optionId;

                if (!cart[cartKey]) {
                    cart[cartKey] = { product: productName, optionId, optionName, price, qty: 0 };
                }
                cart[cartKey].qty = 1;
                updateCartUI();
                
                // Scroll to commander section on first add
                let totalItems = 0;
                Object.values(cart).forEach(item => totalItems += item.qty);
                if (totalItems === 1) {
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
            }
        });
    });

    // Quantity minus/plus
    document.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const productId = card.getAttribute('data-product-id');
            const activeOptionBtn = card.querySelector('.option-pill.active');
            if (activeOptionBtn) {
                const optionId = activeOptionBtn.getAttribute('data-option');
                const cartKey = productId + "_" + optionId;
                if (cart[cartKey] && cart[cartKey].qty > 0) {
                    cart[cartKey].qty--;
                    updateCartUI();
                }
            }
        });
    });
    document.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const productId = card.getAttribute('data-product-id');
            const activeOptionBtn = card.querySelector('.option-pill.active');
            if (activeOptionBtn) {
                const optionId = activeOptionBtn.getAttribute('data-option');
                const cartKey = productId + "_" + optionId;
                if (cart[cartKey]) {
                    cart[cartKey].qty++;
                    updateCartUI();
                }
            }
        });
    });

    // ----- 6. Livraison Toggle -----
    const btnNon       = document.getElementById('livraisonNon');
    const btnOui       = document.getElementById('livraisonOui');
    const livraisonVal = document.getElementById('livraisonValue');
    const addressSection = document.getElementById('addressSection');
    const addressInput = document.getElementById('address');

    if (btnNon && btnOui && livraisonVal && addressSection) {
        btnNon.addEventListener('click', () => {
            btnNon.classList.add('active');
            btnOui.classList.remove('active');
            livraisonVal.value = 'Non';
            addressSection.style.display = 'none';
            if (addressInput) addressInput.removeAttribute('required');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        btnOui.addEventListener('click', () => {
            btnOui.classList.add('active');
            btnNon.classList.remove('active');
            livraisonVal.value = 'Oui';
            addressSection.style.display = 'flex';
            if (addressInput) addressInput.setAttribute('required', 'true');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    // ----- 7. WhatsApp Order Form Submit -----
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', e => {
            e.preventDefault();

            const name        = document.getElementById('name')?.value.trim()        || '';
            const contactInfo = document.getElementById('contactInfo')?.value.trim() || '';
            const livraison   = livraisonVal ? livraisonVal.value : 'Non';
            const address     = addressInput?.value.trim() || '';

            if (!name || !contactInfo) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            if (livraison === 'Oui' && !address) {
                alert('Veuillez indiquer votre adresse de livraison.');
                addressInput.focus();
                return;
            }

            let msg = `🛒 *Nouvelle commande — Cabane du Fermier*\n\n`;
            
            let orderTotal = 0;
            let hasItems = false;
            Object.values(cart).forEach(item => {
                if (item.qty > 0) {
                    hasItems = true;
                    const subtotal = item.price * item.qty;
                    orderTotal += subtotal;
                    msg += `- ${item.product} (${item.optionName}) x${item.qty} : ${subtotal} F\n`;
                }
            });

            if (!hasItems) {
                alert('Votre panier est vide.');
                return;
            }

            msg += `\n*Total : ${orderTotal} F*\n\n`;
            msg += `👤 *Nom :* ${name}\n`;
            msg += `📱 *WhatsApp / Contact :* ${contactInfo}\n`;
            msg += `🚚 *Livraison :* ${livraison === 'Oui' ? 'À domicile' : 'Retrait sur place'}\n`;

            if (livraison === 'Oui') {
                msg += `📍 *Adresse et indications :*\n${address}\n`;
            }

            msg += `\nMerci de traiter ma commande. 🙏`;

            window.open(
                `https://wa.me/2290191666617?text=${encodeURIComponent(msg)}`,
                '_blank'
            );
        });
    }

    // Initialize UI on load
    updateCartUI();

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
