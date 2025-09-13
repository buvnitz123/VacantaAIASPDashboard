using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class PunctDeInteresRepository : IRepository<PunctDeInteres>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public PunctDeInteresRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<PunctDeInteres> GetAll()
        {
            return _context.PuncteDeInteres.ToList();
        }

        public PunctDeInteres GetById(int id)
        {
            return _context.PuncteDeInteres.Find(id);
        }

        public void Insert(PunctDeInteres entity)
        {
            _context.PuncteDeInteres.Add(entity);
            _context.SaveChanges();
        }

        public void Update(PunctDeInteres entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.PuncteDeInteres.Remove(entity);
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
