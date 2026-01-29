namespace DistributedApp.Accounting.Application.DTOs
{
    public class MensajeNuevoActivo
    {
        public string codigo_activo { get; set; } = string.Empty;
        public string nombre { get; set; } = string.Empty;
        public string fecha_compra { get; set; } = string.Empty;
        public string estado { get; set; } = string.Empty;
    }
}