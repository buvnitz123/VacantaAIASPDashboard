using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using WebAdminDashboard.Classes.Database.Repositories;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Classes.Library;
using WebAdminDashboard.Classes.Library.Enums;
using AppContext = WebAdminDashboard.Classes.Database.AppContext;

namespace WebAdminDashboard
{
    public partial class Index : AuthenticatedPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod]
        public static string GetUtilizatoriData()
        {
            using (var repository = new UtilizatorRepository())
            {
                var data = repository.GetAll();
                return JsonConvert.SerializeObject(data);
            }
        }

        [WebMethod]
        public static string GetCategoriiVacantaData()
        {
            using (var repository = new CategorieVacantaRepository())
            {
                var data = repository.GetAll();
                return JsonConvert.SerializeObject(data);
            }
        }

        [WebMethod]
        public static string GetDestinatiiData()
        {
            using (var repository = new DestinatieRepository())
            {
                var data = repository.GetAll();
                return JsonConvert.SerializeObject(data);
            }
        }

        [WebMethod]
        public static string GetFacilitatiData()
        {
            try
            {
                using (var repository = new FacilitateRepository())
                {
                    var data = repository.GetAll();
                    return JsonConvert.SerializeObject(data);
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea facilităților" });
            }
        }

        [WebMethod]
        public static string GetFacilitateById(int id)
        {
            try
            {
                using (var repository = new FacilitateRepository())
                {
                    var facilitate = repository.GetById(id);
                    if (facilitate == null)
                    {
                        return JsonConvert.SerializeObject(new { success = false, message = "Facilitatea nu a fost găsită" });
                    }
                    return JsonConvert.SerializeObject(facilitate);
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea facilității" });
            }
        }

        [WebMethod]
        public static string AddFacilitate(int id, string denumire, string descriere)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(denumire))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Denumirea este obligatorie" });
                }

                using (var repository = new FacilitateRepository())
                {
                    // Check if ID already exists
                    if (repository.GetById(id) != null)
                    {
                        // If ID exists, generate a new one by adding a random number
                        id += new Random().Next(1, 1000);
                    }

                    var facilitate = new Facilitate
                    {
                        Id_Facilitate = id,
                        Denumire = denumire.Trim(),
                        Descriere = !string.IsNullOrWhiteSpace(descriere) ? descriere.Trim() : null
                    };

                    repository.Insert(facilitate);

                    return JsonConvert.SerializeObject(new { success = true, id = facilitate.Id_Facilitate });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la adăugarea facilității" });
            }
        }

        [WebMethod]
        public static string UpdateFacilitate(int id, string denumire, string descriere)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(denumire))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Denumirea este obligatorie" });
                }

                using (var repository = new FacilitateRepository())
                {
                    var facilitate = repository.GetById(id);

                    if (facilitate == null)
                    {
                        return JsonConvert.SerializeObject(new { success = false, message = "Facilitatea nu a fost găsită" });
                    }

                    facilitate.Denumire = denumire.Trim();
                    facilitate.Descriere = !string.IsNullOrWhiteSpace(descriere) ? descriere.Trim() : null;

                    repository.Update(facilitate);

                    return JsonConvert.SerializeObject(new { success = true });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la actualizarea facilității" });
            }
        }

        [WebMethod]
        public static string DeleteFacilitate(int id)
        {
            try
            {
                using (var repository = new FacilitateRepository())
                using (var destinatieFacilitateRepo = new DestinatieFacilitateRepository())
                {
                    var facilitate = repository.GetById(id);

                    if (facilitate == null)
                    {
                        return JsonConvert.SerializeObject(new { success = false, message = "Facilitatea nu a fost găsită" });
                    }

                    // Verifică dacă există relații în tabelele asociate înainte de ștergere
                    var areRelatii = destinatieFacilitateRepo.GetAll().Any(df => df.Id_Facilitate == id);

                    if (areRelatii)
                    {
                        return JsonConvert.SerializeObject(new
                        {
                            success = false,
                            message = "Nu se poate șterge această facilitate deoarece este folosită în alte înregistrări"
                        });
                    }

                    repository.Delete(id);
                    return JsonConvert.SerializeObject(new { success = true });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = "Eroare la ștergerea facilității"
                });
            }
        }

        [WebMethod]
        public static string GetPuncteInteresData()
        {
            try
            {
                using (var repository = new PunctDeInteresRepository())
                {
                    var data = repository.GetAll();

                    // Map to include destination data
                    var result = data.Select(p => new
                    {
                        Id_PunctDeInteres = p.Id_PunctDeInteres,
                        Denumire = p.Denumire,
                        Descriere = p.Descriere,
                        Tip = p.Tip,
                        Id_Destinatie = p.Id_Destinatie,
                        Destinatie = p.Destinatie != null ? new
                        {
                            Id_Destinatie = p.Destinatie.Id_Destinatie,
                            Denumire = p.Destinatie.Denumire,
                            Tara = p.Destinatie.Tara,
                            Oras = p.Destinatie.Oras
                        } : null
                    }).ToList();

                    return JsonConvert.SerializeObject(result);
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea punctelor de interes" });
            }
        }

        [WebMethod]
        public static string GetSugestiiData()
        {
            try
            {
                using (var repository = new SugestieRepository())
                {
                    var data = repository.GetAll();

                    // Map to include destination and user data
                    var result = data.Select(s => new
                    {
                        Id_Sugestie = s.Id_Sugestie,
                        Data_Inregistrare = s.Data_Inregistrare,
                        EsteGenerataDeAI = s.EsteGenerataDeAI,
                        Titlu = s.Titlu,
                        Buget_Estimat = s.Buget_Estimat,
                        Descriere = s.Descriere,
                        EstePublic = s.EstePublic,
                        CodPartajare = s.CodPartajare,
                        Id_Destinatie = s.Id_Destinatie,
                        Id_Utilizator = s.Id_Utilizator,
                        Destinatie = s.Destinatie != null ? new
                        {
                            Id_Destinatie = s.Destinatie.Id_Destinatie,
                            Denumire = s.Destinatie.Denumire,
                            Tara = s.Destinatie.Tara,
                            Oras = s.Destinatie.Oras
                        } : null,
                        Utilizator = s.Utilizator != null ? new
                        {
                            Id_Utilizator = s.Utilizator.Id_Utilizator,
                            Nume = s.Utilizator.Nume,
                            Prenume = s.Utilizator.Prenume,
                            Email = s.Utilizator.Email
                        } : null
                    }).ToList();

                    return JsonConvert.SerializeObject(result);
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea sugestiilor" });
            }
        }

        [WebMethod]
        public static string UploadCategorieImage(string base64Image, string fileName, string categorieId)
        {
            try
            {
                Debug.WriteLine("UploadCategorieImage called with fileName: " + fileName + " and categorieId: " + categorieId);
                if (string.IsNullOrEmpty(base64Image) || string.IsNullOrEmpty(fileName))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Parametri invalizi" });
                }

                Debug.WriteLine("Base64 image length: " + base64Image.Length);
                var imageBytes = BlobAzureStorage.ConvertBase64ToBytes(base64Image);
                if (imageBytes == null || imageBytes.Length == 0)
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Imagine invalida" });
                }

                // Get content type from filename
                var contentType = BlobAzureStorage.GetContentTypeFromFileName(fileName);
                if (!BlobAzureStorage.IsValidImageType(contentType))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Tipul de fisier nu este suportat" });
                }

                // Upload to Azure Blob Storage
                var imageUrl = BlobAzureStorage.UploadImage(imageBytes, fileName, contentType);
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Eroare la incarcarea imaginii" });
                }

                // Update database record ifCategorieId is provided (for edit)
                if (!string.IsNullOrEmpty(categorieId) && int.TryParse(categorieId, out int id))
                {
                    using (var repository = new CategorieVacantaRepository())
                    {
                        var categorie = repository.GetById(id);
                        if (categorie != null)
                        {
                            // Delete old image if exists
                            if (!string.IsNullOrEmpty(categorie.ImagineUrl))
                            {
                                BlobAzureStorage.DeleteImage(categorie.ImagineUrl);
                            }

                            // Update with new image URL
                            categorie.ImagineUrl = imageUrl;
                            repository.Update(categorie);
                        }
                    }
                }

                return JsonConvert.SerializeObject(new { success = true, imageUrl = imageUrl, message = "Imagine incarcata cu succes" });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la procesarea imaginii" });
            }
        }

        [WebMethod]
        public static string AddCategorieVacanta(int categorieId, string denumire, string base64Image, string fileName)
        {
            try
            {
                Debug.WriteLine($"[DEBUG] AddCategorieVacanta started - ID: {categorieId}, Denumire: {denumire}, File: {fileName}");
                Debug.WriteLine($"[DEBUG] Base64 length: {base64Image?.Length ?? 0} characters");

                if (string.IsNullOrEmpty(denumire))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Denumirea este obligatorie" });
                }

                string imageUrl = null;

                // 1. Upload image to Azure Blob Storage first
                if (!string.IsNullOrEmpty(base64Image) && !string.IsNullOrEmpty(fileName))
                {
                    try
                    {
                        Debug.WriteLine("[DEBUG] Starting image conversion from base64");
                        var imageBytes = BlobAzureStorage.ConvertBase64ToBytes(base64Image);
                        Debug.WriteLine($"[DEBUG] Image converted to bytes. Length: {imageBytes?.Length ?? 0} bytes");
                        if (imageBytes != null && imageBytes.Length > 0)
                        {
                            var contentType = BlobAzureStorage.GetContentTypeFromFileName(fileName);
                            Debug.WriteLine($"[DEBUG] Content type detected: {contentType}");

                            if (BlobAzureStorage.IsValidImageType(contentType))
                            {
                                Debug.WriteLine("[DEBUG] Content type is valid. Preparing for Azure Blob upload...");
                                {
                                    var extension = Path.GetExtension(fileName);
                                    var safeDenumire = denumire.Trim().Replace(" ", "_").Replace("-", "_");
                                    var customFileName = $"categories/{categorieId}_{safeDenumire}_categorie{extension}";
                                    Debug.WriteLine($"[DEBUG] Uploading to Azure Blob: {customFileName}");
                                    imageUrl = BlobAzureStorage.UploadImage(imageBytes, customFileName, contentType);
                                    Debug.WriteLine($"[DEBUG] Azure Blob upload completed. URL: {imageUrl}");

                                    if (string.IsNullOrEmpty(imageUrl))
                                    {
                                        return JsonConvert.SerializeObject(new
                                        {
                                            success = false,
                                            message = "Eroare la încărcarea imaginii în Azure Blob Storage"
                                        });
                                    }
                                }
                            }
                            else
                            {
                                return JsonConvert.SerializeObject(new
                                {
                                    success = false,
                                    message = "Tip de fișier imagine neacceptat"
                                });
                            }
                        }
                    }
                    catch (Exception imgEx)
                    {
                        Debug.WriteLine($"Image upload error: {imgEx.Message}");
                        return JsonConvert.SerializeObject(new
                        {
                            success = false,
                            message = "Eroare la procesarea imaginii"
                        });
                    }
                }

                // 2. Save to database only after successful Azure Blob upload
                Debug.WriteLine("[DEBUG] Preparing to save to database...");
                using (var repository = new CategorieVacantaRepository())
                {
                    var categorie = new CategorieVacanta
                    {
                        Id_CategorieVacanta = categorieId,
                        Denumire = denumire.Trim(),
                        ImagineUrl = imageUrl
                    };

                    try
                    {
                        Debug.WriteLine("[DEBUG] Inserting category into database...");
                        repository.Insert(categorie);
                        Debug.WriteLine("[DEBUG] Category successfully inserted into database");

                        var result = new
                        {
                            success = true,
                            message = "Categoria a fost adăugată cu succes",
                            imageUrl = imageUrl
                        };

                        Debug.WriteLine($"[DEBUG] Returning success response: {JsonConvert.SerializeObject(result)}");
                        return JsonConvert.SerializeObject(result);
                    }
                    catch (Exception dbEx)
                    {
                        // If database save fails, try to delete the uploaded image
                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            try { BlobAzureStorage.DeleteImage(imageUrl); }
                            catch (Exception delEx)
                            {
                                Debug.WriteLine($"Failed to delete image from Azure Blob Storage: {delEx.Message}");
                                // Continue with the original error
                            }
                        }

                        Debug.WriteLine($"Database error: {dbEx.Message}");
                        return JsonConvert.SerializeObject(new
                        {
                            success = false,
                            message = "Eroare la salvarea în baza de date"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AddCategorieVacanta error: {ex.Message}");
                Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la adăugarea categoriei" });
            }
        }

        [WebMethod]
        public static string UpdateCategorieVacantaName(string categorieId, string newDenumire)
        {
            try
            {
                if (string.IsNullOrEmpty(categorieId) || !int.TryParse(categorieId, out int id))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "ID categorie invalid" });
                }

                if (string.IsNullOrEmpty(newDenumire))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Denumirea este obligatorie" });
                }

                using (var repository = new CategorieVacantaRepository())
                {
                    var categorie = repository.GetById(id);

                    if (categorie == null)
                    {
                        return JsonConvert.SerializeObject(new { success = false, message = "Categoria nu a fost gasita" });
                    }

                    categorie.Denumire = newDenumire.Trim();
                    repository.Update(categorie);

                    return JsonConvert.SerializeObject(new { success = true, message = "Categoria a fost modificata cu succes" });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la modificarea categoriei" });
            }
        }

        [WebMethod]
        public static string DeleteCategorieVacanta(string categorieId)
        {
            try
            {
                if (string.IsNullOrEmpty(categorieId) || !int.TryParse(categorieId, out int id))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "ID categorie invalid" });
                }

                using (var repository = new CategorieVacantaRepository())
                {
                    repository.Delete(id);
                    return JsonConvert.SerializeObject(new { success = true, message = "Categoria a fost ștearsă cu succes" });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la ștergerea categoriei" });
            }
        }

        [WebMethod]
        public static string AddDestinatie(string denumire, string tara, string oras, string regiune, string descriere, decimal pretAdult, decimal pretMinor, string[] imageUrls)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"AddDestinatie called with: denumire={denumire}, tara={tara}, oras={oras}, regiune={regiune}, pretAdult={pretAdult}, pretMinor={pretMinor}, imageUrls count={imageUrls?.Length ?? 0}");

                if (string.IsNullOrWhiteSpace(denumire) || string.IsNullOrWhiteSpace(tara) || string.IsNullOrWhiteSpace(oras) || string.IsNullOrWhiteSpace(regiune))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Toate câmpurile obligatorii trebuie completate" });
                }

                if (pretAdult <= 0 || pretMinor <= 0)
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Prețurile trebuie să fie mai mari decât 0" });
                }

                // Generate unique ID using GUID hash for better uniqueness
                var guidHash = Math.Abs(Guid.NewGuid().GetHashCode());
                var destinatieId = guidHash % 1000000 + new Random().Next(1, 1000);
                System.Diagnostics.Debug.WriteLine($"Generated destinatieId: {destinatieId}");

                using (var destinatieRepository = new DestinatieRepository())
                {
                    // Check if ID already exists
                    if (destinatieRepository.GetById(destinatieId) != null)
                    {
                        // If ID exists, generate a new one
                        destinatieId += new Random().Next(1, 1000);
                        System.Diagnostics.Debug.WriteLine($"ID conflict resolved, new destinatieId: {destinatieId}");
                    }

                    // Create and insert destination
                    System.Diagnostics.Debug.WriteLine("Creating destination object...");
                    var destinatie = new Destinatie
                    {
                        Id_Destinatie = destinatieId,
                        Denumire = denumire.Trim(),
                        Tara = tara.Trim(),
                        Oras = oras.Trim(),
                        Regiune = regiune.Trim(),
                        Descriere = !string.IsNullOrWhiteSpace(descriere) ? descriere.Trim() : null,
                        Data_Inregistrare = DateTime.Now,
                        PretAdult = pretAdult,
                        PretMinor = pretMinor
                    };

                    System.Diagnostics.Debug.WriteLine("Inserting destination into database...");
                    destinatieRepository.Insert(destinatie);
                    System.Diagnostics.Debug.WriteLine("Destination inserted successfully");

                    // If image URLs are provided, insert all into ImaginiDestinatie
                    if (imageUrls != null && imageUrls.Length > 0)
                    {
                        System.Diagnostics.Debug.WriteLine($"Adding {imageUrls.Length} images to destination...");
                        using (var imaginiRepository = new ImaginiDestinatieRepository())
                        {
                            for (int i = 0; i < imageUrls.Length; i++)
                            {
                                if (!string.IsNullOrWhiteSpace(imageUrls[i]))
                                {
                                    // Generate unique ID for each image using GUID
                                    var imageGuidHash = Math.Abs(Guid.NewGuid().GetHashCode());
                                    var imagineId = imageGuidHash % 1000000 + (i * 10000) + new Random().Next(1, 999);
                                    System.Diagnostics.Debug.WriteLine($"Generated imagineId {i + 1}: {imagineId}");

                                    var imagineDestinatie = new ImaginiDestinatie
                                    {
                                        Id_Destinatie = destinatieId,
                                        Id_ImaginiDestinatie = imagineId,
                                        ImagineUrl = imageUrls[i]
                                    };
                                    System.Diagnostics.Debug.WriteLine($"ImaginiDestinatie object {i + 1} created");

                                    imaginiRepository.Insert(imagineDestinatie);
                                    System.Diagnostics.Debug.WriteLine($"Image {i + 1} inserted successfully");
                                }
                            }
                        }
                    }

                    System.Diagnostics.Debug.WriteLine("AddDestinatie completed successfully");
                    return JsonConvert.SerializeObject(new { success = true, message = "Destinația a fost adăugată cu succes", destinatieId = destinatieId });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception in AddDestinatie: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la adăugarea destinației" });
            }
        }

        [WebMethod]
        public static string SearchPexelsImages(string query, int perPage = 3)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"SearchPexelsImages called with query: {query}, perPage: {perPage}");

                if (string.IsNullOrWhiteSpace(query))
                {
                    System.Diagnostics.Debug.WriteLine("Query is null or empty");
                    return JsonConvert.SerializeObject(new { success = false, message = "Termenul de căutare este obligatoriu" });
                }

                System.Diagnostics.Debug.WriteLine("Calling PhotoAPIUtils.SearchPhotos...");

                var result = PhotoAPIUtils.SearchPhotos(query, perPage, 1);

                System.Diagnostics.Debug.WriteLine($"PhotoAPIUtils returned result: {result != null}");

                if (result != null && result.Photos != null)
                {
                    System.Diagnostics.Debug.WriteLine($"Found {result.Photos.Count} photos");
                    return JsonConvert.SerializeObject(new
                    {
                        success = true,
                        photos = result.Photos,
                        totalResults = result.TotalResults,
                        page = result.Page,
                        perPage = result.PerPage
                    });
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("No photos found or result is null");
                    return JsonConvert.SerializeObject(new
                    {
                        success = false,
                        message = "Nu s-au găsit imagini pentru termenul căutat"
                    });
                }
            }
            catch (AggregateException aggEx)
            {
                System.Diagnostics.Debug.WriteLine($"AggregateException in SearchPexelsImages: {aggEx.Message}");
                var innerEx = aggEx.InnerException ?? aggEx;
                System.Diagnostics.Debug.WriteLine($"Inner exception: {innerEx.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {innerEx.StackTrace}");

                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = "Eroare la căutarea imaginilor"
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception in SearchPexelsImages: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");

                return JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = "Eroare la căutarea imaginilor"
                });
            }
        }

        [WebMethod]
        public static string DeleteDestinatie(int destinatieId)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"DeleteDestinatie called with destinatieId: {destinatieId}");

                using (var destinatieRepository = new DestinatieRepository())
                {
                    var destinatie = destinatieRepository.GetById(destinatieId);

                    if (destinatie == null)
                    {
                        System.Diagnostics.Debug.WriteLine("Destination not found");
                        return JsonConvert.SerializeObject(new { success = false, message = "Destinația nu a fost găsită" });
                    }

                    System.Diagnostics.Debug.WriteLine($"Found destination: {destinatie.Denumire}");

                    // Delete associated images first
                    System.Diagnostics.Debug.WriteLine("Starting to delete associated images...");
                    using (var context = new AppContext())
                    {
                        var imaginiToDelete = context.ImaginiDestinatie
                            .Where(i => i.Id_Destinatie == destinatieId).ToList();

                        System.Diagnostics.Debug.WriteLine($"Found {imaginiToDelete.Count} images to delete");

                        if (imaginiToDelete.Any())
                        {
                            context.ImaginiDestinatie.RemoveRange(imaginiToDelete);
                            context.SaveChanges();
                            System.Diagnostics.Debug.WriteLine("Images deleted successfully");
                        }
                    }

                    // Delete the destination
                    System.Diagnostics.Debug.WriteLine("Deleting destination...");
                    destinatieRepository.Delete(destinatieId);
                    System.Diagnostics.Debug.WriteLine("Destination deleted successfully");

                    return JsonConvert.SerializeObject(new { success = true, message = "Destinația a fost ștearsă cu succes" });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"DeleteDestinatie error: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la ștergerea destinației" });
            }
        }

        [WebMethod]
        public static string DeleteUtilizator(int id)
        {
            try
            {
                using (var repo = new UtilizatorRepository())
                {
                    var user = repo.GetById(id);
                    if (user == null)
                        return JsonConvert.SerializeObject(new { success = false, message = "Utilizatorul nu există" });

                    // TODO: verifică referințe (PreferinteUtilizator, etc.) înainte de ștergere dacă e necesar

                    repo.Delete(id);
                    return JsonConvert.SerializeObject(new { success = true });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la ștergerea utilizatorului" });
            }
        }

        // User Analytics WebMethods
        [WebMethod]
        public static string GetUsersForAnalytics()
        {
            try
            {
                using (var repository = new UtilizatorRepository())
                {
                    var users = repository.GetAll()
                        .Where(u => u.EsteActiv == 1)
                        .Select(u => new
                        {
                            Id_Utilizator = u.Id_Utilizator,
                            Nume = u.Nume,
                            Prenume = u.Prenume,
                            Email = u.Email,
                            EsteActiv = u.EsteActiv
                        })
                        .OrderBy(u => u.Nume)
                        .ThenBy(u => u.Prenume)
                        .ToList();

                    return JsonConvert.SerializeObject(new { success = true, users = users });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea utilizatorilor" });
            }
        }

        [WebMethod]
        public static string GetUserAnalyticsData(int userId)
        {
            try
            {
                using (var context = new AppContext())
                {
                    // Get activity logs
                    var logRepository = new LogActivitateRepository();
                    var activityLogs = logRepository.GetAll()
                        .Where(l => l.Id_Utilizator == userId)
                        .OrderByDescending(l => l.DataInregistrare)
                        .ToList();

                    // Get favorites
                    var favoriteRepository = new FavoriteRepository();
                    var favorites = favoriteRepository.GetAll()
                        .Where(f => f.Id_Utilizator == userId)
                        .ToList();

                    // Generate Recommendation Scores for Analytics
                    var recService = new RecommendationService();
                    var userCategories = recService.GetEntityScores(userId, TipEntitate.CategorieVacanta);
                    var userDestinations = recService.GetEntityScores(userId, TipEntitate.Destinatie);

                    var catRepo = new CategorieVacantaRepository();
                    var destRepo = new DestinatieRepository();

                    var categoriesDistribution = userCategories
                        .Select(kvp => new { category = catRepo.GetById(kvp.Key)?.Denumire ?? "Necunoscut", count = kvp.Value })
                        .OrderByDescending(x => x.count)
                        .Take(10)
                        .ToList();

                    var destinationsDistribution = userDestinations
                        .Select(kvp => new { destination = destRepo.GetById(kvp.Key)?.Denumire ?? "Necunoscut", count = kvp.Value })
                        .OrderByDescending(x => x.count)
                        .Take(10)
                        .ToList();

                    // Prepare analytics data
                    var analytics = new
                    {
                        // Quick Stats
                        totalFavorites = favorites.Count,
                        totalActivities = activityLogs.Count,
                        lastActivity = activityLogs.FirstOrDefault()?.DataInregistrare?.ToString("dd/MM/yyyy HH:mm"),

                        // Activity Types Distribution
                        activityDistribution = activityLogs
                            .GroupBy(a => a.TipActivitate ?? "Necunoscut")
                            .Select(g => new { activity = g.Key, count = g.Count() })
                            .OrderByDescending(x => x.count)
                            .ToList(),

                        categoriesDistribution = categoriesDistribution,
                        destinationsDistribution = destinationsDistribution
                    };

                    return JsonConvert.SerializeObject(new { success = true, data = analytics });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea datelor de analiză", error = ex.Message });
            }
        }

        [WebMethod]
        public static string GenerateUserInsights(int userId)
        {
            try
            {
                var recService = new WebAdminDashboard.Classes.Library.RecommendationService();

                var topDest = recService.GetRecommendedDestinations(userId, 1).FirstOrDefault();
                var topCat = recService.GetRecommendedCategories(userId, 1).FirstOrDefault();

                var insights = new
                {
                    destinationInsight = topDest != null ? $"Pe baza istoricului de activitate, cea mai recomandată destinație pentru acest utilizator este {topDest.Denumire} ({topDest.Tara})." : "Nu există suficiente date pentru a sugera o destinație.",
                    categoryInsight = topCat != null ? $"Utilizatorul prezintă un mare interes pentru vacanțele de tipul: {topCat.Denumire}." : "Nu există suficiente interacțiuni pentru a determina o categorie de vacanță preferată."
                };

                return JsonConvert.SerializeObject(new { success = true, insights = insights });
            }
            catch (Exception)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la generarea insight-urilor" });
            }
        }

        [WebMethod]
        public static string GetGlobalModelPerformanceStats()
        {
            try
            {
                using (var context = new AppContext())
                {
                    var allRecords = context.ModelPerformanta.ToList();

                    if (!allRecords.Any())
                    {
                        return JsonConvert.SerializeObject(new { success = false, message = "Nu există date de performanță" });
                    }

                    var totalRequests = allRecords.Count;

                    var rated = allRecords.Where(r => r.ApreciereUser.HasValue).ToList();
                    var totalRated = rated.Count;
                    var totalLikes = rated.Count(r => r.ApreciereUser == 1);
                    var satisfactionRate = totalRated > 0 ? Math.Round((double)totalLikes / totalRated * 100, 1) : 0;

                    var modelComparison = allRecords
                        .GroupBy(r => r.NumeModel ?? "Necunoscut")
                        .Select(g =>
                        {
                            var gDur = g.Where(r => r.SecundeDurate.HasValue).ToList();
                            var gTokIn = g.Where(r => r.TokenInput.HasValue).ToList();
                            var gTokOut = g.Where(r => r.TokenOutput.HasValue).ToList();
                            var gRated = g.Where(r => r.ApreciereUser.HasValue).ToList();
                            var gLikes = gRated.Count(r => r.ApreciereUser == 1);
                            var gDislikes = gRated.Count(r => r.ApreciereUser == 0);
                            var gTotalRated = gRated.Count;
                            return new
                            {
                                model = g.Key,
                                count = g.Count(),
                                avgDuration = gDur.Any() ? Math.Round((double)gDur.Average(r => r.SecundeDurate.Value), 2) : 0,
                                avgTokenInput = gTokIn.Any() ? Math.Round(gTokIn.Average(r => (double)r.TokenInput.Value), 0) : 0,
                                avgTokenOutput = gTokOut.Any() ? Math.Round(gTokOut.Average(r => (double)r.TokenOutput.Value), 0) : 0,
                                totalTokens = gTokIn.Sum(r => r.TokenInput.Value) + gTokOut.Sum(r => r.TokenOutput.Value),
                                likes = gLikes,
                                dislikes = gDislikes,
                                satisfaction = gTotalRated > 0 ? Math.Round((double)gLikes / gTotalRated * 100, 1) : -1
                            };
                        })
                        .OrderByDescending(x => x.count)
                        .ToList();

                    var stats = new
                    {
                        totalRequests,
                        totalModels = modelComparison.Count,
                        satisfactionRate,
                        modelComparison
                    };

                    return JsonConvert.SerializeObject(new { success = true, data = stats });
                }
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea statisticilor globale", error = ex.Message });
            }
        }
    }
}