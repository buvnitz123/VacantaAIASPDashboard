using System;
using System.Web;
using System.Web.UI;

namespace WebAdminDashboard.Classes.Library
{
    public class AuthenticatedPage : Page
    {
        protected override void OnInit(EventArgs e)
        {
            base.OnInit(e);
            CheckAuthentication();
        }

        private void CheckAuthentication()
        {
            if (Session["IsAuthenticated"] == null || !(bool)Session["IsAuthenticated"])
            {
                Response.Redirect("~/Pages/Login.aspx", true);
            }
        }

        protected string GetAuthenticatedUsername()
        {
            return Session["Username"]?.ToString() ?? "Unknown";
        }

        protected void Logout()
        {
            Session.Clear();
            Session.Abandon();
            Response.Redirect("~/Pages/Login.aspx", true);
        }
    }
}
