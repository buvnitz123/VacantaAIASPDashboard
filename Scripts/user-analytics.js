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
            url: "Index.aspx/GetUserPreferencesAnalytics",
            data: JSON.stringify({ userId: userId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                try {
                    const result = JSON.parse(response.d);
                    if (result.success) {
                        displayUserInfo(userId);
                        displayAnalytics(result.data);
                        loadInsights(userId);
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
        createBudgetChart(data.budgetAnalysis);
        createTimelineChart(data.timelineData);
        createCountriesChart(data.countriesDistribution);
        createActivityChart(data.activityDistribution);
        createBudgetRangeChart(data.budgetAnalysis.budgetRanges);
        
        // Show analytics dashboard
        $('.analytics-dashboard').fadeIn();
    }

    function updateQuickStats(data) {
        $('#totalPreferences').text(data.totalPreferences || 0);
        $('#favoriteCategory').text(data.favoriteCategory || '-');
        
        const avgBudget = data.budgetAnalysis ? 
            ((data.budgetAnalysis.averageMinBudget + data.budgetAnalysis.averageMaxBudget) / 2) : 0;
        $('#averageBudget').text(avgBudget > 0 ? `${Math.round(avgBudget)} RON` : '0 RON');
        
        $('#lastActivity').text(data.lastActivity || '-');
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
                                return `${context.label}: ${context.raw} (${percentage}%)`;
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
                    label: 'Preferințe',
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
                        ticks: {
                            stepSize: 1
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

    function createBudgetChart(budgetData) {
        if (!budgetData || (!budgetData.averageMinBudget && !budgetData.averageMaxBudget)) {
            showEmptyChart('budgetChart', 'Nu există date despre buget');
            return;
        }

        const ctx = document.getElementById('budgetChart').getContext('2d');
        charts.budget = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Buget Minim Mediu', 'Buget Maxim Mediu'],
                datasets: [{
                    label: 'RON',
                    data: [
                        Math.round(budgetData.averageMinBudget || 0),
                        Math.round(budgetData.averageMaxBudget || 0)
                    ],
                    backgroundColor: [colorPalettes.gradient[2], colorPalettes.gradient[3]],
                    borderColor: [colorPalettes.primary[2], colorPalettes.primary[3]],
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
                        ticks: {
                            callback: function(value) {
                                return value + ' RON';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw} RON`;
                            }
                        }
                    }
                }
            }
        });
    }

    function createTimelineChart(data) {
        if (!data || data.length === 0) {
            showEmptyChart('timelineChart', 'Nu există date timeline');
            return;
        }

        const ctx = document.getElementById('timelineChart').getContext('2d');
        charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: 'Preferințe noi',
                    data: data.map(item => item.count),
                    borderColor: colorPalettes.primary[1],
                    backgroundColor: colorPalettes.gradient[1],
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: colorPalettes.primary[1],
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
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

    function createCountriesChart(data) {
        if (!data || data.length === 0) {
            showEmptyChart('countriesChart', 'Nu există date despre țări');
            return;
        }

        const ctx = document.getElementById('countriesChart').getContext('2d');
        charts.countries = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: data.map(item => item.country),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: colorPalettes.gradient,
                    borderColor: colorPalettes.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
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

    function createBudgetRangeChart(data) {
        if (!data || data.length === 0) {
            showEmptyChart('budgetRangeChart', 'Nu există date despre evolutia bugetului');
            return;
        }

        const ctx = document.getElementById('budgetRangeChart').getContext('2d');
        charts.budgetRange = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [
                    {
                        label: 'Buget Minim',
                        data: data.map(item => item.min),
                        borderColor: colorPalettes.primary[2],
                        backgroundColor: colorPalettes.gradient[2],
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Buget Maxim',
                        data: data.map(item => item.max),
                        borderColor: colorPalettes.primary[3],
                        backgroundColor: colorPalettes.gradient[3],
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' RON';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} RON`;
                            }
                        }
                    }
                }
            }
        });
    }

    function loadInsights(userId) {
        $.ajax({
            type: "POST",
            url: "Index.aspx/GenerateUserInsights",
            data: JSON.stringify({ userId: userId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                try {
                    const result = JSON.parse(response.d);
                    if (result.success) {
                        displayInsights(result.insights);
                    }
                } catch (e) {
                    console.error('Error parsing insights response:', e);
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX error loading insights:', error);
            }
        });
    }

    function displayInsights(insights) {
        if (insights.budgetInsight) {
            $('#budgetInsightText').text(insights.budgetInsight);
        }
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