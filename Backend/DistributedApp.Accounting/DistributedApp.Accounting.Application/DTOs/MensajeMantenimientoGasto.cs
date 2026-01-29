namespace DistributedApp.Accounting.Application.DTOs
{
    public class MensajeMantenimientoGasto
    {
        public string id_transaccion { get; set; } = string.Empty;
        public string fecha { get; set; } = string.Empty;
        public string glosa { get; set; } = string.Empty;
        public decimal monto_total { get; set; }
        public string tipo_gasto { get; set; } = string.Empty;
    }
}