// Firebase Configuration (Compat version)
const firebaseConfig = {
  apiKey: "AIzaSyDJsvWI-J9pc-JhzheR_C4xQXhCNbWDnFI",
  authDomain: "project-course-985d2.firebaseapp.com",
  projectId: "project-course-985d2",
  storageBucket: "project-course-985d2.firebasestorage.app",
  messagingSenderId: "332733702113",
  appId: "1:332733702113:web:fa1503e178361455d83ca0",
  measurementId: "G-SG3NJ1FHXG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================
// TELEGRAM CONFIG
// ============================================
const TELEGRAM_BOT_TOKEN = '8601457526:AAEDpglDCgTX_qBoRDWNddVXK4MR-IS4AwE';
const TELEGRAM_CHAT_ID = '644667498';

async function sendTelegramNotification(email, phone, totalCount) {
    const message =
        `🔔 Có học viên yêu cầu tư vấn!\n\n` +
        `📧 Email: ${email || 'Chưa nhập'}\n` +
        `📞 SĐT: ${phone || 'Chưa nhập'}\n` +
        `👥 Tổng yêu cầu: ${totalCount}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
        });
    } catch (err) {
        console.error('Lỗi gửi Telegram:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#0f172a';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
            }
        });
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ============================================
    // GOOGLE SIGN-IN INTEGRATION
    // ============================================
    const GOOGLE_CLIENT_ID = "336018277787-0prgo2k750aft6678cdeioqgptic9kq3.apps.googleusercontent.com";

    const googleSignInGroup = document.getElementById('googleSignInGroup');
    const googleBtnContainer = document.getElementById('googleBtnContainer');
    const googleUserInfo = document.getElementById('googleUserInfo');
    const googleUserAvatar = document.getElementById('googleUserAvatar');
    const googleUserEmail = document.getElementById('googleUserEmail');
    const googleLogoutBtn = document.getElementById('googleLogoutBtn');
    const emailInput = document.getElementById('emailInput');
    const phoneGroup = document.getElementById('phoneGroup');
    const ctaBtns = document.getElementById('ctaBtns');

    // Callback khi đăng nhập Google thành công
    window.handleGoogleLoginCTA = (response) => {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')));

        // Cập nhật giao diện
        googleSignInGroup.classList.add('hidden');
        googleUserInfo.classList.remove('hidden');
        googleUserAvatar.src = payload.picture;
        googleUserEmail.textContent = payload.email;
        emailInput.value = payload.email;

        // Hiện SĐT và nút bấm
        phoneGroup.style.display = 'block';
        ctaBtns.style.display = 'flex';
    };

    // Khởi tạo nút Google Sign-In
    setTimeout(() => {
        if (window.google) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleLoginCTA
            });
            google.accounts.id.renderButton(
                googleBtnContainer,
                { theme: "outline", size: "large", shape: "pill", width: "260" }
            );
        }
    }, 600);

    // Đăng xuất Google
    if (googleLogoutBtn) {
        googleLogoutBtn.addEventListener('click', () => {
            googleUserInfo.classList.add('hidden');
            googleSignInGroup.classList.remove('hidden');
            phoneGroup.style.display = 'none';
            ctaBtns.style.display = 'none';
            if (emailInput) emailInput.value = '';
            const signupForm = document.querySelector('.signup-form');
            if (signupForm) signupForm.reset();
            if (window.google) google.accounts.id.disableAutoSelect();
        });
    }

    // ============================================
    // ĐĂNG KÝ Form Submission Handler
    // ============================================
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput ? emailInput.value : '';
            const phone = signupForm.querySelector('input[name="phone"]') ?
                          signupForm.querySelector('input[name="phone"]').value : '';

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Open new tab
            window.open('https://test-techcamp.vercel.app/', '_blank');

            try {
                submitBtn.textContent = 'Đang gửi...';
                submitBtn.disabled = true;

                await db.collection("registrations").add({
                    email: email,
                    phone: phone,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    source: "website"
                });

                alert('Đăng ký thành công!');
                signupForm.reset();

            } catch (error) {
                console.error("Error adding document: ", error);
                alert('Có lỗi xảy ra: ' + error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ============================================
    // TƯ VẤN Button Handler (Telegram notification)
    // ============================================
    const tuvanBtn = document.getElementById('tuvan-btn');
    if (tuvanBtn) {
        tuvanBtn.addEventListener('click', async () => {
            const email = emailInput ? emailInput.value : '';
            const phone = signupForm && signupForm.querySelector('input[name="phone"]') ?
                          signupForm.querySelector('input[name="phone"]').value : '';

            if (!email && !phone) {
                alert('Vui lòng đăng nhập Google hoặc nhập Số điện thoại trước khi yêu cầu tư vấn!');
                return;
            }

            tuvanBtn.textContent = 'Đang gửi...';
            tuvanBtn.disabled = true;

            try {
                await db.collection("tuvan_requests").add({
                    email: email,
                    phone: phone,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                const snapshot = await db.collection("tuvan_requests").get();
                const totalCount = snapshot.size;

                await sendTelegramNotification(email, phone, totalCount);

                alert('Yêu cầu tư vấn đã được gửi! Chúng tôi sẽ liên hệ bạn sớm nhất.');
                if (signupForm) signupForm.reset();

            } catch (error) {
                console.error('Lỗi gửi yêu cầu tư vấn:', error);
                alert('Có lỗi xảy ra: ' + error.message);
            } finally {
                tuvanBtn.textContent = 'TƯ VẤN';
                tuvanBtn.disabled = false;
            }
        });
    }

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.feature-card, .timeline-item, .team-card, .hero-text, .hero-visual');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleSheet);
});
