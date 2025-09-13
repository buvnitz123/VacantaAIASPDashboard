using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class PreferinteUtilizatorRepository : IRepository<PreferinteUtilizator>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public PreferinteUtilizatorRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<PreferinteUtilizator> GetAll()
        {
            return _context.PreferinteUtilizator.ToList();
        }

        public PreferinteUtilizator GetById(int id)
        {
            return _context.PreferinteUtilizator.Find(id);
        }

        public void Insert(PreferinteUtilizator entity)
        {
            _context.PreferinteUtilizator.Add(entity);
            _context.SaveChanges();
        }

        public void Update(PreferinteUtilizator entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.PreferinteUtilizator.Remove(entity);
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
