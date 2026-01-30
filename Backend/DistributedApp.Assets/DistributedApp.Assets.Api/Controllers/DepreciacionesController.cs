using DistributedApp.Assets.Application.DTOs;
using DistributedApp.Assets.Application.Interfaces; 
using DistributedApp.Assets.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Assets.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepreciacionesController : ControllerBase
{
    private readonly IDepreciacionRepository _repo;
    private readonly IMessageProducer _messageProducer; // <--- 1. Inyección de dependencia

    public DepreciacionesController(IDepreciacionRepository repo, IMessageProducer messageProducer)
    {
        _repo = repo;
        _messageProducer = messageProducer;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _repo.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _repo.GetByIdWithDetailsAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DepreciacionCreateRequest req)
    {
        if (req.Detalles == null || !req.Detalles.Any())
            return BadRequest("No hay detalles para depreciar.");

        var cabecera = new DepreciacionCabecera
        {
            Fecha = req.Fecha,
            Observaciones = req.Observaciones,
            Responsable = req.Responsable
        };

        var detalles = req.Detalles.Select(d => new DepreciacionDetalle
        {
            IdActivo = d.IdActivo,
            Periodo = d.Periodo,
            ValorDepreciacion = d.ValorDepreciacion
        }).ToList();

        try 
        {
            // 1. Guardar en Base de Datos Local
            var id = await _repo.CreateTransactionalAsync(cabecera, detalles);

            // 2. INTEGRACIÓN RABBITMQ: Escenario 2 (Depreciación Masiva -> Contabilidad)
            try
            {
                // Calcular totales y formatos para el mensaje
                decimal total = detalles.Sum(x => x.ValorDepreciacion);
                string periodoStr = req.Fecha.ToString("MM-yyyy"); // Ej: 01-2026

                var payload = new 
                {
                    periodo = periodoStr,
                    fecha_proceso = req.Fecha.ToString("yyyy-MM-dd"),
                    glosa = req.Observaciones ?? $"Depreciación Generada {periodoStr}",
                    total_depreciado = total,
                    centro_costo = "ADMINISTRACION", // Se puede parametrizar si es necesario
                    referencia_id = id
                };

                // Enviamos a la cola que escucha CONTABILIDAD
                _messageProducer.SendMessage(payload, "activos.depreciacion.calculada");
            }
            catch (Exception mqEx)
            {
                // Loguear error de cola pero NO fallar la transacción HTTP
                Console.WriteLine($"Error conectando con RabbitMQ: {mqEx.Message}");
            }

            return Ok(new { Id = id, Message = "Depreciación procesada y notificada." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Error interno al procesar.", Error = ex.Message });
        }
    }

    // --- ENDPOINT ANULAR ---
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Anular(int id)
    {
        var result = await _repo.AnularAsync(id);
        if (!result) return NotFound(new { Message = "Depreciación no encontrada." });
        
        // Opcional: Podrías enviar otro mensaje a RabbitMQ aquí para "Revertir Asiento"
        // _messageProducer.SendMessage(new { referencia_id = id, accion = "REVERTIR" }, "activos.depreciacion.revertida");

        return Ok(new { Message = "Depreciación anulada correctamente." });
    }
}