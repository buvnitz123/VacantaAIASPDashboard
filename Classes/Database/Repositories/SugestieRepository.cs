using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class SugestieRepository : IRepository<Sugestie>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public SugestieRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<Sugestie> GetAll()
        {
            return _context.Sugestii.ToList();
        }

        public Sugestie GetById(int id)
        {
            return _context.Sugestii.Find(id);
        }

        public void Insert(Sugestie entity)
        {
            _context.Sugestii.Add(entity);
            _context.SaveChanges();
        }

        public void Update(Sugestie entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.Sugestii.Remove(entity);
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
