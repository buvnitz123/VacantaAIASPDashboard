using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class DestinatieFacilitateRepository : IRepository<DestinatieFacilitate>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public DestinatieFacilitateRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<DestinatieFacilitate> GetAll()
        {
            return _context.DestinatieFacilitate.ToList();
        }

        public DestinatieFacilitate GetById(int id)
        {
            // DestinatieFacilitate are cheie compusă, deci GetById nu este aplicabil direct
            // Returnăm null pentru a indica că această operație nu este suportată
            return null;
        }

        public void Insert(DestinatieFacilitate entity)
        {
            _context.DestinatieFacilitate.Add(entity);
            _context.SaveChanges();
        }

        public void Update(DestinatieFacilitate entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            // DestinatieFacilitate are cheie compusă, deci Delete(int id) nu este aplicabil direct
            // Această metodă ar trebui să primească parametrii cheii compuse
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
