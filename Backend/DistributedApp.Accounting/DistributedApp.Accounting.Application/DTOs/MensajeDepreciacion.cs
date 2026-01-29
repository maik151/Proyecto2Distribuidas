namespace DistributedApp.Accounting.Application.DTOs
{
    public class MensajeDepreciacion
    {
        public string periodo { get; set; } = string.Empty;
        public string fecha_proceso { get; set; } = string.Empty;
        public string glosa { get; set; } = string.Empty;
        public decimal total_depreciado { get; set; }
        public string centro_costo { get; set; } = string.Empty;
    }
}