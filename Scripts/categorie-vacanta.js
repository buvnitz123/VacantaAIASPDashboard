$(function () {
    var dialog, form,
        denumire = $("#denumire"),
        imagine = $("#imagine"),
        allFields = $([]).add(denumire).add(imagine),
        tips = $(".validateTips"),
        progressInterval; // Add global progress interval variable

    function updateTips(t) {
        tips
            .text(t)
            .addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    // Previzualizare imagine
    function previewImage(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#img-preview').attr('src', e.target.result);
                $('#preview-container').show();
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    imagine.on('change', function () {
        previewImage(this);
        imagine.removeClass("ui-state-error");
    });

    function adaugaCategorie() {
        var valid = true;
        allFields.removeClass("ui-state-error");

        if ($.trim(denumire.val()) === "") {
            denumire.addClass("ui-state-error");
            updateTips("Trebuie sa introduceti o denumire.");
            valid = false;
        }

        if (!imagine[0].files || imagine[0].files.length === 0) {
            imagine.addClass("ui-state-error");
            updateTips("Trebuie sa selectati o imagine.");
            valid = false;
        }

        if (valid) {
            var file = imagine[0].files[0];
            var reader = new FileReader();
            
            reader.onload = function(e) {
                var base64Data = e.target.result;
                
                $('#upload-progress').show();
                $('#progress-text').text('0%');
                
                // Clear any existing interval
                clearInterval(progressInterval);
                
                var progress = 0;
                progressInterval = setInterval(function() {
                    progress += Math.random() * 10;
                    if (progress > 95) progress = 95;
                    
                    $('#progress-text').text(Math.round(progress) + '%');
                }, 300);
                
                var categorieId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
                
                $.ajax({
                    type: "POST",
                    url: "Index.aspx/AddCategorieVacanta",
                    data: JSON.stringify({
                        categorieId: categorieId,
                        denumire: denumire.val(),
                        base64Image: base64Data,
                        fileName: categorieId + "_" + denumire.val().replace(/\s+/g, '_') + "_categorie" + file.name.substring(file.name.lastIndexOf('.'))
                    }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        clearInterval(progressInterval);
                        $('#progress-text').text('100%');
                        
                        setTimeout(function() {
                            $('#upload-progress').hide();
                            dialog.dialog("close");
                            
                            var result;
                            try { 
                                result = JSON.parse(response.d); 
                            } catch (e) { 
                                result = { success: false, message: 'Eroare la procesarea răspunsului server' }; 
                            }
                            
                            if (result.success) {
                                updateTips('Categoria a fost adaugata cu succes!');
                                $('#tblCategorii').DataTable().ajax.reload();
                            } else {
                                updateTips('Eroare: ' + result.message);
                            }
                        }, 500);
                    },
                    error: function(xhr, status, error) {
                        clearInterval(progressInterval);
                        $('#upload-progress').hide();
                        
                        var errorMessage = "Eroare la adaugarea categoriei (Status: " + xhr.status + ")";
                        updateTips(errorMessage);
                    }
                });
            };
            
            reader.readAsDataURL(file);
        }
        return valid;
    }


    // Initializare dialog
    dialog = $("#dialog-categorie").dialog({
        autoOpen: false,
        height: 500,
        width: 450,
        modal: true,
        buttons: {
            "Adauga": adaugaCategorie,
            "Anulare": function() {
                clearInterval(progressInterval); // Clean up interval
                $('#upload-progress').hide();
                $('#preview-container').hide();
                $('#img-preview').attr('src', '');
                dialog.dialog("close");
            }
        },
        close: function() {
            clearInterval(progressInterval); // Clean up interval
            $('#upload-progress').hide();
            $('#preview-container').hide();
            $('#img-preview').attr('src', '');
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        adaugaCategorie();
    });

    $("#btn-adauga-categorie").on("click", function () {
        dialog.dialog("open");
    });

    // Initialize delete dialog
    var deleteDialog = $("#dialog-delete-categorie").dialog({
        autoOpen: false,
        modal: true,
        width: 400,
        buttons: {
            "Sterge": function() {
                var deleteButton = $(this).find(".ui-dialog-buttonpane button:first");
                var originalContent = deleteButton.html();
                deleteButton.html('<i class="fas fa-spinner fa-spin"></i> Se sterge...');
                deleteButton.prop('disabled', true);
                
                var categorieId = $(this).data('categorieId');
                var row = $(this).data('row');
                var table = $('#tblCategorii').DataTable();
                
                $.ajax({
                    type: "POST",
                    url: "Index.aspx/DeleteCategorieVacanta",
                    data: JSON.stringify({ categorieId: categorieId }),
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
                            table.row(row).remove().draw(false);
                            updateTips('Categoria a fost stearsa cu succes!');
                        } else {
                            updateTips('Eroare: ' + result.message);
                        }
                        deleteDialog.dialog("close");
                    },
                    error: function(xhr, status, error) {
                        updateTips('A aparut o eroare la stergerea categoriei.');
                        deleteDialog.dialog("close");
                    }
                });
            },
            "Anuleaza": function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $(this).removeData('categorieId').removeData('row');
            $(this).find(".ui-dialog-buttonpane button:first")
                   .prop('disabled', false)
                   .html('Sterge');
        }
    });

    // Handle delete button click
    $('#tblCategorii tbody').on('click', '.btn-action.delete', function (e) {
        e.preventDefault();
        var row = $(this).closest('tr');
        var table = $('#tblCategorii').DataTable();
        var rowData = table.row(row).data();
        
        if (rowData) {
            deleteDialog
                .data('categorieId', rowData.Id_CategorieVacanta)
                .data('row', row)
                .find("#delete-categorie-name").text(rowData.Denumire)
                .end()
                .dialog("open");
        }
    });

    // Initialize preview dialog - moved earlier to ensure it's available
    var previewDialog = $("#dialog-preview-categorie").dialog({
        autoOpen: false,
        modal: true,
        width: 'auto',
        maxWidth: '90%',
        height: 'auto',
        maxHeight: '90vh',
        position: { my: "center", at: "center", of: window },
        buttons: {
            "Inchide": function() {
                $(this).dialog("close");
            }
        },
        open: function() {
            // Ensure the dialog is centered on open
            $(this).dialog("option", "position", { my: "center", at: "center", of: window });
        }
    });
    
    console.log('Preview dialog initialized:', previewDialog.length); // Debug log

    // Handle view button click
    $('#tblCategorii').on('click', '.btn-action.view', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('View button clicked!'); // Debug log
        
        var row = $(this).closest('tr');
        var table = $('#tblCategorii').DataTable();
        var rowData = table.row(row).data();
        
        console.log('View button clicked, rowData:', rowData); // Debug log
        
        if (rowData && rowData.ImagineUrl) {
            console.log('Opening preview with image:', rowData.ImagineUrl); // Debug log
            $('#preview-img').attr('src', rowData.ImagineUrl);
            
            // Verifică dacă elementul preview-img există
            if ($('#preview-img').length === 0) {
                console.error('Element #preview-img not found!');
                alert('Elementul pentru previzualizarea imaginii nu a fost gasit!');
                return;
            }
            
            // Verifică dacă dialog-ul există
            if (previewDialog.length === 0) {
                console.error('Preview dialog not found!');
                alert('Dialog-ul pentru previzualizare nu a fost gasit!');
                return;
            }
            
            previewDialog.dialog("open");
            console.log('Preview dialog opened'); // Debug log
        } else {
            console.log('No image URL found in rowData'); // Debug log
            alert('Nu s-a gasit URL-ul imaginii pentru aceasta categorie!');
        }
    });

    function previewEditImage(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#edit-img-preview').attr('src', e.target.result);
                $('#edit-preview-container').show();
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $('#edit-imagine').on('change', function () {
        previewEditImage(this);
        $('#edit-imagine').removeClass("ui-state-error");
    });

    function modificaCategorie() {
        var valid = true;
        var editDenumire = $("#edit-denumire");
        var editImagine = $("#edit-imagine");
        
        editDenumire.removeClass("ui-state-error");
        editImagine.removeClass("ui-state-error");

        if ($.trim(editDenumire.val()) === "") {
            editDenumire.addClass("ui-state-error");
            updateTips("Trebuie sa introduceti o denumire.");
            valid = false;
        }

        if (valid) {
            var categorieId = $('#edit-id').val();
            var newDenumire = editDenumire.val();
            
            // Check if new image is selected
            if (editImagine[0].files && editImagine[0].files.length > 0) {
                var file = editImagine[0].files[0];
                var reader = new FileReader();
                
                reader.onload = function(e) {
                    var base64Image = e.target.result;
                    
                    $.ajax({
                        type: "POST",
                        url: "Index.aspx/UploadCategorieImage",
                        data: JSON.stringify({
                            base64Image: base64Image,
                            fileName: file.name,
                            categorieId: categorieId
                        }),
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
                                // Update name separately if needed
                                updateCategoryName(categorieId, newDenumire);
                            } else {
                                updateTips('Eroare: ' + result.message);
                            }
                        },
                        error: function(xhr, status, error) {
                            updateTips("Eroare la modificarea imaginii: " + error);
                        }
                    });
                };
                
                reader.readAsDataURL(file);
            } else {
                // Only update name
                updateCategoryName(categorieId, newDenumire);
            }
        }
        return valid;
    }

    // Helper function to update category name only
    function updateCategoryName(categorieId, newDenumire) {
        $.ajax({
            type: "POST",
            url: "Index.aspx/UpdateCategorieVacantaName",
            data: JSON.stringify({
                categorieId: categorieId,
                newDenumire: newDenumire
            }),
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
                    $('#tblCategorii').DataTable().ajax.reload();
                    updateTips("Categoria '" + newDenumire + "' a fost modificata cu succes.");
                    editDialog.dialog("close");
                } else {
                    updateTips(result.message);
                }
            },
            error: function(xhr, status, error) {
                updateTips("Eroare la modificarea categoriei: " + error);
            }
        });
    }

    var editDialog = $("#dialog-edit-categorie").dialog({
        autoOpen: false,
        height: 600,
        width: 450,
        modal: true,
        buttons: {
            "Salveaza modificarile": modificaCategorie,
            "Anulare": function () {
                editDialog.dialog("close");
            }
        },
        close: function () {
            $('#form-edit-categorie')[0].reset();
            $('#edit-current-image').hide();
            $('#edit-preview-container').hide();
            $("#edit-denumire").removeClass("ui-state-error");
            $("#edit-imagine").removeClass("ui-state-error");
            // Curata mesajul de succes la inchiderea modalului
            tips.text("Toate campurile sunt obligatorii.").removeClass("ui-state-highlight");
        }
    });

    // Handle edit button click
    $('#tblCategorii tbody').on('click', '.btn-action.edit', function () {
        var row = $(this).closest('tr');
        var table = $('#tblCategorii').DataTable();
        var rowData = table.row(row).data();
        
        if (rowData) {
            var categorieId = rowData.Id_CategorieVacanta;
            var categorieName = rowData.Denumire;
            var categorieImage = rowData.ImagineUrl;
            
            // Populam formularul cu datele existente
            $('#edit-id').val(categorieId);
            $('#edit-denumire').val(categorieName);
            
            // Afisam imaginea curenta daca exista
            if (categorieImage) {
                $('#edit-current-img').attr('src', categorieImage);
                $('#edit-current-image').show();
            } else {
                $('#edit-current-image').hide();
            }
            
            // Ascundem previzualizarea imaginii noi
            $('#edit-preview-container').hide();
            
            // Deschidem dialogul de editare
            editDialog.dialog("open");
        }
    });
});
