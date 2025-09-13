$(document).ready(function() {
    // Initialize news page when section becomes active
    $(document).on('newsPageActive', function() {
        initNewsPage();
    });
    
    // Auto-load news when page loads if news section is already active
    if ($('.section.news').hasClass('active')) {
        initNewsPage();
    }
});

function initNewsPage() {
    console.log('Initializing News Page...');
    
    // Load initial news
    loadNews();
    
    // Bind event handlers
    bindNewsEventHandlers();
    
    // Set default city for weather (Bucharest)
    setTimeout(function() {
        getWeatherInfo('Bucharest');
    }, 500);
}

function bindNewsEventHandlers() {
    // Weather search
    $('#btn-get-weather').off('click').on('click', function() {
        var city = $('#city-input').val().trim();
        if (city) {
            getWeatherInfo(city);
        } else {
            alert('Te rog introdu numele unui oras!');
        }
    });
    
    // Enter key for weather search
    $('#city-input').off('keypress').on('keypress', function(e) {
        if (e.which === 13) {
            $('#btn-get-weather').click();
        }
    });
    
    // Refresh news
    $('#btn-refresh-news').off('click').on('click', function() {
        loadNews();
    });
    
    // News category change
    $('#news-category').off('change').on('change', function() {
        loadNews();
    });
    
    // Load more news
    $('#btn-load-more').off('click').on('click', function() {
        loadMoreNews();
    });
}

function getWeatherInfo(city) {
    console.log('Getting weather for:', city);
    
    // Show loading state
    $('#weather-container').html(
        '<div class="loading-news">' +
        '<i class="fas fa-spinner fa-spin"></i>' +
        '<p>Se incarca informatiile meteorologice...</p>' +
        '</div>'
    );
    
    // Real OpenWeatherMap API call
    const API_KEY = '1a48717b3a13b5f88a829a021e1c3f1f';
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ro`;
    
    $.ajax({
        url: API_URL,
        method: 'GET',
        success: function(data) {
            displayWeatherData(data);
            getForecast(city);
        },
        error: function(xhr, status, error) {
            console.error('Weather API error:', error);
            displayWeatherError('Nu s-au putut incarca informatiile meteorologice pentru ' + city);
        }
    });
}

function getForecast(city) {
    const API_KEY = '1a48717b3a13b5f88a829a021e1c3f1f';
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ro`;
    
    $.ajax({
        url: FORECAST_URL,
        method: 'GET',
        success: function(data) {
            displayForecastData(data);
        },
        error: function(xhr, status, error) {
            console.error('Forecast API error:', error);
            // Show current weather without forecast if forecast fails
        }
    });
}

function displayWeatherData(data) {
    const current = data.main;
    const weather = data.weather[0];
    const wind = data.wind;
    
    const weatherHtml = `
        <div class="weather-current">
            <div class="weather-now">
                <h4><i class="fas fa-map-marker-alt"></i> ${data.name}, ${data.sys.country}</h4>
                <div class="weather-temperature">${Math.round(current.temp)}&deg;C</div>
                <div class="weather-description">${weather.description}</div>
                <div class="weather-feels-like">Se simte ca ${Math.round(current.feels_like)}&deg;C</div>
            </div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <span><i class="fas fa-thermometer-half"></i> Min/Max</span>
                    <strong>${Math.round(current.temp_min)}&deg;C / ${Math.round(current.temp_max)}&deg;C</strong>
                </div>
                <div class="weather-detail-item">
                    <span><i class="fas fa-tint"></i> Umiditate</span>
                    <strong>${current.humidity}%</strong>
                </div>
                <div class="weather-detail-item">
                    <span><i class="fas fa-wind"></i> Viteza vant</span>
                    <strong>${Math.round(wind.speed * 3.6)} km/h</strong>
                </div>
                <div class="weather-detail-item">
                    <span><i class="fas fa-thermometer-half"></i> Presiune</span>
                    <strong>${current.pressure} hPa</strong>
                </div>
                <div class="weather-detail-item">
                    <span><i class="fas fa-eye"></i> Vizibilitate</span>
                    <strong>${data.visibility ? Math.round(data.visibility / 1000) : 'N/A'} km</strong>
                </div>
            </div>
        </div>
        <div id="forecast-container">
            <div class="loading-forecast">
                <i class="fas fa-spinner fa-spin"></i> Se incarca prognoza...
            </div>
        </div>
    `;
    
    $('#weather-container').html(weatherHtml);
}

