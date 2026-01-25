namespace DistributedApp.Accounting.Domain.Entities
{
    public class Cuenta
    {
        public int IdCuenta { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public int IdTipoCuenta { get; set; }
        public bool Activo { get; set; }

        // Navegación (no se mapea en BD)
        public string? NombreTipoCuenta { get; set; }
    }
}