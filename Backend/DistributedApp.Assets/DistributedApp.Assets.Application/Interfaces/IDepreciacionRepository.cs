using DistributedApp.Assets.Domain.Entities;

namespace DistributedApp.Assets.Application.Interfaces;

public interface IDepreciacionRepository
{
    // Crear cabecera y detalles en transacción
    Task<int> CreateTransactionalAsync(DepreciacionCabecera cabecera, List<DepreciacionDetalle> detalles);
    
    // Obtener historial completo
    Task<IEnumerable<DepreciacionCabecera>> GetAllAsync();
    
    // Obtener una específica con sus detalles
    Task<DepreciacionCabecera?> GetByIdWithDetailsAsync(int id);

    // NUEVO: Anular (Eliminar lógicamente)
    Task<bool> AnularAsync(int id);
}