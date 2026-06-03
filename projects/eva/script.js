/* =========================================================
   Eva Beauty Clinic — Interactivity
   ========================================================= */

// ---------- Shared service data ----------
const SERVICES = [
    {
        id: 'hydrafacial',
        icon: '💧',
        name: 'Signature HydraFacial',
        desc: 'Deep cleanse, exfoliation, and hydration in one luxurious 60-minute session.',
        price: 149,
        duration: 60,
    },
    {
        id: 'laser',
        icon: '✨',
        name: 'Laser Hair Removal',
        desc: 'Precision diode laser for smooth, lasting results on all skin tones.',
        price: 199,
        duration: 45,
    },
    {
        id: 'antiaging',
        icon: '🌹',
        name: 'Anti-Aging Treatment',
        desc: 'Microneedling with radiofrequency to lift, firm, and rejuvenate skin.',
        price: 289,
        duration: 90,
    },
    {
        id: 'massage',
        icon: '🌸',
        name: 'Aromatherapy Massage',
        desc: 'A 75-minute escape with essential oils to relax body and mind.',
        price: 129,
        duration: 75,
    },
    {
        id: 'lash',
        icon: '👁️',
        name: 'Lash Extensions',
        desc: 'Custom-mapped, hand-applied silk lashes for an effortless flutter.',
        price: 119,
        duration: 90,
    },
    {
        id: 'peel',
        icon: '🍑',
        name: 'Glow Chemical Peel',
        desc: 'Brighten and even tone with a gentle medical-grade peel.',
        price: 169,
        duration: 45,
    },
];

