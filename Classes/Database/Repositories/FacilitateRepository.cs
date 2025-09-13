using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class FacilitateRepository : IRepository<Facilitate>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public FacilitateRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<Facilitate> GetAll()
        {
            return _context.Facilitati.ToList();
        }

        public Facilitate GetById(int id)
        {
            return _context.Facilitati.Find(id);
        }

        public void Insert(Facilitate entity)
        {
            _context.Facilitati.Add(entity);
            _context.SaveChanges();
        }

        public void Update(Facilitate entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.Facilitati.Remove(entity);
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
