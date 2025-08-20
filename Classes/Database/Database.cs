using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using WebAdminDashboard.Classes.DTO;

namespace WebAdminDashboard.Classes.Database
{
    public class Database
    {
        //singleton
        private static Database _instance;

        public static Database Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new Database();
                }
                return _instance;
            }
        }

        private Database()
        {
            //private constructor to prevent instantiation
        }
        public List<Utilizator> GetUtilizatori()
        {
            using (var context = new AppContext())
            {
                return context.Utilizatori.ToList();
            }
        }

        public List<CategorieVacanta> GetCategoriiVacanta()
        {
            using (var context = new AppContext())
            {
                return context.CategoriiVacanta.ToList();
            }
        }

        public List<Destinatie> GetDestinatiiVacanta()
        {
            using (var context = new AppContext())
            {
                return context.Destinatii.ToList();
            }
        }

        public List<Facilitate> GetFacilitati()
        {
            using (var context = new AppContext())
            {
                return context.Facilitati.ToList();
            }
        }

        public List<PunctDeInteres> GetPuncteInteres()
        {
            using (var context = new AppContext())
            {
                return context.PuncteDeInteres.ToList();
            }
        }

        public List<Sugestie> GetSugestii()
        {
            using (var context = new AppContext())
            {
                return context.Sugestii.ToList();
            }
        }
    }
}