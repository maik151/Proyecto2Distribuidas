using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using DistributedApp.Maintenance.Infrastructure.Repositories; // Tu Repo


using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Services
{
    public class MaintenanceService : IMaintenanceService
    {
        private readonly IMaintenanceRepository _repository;
        private readonly IRabbitMQProducer _rabbitProducer;

        public MaintenanceService(IMaintenanceRepository repository, IRabbitMQProducer rabbitProducer)
        {
            _repository = repository;
            _rabbitProducer = rabbitProducer;
        }

        public async Task<int> CreateMaintenanceOrderAsync(MaintenanceHeader header, List<MaintenanceDetail> details)
        {
            try
            {
                // 1. Validaciones
                if (details == null || !details.Any())
                    throw new ArgumentException("No se puede crear una orden sin detalles.");

                if (string.IsNullOrEmpty(header.RESPONSABLE))
                    throw new ArgumentException("El responsable es obligatorio.");

                // 2. Preparar el objeto para el Repositorio
                // El repositorio espera que la lista esté DENTRO del header
                header.Detalles = details;

                // 3. Guardar en Base de Datos (Llamamos al método nuevo 'CreateAsync')
                int newId = await _repository.CreateAsync(header);
                header.ID_CABECERA = newId; // Asignamos el ID generado para usarlo en el mensaje

                // 4. Integración (RabbitMQ)
                try
                {
                    if (newId > 0)
                    {
                        decimal total = details.Sum(d => d.VALOR);

                        var payloadContabilidad = new
                        {
                            id_transaccion = header.NUMERO, // O newId, depende de qué prefieras rastrear
                            fecha = DateTime.Now.ToString("yyyy-MM-dd"),
                            glosa = $"Orden Mantenimiento {header.NUMERO} - {header.RESPONSABLE}",
                            monto_total = total,
                            tipo_gasto = "SERVICIOS_TECNICOS",
                            origen = "MODULO_MANTENIMIENTO"
                        };

                        // Enviamos mensaje (Sin await porque el producer es void síncrono)
                        _rabbitProducer.SendMessageAsync(payloadContabilidad, "contabilidad_queue");

                        Console.WriteLine($"[RabbitMQ] Enviado a Contabilidad: {header.NUMERO}");
                    }
                }
                catch (Exception mqEx)
                {
                    // Si falla la cola, NO fallamos la transacción, solo logueamos
                    Console.WriteLine("ADVERTENCIA: Falló RabbitMQ pero se guardó en BD: " + mqEx.Message);
                }

                return newId;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear la orden: " + ex.Message);
            }
        }

        public async Task<IEnumerable<MaintenanceHeader>> GetHistoryAsync()
        {
            // CORRECCIÓN: Usamos 'GetAllAsync'
            return await _repository.GetAllAsync();
        }

        public async Task<MaintenanceHeader> GetOrderDetailsAsync(int idHeader)
        {
            // CORRECCIÓN: Usamos 'GetByIdAsync'
            var order = await _repository.GetByIdAsync(idHeader);
            if (order == null) throw new KeyNotFoundException($"Orden {idHeader} no encontrada.");
            return order;
        }

        public async Task<IEnumerable<MaintenanceDetail>> GenerateCostReportAsync(DateTime start, DateTime end)
        {
            if (start > end) throw new ArgumentException("La fecha inicio no puede ser mayor a fin.");
            // CORRECCIÓN: Usamos 'GetReportDataAsync'
            return await _repository.GetReportDataAsync(start, end);
        }

        // --- MÉTODOS QUE FALTABAN PARA COMPLETAR EL CRUD ---

        public async Task<bool> UpdateOrderAsync(MaintenanceHeader header, List<MaintenanceDetail> details)
        {
            // Vinculamos la lista al objeto padre
            header.Detalles = details;
            // Llamamos al repo
            return await _repository.UpdateAsync(header);
        }

        public async Task<bool> DeleteOrderAsync(int idHeader)
        {
            return await _repository.DeleteAsync(idHeader);
        }
    }
}