using System.Text.Json.Serialization;

namespace DistributedApp.Maintenance.Application.DTOs
{
    public class AssetIntegrationDto
    {
        // Usamos JsonPropertyName para mapear el JSON (snake_case) a C# (PascalCase)

        [JsonPropertyName("codigo_activo")]
        public string CodigoActivo { get; set; }

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; }

        [JsonPropertyName("fecha_compra")]
        public string FechaCompra { get; set; } // Recibimos como string para evitar errores de formato fecha

        [JsonPropertyName("estado")]
        public string Estado { get; set; } // Ej: "ACTIVO"
    }
}