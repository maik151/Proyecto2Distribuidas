using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IMaintenanceService
    {
        // CRUD Principal
        Task<int> CreateMaintenanceOrderAsync(MaintenanceHeader header, List<MaintenanceDetail> details);
        Task<IEnumerable<MaintenanceHeader>> GetHistoryAsync();
        Task<MaintenanceHeader> GetOrderDetailsAsync(int idHeader);

        // Faltaban estos dos para cumplir con el requisito de "Modificar y Eliminar"
        Task<bool> UpdateOrderAsync(MaintenanceHeader header, List<MaintenanceDetail> details);
        Task<bool> DeleteOrderAsync(int idHeader);

        // Reportes
        Task<IEnumerable<MaintenanceDetail>> GenerateCostReportAsync(DateTime start, DateTime end);
    }
}