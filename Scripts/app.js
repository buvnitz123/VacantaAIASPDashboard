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
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return data ? "<button class='btn-action view' title='Vizualizare imagine' data-image='" + data + "'><i class='fas fa-search'></i></button>" : "";
                    }
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return "<div class='action-buttons'>" +
                               "<button class='btn-action edit' title='Modifică' data-id='" + row.Id_CategorieVacanta + "'><i class='fas fa-edit'></i></button>" +
                               "<button class='btn-action delete' title='Șterge' data-id='" + row.Id_CategorieVacanta + "' data-name='" + row.Denumire + "'><i class='fas fa-trash'></i></button>" +
                               "</div>";
                    }
                }
            ]
        });
        
        // Add view functionality for categories
        $(document).on('click', '.btn-action.view', function(e) {
            e.preventDefault();
            var imageUrl = $(this).data('image');
            if (imageUrl) {
                $('#preview-img').attr('src', imageUrl);
                $('#dialog-preview-categorie').dialog({
                    modal: true,
                    width: 'auto',
                    maxWidth: '90%',
                    height: 'auto',
                    maxHeight: '90vh',
                    buttons: {
                        "Închide": function() {
                            $(this).dialog("close");
                        }
                    }
                });
            }
        });

        // Add delete functionality for categories
        $(document).on('click', '.btn-action.delete', function(e) {
            e.preventDefault();
            var categorieId = $(this).data('id');
            var categorieName = $(this).data('name');
            var deleteButton = $(this);
            var row = $(this).closest('tr');
            var table = $('#tblCategorii').DataTable();
            
            // Show confirmation dialog
            $("#delete-categorie-name").text(categorieName);
            
            var deleteDialog = $("#dialog-delete-categorie").dialog({
                resizable: false,
                height: "auto",
                width: 400,
                modal: true,
                buttons: {
                    "Șterge": function() {
                        var originalContent = deleteButton.html();
                        deleteButton.html('<i class="fas fa-spinner fa-spin"></i>');
                        deleteButton.prop('disabled', true);
                        
                        $.ajax({
                            type: "POST",
                            url: "Index.aspx/DeleteCategorieVacanta",
                            data: JSON.stringify({ categorieId: categorieId.toString() }),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function(response) {
                                var result = JSON.parse(response.d);
                                if (result.success) {
                                    table.row(row).remove().draw(false);
                                    updateTips('Categoria a fost ștearsă cu succes!');
                                } else {
                                    updateTips('Eroare: ' + result.message);
                                    deleteButton.html(originalContent);
                                    deleteButton.prop('disabled', false);
                                }
                            },
                            error: function(xhr, status, error) {
                                updateTips('Eroare la ștergerea categoriei: ' + error);
                                deleteButton.html(originalContent);
                                deleteButton.prop('disabled', false);
                            },
                            complete: function() {
                                deleteDialog.dialog("close");
                            }
                        });
                    },
                    "Anulează": function() {
                        $(this).dialog("close");
                    }
                }
            });
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
