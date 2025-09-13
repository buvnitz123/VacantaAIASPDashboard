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

                using (var repo = new UtilizatorRepository())
                {
                    var user = repo.GetById(id.Value);
                    if (user == null)
                        return JsonConvert.SerializeObject(new { success = false, message = "Utilizatorul nu a fost g?sit." });

                    // Fix image URL by prepending Azure Blob base URL if it's just a partial path
                    var pozaProfil = user.PozaProfil;
                    if (!string.IsNullOrEmpty(pozaProfil) && !pozaProfil.StartsWith("http"))
                    {
                        // Prepend Azure Blob Storage base URL
                        pozaProfil = "https://vacantaai.blob.core.windows.net/vacantaai/" + pozaProfil;
                    }

                    var dto = new
                    {
                        user.Id_Utilizator,
                        user.Nume,
                        user.Prenume,
                        user.Email,
                        user.Telefon,
                        Data_Nastere = user.Data_Nastere.ToString("dd/MM/yyyy"),
                        EsteActiv = user.EsteActiv == 1,
                        PozaProfil = pozaProfil
                    };

                    return JsonConvert.SerializeObject(new { success = true, user = dto });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la înc?rcarea utilizatorului" });
            }
        }
    }
}