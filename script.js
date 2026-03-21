// Firebase Configuration (Compat version)
const firebaseConfig = {
    apiKey: "AIzaSyDJsvWI-J9pc-JhzheR_C4xQXhCNbWDnFI",
    authDomain: "project-course-985d2.firebaseapp.com",
    projectId: "project-course-985d2",
    storageBucket: "project-course-985d2.firebasestorage.app",
    messagingSenderId: "332733702113",
    appId: "1:332733702113:web:fa1503e178361455d83ca0",
    measurementId: "G-SG3NJ1FHXG",
    databaseURL: "https://project-course-985d2-default-rtdb.asia-southeast1.firebasedatabase.app" // ĐÃ SỬA: Đúng khu vực Singapore/Đông Nam Á
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase initialized successfully.");
}

const database = firebase.database();
const db = firebase.firestore();

// ============================================
// TELEGRAM CONFIG
// ============================================
const TELEGRAM_BOT_TOKEN = '8601457526:AAEDpglDCgTX_qBoRDWNddVXK4MR-IS4AwE';
const TELEGRAM_CHAT_ID = '-5207532142';

async function sendTelegramNotification(email, phone, totalCount) {
    const message =
        `🔔 Có học viên yêu cầu TƯ VẤN!\n\n` +
        `📧 Email: ${email || 'Chưa nhập'}\n` +
        `📞 SĐT: ${phone || 'Chưa nhập'}\n` +
        `👥 Tổng yêu cầu: ${totalCount || '---'}`;
    
    // Gửi Telegram không để chặn luồng
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    }).catch(err => console.error('Telegram Error:', err));
}

document.addEventListener('DOMContentLoaded', () => {
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

    function updateButtonState() {
        const isEmailOk = emailField && emailField.value.trim() !== "";
        const isPhoneOk = phoneField && phoneField.value.trim() !== "";
        
        if (dangkyBtn) {
            dangkyBtn.disabled = !isPhoneOk;
            dangkyBtn.style.opacity = isPhoneOk ? "1" : "0.5";
            dangkyBtn.style.cursor = isPhoneOk ? "pointer" : "not-allowed";
        }
        if (tuvanBtn) {
            const active = isEmailOk && isPhoneOk;
            tuvanBtn.disabled = !active;
            tuvanBtn.style.opacity = active ? "1" : "0.5";
            tuvanBtn.style.cursor = active ? "pointer" : "not-allowed";
        }
    }

    if (emailField) emailField.addEventListener('input', updateButtonState);
    if (phoneField) phoneField.addEventListener('input', updateButtonState);
    updateButtonState();

    window.handleGoogleLoginCTA = (response) => {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
            if (emailField) emailField.value = payload.email;
            if (googleCustomBtn) googleCustomBtn.classList.add('hidden');
            if (googleUserInfo) googleUserInfo.classList.remove('hidden');
            googleUserAvatar.src = payload.picture;
            googleUserEmail.textContent = payload.email;
            updateButtonState();
        } catch (e) { console.error("Google Login Parse Error:", e); }
    };

    setTimeout(() => {
        if (window.google && googleBtnContainer) {
            google.accounts.id.initialize({
                client_id: "336018277787-0prgo2k750aft6678cdeioqgptic9kq3.apps.googleusercontent.com",
                callback: handleGoogleLoginCTA
            });
            google.accounts.id.renderButton(googleBtnContainer, { type: "icon", shape: "circle" });
        }
    }, 1000);

    if (googleCustomBtn) googleCustomBtn.addEventListener('click', () => { if (window.google) google.accounts.id.prompt(); });
    if (googleLogoutBtn) googleLogoutBtn.addEventListener('click', () => {
        googleUserInfo.classList.add('hidden');
        googleCustomBtn.classList.remove('hidden');
        if (emailField) emailField.value = '';
        updateButtonState();
    });

    // 4. Submit TƯ VẤN (Cấu trúc chống treo)
    if (tuvanBtn) {
        tuvanBtn.addEventListener('click', async () => {
            const email = emailField.value.trim();
            const phone = phoneField.value.trim();
            tuvanBtn.disabled = true;
            tuvanBtn.textContent = 'Đang gửi...';

            console.log("⏳ Bắt đầu gởi dữ liệu TƯ VẤN...");

            // TIMEOUT PROTECTOR: Sau 7 giây sẽ tự thoát nếu bị treo
            const timeout = setTimeout(() => {
                alert("Lỗi: Quá thời gian chờ (Timeout). Hãy kiểm tra Rules của Firebase Database!");
                tuvanBtn.disabled = false;
                tuvanBtn.textContent = 'TƯ VẤN';
            }, 7000);

            try {
                const tuvanRef = database.ref("tuvan_requests");
                
                // Gửi dữ liệu (Promise)
                await tuvanRef.push({
                    email, 
                    phone, 
                    timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                });
                console.log("✅ Dữ liệu đã được gởi lên Firebase.");

                // Lấy snapshot đếm số lượng (Cố gắng lấy, lỗi thì thôi)
                let total = 0;
                try {
                    const snap = await tuvanRef.get();
                    if (snap.exists()) total = Object.keys(snap.val()).length;
                } catch (e) { console.warn("Không đếm được số bài:", e); }

                clearTimeout(timeout);
                
                // Gửi Telegram (không chờ bản tin này xong)
                sendTelegramNotification(email, phone, total);

                alert('Gửi tư vấn thành công! Chúng tôi sẽ liên hệ bạn.');
            } catch (error) {
                clearTimeout(timeout);
                console.error("❌ Lỗi hệ thống:", error);
                alert('Có lỗi xảy ra: ' + error.message);
            } finally {
                tuvanBtn.disabled = false;
                tuvanBtn.textContent = 'TƯ VẤN';
                updateButtonState();
            }
        });
    }

    if (dangkyBtn) {
        dangkyBtn.addEventListener('click', () => {
            const url = `https://test-techcamp.vercel.app/?at_email=${encodeURIComponent(emailField.value)}&at_phone=${encodeURIComponent(phoneField.value)}`;
            window.open(url, '_blank');
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.feature-card, .timeline-item, .team-card, .hero-text, .hero-visual').forEach(el => observer.observe(el));

    // ============================================
    // NAVBAR: Scrolled class
    // ============================================
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});
