using System;
using System.Linq;
using System.Web.Services;
using System.Web.UI;
using Newtonsoft.Json;
using WebAdminDashboard.Classes.Database.Repositories;

namespace WebAdminDashboard
{
    public partial class UserDetail : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod]
        public static string GetUserDetails(int? id)
        {
            try
            {
                if (!id.HasValue || id.Value <= 0)
                    return JsonConvert.SerializeObject(new { success = false, message = "ID invalid." });

                var repo = new UtilizatorRepository();
                var user = repo.GetById(id.Value);
                if (user == null)
                    return JsonConvert.SerializeObject(new { success = false, message = "Utilizatorul nu a fost g?sit." });

                var dto = new
                {
                    user.Id_Utilizator,
                    user.Nume,
                    user.Prenume,
                    user.Email,
                    user.Telefon,
                    Data_Nastere = user.Data_Nastere.ToString("yyyy-MM-dd"),
                    EsteActiv = user.EsteActiv == 1,
                    user.PozaProfil
                };

                return JsonConvert.SerializeObject(new { success = true, user = dto });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare: " + ex.Message });
            }
        }
    }
}