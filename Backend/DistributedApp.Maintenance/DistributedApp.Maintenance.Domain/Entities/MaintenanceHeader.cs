using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Domain.Entities
{
    public class MaintenanceHeader
    {
        public int ID_CABECERA { get; set; }
        public string NUMERO { get; set; }
        public DateTime FECHA { get; set; }
        public string RESPONSABLE { get; set; }
        public string ESTADO_MQ { get; set; } // 'PENDIENTE', 'ENVIADO'

        // Propiedad de navegación (Solo para lectura, no se mapea directo en Insert)
        public List<MaintenanceDetail> Detalles { get; set; } = new List<MaintenanceDetail>();

    }
}
