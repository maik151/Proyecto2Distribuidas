namespace DistributedApp.Assets.Application.DTOs;

public class DepreciacionCreateRequest
{
    public DateTime Fecha { get; set; }
    public string Observaciones { get; set; }
    public string Responsable { get; set; }
    
    // Lista de detalles que vienen del grid del frontend
    public List<DepreciacionDetalleRequest> Detalles { get; set; }
}

public class DepreciacionDetalleRequest
{
    public int IdActivo { get; set; }
    public int Periodo { get; set; }
    public decimal ValorDepreciacion { get; set; }
}