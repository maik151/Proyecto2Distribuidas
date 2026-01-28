using Microsoft.AspNetCore.Mvc;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Controllers // Ajusta si tu namespace es DistributedApp.Maintenance.Api2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceService _service;

        public MaintenanceController(IMaintenanceService service)
        {
            _service = service;
        }

        // 1. LISTAR HISTORIAL (GET: api/Maintenance)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetHistoryAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        // 2. OBTENER POR ID (GET: api/Maintenance/{id})
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetOrderDetailsAsync(id);
                if (result == null) return NotFound(new { Message = "Orden no encontrada" });
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { Message = "Orden no encontrada" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        // 3. CREAR (POST: api/Maintenance)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaintenanceHeader order)
        {
            try
            {
                if (order == null) return BadRequest("El cuerpo de la solicitud no puede ser nulo.");

                // El servicio pide (header, details), así que separamos la lista del objeto principal
                // Nota: order.Detalles viene lleno gracias al JSON del frontend
                var id = await _service.CreateMaintenanceOrderAsync(order, order.Detalles);

                return Ok(new { Message = "Orden creada exitosamente", Id = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message }); // Errores de validación (400)
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message }); // Errores de servidor (500)
            }
        }

        // 4. ACTUALIZAR (PUT: api/Maintenance/{id})
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MaintenanceHeader order)
        {
            try
            {
                if (id != order.ID_CABECERA)
                    return BadRequest("El ID de la URL no coincide con el ID del cuerpo.");

                // Llamamos al método UpdateOrderAsync que agregamos al servicio
                var result = await _service.UpdateOrderAsync(order, order.Detalles);

                if (result) return Ok(new { Message = "Orden actualizada exitosamente" });
                return NotFound(new { Message = "No se pudo actualizar la orden (no existe o error interno)" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        // 5. ELIMINAR (DELETE: api/Maintenance/{id})
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.DeleteOrderAsync(id);

                if (result) return Ok(new { Message = "Orden eliminada exitosamente" });
                return NotFound(new { Message = "No se encontró la orden para eliminar" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        // 6. REPORTE (GET: api/Maintenance/report?start=...&end=...)
        [HttpGet("report")]
        public async Task<IActionResult> GetReport([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            try
            {
                // El frontend envía formato YYYY-MM-DD, .NET lo parsea automáticamente a DateTime
                var result = await _service.GenerateCostReportAsync(start, end);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
}