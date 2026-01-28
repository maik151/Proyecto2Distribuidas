using DistributedApp.Maintenance.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IActivityService
    {
        // CORREGIDO: Todo usa ActivityA
        Task<IEnumerable<ActivityA>> GetAllAsync();
        Task<ActivityA> GetByIdAsync(int id);
        Task<int> CreateAsync(ActivityA activity);
        Task<bool> UpdateAsync(ActivityA activity);
        Task<bool> DeleteAsync(int id);
    }
}