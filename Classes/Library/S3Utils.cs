using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;

namespace WebAdminDashboard.Classes.Library
{
    // Azure Blob implementation keeping original S3Utils method signatures.
    public static class S3Utils
    {
        private static readonly Lazy<BlobContainerClient> _containerLazy =
            new Lazy<BlobContainerClient>(InitContainer, isThreadSafe: true);

        private static BlobContainerClient Container => _containerLazy.Value;

        private static BlobContainerClient InitContainer()
        {
            var conn = EncryptionUtils.Decrypt(GetSetting("AzureBlobConnectionString"));
            var name = GetSetting("AzureBlobContainerName");
            var makePublic = (GetSetting("AzureBlobPublic") ?? "true")
                .Equals("true", StringComparison.OrdinalIgnoreCase);

            if (string.IsNullOrWhiteSpace(conn))
                throw new InvalidOperationException("AzureBlobConnectionString missing in appSettings.");

            var container = new BlobContainerClient(conn, name);
            container.CreateIfNotExists();

            try
            {
                var props = container.GetProperties();
                var isPublic = props.Value.PublicAccess == PublicAccessType.Blob ||
                               props.Value.PublicAccess == PublicAccessType.BlobContainer;

                if (makePublic && !isPublic)
                    container.SetAccessPolicy(PublicAccessType.Blob);
                else if (!makePublic && isPublic)
                    container.SetAccessPolicy(PublicAccessType.None);
            }
            catch
            {
                // Swallow silently; adjust if you add logging
            }

            return container;
        }

        private static string GetSetting(string key) =>
            System.Configuration.ConfigurationManager.AppSettings[key];

        // Accepts raw base64 or data URI
        public static byte[] ConvertBase64ToBytes(string base64)
        {
            if (string.IsNullOrWhiteSpace(base64)) return null;

            var comma = base64.IndexOf(',');
            if (comma >= 0)
                base64 = base64.Substring(comma + 1);

            try { return Convert.FromBase64String(base64); }
            catch { return null; }
        }

        public static string GetContentTypeFromFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName)) return "application/octet-stream";
            switch (Path.GetExtension(fileName).ToLowerInvariant())
            {
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".png": return "image/png";
                case ".gif": return "image/gif";
                case ".webp": return "image/webp";
                default: return "application/octet-stream";
            }
        }

        public static bool IsValidImageType(string contentType)
        {
            if (string.IsNullOrWhiteSpace(contentType)) return false;
            var allowed = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            return allowed.Contains(contentType.ToLowerInvariant());
        }

        public static string UploadImage(byte[] data, string fileName, string contentType)
        {
            if (data == null || data.Length == 0) return null;

            var blobName = SanitizeBlobName(fileName);
            var blob = Container.GetBlobClient(blobName);

            contentType = string.IsNullOrWhiteSpace(contentType)
                ? GetContentTypeFromFileName(fileName)
                : contentType;

            using (var ms = new MemoryStream(data, writable: false))
            {
                blob.Upload(ms, new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders
                    {
                        ContentType = contentType,
                        CacheControl = "public, max-age=31536000"
                    }
                });
            }

            // If container private, return a short SAS so UI still works
            if (!IsContainerPublic())
                return GetReadSasUrl(blob, TimeSpan.FromHours(1));

            return blob.Uri.ToString();
        }

        public static void DeleteImage(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl)) return;

            try
            {
                var baseUri = Container.Uri.ToString().TrimEnd('/');
                if (!imageUrl.StartsWith(baseUri, StringComparison.OrdinalIgnoreCase))
                    return;

                var relative = imageUrl.Substring(baseUri.Length).TrimStart('/');
                var q = relative.IndexOf('?');
                if (q >= 0) relative = relative.Substring(0, q);

                var blob = Container.GetBlobClient(relative);
                blob.DeleteIfExists(DeleteSnapshotsOption.IncludeSnapshots);
            }
            catch
            {
                // Silent; optionally log
            }
        }

        private static bool IsContainerPublic()
        {
            try
            {
                var props = Container.GetProperties();
                return props.Value.PublicAccess == PublicAccessType.Blob ||
                       props.Value.PublicAccess == PublicAccessType.BlobContainer;
            }
            catch { return false; }
        }

        private static string GetReadSasUrl(BlobClient blob, TimeSpan life)
        {
            if (!blob.CanGenerateSasUri) return blob.Uri.ToString();

            var builder = new BlobSasBuilder
            {
                BlobContainerName = blob.BlobContainerName,
                BlobName = blob.Name,
                Resource = "b",
                ExpiresOn = DateTimeOffset.UtcNow.Add(life)
            };
            builder.SetPermissions(BlobSasPermissions.Read);

            return blob.GenerateSasUri(builder).ToString();
        }

        private static string SanitizeBlobName(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                raw = Guid.NewGuid().ToString("N");

            raw = raw.Replace('\\', '/').TrimStart('/');

            var parts = raw
                .Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(SanitizeSegment);

            return string.Join("/", parts);
        }

        private static string SanitizeSegment(string segment)
        {
            if (segment.Length > 255)
                segment = segment.Substring(0, 255);

            segment = Regex.Replace(segment, @"[^a-zA-Z0-9_\-\.]", "_");
            return string.IsNullOrWhiteSpace(segment)
                ? Guid.NewGuid().ToString("N")
                : segment;
        }
    }
}