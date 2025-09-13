$(document).ready(function() {
    // Get destination ID from URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var destinationId = urlParams.get('id');
    
    if (!destinationId) {
        showError('ID-ul destinatiei nu a fost specificat');
        return;
    }

    // Store destination ID globally
    window.currentDestinationId = parseInt(destinationId);

    // Load destination details
    loadDestinationDetails(destinationId);

    // Back button functionality
    $('#btn-back-to-destinations').click(function() {
        window.location.href = 'Index.aspx#destinatii';
    });

    // Edit button functionality
    $('#btn-edit-destination').click(function() {
        // TODO: Implement edit functionality
        alert('Functionalitatea de editare va fi implementata in viitor');
    });

    // Handle sidebar navigation from detail page
    $(document).on('click', '.sidebar a[data-section]', function(e) {
        e.preventDefault();
        var section = $(this).data('section');
        window.location.href = 'Index.aspx#' + section;
    });

    // Handle navbar navigation from detail page
    $(document).on('click', '.topnav a', function(e) {
        var href = $(this).attr('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            window.location.href = 'Index.aspx' + href;
        }
    });
});

function loadDestinationDetails(destinationId) {
    $('#loading-indicator').show();
    $('#error-message').hide();
    $('#destination-content').hide();

    $.ajax({
        type: "POST",
        url: "DestinationDetail.aspx/GetDestinationDetails",
        data: JSON.stringify({ destinationId: parseInt(destinationId) }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            $('#loading-indicator').hide();
            
            var result;
            try { 
                result = JSON.parse(response.d); 
            } catch (e) { 
                showError('Eroare la procesarea raspunsului server'); 
                return;
            }
            
            if (result.success && result.destination) {
                displayDestinationDetails(result.destination);
                // Initialize puncte de interes functionality after content is loaded
                setTimeout(function() {
                    try {
                        initPuncteInteresManagement();
                        initPuncteInteresTable(parseInt(destinationId));
                    } catch (e) {
                        console.error('Error initializing puncte de interes:', e);
                        showError('Eroare la initializarea punctelor de interes: ' + e.message);
                    }
                }, 500);
            } else {
                showError(result.message || 'Eroare la incarcarea destinatiei');
            }
        },
        error: function(xhr, status, error) {
            $('#loading-indicator').hide();
            console.error('Ajax error loading destination:', error);
            console.error('Status:', xhr.status);
            console.error('Response:', xhr.responseText);
            showError('Eroare de comunicare cu serverul');
        }
    });
}

function displayDestinationDetails(destination) {
    // Update page title
    $('#destination-title').text('Detalii: ' + destination.Denumire);
    document.title = 'Detalii: ' + destination.Denumire + ' - Dashboard';
    
    // Fill in basic information
    $('#detail-denumire').text(destination.Denumire || '-');
    $('#detail-tara').text(destination.Tara || '-');
    $('#detail-oras').text(destination.Oras || '-');
    $('#detail-regiune').text(destination.Regiune || '-');
    $('#detail-descriere').text(destination.Descriere || '-');
    $('#detail-pret-adult').text((destination.PretAdult || 0) + ' RON');
    $('#detail-pret-minor').text((destination.PretMinor || 0) + ' RON');
    
    var dataInregistrare = destination.Data_Inregistrare || '-';
    if (dataInregistrare !== '-') {
        try {
            var date = new Date(dataInregistrare);
            dataInregistrare = date.toLocaleDateString('ro-RO');
        } catch (e) {
            dataInregistrare = destination.Data_Inregistrare;
        }
    }
    $('#detail-data-inregistrare').text(dataInregistrare);

    // Display images if available
    var imagesContainer = $('#images-gallery');
    if (!imagesContainer.length) {
        console.error('Images gallery container not found');
        return;
    }
    
    console.log('Images data:', destination.Images);
    
    if (destination.Images && destination.Images.length > 0) {
        imagesContainer.empty();
        
        destination.Images.forEach(function(image, index) {
            console.log('Processing image:', image);
            
            var imageElement = $('<div class="gallery-item">').append(
                $('<img class="gallery-image">').attr('src', image.ImagineUrl).attr('alt', 'Imagine ' + (index + 1)),
                $('<div class="image-overlay">').append(
                    $('<i class="fas fa-search-plus">')
                )
            );
            
            imageElement.click(function() {
                showImageModal(image.ImagineUrl);
            });
            
            imagesContainer.append(imageElement);
        });
        
        $('.images-card').show();
    } else {
        console.log('No images found for destination');
        imagesContainer.html('<div class="no-images">Nu sunt imagini disponibile pentru aceasta destinatie</div>');
        $('.images-card').show();
    }

    $('#destination-content').show();
}

