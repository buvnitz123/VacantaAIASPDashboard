using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebAdminDashboard.Classes.DTO
{
    [Table("ImaginiPunctDeInteres")]
    public class ImaginiPunctDeInteres
    {
        [Key]
        [Column("Id_PunctDeInteres", Order = 1)]
        public int Id_PunctDeInteres { get; set; }

        [Key]
        [Column("Id_ImaginiPunctDeInteres", Order = 2)]
        public int Id_ImaginiPunctDeInteres { get; set; }

        [StringLength(200)]
        [Column("ImagineUrl")]
        public string ImagineUrl { get; set; }

        [ForeignKey("Id_PunctDeInteres")]
        public virtual PunctDeInteres PunctDeInteres { get; set; }
    }
}
