using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using DistributedApp.Maintenance.Infrastructure.Repositories;

using System;
using System.Collections.Generic;
using System.Linq; // <--- Necesario para .Sum()
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
                // 1. Validaciones de Negocio previas
                if (details == null || details.Count == 0)
                    throw new ArgumentException("No se puede crear un mantenimiento sin detalles.");

                if (string.IsNullOrEmpty(header.RESPONSABLE))
                    throw new ArgumentException("El responsable es obligatorio.");

                // 2. Intentar guardar en Base de Datos (Transacción SQL)
                int newId = await _repository.CreateTransactionAsync(header, details);

                // 3. Integración (RabbitMQ) - ESCENARIO 1: AVISO A CONTABILIDAD
                try
                {
                    if (newId > 0)
                    {
                        // Calculamos el total sumando los valores de los detalles
                        // (Asumo que tu entidad MaintenanceDetail tiene una propiedad 'VALOR' o 'Valor')
                        decimal total = details.Sum(d => d.VALOR);

                        // Construimos el Payload exacto del requerimiento
                        var payloadContabilidad = new
                        {
                            id_transaccion = header.NUMERO, // Asumiendo que header tiene el NUMERO generado
                            fecha = DateTime.Now.ToString("yyyy-MM-dd"),
                            glosa = $"Mantenimiento correctivo Orden {header.NUMERO} por {header.RESPONSABLE}",
                            monto_total = total,
                            tipo_gasto = "SERVICIOS_TECNICOS"
                        };

                        // Enviamos mensaje ASÍNCRONO a la cola de Contabilidad en la Nube
                        await _rabbitProducer.SendMessageAsync(payloadContabilidad, "contabilidad_queue");

                        Console.WriteLine($"[RabbitMQ] Mensaje enviado a contabilidad_queue: Orden {header.NUMERO}");
                    }
                }
                catch (Exception mqEx)
                {
                    // Solo logueamos el error de integración, pero retornamos el ID porque la orden SÍ se creó en SQL.
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