function initPuncteInteresTable(destinatieId) {
    // Verify table exists
    if (!$('#tblPuncteDestinatie').length) {
        console.error('Table #tblPuncteDestinatie not found in DOM');
        return;
    }
    
    console.log('Initializing puncte de interes table for destination:', destinatieId);
    
    // Check if DataTable is already initialized and destroy it
    if ($.fn.DataTable.isDataTable('#tblPuncteDestinatie')) {
        console.log('Destroying existing DataTable');
        $('#tblPuncteDestinatie').DataTable().destroy();
        $('#tblPuncteDestinatie').empty().html(
            '<thead><tr><th>ID</th><th>Denumire</th><th>Tip</th><th>Descriere</th><th>Acțiuni</th></tr></thead><tbody></tbody>'
        );
    }
    
    try {
        $('#tblPuncteDestinatie').DataTable({
            ajax: {
                url: 'DestinationDetail.aspx/GetPuncteByDestinatie',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: function() {
                    return JSON.stringify({ destinatieId: destinatieId });
                },
                dataSrc: function (json) {
                    console.log('Ajax response received:', json);
                    var data = [];
                    try { 
                        data = JSON.parse(json.d); 
                        console.log('Parsed data:', data);
                    } catch (e) { 
                        console.error('Error parsing puncte data:', e);
                        console.error('Raw response:', json);
                    }
                    return data;
                },
                error: function(xhr, error, thrown) {
                    console.error('Ajax error:', error);
                    console.error('Status:', xhr.status);
                    console.error('Response:', xhr.responseText);
                    console.error('Thrown:', thrown);
                    alert('Eroare la încărcarea punctelor de interes: ' + error + '\nStatus: ' + xhr.status + '\nDetalii în consolă F12');
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
                    data: null,
                    orderable: false,
                    searchable: false,
                    className: 'dt-left',
                    render: function(data, type, row) {
                        return "<div class='action-buttons'>" +
                               "<button class='btn-action view-punct-dest' title='Vizualizeaza cu imagini' data-id='" + row.Id_PunctDeInteres + "'>" +
                               "<i class='fas fa-eye'></i>" +
                               "</button>" +
                               "<button class='btn-action edit-punct-dest' title='Editeaza' data-id='" + row.Id_PunctDeInteres + "'>" +
                               "<i class='fas fa-edit'></i>" +
                               "</button>" +
                               "<button class='btn-action delete-punct-dest' title='Sterge' data-id='" + row.Id_PunctDeInteres + "' data-name='" + row.Denumire + "'>" +
                               "<i class='fas fa-trash'></i>" +
                               "</button>" +
                               "</div>";
                    }
                }
            ],
            language: {
                emptyTable: "Nu exista puncte de interes pentru aceasta destinatie",
                loadingRecords: "Se incarca...",
                processing: "Se proceseaza...",
                info: "Afisare _START_ la _END_ din _TOTAL_ inregistrari",
                infoEmpty: "Afisare 0 la 0 din 0 inregistrari",
                infoFiltered: "(filtrat din _MAX_ inregistrari totale)",
                lengthMenu: "Afisare _MENU_ inregistrari",
                search: "Cautare:",
                zeroRecords: "Nu s-au gasit inregistrari potrivite",
                paginate: {
                    first: "Primul",
                    last: "Ultimul",
                    next: "Urmatorul",
                    previous: "Precedentul"
                }
            }
        });
        console.log('DataTable initialized successfully');
    } catch (e) {
        console.error('Error initializing DataTable:', e);
        alert('Eroare la initializarea tabelului: ' + e.message);
    }
}

