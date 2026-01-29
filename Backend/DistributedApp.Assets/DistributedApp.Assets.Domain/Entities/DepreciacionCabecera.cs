namespace DistributedApp.Assets.Domain.Entities;

public class DepreciacionCabecera
{
    public int IdDepreciacion { get; set; }
    public DateTime Fecha { get; set; }
    public string Observaciones { get; set; } = string.Empty;
    public string Responsable { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public int Estado { get; set; }

    // Propiedad de navegación (opcional, útil para lógica interna)
    public List<DepreciacionDetalle> Detalles { get; set; } = new();
}