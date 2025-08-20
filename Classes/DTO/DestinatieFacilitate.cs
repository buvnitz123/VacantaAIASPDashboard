using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebAdminDashboard.Classes.DTO
{
    [Table("DestinatieFacilitate")]
    public class DestinatieFacilitate
    {
        [Key]
        [Column("Id_Destinatie")]
        public int Id_Destinatie { get; set; }

        [Key]
        [Column("Id_Facilitate")]
        public int Id_Facilitate { get; set; }

        [ForeignKey("Id_Destinatie")]
        public virtual Destinatie Destinatie { get; set; }

        [ForeignKey("Id_Facilitate")]
        public virtual Facilitate Facilitate { get; set; }
    }
}
