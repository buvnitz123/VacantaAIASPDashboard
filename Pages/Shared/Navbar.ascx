<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="Navbar.ascx.cs" Inherits="WebAdminDashboard.Pages.Shared.Navbar" %>
<div class="topnav">
  <a class="active" href="#home"><i class="fa-solid fa-house"></i>Home</a>
  <a href="#" id="logoutBtn" style="float: right;" onclick="return confirmLogout();">
    <i class="fa-solid fa-right-from-bracket"></i>Logout
  </a>
  <span style="float: right; color: #eeeeee; padding: 14px 16px;">
    <i class="fa-solid fa-user"></i>
    <asp:Label ID="lblUsername" runat="server"></asp:Label>
  </span>
</div>

<script>
function confirmLogout() {
    if (confirm('Sigur doriți să vă deconectați?')) {
        window.location.href = '/Pages/Logout.aspx';
    }
    return false;
}
</script>

