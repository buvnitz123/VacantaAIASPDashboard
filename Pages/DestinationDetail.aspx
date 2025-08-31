<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="DestinationDetail.aspx.cs" Inherits="WebAdminDashboard.DestinationDetail" %>
<%@ Register Src="~/Pages/Shared/Navbar.ascx" TagPrefix="uc" TagName="Navbar" %>
<%@ Register Src="~/Pages/Shared/Sidebar.ascx" TagPrefix="uc" TagName="Sidebar" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Detalii Destinatie - Dashboard</title>
    <link href="/Content/styles.css" rel="stylesheet" />
    <link href="/Content/destinatie.css?v=3" rel="stylesheet" />
    <link href="/Content/destination-detail.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="/Scripts/app.js"></script>
    <script src="/Scripts/destination-detail.js?v=3"></script>
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

                    <!-- Action Buttons -->
                    <div class="action-section">
                        <button type="button" id="btn-edit-destination" class="btn-primary">
                            <i class="fas fa-edit"></i> Editeaza Destinatia
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</body>
</html>
