namespace DistributedApp.Assets.Domain.Entities;

public class TipoActivo
{
    public int IdTipoActivo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}
