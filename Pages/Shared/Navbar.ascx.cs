using System;
using System.Web.UI;

namespace WebAdminDashboard.Pages.Shared
{
    public partial class Navbar : UserControl
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (Session["Username"] != null)
                {
                    lblUsername.Text = Session["Username"].ToString();
                }
                else
                {
                    lblUsername.Text = "Guest";
                }
            }
        }
    }
}