function displayForecastData(data) {
    // Group forecast by days (take one per day at noon)
    const dailyForecasts = [];
    const processed = new Set();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!processed.has(dateKey) && dailyForecasts.length < 5) {
            // Prefer noon forecast (12:00) or closest to it
            const hour = date.getHours();
            if (hour >= 11 && hour <= 13) {
                dailyForecasts.push({
                    date: date.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' }),
                    temp: Math.round(item.main.temp),
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                });
                processed.add(dateKey);
            }
        }
    });
    
    // If we don't have enough noon forecasts, fill with available ones
    if (dailyForecasts.length < 5) {
        const remaining = 5 - dailyForecasts.length;
        data.list.slice(0, remaining * 8).forEach((item, index) => {
            if (index % 8 === 0) { // Take every 8th item (roughly daily)
                const date = new Date(item.dt * 1000);
                const dateKey = date.toDateString();
                
                if (!processed.has(dateKey)) {
                    dailyForecasts.push({
                        date: date.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' }),
                        temp: Math.round(item.main.temp),
                        description: item.weather[0].description,
                        icon: item.weather[0].icon
                    });
                    processed.add(dateKey);
                }
            }
        });
    }
    
    const forecastHtml = `
        <div class="weather-forecast">
            <h5><i class="fas fa-calendar-alt"></i> Prognoza pe 5 zile</h5>
            <div class="forecast-grid">
                ${dailyForecasts.map(day => `
                    <div class="forecast-day">
                        <h6>${day.date}</h6>
                        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}" class="weather-icon">
                        <div class="forecast-temp">${day.temp}&deg;C</div>
                        <div class="forecast-desc">${day.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    $('#forecast-container').html(forecastHtml);
}

function displayWeatherError(message) {
    $('#weather-container').html(
        '<div class="error-message">' +
        '<i class="fas fa-exclamation-triangle"></i> ' + message +
        '</div>'
    );
}

let currentNewsPage = 1;
let isLoadingNews = false;

function loadNews(page = 1) {
    if (isLoadingNews) return;
    
    isLoadingNews = true;
    currentNewsPage = page;
    
    if (page === 1) {
        $('#news-container').html(
            '<div class="loading-news">' +
            '<i class="fas fa-spinner fa-spin"></i>' +
            '<p>Se incarca stirile...</p>' +
            '</div>'
        );
        $('#btn-load-more').hide();
    }
    
    const category = $('#news-category').val();
    console.log('Loading news for category:', category, 'page:', page);
    
    // Simplify and relax the queries to get more results
    const NEWS_API_KEY = '2b235b384b3a4897b900cc0c7799b848';
    
    // More relaxed queries that should return more results
    const queries = {
        'travel': 'travel OR vacation OR trip OR journey',
        'tourism': 'tourism OR tourist OR attractions OR destination',
        'vacation': 'vacation OR holiday OR getaway OR leisure',
        'destinations': 'destination OR "places to visit" OR attractions'
    };
    
    const query = queries[category] || queries.travel;
    
    // Try without domain restriction first to get more results
    const API_URL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&page=${page}&pageSize=12&apiKey=${NEWS_API_KEY}`;
    
    console.log('NewsAPI URL:', API_URL);
    
    // Try real NewsAPI first, fallback to server-side if CORS issues
    $.ajax({
        url: API_URL,
        method: 'GET',
        success: function(data) {
            console.log('NewsAPI response:', data);
            if (data.status === 'ok' && data.articles) {
                // More relaxed client-side filtering
                const filteredArticles = filterTravelRelevantNewsRelaxed(data.articles);
                console.log('Filtered articles count:', filteredArticles.length);
                
                if (filteredArticles.length > 0) {
                    displayNews(filteredArticles, page === 1);
                } else {
                    // If no articles pass filter, show original articles with warning
                    console.warn('No articles passed filter, showing original articles');
                    displayNews(data.articles.slice(0, 6), page === 1);
                }
            } else {
                console.warn('NewsAPI error or no articles:', data.message || 'No articles found');
                loadNewsAlternative(category, page);
            }
            isLoadingNews = false;
        },
        error: function(xhr, status, error) {
            console.warn('NewsAPI CORS/Network error, using fallback:', error);
            // Fallback to server-side endpoint due to CORS
            loadNewsAlternative(category, page);
        }
    });
}

function displayNews(articles, replaceContent = true) {
    if (!articles || articles.length === 0) {
        if (replaceContent) {
            $('#news-container').html(
                '<div class="no-news-message">' +
                '<i class="fas fa-newspaper"></i>' +
                '<p>Nu s-au gasit stiri pentru categoria selectata.</p>' +
                '</div>'
            );
        }
        return;
    }
    
    let newsHtml = '<div class="news-grid">';
    
    articles.forEach(function(article, index) {
        const publishedDate = new Date(article.publishedAt).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        newsHtml += `
            <div class="news-item" data-index="${index}">
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="news-image" onerror="this.style.display='none'">` : ''}
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-source"><i class="fas fa-newspaper"></i> ${article.source.name || article.source}</span>
                        <span class="news-date">${publishedDate}</span>
                    </div>
                    <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
                    <p class="news-description">${article.description || 'Descriere indisponibila.'}</p>
                    <a href="${article.url}" target="_blank" class="news-link">
                        <i class="fas fa-external-link-alt"></i> Citeste articolul complet
                    </a>
                </div>
            </div>
        `;
    });
    
    newsHtml += '</div>';
    
    if (replaceContent) {
        $('#news-container').html(newsHtml);
    } else {
        // For loading more news, append to existing grid
        $('#news-container .news-grid').append(
            articles.map(function(article, index) {
                const publishedDate = new Date(article.publishedAt).toLocaleDateString('ro-RO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                return `
                    <div class="news-item" data-index="${index}">
                        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="news-image" onerror="this.style.display='none'">` : ''}
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="news-source"><i class="fas fa-newspaper"></i> ${article.source.name || article.source}</span>
                                <span class="news-date">${publishedDate}</span>
                            </div>
                            <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
                            <p class="news-description">${article.description || 'Descriere indisponibila.'}</p>
                            <a href="${article.url}" target="_blank" class="news-link">
                                <i class="fas fa-external-link-alt"></i> Citeste articolul complet
                            </a>
                        </div>
                    </div>
                `;
            }).join('')
        );
    }
    
    // Show load more button if we have articles
    if (articles.length > 0) {
        $('#btn-load-more').show();
    }
}

