using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebAdminDashboard.Classes.DTO
{
    [Table("CategorieVacanta_Destinatie")]
    public class CategorieVacanta_Destinatie
    {
        [Key]
        [Column("Id_Destinatie")]
        public int Id_Destinatie { get; set; }

        [Key]
        [Column("Id_CategorieVacanta")]
        public int Id_CategorieVacanta { get; set; }

        [ForeignKey("Id_Destinatie")]
        public virtual Destinatie Destinatie { get; set; }

        [ForeignKey("Id_CategorieVacanta")]
        public virtual CategorieVacanta CategorieVacanta { get; set; }
    }
}
