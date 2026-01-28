using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Domain.Entities
{
    public class MaintenanceDetail
    {
        public int ID_DETALLE { get; set; }
        public int ID_CABECERA { get; set; }
        public int ID_ACTIVO { get; set; }
        public int ID_ACTIVIDAD { get; set; }
        public decimal VALOR { get; set; }

        // Propiedades extendidas para el Reporte (RF-MAN-04)
        // Dapper las llenará si hacemos JOINs
        public string NombreActivo { get; set; }
        public string NombreActividad { get; set; }
    }
}
