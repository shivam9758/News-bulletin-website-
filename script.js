 const API_KEY = "8f5acd4eb9eb40888ded3038f9e6a416";
        const url = "https://newsapi.org/v2/everything?q=";
        let currentQuery = "India";
        let slideIndex = 0;
        let slides = [];
        let dots = [];
        let curSelectedNav = document.getElementById("India");

        // Initialize the app
        window.addEventListener("load", () => {
            fetchNews(currentQuery);
            setupEventListeners();
        });

        // Set up event listeners
        function setupEventListeners() {
            // Theme toggle
            document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
            
            // Search functionality
            document.getElementById('search-button').addEventListener('click', performSearch);
            
            // Press Enter in search field
            document.getElementById('search-text').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }

        // Toggle between dark and light mode
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const icon = document.querySelector('#theme-toggle i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        function reload() {
            window.location.reload();
        }

        // Show loading spinner
        function showLoader() {
            document.getElementById('loader').classList.add('active');
        }

        // Hide loading spinner
        function hideLoader() {
            document.getElementById('loader').classList.remove('active');
        }

        async function fetchNews(query) {
            showLoader();
            currentQuery = query;
            
            try {
                const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
                const data = await res.json();
                
                if (data.articles && data.articles.length > 0) {
                    bindData(data.articles);
                    updateSlider(data.articles);
                } else {
                    displayNoResults();
                }
            } catch (error) {
                console.error("Error fetching news:", error);
                displayError();
            } finally {
                hideLoader();
            }
        }

        function displayNoResults() {
            const cardsContainer = document.getElementById("cards-container");
            cardsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-newspaper fa-4x"></i>
                    <h3>No articles found</h3>
                    <p>Try a different search term or category</p>
                </div>
            `;
            
            // Clear slider
            document.getElementById('slides').innerHTML = '';
            document.getElementById('dots-container').innerHTML = '';
        }

        function displayError() {
            const cardsContainer = document.getElementById("cards-container");
            cardsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle fa-4x"></i>
                    <h3>Failed to load news</h3>
                    <p>Please check your connection and try again</p>
                    <button class="btn btn-primary" onclick="fetchNews(currentQuery)">Retry</button>
                </div>
            `;
        }

        function bindData(articles) {
            const cardsContainer = document.getElementById("cards-container");
            const newsCardTemplate = document.getElementById("template-news-card");

            cardsContainer.innerHTML = "";

            articles.slice(0, 12).forEach((article) => {
                if (!article.urlToImage) return;
                const cardClone = newsCardTemplate.content.cloneNode(true);
                fillDataInCard(cardClone, article);
                cardsContainer.appendChild(cardClone);
            });
        }

        function fillDataInCard(cardClone, article) {
            const newsImg = cardClone.querySelector("#news-img");
            const newsTitle = cardClone.querySelector("#news-title");
            const newsDesc = cardClone.querySelector("#news-desc");
            const newsSource = cardClone.querySelector("#news-source");
            const newsDate = cardClone.querySelector("#news-date");
            const newsCategory = cardClone.querySelector("#news-category");

            newsImg.src = article.urlToImage;
            newsImg.alt = article.title;
            newsTitle.textContent = article.title;
            newsDesc.textContent = article.description || "No description available";
            newsSource.textContent = article.source.name;
            newsCategory.textContent = currentQuery;

            const date = new Date(article.publishedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            newsDate.textContent = date;

            cardClone.firstElementChild.addEventListener("click", () => {
                window.open(article.url, "_blank");
            });
        }

        function onNavItemClick(id) {
            const navItem = document.getElementById(id);
            if (curSelectedNav === navItem) return;
            
            curSelectedNav.classList.remove("active");
            curSelectedNav = navItem;
            curSelectedNav.classList.add("active");
            
            fetchNews(id);
        }

        function performSearch() {
            const query = document.getElementById("search-text").value.trim();
            if (!query) return;
            
            fetchNews(query);
            if (curSelectedNav) {
                curSelectedNav.classList.remove("active");
                curSelectedNav = null;
            }
        }

        // Slider functionality
        function updateSlider(articles) {
            const slidesContainer = document.getElementById("slides");
            const dotsContainer = document.getElementById("dots-container");
            
            slidesContainer.innerHTML = "";
            dotsContainer.innerHTML = "";
            
            slides = [];
            dots = [];
            slideIndex = 0;
            
            // Take first 5 articles for slider
            const sliderArticles = articles.slice(0, 5);
            
            sliderArticles.forEach((article, index) => {
                if (!article.urlToImage) return;
                
                // Create slide
                const slide = document.createElement("div");
                slide.className = "slide";
                slide.innerHTML = `
                    <img src="${article.urlToImage}" alt="${article.title}">
                    <div class="slide-overlay">
                        <h3 class="slide-title">${article.title}</h3>
                        <div class="slide-source">
                            <i class="fas fa-newspaper"></i>
                            <span>${article.source.name} • ${new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
                
                // Add click event to open article
                slide.addEventListener("click", () => {
                    window.open(article.url, "_blank");
                });
                
                slidesContainer.appendChild(slide);
                slides.push(slide);
                
                // Create dot
                const dot = document.createElement("div");
                dot.className = "dot";
                dot.addEventListener("click", () => currentSlide(index));
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });
            
            // Initialize slider
            if (slides.length > 0) {
                showSlides();
            }
        }

        function showSlides() {
            slides.forEach((slide, index) => {
                slide.style.display = index === slideIndex ? "block" : "none";
            });
            
            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === slideIndex);
            });
        }

        function changeSlide(n) {
            slideIndex += n;
            if (slideIndex >= slides.length) slideIndex = 0;
            if (slideIndex < 0) slideIndex = slides.length - 1;
            showSlides();
        }

        function currentSlide(n) {
            slideIndex = n;
            showSlides();
        }

        // Automatic slideshow
        setInterval(() => {
            if (slides.length > 0) {
                changeSlide(1);
            }
        }, 5000);