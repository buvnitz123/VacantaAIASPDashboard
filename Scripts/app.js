// Sidebar toggle logic for Home/About
(function () {
    var allowedSections = ['home', 'utilizatori', 'categorii'];

    function isAllowedSection(sectionName) {
        return allowedSections.indexOf(sectionName) !== -1;
    }

    function showSection(sectionName) {
        var sections = document.querySelectorAll('.section');
        for (var i = 0; i < sections.length; i++) {
            sections[i].classList.remove('active');
        }
        var target = document.querySelector('.' + sectionName);
        if (target) {
            target.classList.add('active');
            if (sectionName === 'utilizatori') {
                initUtilizatoriTable();
            } else if (sectionName === 'categorii') {
                initCategoriiTable();
            }
        }

        var links = document.querySelectorAll('.sidebar a');
        for (var j = 0; j < links.length; j++) {
            links[j].classList.remove('active');
            if (links[j].getAttribute('data-section') === sectionName) {
                links[j].classList.add('active');
            }
        }

        updateTopnavActive();
    }

    function handleClick(e) {
        var section = this.getAttribute('data-section');
        if (!section) return;
        e.preventDefault();
        showSection(section);
        if (history && history.replaceState) {
            history.replaceState(null, '', '#' + section);
            updateTopnavActive();
        } else {
            location.hash = section;
        }
    }

    function updateTopnavActive() {
        var topLinks = document.querySelectorAll('.topnav a');
        var currentHash = location.hash || '#home';
        for (var k = 0; k < topLinks.length; k++) {
            topLinks[k].classList.remove('active');
            if (topLinks[k].getAttribute('href') === currentHash) {
                topLinks[k].classList.add('active');
            }
        }
    }

    function init() {
        var links = document.querySelectorAll('.sidebar a');
        for (var i = 0; i < links.length; i++) {
            var isToggle = links[i].classList.contains('sidebar-toggle');
            if (!isToggle) {
                links[i].addEventListener('click', handleClick);
            }
        }

        var toggle = document.querySelector('.sidebar .sidebar-toggle');
        var sidebar = document.getElementById('sidebar');
        var content = document.querySelector('.content');
        if (toggle && sidebar && content) {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                // Add fade transition by toggling a fading class briefly
                sidebar.classList.add('fading');
                sidebar.classList.toggle('collapsed');
                content.classList.toggle('expanded-when-collapsed');
                setTimeout(function () {
                    sidebar.classList.remove('fading');
                }, 250);
            });
        }

        var initial = (location.hash || '#home').replace('#', '');
        if (!isAllowedSection(initial)) {
            initial = 'home';
        }
        showSection(initial);
        updateTopnavActive();

        window.addEventListener('hashchange', function () {
            var hash = (location.hash || '').replace('#', '');
            updateTopnavActive();
            if (isAllowedSection(hash)) {
                showSection(hash);
            }
        });
    }

    // DataTables initializers (idempotent)
    var utilizatoriInited = false;
    function initUtilizatoriTable() {
        if (utilizatoriInited || typeof $ === 'undefined' || !$('#tblUtilizatori').length) return;
        $('#tblUtilizatori').DataTable({
            ajax: {
                url: 'Index.aspx/GetUtilizatoriData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { data = JSON.parse(json.d); } catch (e) { }
                    return data;
                }
            },
            columns: [
                { data: 'Id_Utilizator' },
                { data: 'Nume' },
                { data: 'Prenume' },
                { data: 'Email' },
                { data: 'Telefon' },
                { data: 'EsteActiv' }
            ]
        });
        utilizatoriInited = true;
    }

    var categoriiInited = false;
    function initCategoriiTable() {
        if (categoriiInited || typeof $ === 'undefined' || !$('#tblCategorii').length) return;
        $('#tblCategorii').DataTable({
            ajax: {
                url: 'Index.aspx/GetCategoriiVacantaData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { data = JSON.parse(json.d); } catch (e) { }
                    return data;
                }
            },
            columns: [
                { data: 'Id_CategorieVacanta' },
                { data: 'Denumire' },
                { data: 'ImagineUrl' }
            ]
        });
        categoriiInited = true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();