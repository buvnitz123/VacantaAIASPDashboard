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
        protected void Page_Load(object sender, EventArgs e)
        {
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

        [WebMethod]
        public static string GetDestinatiiData()
        {
            var data = Database.Instance.GetDestinatiiVacanta();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetFacilitatiData()
        {
            var data = Database.Instance.GetFacilitati();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetPuncteInteresData()
        {
            var data = Database.Instance.GetPuncteInteres();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetSugestiiData()
        {
            var data = Database.Instance.GetSugestii();
            return new JavaScriptSerializer().Serialize(data);
        }
    }
}