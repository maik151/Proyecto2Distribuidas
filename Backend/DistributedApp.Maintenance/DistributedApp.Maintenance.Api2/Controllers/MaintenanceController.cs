using Microsoft.AspNetCore.Mvc;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Api2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceService _service;

        public MaintenanceController(IMaintenanceService service)
        {
            _service = service;
        }

        // 1. TRANSACCIÓN COMPLEJA (POST)
        // Recibe un JSON con Cabecera y Lista de Detalles
        [HttpPost]
        public async Task<ActionResult> CreateOrder([FromBody] MaintenanceTransactionDto dto)
        {
            try
            {
                // Mapeamos el DTO a las entidades del Dominio
                var header = new MaintenanceHeader
                {
                    NUMERO = dto.Numero,
                    FECHA = dto.Fecha,
                    RESPONSABLE = dto.Responsable
                };

                // Llamamos al servicio que hace la magia (SQL Transaction + RabbitMQ)
                var id = await _service.CreateMaintenanceOrderAsync(header, dto.Detalles);

                return Ok(new { Message = "Orden creada exitosamente", Id = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno: " + ex.Message);
            }
        }

        // 2. LISTADO HISTÓRICO (Solo Cabeceras)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaintenanceHeader>>> GetAll()
        {
            return Ok(await _service.GetHistoryAsync());
        }

        // 3. OBTENER UNA ORDEN COMPLETA (Cabecera + Detalles)
        [HttpGet("{id}")]
        public async Task<ActionResult<MaintenanceHeader>> GetById(int id)
        {
            try
            {
                return Ok(await _service.GetOrderDetailsAsync(id));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // 4. REPORTE CRUZADO (Matriz)
        // Uso: api/maintenance/report?start=2026-01-01&end=2026-01-31
        [HttpGet("report")]
        public async Task<ActionResult<IEnumerable<MaintenanceDetail>>> GetReport([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            try
            {
                var data = await _service.GenerateCostReportAsync(start, end);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    // DTO AUXILIAR (Para recibir el JSON limpio desde Angular/Postman)
    public class MaintenanceTransactionDto
    {
        public string Numero { get; set; }
        public DateTime Fecha { get; set; }
        public string Responsable { get; set; }
        public List<MaintenanceDetail> Detalles { get; set; }
    }
}