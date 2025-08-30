// Facilitate Management JavaScript

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
        buttons: {
            "Anuleaza": function () {
                $(this).dialog("close");
            },
            "OK": function () {
                deleteFacilitate();
                $(this).dialog("close");
            }
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
    $('#tblFacilitati').DataTable({
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
            { data: 'Id_Facilitate' },
            { data: 'Denumire' },
            { 
                data: 'Descriere',
                render: function(data, type, row) {
                    if (type === 'display' && data && data.length > 100) {
                        return data.substr(0, 100) + '...';
                    }
                    return data || '';
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return `
                        <button class="action-btn" onclick="viewFacilitate(${row.Id_Facilitate})" title="Vizualizeaza">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="editFacilitate(${row.Id_Facilitate})" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="confirmDeleteFacilitate(${row.Id_Facilitate}, '${row.Denumire}')" title="Sterge">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }
            }
        ]
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
    
    // Simulate adding to DataTable (replace with actual AJAX call)
    var table = $('#tblFacilitati').DataTable();
    var newId = Math.floor(Math.random() * 10000) + 1000;
    
    table.row.add({
        'Id_Facilitate': newId,
        'Denumire': denumire,
        'Descriere': descriere
    }).draw();
    
    showSuccessMessage("Facilitate adaugata cu succes!");
}

function viewFacilitate(id) {
    var table = $('#tblFacilitati').DataTable();
    var rowData = table.rows().data().toArray().find(row => row.Id_Facilitate == id);
    
    if (rowData) {
        $("#view-denumire-facilitate").text(rowData.Denumire);
        $("#view-descriere-facilitate").text(rowData.Descriere);
        $("#dialog-view-facilitate").dialog("open");
    }
}

function editFacilitate(id) {
    var table = $('#tblFacilitati').DataTable();
    var rowData = table.rows().data().toArray().find(row => row.Id_Facilitate == id);
    
    if (rowData) {
        $("#edit-id-facilitate").val(rowData.Id_Facilitate);
        $("#edit-denumire-facilitate").val(rowData.Denumire);
        $("#edit-descriere-facilitate").val(rowData.Descriere);
        $("#dialog-edit-facilitate").dialog("open");
    }
}

function confirmDeleteFacilitate(id, denumire) {
    $("#delete-facilitate-name").text(denumire);
    $("#dialog-delete-facilitate").data("facilitate-id", id);
    $("#dialog-delete-facilitate").dialog("open");
}

function deleteFacilitate() {
    var id = $("#dialog-delete-facilitate").data("facilitate-id");
    
    // Simulate deletion from DataTable (replace with actual AJAX call)
    var table = $('#tblFacilitati').DataTable();
    var rowIndex = table.rows().data().toArray().findIndex(row => row.Id_Facilitate == id);
    
    if (rowIndex !== -1) {
        table.row(rowIndex).remove().draw();
        showSuccessMessage("Facilitate stearsa cu succes!");
    }
}

function updateFacilitate() {
    var id = $("#edit-id-facilitate").val();
    var denumire = $("#edit-denumire-facilitate").val().trim();
    var descriere = $("#edit-descriere-facilitate").val().trim();
    
    // Simulate updating in DataTable (replace with actual AJAX call)
    var table = $('#tblFacilitati').DataTable();
    var rowIndex = table.rows().data().toArray().findIndex(row => row.Id_Facilitate == id);
    
    if (rowIndex !== -1) {
        table.row(rowIndex).data({
            'Id_Facilitate': parseInt(id),
            'Denumire': denumire,
            'Descriere': descriere
        }).draw();
        
        showSuccessMessage("Facilitate modificata cu succes!");
    }
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