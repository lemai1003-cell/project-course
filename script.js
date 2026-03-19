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
    // FORM ELEMENTS
    // ============================================
    const emailField   = document.getElementById('emailField');
    const phoneField   = document.getElementById('phoneField');
    const tuvanBtn     = document.getElementById('tuvan-btn');
    const dangkyBtn    = document.getElementById('dangky-btn');

    // ============================================
    // GOOGLE SIGN-IN (auto-fill email only)
    // ============================================
    const GOOGLE_CLIENT_ID = "336018277787-0prgo2k750aft6678cdeioqgptic9kq3.apps.googleusercontent.com";
    const googleBtnContainer = document.getElementById('googleBtnContainer');
    const googleUserInfo     = document.getElementById('googleUserInfo');
    const googleUserAvatar   = document.getElementById('googleUserAvatar');
    const googleUserEmail    = document.getElementById('googleUserEmail');
    const googleLogoutBtn    = document.getElementById('googleLogoutBtn');

    const googleCustomBtn = document.getElementById('googleCustomBtn');

    // LOGIC KIỂM TRA ĐIỀU KIỆN 2 NÚT BẤM (Dùng các biến đã khai báo dòng 74,75)
    function updateButtonState() {
        const isPhoneOk = phoneField && phoneField.value.trim() !== "";
        
        if (isPhoneOk) {
            if (tuvanBtn) {
                tuvanBtn.disabled = false;
                tuvanBtn.style.opacity = "1";
                tuvanBtn.style.cursor = "pointer";
            }
            if (dangkyBtn) {
                dangkyBtn.disabled = false;
                dangkyBtn.style.opacity = "1";
                dangkyBtn.style.cursor = "pointer";
            }
        } else {
            if (tuvanBtn) {
                tuvanBtn.disabled = true;
                tuvanBtn.style.opacity = "0.5";
                tuvanBtn.style.cursor = "not-allowed";
            }
            if (dangkyBtn) {
                dangkyBtn.disabled = true;
                dangkyBtn.style.opacity = "0.5";
                dangkyBtn.style.cursor = "not-allowed";
            }
        }
    }

    // Gắn sự kiện cho các ô nhập liệu (Checking multiple events for better reliability)
    ['input', 'change', 'keyup'].forEach(evt => {
        if (emailField) emailField.addEventListener(evt, updateButtonState);
        if (phoneField) phoneField.addEventListener(evt, updateButtonState);
    });
    
    // Khởi tạo trạng thái ban đầu
    updateButtonState();

    // ============================================
    // BUTTON ACTIONS WITH SAFETY CHECK
    // ============================================
    if (dangkyBtn) {
        dangkyBtn.addEventListener('click', () => {
            const email = emailField ? emailField.value.trim() : "";
            const phone = phoneField ? phoneField.value.trim() : "";
            
            if (!phone) {
                alert("Vui lòng điền Số điện thoại!");
                return;
            }
            
            window.location.href = `https://test-techcamp.vercel.app/?at_email=${encodeURIComponent(email)}&at_phone=${encodeURIComponent(phone)}`;
        });
    }

    if (tuvanBtn) {
        tuvanBtn.addEventListener('click', () => {
            const phone = phoneField ? phoneField.value.trim() : "";
            
            if (!phone) {
                alert("Vui lòng điền Số điện thoại!");
                return;
            }
            
            // Xử lý tư vấn (Ví dụ: hiện thông báo hoặc gởi form)
            alert("Yêu cầu tư vấn của bạn đã được ghi nhận!");
        });
    }
    window.handleGoogleLoginCTA = (response) => {
        const base64Url = response.credential.split('.')[1];
        const base64   = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload  = JSON.parse(decodeURIComponent(
            window.atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        ));

        // Auto-fill email field
        if (emailField) emailField.value = payload.email;

        // Cập nhật giao diện: Hiện badge người dùng, ẩn nút google
        if (googleCustomBtn) googleCustomBtn.classList.add('hidden');
        if (googleUserInfo) googleUserInfo.classList.remove('hidden');
        
        googleUserAvatar.src = payload.picture;
        googleUserEmail.textContent = payload.email;
        
        // Cập nhật lại trạng thái nút sau khi login thành công
        updateButtonState();
    };

    setTimeout(() => {
        if (window.google && googleBtnContainer) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleLoginCTA,
                auto_select: false,
                itp_support: true
            });
            // Vẽ nút dạng ICON (Để Google không thể tự ý nhét email vào)
            google.accounts.id.renderButton(
                googleBtnContainer,
                { theme: "outline", size: "large", shape: "circle", type: "icon" }
            );
        }
    }, 600);

    // Kích hoạt click cho phần vỏ bọc bên ngoài
    if (googleCustomBtn) {
        googleCustomBtn.addEventListener('click', () => {
            // Khi nhấn vào vỏ, ta yêu cầu Google hiện popup chọn tài khoản
            if (window.google) google.accounts.id.prompt();
        });
    }

    if (googleLogoutBtn) {
        googleLogoutBtn.addEventListener('click', () => {
            if (googleUserInfo) googleUserInfo.classList.add('hidden');
            if (googleCustomBtn) googleCustomBtn.classList.remove('hidden');
            
            if (emailField) emailField.value = '';
            if (window.google) {
                google.accounts.id.disableAutoSelect(); // Đăng xuất
                // Render lại nút icon
                google.accounts.id.renderButton(
                    googleBtnContainer,
                    { theme: "outline", size: "large", shape: "circle", type: "icon" }
                );
            }
            // Cập nhật lại sau khi xóa email
            updateButtonState();
        });
    }

    // ============================================
    // TƯ VẤN Button → Telegram notification
    // ============================================
    if (tuvanBtn) {
        tuvanBtn.addEventListener('click', async () => {
            const email = emailField ? emailField.value.trim() : '';
            const phone = phoneField ? phoneField.value.trim() : '';

            if (!email && !phone) {
                alert('Vui lòng nhập Email hoặc Số điện thoại trước khi yêu cầu tư vấn!');
                return;
            }

            const origText = tuvanBtn.textContent;
            tuvanBtn.textContent = 'Đang gửi...';
            tuvanBtn.disabled = true;

            try {
                // Lưu vào Firestore
                await db.collection("tuvan_requests").add({
                    email: email,
                    phone: phone,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Đếm tổng yêu cầu
                const snapshot = await db.collection("tuvan_requests").get();
                const totalCount = snapshot.size;

                // Gửi Telegram
                await sendTelegramNotification(email, phone, totalCount);

                alert('Yêu cầu tư vấn đã được gửi! Chúng tôi sẽ liên hệ bạn sớm nhất.');

            } catch (error) {
                console.error('Lỗi:', error);
                alert('Có lỗi xảy ra: ' + error.message);
            } finally {
                tuvanBtn.textContent = origText;
                tuvanBtn.disabled = false;
            }
        });
    }

    // ============================================
    // ĐĂNG KÝ Button → Open new tab with parameters
    // ============================================
    if (dangkyBtn) {
        dangkyBtn.addEventListener('click', () => {
            const email = emailField ? emailField.value.trim() : '';
            const phone = phoneField ? phoneField.value.trim() : '';
            
            // Chuyển hướng kèm theo dữ liệu
            const targetUrl = `https://test-techcamp.vercel.app/?at_email=${encodeURIComponent(email)}&at_phone=${encodeURIComponent(phone)}`;
            window.open(targetUrl, '_blank');
        });
    }

    // ============================================
    // Scroll Reveal Animation
    // ============================================
    const observerOptions = { threshold: 0.1, rootMargin: "0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .timeline-item, .team-card, .hero-text, .hero-visual')
        .forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(styleSheet);
});
