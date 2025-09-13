using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class UtilizatorRepository : IRepository<Utilizator>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public UtilizatorRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<Utilizator> GetAll()
        {
            return _context.Utilizatori.ToList();
        }

        public Utilizator GetById(int id)
        {
            return _context.Utilizatori.Find(id);
        }

        public void Insert(Utilizator entity)
        {
            _context.Utilizatori.Add(entity);
            _context.SaveChanges();
        }

        public void Update(Utilizator entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.Utilizatori.Remove(entity);
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
