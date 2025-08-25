$(function () {
    var dialog, form,
        denumire = $("#denumire"),
        imagine = $("#imagine"),
        allFields = $([]).add(denumire).add(imagine),
        tips = $(".validateTips");

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
        imagine.removeClass("ui-state-error"); // scoate roșu imediat după alegere
    });

    function adaugaCategorie() {
        var valid = true;
        allFields.removeClass("ui-state-error");

        if ($.trim(denumire.val()) === "") {
            denumire.addClass("ui-state-error");
            updateTips("Trebuie să introduceți o denumire.");
            valid = false;
        }

        if (!imagine[0].files || imagine[0].files.length === 0) {
            imagine.addClass("ui-state-error");
            updateTips("Trebuie să selectați o imagine.");
            valid = false;
        }

        if (valid) {
            var idUnic = Date.now();

            // Folosim DataTables API
            var table = $('#tblCategorii').DataTable();

            var imageUrl = URL.createObjectURL(imagine[0].files[0]); // fișierul selectat

            table.row.add({
                Id_CategorieVacanta: idUnic,
                Denumire: denumire.val(),
                ImagineUrl: imageUrl
            }).draw();

            dialog.dialog("close");
        }
        return valid;
    }


    // Initializare dialog
    dialog = $("#dialog-categorie").dialog({
        autoOpen: false,
        height: 550,
        width: 500,
        modal: true,
        buttons: {
            "Adaugă categorie": adaugaCategorie,
            "Anulare": function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
            $('#preview-container').hide();
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        adaugaCategorie();
    });

    $("#btn-adauga-categorie").on("click", function () {
        dialog.dialog("open");
    });

    var previewDialog = $("#dialog-preview-categorie").dialog({
        autoOpen: false,
        modal: true,
        width: 650,
        height: 600,
        resizable: false,
        buttons: {
            "Inchide": function () {
                previewDialog.dialog("close");
            }
        }
    });


    $('#tblCategorii tbody').on('click', '.btn-icon.lupa', function () {
        var imageUrl = $(this).data('img-url'); // preluam URL-ul imaginii din data attribute
        if (!imageUrl) return;
        $('#preview-img').attr('src', imageUrl); // setam imaginea in dialog
        previewDialog.dialog("open"); // deschidem dialogul
    });

    // Dialog pentru confirmare ștergere
    var deleteDialog = $("#dialog-delete-categorie").dialog({
        autoOpen: false,
        modal: true,
        width: 450,
        height: 300,
        resizable: false,
        buttons: {
            "OK": function () {
                var categorieId = $(this).data('categorie-id');
                var categorieName = $(this).data('categorie-name');
                
                // TODO: Aici va fi apelul către server pentru ștergere
                // Pentru moment, simulăm ștergerea din tabel
                var table = $('#tblCategorii').DataTable();
                var rowToDelete = table.rows().nodes().to$().filter(function() {
                    return $(this).find('td:first').text() == categorieId;
                });
                
                if (rowToDelete.length > 0) {
                    table.row(rowToDelete).remove().draw();
                    
                    // Simulam un mesaj de succes
                    updateTips("Categoria '" + categorieName + "' a fost stearsa cu succes.");
                }
                
                deleteDialog.dialog("close");
            },
            "Cancel": function () {
                deleteDialog.dialog("close");
            }
        }
    });

    // Event handler pentru butonul de stergere
    $('#tblCategorii tbody').on('click', '.btn-action.delete', function () {
        var row = $(this).closest('tr');
        var table = $('#tblCategorii').DataTable();
        var rowData = table.row(row).data();
        
        if (rowData) {
            var categorieId = rowData.Id_CategorieVacanta;
            var categorieName = rowData.Denumire;
            
            // Setam datele in dialog
            $('#delete-categorie-name').text(categorieName);
            deleteDialog.data('categorie-id', categorieId);
            deleteDialog.data('categorie-name', categorieName);
            
            // Deschidem dialogul de confirmare
            deleteDialog.dialog("open");
        }
    });

    // Previzualizare imagine pentru editare
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
            
            // TODO: Aici va fi apelul catre server pentru modificare
            // Pentru moment, simulam modificarea in tabel
            var table = $('#tblCategorii').DataTable();
            var rowToUpdate = table.rows().nodes().to$().filter(function() {
                return $(this).find('td:first').text() == categorieId;
            });
            
            if (rowToUpdate.length > 0) {
                var rowData = table.row(rowToUpdate).data();
                rowData.Denumire = newDenumire;
                
                // Daca s-a selectat o imagine noua, actualizam si URL-ul
                if (editImagine[0].files && editImagine[0].files.length > 0) {
                    var newImageUrl = URL.createObjectURL(editImagine[0].files[0]);
                    rowData.ImagineUrl = newImageUrl;
                }
                
                table.row(rowToUpdate).data(rowData).draw();
                
                // Simulam un mesaj de succes
                updateTips("Categoria '" + newDenumire + "' a fost modificata cu succes.");
            }
            
            editDialog.dialog("close");
        }
        return valid;
    }

    // Dialog pentru editare
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

    // Event handler pentru butonul de editare
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
