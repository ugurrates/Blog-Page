// ==========================================
// BLOG SITE JAVASCRIPT
// Theme toggle, RSS loader, Formspree, notifications
// ==========================================

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // DARK MODE TOGGLE
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');

    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateToggleIcon(theme);
    }

    function updateToggleIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Sync icon with pre-paint script state
    updateToggleIcon(getCurrentTheme());

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        });
    }

    // ==========================================
    // SMOOTH SCROLL
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // CONTACT FORM — FORMSPREE
    // ==========================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Honeypot (bot protection)
            const honeypot = contactForm.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value) {
                // Silent fail for bots
                contactForm.reset();
                return;
            }

            // Validation
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!validateEmail(formData.email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Submit button state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    const data = await response.json().catch(() => ({}));
                    const errorMsg = (data.errors && data.errors.map(e => e.message).join(', ')) ||
                                     'Failed to send message. Please try emailing directly.';
                    showNotification(errorMsg, 'error');
                }
            } catch (error) {
                showNotification('Network error. Please try emailing directly.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ==========================================
    // BLOG FEED — MEDIUM + SUBSTACK RSS
    // ==========================================
    const blogFeed = document.getElementById('blog-feed');

    const FEEDS = [
        { source: 'Medium',   url: 'https://medium.com/feed/@ugur.can.ates' },
        { source: 'Substack', url: 'https://ugurates.substack.com/feed' }
    ];
    const MAX_POSTS = 6;
    const EXCERPT_LEN = 200;

    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    async function fetchFeed(feed) {
        const api = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (data.status !== 'ok' || !Array.isArray(data.items)) return [];
            return data.items.map(item => ({
                source: feed.source,
                title: stripHtml(item.title),
                link: item.link,
                pubDate: item.pubDate,
                excerpt: stripHtml(item.description).slice(0, EXCERPT_LEN).trim() +
                         (stripHtml(item.description).length > EXCERPT_LEN ? '…' : ''),
                categories: Array.isArray(item.categories) ? item.categories.slice(0, 4) : []
            }));
        } catch (err) {
            console.warn('[blog-feed]', feed.source, 'failed:', err.message);
            return [];
        }
    }

    function renderArticle(post, index) {
        const sourceClass = post.source === 'Medium' ? 'tag-medium' : 'tag-substack';
        const featured = index === 0 ? ' featured' : '';
        const tagsHtml = post.categories.length
            ? '<div class="post-tags">' +
                post.categories.map(c => '<span class="tag">' + stripHtml(c) + '</span>').join('') +
              '</div>'
            : '';

        return `
            <article class="blog-post${featured}">
                <div class="post-header">
                    <span class="post-tag ${sourceClass}">${post.source}</span>
                    <span class="post-date">${formatDate(post.pubDate)}</span>
                </div>
                <h3 class="post-title">
                    <a href="${post.link}" target="_blank" rel="noopener noreferrer">${post.title}</a>
                </h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    ${tagsHtml}
                </div>
                <a href="${post.link}" class="read-more" target="_blank" rel="noopener noreferrer">
                    Read Article <i class="fas fa-arrow-right"></i>
                </a>
            </article>
        `;
    }

    async function loadBlogFeed() {
        if (!blogFeed) return;

        const results = await Promise.all(FEEDS.map(fetchFeed));
        const posts = results.flat()
            .filter(p => p.title && p.link)
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
            .slice(0, MAX_POSTS);

        if (posts.length === 0) {
            blogFeed.innerHTML = `
                <div class="blog-empty">
                    <p>Unable to load latest articles. Visit
                        <a href="https://medium.com/@ugur.can.ates" target="_blank">Medium</a> or
                        <a href="https://substack.com/@ugurates" target="_blank">Substack</a>
                        directly.</p>
                </div>
            `;
            return;
        }

        blogFeed.innerHTML = posts.map((p, i) => renderArticle(p, i)).join('');
    }

    loadBlogFeed();

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = type === 'success' ? 'check-circle' :
                     type === 'error' ? 'exclamation-circle' : 'info-circle';

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const styles = {
            success: { bg: '#10b981', color: '#ffffff' },
            error:   { bg: '#ef4444', color: '#ffffff' },
            info:    { bg: '#3b82f6', color: '#ffffff' }
        };
        const style = styles[type] || styles.info;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 1rem 1.5rem;
            background: ${style.bg};
            color: ${style.color};
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0;
            font-size: 1.2rem;
            opacity: 0.8;
        `;

        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });
        closeBtn.addEventListener('mouseenter', () => { closeBtn.style.opacity = '1'; });
        closeBtn.addEventListener('mouseleave', () => { closeBtn.style.opacity = '0.8'; });

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Notification animations
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0);     opacity: 1; }
            to   { transform: translateX(400px); opacity: 0; }
        }
        .notification-content { display: flex; align-items: center; gap: 0.75rem; }
        .notification-content i { font-size: 1.25rem; }
    `;
    document.head.appendChild(animStyle);

    // ==========================================
    // EXTERNAL LINKS + EMAIL COPY
    // ==========================================
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(email).then(() => {
                    showNotification('Email copied to clipboard!', 'success');
                });
            } else {
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

    // ==========================================
    // READING PROGRESS INDICATOR
    // ==========================================
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    });

    // ==========================================
    // CONSOLE EASTER EGG
    // ==========================================
    console.log('%c🛡️Critical Infrastructure Security Engineer', 'font-size: 18px; font-weight: bold; color: #2563eb;');
    console.log('%cInterested in security collaboration? Let\'s connect!', 'font-size: 14px; color: #6b7280;');
    console.log('%c📧 ugurcanates@outlook.com', 'font-size: 12px; color: #2563eb;');
});
