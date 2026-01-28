namespace DistributedApp.Assets.Domain.Entities
{
    public class Activo
    {
        public int IdActivo { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int PeriodosDepreciacionTotal { get; set; }
        public decimal ValorCompra { get; set; }
        public int IdTipoActivo { get; set; }
        public bool ActivoFlag { get; set; } // si ya lo tienes así, respétalo
        public string? TipoActivoNombre { get; set; }

        public DateTime FechaCreacion { get; set; } // <-- NUEVO
    }
}
