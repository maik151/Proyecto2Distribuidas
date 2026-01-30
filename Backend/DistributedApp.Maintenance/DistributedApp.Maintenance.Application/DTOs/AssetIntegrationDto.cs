using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.DTOs
{
    public class AssetIntegrationDto
    {
        public string codigo_activo { get; set; }
        public string nombre { get; set; }
        public DateTime fecha_compra { get; set; }
        public string estado { get; set; }
    }
}
