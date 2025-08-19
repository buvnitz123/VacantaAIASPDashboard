<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="WebAdminDashboard.Index" %>
<%@ Register Src="~/Pages/Shared/Navbar.ascx" TagPrefix="uc" TagName="Navbar" %>
<%@ Register Src="~/Pages/Shared/Sidebar.ascx" TagPrefix="uc" TagName="Sidebar" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Dasboard</title>
    <link href="/Content/styles.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="/Scripts/app.js"></script>
</head>
<body>

    <uc:Navbar runat="server" ID="TopNavbar" />

    <uc:Sidebar runat="server" ID="LeftSidebar" />

    <div class="content expanded-when-collapsed">
      <div class="section home active">
        <h2>Bine ai venit!</h2>
        <p>Acesta este dashboard-ul aplicației. Folosește meniul din stânga pentru a naviga.</p>
      </div>
      <div class="section utilizatori">
        <h2>Utilizatori</h2>
        <p>Gestionare utilizatori: listă, adăugare, editare.</p>
      </div>
      <div class="section categorii">
        <h2>Categorii vacante</h2>
        <p>Administrare categorii pentru vacanțe.</p>
      </div>
    </div>
</body>
</html>
