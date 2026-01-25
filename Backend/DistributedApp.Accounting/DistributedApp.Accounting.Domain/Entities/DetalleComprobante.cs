namespace DistributedApp.Accounting.Domain.Entities
{
    public class DetalleComprobante
    {
        public int IdDetalle { get; set; }
        public int IdComprobante { get; set; }
        public int IdCuenta { get; set; }
        public decimal Debe { get; set; }
        public decimal Haber { get; set; }

        // Navegación
        public string? NombreCuenta { get; set; }
    }
}