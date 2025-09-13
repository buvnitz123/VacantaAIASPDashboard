using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Interfaces;

namespace WebAdminDashboard.Classes.Database.Repositories
{
    public class ImaginiPunctDeInteresRepository : IRepository<ImaginiPunctDeInteres>, IDisposable
    {
        private readonly AppContext _context;
        private bool _disposed = false;

        public ImaginiPunctDeInteresRepository()
        {
            _context = new AppContext();
        }

        public IEnumerable<ImaginiPunctDeInteres> GetAll()
        {
            return _context.ImaginiPunctDeInteres.ToList();
        }

        public ImaginiPunctDeInteres GetById(int id)
        {
            // ImaginiPunctDeInteres are cheie compusă, deci GetById nu este aplicabil direct
            // Returnăm null pentru a indica că această operație nu este suportată
            return null;
        }

        // Metoda specializată pentru cheia compusă
        public ImaginiPunctDeInteres GetByCompositeKey(int punctDeInteresId, int imagineId)
        {
            return _context.ImaginiPunctDeInteres
                .FirstOrDefault(i => i.Id_PunctDeInteres == punctDeInteresId && i.Id_ImaginiPunctDeInteres == imagineId);
        }

        // Metodă pentru a obține următorul ID automat pentru imagini pentru un punct de interes
        public int GetNextImageId(int punctDeInteresId)
        {
            var maxId = _context.ImaginiPunctDeInteres
                .Where(i => i.Id_PunctDeInteres == punctDeInteresId)
                .Select(i => (int?)i.Id_ImaginiPunctDeInteres)
                .Max();
            
            return (maxId ?? 0) + 1;
        }

        // Metodă pentru a obține toate imaginile pentru un punct de interes
        public IEnumerable<ImaginiPunctDeInteres> GetByPunctDeInteres(int punctDeInteresId)
        {
            return _context.ImaginiPunctDeInteres
                .Where(i => i.Id_PunctDeInteres == punctDeInteresId)
                .ToList();
        }

        public void Insert(ImaginiPunctDeInteres entity)
        {
            // Dacă ID-ul imaginii nu este setat, generez unul automat
            if (entity.Id_ImaginiPunctDeInteres == 0)
            {
                entity.Id_ImaginiPunctDeInteres = GetNextImageId(entity.Id_PunctDeInteres);
            }
            
            _context.ImaginiPunctDeInteres.Add(entity);
            _context.SaveChanges();
        }

        public void Update(ImaginiPunctDeInteres entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            // Pentru cheia compusă, această metodă nu este aplicabilă direct
            // Folosește DeleteByCompositeKey sau DeleteByImageId
        }

        // Metodă specializată pentru ștergerea prin cheia compusă
        public void DeleteByCompositeKey(int punctDeInteresId, int imagineId)
        {
            var entity = GetByCompositeKey(punctDeInteresId, imagineId);
            if (entity != null)
            {
                _context.ImaginiPunctDeInteres.Remove(entity);
                _context.SaveChanges();
            }
        }

        // Metodă pentru ștergerea prin ID-ul imaginii (mai ușor de folosit)
        public void DeleteByImageId(int imagineId)
        {
            var entity = _context.ImaginiPunctDeInteres
                .FirstOrDefault(i => i.Id_ImaginiPunctDeInteres == imagineId);
            if (entity != null)
            {
                _context.ImaginiPunctDeInteres.Remove(entity);
                _context.SaveChanges();
            }
        }

        // Metodă pentru ștergerea tuturor imaginilor unui punct de interes
        public void DeleteAllByPunctDeInteres(int punctDeInteresId)
        {
            var imagini = _context.ImaginiPunctDeInteres
                .Where(i => i.Id_PunctDeInteres == punctDeInteresId)
                .ToList();
            
            if (imagini.Any())
            {
                _context.ImaginiPunctDeInteres.RemoveRange(imagini);
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
