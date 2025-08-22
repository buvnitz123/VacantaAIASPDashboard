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
using WebAdminDashboard.Classes.Database.Repositories;

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
            //var data = Database.Instance.GetUtilizatori();
            var data = new UtilizatorRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetCategoriiVacantaData()
        {
            //var data = Database.Instance.GetCategoriiVacanta();
            var data = new CategorieVacantaRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetDestinatiiData()
        {
            //var data = Database.Instance.GetDestinatiiVacanta();
            var data = new DestinatieRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetFacilitatiData()
        {
            //var data = Database.Instance.GetFacilitati();
            var data = new FacilitateRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetPuncteInteresData()
        {
            //var data = Database.Instance.GetPuncteInteres();
            var data = new PunctDeInteresRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetSugestiiData()
        {
            //var data = Database.Instance.GetSugestii();
            var data = new SugestieRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }
    }
}