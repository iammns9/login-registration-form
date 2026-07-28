document.addEventListener('DOMContentLoaded', () => {

    // Mock DB — swap with real API later
    const USERS = [
        { username: 'demo', email: 'demo@demo.com', password: 'demo1234', provider: 'local' }
    ];

    // Elements
    const wrapper    = document.querySelector('.login-wrapper');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const formTitle  = document.getElementById('form-title');
    const submitBtn  = document.getElementById('submit-btn');
    const form       = document.getElementById('auth-form');
    const message    = document.getElementById('form-message');
    const u          = document.getElementById('username');
    const e          = document.getElementById('email');
    const p          = document.getElementById('password');
    const cp         = document.getElementById('confirm-password');

    let mode = 'signin';

    // forgot Password
    document.body.insertAdjacentHTML('beforeend', `
        <div id="forgot-modal" style="display:none;position:fixed;inset:0;z-index:999;
            background:rgba(0,0,0,0.25);backdrop-filter:blur(4px);
            justify-content:center;align-items:center;">
            <div style="background:#fff;border:1px solid rgba(0,0,0,0.08);
                border-radius:20px;padding:36px 32px;width:340px;max-width:90vw;
                box-shadow:0 8px 40px rgba(0,0,0,0.12);position:relative;">
                <button id="forgot-close" style="position:absolute;top:14px;right:16px;
                    background:none;border:none;color:#1a1a2e;font-size:22px;
                    cursor:pointer;opacity:0.5;transition:0.2s;"
                    onmouseover="this.style.opacity='1'"
                    onmouseout="this.style.opacity='0.5'">✕</button>
                <h3 style="color:#1a1a2e;font-size:20px;font-weight:700;margin-bottom:8px;">Forgot Password</h3>
                <p style="color:rgba(0,0,0,0.45);font-size:13px;margin-bottom:20px;">
                    Enter your email and we'll send a reset link.</p>
                <input id="forgot-email" type="email" placeholder="Your email address"
                    style="width:100%;height:46px;padding:0 16px;border:1px solid rgba(0,0,0,0.12);
                    outline:none;border-radius:12px;background:#f5f7fa;color:#1a1a2e;
                    font-size:14px;margin-bottom:8px;">
                <div id="forgot-msg" style="min-height:18px;font-size:13px;text-align:center;margin-bottom:12px;"></div>
                <button id="forgot-submit" style="width:100%;height:46px;border:none;
                    border-radius:12px;background:#1a1a2e;color:#fff;font-size:15px;
                    font-weight:600;cursor:pointer;transition:0.3s;"
                    onmouseover="this.style.background='linear-gradient(135deg,#4facfe,#00f2fe)';this.style.color='#0d1b2a';this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.background='#1a1a2e';this.style.color='#fff';this.style.transform='translateY(0)'">
                    Send Reset Link</button>
            </div>
        </div>`);

    const modal       = document.getElementById('forgot-modal');
    const forgotEmail = document.getElementById('forgot-email');
    const forgotMsg   = document.getElementById('forgot-msg');

    document.querySelector('.forgot-link a').addEventListener('click', e => {
        e.preventDefault();
        forgotEmail.value = '';
        forgotMsg.textContent = '';
        modal.style.display = 'flex';
    });

    document.getElementById('forgot-close').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('forgot-submit').addEventListener('click', () => {
        const val = forgotEmail.value.trim();
        if (!val || !val.includes('@')) {
            forgotMsg.style.color = '#ff8080';
            forgotMsg.textContent = 'Please enter a valid email.';
            return;
        }
        if (!USERS.find(u => u.email === val)) {
            forgotMsg.style.color = '#ff8080';
            forgotMsg.textContent = 'No account found with that email.';
            return;
        }
        // TODO: real reset email
        forgotMsg.style.color = '#6ee7b7';
        forgotMsg.textContent = 'Reset link sent! Check your inbox.';
        setTimeout(() => modal.style.display = 'none', 2000);
    });

    // Toggle Sign In / Sign Up
    toggleBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

    function setMode(newMode) {
        mode = newMode;
        const isSignup = mode === 'signup';
        toggleBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        wrapper.classList.toggle('mode-signup', isSignup);
        formTitle.textContent = submitBtn.textContent = isSignup ? 'Sign Up' : 'Sign In';
        e.required  = isSignup;
        cp.required = isSignup;
        clearMessage();
        clearErrors();
        form.reset();
    }

    // Password toggle
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = document.getElementById(icon.dataset.target);
            const show  = input.type === 'password';
            input.type  = show ? 'text' : 'password';
            icon.classList.toggle('bx-hide', !show);
            icon.classList.toggle('bx-show', show);
        });
    });

    // Form submit
    form.addEventListener('submit', ev => {
        ev.preventDefault();
        clearMessage();
        clearErrors();
        mode === 'signin' ? signIn() : signUp();
    });

    function signIn() {
        const user = USERS.find(x => x.username === u.value.trim() && x.provider === 'local');
        if (!user)              return err(u, 'No account found with that username.');
        if (user.password !== p.value) return err(p, 'Incorrect password. Please try again.');
        showMessage(`Welcome back, ${u.value.trim()}!`, 'success');
    }

    function signUp() {
        const username = u.value.trim(), email = e.value.trim();
        if (!username || !email)                        return showMessage('Please fill in all fields.', 'error');
        if (USERS.some(x => x.username === username))   return err(u, 'That username is already taken.');
        if (USERS.some(x => x.email === email))         return err(e, 'That email is already registered.');
        if (p.value.length < 6)                         return err(p, 'Password must be at least 6 characters.');
        if (p.value !== cp.value)                       { fieldError(p); return err(cp, 'Passwords do not match.'); }
        USERS.push({ username, email, password: p.value, provider: 'local' });
        showMessage('Account created! You can now sign in.', 'success');
        setTimeout(() => setMode('signin'), 1200);
    }

    // Social buttons
    document.querySelectorAll('.social-icons a').forEach(link => {
        link.addEventListener('click', ev => {
            ev.preventDefault();
            const provider  = link.dataset.provider;
            const existing  = USERS.find(x => x.provider === provider);
            if (existing) {
                showMessage(`Signed in with ${cap(provider)}!`, 'success');
            } else {
                USERS.push({ username: `${provider}_user_${Math.floor(Math.random()*9000+1000)}`,
                    email: `user@${provider}.mock`, password: null, provider });
                showMessage(`Account created & signed in via ${cap(provider)}!`, 'success');
            }
        });
    });

    // Helpers
    function showMessage(text, type) {
        message.textContent = text;
        message.className = 'form-message' + (type === 'success' ? ' success' : '');
    }
    function clearMessage() { message.textContent = ''; message.className = 'form-message'; }

    function fieldError(input) {
        const box = input.closest('.input-box');
        box.classList.add('error');
        input.addEventListener('animationend', () => box.classList.remove('error'), { once: true });
    }
    function err(input, msg) { fieldError(input); showMessage(msg, 'error'); }
    function clearErrors() { document.querySelectorAll('.input-box.error').forEach(b => b.classList.remove('error')); }
    function cap(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

    setMode('signin');
});