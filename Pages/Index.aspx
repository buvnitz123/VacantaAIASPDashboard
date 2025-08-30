<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="WebAdminDashboard.Index" %>
<%@ Register Src="~/Pages/Shared/Navbar.ascx" TagPrefix="uc" TagName="Navbar" %>
<%@ Register Src="~/Pages/Shared/Sidebar.ascx" TagPrefix="uc" TagName="Sidebar" %>
<%@ Register Src="~/Pages/Utilizatori.ascx" TagPrefix="pg" TagName="Utilizatori" %>
<%@ Register Src="~/Pages/CategoriiVacanta.ascx" TagPrefix="pg" TagName="CategoriiVacanta" %>
<%@ Register Src="~/Pages/Destinatie.ascx" TagPrefix="pg" TagName="Destinatii" %>
<%@ Register Src="~/Pages/Facilitate.ascx" TagPrefix="pg" TagName="Facilitati" %>
<%@ Register Src="~/Pages/PunctDeInteres.ascx" TagPrefix="pg" TagName="PuncteDeInteres" %>
<%@ Register Src="~/Pages/Sugestie.ascx" TagPrefix="pg" TagName="Sugestii" %>


<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Dashboard</title>
    <link href="/Content/styles.css" rel="stylesheet" />
    <link href="/Content/categorie-vacanta.css" rel="stylesheet" />
    <link href="/Content/facilitate.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.js"></script>
    <script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css" />
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css"/>
    <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="/Scripts/app.js"></script>
    <script src="/Scripts/categorie-vacanta.js"></script>
    <script src="/Scripts/facilitate.js"></script>
</head>
<body>

    <uc:Navbar runat="server" ID="TopNavbar" />

    <uc:Sidebar runat="server" ID="LeftSidebar" />

    <div class="content expanded-when-collapsed">
      <div class="section home active">
        <h2>Bine ai venit!</h2>
        <p>Acesta este dashboard-ul aplicatiei. Foloseste meniul din stanga pentru a naviga.</p>
      </div>
      <div class="section utilizatori">
        <pg:Utilizatori runat="server" ID="PgUtilizatori" />
      </div>
      <div class="section categorii">
        <pg:CategoriiVacanta runat="server" ID="PgCategoriiVacanta" />
      </div>
      <div class="section destinatii">
        <pg:Destinatii runat="server" ID="PgDestinatii" />
      </div>
      <div class="section facilitati">
        <pg:Facilitati runat="server" ID="PgFacilitati" />
      </div>
      <div class="section puncte">
        <pg:PuncteDeInteres runat="server" ID="PgPuncteDeInteres" />
      </div>
      <div class="section sugestii">
        <pg:Sugestii runat="server" ID="PgSugestii" />
      </div>
    </div>
</body>
</html>
