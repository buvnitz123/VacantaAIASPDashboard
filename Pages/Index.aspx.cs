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
            var data = new UtilizatorRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetCategoriiVacantaData()
        {
            var data = new CategorieVacantaRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetDestinatiiData()
        {
            var data = new DestinatieRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetFacilitatiData()
        {
            var data = new FacilitateRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetPuncteInteresData()
        {
            var data = new PunctDeInteresRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string GetSugestiiData()
        {
            var data = new SugestieRepository().GetAll();
            return new JavaScriptSerializer().Serialize(data);
        }

        [WebMethod]
        public static string UploadCategorieImage(string base64Image, string fileName, string categorieId)
        {
            // TODO: Implement image upload to AWS S3
            // 1. Validate base64Image and fileName
            // 2. Convert base64 to byte array
            // 3. Upload to S3 using S3Utils
            // 4. Update CategorieVacanta record with new image URL
            // 5. Return success/error response
            return "";
        }

        [WebMethod]
        public static string DeleteCategorieImage(string categorieId)
        {
            // TODO: Implement image deletion from AWS S3
            // 1. Get current image URL from database
            // 2. Delete image from S3 using S3Utils
            // 3. Update CategorieVacanta record to remove image URL
            // 4. Return success/error response
            return "";
        }
    }
}