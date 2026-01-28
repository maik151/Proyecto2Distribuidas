using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IMaintenanceService
    {
        Task<int> CreateMaintenanceOrderAsync(MaintenanceHeader header, List<MaintenanceDetail> details);
        Task<IEnumerable<MaintenanceHeader>> GetHistoryAsync();
        Task<MaintenanceHeader> GetOrderDetailsAsync(int idHeader);
        Task<IEnumerable<MaintenanceDetail>> GenerateCostReportAsync(DateTime start, DateTime end);
    }
}