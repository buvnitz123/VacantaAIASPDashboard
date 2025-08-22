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
    <img id="preview-img" src="" alt="Imagine" style="max-width:100%; max-height:400px; display:block; margin:auto;">
</div>