function initPuncteInteresManagement() {
    var tips = $(".validateTips");

    function updateTips(t) {
        tips.text(t).addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function validatePunctForm() {
        var valid = true;
        var denumire = $("#denumire-punct").val().trim();
        var tip = $("#tip-punct").val().trim();

        $("#denumire-punct").removeClass("ui-state-error");
        $("#tip-punct").removeClass("ui-state-error");

        if (!denumire) {
            $("#denumire-punct").addClass("ui-state-error");
            updateTips("Denumirea este obligatorie.");
            valid = false;
        }

        if (!tip) {
            $("#tip-punct").addClass("ui-state-error");
            updateTips("Tipul este obligatoriu.");
            valid = false;
        }

        return valid;
    }

    function validateEditPunctForm() {
        var valid = true;
        var denumire = $("#edit-denumire-punct").val().trim();
        var tip = $("#edit-tip-punct").val().trim();

        $("#edit-denumire-punct").removeClass("ui-state-error");
        $("#edit-tip-punct").removeClass("ui-state-error");

        if (!denumire) {
            $("#edit-denumire-punct").addClass("ui-state-error");
            updateTips("Denumirea este obligatorie.");
            valid = false;
        }

        if (!tip) {
            $("#edit-tip-punct").addClass("ui-state-error");
            updateTips("Tipul este obligatoriu.");
            valid = false;
        }

        return valid;
    }

    function adaugaPunct() {
        if (!validatePunctForm()) {
            return false;
        }

        var data = {
            destinatieId: window.currentDestinationId,
            denumire: $("#denumire-punct").val().trim(),
            tip: $("#tip-punct").val().trim(),
            descriere: $("#descriere-punct").val().trim()
        };

        $.ajax({
            type: "POST",
            url: "DestinationDetail.aspx/AddPunctDeInteres",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                var result;
                try { 
                    result = JSON.parse(response.d); 
                } catch (e) { 
                    result = { success: false, message: 'Eroare la procesarea răspunsului server' }; 
                }
                
                if (result.success) {
                    $('#tblPuncteDestinatie').DataTable().ajax.reload();
                    $("#dialog-punct").dialog("close");
                    updateTips("Punctul de interes a fost adaugat cu succes!");
                } else {
                    updateTips('Eroare: ' + result.message);
                }
            },
            error: function(xhr, status, error) {
                updateTips('A aparut o eroare la adaugarea punctului de interes.');
            }
        });

        return true;
    }

    function modificaPunct() {
        if (!validateEditPunctForm()) {
            return false;
        }

        var data = {
            id: parseInt($("#edit-id-punct").val()),
            denumire: $("#edit-denumire-punct").val().trim(),
            tip: $("#edit-tip-punct").val().trim(),
            descriere: $("#edit-descriere-punct").val().trim()
        };

        $.ajax({
            type: "POST",
            url: "DestinationDetail.aspx/UpdatePunctDeInteres",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                var result;
                try { 
                    result = JSON.parse(response.d); 
                } catch (e) { 
                    result = { success: false, message: 'Eroare la procesarea răspunsului server' }; 
                }
                
                if (result.success) {
                    $('#tblPuncteDestinatie').DataTable().ajax.reload();
                    $("#dialog-edit-punct").dialog("close");
                    updateTips("Punctul de interes a fost modificat cu succes!");
                } else {
                    updateTips('Eroare: ' + result.message);
                }
            },
            error: function(xhr, status, error) {
                updateTips('A aparut o eroare la modificarea punctului de interes.');
            }
        });

        return true;
    }

    // Initialize dialogs
    $("#dialog-punct").dialog({
        autoOpen: false,
        height: 450,
        width: 500,
        modal: true,
        buttons: {
            "Adauga": adaugaPunct,
            "Anulare": function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            var form = $("#form-punct")[0];
            if (form) {
                form.reset();
            }
            $(".ui-state-error").removeClass("ui-state-error");
            tips.text("Toate campurile sunt obligatorii.").removeClass("ui-state-highlight");
        }
    });

    $("#dialog-edit-punct").dialog({
        autoOpen: false,
        height: 450,
        width: 500,
        modal: true,
        buttons: {
            "Salveaza": modificaPunct,
            "Anulare": function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            var form = $("#form-edit-punct")[0];
            if (form) {
                form.reset();
            }
            $(".ui-state-error").removeClass("ui-state-error");
            tips.text("Toate campurile sunt obligatorii.").removeClass("ui-state-highlight");
        }
    });

    $("#dialog-view-punct").dialog({
        autoOpen: false,
        height: 600,
        width: 800,
        modal: true,
        buttons: {
            "Inchide": function() {
                $(this).dialog("close");
            }
        }
    });

    $("#dialog-delete-punct").dialog({
        autoOpen: false,
        modal: true,
        width: 400,
        buttons: {
            "Sterge": function() {
                var punctId = $(this).data('punctId');
                var dialogRef = $(this);
                
                $.ajax({
                    type: "POST",
                    url: "DestinationDetail.aspx/DeletePunctDeInteres",
                    data: JSON.stringify({ id: punctId }),
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
                            $('#tblPuncteDestinatie').DataTable().ajax.reload();
                            updateTips("Punctul de interes a fost sters cu succes!");
                        } else {
                            updateTips('Eroare: ' + result.message);
                        }
                        dialogRef.dialog("close");
                    },
                    error: function(xhr, status, error) {
                        updateTips('A aparut o eroare la stergerea punctului de interes.');
                        dialogRef.dialog("close");
                    }
                });
            },
            "Anuleaza": function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $(this).removeData('punctId');
        }
    });

    // Event handlers
    $("#btn-adauga-punct").click(function() {
        $("#dialog-punct").dialog("open");
    });

    // Delegate event handlers for dynamically created buttons
    $(document).on('click', '.view-punct-dest', function(e) {
        e.preventDefault();
        var punctId = $(this).data('id');
        
        // Show loading in the view modal
        $("#view-punct-content").html('<div class="loading-punct"><i class="fas fa-spinner fa-spin"></i> Se incarca detaliile si imaginile...</div>');
        $("#dialog-view-punct").dialog("open");
        
        // Load punct details and images
        loadPunctDetailsWithImages(punctId);
    });

    $(document).on('click', '.edit-punct-dest', function(e) {
        e.preventDefault();
        var punctId = $(this).data('id');
        
        $.ajax({
            type: "POST",
            url: "DestinationDetail.aspx/GetPunctDeInteresById",
            data: JSON.stringify({ id: punctId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                var result;
                try { 
                    result = JSON.parse(response.d); 
                } catch (e) { 
                    updateTips('Eroare la procesarea răspunsului server'); 
                    return;
                }
                
                if (result && result.Denumire) {
                    $("#edit-id-punct").val(result.Id_PunctDeInteres);
                    $("#edit-denumire-punct").val(result.Denumire);
                    $("#edit-tip-punct").val(result.Tip);
                    $("#edit-descriere-punct").val(result.Descriere || '');
                    $("#dialog-edit-punct").dialog("open");
                } else {
                    updateTips('Nu s-au putut incarca datele pentru editare.');
                }
            },
            error: function(xhr, status, error) {
                updateTips('A aparut o eroare la incarcarea datelor pentru editare.');
            }
        });
    });

    $(document).on('click', '.delete-punct-dest', function(e) {
        e.preventDefault();
        var punctId = $(this).data('id');
        var punctName = $(this).data('name');
        
        $("#delete-punct-name").text(punctName);
        $("#dialog-delete-punct").data('punctId', punctId).dialog("open");
    });
}

