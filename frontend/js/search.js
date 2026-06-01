/**
 * BSearch - Search Functionality
 * منطق جستجو و نمایش نتایج
 */

const Search = {
    currentQuery: '',
    currentPage: 1,
    resultsPerPage: 10,
    
    /**
     * Initialize search on page load
     */
    init() {
        this.setupSearchForm();
        this.setupSuggestions();
        this.setupVoiceSearch();
        this.setupAISearch();
        this.loadSearchHistory();
    },

    /**
     * Setup search form submission
     */
    setupSearchForm() {
        const form = document.getElementById('searchForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('searchInput');
            const query = input.value.trim();
            
            if (query) {
                Utils.addToHistory(query);
                this.performSearch(query);
            }
        });
    },

    /**
     * Setup autocomplete suggestions
     */
    setupSuggestions() {
        const input = document.getElementById('searchInput');
        const suggestionsBox = document.getElementById('suggestions');
        
        if (!input || !suggestionsBox) return;

        const debouncedSearch = Utils.debounce(async (query) => {
            if (query.length < 2) {
                suggestionsBox.classList.remove('show');
                return;
            }

            try {
                const data = await API.getSuggestions(query);
                this.renderSuggestions(data.suggestions || [], suggestionsBox);
            } catch (error) {
                console.error('Failed to get suggestions:', error);
            }
        }, 300);

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            debouncedSearch(query);
        });

        // Hide suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-form')) {
                suggestionsBox.classList.remove('show');
            }
        });

        // Navigate suggestions with keyboard
        input.addEventListener('keydown', (e) => {
            const items = suggestionsBox.querySelectorAll('.suggestion-item');
            const active = suggestionsBox.querySelector('.suggestion-item.active');
            let index = Array.from(items).indexOf(active);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (index < items.length - 1) {
                        if (active) active.classList.remove('active');
                        items[index + 1].classList.add('active');
                        items[index + 1].scrollIntoView({ block: 'nearest' });
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (index > 0) {
                        if (active) active.classList.remove('active');
                        items[index - 1].classList.add('active');
                        items[index - 1].scrollIntoView({ block: 'nearest' });
                    }
                    break;
                case 'Enter':
                    if (active) {
                        e.preventDefault();
                        input.value = active.dataset.query;
                        this.performSearch(input.value);
                        suggestionsBox.classList.remove('show');
                    }
                    break;
                case 'Escape':
                    suggestionsBox.classList.remove('show');
                    break;
            }
        });
    },

    /**
     * Render suggestions list
     */
    renderSuggestions(suggestions, container) {
        if (!suggestions || suggestions.length === 0) {
            container.classList.remove('show');
            return;
        }

        container.innerHTML = suggestions.map(item => `
            <div class="suggestion-item" data-query="${Utils.escapeHtml(item.text)}">
                <span class="suggestion-icon">🔍</span>
                <span class="suggestion-text">${Utils.escapeHtml(item.text)}</span>
                ${item.trending ? '<span class="trending-badge">ترند</span>' : ''}
            </div>
        `).join('');

        // Click handler for suggestions
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const input = document.getElementById('searchInput');
                input.value = item.dataset.query;
                this.performSearch(input.value);
                container.classList.remove('show');
            });
        });

        container.classList.add('show');
    },

    /**
     * Setup voice search
     */
    setupVoiceSearch() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (!voiceBtn) return;

        // Check for Web Speech API support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceBtn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'fa-IR';
        recognition.continuous = false;
        recognition.interimResults = false;

        voiceBtn.addEventListener('click', () => {
            voiceBtn.classList.add('listening');
            recognition.start();
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('searchInput');
            input.value = transcript;
            this.performSearch(transcript);
            voiceBtn.classList.remove('listening');
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            voiceBtn.classList.remove('listening');
            Utils.notify('خطا در تشخیص صوت', 'error');
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
        };
    },

    /**
     * Setup AI search button
     */
    setupAISearch() {
        const aiBtn = document.getElementById('aiSearchBtn');
        if (!aiBtn) return;

        aiBtn.addEventListener('click', async () => {
            const input = document.getElementById('searchInput');
            const query = input.value.trim();
            
            if (!query) {
                Utils.notify('لطفاً سوال خود را وارد کنید', 'warning');
                return;
            }

            window.location.href = `ai-search.html?q=${encodeURIComponent(query)}`;
        });
    },

    /**
     * Load and display search history
     */
    loadSearchHistory() {
        const input = document.getElementById('searchInput');
        const suggestionsBox = document.getElementById('suggestions');
        
        if (!input || !suggestionsBox) return;

        input.addEventListener('focus', () => {
            if (input.value.trim()) return;

            const history = Utils.retrieve('searchHistory') || [];
            
            if (history.length > 0) {
                const historyItems = history.map(item => ({
                    text: item,
                    isHistory: true
                }));
                
                this.renderSuggestions(historyItems, suggestionsBox);
                
                // Add clear history option
                const clearBtn = document.createElement('div');
                clearBtn.className = 'suggestion-item clear-history';
                clearBtn.innerHTML = '<span class="suggestion-icon">🗑️</span><span>پاک کردن تاریخچه</span>';
                clearBtn.addEventListener('click', () => {
                    Utils.clearHistory();
                    suggestionsBox.classList.remove('show');
                    Utils.notify('تاریخچه پاک شد', 'success');
                });
                suggestionsBox.appendChild(clearBtn);
                
                suggestionsBox.classList.add('show');
            }
        });
    },

    /**
     * Perform web search
     */
    async performSearch(query, page = 1) {
        this.currentQuery = query;
        this.currentPage = page;

        // Show loading state
        this.showLoading();

        try {
            const data = await API.search(query, {
                page: page,
                limit: this.resultsPerPage
            });

            this.renderResults(data);
        } catch (error) {
            console.error('Search failed:', error);
            Utils.notify('خطا در انجام جستجو', 'error');
            this.hideLoading();
        }
    },

    /**
     * Render search results
     */
    renderResults(data) {
        const resultsContainer = document.getElementById('results');
        if (!resultsContainer) return;

        const { results, total, time } = data;

        // Results info
        const infoHtml = `
            <div class="results-info">
                <p>حدوداً ${Utils.formatNumber(total)} نتیجه (${time} ثانیه)</p>
            </div>
        `;

        // Results list
        const resultsHtml = results.map((result, index) => `
            <div class="search-result" data-index="${index}">
                <div class="result-header">
                    <a href="${Utils.escapeHtml(result.url)}" class="result-url">
                        ${Utils.escapeHtml(result.displayUrl)}
                    </a>
                </div>
                <h3 class="result-title">
                    <a href="${Utils.escapeHtml(result.url)}">
                        ${Utils.escapeHtml(result.title)}
                    </a>
                </h3>
                <p class="result-snippet">
                    ${Utils.escapeHtml(result.snippet)}
                </p>
                ${result.date ? `<span class="result-date">${Utils.formatDate(result.date)}</span>` : ''}
                ${result.richSnippet ? this.renderRichSnippet(result.richSnippet) : ''}
            </div>
        `).join('');

        // Pagination
        const totalPages = Math.ceil(total / this.resultsPerPage);
        const paginationHtml = this.renderPagination(totalPages);

        resultsContainer.innerHTML = infoHtml + resultsHtml + paginationHtml;
        this.hideLoading();
    },

    /**
     * Render rich snippet
     */
    renderRichSnippet(snippet) {
        if (snippet.type === 'faq') {
            return `
                <div class="rich-snippet faq">
                    ${snippet.items.map(item => `
                        <details class="faq-item">
                            <summary>${Utils.escapeHtml(item.question)}</summary>
                            <p>${Utils.escapeHtml(item.answer)}</p>
                        </details>
                    `).join('')}
                </div>
            `;
        }
        
        if (snippet.type === 'recipe') {
            return `
                <div class="rich-snippet recipe">
                    <img src="${Utils.escapeHtml(snippet.image)}" alt="${Utils.escapeHtml(snippet.name)}">
                    <h4>${Utils.escapeHtml(snippet.name)}</h4>
                    <div class="recipe-meta">
                        <span>⏱️ ${snippet.time}</span>
                        <span>⭐ ${snippet.rating}</span>
                    </div>
                </div>
            `;
        }

        return '';
    },

    /**
     * Render pagination
     */
    renderPagination(totalPages) {
        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';
        
        // Previous button
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="Search.performSearch('${this.currentQuery}', ${this.currentPage - 1})">قبلی</button>`;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const active = i === this.currentPage ? 'active' : '';
            html += `<button class="page-btn ${active}" onclick="Search.performSearch('${this.currentQuery}', ${i})">${Utils.toPersianDigits(i)}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages) {
            html += `<button class="page-btn" onclick="Search.performSearch('${this.currentQuery}', ${this.currentPage + 1})">بعدی</button>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Show loading state
     */
    showLoading() {
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="loading-results">
                    <div class="spinner"></div>
                    <p>در حال جستجو...</p>
                </div>
            `;
        }
    },

    /**
     * Hide loading state
     */
    hideLoading() {
        const loading = document.querySelector('.loading-results');
        if (loading) loading.remove();
    }
};

// Helper function to escape HTML
Utils.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Search.init());
} else {
    Search.init();
}
