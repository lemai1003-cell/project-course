// Firebase Configuration (Compat version)
const firebaseConfig = {
    apiKey: "AIzaSyDJsvWI-J9pc-JhzheR_C4xQXhCNbWDnFI",
    authDomain: "project-course-985d2.firebaseapp.com",
    projectId: "project-course-985d2",
    storageBucket: "project-course-985d2.firebasestorage.app",
    messagingSenderId: "332733702113",
    appId: "1:332733702113:web:fa1503e178361455d83ca0",
    measurementId: "G-SG3NJ1FHXG",
    databaseURL: "https://project-course-985d2-default-rtdb.firebaseio.com/" 
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const db = firebase.firestore();

// ============================================
// TELEGRAM CONFIG
// ============================================
const TELEGRAM_BOT_TOKEN = '8601457526:AAEDpglDCgTX_qBoRDWNddVXK4MR-IS4AwE';
const TELEGRAM_CHAT_ID = '644667498';

async function sendTelegramNotification(email, phone, totalCount) {
    const message =
        `🔔 Có học viên yêu cầu TƯ VẤN!\n\n` +
        `📧 Email: ${email || 'Chưa nhập'}\n` +
        `📞 SĐT: ${phone || 'Chưa nhập'}\n` +
        `👥 Tổng yêu cầu: ${totalCount}`;
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
        });
    } catch (err) {
        console.error('Lỗi gửi Telegram:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const emailField = document.getElementById('emailField');
    const phoneField = document.getElementById('phoneField');
    const tuvanBtn = document.getElementById('tuvan-btn');
    const dangkyBtn = document.getElementById('dangky-btn');
    const googleBtnContainer = document.getElementById('googleBtnContainer');
    const googleUserInfo = document.getElementById('googleUserInfo');
    const googleUserAvatar = document.getElementById('googleUserAvatar');
    const googleUserEmail = document.getElementById('googleUserEmail');
    const googleLogoutBtn = document.getElementById('googleLogoutBtn');
    const googleCustomBtn = document.getElementById('googleCustomBtn');

    // 2. Logic Kiểm tra nút bấm nội bộ
    function updateButtonState() {
        const isEmailOk = emailField && emailField.value.trim() !== "";
        const isPhoneOk = phoneField && phoneField.value.trim() !== "";
        
        // Đăng ký: Cần SĐT
        if (dangkyBtn) {
            dangkyBtn.disabled = !isPhoneOk;
            dangkyBtn.style.opacity = isPhoneOk ? "1" : "0.5";
            dangkyBtn.style.cursor = isPhoneOk ? "pointer" : "not-allowed";
        }
        // Tư vấn: Cần cả Email & SĐT
        if (tuvanBtn) {
            tuvanBtn.disabled = !(isEmailOk && isPhoneOk);
            tuvanBtn.style.opacity = (isEmailOk && isPhoneOk) ? "1" : "0.5";
            tuvanBtn.style.cursor = (isEmailOk && isPhoneOk) ? "pointer" : "not-allowed";
        }
    }

    if (emailField) emailField.addEventListener('input', updateButtonState);
    if (phoneField) phoneField.addEventListener('input', updateButtonState);
    updateButtonState();

    // 3. Google Login logic
    window.handleGoogleLoginCTA = (response) => {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        if (emailField) emailField.value = payload.email;
        if (googleCustomBtn) googleCustomBtn.classList.add('hidden');
        if (googleUserInfo) googleUserInfo.classList.remove('hidden');
        googleUserAvatar.src = payload.picture;
        googleUserEmail.textContent = payload.email;
        updateButtonState();
    };

    setTimeout(() => {
        if (window.google && googleBtnContainer) {
            google.accounts.id.initialize({
                client_id: "336018277787-0prgo2k750aft6678cdeioqgptic9kq3.apps.googleusercontent.com",
                callback: handleGoogleLoginCTA
            });
            google.accounts.id.renderButton(googleBtnContainer, { type: "icon", shape: "circle" });
        }
    }, 600);

    if (googleCustomBtn) googleCustomBtn.addEventListener('click', () => google.accounts.id.prompt());
    if (googleLogoutBtn) googleLogoutBtn.addEventListener('click', () => {
        googleUserInfo.classList.add('hidden');
        googleCustomBtn.classList.remove('hidden');
        if (emailField) emailField.value = '';
        updateButtonState();
    });

    // 4. Submit TƯ VẤN (Sử dụng Realtime Database)
    if (tuvanBtn) {
        tuvanBtn.addEventListener('click', async () => {
            const email = emailField.value.trim();
            const phone = phoneField.value.trim();
            tuvanBtn.disabled = true;
            tuvanBtn.textContent = 'Đang gửi...';

            try {
                const tuvanRef = database.ref("tuvan_requests");
                await tuvanRef.push({
                    email, phone, timestamp: firebase.database.ServerValue.TIMESTAMP
                });

                const snapshot = await tuvanRef.get();
                const totalCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                await sendTelegramNotification(email, phone, totalCount);

                alert('Yêu cầu tư vấn đã được gởi thành công!');
            } catch (error) {
                alert('Lỗi: ' + error.message);
            } finally {
                tuvanBtn.disabled = false;
                tuvanBtn.textContent = 'TƯ VẤN';
                updateButtonState();
            }
        });
    }

    // 5. Submit ĐĂNG KÝ
    if (dangkyBtn) {
        dangkyBtn.addEventListener('click', () => {
            const url = `https://test-techcamp.vercel.app/?at_email=${encodeURIComponent(emailField.value)}&at_phone=${encodeURIComponent(phoneField.value)}`;
            window.open(url, '_blank');
        });
    }

    // Scroll Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.feature-card, .timeline-item, .team-card, .hero-text, .hero-visual').forEach(el => observer.observe(el));
});
