using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Infrastructure.Repositories
{
    public interface IMaintenanceRepository
    {
        // LISTAR: Trae el historial completo (Cabeceras + Detalles)
        Task<IEnumerable<MaintenanceHeader>> GetAllAsync();

        // LEER UNO: Trae una orden específica con sus detalles para editar
        Task<MaintenanceHeader> GetByIdAsync(int id);

        // CREAR: Guarda Cabecera y Detalles en una sola Transacción
        Task<int> CreateAsync(MaintenanceHeader header);

        // ACTUALIZAR: Modifica Cabecera y regenera Detalles
        Task<bool> UpdateAsync(MaintenanceHeader header);

        // ELIMINAR: Borra en cascada
        Task<bool> DeleteAsync(int id);

        // REPORTE: El método específico para la pestaña de Reportes
        Task<IEnumerable<MaintenanceDetail>> GetReportDataAsync(DateTime start, DateTime end);
    }
}