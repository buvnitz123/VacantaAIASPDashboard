using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WebAdminDashboard.Classes.Database;
using WebAdminDashboard.Classes.DTO;
using System.Web.Services;
using System.Web.Script.Serialization;

namespace WebAdminDashboard
{
    public partial class Index : System.Web.UI.Page
    {
        public List<Utilizator> Utilizatori { get; private set; }
        protected void Page_Load(object sender, EventArgs e)
        {
            Utilizatori = Database.Instance.GetUtilizatori();
        }

        [WebMethod]
        public static string GetUtilizatoriData()
        {
            var data = Database.Instance.GetUtilizatori();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetCategoriiVacantaData()
        {
            var data = Database.Instance.GetCategoriiVacanta();
            return new JavaScriptSerializer().Serialize(data);
        }
    }
}