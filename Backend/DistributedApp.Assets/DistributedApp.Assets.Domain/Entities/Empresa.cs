namespace DistributedApp.Assets.Domain.Entities;
public class Empresa
{
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Departamento { get; set; } = string.Empty;
    public string Ruc { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Ciudad { get; set; } = string.Empty;
}