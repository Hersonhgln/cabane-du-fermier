css_code = """
/* Cookie Banner */
.cookie-banner {
    position: fixed;
    bottom: -150%;
    left: 0;
    width: 100%;
    background: #fff;
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    transition: bottom 0.5s ease-in-out;
    padding: 1.5rem;
    border-top: 4px solid var(--primary);
}
.cookie-banner.show {
    bottom: 0;
}
.cookie-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
}
.cookie-text h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
    color: var(--primary-dark);
}
.cookie-text p {
    color: var(--text);
    font-size: 0.95rem;
    margin: 0;
}
.cookie-buttons {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
}
.cookie-btn-refuse {
    border-color: var(--text-light);
    color: var(--text-light);
}
.cookie-btn-refuse:hover {
    background: var(--text-light);
    color: #fff;
}
@media (max-width: 768px) {
    .cookie-content {
        flex-direction: column;
        text-align: center;
    }
    .cookie-buttons {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}
"""

js_code = """
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
"""

with open('css/styles.css', 'a', encoding='utf-8') as f:
    f.write(css_code)

with open('script.js', 'a', encoding='utf-8') as f:
    f.write(js_code)
