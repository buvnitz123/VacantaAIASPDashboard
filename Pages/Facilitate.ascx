<%@ Control Language="C#" %>
<div>
    <h2>Facilitati</h2>
    <p>Gestionare facilitati: listare, adaugare, editare si stergere.</p>

    <div class="table-header">
        <button id="btn-adauga-facilitate" class="btn-add" title="Adauga facilitate noua">+</button>
    </div>

    <table id="tblFacilitati" class="display" style="width:100%">
        <thead>
            <tr>
                <th>Id</th>
                <th>Denumire</th>
                <th>Descriere</th>
                <th>Actiuni</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>

<div id="dialog-facilitate" title="Adauga facilitate noua">
    <p class="validateTips">Toate campurile sunt obligatorii.</p>
    
    <form id="form-facilitate">
        <fieldset>
            <label for="denumire-facilitate">Denumire</label>
            <input type="text" name="denumire-facilitate" id="denumire-facilitate" class="text ui-widget-content ui-corner-all">
            
            <label for="descriere-facilitate">Descriere</label>
            <textarea name="descriere-facilitate" id="descriere-facilitate" class="textarea ui-widget-content ui-corner-all" rows="6"></textarea>
            
            <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
        </fieldset>
    </form>
</div>

<div id="dialog-view-facilitate" title="Vizualizeaza facilitate">
    <div class="view-container">
        <div class="view-field">
            <label>Denumire:</label>
            <div id="view-denumire-facilitate" class="view-value"></div>
        </div>
        <div class="view-field">
            <label>Descriere:</label>
            <div id="view-descriere-facilitate" class="view-value"></div>
        </div>
    </div>
</div>

<div id="dialog-delete-facilitate" title="Confirmare stergere" style="display:none;">
    <p class="delete-message">
        <span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>
        Sunteti sigur ca doriti sa stergeti aceasta facilitate?
    </p>
    <p class="delete-details">
        <strong>Facilitate:</strong> <span id="delete-facilitate-name"></span>
    </p>
    <p class="delete-warning">
        <em>Aceasta actiune nu poate fi anulata.</em>
    </p>
</div>

<div id="dialog-edit-facilitate" title="Modifica facilitate">
    <p class="validateTips">Toate campurile sunt obligatorii.</p>
    
    <form id="form-edit-facilitate">
        <fieldset>
            <input type="hidden" name="edit-id-facilitate" id="edit-id-facilitate">
            
            <label for="edit-denumire-facilitate">Denumire</label>
            <input type="text" name="edit-denumire-facilitate" id="edit-denumire-facilitate" class="text ui-widget-content ui-corner-all">
            
            <label for="edit-descriere-facilitate">Descriere</label>
            <textarea name="edit-descriere-facilitate" id="edit-descriere-facilitate" class="textarea ui-widget-content ui-corner-all" rows="6"></textarea>
            
            <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
        </fieldset>
    </form>
</div>