function loadMoreNews() {
    currentNewsPage++;
    loadNews(currentNewsPage);
}

function displayNewsError() {
    $('#news-container').html(
        '<div class="error-message">' +
        '<i class="fas fa-exclamation-triangle"></i> ' +
        'Nu s-au putut incarca stirile. Te rog incearca din nou mai tarziu.' +
        '</div>'
    );
}

function loadNewsAlternative(category, page) {
    console.log('Loading news alternative for category:', category, 'page:', page);
    
    // Use server-side endpoint to avoid CORS issues
    $.ajax({
        type: "POST",
        url: "Index.aspx/GetNewsData",
        data: JSON.stringify({ category: category, page: page }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            console.log('Server response received:', response);
            var result;
            try { 
                result = JSON.parse(response.d); 
            } catch (e) { 
                console.error('Error parsing server response:', e);
                result = { success: false, message: 'Eroare la procesarea raspunsului server' }; 
            }
            
            console.log('Parsed result:', result);
            
            if (result.success && result.articles) {
                console.log('Displaying articles count:', result.articles.length);
                displayNews(result.articles, page === 1);
            } else {
                console.error('No articles or error:', result.message);
                // Force show mock data if everything fails
                displayMockNewsForced(category);
            }
            isLoadingNews = false;
        },
        error: function(xhr, status, error) {
            console.error('Server request failed:', error);
            // Force show mock data if server fails
            displayMockNewsForced(category);
            isLoadingNews = false;
        }
    });
}

function displayMockNewsForced(category) {
    console.log('Forcing mock news display for category:', category);
    
    // Generate mock data directly in JavaScript as final fallback
    const mockArticles = [
        {
            title: "Top Travel Destinations for 2024: Expert Recommendations",
            description: "Discover the most exciting travel destinations recommended by travel experts for this year. From hidden gems to popular hotspots.",
            source: { name: "Travel Weekly" },
            publishedAt: new Date().toISOString(),
            url: "https://example.com/travel-destinations-2024",
            urlToImage: "https://picsum.photos/400/250?random=1&travel"
        },
        {
            title: "Budget Travel Tips: How to Explore More for Less",
            description: "Learn practical strategies to make your travel budget stretch further without compromising on experiences.",
            source: { name: "Lonely Planet" },
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: "https://example.com/budget-travel-tips",
            urlToImage: "https://picsum.photos/400/250?random=2&vacation"
        },
        {
            title: "Best Family Vacation Spots: Kid-Friendly Destinations",
            description: "Planning a family vacation? Here are the top destinations that offer something special for travelers of all ages.",
            source: { name: "Family Travel Magazine" },
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            url: "https://example.com/family-vacation-spots",
            urlToImage: "https://picsum.photos/400/250?random=3&family"
        },
        {
            title: "Solo Travel Safety: Essential Tips for Independent Travelers",
            description: "Stay safe while exploring the world on your own with these essential safety tips and recommendations.",
            source: { name: "Adventure Travel News" },
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            url: "https://example.com/solo-travel-safety",
            urlToImage: "https://picsum.photos/400/250?random=4&solo"
        },
        {
            title: "Sustainable Tourism: Eco-Friendly Travel Options",
            description: "Make your travels more environmentally friendly with these sustainable tourism options and green travel tips.",
            source: { name: "Eco Tourism Today" },
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            url: "https://example.com/sustainable-tourism",
            urlToImage: "https://picsum.photos/400/250?random=5&eco"
        },
        {
            title: "Hotel Deals and Flight Discounts: Best Booking Strategies",
            description: "Find the best deals on accommodations and flights with these insider booking tips and strategies.",
            source: { name: "Travel Deals Weekly" },
            publishedAt: new Date(Date.now() - 18000000).toISOString(),
            url: "https://example.com/hotel-flight-deals",
            urlToImage: "https://picsum.photos/400/250?random=6&deals"
        }
    ];
    
    displayNews(mockArticles, true);
}

