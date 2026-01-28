using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Domain.Entities
{
    public class Asset
    {
        public int ID_ACTIVO { get; set; }
        public string CODIGO { get; set; }
        public string NOMBRE { get; set; }
        public DateTime FECHA_COMPRA { get; set; }
        public bool ESTADO { get; set; }
    }
}
