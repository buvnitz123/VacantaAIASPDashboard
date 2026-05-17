using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebAdminDashboard.Classes.DTO
{
    [Table("AppSettings")]
    public class AppSettings
    {
        [Key]
        [StringLength(255)]
        [Column("ParamKey")]
        public string ParamKey { get; set; }

        [StringLength(4000)]
        [Column("ParamValue")]
        public string ParamValue { get; set; }
    }
}
