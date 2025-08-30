
$(document).ready(function () {
    // Initialize modal dialogs
    initializeFacilitateModals();
    
    // Bind events
    bindFacilitateEvents();
});

function initializeFacilitateModals() {
    // Add Modal
    $("#dialog-facilitate").dialog({
        autoOpen: false,
        height: 400,
        width: 450,
        modal: true,
        resizable: false,
        buttons: {
            "Adauga": function () {
                if (validateFacilitateForm()) {
                    addFacilitate();
                    $(this).dialog("close");
                }
            },
            "Anuleaza": function () {
                $(this).dialog("close");
            }
        },
        close: function () {
            clearFacilitateForm();
            $(".success-message").hide();
        }
    });

    // View Modal
    $("#dialog-view-facilitate").dialog({
        autoOpen: false,
        height: 450,
        width: 500,
        modal: true,
        resizable: false,
        buttons: {
            "Inchide": function () {
                $(this).dialog("close");
            }
        }
    });

    // Delete Modal
    $("#dialog-delete-facilitate").dialog({
        autoOpen: false,
        height: 300,
        width: 450,
        modal: true,
        resizable: false,
        buttons: [
            {
                text: "Șterge",
                class: 'btn-delete',
                click: function() {
                    var $dialog = $(this);
                    $dialog.data('originalButton', 'Șterge');
                    
                    deleteFacilitate()
                        .always(function() {
                            $dialog.dialog("close");
                        });
                }
            },
            {
                text: "Anulează",
                click: function() {
                    $(this).dialog("close");
                }
            }
        ],
        open: function() {
            // Reset button state when dialog opens
            var $button = $(this).parent().find('.btn-delete');
            $button.html('Șterge').prop('disabled', false);
        },
        close: function() {
            // Reset button state when dialog closes
            var $button = $(this).parent().find('.btn-delete');
            $button.html('Șterge').prop('disabled', false);
        }
    });

    // Edit Modal
    $("#dialog-edit-facilitate").dialog({
        autoOpen: false,
        height: 450,
        width: 450,
        modal: true,
        resizable: false,
        buttons: {
            "Salveaza": function () {
                if (validateEditFacilitateForm()) {
                    updateFacilitate();
                    $(this).dialog("close");
                }
            },
            "Anuleaza": function () {
                $(this).dialog("close");
            }
        },
        close: function () {
            clearEditFacilitateForm();
            $(".success-message").hide();
        }
    });
}

function bindFacilitateEvents() {
    // Add button click
    $("#btn-adauga-facilitate").click(function () {
        $("#dialog-facilitate").dialog("open");
    });

    // Form submissions
    $("#form-facilitate").on("submit", function (e) {
        e.preventDefault();
        if (validateFacilitateForm()) {
            addFacilitate();
            $("#dialog-facilitate").dialog("close");
        }
    });

    $("#form-edit-facilitate").on("submit", function (e) {
        e.preventDefault();
        if (validateEditFacilitateForm()) {
            updateFacilitate();
            $("#dialog-edit-facilitate").dialog("close");
        }
    });
}

