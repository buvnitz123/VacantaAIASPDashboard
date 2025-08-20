using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebAdminDashboard.Classes.DTO
{
    [Table("Facilitate")]
    public class Facilitate
    {
        [Key]
        [Column("Id_Facilitate")]
        public int Id_Facilitate { get; set; }

        [Required]
        [StringLength(50)]
        [Column("Denumire")]
        public string Denumire { get; set; }

        [StringLength(4000)]
        [Column("Descriere")]
        public string Descriere { get; set; }
    }
}
