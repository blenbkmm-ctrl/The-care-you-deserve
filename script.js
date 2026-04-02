document.addEventListener('DOMContentLoaded', () => {

    // ===== 1. Sidebar Mobile Toggle =====
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        hamburger.textContent = '✕';
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        hamburger.textContent = '☰';
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on nav link click (mobile)
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // ===== 2. Scroll Fade-In Animations =====
    const fadeElements = document.querySelectorAll('.fade-in');

    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        fadeElements.forEach(el => observer.observe(el));
    }

    const likeButtons = document.querySelectorAll('.like-btn');

    likeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const isLiked = this.classList.contains('liked');

            if (!isLiked) {
                this.innerHTML = 'Liked!';
                this.style.color = '#EC407A';
                this.classList.add('liked');

                setTimeout(() => {
                    this.innerHTML = 'Like';
                    this.style.color = '';
                    this.classList.remove('liked');
                }, 2000);
            }
        });
    });

    // ===== 4. Search Bar Logic (Site-Wide) =====
    const searchBar = document.getElementById('search-bar');
    const wfSearchInput = document.querySelector('.wf-header-search');

    // List of all pages to search through
    const sitePages = [
        { url: 'index.html', title: 'Home' },
        { url: 'about.html', title: 'About Us' },
        { url: 'length-retention.html', title: 'Length Retention' },
        { url: 'moisture.html', title: 'Moisture' },
        { url: 'wash-days.html', title: 'Wash Days' },
        { url: 'harsh-truths.html', title: 'Harsh Truths' },
        { url: 'videos.html', title: 'Videos' }
    ];

    // Create Search Results Overlay if it doesn't exist
    let searchOverlay = document.getElementById('search-results-overlay');
    if (!searchOverlay) {
        searchOverlay = document.createElement('div');
        searchOverlay.id = 'search-results-overlay';
        searchOverlay.innerHTML = `
            <div class="search-modal">
                <div class="search-modal-header">
                    <h2>Search Results</h2>
                    <button class="close-search">&times;</button>
                </div>
                <div class="search-results-list" id="search-results-list">
                    <p class="search-hint">Typing...</p>
                </div>
            </div>
        `;
        document.body.appendChild(searchOverlay);

        searchOverlay.querySelector('.close-search').addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) searchOverlay.classList.remove('active');
        });
    }

    async function performSearch(query) {
        query = query.toLowerCase().trim();
        if (!query) return;

        searchOverlay.classList.add('active');
        const resultsList = document.getElementById('search-results-list');
        resultsList.innerHTML = '<p class="search-hint">Searching all pages...</p>';

        const allResults = [];

        try {
            // Fetch and search all pages in parallel
            const searchPromises = sitePages.map(async (page) => {
                try {
                    const response = await fetch(page.url);
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Remove scripts, nav, etc. to search actual content
                    const cleanDoc = doc.cloneNode(true);
                    cleanDoc.querySelectorAll('script, nav, style, .sidebar, .wf-sidebar, .wf-header, .mobile-header, header, footer, .sidebar-overlay, .site-footer').forEach(el => el.remove());
                    
                    // Focus specifically on the main content areas
                    const contentArea = cleanDoc.querySelector('.wf-main, .main-content') || cleanDoc.body;
                    const textContent = contentArea.innerText.toLowerCase().replace(/\s+/g, ' ');
                    
                    if (textContent.includes(query)) {
                        // Find a snippet
                        const index = textContent.indexOf(query);
                        const start = Math.max(0, index - 40);
                        const end = Math.min(textContent.length, index + query.length + 40);
                        let snippet = textContent.substring(start, end);
                        
                        // Bold the query in snippet
                        const regex = new RegExp(`(${query})`, 'gi');
                        snippet = snippet.replace(regex, '<strong>$1</strong>');

                        // Find the first relevant image on that page
                        const firstImg = cleanDoc.querySelector('.wf-image-block img, .main-content img, .feature-grid img');
                        const imgUrl = firstImg ? firstImg.getAttribute('src') : null;

                        allResults.push({
                            title: page.title,
                            url: page.url,
                            snippet: `...${snippet}...`,
                            image: imgUrl
                        });
                    }
                } catch (err) {
                    console.error(`Error searching ${page.url}:`, err);
                }
            });

            await Promise.all(searchPromises);

            if (allResults.length > 0) {
                resultsList.innerHTML = allResults.map(res => `
                    <div class="search-result-item">
                        <a href="${res.url}">
                            <div class="result-content-wrapper" style="display: flex; gap: 1rem; align-items: center;">
                                ${res.image ? `<img src="${res.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">` : ''}
                                <div>
                                    <h3>${res.title}</h3>
                                    <p>${res.snippet}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                `).join('');
            } else {
                resultsList.innerHTML = `<p class="search-hint">No results found for "${query}". Try different keywords like "length", "moisture", or "twists".</p>`;
            }
        } catch (error) {
            resultsList.innerHTML = '<p class="search-hint">Error performing search. Please try again.</p>';
        }
    }

    // Handle homepage search
    if (searchBar) {
        searchBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(searchBar.value);
            }
        });
    }

    // Handle wireframe page search
    if (wfSearchInput) {
        wfSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(wfSearchInput.value);
            }
        });
    }

    const routineForm = document.getElementById('routineForm');

    if (routineForm) {
        routineForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thanks for your contribution! This is a demo feature.');
            routineForm.reset();
        });
    }

    // ===== 6. Active Nav Highlight on Resize =====
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // ===== 7. Wireframe Page Sidebar Toggle =====
    const wfToggle = document.getElementById('wf-toggle');
    const wfSidebar = document.getElementById('wf-sidebar');

    if (wfToggle && wfSidebar) {
        wfToggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                // Mobile behavior
                wfSidebar.classList.toggle('open');
                wfToggle.textContent = wfSidebar.classList.contains('open') ? '✕' : '☰';
            } else {
                // Desktop behavior
                wfSidebar.classList.toggle('collapsed');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                wfSidebar.classList.remove('open');
                wfToggle.textContent = '☰';
            } else {
                wfSidebar.classList.remove('collapsed');
            }
        });
    }

});