using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using DistributedApp.Maintenance.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Services
{
    public class MaintenanceService : IMaintenanceService
    {
        private readonly IMaintenanceRepository _repository;

        public MaintenanceService(IMaintenanceRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> CreateMaintenanceOrderAsync(MaintenanceHeader header, List<MaintenanceDetail> details)
        {
            try
            {
                // 1. Validaciones de Negocio previas
                if (details == null || details.Count == 0)
                    throw new ArgumentException("No se puede crear un mantenimiento sin detalles.");

                if (string.IsNullOrEmpty(header.RESPONSABLE))
                    throw new ArgumentException("El responsable es obligatorio.");

                // 2. Intentar guardar en Base de Datos (Transacción SQL)
                int newId = await _repository.CreateTransactionAsync(header, details);

                // 3. Integración (RabbitMQ)
                // Usamos un try-catch interno para que, si falla la cola, NO falle el guardado en BD.
                try
                {
                    if (newId > 0)
                    {
                        // TODO: _rabbitMQPublisher.Publish(newId);
                        // Console.WriteLine("Mensaje enviado a la cola...");
                    }
                }
                catch (Exception mqEx)
                {
                    // Solo logueamos el error de integración, pero retornamos el ID porque la orden SÍ se creó.
                    // Logger.LogError("Error al enviar a RabbitMQ: " + mqEx.Message);
                    Console.WriteLine("ADVERTENCIA: Falló RabbitMQ pero se guardó en BD: " + mqEx.Message);
                }

                return newId;
            }
            catch (ArgumentException argEx)
            {
                // Errores de validación (Bad Request)
                throw argEx;
            }
            catch (Exception ex)
            {
                // Errores graves de base de datos (Internal Server Error)
                throw new Exception("Error crítico al procesar la orden de mantenimiento: " + ex.Message);
            }
        }

        public async Task<IEnumerable<MaintenanceHeader>> GetHistoryAsync()
        {
            try
            {
                return await _repository.GetAllHeadersAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el historial: " + ex.Message);
            }
        }

        public async Task<MaintenanceHeader> GetOrderDetailsAsync(int idHeader)
        {
            try
            {
                var order = await _repository.GetByIdWithDetailsAsync(idHeader);
                if (order == null) throw new KeyNotFoundException($"La orden {idHeader} no existe.");
                return order;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener detalles de la orden: " + ex.Message);
            }
        }

        public async Task<IEnumerable<MaintenanceDetail>> GenerateCostReportAsync(DateTime start, DateTime end)
        {
            try
            {
                if (start > end) throw new ArgumentException("La fecha de inicio no puede ser mayor a la fin.");
                return await _repository.GetReportDataAsync(start, end);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al generar el reporte: " + ex.Message);
            }
        }
    }
}