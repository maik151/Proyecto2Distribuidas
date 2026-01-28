using DistributedApp.Maintenance.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IActivityRepository
    {
        // CORREGIDO: Todo usa ActivityA para evitar conflicto con System.Diagnostics
        Task<IEnumerable<ActivityA>> GetAllAsync();
        Task<ActivityA> GetByIdAsync(int id);
        Task<int> InsertAsync(ActivityA entity);
        Task<bool> UpdateAsync(ActivityA entity);
        Task<bool> DeleteAsync(int id);
    }
}