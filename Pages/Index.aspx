<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="WebAdminDashboard.Index" Async="true" %>
<%@ Register Src="~/Pages/Shared/Navbar.ascx" TagPrefix="uc" TagName="Navbar" %>
<%@ Register Src="~/Pages/Shared/Sidebar.ascx" TagPrefix="uc" TagName="Sidebar" %>
<%@ Register Src="~/Pages/Utilizatori.ascx" TagPrefix="pg" TagName="Utilizatori" %>
<%@ Register Src="~/Pages/News.ascx" TagPrefix="pg" TagName="News" %>
<%@ Register Src="~/Pages/CategoriiVacanta.ascx" TagPrefix="pg" TagName="CategoriiVacanta" %>
<%@ Register Src="~/Pages/Destinatie.ascx" TagPrefix="pg" TagName="Destinatii" %>
<%@ Register Src="~/Pages/Facilitate.ascx" TagPrefix="pg" TagName="Facilitati" %>
<%@ Register Src="~/Pages/PunctDeInteres.ascx" TagPrefix="pg" TagName="PuncteDeInteres" %>
<%@ Register Src="~/Pages/Sugestie.ascx" TagPrefix="pg" TagName="Sugestii" %>


<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard</title>
    <link href="/Content/styles.css?v=9" rel="stylesheet" />
    <link href="/Content/news.css?v=2" rel="stylesheet" />
    <link href="/Content/categorie-vacanta.css?v=3" rel="stylesheet" />
    <link href="/Content/facilitate.css?v=14" rel="stylesheet" />
    <link href="/Content/destinatie.css?v=3" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.js"></script>
    <script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css" />
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css"/>
    <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <link href="/Content/user-analytics.css?v=1" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/Scripts/app.js?v=8"></script>
    <script src="/Scripts/news.js?v=5"></script>
    <script src="/Scripts/categorie-vacanta.js?v=3"></script>
    <script src="/Scripts/facilitate.js?v=15"></script>
    <script src="/Scripts/destinatie.js?v=4"></script>
    <script src="/Scripts/user-detail.js"></script>
    <script src="/Scripts/user-analytics.js?v=2"></script>
</head>
<body>

    <uc:Navbar runat="server" ID="TopNavbar" />

    <uc:Sidebar runat="server" ID="LeftSidebar" />

    <div class="content">
      <div class="section home active">
        <h2>Dashboard Analytics - Preferințe Utilizatori</h2>
        
        <!-- User Selector Section -->
        <div class="user-selector-section">
            <div class="selector-header">
                <h3><i class="fas fa-user-circle"></i> Selectează Utilizatorul pentru Analiză</h3>
            </div>
            <div class="selector-controls">
                <select id="userSelector" class="form-control">
                    <option value="">-- Selectează un utilizator --</option>
                </select>
                <button id="refreshUserData" class="btn btn-refresh" title="Reîmprospătează datele">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
            <div class="selected-user-info" style="display:none;">
                <div class="user-info-card">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <h4 id="selectedUserName"></h4>
                        <p id="selectedUserEmail"></p>
                        <span id="selectedUserStatus" class="status-badge"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Indicator -->
        <div id="loadingIndicator" class="loading-indicator" style="display:none;">
            <div class="spinner"></div>
            <p>Se încarcă datele de analiză...</p>
        </div>

        <!-- No Data Message -->
        <div id="noDataMessage" class="no-data-message" style="display:none;">
            <div class="no-data-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <h3>Nu există date de analizat</h3>
            <p>Utilizatorul selectat nu are preferințe înregistrate încă.</p>
        </div>

        <!-- Analytics Dashboard -->
        <div class="analytics-dashboard" style="display:none;">
            
            <!-- Quick Stats Cards -->
            <div class="stats-section">
                <h3><i class="fas fa-tachometer-alt"></i> Statistici Rapide</h3>
                <div class="stats-cards-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" id="totalFavorites">0</div>
                            <div class="stat-label">Total Favorite</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" id="totalActivities">0</div>
                            <div class="stat-label">Total Activități</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" id="lastActivity">-</div>
                            <div class="stat-label">Ultima Activitate</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <h3><i class="fas fa-chart-bar"></i> Analize Detaliate</h3>

                <!-- First Row of Charts -->
                <div class="charts-row">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4><i class="fas fa-chart-pie"></i> Categorii de Vacanță</h4>
                            <p>Distribuția interesului pe categorii</p>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="categoriesChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4><i class="fas fa-chart-bar"></i> Destinații Preferate</h4>
                            <p>Scorul de interes per destinație</p>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="destinationsChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Second Row of Charts -->
                <div class="charts-row">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4><i class="fas fa-chart-line"></i> Activitatea Utilizatorului</h4>
                            <p>Tipuri de activități înregistrate</p>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="activityChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Insights Section -->
                <div class="insights-section" style="margin-top: 2rem; background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3><i class="fas fa-lightbulb" style="color: #fb8500;"></i> Recomandări și Insight-uri</h3>
                    <div class="insights-content" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                        <div class="insight-card" style="padding: 1rem; border-left: 4px solid #3b82f6; background: #f3f4f6; border-radius: 4px;">
                            <h5><i class="fas fa-map-marker-alt"></i> Sugestie Destinație</h5>
                            <p id="destinationInsightText" style="margin-top: 0.5rem; color: #4b5563;">Se încarcă...</p>
                        </div>
                        <div class="insight-card" style="padding: 1rem; border-left: 4px solid #8b5cf6; background: #f3f4f6; border-radius: 4px;">
                            <h5><i class="fas fa-tags"></i> Preferință Categorie</h5>
                            <p id="categoryInsightText" style="margin-top: 0.5rem; color: #4b5563;">Se încarcă...</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
      <div class="section news">
        <pg:News runat="server" ID="PgNews" />
      </div>
      <div class="section utilizatori">
        <pg:Utilizatori runat="server" ID="PgUtilizatori" />
      </div>
      <div class="section categorii">
        <pg:CategoriiVacanta runat="server" ID="PgCategoriiVacanta" />
      </div>
      <div class="section destinatii">
        <pg:Destinatii runat="server" ID="PgDestinatii" />
      </div>
      <div class="section facilitati">
        <pg:Facilitati runat="server" ID="PgFacilitati" />
      </div>
      <div class="section puncte">
        <pg:PuncteDeInteres runat="server" ID="PgPuncteDeInteres" />
      </div>
      <div class="section sugestii">
        <pg:Sugestii runat="server" ID="PgSugestii" />
      </div>
    </div>
</body>
</html>
