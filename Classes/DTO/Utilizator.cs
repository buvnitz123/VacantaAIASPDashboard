﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebAdminDashboard.Classes.DTO
{
    [Table("Utilizator")]
    public class Utilizator
    {
        [Key]
        [Column("Id_Utilizator")]
        public int Id_Utilizator { get; set; }

        [Required]
        [StringLength(50)]
        [Column("Nume")]
        public string Nume { get; set; }

        [Required]
        [StringLength(50)]
        [Column("Prenume")]
        public string Prenume { get; set; }

        [Required]
        [StringLength(50)]
        [Column("Email")]
        public string Email { get; set; }

        [Required]
        [StringLength(255)]
        [Column("Parola")]
        public string Parola { get; set; }

        [StringLength(50)]
        [Column("PozaProfil")]
        public string PozaProfil { get; set; }

        [Required]
        [Column("Data_Nastere")]
        public DateTime Data_Nastere { get; set; }

        [Required]
        [StringLength(50)]
        [Column("Telefon")]
        public string Telefon { get; set; }

        [Required]
        [Column("EsteActiv")]
        public int EsteActiv { get; set; }
    }
}