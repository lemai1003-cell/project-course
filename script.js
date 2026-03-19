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

    // 3. Google Login logic với giải mã an toàn
    window.handleGoogleLoginCTA = (response) => {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
            
            if (emailField) emailField.value = payload.email;
            if (googleCustomBtn) googleCustomBtn.classList.add('hidden');
            if (googleUserInfo) googleUserInfo.classList.remove('hidden');
            if (googleUserAvatar) googleUserAvatar.src = payload.picture;
            if (googleUserEmail) googleUserEmail.textContent = payload.email;
            updateButtonState();
        } catch (e) { console.error("Login Error:", e); }
    };

    setTimeout(() => {
        if (window.google && googleBtnContainer) {
            google.accounts.id.initialize({
                client_id: "336018277787-0prgo2k750aft6678cdeioqgptic9kq3.apps.googleusercontent.com",
                callback: handleGoogleLoginCTA
            });
            // Vẽ nút dạng icon nhỏ (Bên trong nút custom của bạn)
            google.accounts.id.renderButton(googleBtnContainer, { theme: "outline", size: "large", type: "icon", shape: "circle" });
        }
    }, 800);

    // QUAN TRỌNG: Kích hoạt nút bấm chính
    if (googleCustomBtn) {
        googleCustomBtn.addEventListener('click', () => {
            if (window.google) google.accounts.id.prompt();
        });
    }

    if (googleLogoutBtn) {
        googleLogoutBtn.addEventListener('click', () => {
            if (googleUserInfo) googleUserInfo.classList.add('hidden');
            if (googleCustomBtn) googleCustomBtn.classList.remove('hidden');
            if (emailField) emailField.value = '';
            updateButtonState();
        });
    }

    // 4. Submit TƯ VẤN (Sử dụng Realtime Database)
    if (tuvanBtn) {
        tuvanBtn.addEventListener('click', async () => {
            const email = emailField.value.trim();
            const phone = phoneField.value.trim();
            tuvanBtn.disabled = true;
            tuvanBtn.textContent = 'Đang gửi...';

            try {
                const tuvanRef = database.ref("tuvan_requests");
                
                // Bước 1: Gửi dữ liệu (Quan trọng nhất)
                await tuvanRef.push({
                    email, 
                    phone, 
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });

                // Bước 2: Đếm nhanh số bài để báo Telegram
                let totalCount = 0;
                try {
                    const snapshot = await tuvanRef.get();
                    if (snapshot.exists()) {
                        totalCount = Object.keys(snapshot.val()).length;
                    }
                } catch (e) { console.warn("Lỗi đếm số lượng:", e); }

                // Bước 3: Thông báo Telegram
                await sendTelegramNotification(email, phone, totalCount);

                alert('Gửi hoàn tất! Dữ liệu đã được lưu vào Database.');
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
