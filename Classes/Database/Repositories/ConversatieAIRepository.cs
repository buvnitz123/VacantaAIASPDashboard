using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class ConversatieAIRepository : IRepository<ConversatieAI>
    {
        private readonly AppContext _context;

        public ConversatieAIRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<ConversatieAI> GetAll()
        {
            return _context.ConversatiiAI.ToList();
        }

        public ConversatieAI GetById(int id)
        {
            return _context.ConversatiiAI.Find(id);
        }

        public void Insert(ConversatieAI entity)
        {
            _context.ConversatiiAI.Add(entity);
            _context.SaveChanges();
        }

        public void Update(ConversatieAI entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = GetById(id);
            if (entity != null)
            {
                _context.ConversatiiAI.Remove(entity);
                _context.SaveChanges();
            }
        }
    }
}
