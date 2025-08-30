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
using WebAdminDashboard.Classes.Library;
using Newtonsoft.Json;
using System.Diagnostics;
using System.IO;

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
            try
            {
                var data = new FacilitateRepository().GetAll();
                return JsonConvert.SerializeObject(data);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string GetFacilitateById(int id)
        {
            try
            {
                var facilitate = new FacilitateRepository().GetById(id);
                if (facilitate == null)
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Facilitatea nu a fost găsită" });
                }
                return JsonConvert.SerializeObject(facilitate);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = ex.Message });
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

                var repository = new FacilitateRepository();
                
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
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = ex.Message });
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

                var repository = new FacilitateRepository();
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
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = ex.Message });
            }
        }

        [WebMethod]
        public static string DeleteFacilitate(int id)
        {
            try
            {
                var repository = new FacilitateRepository();
                var facilitate = repository.GetById(id);
                
                if (facilitate == null)
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Facilitatea nu a fost găsită" });
                }

                // Verifică dacă există relații în tabelele asociate înainte de ștergere
                var destinatieFacilitateRepo = new DestinatieFacilitateRepository();
                var areRelatii = destinatieFacilitateRepo.GetAll().Any(df => df.Id_Facilitate == id);
                
                if (areRelatii)
                {
                    return JsonConvert.SerializeObject(new { 
                        success = false, 
                        message = "Nu se poate șterge această facilitate deoarece este folosită în alte înregistrări" 
                    });
                }

                repository.Delete(id);
                return JsonConvert.SerializeObject(new { success = true });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { 
                    success = false, 
                    message = "Eroare la ștergerea facilității: " + ex.Message 
                });
            }
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
            try
            {
                Debug.WriteLine("UploadCategorieImage called with fileName: " + fileName + " and categorieId: " + categorieId);
                if (string.IsNullOrEmpty(base64Image) || string.IsNullOrEmpty(fileName))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Parametri invalizi" });
                }

                Debug.WriteLine("Base64 image length: " + base64Image.Length);
                var imageBytes = S3Utils.ConvertBase64ToBytes(base64Image);
                if (imageBytes == null || imageBytes.Length == 0)
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Imagine invalida" });
                }

                // Get content type from filename
                var contentType = S3Utils.GetContentTypeFromFileName(fileName);
                if (!S3Utils.IsValidImageType(contentType))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Tipul de fisier nu este suportat" });
                }

                // Upload to S3
                var imageUrl = S3Utils.UploadImage(imageBytes, fileName, contentType);
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Eroare la incarcarea imaginii" });
                }

                // Update database record if categorieId is provided (for edit)
                if (!string.IsNullOrEmpty(categorieId) && int.TryParse(categorieId, out int id))
                {
                    var repository = new CategorieVacantaRepository();
                    var categorie = repository.GetById(id);
                    if (categorie != null)
                    {
                        // Delete old image if exists
                        if (!string.IsNullOrEmpty(categorie.ImagineUrl))
                        {
                            S3Utils.DeleteImage(categorie.ImagineUrl);
                        }
                        
                        // Update with new image URL
                        categorie.ImagineUrl = imageUrl;
                        repository.Update(categorie);
                    }
                }

                return JsonConvert.SerializeObject(new { success = true, imageUrl = imageUrl, message = "Imagine incarcata cu succes" });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = $"Eroare: {ex.Message}" });
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
                
                // 1. Upload image to S3 first
                if (!string.IsNullOrEmpty(base64Image) && !string.IsNullOrEmpty(fileName))
                {
                    try
                    {
                        Debug.WriteLine("[DEBUG] Starting image conversion from base64");
                        var imageBytes = S3Utils.ConvertBase64ToBytes(base64Image);
                        Debug.WriteLine($"[DEBUG] Image converted to bytes. Length: {imageBytes?.Length ?? 0} bytes");
                        if (imageBytes != null && imageBytes.Length > 0)
                        {
                            var contentType = S3Utils.GetContentTypeFromFileName(fileName);
                            Debug.WriteLine($"[DEBUG] Content type detected: {contentType}");
                            
                            if (S3Utils.IsValidImageType(contentType))
                            {
                                Debug.WriteLine("[DEBUG] Content type is valid. Preparing for S3 upload...");
                                {
                                    var extension = Path.GetExtension(fileName);
                                    var safeDenumire = denumire.Trim().Replace(" ", "_").Replace("-", "_");
                                    var customFileName = $"categories/{categorieId}_{safeDenumire}_categorie{extension}";
                                    Debug.WriteLine($"[DEBUG] Uploading to S3: {customFileName}");
                                    imageUrl = S3Utils.UploadImage(imageBytes, customFileName, contentType);
                                    Debug.WriteLine($"[DEBUG] S3 upload completed. URL: {imageUrl}");
                                    
                                    if (string.IsNullOrEmpty(imageUrl))
                                    {
                                        return JsonConvert.SerializeObject(new { 
                                            success = false, 
                                            message = "Eroare la încărcarea imaginii în S3" 
                                        });
                                    }
                                }
                            }
                            else
                            {
                                return JsonConvert.SerializeObject(new { 
                                    success = false, 
                                    message = "Tip de fișier imagine neacceptat" 
                                });
                            }
                        }
                    }
                    catch (Exception imgEx)
                    {
                        Debug.WriteLine($"Image upload error: {imgEx.Message}");
                        return JsonConvert.SerializeObject(new { 
                            success = false, 
                            message = $"Eroare la procesarea imaginii: {imgEx.Message}" 
                        });
                    }
                }

                // 2. Save to database only after successful S3 upload
                Debug.WriteLine("[DEBUG] Preparing to save to database...");
                var repository = new CategorieVacantaRepository();
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
                    
                    var result = new { 
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
                        try { S3Utils.DeleteImage(imageUrl); } 
                        catch (Exception delEx) { 
                            Debug.WriteLine($"Failed to delete image from S3: {delEx.Message}");
                            // Continue with the original error
                        }
                    }
                    
                    Debug.WriteLine($"Database error: {dbEx.Message}");
                    return JsonConvert.SerializeObject(new { 
                        success = false, 
                        message = $"Eroare la salvarea în baza de date: {dbEx.Message}" 
                    });
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"AddCategorieVacanta error: {ex.Message}");
                Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return JsonConvert.SerializeObject(new { success = false, message = $"Eroare: {ex.Message}" });
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

                var repository = new CategorieVacantaRepository();
                var categorie = repository.GetById(id);
                
                if (categorie == null)
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Categoria nu a fost gasita" });
                }

                categorie.Denumire = newDenumire.Trim();
                repository.Update(categorie);

                return JsonConvert.SerializeObject(new { success = true, message = "Categoria a fost modificata cu succes" });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = $"Eroare: {ex.Message}" });
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

                var repository = new CategorieVacantaRepository();
                repository.Delete(id);

                return JsonConvert.SerializeObject(new { success = true, message = "Categoria a fost stearsa cu succes" });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { success = false, message = $"Eroare: {ex.Message}" });
            }
        }

    }
}