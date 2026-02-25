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
   Experience / Projects Data
   ============================ */
const experienceData = [
    {
        name: "One Pickleball",
        badge: "Front-end Dev",
        badgeClass: "",
        date: "11/2025",
        subtitle: "",
        members: { vi: "3 thành viên", en: "3 members" },
        result: { vi: "Kết quả: 80%", en: "Result: 80%" },
        description: {
            vi: "One Pickleball là nền tảng mobile toàn diện kết nối cộng đồng Pickleball đang phát triển — giúp dễ dàng tìm sân gần nhất, đặt lịch, tham gia giải đấu, và theo dõi thống kê cá nhân. Xây dựng trên sự đơn giản, tin cậy và đổi mới.",
            en: "One Pickleball is a comprehensive mobile platform connecting the growing Pickleball community — making it easy to find nearby courts, book sessions, join tournaments, and track personal stats. Built on simplicity, reliability, and innovation."
        },
        techStack: ["React Native", "Visual Studio", "Figma", "Expo", "ESA Build"]
    },
    {
        name: "Hero Petshop",
        badge: "Member",
        badgeClass: "member-badge",
        date: "10/2024 - 12/2024",
        subtitle: "Pet Care Appointment Booking App",
        members: { vi: "6 thành viên", en: "6 members" },
        result: { vi: "Kết quả: 8/10", en: "Result: 8/10" },
        description: {
            vi: "Thiết kế web cho hệ thống quản trị và ứng dụng đặt lịch Hero Petshop, cho phép người dùng nhanh chóng đặt lịch chăm sóc thú cưng và thanh toán qua Momo. Web quản trị giúp người quản lý xử lý đơn hàng và theo dõi trạng thái đơn hàng chính xác.",
            en: "Designed admin dashboard and pet care appointment booking app Hero Petshop, allowing users to quickly schedule pet care services and make payments via Momo. The admin panel helps managers process orders and track order statuses accurately."
        },
        techStack: ["Java", "JavaScript", "NodeJs", "Android Studio", "Firebase"]
    }
];

/* ============================
   Education & Activities Data
   ============================ */
const educationData = {
    educations: [
        {
            icon: "fas fa-graduation-cap",
            title: { vi: "Chuyên ngành Lập trình di động", en: "Mobile App Development Major" },
            period: "09/2022 - 02/2025",
            details: [
                { icon: "fas fa-star", text: { vi: "GPA: <strong>7.9/10</strong>", en: "GPA: <strong>7.9/10</strong>" } },
                { icon: "fas fa-award", text: { vi: "Sinh viên xuất sắc: <strong>3/7 học kỳ</strong>", en: "Excellent Student: <strong>3/7 semesters</strong>" } },
                { icon: "fas fa-medal", text: { vi: "Tốt nghiệp loại <strong>Giỏi</strong>", en: "Graduated with <strong>Honors</strong>" } }
            ]
        }
    ],
    activities: [
        {
            icon: "fas fa-running",
            title: { vi: "Hoạt động ngoại khóa", en: "Extracurricular Activities" },
            items: [
                { icon: "fas fa-trophy", text: { vi: "Tham gia hoạt động của trường: vRace, từ thiện, team building", en: "Participated in school activities: vRace, charity events, team building" } },
                { icon: "fas fa-certificate", text: { vi: "Tham gia và nhận chứng chỉ chương trình thực tập ứng dụng di động của trường", en: "Participated in and received a certificate for the school's mobile app internship program" } }
            ]
        }
    ]
};

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
            },
            en: {
                about_description: "I'm a student majoring in <strong>Mobile App Development</strong>, passionate about building beautiful and efficient mobile applications. With experience working with <strong>React Native</strong>, <strong>Java</strong>, and <strong>Kotlin</strong>, I strive to deliver the best user experience.",
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

        // Render dynamic sections on load
        this.renderExperience(this.currentLang);
        this.renderEducation(this.currentLang);

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
            this.renderExperience(lang);
            this.renderEducation(lang);
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

    renderExperience(lang) {
        const timeline = document.getElementById('experience-timeline');
        if (!timeline) return;

        let html = '';

        experienceData.forEach(project => {
            const subtitleHtml = project.subtitle
                ? `<div class="project-subtitle">${project.subtitle}</div>`
                : '';
            const badgeClass = project.badgeClass
                ? `project-badge ${project.badgeClass}`
                : 'project-badge';
            const techHtml = project.techStack.map(t =>
                `<span class="tech-tag">${t}</span>`
            ).join('');

            html += `
                <div class="timeline-item animate-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-date">${project.date}</div>
                    <div class="timeline-card glass-card">
                        <div class="project-header">
                            <h3 class="project-name">${project.name}</h3>
                            <span class="${badgeClass}">${project.badge}</span>
                        </div>
                        ${subtitleHtml}
                        <div class="project-meta">
                            <span><i class="fas fa-users"></i> ${project.members[lang]}</span>
                            <span><i class="fas fa-chart-line"></i> ${project.result[lang]}</span>
                        </div>
                        <p class="project-description">${project.description[lang]}</p>
                        <div class="tech-stack">${techHtml}</div>
                    </div>
                </div>
            `;
        });

        timeline.innerHTML = html;

        // Re-init animations on new elements
        const newItems = timeline.querySelectorAll('.animate-item');
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
        newItems.forEach(item => observer.observe(item));

        // Re-init tilt on new cards
        const newCards = timeline.querySelectorAll('.timeline-card');
        newCards.forEach(card => new TiltEffect().addTilt(card));
    }

    renderEducation(lang) {
        const grid = document.getElementById('education-grid');
        if (!grid) return;

        let html = '';

        // Render education cards
        educationData.educations.forEach(edu => {
            const detailsHtml = edu.details.map(d =>
                `<li><i class="${d.icon}"></i> <span>${d.text[lang]}</span></li>`
            ).join('');

            html += `
                <div class="edu-card glass-card animate-item">
                    <div class="edu-icon"><i class="${edu.icon}"></i></div>
                    <h3>${edu.title[lang]}</h3>
                    <span class="edu-period">${edu.period}</span>
                    <ul class="edu-details">${detailsHtml}</ul>
                </div>
            `;
        });

        // Render activity cards
        educationData.activities.forEach(act => {
            const itemsHtml = act.items.map(item =>
                `<li><i class="${item.icon}"></i> <span>${item.text[lang]}</span></li>`
            ).join('');

            html += `
                <div class="activity-card glass-card animate-item">
                    <div class="edu-icon activity-icon"><i class="${act.icon}"></i></div>
                    <h3>${act.title[lang]}</h3>
                    <ul class="activity-list">${itemsHtml}</ul>
                </div>
            `;
        });

        grid.innerHTML = html;

        // Re-init animations and tilt on new elements
        const newItems = grid.querySelectorAll('.animate-item');
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
        newItems.forEach(item => observer.observe(item));

        // Re-init tilt on new cards
        const newCards = grid.querySelectorAll('.edu-card, .activity-card');
        const tilt = new TiltEffect();
        newCards.forEach(card => tilt.addTilt(card));
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
