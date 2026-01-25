using DistributedApp.Accounting.Application.DTOs;
using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Accounting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComprobanteController : ControllerBase
    {
        private readonly IComprobanteRepository _repository;

        public ComprobanteController(IComprobanteRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var comprobantes = await _repository.GetAllAsync();
            return Ok(comprobantes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var comprobante = await _repository.GetByIdAsync(id);
            if (comprobante == null) return NotFound();

            var detalles = await _repository.GetDetallesByComprobanteAsync(id);
            return Ok(new { Cabecera = comprobante, Detalles = detalles });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ComprobanteRequest request)
        {
            // Validar que Debe = Haber
            var totalDebe = request.Detalles.Sum(d => d.Debe);
            var totalHaber = request.Detalles.Sum(d => d.Haber);

            if (totalDebe != totalHaber)
            {
                return BadRequest(new { Error = "El comprobante está descuadrado. Debe != Haber" });
            }

            // Crear cabecera
            var idComprobante = await _repository.CreateAsync(request.Cabecera);

            // Crear detalles
            foreach (var detalle in request.Detalles)
            {
                detalle.IdComprobante = idComprobante;
                await _repository.CreateDetalleAsync(detalle);
            }

            return CreatedAtAction(nameof(GetById), new { id = idComprobante }, new { Id = idComprobante });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _repository.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}