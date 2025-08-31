using System;
using System.Web.UI;
using WebAdminDashboard.Classes.Database.Repositories;
using Newtonsoft.Json;
using System.Web.Services;
using System.Linq;

namespace WebAdminDashboard
{
    public partial class DestinationDetail : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Page initialization if needed
            }
        }

        [WebMethod]
        public static string GetDestinationDetails(int destinationId)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"GetDestinationDetails called with ID: {destinationId}");
                
                var destinatieRepository = new DestinatieRepository();
                var destinatie = destinatieRepository.GetById(destinationId);

                if (destinatie == null)
                {
                    return JsonConvert.SerializeObject(new { 
                        success = false, 
                        message = "Destinația nu a fost găsită" 
                    });
                }

                // Get associated images
                var imaginiRepository = new ImaginiDestinatieRepository();
                using (var context = new Classes.Database.AppContext())
                {
                    var imagini = context.ImaginiDestinatie
                        .Where(i => i.Id_Destinatie == destinationId)
                        .Select(i => i.ImagineUrl)
                        .ToList();

                    var result = new
                    {
                        success = true,
                        destination = new
                        {
                            Id_Destinatie = destinatie.Id_Destinatie,
                            Denumire = destinatie.Denumire,
                            Tara = destinatie.Tara,
                            Oras = destinatie.Oras,
                            Regiune = destinatie.Regiune,
                            Descriere = destinatie.Descriere,
                            PretAdult = destinatie.PretAdult,
                            PretMinor = destinatie.PretMinor,
                            Images = imagini
                        }
                    };

                    System.Diagnostics.Debug.WriteLine($"Destination details retrieved: {destinatie.Denumire}");
                    return JsonConvert.SerializeObject(result);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetDestinationDetails error: {ex.Message}");
                return JsonConvert.SerializeObject(new { 
                    success = false, 
                    message = $"Eroare: {ex.Message}" 
                });
            }
        }
    }
}
