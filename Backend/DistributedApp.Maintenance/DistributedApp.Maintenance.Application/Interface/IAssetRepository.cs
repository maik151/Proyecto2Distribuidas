using DistributedApp.Maintenance.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IAssetRepository
    {
        Task<IEnumerable<Asset>> GetAllAsync();
        Task<int> InsertAsync(Asset entity);
        Task<bool> UpdateAsync(Asset entity);
        Task<Asset> GetByIdAsync(int id);
        Task<bool> DeleteAsync(int id);
    }
}