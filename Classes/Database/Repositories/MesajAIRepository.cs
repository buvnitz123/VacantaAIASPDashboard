using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class MesajAIRepository : IRepository<MesajAI>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public MesajAIRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<MesajAI> GetAll()
        {
            return _context.MesajeAI.ToList();
        }

        public MesajAI GetById(int id)
        {
            return _context.MesajeAI.Find(id);
        }

        public void Insert(MesajAI entity)
        {
            _context.MesajeAI.Add(entity);
            _context.SaveChanges();
        }

        public void Update(MesajAI entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.MesajeAI.Remove(entity);
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
