using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;
using WebAdminDashboard.Classes.Library;
using System.Diagnostics;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class CategorieVacantaRepository : IRepository<CategorieVacanta>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public CategorieVacantaRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<CategorieVacanta> GetAll()
        {
            return _context.CategoriiVacanta.ToList();
        }

        public CategorieVacanta GetById(int id)
        {
            return _context.CategoriiVacanta.Find(id);
        }

        public void Insert(CategorieVacanta entity)
        {
            _context.CategoriiVacanta.Add(entity);
            _context.SaveChanges();
        }

        public void Update(CategorieVacanta entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                // Delete image from Azure Blob Storage if exists
                if (!string.IsNullOrEmpty(entity.ImagineUrl))
                {
                    try
                    {
                        BlobAzureStorage.DeleteImage(entity.ImagineUrl);
                    }
                    catch (System.Exception ex)
                    {
                        // Log error but continue with database deletion
                        Debug.WriteLine($"Failed to delete image from Azure Blob Storage: {ex.Message}");
                    }
                }

                _context.CategoriiVacanta.Remove(entity);
                _context.SaveChanges();
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context?.Dispose();
                }
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
