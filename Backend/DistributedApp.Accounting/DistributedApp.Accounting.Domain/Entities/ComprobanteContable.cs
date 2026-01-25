namespace DistributedApp.Accounting.Domain.Entities
{
    public class ComprobanteContable
    {
        public int IdComprobante { get; set; }
        public int Numero { get; set; }
        public DateTime Fecha { get; set; }
        public string Observaciones { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }
}