// ---------- Utilities ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmtPrice = (n) => `$${n.toFixed(0)}`;
const fmtDuration = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 || ''}m`.trim() : `${m} min`);

// ---------- Auth helpers ----------
function getLoggedInUser() {
    try { return JSON.parse(localStorage.getItem('eva_current_user') || 'null'); }
    catch { return null; }
}

function renderNavAuth() {
    $$('#navAuthArea').forEach((area) => {
        const user = getLoggedInUser();
        if (user) {
            area.innerHTML = `
                <span class="nav-user">Hi, ${user.name.split(' ')[0]}</span>
                <button class="nav-logout" id="navLogout">Logout</button>
            `;
            area.querySelector('#navLogout')?.addEventListener('click', () => {
                localStorage.removeItem('eva_current_user');
                window.location.reload();
            });
        } else {
            area.innerHTML = `
                <a href="login.html">Login</a>
                <a href="signup.html" class="btn btn-ghost nav-cta">Sign Up</a>
            `;
        }
    });
}

// ---------- Common: navbar + footer year ----------
document.addEventListener('DOMContentLoaded', () => {
    // Year
    $$('#year').forEach((el) => (el.textContent = new Date().getFullYear()));

    // Auth nav
    renderNavAuth();

    // Sticky shadow on scroll
    const navbar = $('#navbar');
    const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    const menuToggle = $('#menuToggle');
    const navLinks = $('#navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                menuToggle.classList.remove('open');
                navLinks.classList.remove('open');
            }
        });
    }

    // Render services grid on home page
    renderServicesGrid();

    // Initialize booking page if present
    if ($('#bookingForm')) initBooking();
});

// ---------- Services grid on home page ----------
function renderServicesGrid() {
    const grid = $('#servicesGrid');
    if (!grid) return;
    grid.innerHTML = SERVICES.map(
        (s) => `
        <article class="service-card">
            <div class="service-icon">${s.icon}</div>
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
            <div class="service-meta">
                <span class="service-price">${fmtPrice(s.price)}</span>
                <span class="service-duration">${fmtDuration(s.duration)}</span>
            </div>
        </article>`
    ).join('');
}

/* =========================================================
   Booking logic
   ========================================================= */
function initBooking() {
    const form = $('#bookingForm');
    const optionsWrap = $('#serviceOptions');
    const dateInput = $('#date');
    const slotsWrap = $('#timeSlots');
    const stepsNav = $$('.steps li');
    const steps = $$('.step');
    let currentStep = 1;

    const state = {
        services: [],   // array — supports multiple selections
        specialist: '',
        date: '',
        time: '',
    };

    // Pre-select service from URL: booking.html?service=hydrafacial
    const urlService = new URLSearchParams(location.search).get('service');

    // Render service options as checkboxes
    optionsWrap.innerHTML = SERVICES.map(
        (s) => `
        <label class="service-option" data-id="${s.id}">
            <input type="checkbox" name="service" value="${s.id}" />
            <div class="service-option-icon">${s.icon}</div>
            <div class="service-option-info">
                <strong>${s.name}</strong>
                <span>${fmtDuration(s.duration)}</span>
            </div>
            <div class="service-option-price">${fmtPrice(s.price)}</div>
        </label>`
    ).join('');

    optionsWrap.addEventListener('click', (e) => {
        const option = e.target.closest('.service-option');
        if (!option) return;
        const cb = $('input[type="checkbox"]', option);
        cb.checked = !cb.checked;
        option.classList.toggle('selected', cb.checked);
        const svc = SERVICES.find((s) => s.id === option.dataset.id);
        if (cb.checked) {
            if (!state.services.find((s) => s.id === svc.id)) state.services.push(svc);
        } else {
            state.services = state.services.filter((s) => s.id !== svc.id);
        }
    });

    if (urlService) {
        const target = optionsWrap.querySelector(`[data-id="${urlService}"]`);
        if (target) target.click();
    }

    // Specialist
    $('#specialist').addEventListener('change', (e) => {
        state.specialist = e.target.value;
    });

    // Date — min today, default tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const toISO = (d) => d.toISOString().split('T')[0];
    dateInput.min = toISO(today);
    dateInput.value = toISO(tomorrow);
    state.date = dateInput.value;
    renderSlots(state.date);

    dateInput.addEventListener('change', () => {
        state.date = dateInput.value;
        state.time = '';
        renderSlots(state.date);
    });

    function renderSlots(dateStr) {
        const baseSlots = ['09:00', '09:45', '10:30', '11:15', '12:00', '13:30', '14:15', '15:00', '15:45', '16:30', '17:15', '18:00', '18:45'];
        const dayKey = dateStr || 'x';
        const unavailable = new Set();
        let seed = [...dayKey].reduce((a, c) => a + c.charCodeAt(0), 0);
        const rand = () => ((seed = (seed * 9301 + 49297) % 233280), seed / 233280);
        const blockCount = 2 + Math.floor(rand() * 3);
        while (unavailable.size < blockCount) {
            unavailable.add(baseSlots[Math.floor(rand() * baseSlots.length)]);
        }
        slotsWrap.innerHTML = baseSlots
            .map((t) => {
                const isOff = unavailable.has(t);
                return `<button type="button" class="time-slot ${isOff ? 'unavailable' : ''}" data-time="${t}" ${isOff ? 'disabled' : ''}>${t}</button>`;
            })
            .join('');
    }

    slotsWrap.addEventListener('click', (e) => {
        const slot = e.target.closest('.time-slot');
        if (!slot || slot.classList.contains('unavailable')) return;
        $$('.time-slot', slotsWrap).forEach((s) => s.classList.remove('selected'));
        slot.classList.add('selected');
        state.time = slot.dataset.time;
    });

    // Step navigation
    function goToStep(n) {
        if (n < 1 || n > steps.length) return;
        if (n > currentStep && !validateStep(currentStep)) return;
        steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === n));
        stepsNav.forEach((s) => {
            const num = Number(s.dataset.step);
            s.classList.toggle('active', num === n);
            s.classList.toggle('completed', num < n);
        });
        currentStep = n;
        window.scrollTo({ top: $('.booking-form').offsetTop - 100, behavior: 'smooth' });
    }

    $$('[data-next]', form).forEach((b) => b.addEventListener('click', () => goToStep(currentStep + 1)));
    $$('[data-prev]', form).forEach((b) => b.addEventListener('click', () => goToStep(currentStep - 1)));
    stepsNav.forEach((s) =>
        s.addEventListener('click', () => {
            const target = Number(s.dataset.step);
            if (target <= currentStep) goToStep(target);
        })
    );

    function validateStep(n) {
        if (n === 1) {
            if (state.services.length === 0) {
                flash('Please choose at least one service to continue.');
                return false;
            }
        }
        if (n === 2) {
            if (!state.date) { flash('Please pick a date.'); return false; }
            if (!state.time) { flash('Please pick a time slot.'); return false; }
        }
        return true;
    }

    // Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateStep(1) || !validateStep(2)) return;
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const totalPrice    = state.services.reduce((sum, s) => sum + s.price, 0);
        const totalDuration = state.services.reduce((sum, s) => sum + s.duration, 0);
        const booking = {
            id: 'EVA-' + Date.now().toString(36).toUpperCase(),
            services: state.services,
            specialist: state.specialist || 'No preference',
            date: state.date,
            time: state.time,
            totalPrice,
            totalDuration,
            firstName: $('#firstName').value.trim(),
            lastName: $('#lastName').value.trim(),
            email: $('#email').value.trim(),
            phone: $('#phone').value.trim(),
            notes: $('#notes').value.trim(),
            createdAt: new Date().toISOString(),
        };
        saveBooking(booking);
        showConfirmation(booking);
    });

    function saveBooking(b) {
        try {
            const list = JSON.parse(localStorage.getItem('eva_bookings') || '[]');
            list.push(b);
            localStorage.setItem('eva_bookings', JSON.stringify(list));
        } catch (err) {
            console.warn('Could not save booking locally.', err);
        }
    }

    function showConfirmation(b) {
        $('#confName').textContent = b.firstName || 'friend';
        const serviceLines = b.services.map((s) => `<li>${s.icon} ${s.name}: ${fmtPrice(s.price)}</li>`).join('');
        $('#confirmDetails').innerHTML = `
            <div><strong>Booking #</strong><span>${b.id}</span></div>
            <div class="confirm-services-row"><strong>Services</strong><ul class="confirm-services-list">${serviceLines}</ul></div>
            <div><strong>Date</strong><span>${formatDate(b.date)}</span></div>
            <div><strong>Time</strong><span>${b.time}</span></div>
            <div><strong>Total Duration</strong><span>${fmtDuration(b.totalDuration)}</span></div>
            <div><strong>Specialist</strong><span>${b.specialist}</span></div>
            <div class="total-row"><strong>Total</strong><span>${fmtPrice(b.totalPrice)}</span></div>
        `;
        $('#bookingSection').hidden = true;
        $('#confirmationPage').hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    $('#bookAnotherBtn').addEventListener('click', () => {
        $('#confirmationPage').hidden = true;
        $('#bookingSection').hidden = false;
        form.reset();
        state.services = [];
        state.specialist = '';
        state.time = '';
        $$('.service-option', optionsWrap).forEach((o) => o.classList.remove('selected'));
        $$('.time-slot', slotsWrap).forEach((s) => s.classList.remove('selected'));
        goToStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function formatDate(iso) {
    if (!iso) return 'N/A';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------- Toast ----------
let flashTimer;
function flash(msg) {
    let el = document.getElementById('evaToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'evaToast';
        Object.assign(el.style, {
            position: 'fixed',
            left: '50%',
            bottom: '32px',
            transform: 'translateX(-50%) translateY(20px)',
            background: '#2a1f22',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: '500',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            opacity: '0',
            transition: 'all 0.25s ease',
            zIndex: '2000',
            pointerEvents: 'none',
        });
        document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
}
