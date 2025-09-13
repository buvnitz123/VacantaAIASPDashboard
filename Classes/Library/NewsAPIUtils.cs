using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace WebAdminDashboard.Classes.Library
{
    public class NewsAPIUtils
    {
        private readonly string _apiKey;
        private readonly string _baseUrl = "https://newsapi.org/v2";
        private readonly HttpClient _httpClient;

        public NewsAPIUtils(string apiKey)
        {
            _apiKey = apiKey;
            _httpClient = new HttpClient();
        }

        public async Task<NewsResponse> GetTravelNewsAsync(string category = "travel", int page = 1, int pageSize = 10)
        {
            try
            {
                var query = GetCategoryQuery(category);
                var url = $"{_baseUrl}/everything?q={Uri.EscapeDataString(query)}&language=en&sortBy=publishedAt&page={page}&pageSize={pageSize}&apiKey={_apiKey}";
                
                var response = await _httpClient.GetStringAsync(url);
                return JsonConvert.DeserializeObject<NewsResponse>(response);
            }
            catch (Exception ex)
            {
                throw new Exception($"Eroare la ob?inerea ?tirilor: {ex.Message}");
            }
        }

        public async Task<NewsResponse> GetTopHeadlinesAsync(string country = "us", string category = null)
        {
            try
            {
                var url = $"{_baseUrl}/top-headlines?country={country}&apiKey={_apiKey}";
                if (!string.IsNullOrEmpty(category))
                {
                    url += $"&category={category}";
                }

                var response = await _httpClient.GetStringAsync(url);
                return JsonConvert.DeserializeObject<NewsResponse>(response);
            }
            catch (Exception ex)
            {
                throw new Exception($"Eroare la ob?inerea ?tirilor principale: {ex.Message}");
            }
        }

        private string GetCategoryQuery(string category)
        {
            var queries = new Dictionary<string, string>
            {
                { "travel", "travel OR trip OR vacation OR holiday OR tourism" },
                { "tourism", "tourism OR tourist OR destination OR travel industry" },
                { "vacation", "vacation OR holiday OR getaway OR leisure travel" },
                { "destinations", "travel destination OR tourist attraction OR places to visit" }
            };

            return queries.ContainsKey(category) ? queries[category] : queries["travel"];
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }

    // News Data Models
    public class NewsResponse
    {
        public string Status { get; set; }
        public int TotalResults { get; set; }
        public List<NewsArticle> Articles { get; set; }
        public string Code { get; set; }
        public string Message { get; set; }
    }

    public class NewsArticle
    {
        public NewsSource Source { get; set; }
        public string Author { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public string UrlToImage { get; set; }
        public DateTime PublishedAt { get; set; }
        public string Content { get; set; }
    }

    public class NewsSource
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    // Travel Tips Class for Static Content
    public static class TravelTips
    {
        public static List<TravelTip> GetTravelTips()
        {
            return new List<TravelTip>
            {
                new TravelTip
                {
                    Icon = "fas fa-suitcase",
                    Title = "Bagajul Perfect",
                    Description = "Împacheteaz? inteligent! Folose?te cuburi de ambalare ?i f? o list? pentru a nu uita nimic important.",
                    Category = "Packing"
                },
                new TravelTip
                {
                    Icon = "fas fa-passport",
                    Title = "Documente de C?l?torie",
                    Description = "Verific? validitatea pa?aportului cu 6 luni înainte. F? copii digitale ale documentelor importante.",
                    Category = "Documents"
                },
                new TravelTip
                {
                    Icon = "fas fa-shield-alt",
                    Title = "Siguranta in Calatorie",
                    Description = "Informeaza-te despre situatia din destinatie si ia o asigurare de calatorie pentru orice eventualitate.",
                    Category = "Safety"
                },
                new TravelTip
                {
                    Icon = "fas fa-money-bill-wave",
                    Title = "Bugetul de Vacanta",
                    Description = "Planifica un buget realist si pastreaza 20% pentru cheltuieli neprevazute. Compara preturile online.",
                    Category = "Budget"
                },
                new TravelTip
                {
                    Icon = "fas fa-map-marked-alt",
                    Title = "Planificarea Itinerarului",
                    Description = "Creeaza un itinerar flexibil. Lasa timp liber pentru descoperiri spontane si odihna.",
                    Category = "Planning"
                },
                new TravelTip
                {
                    Icon = "fas fa-mobile-alt",
                    Title = "Tehnologia in Calatorie",
                    Description = "Descarca aplicatii offline pentru harti si traduceri. Pastreaza power bank-ul incarcat.",
                    Category = "Technology"
                }
            };
        }
    }

    public class TravelTip
    {
        public string Icon { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
    }
}