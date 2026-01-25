namespace DistributedApp.Accounting.Domain.Entities
{
    public class TipoCuenta
    {
        public int IdTipoCuenta { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }
}