// ===================================
// UGURCANATES.COM - JavaScript
// Aviation Cybersecurity Professional
// ===================================

// Smooth Scroll & Navigation
document.addEventListener('DOMContentLoaded', function() {
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile navigation toggle
    navToggle.addEventListener('click', function() {
        navMenu.querySelector('.nav-list').classList.toggle('active');
        
        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = navMenu.querySelector('.nav-list').classList.contains('active') 
            ? 'rotate(45deg) translate(5px, 5px)' 
            : 'none';
        spans[1].style.opacity = navMenu.querySelector('.nav-list').classList.contains('active') 
            ? '0' 
            : '1';
        spans[2].style.transform = navMenu.querySelector('.nav-list').classList.contains('active') 
            ? 'rotate(-45deg) translate(7px, -6px)' 
            : 'none';
    });
    
    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);
    
    // Smooth scroll for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu
            if (window.innerWidth <= 968) {
                navMenu.querySelector('.nav-list').classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animateElements = document.querySelectorAll('.expertise-card, .project-card, .blog-card, .about-text');
    animateElements.forEach(el => observer.observe(el));
    
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Simple validation
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!validateEmail(formData.email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            try {
                await simulateFormSubmission(formData);
                
                // Success
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            } catch (error) {
                // Error
                showNotification('Failed to send message. Please try again or email directly.', 'error');
            } finally {
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Simulate form submission
    function simulateFormSubmission(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In production, replace this with actual API call
                // Example: fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
                console.log('Form data:', data);
                resolve();
            }, 1500);
        });
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#00d9ff'};
            color: ${type === 'success' || type === 'error' ? '#0a0a0a' : '#ffffff'};
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        `;
        
        document.body.appendChild(notification);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0;
            font-size: 1.2rem;
        `;
        
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Add notification animations to document
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
    `;
    document.head.appendChild(style);
    
    // Scroll reveal for stats
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }
    
    // Animate statistics numbers
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const text = stat.textContent;
            const hasPlus = text.includes('+');
            const hasPercent = text.includes('%');
            const number = parseInt(text.replace(/[^0-9]/g, ''));
            
            if (!isNaN(number)) {
                let current = 0;
                const increment = number / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        stat.textContent = number + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(current) + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
                    }
                }, 30);
            }
        });
    }
    
    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            const scrolled = window.pageYOffset;
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // External links open in new tab
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    // Copy email on click
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            
            // Copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(email).then(() => {
                    showNotification('Email copied to clipboard!', 'success');
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Email copied to clipboard!', 'success');
            }
        });
    });
    
    // Console message for fellow developers
    console.log(
        '%c🔐 Aviation Cybersecurity Professional',
        'font-size: 20px; font-weight: bold; color: #00d9ff;'
    );
    console.log(
        '%cInterested in SOC operations, threat intelligence, or security automation?\nLet\'s connect: https://linkedin.com/in/ugurcanates',
        'font-size: 14px; color: #b0b0b0;'
    );
    
    // Performance monitoring (optional)
    if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.renderTime || entry.loadTime);
                }
            });
        });
        
        perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    // Update current year in footer (if needed)
    const yearElement = document.querySelector('.footer-left p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = yearElement.textContent.replace('2024', currentYear);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            const navList = navMenu.querySelector('.nav-list');
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
});
