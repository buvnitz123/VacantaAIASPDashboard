<%@ Control Language="C#" %>

<div class="news-container">
    <h2><i class="fas fa-newspaper"></i> Stiri despre Vacante</h2>
    <p>Descopera cele mai recente stiri din lumea turismului si informatii despre vreme pentru destinatiile tale preferate.</p>

    <!-- Weather Section -->
    <div class="weather-section">
        <div class="section-header">
            <h3><i class="fas fa-cloud-sun"></i> Informatii Meteorologice</h3>
            <div class="weather-search">
                <input type="text" id="city-input" placeholder="Introdu numele orasului..." />
                <button id="btn-get-weather" class="btn-weather">
                    <i class="fas fa-search"></i> Cautare Vreme
                </button>
            </div>
        </div>
        
        <div id="weather-container" class="weather-info">
            <div class="weather-placeholder">
                <i class="fas fa-map-marker-alt"></i>
                <p>Introdu numele unui oras pentru a vedea vremea actuala si prognoza pe 5 zile.</p>
            </div>
        </div>
    </div>

    <!-- News Section -->
    <div class="news-section">
        <div class="section-header">
            <h3><i class="fas fa-globe"></i> Stiri despre Turism si Vacante</h3>
            <div class="news-controls">
                <button id="btn-refresh-news" class="btn-refresh">
                    <i class="fas fa-sync-alt"></i> Actualizeaza
                </button>
                <select id="news-category" class="news-category-filter">
                    <option value="travel">Calatorii</option>
                    <option value="tourism">Turism</option>
                    <option value="vacation">Vacante</option>
                    <option value="destinations">Destinatii</option>
                </select>
            </div>
        </div>
        
        <div id="news-container" class="news-list">
            <div class="loading-news">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Se incarca stirile...</p>
            </div>
        </div>
        
        <div class="load-more-container">
            <button id="btn-load-more" class="btn-load-more" style="display:none;">
                <i class="fas fa-plus-circle"></i> Incarca mai multe stiri
            </button>
        </div>
    </div>

    <!-- Travel Tips Section -->
    <div class="tips-section">
        <div class="section-header">
            <h3><i class="fas fa-lightbulb"></i> Sfaturi de Calatorie</h3>
        </div>
        
        <div class="tips-grid">
            <div class="tip-card">
                <div class="tip-icon">
                    <i class="fas fa-suitcase"></i>
                </div>
                <h4>Bagajul Perfect</h4>
                <p>Impacheteza inteligent! Foloseste cuburi de ambalare si fa o lista pentru a nu uita nimic important.</p>
            </div>
            
            <div class="tip-card">
                <div class="tip-icon">
                    <i class="fas fa-passport"></i>
                </div>
                <h4>Documente de Calatorie</h4>
                <p>Verifica validitatea pasaportului cu 6 luni inainte. Fa copii digitale ale documentelor importante.</p>
            </div>
            
            <div class="tip-card">
                <div class="tip-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h4>Siguranta in Calatorie</h4>
                <p>Informeaza-te despre situatia din destinatie si ia o asigurare de calatorie pentru orice eventualitate.</p>
            </div>
            
            <div class="tip-card">
                <div class="tip-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <h4>Bugetul de Vacanta</h4>
                <p>Planifica un buget realist si pastreaza 20% pentru cheltuieli neprevazute. Compara preturile online.</p>
            </div>
        </div>
    </div>
</div>