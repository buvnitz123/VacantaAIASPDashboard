$(function(){
    var p = new URLSearchParams(window.location.search);
    var id = p.get('id');

    if (!id || !/^[0-9]+$/.test(id)) {
        showError('ID utilizator invalid.');
        return;
    }

    $('#btn-back-to-users').on('click', function(){
        window.location.href = 'Index.aspx#utilizatori';
    });

    loadUserDetails(parseInt(id,10));

    $('#btn-delete-user').on('click', function(){
        $('#dialog-delete-user').dialog({
            modal: true,
            width: 400,
            buttons: {
                "?terge": function(){
                    var dlg = $(this);
                    $.ajax({
                        type: "POST",
                        url: "Index.aspx/DeleteUtilizator",
                        data: JSON.stringify({ id: parseInt(id,10) }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    }).done(function(resp){
                        var r = JSON.parse(resp.d);
                        if (r.success) {
                            window.location.href = 'Index.aspx#utilizatori';
                        } else {
                            alert(r.message || 'Eroare la stergere.');
                        }
                    }).fail(function(){
                        alert('Eroare la comunicare server.');
                    }).always(function(){
                        dlg.dialog('close');
                    });
                },
                "Anuleaz?": function(){ $(this).dialog('close'); }
            }
        });
    });
});

function loadUserDetails(id) {
    $('#loading-indicator').show();
    $.ajax({
        type: "POST",
        url: "UserDetail.aspx/GetUserDetails",
        data: JSON.stringify({ id: id }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).done(function(resp){
        $('#loading-indicator').hide();
        var r;
        try { r = JSON.parse(resp.d); } catch { r = {}; }
        if (!r.success || !r.user) {
            showError(r.message || 'Nu s-au putut incarca detaliile.');
            return;
        }
        populateUser(r.user);
    }).fail(function(){
        $('#loading-indicator').hide();
        showError('Eroare de comunicare.');
    });
}

function populateUser(u) {
    $('#user-title').text('Detalii: ' + (u.Nume || '') + ' ' + (u.Prenume || ''));
    $('#detail-nume').text(u.Nume || '-');
    $('#detail-prenume').text(u.Prenume || '-');
    $('#detail-email').text(u.Email || '-');
    $('#detail-telefon').text(u.Telefon || '-');
    $('#detail-nastere').text(u.Data_Nastere || '-');
    $('#detail-activ').text(u.EsteActiv ? 'Da' : 'Nu');

    if (u.PozaProfil) {
        $('#detail-poza').attr('src', u.PozaProfil).show();
        $('#no-photo').hide();
    } else {
        $('#detail-poza').hide();
        $('#no-photo').show();
    }

    $('#user-content').show();
}

function showError(msg) {
    $('#error-text').text(msg);
    $('#error-message').show();
    $('#user-content').hide();
    $('#loading-indicator').hide();
}