using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class AppSettingsRepository : IRepository<AppSettings>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public AppSettingsRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<AppSettings> GetAll()
        {
            return _context.AppSettings.ToList();
        }

        public AppSettings GetById(int id)
        {
            throw new NotImplementedException("AppSettings uses string key. Use GetByKey instead.");
        }

        public AppSettings GetByKey(string key)
        {
            return _context.AppSettings.Find(key);
        }

        public void Insert(AppSettings entity)
        {
            _context.AppSettings.Add(entity);
            _context.SaveChanges();
        }

        public void Update(AppSettings entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            throw new NotImplementedException("AppSettings uses string key. Use DeleteByKey instead.");
        }

        public void DeleteByKey(string key)
        {
            var entity = GetByKey(key);
            if (entity != null)
            {
                _context.AppSettings.Remove(entity);
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
            }
            _disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
