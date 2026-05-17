using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAdminDashboard.Classes.DTO
{
    [Table("ModelPerformanta")]
    public class ModelPerformanta
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id_ModelPerformanta { get; set; }
        public DateTime? Data_Inregistrare { get; set; }
        public string NumeModel { get; set; }
        public decimal? SecundeDurate { get; set; }
        public int? TokenInput { get; set; }
        public int? TokenOutput { get; set; }
        public int? ApreciereUser { get; set; }
    }
}