function loadPunctDetailsWithImages(punctId) {
    // Load basic details and saved images
    $.ajax({
        type: "POST",
        url: "DestinationDetail.aspx/GetPunctDeInteresById",
        data: JSON.stringify({ id: punctId }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result;
            try { 
                result = JSON.parse(response.d); 
            } catch (e) { 
                $("#view-punct-content").html('<div class="error-punct">Eroare la procesarea răspunsului server</div>');
                return;
            }
            
            if (result && result.Denumire) {
                // Display basic info
                var content = "<div class='punct-details-full'>" +
                             "<div class='detail-section'>" +
                             "<h3>Informatii generale</h3>" +
                             "<div class='detail-row'><strong>Denumire:</strong> " + result.Denumire + "</div>" +
                             "<div class='detail-row'><strong>Tip:</strong> " + result.Tip + "</div>" +
                             "<div class='detail-row description'><strong>Descriere:</strong><br>" + (result.Descriere || '-') + "</div>" +
                             "</div>" +
                             "<div class='detail-section'>" +
                             "<h3>Imagini asociate</h3>" +
                             "<div id='punct-images-container'>";
                             
                // Check if we have saved images
                if (result.Images && result.Images.length > 0) {
                    console.log(`Displaying ${result.Images.length} saved images`);
                    content += "<div class='punct-images-gallery'>";
                    
                    result.Images.forEach(function(image, index) {
                        content += "<div class='punct-gallery-item'>" +
                                 "<img src='" + image.ImagineUrl + "' alt='Imagine " + (index + 1) + "' class='punct-gallery-image' onclick='showImageModal(\"" + image.ImagineUrl + "\")'>" +
                                 "<div class='image-credit'>Imagine salvată în baza de date</div>" +
                                 "</div>";
                    });
                    
                    content += "</div>";
                } else {
                    // No saved images, search for new ones
                    content += "<div class='no-saved-images'><i class='fas fa-spinner fa-spin'></i> Nu există imagini salvate. Se caută imagini noi...</div>";
                }
                
                content += "</div></div></div>";
                $("#view-punct-content").html(content);
                
                // If no saved images, search using Pexels as fallback
                if (!result.Images || result.Images.length === 0) {
                    searchPexelsForPunct(result.Denumire, result.Tip);
                }
            } else {
                $("#view-punct-content").html('<div class="error-punct">Nu s-au putut incarca detaliile punctului de interes</div>');
            }
        },
        error: function(xhr, status, error) {
            $("#view-punct-content").html('<div class="error-punct">A aparut o eroare la incarcarea detaliilor</div>');
        }
    });
}

