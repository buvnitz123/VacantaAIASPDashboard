// Sidebar toggle logic
(function () {
    var allowedSections = ['home', 'utilizatori', 'categorii', 'destinatii', 'facilitati', 'puncte', 'sugestii'];

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
            } else if (sectionName === 'destinatii') {
                initDestinatiiTable();
            } else if (sectionName === 'facilitati') {
                initFacilitatiTable();
            } else if (sectionName === 'puncte') {
                initPuncteTable();
            } else if (sectionName === 'sugestii') {
                initSugestiiTable();
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

    // ---- DataTables initializers ----
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
                {
                    data: 'ImagineUrl',
                    render: function (data, type, row) {
                        return "<button class='btn-icon lupa' title='Vezi imagine' data-img-url='" + data + "'>🔍</button>";
                    }
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return "<button class='btn-action edit' title='Modifică'>✏️</button>" +
                            "<button class='btn-action delete' title='Șterge'>🗑️</button>";
                    }
                }
            ]
        });
        categoriiInited = true;
    }


    var destinatiiInited = false;
    function initDestinatiiTable() {
        if (destinatiiInited || typeof $ === 'undefined' || !$('#tblDestinatii').length) return;
        $('#tblDestinatii').DataTable({
            ajax: {
                url: 'Index.aspx/GetDestinatiiData',
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
                { data: 'Id_Destinatie' },
                { data: 'Denumire' },
                { data: 'Tara' },
                { data: 'Oras' },
                { data: 'Regiune' },
                { data: 'Descriere' },
                { data: 'Data_Inregistrare' },
                { data: 'PretAdult' },
                { data: 'PretMinor' }
            ]
        });
        destinatiiInited = true;
    }

    var facilitatiInited = false;
    function initFacilitatiTable() {
        if (facilitatiInited || typeof $ === 'undefined' || !$('#tblFacilitati').length) return;
        $('#tblFacilitati').DataTable({
            ajax: {
                url: 'Index.aspx/GetFacilitatiData',
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
                { data: 'Id_Facilitate' },
                { data: 'Denumire' },
                { data: 'Descriere' }
            ]
        });
        facilitatiInited = true;
    }

    var puncteInited = false;
    function initPuncteTable() {
        if (puncteInited || typeof $ === 'undefined' || !$('#tblPuncteDeInteres').length) return;
        $('#tblPuncteDeInteres').DataTable({
            ajax: {
                url: 'Index.aspx/GetPuncteInteresData',
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
                { data: 'Id_PunctDeInteres' },
                { data: 'Denumire' },
                { data: 'Descriere' },
                { data: 'Tip' },
                { data: 'Id_Destinatie' }
            ]
        });
        puncteInited = true;
    }

    var sugestiiInited = false;
    function initSugestiiTable() {
        if (sugestiiInited || typeof $ === 'undefined' || !$('#tblSugestii').length) return;
        $('#tblSugestii').DataTable({
            ajax: {
                url: 'Index.aspx/GetSugestiiData',
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
                { data: 'Id_Sugestie' },
                { data: 'Data_Inregistrare' },
                { data: 'EsteGenerataDeAI' },
                { data: 'Titlu' },
                { data: 'Buget_Estimat' },
                { data: 'Descriere' },
                { data: 'EstePublic' },
                { data: 'CodPartajare' },
                { data: 'Id_Destinatie' },
                { data: 'Id_Utilizator' }
            ]
        });
        sugestiiInited = true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
