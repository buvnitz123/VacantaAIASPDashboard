using System;
using System.Web.UI;
using WebAdminDashboard.Classes.Database.Repositories;
using WebAdminDashboard.Classes.DTO;
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
                
                using (var destinatieRepository = new DestinatieRepository())
                {
                    var destinatie = destinatieRepository.GetById(destinationId);

                    if (destinatie == null)
                    {
                        return JsonConvert.SerializeObject(new { 
                            success = false, 
                            message = "Destinația nu a fost găsită" 
                        });
                    }

                    // Get associated images using a fresh context each time
                    using (var imaginiRepository = new ImaginiDestinatieRepository())
                    {
                        var imagini = imaginiRepository.GetAll()
                            .Where(i => i.Id_Destinatie == destinationId)
                            .ToList();

                        System.Diagnostics.Debug.WriteLine($"Found {imagini.Count} images for destination {destinationId}");

                        // Fix image URLs if they are partial paths and create proper image objects
                        var fixedImageUrls = imagini.Select(img => new
                        {
                            Id = img.Id_ImaginiDestinatie,
                            ImagineUrl = !string.IsNullOrEmpty(img.ImagineUrl) && !img.ImagineUrl.StartsWith("http") 
                                ? "https://vacantaai.blob.core.windows.net/vacantaai/" + img.ImagineUrl 
                                : img.ImagineUrl
                        }).Where(img => !string.IsNullOrEmpty(img.ImagineUrl)).ToList();

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
                                Data_Inregistrare = destinatie.Data_Inregistrare,
                                PretAdult = destinatie.PretAdult,
                                PretMinor = destinatie.PretMinor,
                                Images = fixedImageUrls
                            }
                        };

                        System.Diagnostics.Debug.WriteLine($"Destination details retrieved: {destinatie.Denumire}, Images: {fixedImageUrls.Count}");
                        return JsonConvert.SerializeObject(result);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetDestinationDetails error: {ex.Message}");
                return JsonConvert.SerializeObject(new { 
                    success = false, 
                    message = "Eroare la încărcarea detaliilor destinației" 
                });
            }
        }

        [WebMethod]
        public static string GetPuncteByDestinatie(int destinatieId)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"GetPuncteByDestinatie called with destinatieId: {destinatieId}");
                
                using (var repository = new PunctDeInteresRepository())
                {
                    var puncte = repository.GetAll()
                        .Where(p => p.Id_Destinatie == destinatieId)
                        .ToList();

                    System.Diagnostics.Debug.WriteLine($"Found {puncte.Count} puncte for destination {destinatieId}");

                    var result = puncte.Select(p => new
                    {
                        Id_PunctDeInteres = p.Id_PunctDeInteres,
                        Denumire = p.Denumire ?? "",
                        Descriere = p.Descriere ?? "",
                        Tip = p.Tip ?? "",
                        Id_Destinatie = p.Id_Destinatie
                    }).ToList();

                    var json = JsonConvert.SerializeObject(result);
                    System.Diagnostics.Debug.WriteLine($"Returning JSON: {json}");
                    return json;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetPuncteByDestinatie error: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea punctelor de interes: " + ex.Message });
            }
        }

        [WebMethod]
        public static string AddPunctDeInteres(int destinatieId, string denumire, string tip, string descriere)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"AddPunctDeInteres called: destinatieId={destinatieId}, denumire={denumire}, tip={tip}");
                
                if (string.IsNullOrWhiteSpace(denumire))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Denumirea este obligatorie" });
                }

                if (string.IsNullOrWhiteSpace(tip))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Tipul este obligatoriu" });
                }

                // Generate unique ID using timestamp and random number
                var punctId = Math.Floor(DateTime.Now.Subtract(new DateTime(1970, 1, 1)).TotalSeconds) + new Random().Next(1, 1000);

                using (var repository = new PunctDeInteresRepository())
                {
                    // Check if ID already exists
                    if (repository.GetById((int)punctId) != null)
                    {
                        punctId += new Random().Next(1, 1000);
                    }

                    var punct = new PunctDeInteres
                    {
                        Id_PunctDeInteres = (int)punctId,
                        Denumire = denumire.Trim(),
                        Tip = tip.Trim(),
                        Descriere = !string.IsNullOrWhiteSpace(descriere) ? descriere.Trim() : null,
                        Id_Destinatie = destinatieId
                    };

                    repository.Insert(punct);
                    System.Diagnostics.Debug.WriteLine($"Punct de interes added successfully with ID: {punct.Id_PunctDeInteres}");

                    // Search and save images using Pexels API
                    try
                    {
                        var searchQuery = $"{denumire} {tip}";
                        System.Diagnostics.Debug.WriteLine($"Searching images for query: {searchQuery}");
                        
                        var photoResult = Classes.Library.PhotoAPIUtils.SearchPhotos(searchQuery, 3, 1);
                        
                        if (photoResult != null && photoResult.Photos != null && photoResult.Photos.Count > 0)
                        {
                            System.Diagnostics.Debug.WriteLine($"Found {photoResult.Photos.Count} photos for punct de interes");
                            
                            using (var imaginiRepository = new ImaginiPunctDeInteresRepository())
                            {
                                for (int i = 0; i < photoResult.Photos.Count; i++)
                                {
                                    var photo = photoResult.Photos[i];
                                    
                                    var imagineRecord = new ImaginiPunctDeInteres
                                    {
                                        Id_PunctDeInteres = (int)punctId,
                                        Id_ImaginiPunctDeInteres = 0, // Va fi generat automat de repository
                                        ImagineUrl = photo.Src.Original
                                    };
                                    
                                    imaginiRepository.Insert(imagineRecord);
                                    System.Diagnostics.Debug.WriteLine($"Image {i + 1} saved for punct {punctId}: {photo.Src.Original}");
                                }
                            }
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine("No images found for punct de interes");
                        }
                    }
                    catch (Exception imgEx)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error searching/saving images: {imgEx.Message}");
                        // Don't fail the entire operation if image search fails
                    }

                    return JsonConvert.SerializeObject(new { success = true, id = punct.Id_PunctDeInteres });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"AddPunctDeInteres error: {ex.Message}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la adăugarea punctului de interes: " + ex.Message });
            }
        }

        [WebMethod]
        public static string GetPunctDeInteresById(int id)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"GetPunctDeInteresById called with id: {id}");
                
                using (var repository = new PunctDeInteresRepository())
                {
                    var punct = repository.GetById(id);
                    if (punct == null)
                    {
                        System.Diagnostics.Debug.WriteLine($"Punct de interes not found with id: {id}");
                        return JsonConvert.SerializeObject(new { success = false, message = "Punctul de interes nu a fost găsit" });
                    }

                    // Get associated images
                    using (var imaginiRepository = new ImaginiPunctDeInteresRepository())
                    {
                        var imagini = imaginiRepository.GetByPunctDeInteres(id);

                        var result = new
                        {
                            Id_PunctDeInteres = punct.Id_PunctDeInteres,
                            Denumire = punct.Denumire ?? "",
                            Descriere = punct.Descriere ?? "",
                            Tip = punct.Tip ?? "",
                            Id_Destinatie = punct.Id_Destinatie,
                            Images = imagini.Select(img => new
                            {
                                Id = img.Id_ImaginiPunctDeInteres,
                                ImagineUrl = img.ImagineUrl
                            }).ToList()
                        };

                        return JsonConvert.SerializeObject(result);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetPunctDeInteresById error: {ex.Message}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la încărcarea punctului de interes: " + ex.Message });
            }
        }

        [WebMethod]
        public static string UpdatePunctDeInteres(int id, string denumire, string tip, string descriere)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"UpdatePunctDeInteres called: id={id}, denumire={denumire}, tip={tip}");
                
                if (string.IsNullOrWhiteSpace(denumire))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Denumirea este obligatorie" });
                }

                if (string.IsNullOrWhiteSpace(tip))
                {
                    return JsonConvert.SerializeObject(new { success = false, message = "Tipul este obligatoriu" });
                }

                using (var repository = new PunctDeInteresRepository())
                {
                    var punct = repository.GetById(id);
                    
                    if (punct == null)
                    {
                        System.Diagnostics.Debug.WriteLine($"Punct de interes not found for update with id: {id}");
                        return JsonConvert.SerializeObject(new { success = false, message = "Punctul de interes nu a fost găsit" });
                    }

                    // Check if denumire or tip changed (significant changes that might require new images)
                    bool shouldUpdateImages = !punct.Denumire.Equals(denumire.Trim(), StringComparison.OrdinalIgnoreCase) || 
                                            !punct.Tip.Equals(tip.Trim(), StringComparison.OrdinalIgnoreCase);

                    punct.Denumire = denumire.Trim();
                    punct.Tip = tip.Trim();
                    punct.Descriere = !string.IsNullOrWhiteSpace(descriere) ? descriere.Trim() : null;
                    
                    repository.Update(punct);
                    System.Diagnostics.Debug.WriteLine($"Punct de interes updated successfully with id: {id}");

                    // If name or type changed significantly, update images
                    if (shouldUpdateImages)
                    {
                        System.Diagnostics.Debug.WriteLine($"Significant changes detected, updating images for punct {id}");
                        
                        try
                        {
                            // Delete existing images and add new ones
                            using (var imaginiRepository = new ImaginiPunctDeInteresRepository())
                            {
                                // Delete all existing images for this punct
                                imaginiRepository.DeleteAllByPunctDeInteres(id);
                                System.Diagnostics.Debug.WriteLine($"Deleted existing images for punct {id}");
                                
                                // Search and add new images
                                var searchQuery = $"{denumire} {tip}";
                                var photoResult = Classes.Library.PhotoAPIUtils.SearchPhotos(searchQuery, 3, 1);
                                
                                if (photoResult != null && photoResult.Photos != null && photoResult.Photos.Count > 0)
                                {
                                    for (int i = 0; i < photoResult.Photos.Count; i++)
                                    {
                                        var photo = photoResult.Photos[i];
                                        
                                        var imagineRecord = new ImaginiPunctDeInteres
                                        {
                                            Id_PunctDeInteres = id,
                                            Id_ImaginiPunctDeInteres = 0, // Va fi generat automat
                                            ImagineUrl = photo.Src.Original
                                        };
                                        
                                        imaginiRepository.Insert(imagineRecord);
                                        System.Diagnostics.Debug.WriteLine($"New image {i + 1} saved for updated punct {id}");
                                    }
                                }
                            }
                        }
                        catch (Exception imgEx)
                        {
                            System.Diagnostics.Debug.WriteLine($"Error updating images: {imgEx.Message}");
                            // Don't fail the entire operation if image update fails
                        }
                    }

                    return JsonConvert.SerializeObject(new { success = true });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"UpdatePunctDeInteres error: {ex.Message}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la actualizarea punctului de interes: " + ex.Message });
            }
        }

        [WebMethod]
        public static string DeletePunctDeInteres(int id)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"DeletePunctDeInteres called with id: {id}");
                
                using (var repository = new PunctDeInteresRepository())
                {
                    var punct = repository.GetById(id);
                    
                    if (punct == null)
                    {
                        System.Diagnostics.Debug.WriteLine($"Punct de interes not found for deletion with id: {id}");
                        return JsonConvert.SerializeObject(new { success = false, message = "Punctul de interes nu a fost găsit" });
                    }

                    // First, delete all associated images in cascade
                    using (var imaginiRepository = new ImaginiPunctDeInteresRepository())
                    {
                        imaginiRepository.DeleteAllByPunctDeInteres(id);
                        System.Diagnostics.Debug.WriteLine($"Deleted all images for punct {id}");
                    }
                    
                    // Then delete the punct de interes itself
                    repository.Delete(id);
                    System.Diagnostics.Debug.WriteLine($"Punct de interes deleted successfully with id: {id}");
                    
                    return JsonConvert.SerializeObject(new { success = true });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"DeletePunctDeInteres error: {ex.Message}");
                return JsonConvert.SerializeObject(new { success = false, message = "Eroare la ștergerea punctului de interes: " + ex.Message });
            }
        }
    }
}
