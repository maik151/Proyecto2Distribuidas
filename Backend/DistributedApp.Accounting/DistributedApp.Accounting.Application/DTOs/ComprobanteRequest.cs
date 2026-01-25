using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Application.DTOs
{
    public class ComprobanteRequest
    {
        public ComprobanteContable Cabecera { get; set; } = new();
        public List<DetalleComprobante> Detalles { get; set; } = new();
    }
}