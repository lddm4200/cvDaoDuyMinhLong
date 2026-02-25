/* ============================
   Particle Background
   ============================ */
class ParticleBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        const count = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x -= dx * force * 0.01;
                    p.y -= dy * force * 0.01;
                }
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(108, 92, 231, ${p.opacity})`;
            this.ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(108, 92, 231, ${0.08 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

/* ============================
   Navigation
   ============================ */
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileLinks = document.querySelectorAll('.mobile-link');
        this.sections = document.querySelectorAll('section[id]');

        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.onScroll());

        // Mobile toggle
        this.navToggle.addEventListener('click', () => this.toggleMobile());

        // Mobile links close menu
        this.mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobile());
        });

        // Smooth scroll
        [...this.navLinks, ...this.mobileLinks].forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    onScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        this.navbar.classList.toggle('scrolled', scrollY > 50);

        // Active section highlighting
        let current = '';
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    toggleMobile() {
        this.navToggle.classList.toggle('active');
        this.mobileMenu.classList.toggle('active');
        document.body.style.overflow = this.mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMobile() {
        this.navToggle.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ============================
   Scroll Animations
   ============================ */
class ScrollAnimations {
    constructor() {
        this.animateItems = document.querySelectorAll('.animate-item');
        this.skillFills = document.querySelectorAll('.skill-fill');
        this.statNumbers = document.querySelectorAll('.stat-number');
        this.hasAnimatedSkills = false;
        this.hasAnimatedStats = false;

        this.init();
    }

    init() {
        // Intersection Observer for reveal animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        this.animateItems.forEach(item => observer.observe(item));

        // Skills bar animation
        const skillObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimatedSkills) {
                        this.animateSkills();
                        this.hasAnimatedSkills = true;
                    }
                });
            },
            { threshold: 0.3 }
        );

        this.skillFills.forEach(bar => skillObserver.observe(bar));

        // Stats counter animation
        const statsObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimatedStats) {
                        this.animateCounters();
                        this.hasAnimatedStats = true;
                    }
                });
            },
            { threshold: 0.5 }
        );

        this.statNumbers.forEach(stat => statsObserver.observe(stat));

        // Initial check for hero elements
        setTimeout(() => {
            const heroItems = document.querySelectorAll('.hero .animate-item');
            heroItems.forEach(item => item.classList.add('visible'));
        }, 100);
    }

    animateSkills() {
        this.skillFills.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width + '%';
            }, index * 200);
        });
    }

    animateCounters() {
        this.statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-count'));
            const isDecimal = stat.getAttribute('data-decimal') === 'true';
            const duration = 2000;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                const current = target * eased;

                if (isDecimal) {
                    stat.textContent = current.toFixed(1);
                } else {
                    stat.textContent = Math.floor(current);
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = isDecimal ? target.toFixed(1) : target;
                }
            };

            requestAnimationFrame(updateCounter);
        });
    }
}

/* ============================
   Typing Effect
   ============================ */
class TypingEffect {
    constructor(element) {
        this.element = element;
        this.texts = [
            'Mobile Developer',
            'React Native Dev',
            'Frontend Developer',
            'UI/UX Enthusiast'
        ];
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.typeSpeed = 100;
        this.deleteSpeed = 50;
        this.pauseTime = 2000;

        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];

        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let timeout = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            timeout = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            timeout = 500;
        }

        setTimeout(() => this.type(), timeout);
    }
}

/* ============================
   Tilt Effect on Cards
   ============================ */
class TiltEffect {
    constructor() {
        const cards = document.querySelectorAll('.timeline-card, .goal-card, .edu-card, .activity-card');
        cards.forEach(card => this.addTilt(card));
    }

    addTilt(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    }
}

/* ============================
   Language Switcher (i18n)
   ============================ */
class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('cv-lang') || 'vi';
        this.langToggle = document.getElementById('langToggle');
        this.options = this.langToggle.querySelectorAll('.lang-option');

        this.translations = {
            vi: {
                // Nav
                nav_home: 'Trang chủ',
                nav_about: 'Giới thiệu',
                nav_goals: 'Mục tiêu',
                nav_experience: 'Kinh nghiệm',
                nav_skills: 'Kỹ năng',
                nav_education: 'Học vấn',
                nav_contact: 'Liên hệ',

                // Hero
                hero_greeting: 'Xin chào, tôi là',
                hero_description: 'Đam mê phát triển ứng dụng di động với React Native, Java & Kotlin. Luôn tìm kiếm cơ hội học hỏi và phát triển trong lĩnh vực công nghệ.',
                hero_cta_contact: 'Liên hệ ngay',
                hero_cta_projects: 'Xem dự án',
                scroll_down: 'Cuộn xuống',

                // About
                section_about: 'Giới thiệu',
                label_fullname: 'Họ và tên',
                label_dob: 'Ngày sinh',
                label_gender: 'Giới tính',
                value_gender: 'Nam',
                label_address: 'Địa chỉ',
                label_phone: 'Điện thoại',
                label_email: 'Email',
                stat_projects: 'Dự án thực tế',
                stat_semesters: 'Học kỳ xuất sắc',

                // Goals
                section_goals: 'Mục tiêu nghề nghiệp',
                goal_short_title: 'Mục tiêu ngắn hạn',
                goal_short_period: '2 tháng - 1 năm',
                goal_short_1: 'Hoàn thành kỳ thực tập tại công ty và tham gia dự án thực tế',
                goal_short_2: 'Trở thành nhân viên chính thức của công ty',
                goal_long_title: 'Mục tiêu dài hạn',
                goal_long_period: '> 1 năm',
                goal_long_1: 'Có khả năng giao tiếp tiếng Anh sau 1 năm',
                goal_long_2: 'Tham gia các dự án lớn để nâng cao kỹ năng',

                // Experience
                section_experience: 'Kinh nghiệm làm việc',
                members_3: '3 thành viên',
                result_80: 'Kết quả: 80%',
                project1_desc: 'One Pickleball là nền tảng mobile toàn diện kết nối cộng đồng Pickleball đang phát triển — giúp dễ dàng tìm sân gần nhất, đặt lịch, tham gia giải đấu, và theo dõi thống kê cá nhân. Xây dựng trên sự đơn giản, tin cậy và đổi mới.',
                members_6: '6 thành viên',
                result_8_10: 'Kết quả: 8/10',
                project2_desc: 'Thiết kế web cho hệ thống quản trị và ứng dụng đặt lịch Hero Petshop, cho phép người dùng nhanh chóng đặt lịch chăm sóc thú cưng và thanh toán qua Momo. Web quản trị giúp người quản lý xử lý đơn hàng và theo dõi trạng thái đơn hàng chính xác.',

                // Skills
                section_skills: 'Kỹ năng',
                skills_technical: 'Chuyên môn kỹ thuật',
                skills_tools: 'Công cụ',
                skills_soft: 'Kỹ năng mềm',
                soft_english: 'Đọc hiểu tài liệu tiếng Anh cơ bản',
                soft_eager: 'Ham học hỏi và chăm chỉ',
                soft_presenting: 'Thuyết trình trước đám đông',

                // Education
                section_education: 'Học vấn & Hoạt động',
                edu_major: 'Chuyên ngành Lập trình di động',
                activities_title: 'Hoạt động ngoại khóa',
                activity_1: 'Tham gia hoạt động của trường: vRace, từ thiện, team building',
                activity_2: 'Tham gia và nhận chứng chỉ chương trình thực tập ứng dụng di động của trường',

                // Contact
                section_contact: 'Liên hệ',
                contact_intro: 'Bạn muốn liên hệ với tôi? Hãy gửi tin nhắn hoặc liên hệ qua các kênh bên dưới!',
                contact_phone: 'Điện thoại',
                contact_address: 'Địa chỉ',
            },
            en: {
                // Nav
                nav_home: 'Home',
                nav_about: 'About',
                nav_goals: 'Goals',
                nav_experience: 'Experience',
                nav_skills: 'Skills',
                nav_education: 'Education',
                nav_contact: 'Contact',

                // Hero
                hero_greeting: "Hi, I'm",
                hero_description: 'Passionate about mobile app development with React Native, Java & Kotlin. Always seeking opportunities to learn and grow in the tech industry.',
                hero_cta_contact: 'Contact Me',
                hero_cta_projects: 'View Projects',
                scroll_down: 'Scroll down',

                // About
                section_about: 'About Me',
                label_fullname: 'Full Name',
                label_dob: 'Date of Birth',
                label_gender: 'Gender',
                value_gender: 'Male',
                label_address: 'Address',
                label_phone: 'Phone',
                label_email: 'Email',
                stat_projects: 'Real Projects',
                stat_semesters: 'Excellent Semesters',

                // Goals
                section_goals: 'Career Goals',
                goal_short_title: 'Short-term Goals',
                goal_short_period: '2 months - 1 year',
                goal_short_1: 'Complete internship at a company and participate in real-world projects',
                goal_short_2: 'Become a full-time employee at the company',
                goal_long_title: 'Long-term Goals',
                goal_long_period: '> 1 year',
                goal_long_1: 'Be able to communicate in English within 1 year',
                goal_long_2: 'Participate in large-scale projects to enhance skills',

                // Experience
                section_experience: 'Work Experience',
                members_3: '3 members',
                result_80: 'Result: 80%',
                project1_desc: 'One Pickleball is a comprehensive mobile platform connecting the growing Pickleball community — making it easy to find nearby courts, book sessions, join tournaments, and track personal stats. Built on simplicity, reliability, and innovation.',
                members_6: '6 members',
                result_8_10: 'Result: 8/10',
                project2_desc: 'Designed admin dashboard and pet care appointment booking app Hero Petshop, allowing users to quickly schedule pet care services and make payments via Momo. The admin panel helps managers process orders and track order statuses accurately.',

                // Skills
                section_skills: 'Skills',
                skills_technical: 'Technical Skills',
                skills_tools: 'Tools',
                skills_soft: 'Soft Skills',
                soft_english: 'Read and understand basic English documentation',
                soft_eager: 'Eager to learn and hardworking',
                soft_presenting: 'Public speaking and presentations',

                // Education
                section_education: 'Education & Activities',
                edu_major: 'Mobile App Development Major',
                activities_title: 'Extracurricular Activities',
                activity_1: 'Participated in school activities: vRace, charity events, team building',
                activity_2: 'Participated in and received a certificate for the school\'s mobile app internship program',

                // Contact
                section_contact: 'Contact',
                contact_intro: 'Want to get in touch? Send me a message or reach out through the channels below!',
                contact_phone: 'Phone',
                contact_address: 'Address',
            }
        };

        // HTML translations (contain HTML tags)
        this.htmlTranslations = {
            vi: {
                about_description: 'Tôi là sinh viên chuyên ngành <strong>Lập trình ứng dụng di động</strong>, đam mê xây dựng các ứng dụng mobile đẹp mắt và hiệu quả. Với kinh nghiệm làm việc cùng <strong>React Native</strong>, <strong>Java</strong>, và <strong>Kotlin</strong>, tôi luôn nỗ lực mang đến trải nghiệm tốt nhất cho người dùng.',
                edu_gpa: 'GPA: <strong>7.9/10</strong>',
                edu_excellent: 'Sinh viên xuất sắc: <strong>3/7 học kỳ</strong>',
                edu_honors: 'Tốt nghiệp loại <strong>Giỏi</strong>',
            },
            en: {
                about_description: "I'm a student majoring in <strong>Mobile App Development</strong>, passionate about building beautiful and efficient mobile applications. With experience working with <strong>React Native</strong>, <strong>Java</strong>, and <strong>Kotlin</strong>, I strive to deliver the best user experience.",
                edu_gpa: 'GPA: <strong>7.9/10</strong>',
                edu_excellent: 'Excellent Student: <strong>3/7 semesters</strong>',
                edu_honors: 'Graduated with <strong>Honors</strong>',
            }
        };

        this.init();
    }

    init() {
        // Click on individual options (VI / EN)
        this.options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = opt.getAttribute('data-lang');
                if (lang !== this.currentLang) {
                    this.switchTo(lang);
                }
            });
        });

        // Apply saved language on load (without animation)
        if (this.currentLang !== 'vi') {
            this.applyLanguage(this.currentLang);
        }
        this.updateUI();
    }

    switchTo(lang) {
        this.currentLang = lang;
        localStorage.setItem('cv-lang', lang);

        // Update UI immediately for slider
        this.updateUI();

        // Fade text transition
        document.body.classList.add('lang-switching');
        setTimeout(() => {
            this.applyLanguage(lang);
            document.body.classList.remove('lang-switching');
        }, 200);
    }

    applyLanguage(lang) {
        const dict = this.translations[lang];
        const htmlDict = this.htmlTranslations[lang];

        // Update textContent elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // Update innerHTML elements
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (htmlDict[key]) {
                el.innerHTML = htmlDict[key];
            }
        });

        // Update page lang attribute
        document.documentElement.lang = lang;
    }

    updateUI() {
        // Toggle active on options
        this.options.forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === this.currentLang);
        });
        // Toggle .en class on container for slider position
        this.langToggle.classList.toggle('en', this.currentLang === 'en');
    }
}

/* ============================
   Initialize
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
    // Particle Background
    const canvas = document.getElementById('particles');
    if (canvas) {
        new ParticleBackground(canvas);
    }

    // Navigation
    new Navigation();

    // Scroll Animations
    new ScrollAnimations();

    // Typing Effect
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        new TypingEffect(heroTitle);
    }

    // Tilt Effect
    new TiltEffect();

    // Language Switcher
    new LanguageSwitcher();
});
