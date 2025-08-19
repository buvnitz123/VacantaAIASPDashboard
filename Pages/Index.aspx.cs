using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WebAdminDashboard.Classes.Database;
using WebAdminDashboard.Classes.DTO;

namespace WebAdminDashboard
{
    public partial class Index : System.Web.UI.Page
    {
        public List<Utilizator> Utilizatori { get; private set; }
        protected void Page_Load(object sender, EventArgs e)
        {
            Utilizatori = Database.Instance.GetUtilizatori();
        }
    }
}