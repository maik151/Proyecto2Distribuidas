using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Application.Interfaces
{
    public interface ICuentaRepository
    {
        Task<IEnumerable<Cuenta>> GetAllAsync();
        Task<Cuenta?> GetByIdAsync(int id);
        Task<int> CreateAsync(Cuenta cuenta);
        Task<bool> UpdateAsync(Cuenta cuenta);
        Task<bool> DeleteAsync(int id);
    }
}