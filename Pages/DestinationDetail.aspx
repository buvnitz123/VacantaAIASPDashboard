<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="DestinationDetail.aspx.cs" Inherits="WebAdminDashboard.DestinationDetail" %>
<%@ Register Src="~/Pages/Shared/Navbar.ascx" TagPrefix="uc" TagName="Navbar" %>
<%@ Register Src="~/Pages/Shared/Sidebar.ascx" TagPrefix="uc" TagName="Sidebar" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Detalii Destinatie - Dashboard</title>
    <link href="/Content/styles.css?v=6" rel="stylesheet" />
    <link href="/Content/destinatie.css?v=3" rel="stylesheet" />
    <link href="/Content/destination-detail.css?v=2" rel="stylesheet" />
    <link href="/Content/puncte-interes.css?v=1" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css" />
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css"/>
    <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="/Scripts/app.js?v=4"></script>
    <script src="/Scripts/destination-detail.js?v=5"></script>
</head>
<body>
    <form id="form1" runat="server">
        <uc:Navbar runat="server" ID="TopNavbar" />
        <uc:Sidebar runat="server" ID="LeftSidebar" />

        <div class="content expanded-when-collapsed">
            <div class="destination-detail-container">
                <!-- Header with back button -->
                <div class="detail-header">
                    <button type="button" id="btn-back-to-destinations" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Inapoi la Destinatii
                    </button>
                    <h2 id="destination-title">Detalii Destinatie</h2>
                </div>

                <!-- Loading indicator -->
                <div id="loading-indicator" class="loading-container">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Se incarca detaliile destinatiei...</span>
                </div>

                <!-- Error message -->
                <div id="error-message" class="error-container" style="display:none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span id="error-text">Eroare la incarcarea destinatiei</span>
                </div>

                <!-- Destination details content -->
                <div id="destination-content" class="destination-details" style="display:none;">
                    <div class="detail-grid">
                        <!-- Basic Info Card -->
                        <div class="detail-card">
                            <div class="card-header">
                                <h3><i class="fas fa-info-circle"></i> Informatii Generale</h3>
                            </div>
                            <div class="card-content">
                                <div class="info-row">
                                    <label>Denumire:</label>
                                    <span id="detail-denumire"></span>
                                </div>
                                <div class="info-row">
                                    <label>Tara:</label>
                                    <span id="detail-tara"></span>
                                </div>
                                <div class="info-row">
                                    <label>Oras:</label>
                                    <span id="detail-oras"></span>
                                </div>
                                <div class="info-row">
                                    <label>Regiune:</label>
                                    <span id="detail-regiune"></span>
                                </div>
                                <div class="info-row">
                                    <label>Data Inregistrare:</label>
                                    <span id="detail-data-inregistrare"></span>
                                </div>
                                <div class="info-row description">
                                    <label>Descriere:</label>
                                    <p id="detail-descriere"></p>
                                </div>
                            </div>
                        </div>

                        <!-- Pricing Card -->
                        <div class="detail-card">
                            <div class="card-header">
                                <h3><i class="fas fa-euro-sign"></i> Preturi</h3>
                            </div>
                            <div class="card-content">
                                <div class="price-row">
                                    <label>Pret Adult:</label>
                                    <span id="detail-pret-adult" class="price"></span>
                                </div>
                                <div class="price-row">
                                    <label>Pret Minor:</label>
                                    <span id="detail-pret-minor" class="price"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Images Gallery -->
                    <div class="detail-card images-card">
                        <div class="card-header">
                            <h3><i class="fas fa-images"></i> Galerie Imagini</h3>
                        </div>
                        <div class="card-content">
                            <div id="images-gallery" class="images-gallery">
                                <!-- Images will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <!-- Puncte de Interes Section -->
                    <div class="detail-card puncte-interes-card">
                        <div class="card-header">
                            <h3><i class="fas fa-map-marker-alt"></i> Puncte de Interes</h3>
                            <button type="button" id="btn-adauga-punct" class="btn-add-small">
                                <i class="fas fa-plus"></i> Adauga Punct de Interes
                            </button>
                        </div>
                        <div class="card-content">
                            <table id="tblPuncteDestinatie" class="display" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Denumire</th>
                                        <th>Tip</th>
                                        <th>Descriere</th>
                                        <th>Actiuni</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-section">
                        <button type="button" id="btn-edit-destination" class="btn-primary">
                            <i class="fas fa-edit"></i> Editeaza Destinatia
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Dialogs for Puncte de Interes -->
        
        <!-- Add Punct Dialog -->
        <div id="dialog-punct" title="Adauga Punct de Interes" style="display:none;">
            <form id="form-punct">
                <div class="validateTips">Toate campurile sunt obligatorii.</div>
                <fieldset>
                    <label for="denumire-punct">Denumire:</label>
                    <input type="text" name="denumire-punct" id="denumire-punct" class="text ui-widget-content ui-corner-all" maxlength="50" />
                    
                    <label for="tip-punct">Tip:</label>
                    <select name="tip-punct" id="tip-punct" class="text ui-widget-content ui-corner-all">
                        <option value="">Selecteaz? tipul</option>
                        <option value="Muzeu">Muzeu</option>
                        <option value="Monument">Monument</option>
                        <option value="Parc">Parc</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Atractie">Atrac?ie turistic?</option>
                        <option value="Centru comercial">Centru comercial</option>
                        <option value="Plaja">Plaj?</option>
                        <option value="Munte">Munte</option>
                        <option value="Lac">Lac</option>
                        <option value="Alt">Altul</option>
                    </select>
                    
                    <label for="descriere-punct">Descriere:</label>
                    <textarea name="descriere-punct" id="descriere-punct" class="text ui-widget-content ui-corner-all" rows="4" maxlength="4000"></textarea>
                </fieldset>
            </form>
        </div>

        <!-- Edit Punct Dialog -->
        <div id="dialog-edit-punct" title="Editeaz? Punct de Interes" style="display:none;">
            <form id="form-edit-punct">
                <div class="validateTips">Toate campurile sunt obligatorii.</div>
                <input type="hidden" id="edit-id-punct" />
                <fieldset>
                    <label for="edit-denumire-punct">Denumire:</label>
                    <input type="text" name="edit-denumire-punct" id="edit-denumire-punct" class="text ui-widget-content ui-corner-all" maxlength="50" />
                    
                    <label for="edit-tip-punct">Tip:</label>
                    <select name="edit-tip-punct" id="edit-tip-punct" class="text ui-widget-content ui-corner-all">
                        <option value="">Selecteaz? tipul</option>
                        <option value="Muzeu">Muzeu</option>
                        <option value="Monument">Monument</option>
                        <option value="Parc">Parc</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Atractie">Atrac?ie turistic?</option>
                        <option value="Centru comercial">Centru comercial</option>
                        <option value="Plaja">Plaj?</option>
                        <option value="Munte">Munte</option>
                        <option value="Lac">Lac</option>
                        <option value="Alt">Altul</option>
                    </select>
                    
                    <label for="edit-descriere-punct">Descriere:</label>
                    <textarea name="edit-descriere-punct" id="edit-descriere-punct" class="text ui-widget-content ui-corner-all" rows="4" maxlength="4000"></textarea>
                </fieldset>
            </form>
        </div>

        <!-- View Punct Dialog -->
        <div id="dialog-view-punct" title="Detalii Punct de Interes" style="display:none;">
            <div id="view-punct-content" class="view-content">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>

        <!-- Delete Punct Dialog -->
        <div id="dialog-delete-punct" title="Confirmare stergere" style="display:none;">
            <p>
                <span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>
                Sigur doriti sa stergeti punctul de interes <strong><span id="delete-punct-name"></span></strong>?
            </p>
            <p><em>Aceasta actiune este ireversibila.</em></p>
        </div>

    </form>
</body>
</html>