function searchPexelsForPunct(denumire, tip) {
    var searchQuery = denumire + ' ' + tip;
    
    $.ajax({
        type: "POST",
        url: "Index.aspx/SearchPexelsImages",
        data: JSON.stringify({ query: searchQuery, perPage: 3 }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result;
            try { 
                result = JSON.parse(response.d); 
            } catch (e) { 
                displayNoImages();
                return;
            }
            
            if (result.success && result.photos && result.photos.length > 0) {
                displayPunctImages(result.photos);
            } else {
                displayNoImages();
            }
        },
        error: function(xhr, status, error) {
            displayNoImages();
        }
    });
}

function displayPunctImages(photos) {
    var imagesHtml = "<div class='punct-images-gallery'>";
    
    photos.forEach(function(photo, index) {
        imagesHtml += "<div class='punct-gallery-item'>" +
                     "<img src='" + photo.Src.Medium + "' alt='Imagine " + (index + 1) + "' class='punct-gallery-image' onclick='showImageModal(\"" + photo.Src.Original + "\")'>" +
                     "<div class='image-credit'>Foto din căutare: " + photo.Photographer + "</div>" +
                     "</div>";
    });
    
    imagesHtml += "</div>";
    imagesHtml += "<div class='search-note'><i class='fas fa-info-circle'></i> Acestea sunt imagini de căutare. Imaginile se salvează automat când adaugi un punct de interes.</div>";
    
    // Update the container with images
    $("#punct-images-container").html(imagesHtml);
}

function displayNoImages() {
    $("#punct-images-container").html('<div class="no-images"><i class="fas fa-exclamation-triangle"></i> Nu s-au gasit imagini pentru acest punct de interes</div>');
}

function showImageModal(imageUrl) {
    var modal = $('<div class="image-modal">').append(
        $('<div class="modal-content">').append(
            $('<button class="close-modal">&times;</button>').click(function() {
                modal.remove();
            }),
            $('<img class="modal-image">').attr('src', imageUrl).on('error', function() {
                $(this).replaceWith($('<div class="image-error">Nu s-a putut incarca imaginea</div>'));
            })
        )
    );
    
    modal.click(function(e) {
        if (e.target === this) {
            modal.remove();
        }
    });
    
    $(document).keyup(function(e) {
        if (e.keyCode === 27) { // ESC key
            modal.remove();
            $(document).off('keyup');
        }
    });
    
    $('body').append(modal);
}

function showError(message) {
    $('#error-text').text(message);
    $('#error-message').show();
    $('#destination-content').hide();
    $('#loading-indicator').hide();
}
