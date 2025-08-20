using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using WebAdminDashboard.Classes.DTO;

namespace WebAdminDashboard.Classes.Database
{
    public class AppContext : DbContext
    {
        public AppContext() : base("name=DbContext") { }

        public DbSet<Utilizator> Utilizatori { get; set; }
        public DbSet<CategorieVacanta> CategoriiVacanta { get; set; }
        public DbSet<Destinatie> Destinatii { get; set; }
        public DbSet<Facilitate> Facilitati { get; set; }
        public DbSet<PunctDeInteres> PuncteDeInteres { get; set; }
        public DbSet<Sugestie> Sugestii { get; set; }
    }
}