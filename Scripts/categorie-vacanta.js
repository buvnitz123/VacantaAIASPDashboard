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
        height: 450,
        width: 400,
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
        width: 450,
        height: 450,
        buttons: {
            "Închide": function () {
                previewDialog.dialog("close");
            }
        }
    });


    $('#tblCategorii tbody').on('click', '.btn-icon.lupa', function () {
        var imageUrl = $(this).data('img-url'); // preluăm URL-ul imaginii din data attribute
        if (!imageUrl) return;
        $('#preview-img').attr('src', imageUrl); // setăm imaginea în dialog
        previewDialog.dialog("open"); // deschidem dialogul
    });
});