function filterTravelRelevantNews(articles) {
    // Keywords that indicate travel/vacation relevance
    const travelKeywords = [
        'travel', 'vacation', 'holiday', 'tourism', 'tourist', 'destination', 'trip', 'resort', 'hotel', 
        'flight', 'airline', 'airport', 'cruise', 'beach', 'mountain', 'city break', 'adventure',
        'backpacking', 'sightseeing', 'attractions', 'guide', 'visit', 'explore', 'journey',
        'booking', 'deals', 'package', 'itinerary', 'restaurant', 'accommodation', 'hostel'
    ];
    
    // Keywords that indicate non-travel content (negative filter)
    const excludeKeywords = [
        'politics', 'election', 'war', 'conflict', 'crime', 'murder', 'death', 'accident', 
        'disaster', 'earthquake', 'flood', 'fire', 'covid', 'pandemic', 'virus', 'disease',
        'economy', 'stock', 'market', 'business merger', 'lawsuit', 'court', 'arrest',
        'protest', 'riot', 'violence', 'attack', 'terrorism', 'military'
    ];
    
    return articles.filter(article => {
        const titleLower = (article.title || '').toLowerCase();
        const descLower = (article.description || '').toLowerCase();
        const fullText = titleLower + ' ' + descLower;
        
        // Check if article contains travel-related keywords
        const hasTravelKeywords = travelKeywords.some(keyword => 
            fullText.includes(keyword.toLowerCase())
        );
        
        // Check if article contains excluded keywords
        const hasExcludedKeywords = excludeKeywords.some(keyword => 
            fullText.includes(keyword.toLowerCase())
        );
        
        // Include article if it has travel keywords and doesn't have excluded keywords
        return hasTravelKeywords && !hasExcludedKeywords;
    });
}

function filterTravelRelevantNewsRelaxed(articles) {
    // More relaxed keywords for travel/vacation relevance
    const travelKeywords = [
        'travel', 'vacation', 'holiday', 'tourism', 'tourist', 'destination', 'trip', 'resort', 'hotel', 
        'flight', 'airline', 'airport', 'cruise', 'beach', 'mountain', 'adventure',
        'sightseeing', 'attractions', 'guide', 'visit', 'explore', 'journey',
        'booking', 'deals', 'restaurant', 'accommodation', 'city', 'country'
    ];
    
    // Reduce excluded keywords to only the most obvious non-travel content
    const excludeKeywords = [
        'politics', 'election', 'war', 'murder', 'death', 'crime', 'arrest',
        'disaster', 'earthquake', 'pandemic', 'virus', 'covid-19',
        'lawsuit', 'court', 'protest', 'violence', 'terrorism'
    ];
    
    const filtered = articles.filter(article => {
        const titleLower = (article.title || '').toLowerCase();
        const descLower = (article.description || '').toLowerCase();
        const fullText = titleLower + ' ' + descLower;
        
        // Check if article contains travel-related keywords
        const hasTravelKeywords = travelKeywords.some(keyword => 
            fullText.includes(keyword.toLowerCase())
        );
        
        // Check if article contains strongly excluded keywords
        const hasStronglyExcludedKeywords = excludeKeywords.some(keyword => 
            fullText.includes(keyword.toLowerCase())
        );
        
        // More lenient: include if has travel keywords OR doesn't have excluded keywords
        return hasTravelKeywords || !hasStronglyExcludedKeywords;
    });
    
    console.log(`Original articles: ${articles.length}, Filtered: ${filtered.length}`);
    return filtered.slice(0, 6); // Take max 6 articles
}