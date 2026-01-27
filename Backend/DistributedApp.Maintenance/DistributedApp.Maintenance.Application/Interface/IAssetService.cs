using DistributedApp.Maintenance.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IAssetService
    {
        Task<IEnumerable<Asset>> GetAllAsync();
        Task<int> CreateAsync(Asset asset);
        Task<bool> UpdateAsync(Asset asset);

        // ESTOS ERAN LOS QUE FALTABAN:
        Task<Asset> GetByIdAsync(int id);
        Task<bool> DeleteAsync(int id);
    }
}