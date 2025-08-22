using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class CategorieVacantaRepository : IRepository<CategorieVacanta>
    {
        private readonly AppContext _context;

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
                _context.CategoriiVacanta.Remove(entity);
                _context.SaveChanges();
            }
        }
    }
}
