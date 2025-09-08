<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UserDetail.aspx.cs" Inherits="WebAdminDashboard.UserDetail" %>
<%@ Register Src="~/Pages/Shared/Navbar.ascx" TagPrefix="uc" TagName="Navbar" %>
<%@ Register Src="~/Pages/Shared/Sidebar.ascx" TagPrefix="uc" TagName="Sidebar" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Detalii Utilizator - Dashboard</title>
    <link href="/Content/styles.css" rel="stylesheet" />
    <link href="/Content/destinatie.css" rel="stylesheet" />
    <link href="/Content/user-detail.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
    <script src="/Scripts/user-detail.js?v=1"></script>
</head>
<body>
    <form id="form1" runat="server">
        <uc:Navbar runat="server" ID="TopNavbar" />
        <uc:Sidebar runat="server" ID="LeftSidebar" />

        <div class="content expanded-when-collapsed">
            <div class="destination-detail-container">
                <div class="detail-header">
                    <button type="button" id="btn-back-to-users" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Inapoi la Utilizatori
                    </button>
                    <h2 id="user-title">Detalii Utilizator</h2>
                </div>

                <div id="loading-indicator" class="loading-container">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Se încarcă detaliile utilizatorului...</span>
                </div>

                <div id="error-message" class="error-container" style="display:none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span id="error-text">Eroare la încărcarea utilizatorului</span>
                </div>

                <div id="user-content" style="display:none;">
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="card-header">
                                <h3><i class="fas fa-user"></i> Informații Generale</h3>
                            </div>
                            <div class="card-content">
                                <div class="info-row">
                                    <label>Nume:</label>
                                    <span id="detail-nume"></span>
                                </div>
                                <div class="info-row">
                                    <label>Prenume:</label>
                                    <span id="detail-prenume"></span>
                                </div>
                                <div class="info-row">
                                    <label>Email:</label>
                                    <span id="detail-email"></span>
                                </div>
                                <div class="info-row">
                                    <label>Telefon:</label>
                                    <span id="detail-telefon"></span>
                                </div>
                                <div class="info-row">
                                    <label>Data naștere:</label>
                                    <span id="detail-nastere"></span>
                                </div>
                                <div class="info-row">
                                    <label>Activ:</label>
                                    <span id="detail-activ"></span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-card">
                            <div class="card-header">
                                <h3><i class="fas fa-image"></i> Poză profil</h3>
                            </div>
                            <div class="card-content">
                                <div id="profile-photo-wrapper">
                                    <img id="detail-poza" alt="Poza profil" style="max-width:200px;display:none;border-radius:8px;" />
                                    <div id="no-photo" style="display:none;">Fără poză disponibilă</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="action-section">
                        <button type="button" id="btn-delete-user" class="btn-danger">
                            <i class="fas fa-trash"></i> Șterge utilizator
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="dialog-delete-user" title="Confirmare ștergere" style="display:none;">
            <p>
                <span class="ui-icon ui-icon-alert" style="float:left;margin:12px 12px 20px 0;"></span>
                Sigur doriți să ștergeți acest utilizator?
            </p>
            <p class="delete-warning"><em>Această acțiune nu poate fi anulată.</em></p>
        </div>
    </form>
</body>
</html>