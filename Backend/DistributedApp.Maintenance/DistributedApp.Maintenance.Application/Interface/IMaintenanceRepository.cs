using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Infrastructure.Repositories
{
    public interface IMaintenanceRepository
    {
        Task<int> CreateTransactionAsync(MaintenanceHeader header, List<MaintenanceDetail> details);
        Task<MaintenanceHeader> GetByIdWithDetailsAsync(int idHeader);
        Task<IEnumerable<MaintenanceHeader>> GetAllHeadersAsync();
        Task<IEnumerable<MaintenanceDetail>> GetReportDataAsync(DateTime fechaInicio, DateTime fechaFin);
    }
}
