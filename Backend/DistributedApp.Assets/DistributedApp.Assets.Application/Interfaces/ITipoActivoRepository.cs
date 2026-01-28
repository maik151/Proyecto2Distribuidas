using DistributedApp.Assets.Domain.Entities; // Asegúrate de que el proyecto tenga una carpeta/namespace Domain.Entities y la referencia esté agregada correctamente

namespace DistributedApp.Assets.Application.Interfaces;

public interface ITipoActivoRepository
{
    Task<IEnumerable<TipoActivo>> GetAllAsync();
    Task<TipoActivo?> GetByIdAsync(int id);
    Task<IEnumerable<TipoActivo>> SearchAsync(string term);
    Task<int> CreateAsync(TipoActivo entity);
    Task<bool> UpdateAsync(TipoActivo entity);
    Task<bool> DeleteAsync(int id);
}
