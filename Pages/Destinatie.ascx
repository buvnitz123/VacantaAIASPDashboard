<%@ Control Language="C#" %>
<div>
    <h2>Destinatii</h2>
    <p>Gestionare destinatii: listare, adaugare, editare si stergere.</p>

    <div class="table-header">
    <button id="btn-adauga-destinatie" class="btn-add" title="Adauga categorie noua">+</button>
    </div>

    <table id="tblDestinatii" class="display" style="width:100%">
        <thead>
            <tr>
                <th>Id</th>
                <th>Denumire</th>
                <th>Tara</th>
                <th>Actiuni</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>

<div id="dialog-destinatie" title="Adauga destinatie noua">
    <p class="validateTips">Toate campurile sunt obligatorii.</p>
    
    <form id="form-destinatie">
        <fieldset>
            <label for="denumireDestinatie">Denumire destinatie</label>
            <input type="text" name="denumire" id="denumireDestinatie" class="text ui-widget-content ui-corner-all">

            <label for="taraDestinatie">Tara</label>
            <input type="text" name="tara" id="taraDestinatie" class="text ui-widget-content ui-corner-all">

            <label for="orasDestinatie">Oras</label>
            <input type="text" name="oras" id="orasDestinatie" class="text ui-widget-content ui-corner-all">

            <label for="regiuneDestinatie">Regiune</label>
            <input type="text" name="regiune" id="regiuneDestinatie" class="text ui-widget-content ui-corner-all">

            <label for="descriereDestinatie">Descriere</label>
            <textarea name="descriere" id="descriereDestinatie" class="textarea ui-widget-content ui-corner-all" rows="4"></textarea>

            <label for="pretAdultDestinatie">Pret adult</label>
            <input type="number" step="0.01" name="pretAdult" id="pretAdultDestinatie" class="text ui-widget-content ui-corner-all">

            <label for="pretMinorDestinatie">Pret minor</label>
            <input type="number" step="0.01" name="pretMinor" id="pretMinorDestinatie" class="text ui-widget-content ui-corner-all">
            
            
            <!-- Progress indicator pentru cautare -->
            <div id="search-progress" style="display:none; margin: 10px 0;">
                <label>Se cauta imagini... <span id="search-progress-text">Se cauta...</span></label>
            </div>
            
            <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
        </fieldset>
    </form>
</div>

<div id="dialog-delete-destinatie" title="Confirmare stergere" style="display:none;">
    <p class="delete-message">
        <span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>
        Sunteti sigur ca doriti sa stergeti destinatia <strong><span id="delete-destinatie-name"></span></strong>?
    </p>
    <p class="delete-warning">
        <em>Aceasta actiune nu poate fi anulata.</em>
    </p>
</div>
