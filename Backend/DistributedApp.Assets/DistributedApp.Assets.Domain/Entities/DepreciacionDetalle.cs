namespace DistributedApp.Assets.Domain.Entities;

public class DepreciacionDetalle
{
    public int IdDetalle { get; set; }
    public int IdDepreciacion { get; set; }
    public int IdActivo { get; set; }
    public int Periodo { get; set; }
    public decimal ValorDepreciacion { get; set; }
    // En DepreciacionDetalle.cs
    public string? NombreActivo { get; set; } // Propiedad auxiliar para lectura
}