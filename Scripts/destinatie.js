$(function () {
    var dialog, form,
        denumire = $("#denumireDestinatie"),
        tara = $("#taraDestinatie"),
        oras = $("#orasDestinatie"),
        regiune = $("#regiuneDestinatie"),
        descriere = $("#descriereDestinatie"),
        pretAdult = $("#pretAdultDestinatie"),
        pretMinor = $("#pretMinorDestinatie"),
        allFields = $([]).add(denumire).add(tara).add(oras).add(regiune).add(descriere).add(pretAdult).add(pretMinor),
        tips = $(".validateTips"),
        selectedImageUrl = null;

    function updateTips(t) {
        tips
            .text(t)
            .addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function validateDestinatieForm() {
        var valid = true;
        allFields.removeClass("ui-state-error");

        if ($.trim(denumire.val()) === "") {
            denumire.addClass("ui-state-error");
            updateTips("Trebuie să introduceți o denumire.");
            valid = false;
        }

        if ($.trim(tara.val()) === "") {
            tara.addClass("ui-state-error");
            updateTips("Trebuie să introduceți țara.");
            valid = false;
        }

        if ($.trim(oras.val()) === "") {
            oras.addClass("ui-state-error");
            updateTips("Trebuie să introduceți orașul.");
            valid = false;
        }


        return valid;
    }

    function adaugadestinatie() {
        if (!validateDestinatieForm()) {
            return false;
        }

        // Create search query with destination name, city and country
        var denumireVal = denumire.val().trim();
        var orasVal = $("#orasDestinatie").val().trim();
        var taraVal = $("#taraDestinatie").val().trim();
        
        var query = denumireVal;
        if (orasVal) {
            query += " " + orasVal;
        }
        if (taraVal) {
            query += " " + taraVal;
        }
        
        updateTips("Se cauta imagini pentru destinatie...");
        
        searchImages(query, function(success, imageUrls) {
            if (success && imageUrls && imageUrls.length > 0) {
                // Prepare data for submission
                var destinatieData = {
                    denumire: denumire.val(),
                    tara: tara.val(),
                    oras: oras.val(),
                    regiune: regiune.val(),
                    descriere: descriere.val(),
                    pretAdult: parseFloat(pretAdult.val()) || 0,
                    pretMinor: parseFloat(pretMinor.val()) || 0,
                    imageUrls: imageUrls
                };

                // Submit to server
                $.ajax({
                    type: "POST",
                    url: "Index.aspx/AddDestinatie",
                    data: JSON.stringify(destinatieData),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        var result;
                        try { 
                            result = JSON.parse(response.d); 
                        } catch (e) { 
                            result = { success: false, message: 'Eroare la procesarea răspunsului server' }; 
                        }
                        
                        if (result && result.success) {
                            $('#tblDestinatii').DataTable().ajax.reload();
                            dialog.dialog("close");
                            
                            // Reset form and progress indicators
                            form[0].reset();
                            $('#search-progress').hide();
                        } else {
                            updateTips(result ? result.message : 'Eroare la adaugarea destinatiei.');
                        }
                    },
                    error: function(xhr, status, error) {
                        updateTips('A aparut o eroare la adaugarea destinatiei.');
                    }
                });
            } else {
                updateTips("Nu s-au gasit imagini pentru aceasta destinatie. Incercati din nou.");
            }
        });
        
        return true;
    }

    function searchImages(query, callback) {
        $('#search-progress').show();
        $('#search-progress-text').text('Se caută...');
        $('#imageResults').hide();
        
        $.ajax({
            type: "POST",
            url: "Index.aspx/SearchPexelsImages",
            data: JSON.stringify({ query: query, perPage: 3 }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                $('#search-progress').hide();
                var result;
                try { 
                    result = JSON.parse(response.d); 
                } catch (e) { 
                    result = { success: false, message: 'Eroare la procesarea răspunsului server' }; 
                }
                
                if (result.success && result.photos && result.photos.length > 0) {
                    // Extract all image URLs
                    var imageUrls = result.photos.map(function(photo) {
                        return photo.Src.Original;
                    });
                    
                    if (callback) callback(true, imageUrls);
                } else {
                    updateTips('Nu s-au găsit imagini pentru termenul căutat.');
                    if (callback) callback(false, []);
                }
            },
            error: function(xhr, status, error) {
                $('#search-progress').hide();
                updateTips('Eroare la căutarea imaginilor.');
                if (callback) callback(false, []);
            }
        });
    }

    // Initializare dialog
    dialog = $("#dialog-destinatie").dialog({
        autoOpen: false,
        height: 700,
        width: 500,
        modal: true,
        buttons: {
            "Adauga": adaugadestinatie,
            "Anulare": function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            $('#imageResults').hide();
            $('#search-progress').hide();
            selectedImageUrl = null;
            $('.selectable-image').removeClass('selected');
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        adaugadestinatie();
    });

    $("#btn-adauga-destinatie").on("click", function () {
        dialog.dialog("open");
    });

    var deleteDialog = $("#dialog-delete-destinatie").dialog({
        autoOpen: false,
        modal: true,
        width: 400,
        buttons: {
            "Șterge": function () {
                var deleteButton = $(this).find(".ui-dialog-buttonpane button:first");
                var originalContent = deleteButton.html();
                deleteButton.html('<i class="fas fa-spinner fa-spin"></i> Se șterge...');
                deleteButton.prop('disabled', true);

                var destinatieId = $(this).data('destinatieId');
                var row = $(this).data('row');
                var table = $('#tblDestinatii').DataTable();

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
                            result = { success: false, message: 'Eroare la procesarea răspunsului server' }; 
                        }
                        
                        if (result.success) {
                            table.row(row).remove().draw(false);
                        }
                        deleteDialog.dialog("close");
                    },
                    error: function (xhr, status, error) {
                        deleteDialog.dialog("close");
                    }
                });
            },
            "Anulează": function () {
                $(this).dialog("close");
            }
        },
        close: function () {
            $(this).removeData('destinatieId').removeData('row');
            $(this).find(".ui-dialog-buttonpane button:first")
                .prop('disabled', false)
                .html('Șterge');
        }
    });

    $('#tblDestinatii tbody').on('click', '.btn-action.delete', function (e) {
        e.preventDefault();
        var row = $(this).closest('tr');
        var table = $('#tblDestinatii').DataTable();
        var rowData = table.row(row).data();

        if (rowData) {
            deleteDialog
                .data('destinatieId', rowData.Id_destinatieVacanta)
                .data('row', row)
                .find("#delete-destinatie-name").text(rowData.Denumire)
                .end()
                .dialog("open");
        }
    });
    
    // Initialize preview dialog
    var previewDialog = $("#dialog-preview-destinatie").dialog({
        autoOpen: false,
        modal: true,
        width: 'auto',
        maxWidth: '90%',
        height: 'auto',
        maxHeight: '90vh',
        buttons: {
            "Închide": function () {
                $(this).dialog("close");
            }
        }
    });
});
