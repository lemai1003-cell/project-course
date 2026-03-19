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

    // Form Submission Handler
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = signupForm.querySelector('input[name="email"]').value;
            const phone = signupForm.querySelector('input[name="phone"]').value;
            
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Open new tab
            window.open('https://test-techcamp.vercel.app/', '_blank');
            
            console.log('Form submitted:', { email, phone }); // Debug log
            
            try {
                // Show loading state
                submitBtn.textContent = 'Đang gửi...';
                submitBtn.disabled = true;
                
                // Save to Firestore
                const docRef = await db.collection("registrations").add({
                    email: email,
                    phone: phone,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    source: "website"
                });
                
                console.log("Document written with ID: ", docRef.id); // Debug log
                
                // Success message
                alert('Đăng ký thành công!');
                signupForm.reset();
                
            } catch (error) {
                console.error("Error adding document: ", error);
                alert('Có lỗi xảy ra: ' + error.message);
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    } else {
        console.log('Form not found!'); // Debug log
    }

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
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });
    }

    // ============================================
    // TƯ VẤN Button Handler
    // ============================================
    const tuvanBtn = document.getElementById('tuvan-btn');
    if (tuvanBtn) {
        tuvanBtn.addEventListener('click', async () => {
            const email = signupForm ? signupForm.querySelector('input[name="email"]').value : '';
            const phone = signupForm ? signupForm.querySelector('input[name="phone"]').value : '';

            if (!email && !phone) {
                alert('Vui lòng nhập Email hoặc Số điện thoại trước khi yêu cầu tư vấn!');
                return;
            }

            tuvanBtn.textContent = 'Đang gửi...';
            tuvanBtn.disabled = true;

            try {
                // Save to Firestore
                await db.collection("tuvan_requests").add({
                    email: email,
                    phone: phone,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Get total count
                const snapshot = await db.collection("tuvan_requests").get();
                const totalCount = snapshot.size;

                // Send Telegram notification
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

    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.feature-card, .timeline-item, .team-card, .hero-text, .hero-visual');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // Handle "visible" class in CSS via JS injection style or modification
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleSheet);
});
