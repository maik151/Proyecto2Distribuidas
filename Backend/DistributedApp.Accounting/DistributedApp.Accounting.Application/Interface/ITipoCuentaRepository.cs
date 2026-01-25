using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Application.Interfaces
{
    public interface ITipoCuentaRepository
    {
        Task<IEnumerable<TipoCuenta>> GetAllAsync();
        Task<TipoCuenta?> GetByIdAsync(int id);
        Task<int> CreateAsync(TipoCuenta tipoCuenta);
        Task<bool> UpdateAsync(TipoCuenta tipoCuenta);
        Task<bool> DeleteAsync(int id);
    }
}