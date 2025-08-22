using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class DestinatieRepository : IRepository<Destinatie>
    {
        private readonly AppContext _context;

        public DestinatieRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<Destinatie> GetAll()
        {
            return _context.Destinatii.ToList();
        }

        public Destinatie GetById(int id)
        {
            return _context.Destinatii.Find(id);
        }

        public void Insert(Destinatie entity)
        {
            _context.Destinatii.Add(entity);
            _context.SaveChanges();
        }

        public void Update(Destinatie entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.Destinatii.Remove(entity);
                _context.SaveChanges();
            }
        }
    }
}
