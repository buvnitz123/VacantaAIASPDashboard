using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WebAdminDashboard.Classes.Database.Repositories;

namespace WebAdminDashboard
{
    public partial class Login : System.Web.UI.Page
    {
        public string ErrorMessage { get; set; }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (Session["IsAuthenticated"] != null && (bool)Session["IsAuthenticated"])
                {
                    Response.Redirect("~/Pages/Index.aspx");
                }
            }
        }

        protected void btnLogin_Click(object sender, EventArgs e)
        {
            string username = txtUsername.Text.Trim();
            string password = txtPassword.Text.Trim();

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                ErrorMessage = "Vă rugăm să completați toate câmpurile.";
                return;
            }

            using (var repository = new AppSettingsRepository())
            {
                var storedUsername = repository.GetByKey("AdminUsername");
                var storedPassword = repository.GetByKey("AdminPassword");

                if (storedUsername == null || storedPassword == null)
                {
                    ErrorMessage = "Configurație invalidă. Contactați administratorul.";
                    return;
                }

                if (username == storedUsername.ParamValue && password == storedPassword.ParamValue)
                {
                    Session["IsAuthenticated"] = true;
                    Session["Username"] = username;
                    Session.Timeout = 30;

                    Response.Redirect("~/Pages/Index.aspx");
                }
                else
                {
                    ErrorMessage = "Nume utilizator sau parolă incorectă.";
                }
            }
        }
    }
}