function updateFacilitateTable() {
    // Check if DataTable is already initialized
    if ($.fn.DataTable.isDataTable('#tblFacilitati')) {
        return; // Don't reinitialize if already exists
    }
    
    // Initialize DataTable with action buttons
    var table = $('#tblFacilitati').DataTable({
        ajax: {
            url: 'Index.aspx/GetFacilitatiData',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            dataSrc: function (json) {
                var data = [];
                try { 
                    data = JSON.parse(json.d); 
                } catch (e) { 
                    console.error('Error parsing facilitate data:', e);
                }
                return data;
            }
        },
        columns: [
            { 
                data: 'Id_Facilitate',
                className: 'dt-left',
            },
            { 
                data: 'Denumire',
                className: 'dt-left',
            },
            { 
                data: 'Descriere',
                className: 'dt-left',
                render: function(data, type, row) {
                    if (type === 'display' && data && data.length > 100) {
                        return data.substr(0, 100) + '...';
                    }
                    return data || '';
                }
            },
            {
                data: null,
                className: 'dt-left',
                render: function(data, type, row) {
                    return `
                        <div class="action-buttons">
                            <button class="btn-action view" title="Vizualizează" data-id="${row.Id_Facilitate}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action edit" title="Editează" data-id="${row.Id_Facilitate}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" title="Șterge" data-id="${row.Id_Facilitate}" data-denumire="${row.Denumire}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ]
    });
    
    // Add event delegation for action buttons
    $('#tblFacilitati tbody').on('click', '.btn-action.view', function() {
        var id = $(this).data('id');
        viewFacilitate(id);
    });
    
    $('#tblFacilitati tbody').on('click', '.btn-action.edit', function() {
        var id = $(this).data('id');
        editFacilitate(id);
    });
    
    $('#tblFacilitati tbody').on('click', '.btn-action.delete', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        var $button = $(this);
        var id = $button.data('id');
        var denumire = $button.data('denumire');
        

        $("#delete-facilitate-name").text(denumire);
        $("#dialog-delete-facilitate").data('id', id).dialog("open");
    });
}

function validateFacilitateForm() {
    var denumire = $("#denumire-facilitate").val().trim();
    var descriere = $("#descriere-facilitate").val().trim();
    
    if (!denumire || !descriere) {
        updateTips("Toate campurile sunt obligatorii.");
        return false;
    }
    
    if (denumire.length > 50) {
        updateTips("Denumirea nu poate depasi 50 de caractere.");
        return false;
    }
    
    if (descriere.length > 4000) {
        updateTips("Descrierea nu poate depasi 4000 de caractere.");
        return false;
    }
    
    return true;
}

function validateEditFacilitateForm() {
    var denumire = $("#edit-denumire-facilitate").val().trim();
    var descriere = $("#edit-descriere-facilitate").val().trim();
    
    if (!denumire || !descriere) {
        updateEditTips("Toate campurile sunt obligatorii.");
        return false;
    }
    
    if (denumire.length > 50) {
        updateEditTips("Denumirea nu poate depasi 50 de caractere.");
        return false;
    }
    
    if (descriere.length > 4000) {
        updateEditTips("Descrierea nu poate depasi 4000 de caractere.");
        return false;
    }
    
    return true;
}

function updateTips(message) {
    var tips = $("#dialog-facilitate .validateTips");
    tips.text(message).addClass("ui-state-highlight");
    setTimeout(function () {
        tips.removeClass("ui-state-highlight", 1500);
    }, 500);
}

function updateEditTips(message) {
    var tips = $("#dialog-edit-facilitate .validateTips");
    tips.text(message).addClass("ui-state-highlight");
    setTimeout(function () {
        tips.removeClass("ui-state-highlight", 1500);
    }, 500);
}

function clearFacilitateForm() {
    $("#form-facilitate")[0].reset();
    $("#dialog-facilitate .validateTips").text("Toate campurile sunt obligatorii.").removeClass("ui-state-highlight");
}

function clearEditFacilitateForm() {
    $("#form-edit-facilitate")[0].reset();
    $("#dialog-edit-facilitate .validateTips").text("Toate campurile sunt obligatorii.").removeClass("ui-state-highlight");
}

function addFacilitate() {
    var denumire = $("#denumire-facilitate").val().trim();
    var descriere = $("#descriere-facilitate").val().trim();
    
    // Generate a unique ID using timestamp and random number
    var facilitateId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
    
    $.ajax({
        type: "POST",
        url: "Index.aspx/AddFacilitate",
        data: JSON.stringify({
            id: facilitateId,
            denumire: denumire,
            descriere: descriere
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = JSON.parse(response.d);
            if (result.success) {
                // Refresh the table
                $('#tblFacilitati').DataTable().ajax.reload();
                clearFacilitateForm();
            } else {
                updateTips('Eroare: ' + result.message);
            }
        },
        error: function(xhr, status, error) {
            console.error("Add facilitate error:", error);
            updateTips('A apărut o eroare la adăugarea facilității.');
        }
    });
}

function viewFacilitate(id) {
    $.ajax({
        type: "POST",
        url: "Index.aspx/GetFacilitateById",
        data: JSON.stringify({ id: id }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var data = JSON.parse(response.d);
            if (data) {
                $("#view-denumire-facilitate").text(data.Denumire);
                $("#view-descriere-facilitate").text(data.Descriere);
                $("#dialog-view-facilitate").dialog("open");
            } else {
                updateTips('Nu s-a putut încărca detaliile facilității.');
            }
        },
        error: function(xhr, status, error) {
            console.error("View facilitate error:", error);
            updateTips('A apărut o eroare la încărcarea detaliilor.');
        }
    });
}

function editFacilitate(id) {
    $.ajax({
        type: "POST",
        url: "Index.aspx/GetFacilitateById",
        data: JSON.stringify({ id: id }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var data = JSON.parse(response.d);
            if (data) {
                $("#edit-id-facilitate").val(data.Id_Facilitate);
                $("#edit-denumire-facilitate").val(data.Denumire);
                $("#edit-descriere-facilitate").val(data.Descriere);
                $("#dialog-edit-facilitate").dialog("open");
            } else {
                updateTips('Nu s-a putut încărca facilitatea pentru editare.');
            }
        },
        error: function(xhr, status, error) {
            console.error("Edit facilitate error:", error);
            updateTips('A apărut o eroare la încărcarea datelor pentru editare.');
        }
    });
}

function confirmDeleteFacilitate(id, denumire) {
    // Store the original button that was clicked
    var $deleteButton = $(`button.delete[data-id="${id}"]`);
    $("#dialog-delete-facilitate").data({
        'id': id,
        'deleteButton': $deleteButton
    });
    
    $("#delete-facilitate-name").text(denumire);
    $("#dialog-delete-facilitate").dialog("open");
}

function deleteFacilitate() {
    var dialog = $("#dialog-delete-facilitate");
    var id = dialog.data('id');
    var $deleteButton = dialog.data('deleteButton');
    var $modalButton = dialog.parent().find('button:contains("Șterge")');

    // Show spinner only on the original delete button in the table
    $deleteButton.html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
    $modalButton.prop('disabled', true);

    return $.ajax({
        type: "POST",
        url: "Index.aspx/DeleteFacilitate",
        data: JSON.stringify({ id: id }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = JSON.parse(response.d);
            if (result.success) {
                $('#tblFacilitati').DataTable().ajax.reload();
            } else {
                updateTips('Eroare: ' + result.message);
                $modalButton.prop('disabled', false);
                $deleteButton.html('<i class="fas fa-trash"></i>').prop('disabled', false);
            }
        },
        error: function(xhr, status, error) {
            console.error("Delete facilitate error:", error);
            updateTips('A apărut o eroare la ștergerea facilității.');
            $modalButton.prop('disabled', false);
            $deleteButton.html('<i class="fas fa-trash"></i>').prop('disabled', false);
        }
    });
}

function updateFacilitate() {
    var id = $("#edit-id-facilitate").val();
    var denumire = $("#edit-denumire-facilitate").val().trim();
    var descriere = $("#edit-descriere-facilitate").val().trim();
    
    $.ajax({
        type: "POST",
        url: "Index.aspx/UpdateFacilitate",
        data: JSON.stringify({
            id: id,
            denumire: denumire,
            descriere: descriere
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = JSON.parse(response.d);
            if (result.success) {
                // Refresh the table and close the edit dialog
                $('#tblFacilitati').DataTable().ajax.reload();
                clearEditFacilitateForm();
                $("#dialog-edit-facilitate").dialog("close");
            } else {
                updateEditTips('Eroare: ' + result.message);
            }
        },
        error: function(xhr, status, error) {
            console.error("Update facilitate error:", error);
            updateEditTips('A apărut o eroare la actualizarea facilității.');
        }
    });
}

function showSuccessMessage(message) {
    // Create or update success message
    var successDiv = $(".success-message");
    if (successDiv.length === 0) {
        successDiv = $('<div class="success-message"></div>');
        $("body").append(successDiv);
    }
    
    successDiv.text(message).show();
    
    // Auto-hide after 3 seconds
    setTimeout(function () {
        successDiv.fadeOut();
    }, 3000);
}