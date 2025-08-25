<%@ Control Language="C#" %>
<div>
    <h2>Categorii Vacanta</h2>
    <p>Administrare categorii de vacante: creare, actualizare si organizare.</p>

    <div class="table-header">
        <button id="btn-adauga-categorie" class="btn-add" title="Adauga categorie noua">+</button>
    </div>

    <table id="tblCategorii" class="display" style="width:100%">
        <thead>
            <tr>
                <th>Id</th>
                <th>Denumire</th>
                <th>Imagine</th>
                <th>Actiuni</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>

<div id="dialog-categorie" title="Adauga categorie noua">
    <p class="validateTips">Toate campurile sunt obligatorii.</p>
    
    <form id="form-categorie">
        <fieldset>
            <label for="denumire">Denumire</label>
            <input type="text" name="denumire" id="denumire" class="text ui-widget-content ui-corner-all">
            
            <label for="imagine">Imagine</label>
            <input type="file" name="imagine" id="imagine" accept="image/*" class="file-input">
            
            <!-- Previzualizare imagine -->
            <div id="preview-container" style="display:none;">
                <label>Previzualizare:</label>
                <img id="img-preview" src="" alt="Preview" class="img-preview">
            </div>
            
            <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
        </fieldset>
    </form>
</div>

<div id="dialog-preview-categorie" title="Previzualizare imagine" style="display:none;">
    <div class="preview-container">
        <img id="preview-img" src="" alt="Imagine" class="preview-image">
    </div>
</div>

<div id="dialog-delete-categorie" title="Confirmare stergere" style="display:none;">
    <p class="delete-message">
        <span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>
        Sunteti sigur ca doriti sa stergeti aceasta categorie de vacanta?
    </p>
    <p class="delete-details">
        <strong>Categorie:</strong> <span id="delete-categorie-name"></span>
    </p>
    <p class="delete-warning">
        <em>Aceasta actiune nu poate fi anulata.</em>
    </p>
</div>

<div id="dialog-edit-categorie" title="Modifica categorie">
    <p class="validateTips">Toate campurile sunt obligatorii.</p>
    
    <form id="form-edit-categorie">
        <fieldset>
            <input type="hidden" name="edit-id" id="edit-id">
            
            <label for="edit-denumire">Denumire</label>
            <input type="text" name="edit-denumire" id="edit-denumire" class="text ui-widget-content ui-corner-all">
            
            <label for="edit-imagine">Imagine noua (optional)</label>
            <input type="file" name="edit-imagine" id="edit-imagine" accept="image/*" class="file-input">
            
            <!-- Previzualizare imagine curenta -->
            <div id="edit-current-image" style="display:none;">
                <label>Imagine curenta:</label>
                <img id="edit-current-img" src="" alt="Imagine curenta" class="img-preview">
            </div>
            
            <!-- Previzualizare imagine noua -->
            <div id="edit-preview-container" style="display:none;">
                <label>Previzualizare imagine noua:</label>
                <img id="edit-img-preview" src="" alt="Preview" class="img-preview">
            </div>
            
            <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
        </fieldset>
    </form>
</div>
