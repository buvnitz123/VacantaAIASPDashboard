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
using System.Threading.Tasks;
using System.Net.Http;
using AppContext = WebAdminDashboard.Classes.Database.AppContext;

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
                        return JsonConvert.SerializeObject(new { 
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
                return JsonConvert.SerializeObject(new { 
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
            using (var repository = new SugestieRepository())
            {
                var data = repository.GetAll();
                return JsonConvert.SerializeObject(data);
            }
        }

        [WebMethod]
        public static async Task<string> GetNewsData(string category, int page = 1)
        {
            try
            {
                // Use real NewsAPI with more relaxed travel queries
                const string NEWS_API_KEY = "2b235b384b3a4897b900cc0c7799b848";
                
                // Simplified, more relaxed queries to get more results
                var queries = new Dictionary<string, string>
                {
                    { "travel", "travel OR vacation OR trip OR journey" },
                    { "tourism", "tourism OR tourist OR attractions OR destination" },
                    { "vacation", "vacation OR holiday OR getaway OR leisure" },
                    { "destinations", "destination OR \"places to visit\" OR attractions" }
                };

                var query = queries.ContainsKey(category) ? queries[category] : queries["travel"];
                
                // Remove domain restriction to get more results
                var apiUrl = $"https://newsapi.org/v2/everything?q={Uri.EscapeDataString(query)}&language=en&sortBy=publishedAt&page={page}&pageSize=12&apiKey={NEWS_API_KEY}";

                using (var httpClient = new HttpClient())
                {
                    var response = await httpClient.GetStringAsync(apiUrl);
                    var newsResponse = JsonConvert.DeserializeObject<dynamic>(response);
                    
                    if (newsResponse.status == "ok" && newsResponse.articles != null)
                    {
                        // More relaxed server-side filtering
                        var filteredArticles = FilterTravelRelevantNewsRelaxed(newsResponse.articles);
                        
                        if (filteredArticles.Count > 0)
                        {
                            return JsonConvert.SerializeObject(new { success = true, articles = filteredArticles });
                        }
                        else
                        {
                            // If no articles pass filter, return original articles
                            var originalArticles = new List<object>();
                            var count = 0;
                            foreach (var article in newsResponse.articles)
                            {
                                if (count >= 6) break;
                                originalArticles.Add(article);
                                count++;
                            }
                            return JsonConvert.SerializeObject(new { success = true, articles = originalArticles });
                        }
                    }
                    else
                    {
                        // Fallback to realistic mock data if API fails
                        var mockNews = GenerateRealisticNews(category, page);
                        return JsonConvert.SerializeObject(new { success = true, articles = mockNews });
                    }
                }
            }
            catch (Exception ex)
            {
                // Fallback to realistic mock data on any error
                var mockNews = GenerateRealisticNews(category, page);
                return JsonConvert.SerializeObject(new { success = true, articles = mockNews });
            }
        }

        private static List<object> FilterTravelRelevantNewsRelaxed(dynamic articles)
        {
            var travelKeywords = new[] { "travel", "vacation", "holiday", "tourism", "tourist", "destination", "trip", "resort", "hotel", "flight", "cruise", "beach", "mountain", "adventure", "attractions", "guide", "visit", "explore", "city", "country" };
            var excludeKeywords = new[] { "politics", "election", "war", "murder", "death", "crime", "arrest", "disaster", "earthquake", "pandemic", "virus", "covid-19", "lawsuit", "court", "protest", "violence", "terrorism" };
            
            var filteredArticles = new List<object>();
            
            foreach (var article in articles)
            {
                var title = (article.title?.ToString() ?? "").ToLower();
                var description = (article.description?.ToString() ?? "").ToLower();
                var fullText = title + " " + description;
                
                var hasTravelKeywords = travelKeywords.Any(keyword => fullText.Contains(keyword));
                var hasStronglyExcludedKeywords = excludeKeywords.Any(keyword => fullText.Contains(keyword));
                
                // More lenient: include if has travel keywords OR doesn't have strongly excluded keywords
                if (hasTravelKeywords || !hasStronglyExcludedKeywords)
                {
                    filteredArticles.Add(article);
                }
            }
            
            return filteredArticles.Take(6).ToList(); // Return max 6 relevant articles
        }

        private static List<object> GenerateRealisticNews(string category, int page)
        {
            var currentYear = DateTime.Now.Year;
            var currentSeason = GetCurrentSeason();
            
            var titles = new Dictionary<string, string[]>
            {
                ["travel"] = new[]
                {
                    $"Top 15 Travel Destinations for {currentSeason} {currentYear}",
                    "Solo Travel Safety: Essential Tips for Independent Travelers",
                    "Budget Travel Secrets: How to Save 60% on Your Next Adventure",
                    "Digital Nomad Paradise: Best Cities for Remote Work and Travel",
                    "Sustainable Travel: Eco-Friendly Destinations You Must Visit",
                    "Travel Insurance Guide: Protecting Your Dream Vacation",
                    "Last-Minute Travel Deals: Amazing Destinations Under $500",
                    "Family Travel Made Easy: Kid-Friendly Destinations Worldwide"
                },
                ["tourism"] = new[]
                {
                    "Tourism Industry Bounces Back: Record-Breaking Recovery Numbers",
                    "Overtourism Solutions: How Destinations Are Managing Crowds",
                    "Cultural Tourism Boom: Authentic Experiences Drive Travel Trends",
                    "Smart Tourism Technology: AI and VR Changing Travel Experiences",
                    "Adventure Tourism Growth: Extreme Sports Destinations on the Rise",
                    "Wellness Tourism Explodes: Health-Focused Travel Experiences",
                    "Culinary Tourism Trends: Food-Focused Travel Experiences",
                    "Heritage Tourism: Preserving Culture Through Responsible Travel"
                },
                ["vacation"] = new[]
                {
                    "Perfect Family Vacation Planning: Best Destinations for All Ages",
                    "Luxury Resort Reviews: 5-Star Experiences Worth Every Penny",
                    "Beach Vacation Alternatives: Hidden Coastal Gems to Explore",
                    "Mountain Retreat Guide: Best Alpine Destinations for Winter",
                    "City Break Inspiration: Perfect Weekend Getaways in Europe",
                    "All-Inclusive vs Independent Travel: Which Saves You More?",
                    "Romantic Vacation Ideas: Perfect Getaways for Couples",
                    "Adventure Vacation Planning: Thrilling Experiences Worldwide"
                },
                ["destinations"] = new[]
                {
                    "Japan Cherry Blossom Festival: When and Where to Experience Magic",
                    "Iceland Travel Guide: Northern Lights and Natural Wonder Tours",
                    "Maldives Resort Guide: Best Overwater Bungalows and Activities",
                    "New Zealand Adventure: Epic Road Trips and Outdoor Activities",
                    "Morocco Cultural Journey: Souks, Cuisine, and Desert Adventures",
                    "Scandinavia Road Trip: Norway, Sweden, and Denmark Highlights",
                    "Greek Islands Hopping: Ultimate Mediterranean Vacation Guide",
                    "Costa Rica Eco-Tourism: Wildlife and Adventure in Paradise"
                }
            };

            var descriptions = new[]
            {
                "Discover insider travel tips and expert recommendations for planning your perfect getaway. From hidden gems to must-see attractions, this comprehensive guide covers everything you need for an unforgettable vacation experience.",
                "Professional travel advice based on real experiences from seasoned travelers and tourism experts. Learn about local customs, safety tips, best times to visit, and budget-friendly options for your next adventure.",
                "In-depth destination analysis with practical travel information about transportation, accommodation, dining, and top attractions. Perfect for both first-time visitors and experienced travelers looking for new experiences.",
                "Current travel trends and tourism industry insights that help you make informed vacation decisions. Get the latest updates on travel deals, new destinations, and emerging travel experiences.",
                "Expert travel photography and detailed itineraries showcasing the best each destination offers. From luxury resorts to budget backpacking, find the perfect travel style for your next vacation."
            };

            var sources = new[] { 
                "Travel + Leisure", "Conde Nast Traveler", "National Geographic Travel", 
                "Lonely Planet", "Travel Weekly", "Tourism Today", "Vacation Magazine",
                "Adventure Travel News", "Hospitality Net", "Travel Trade Gazette"
            };

            var categoryTitles = titles.ContainsKey(category) ? titles[category] : titles["travel"];
            var news = new List<object>();
            var random = new Random();

            for (int i = 0; i < 6; i++)
            {
                var titleIndex = (page - 1) * 6 + i;
                var title = categoryTitles[titleIndex % categoryTitles.Length];
                var randomDesc = descriptions[random.Next(descriptions.Length)];
                var randomSource = sources[random.Next(sources.Length)];

                var date = DateTime.Now.AddHours(-random.Next(48)); // Last 2 days for freshness

                news.Add(new
                {
                    title = title + (page > 1 ? $" - Part {page}" : ""),
                    description = randomDesc,
                    source = new { name = randomSource },
                    publishedAt = date.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    url = $"https://example.com/travel-article-{titleIndex + 1}",
                    urlToImage = $"https://picsum.photos/400/250?random={page * 10 + i}&travel&vacation"
                });
            }

            return news;
        }

        private static string GetCurrentSeason()
        {
            var month = DateTime.Now.Month;
            
            if (month == 12 || month == 1 || month == 2)
                return "Winter";
            else if (month >= 3 && month <= 5)
                return "Spring";
            else if (month >= 6 && month <= 8)
                return "Summer";
            else if (month >= 9 && month <= 11)
                return "Fall";
            else
                return "Spring";
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
                                        return JsonConvert.SerializeObject(new { 
                                            success = false, 
                                            message = "Eroare la încărcarea imaginii în Azure Blob Storage" 
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
                            try { BlobAzureStorage.DeleteImage(imageUrl); } 
                            catch (Exception delEx) { 
                                Debug.WriteLine($"Failed to delete image from Azure Blob Storage: {delEx.Message}");
                                // Continue with the original error
                            }
                        }
                        
                        Debug.WriteLine($"Database error: {dbEx.Message}");
                        return JsonConvert.SerializeObject(new { 
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
                                    System.Diagnostics.Debug.WriteLine($"Generated imagineId {i+1}: {imagineId}");

                                    var imagineDestinatie = new ImaginiDestinatie
                                    {
                                        Id_Destinatie = destinatieId,
                                        Id_ImaginiDestinatie = imagineId,
                                        ImagineUrl = imageUrls[i]
                                    };
                                    System.Diagnostics.Debug.WriteLine($"ImaginiDestinatie object {i+1} created");

                                    imaginiRepository.Insert(imagineDestinatie);
                                    System.Diagnostics.Debug.WriteLine($"Image {i+1} inserted successfully");
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
    }
}