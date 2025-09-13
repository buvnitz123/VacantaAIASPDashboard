using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using WebAdminDashboard.Classes.DTO;
using WebAdminDashboard.Classes.Library;

namespace WebAdminDashboard.Classes.Database
{
    public class AppContext : DbContext
    {
        public AppContext() : base(EncryptionUtils.GetDecryptedConnectionString("DbContext")) { }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CategorieVacanta>()
                .Property(c => c.Id_CategorieVacanta)
                .HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            

            modelBuilder.Entity<Facilitate>()
                .Property(f => f.Id_Facilitate)
                .HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);

            modelBuilder.Entity<Destinatie>()
                .Property(d => d.Id_Destinatie)
                .HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);

            modelBuilder.Entity<PunctDeInteres>()
                .Property(p => p.Id_PunctDeInteres)
                .HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);

            // Configure composite key for ImaginiPunctDeInteres
            modelBuilder.Entity<ImaginiPunctDeInteres>()
                .HasKey(i => new { i.Id_PunctDeInteres, i.Id_ImaginiPunctDeInteres });

            modelBuilder.Entity<ImaginiPunctDeInteres>()
                .Property(i => i.Id_ImaginiPunctDeInteres)
                .HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);

            // Configure composite key for ImaginiDestinatie if not already done
            modelBuilder.Entity<ImaginiDestinatie>()
                .HasKey(i => new { i.Id_Destinatie, i.Id_ImaginiDestinatie });

            modelBuilder.Entity<ImaginiDestinatie>()
                .Property(i => i.Id_ImaginiDestinatie)
                .HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);

            base.OnModelCreating(modelBuilder);
        }

        public DbSet<Utilizator> Utilizatori { get; set; }
        public DbSet<CategorieVacanta> CategoriiVacanta { get; set; }
        public DbSet<Destinatie> Destinatii { get; set; }
        public DbSet<Facilitate> Facilitati { get; set; }
        public DbSet<PunctDeInteres> PuncteDeInteres { get; set; }
        public DbSet<Sugestie> Sugestii { get; set; }
        public DbSet<PreferinteUtilizator> PreferinteUtilizator { get; set; }
        public DbSet<Recenzie> Recenzii { get; set; }
        public DbSet<LogActivitate> LogActivitate { get; set; }
        public DbSet<MesajAI> MesajeAI { get; set; }
        public DbSet<Favorite> Favorite { get; set; }
        public DbSet<ImaginiDestinatie> ImaginiDestinatie { get; set; }
        public DbSet<ImaginiPunctDeInteres> ImaginiPunctDeInteres { get; set; }
        public DbSet<ConversatieAI> ConversatiiAI { get; set; }
        public DbSet<DestinatieFacilitate> DestinatieFacilitate { get; set; }
        public DbSet<CategorieVacanta_Destinatie> CategorieVacanta_Destinatie { get; set; }
    }
}