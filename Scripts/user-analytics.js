// User Analytics JavaScript
(function() {
    'use strict';

    // Global variables
    let currentUserId = null;
    let charts = {};
    
    // Chart.js default configuration
    Chart.defaults.font.family = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.color = '#6b7280';
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 20;

    // Color palettes for charts
    const colorPalettes = {
        primary: [
            '#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#ffd23f',
            '#fb8500', '#8ecae6', '#219ebc', '#023047', '#ffb3c6'
        ],
        gradient: [
            'rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)', 
            'rgba(6, 214, 160, 0.8)', 'rgba(247, 37, 133, 0.8)',
            'rgba(255, 210, 63, 0.8)', 'rgba(251, 133, 0, 0.8)'
        ]
    };

    // Initialize analytics when DOM is ready
    function initializeAnalytics() {
        loadUsers();
        bindEventHandlers();
        loadGlobalModelStats();

        // Initialize only if we're on the home section
        if (document.querySelector('.section.home.active')) {
            setupUserAnalytics();
        }
    }

    function bindEventHandlers() {
        // User selector change
        $('#userSelector').on('change', function() {
            const userId = $(this).val();
            if (userId) {
                currentUserId = parseInt(userId);
                loadUserAnalytics(currentUserId);
            } else {
                hideAnalyticsDashboard();
            }
        });

        // Refresh button
        $('#refreshUserData').on('click', function() {
            if (currentUserId) {
                loadUserAnalytics(currentUserId);
            }
        });

        // Listen for section changes
        $(document).on('sectionChanged', function(e, sectionName) {
            if (sectionName === 'home') {
                setupUserAnalytics();
            }
        });
    }

    function setupUserAnalytics() {
        // Reset state
        currentUserId = null;
        hideAnalyticsDashboard();
        
        // Load users if not already loaded
        if ($('#userSelector option').length <= 1) {
            loadUsers();
        }
    }

    function loadUsers() {
        $.ajax({
            type: "POST",
            url: "Index.aspx/GetUsersForAnalytics",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            beforeSend: function() {
                $('#userSelector').prop('disabled', true);
            },
            success: function(response) {
                try {
                    const result = JSON.parse(response.d);
                    if (result.success) {
                        populateUserSelector(result.users);
                    } else {
                        console.error('Error loading users:', result.message);
                        showNotification('Eroare la încărcarea utilizatorilor', 'error');
                    }
                } catch (e) {
                    console.error('Error parsing users response:', e);
                    showNotification('Eroare la procesarea datelor utilizatorilor', 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX error loading users:', error);
                showNotification('Eroare de comunicare cu serverul', 'error');
            },
            complete: function() {
                $('#userSelector').prop('disabled', false);
            }
        });
    }

    function populateUserSelector(users) {
        const $selector = $('#userSelector');
        $selector.empty().append('<option value="">-- Selectează un utilizator --</option>');
        
        users.forEach(function(user) {
            const optionText = `${user.Nume} ${user.Prenume} (${user.Email})`;
            $selector.append(`<option value="${user.Id_Utilizator}">${optionText}</option>`);
        });
    }

    function loadUserAnalytics(userId) {
        showLoadingIndicator();
        hideAnalyticsDashboard();
        
        // Load analytics data
        $.ajax({
            type: "POST",
            url: "Index.aspx/GetUserAnalyticsData",
            data: JSON.stringify({ userId: userId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                try {
                    const result = JSON.parse(response.d);
                    if (result.success) {
                        displayUserInfo(userId);
                        displayAnalytics(result.data);
                        loadUserInsights(userId);
                    } else {
                        showNoDataMessage();
                        console.warn('No analytics data:', result.message);
                    }
                } catch (e) {
                    console.error('Error parsing analytics response:', e);
                    showNotification('Eroare la procesarea datelor de analiză', 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX error loading analytics:', error);
                showNotification('Eroare la încărcarea analizelor', 'error');
            },
            complete: function() {
                hideLoadingIndicator();
            }
        });
    }

    function displayUserInfo(userId) {
        const $selector = $('#userSelector');
        const selectedOption = $selector.find('option:selected');
        const userText = selectedOption.text();
        
        if (userText && userText !== '-- Selectează un utilizator --') {
            const parts = userText.match(/^(.+?)\s+(.+?)\s+\((.+?)\)$/);
            if (parts) {
                $('#selectedUserName').text(`${parts[1]} ${parts[2]}`);
                $('#selectedUserEmail').text(parts[3]);
                $('#selectedUserStatus')
                    .removeClass('active inactive')
                    .addClass('active')
                    .text('Activ');
                
                $('.selected-user-info').fadeIn();
            }
        }
    }

    function displayAnalytics(data) {
        // Update quick stats
        updateQuickStats(data);
        
        // Destroy existing charts
        destroyAllCharts();
        
        // Create new charts
        createCategoriesChart(data.categoriesDistribution);
        createDestinationsChart(data.destinationsDistribution);
        createActivityChart(data.activityDistribution);
        
        // Show analytics dashboard
        $('.analytics-dashboard').fadeIn();
    }

    function updateQuickStats(data) {
        $('#totalFavorites').text(data.totalFavorites || 0);
        $('#totalActivities').text(data.totalActivities || 0);
        $('#lastActivity').text(data.lastActivity || '-');
    }

    function loadUserInsights(userId) {
        $.ajax({
            type: "POST",
            url: "Index.aspx/GenerateUserInsights",
            data: JSON.stringify({ userId: userId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                try {
                    const result = JSON.parse(response.d);
                    if (result.success && result.insights) {
                        $('#destinationInsightText').text(result.insights.destinationInsight);
                        $('#categoryInsightText').text(result.insights.categoryInsight);
                    }
                } catch (e) {
                    console.error('Error parsing insights:', e);
                }
            }
        });
    }

    function createCategoriesChart(data) {
        if (!data || data.length === 0) {
            showEmptyChart('categoriesChart', 'Nu există date despre categorii');
            return;
        }

        const ctx = document.getElementById('categoriesChart').getContext('2d');
        charts.categories = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.category),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: colorPalettes.primary,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: Score ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function createDestinationsChart(data) {
        if (!data || data.length === 0) {
            showEmptyChart('destinationsChart', 'Nu există date despre destinații');
            return;
        }

        const ctx = document.getElementById('destinationsChart').getContext('2d');
        charts.destinations = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.destination),
                datasets: [{
                    label: 'Scor Relevanță',
                    data: data.map(item => item.count),
                    backgroundColor: colorPalettes.gradient[0],
                    borderColor: colorPalettes.primary[0],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Scor Total'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function createActivityChart(data) {
        if (!data || data.length === 0) {
            showEmptyChart('activityChart', 'Nu există date despre activități');
            return;
        }

        const ctx = document.getElementById('activityChart').getContext('2d');
        charts.activity = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(item => item.activity),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: colorPalettes.primary,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function displayInsights(insights) {
        if (insights.destinationInsight) {
            $('#destinationInsightText').text(insights.destinationInsight);
        }
        if (insights.categoryInsight) {
            $('#categoryInsightText').text(insights.categoryInsight);
        }
    }

    function showEmptyChart(chartId, message) {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const parent = canvas.parentElement;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Add empty state message
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'chart-loading';
            emptyDiv.innerHTML = `
                <i class="fas fa-chart-bar" style="font-size: 2rem; color: #d1d5db; margin-bottom: 8px;"></i>
                <p style="color: #6b7280; font-size: 0.9rem;">${message}</p>
            `;
            
            // Hide canvas and show empty state
            canvas.style.display = 'none';
            parent.appendChild(emptyDiv);
        }
    }

    function destroyAllCharts() {
        Object.keys(charts).forEach(function(key) {
            if (charts[key]) {
                charts[key].destroy();
                delete charts[key];
            }
        });
        
        // Remove empty state messages and show canvases
        document.querySelectorAll('.chart-loading').forEach(function(div) {
            div.remove();
        });
        
        document.querySelectorAll('.chart-wrapper canvas').forEach(function(canvas) {
            canvas.style.display = 'block';
        });
    }

    function showLoadingIndicator() {
        $('#loadingIndicator').fadeIn();
    }

    function hideLoadingIndicator() {
        $('#loadingIndicator').fadeOut();
    }

    function showNoDataMessage() {
        $('#noDataMessage').fadeIn();
    }

    function hideAnalyticsDashboard() {
        $('.analytics-dashboard').hide();
        $('.selected-user-info').hide();
        $('#noDataMessage').hide();
        destroyAllCharts();
    }

    function showNotification(message, type) {
        // Simple notification system - can be enhanced
        const notification = $(`
            <div class="notification ${type}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                background: ${type === 'error' ? '#fee2e2' : '#dcfce7'};
                color: ${type === 'error' ? '#dc2626' : '#166534'};
                border: 1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'};
                border-radius: 8px;
                z-index: 1000;
                font-size: 14px;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">
                ${message}
            </div>
        `);
        
        $('body').append(notification);
        
        setTimeout(function() {
            notification.fadeOut(function() {
                notification.remove();
            });
        }, 5000);
    }

    // Global Model Performance Stats
    let globalCharts = {};

    function loadGlobalModelStats() {
        console.log('[GlobalStats] Starting loadGlobalModelStats...');
        $.ajax({
            type: "POST",
            url: "Index.aspx/GetGlobalModelPerformanceStats",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                console.log('[GlobalStats] AJAX success. Raw response:', response);
                try {
                    var result = JSON.parse(response.d);
                    console.log('[GlobalStats] Parsed result:', result);
                    if (result.success) {
                        console.log('[GlobalStats] Data received:', result.data);
                        displayGlobalStats(result.data);
                    } else {
                        console.warn('[GlobalStats] Server returned success=false:', result.message, result.error);
                        $('#globalStatsLoading').html('<i class="fas fa-info-circle"></i> ' + (result.message || 'Nu există date.'));
                    }
                } catch (e) {
                    console.error('[GlobalStats] Error parsing response:', e);
                    console.error('[GlobalStats] response.d was:', response.d);
                    $('#globalStatsLoading').html('<i class="fas fa-exclamation-triangle"></i> Eroare la procesarea datelor.');
                }
            },
            error: function(xhr, status, error) {
                console.error('[GlobalStats] AJAX error:', status, error);
                console.error('[GlobalStats] Response text:', xhr.responseText);
                console.error('[GlobalStats] Status code:', xhr.status);
                $('#globalStatsLoading').html('<i class="fas fa-exclamation-triangle"></i> Eroare la încărcarea statisticilor.');
            }
        });
    }

    function displayGlobalStats(data) {
        var models = data.modelComparison;
        console.log('[GlobalStats] Displaying comparison for', models.length, 'models');

        // Summary cards
        $('#globalTotalRequests').text(data.totalRequests);
        $('#globalTotalModels').text(data.totalModels);
        $('#globalSatisfaction').text(data.satisfactionRate > 0 ? data.satisfactionRate + '%' : 'N/A');

        // Comparison table
        var tbody = $('#modelComparisonBody');
        tbody.empty();
        models.forEach(function(m) {
            var satText = m.satisfaction >= 0 ? m.satisfaction + '%' : 'N/A';
            var satClass = m.satisfaction >= 70 ? 'color:#22c55e;' : (m.satisfaction >= 40 ? 'color:#f59e0b;' : (m.satisfaction >= 0 ? 'color:#ef4444;' : 'color:#6b7280;'));
            tbody.append(
                '<tr>' +
                '<td style="text-align:left;"><strong>' + m.model + '</strong></td>' +
                '<td style="text-align:left;">' + m.count + '</td>' +
                '<td style="text-align:left;">' + m.avgDuration + 's</td>' +
                '<td style="text-align:left;">' + formatNumber(m.avgTokenInput) + '</td>' +
                '<td style="text-align:left;">' + formatNumber(m.avgTokenOutput) + '</td>' +
                '<td style="text-align:left;">' + formatNumber(m.totalTokens) + '</td>' +
                '<td style="text-align:left; color:#22c55e; font-weight:600;">' + m.likes + '</td>' +
                '<td style="text-align:left; color:#ef4444; font-weight:600;">' + m.dislikes + '</td>' +
                '<td style="text-align:left; ' + satClass + 'font-weight:600;">' + satText + '</td>' +
                '</tr>'
            );
        });

        // Destroy old global charts
        Object.keys(globalCharts).forEach(function(key) {
            if (globalCharts[key]) { globalCharts[key].destroy(); delete globalCharts[key]; }
        });

        var modelNames = models.map(function(m) { return m.model; });

        // 1. Duration comparison bar chart
        var ctx1 = document.getElementById('globalDurationCompareChart').getContext('2d');
        globalCharts.duration = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: modelNames,
                datasets: [{
                    label: 'Durată Medie (s)',
                    data: models.map(function(m) { return m.avgDuration; }),
                    backgroundColor: colorPalettes.primary.slice(0, models.length),
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: models.length > 5 ? 'y' : 'x',
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });

        // 2. Token comparison grouped bar chart (input vs output)
        var ctx2 = document.getElementById('globalTokenCompareChart').getContext('2d');
        globalCharts.tokens = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: modelNames,
                datasets: [
                    {
                        label: 'Tokeni Input (med)',
                        data: models.map(function(m) { return m.avgTokenInput; }),
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Tokeni Output (med)',
                        data: models.map(function(m) { return m.avgTokenOutput; }),
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderColor: '#8b5cf6',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Tokeni' } }
                }
            }
        });

        // 3. Model distribution doughnut
        var ctx3 = document.getElementById('globalModelDistChart').getContext('2d');
        globalCharts.modelDist = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: modelNames,
                datasets: [{
                    data: models.map(function(m) { return m.count; }),
                    backgroundColor: colorPalettes.primary.slice(0, models.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var total = models.reduce(function(s, m) { return s + m.count; }, 0);
                                var pct = ((context.raw / total) * 100).toFixed(1);
                                return context.label + ': ' + context.raw + ' cereri (' + pct + '%)';
                            }
                        }
                    }
                }
            }
        });

        // 4. Satisfaction per model bar chart
        var modelsWithRating = models.filter(function(m) { return m.satisfaction >= 0; });
        var ctx4 = document.getElementById('globalSatisfactionChart').getContext('2d');
        if (modelsWithRating.length > 0) {
            globalCharts.satisfaction = new Chart(ctx4, {
                type: 'bar',
                data: {
                    labels: modelsWithRating.map(function(m) { return m.model; }),
                    datasets: [{
                        label: 'Satisfacție (%)',
                        data: modelsWithRating.map(function(m) { return m.satisfaction; }),
                        backgroundColor: modelsWithRating.map(function(m) {
                            return m.satisfaction >= 70 ? 'rgba(34, 197, 94, 0.7)' : (m.satisfaction >= 40 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(239, 68, 68, 0.7)');
                        }),
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, max: 100, title: { display: true, text: '%' } }
                    }
                }
            });
        } else {
            // No ratings yet
            var parent = ctx4.canvas.parentElement;
            ctx4.canvas.style.display = 'none';
            var emptyDiv = document.createElement('div');
            emptyDiv.className = 'chart-loading';
            emptyDiv.innerHTML = '<i class="fas fa-star" style="font-size:2rem;color:#d1d5db;margin-bottom:8px;"></i><p style="color:#6b7280;">Nu există aprecieri încă.</p>';
            parent.appendChild(emptyDiv);
        }

        $('#globalStatsLoading').hide();
        $('#globalStatsContent').fadeIn();
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        initializeAnalytics();
    });

    // Export functions for global access if needed
    window.UserAnalytics = {
        init: initializeAnalytics,
        loadUser: loadUserAnalytics,
        refreshData: function() {
            if (currentUserId) {
                loadUserAnalytics(currentUserId);
            }
        }
    };

})();