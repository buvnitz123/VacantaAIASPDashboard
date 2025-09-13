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
        
        // Check if DataTable is already initialized
        if ($.fn.DataTable.isDataTable('#tblUtilizatori')) {
            return; // Don't reinitialize if already exists
        }
        
        $('#tblUtilizatori').DataTable({
            ajax: {
                url: 'Index.aspx/GetUtilizatoriData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { 
                        data = JSON.parse(json.d); 
                    } catch (e) { 
                        console.error('Error parsing utilizatori data:', e);
                    }
                    // Optional: mascare parola la sursă dacă tot apare
                    data.forEach(function(u){ if (u.Parola) u.Parola = '***'; });
                    return data;
                }
            },
            columns: [
                { data: 'Id_Utilizator' },
                { data: 'Nume' },
                { data: 'Prenume' },
                { data: 'Email' },
                { data: 'Telefon' },
                { 
                    data: 'EsteActiv',
                    render: function(val){ return val === 1 ? 'Da' : 'Nu'; }
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function(row){
                        return "<div class='action-buttons'>" +
                               "<button class='btn-action view-user' title='Detalii' data-id='" + row.Id_Utilizator + "'><i class='fas fa-eye'></i></button>" +
                               "<button class='btn-action delete-user' title='Sterge' data-id='" + row.Id_Utilizator + "' data-name='" + row.Nume + " " + row.Prenume + "'><i class='fas fa-trash'></i></button>" +
                               "</div>";
                    }
                }
            ]
        });

        // Navigare către pagina de detalii
        $('#tblUtilizatori tbody')
            .off('click', '.view-user')
            .on('click', '.view-user', function(e){
                e.preventDefault();
                var id = $(this).data('id');
                if (!id) return;
                window.location.href = 'UserDetail.aspx?id=' + encodeURIComponent(id);
            });

        // Dialog de ștergere (lazy create)
        var deleteDialog = $("#dialog-delete-utilizator");
        if (!deleteDialog.length) {
            $('body').append(
                "<div id='dialog-delete-utilizator' title='Confirmare stergere' style='display:none;'>" +
                "<p class='delete-message'><span class='ui-icon ui-icon-alert' style='float:left;margin:12px 12px 20px 0;'></span>" +
                "Sigur doriti sa stergeti utilizatorul <strong><span id='delete-utilizator-name'></span></strong>?</p>" +
                "<p class='delete-warning'><em>Aceasta actiune este ireversibila.</em></p>" +
                "</div>"
            );
            deleteDialog = $("#dialog-delete-utilizator");
        }

        $('#tblUtilizatori tbody')
            .off('click', '.delete-user')
            .on('click', '.delete-user', function(e){
                e.preventDefault();
                var id = $(this).data('id');
                var name = $(this).data('name');
                $("#delete-utilizator-name").text(name);

                deleteDialog.dialog({
                    modal: true,
                    width: 400,
                    buttons: {
                        "Sterge": function(){
                            var dlg = $(this);
                            $.ajax({
                                type: "POST",
                                url: "Index.aspx/DeleteUtilizator",
                                data: JSON.stringify({ id: id }),
                                contentType: "application/json; charset=utf-8",
                                dataType: "json"
                            }).done(function(resp){
                                var r;
                                try { 
                                    r = JSON.parse(resp.d); 
                                } catch (e) { 
                                    r = { success: false, message: 'Eroare la procesarea raspunsului server' }; 
                                }
                                
                                if (r.success) {
                                    $('#tblUtilizatori').DataTable().ajax.reload();
                                } else {
                                    alert(r.message || 'Eroare la stergere.');
                                }
                            }).fail(function(){
                                alert('Eroare la comunicare server.');
                            }).always(function(){
                                dlg.dialog('close');
                            });
                        },
                        "Anuleaza": function(){ $(this).dialog('close'); }
                    }
                });
            });

        utilizatoriInited = true;
    }

    var categoriiInited = false;
    function initCategoriiTable() {
        if (categoriiInited || typeof $ === 'undefined' || !$('#tblCategorii').length) return;
        
        // Check if DataTable is already initialized
        if ($.fn.DataTable.isDataTable('#tblCategorii')) {
            return; // Don't reinitialize if already exists
        }
        
        $('#tblCategorii').DataTable({
            ajax: {
                url: 'Index.aspx/GetCategoriiVacantaData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { 
                        data = JSON.parse(json.d); 
                    } catch (e) { 
                        console.error('Error parsing categorii data:', e);
                    }
                    return data;
                }
            },
            columns: [
                { data: 'Id_CategorieVacanta' },
                { data: 'Denumire' },
                {
                    data: 'ImagineUrl',
                    orderable: false,
                    render: function (data) {
                        return data
                            ? "<button class='btn-action view' title='Vizualizare imagine'><i class='fas fa-search'></i></button>" : "";
                    }
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return "<div class='action-buttons'>" +
                               "<button class='btn-action edit' title='Modifica' data-id='" + row.Id_CategorieVacanta + "'><i class='fas fa-edit'></i></button>" +
                               "<button class='btn-action delete' title='Sterge' data-id='" + row.Id_CategorieVacanta + "' data-name='" + row.Denumire + "'><i class='fas fa-trash'></i></button>" +
                               "</div>";
                    }
                }
            ]
        });

        // Delete category
        $(document).on('click', '.btn-action.delete', function(e) {
            if (!$(this).closest('table').is('#tblCategorii')) return; // ensure category table
            e.preventDefault();
            var categorieId = $(this).data('id');
            var categorieName = $(this).data('name');
            var deleteButton = $(this);
            var row = $(this).closest('tr');
            var table = $('#tblCategorii').DataTable();
            $("#delete-categorie-name").text(categorieName);
            var deleteDialog = $("#dialog-delete-categorie").dialog({
                resizable: false,
                height: "auto",
                width: 400,
                modal: true,
                buttons: {
                    "Sterge": function() {
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
                                var result;
                                try { 
                                    result = JSON.parse(response.d); 
                                } catch (e) { 
                                    result = { success: false, message: 'Eroare la procesarea raspunsului server' }; 
                                }
                                
                                if (result.success) {
                                    table.row(row).remove().draw(false);
                                } else {
                                    deleteButton.html(originalContent);
                                    deleteButton.prop('disabled', false);
                                }
                            },
                            complete: function() { deleteDialog.dialog("close"); }
                        });
                    },
                    "Anuleaza": function() { $(this).dialog("close"); }
                }
            });
        });

        categoriiInited = true;
    }


    var destinatiiInited = false;
    function initDestinatiiTable() {
        if (destinatiiInited || typeof $ === 'undefined' || !$('#tblDestinatii').length) return;
        
        // Check if DataTable is already initialized
        if ($.fn.DataTable.isDataTable('#tblDestinatii')) {
            return; // Don't reinitialize if already exists
        }
        
        $('#tblDestinatii').DataTable({
            ajax: {
                url: 'Index.aspx/GetDestinatiiData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { 
                        data = JSON.parse(json.d); 
                    } catch (e) { 
                        console.error('Error parsing destinatii data:', e);
                    }
                    return data;
                }
            },
            columns: [
                { data: 'Id_Destinatie' },
                { data: 'Denumire' },
                { data: 'Tara' },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return "<div class='action-buttons'>" +
                               "<button class='btn-action view view-destination' title='Detalii' data-id='" + row.Id_Destinatie + "'><i class='fas fa-eye'></i></button>" +
                               "<button class='btn-action delete delete-destination' title='Sterge' data-id='" + row.Id_Destinatie + "' data-name='" + row.Denumire + "'><i class='fas fa-trash'></i></button>" +
                               "</div>";
                    }
                }
            ]       
        });

        // Destination view handler with unique class
        $('#tblDestinatii tbody')
          .off('click', '.view-destination')
          .on('click', '.view-destination', function (e) {
              e.preventDefault();
              var destinationId = $(this).data('id');
              if (!destinationId || isNaN(destinationId)) return;
              window.location.href = 'DestinationDetail.aspx?id=' + encodeURIComponent(destinationId);
          });

        // Delete destination
        $('#tblDestinatii tbody')
          .off('click', '.delete-destination')
          .on('click', '.delete-destination', function (e) {
              e.preventDefault();
              var destinatieId = $(this).data('id');
              var destinatieName = $(this).data('name');
              $("#delete-destinatie-name").text(destinatieName);
              $("#dialog-delete-destinatie").dialog({
                  resizable: false,
                  height: "auto",
                  width: 400,
                  modal: true,
                  buttons: {
                      "Sterge": function () {
                          var dialogRef = $(this);
                          $.ajax({
                              type: "POST",
                              url: "Index.aspx/DeleteDestinatie",
                              data: JSON.stringify({ destinatieId: destinatieId }),
                              contentType: "application/json; charset=utf-8",
                              dataType: "json",
                              success: function (response) {
                                  var result;
                                  try { 
                                      result = JSON.parse(response.d); 
                                  } catch (e) { 
                                      result = { success: false, message: 'Eroare la procesarea raspunsului server' }; 
                                  }
                                  
                                  if (result && result.success) {
                                      $('#tblDestinatii').DataTable().ajax.reload();
                                      dialogRef.dialog("close");
                                  } else {
                                      alert("Eroare: " + (result ? result.message : 'necunoscuta'));
                                  }
                              },
                              error: function () { alert("A aparut o eroare la stergere."); }
                          });
                      },
                      "Anuleaza": function () { $(this).dialog("close"); }
                  }
              });
          });

        destinatiiInited = true;
    }

    var facilitatiInited = false;
    function initFacilitatiTable() {
        if (facilitatiInited || typeof $ === 'undefined' || !$('#tblFacilitati').length) return;
        
        // Check if DataTable is already initialized
        if ($.fn.DataTable.isDataTable('#tblFacilitati')) {
            return; // Don't reinitialize if already exists
        }
        
        var table = $('#tblFacilitati').DataTable({
            ajax: {
                url: 'Index.aspx/GetFacilitatiData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { data = JSON.parse(json.d); } catch (e) { console.error('Error parsing facilitati data:', e); }
                    return data;
                }
            },
            columns: [
                { data: 'Id_Facilitate', className: 'dt-left' },
                { data: 'Denumire', className: 'dt-left' },
                { 
                    data: 'Descriere', 
                    className: 'descriere-cell', 
                    render: function (data, type) { 
                        if (type === 'display' && data) { 
                            const previewText = data.length > 10 ? data.substring(0, 10) + '...' : data; 
                            return "<div class='descriere-content'>" +
                                   "<button class='btn-action view-descriere' title='Vizualizeaza descrierea' data-descriere='" + data + "'>" +
                                   "<i class='fas fa-eye'></i>" +
                                   "</button>" +
                                   "<span class='desc-preview'>" + previewText + "</span>" +
                                   "</div>"; 
                        } 
                        return ''; 
                    } 
                },
                { 
                    data: null, 
                    orderable: false, 
                    className: 'dt-left', 
                    render: function(row){ 
                        return "<div class='action-buttons'>" +
                               "<button class='btn-action edit' title='Editeaza' data-id='" + row.Id_Facilitate + "'>" +
                               "<i class='fas fa-edit'></i>" +
                               "</button>" +
                               "<button class='btn-action delete' title='Sterge' data-id='" + row.Id_Facilitate + "' data-denumire='" + row.Denumire + "'>" +
                               "<i class='fas fa-trash'></i>" +
                               "</button>" +
                               "</div>"; 
                    } 
                }
            ]
        });

        $('#tblFacilitati tbody').on('click', '.btn-action.edit', function() { 
            var id = $(this).data('id'); 
            editFacilitate(id); 
        });
        
        $('#tblFacilitati tbody').on('click', '.btn-action.view-descriere', function(e) { 
            e.stopPropagation(); 
            var descriere = $(this).data('descriere'); 
            if (descriere) { 
                $('<div>').html('<p style="max-width: 400px; max-height: 300px; overflow: auto; white-space: pre-wrap;">' + descriere + '</p>').dialog({ 
                    title: 'Descriere', 
                    width: 550, 
                    modal: true, 
                    buttons: { 
                        'Inchide': function() { 
                            $(this).dialog('close'); 
                        } 
                    } 
                }); 
            } 
        });
        
        $('#tblFacilitati tbody').on('click', '.btn-action.delete', function() { 
            var $button = $(this); 
            var id = $button.data('id'); 
            var denumire = $button.data('denumire'); 
            confirmDeleteFacilitate(id, denumire); 
        });

        facilitatiInited = true;
    }

    var puncteInited = false;
    function initPuncteTable() {
        if (puncteInited || typeof $ === 'undefined' || !$('#tblPuncteDeInteres').length) return;
        
        // Check if DataTable is already initialized
        if ($.fn.DataTable.isDataTable('#tblPuncteDeInteres')) {
            return; // Don't reinitialize if already exists
        }
        
        $('#tblPuncteDeInteres').DataTable({
            ajax: {
                url: 'Index.aspx/GetPuncteInteresData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { 
                        data = JSON.parse(json.d); 
                    } catch (e) { 
                        console.error('Error parsing puncte data:', e);
                    }
                    return data;
                }
            },
            columns: [
                { data: 'Id_PunctDeInteres', className: 'dt-left' },
                { data: 'Denumire', className: 'dt-left' },
                { data: 'Tip', className: 'dt-left' },
                { 
                    data: 'Descriere', 
                    className: 'dt-left',
                    render: function(data, type) {
                        if (type === 'display' && data) {
                            var previewText = data.length > 50 ? data.substring(0, 50) + '...' : data;
                            return previewText;
                        }
                        return data || '';
                    }
                },
                { 
                    data: 'Destinatie',
                    className: 'dt-left',
                    render: function(data, type, row) {
                        if (data && data.Denumire) {
                            return "<a href='DestinationDetail.aspx?id=" + row.Id_Destinatie + "' class='destination-link' title='Vezi detalii destinatie'>" + 
                                   data.Denumire + " <i class='fas fa-external-link-alt'></i></a>";
                        }
                        return 'Destinatie necunoscuta';
                    }
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    className: 'dt-left',
                    render: function(data, type, row) {
                        return "<div class='action-buttons'>" +
                               "<button class='btn-action view-punct' title='Vizualizeaza detalii' data-id='" + row.Id_PunctDeInteres + "'>" +
                               "<i class='fas fa-eye'></i>" +
                               "</button>" +
                               "</div>";
                    }
                }
            ]
        });

        // View punct de interes details (modal popup)
        $('#tblPuncteDeInteres tbody').on('click', '.btn-action.view-punct', function(e) {
            e.stopPropagation();
            var punctId = $(this).data('id');
            
            // Find the row data
            var table = $('#tblPuncteDeInteres').DataTable();
            var row = $(this).closest('tr');
            var rowData = table.row(row).data();
            
            if (rowData) {
                // Create modal dialog content
                var modalContent = 
                    "<div class='punct-details'>" +
                    "<div class='detail-row'><strong>Denumire:</strong> " + (rowData.Denumire || '-') + "</div>" +
                    "<div class='detail-row'><strong>Tip:</strong> " + (rowData.Tip || '-') + "</div>" +
                    "<div class='detail-row'><strong>Destinatie:</strong> " + (rowData.Destinatie ? rowData.Destinatie.Denumire : '-') + "</div>" +
                    "<div class='detail-row description'><strong>Descriere:</strong><br>" + (rowData.Descriere || '-') + "</div>" +
                    "</div>";
                
                // Show modal
                $('<div>').html(modalContent).dialog({
                    title: 'Detalii Punct de Interes: ' + rowData.Denumire,
                    width: 600,
                    modal: true,
                    resizable: true,
                    buttons: {
                        'Inchide': function() { 
                            $(this).dialog('close'); 
                        },
                        'Vezi Destinatia': function() {
                            window.location.href = 'DestinationDetail.aspx?id=' + rowData.Id_Destinatie;
                        }
                    }
                });
            }
        });

        puncteInited = true;
    }

    var sugestiiInited = false;
    function initSugestiiTable() {
        if (sugestiiInited || typeof $ === 'undefined' || !$('#tblSugestii').length) return;
        
        // Check if DataTable is already initialized
        if ($.fn.DataTable.isDataTable('#tblSugestii')) {
            return; // Don't reinitialize if already exists
        }
        
        $('#tblSugestii').DataTable({
            ajax: {
                url: 'Index.aspx/GetSugestiiData',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                dataSrc: function (json) {
                    var data = [];
                    try { 
                        data = JSON.parse(json.d); 
                    } catch (e) { 
                        console.error('Error parsing sugestii data:', e);
                    }
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
