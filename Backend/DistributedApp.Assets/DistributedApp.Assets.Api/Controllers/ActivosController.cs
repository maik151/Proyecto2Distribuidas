using DistributedApp.Assets.Application.DTOs;
using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Assets.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivosController : ControllerBase
    {
        private readonly IActivoRepository _repo;

        public ActivosController(IActivoRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _repo.GetAllAsync();
            var result = items.Select(a => new ActivoResponse(
                a.IdActivo,
                a.Nombre,
                a.PeriodosDepreciacionTotal,
                a.ValorCompra,
                a.IdTipoActivo,
                a.FechaCreacion,
                a.TipoActivoNombre
            ));
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var a = await _repo.GetByIdAsync(id);
            if (a is null) return NotFound();

            return Ok(new ActivoResponse(
                a.IdActivo,
                a.Nombre,
                a.PeriodosDepreciacionTotal,
                a.ValorCompra,
                a.IdTipoActivo,
                a.FechaCreacion,
                a.TipoActivoNombre
            ));
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            term ??= string.Empty;
            var items = await _repo.SearchAsync(term);

            var result = items.Select(a => new ActivoResponse(
                a.IdActivo,
                a.Nombre,
                a.PeriodosDepreciacionTotal,
                a.ValorCompra,
                a.IdTipoActivo,
                a.FechaCreacion,
                a.TipoActivoNombre
            ));

            return Ok(result);
        }

        // Reporte por rango de fechas (para imprimir)
        // GET: /api/Activos/report?from=2026-01-01&to=2026-01-31
        [HttpGet("report")]
        public async Task<IActionResult> Report([FromQuery] string from, [FromQuery] string to)
        {
            if (!DateTime.TryParse(from, out var fromDate))
                return BadRequest("Parámetro 'from' inválido. Use formato YYYY-MM-DD.");
            if (!DateTime.TryParse(to, out var toDate))
                return BadRequest("Parámetro 'to' inválido. Use formato YYYY-MM-DD.");

            fromDate = fromDate.Date;
            toDate = toDate.Date;

            if (toDate < fromDate)
                return BadRequest("El rango de fechas es inválido. 'to' debe ser mayor o igual a 'from'.");

            var toExclusive = toDate.AddDays(1);

            var items = await _repo.GetReportAsync(fromDate, toExclusive);
            var result = items.Select(a => new ActivoReportResponse(
                a.IdActivo,
                a.Nombre,
                a.TipoActivoNombre,
                a.ValorCompra,
                a.PeriodosDepreciacionTotal,
                a.FechaCreacion // Cambiado de a.FechaRegistro a a.FechaCreacion
            ));

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ActivoCreateRequest req)
{
    var entity = new Activo
    {
        Nombre = req.Nombre,
        PeriodosDepreciacionTotal = req.PeriodosDepreciacionTotal,
        ValorCompra = req.ValorCompra,
        IdTipoActivo = req.IdTipoActivo,
        ActivoFlag = true,
        FechaCreacion = DateTime.UtcNow // ✅ AQUI
        // o DateTime.UtcNow
    };

    var id = await _repo.CreateAsync(entity);
    return CreatedAtAction(nameof(GetById), new { id }, new { id });
}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ActivoUpdateRequest req)
        {
            var entity = new Activo
            {
                IdActivo = id,
                Nombre = req.Nombre,
                PeriodosDepreciacionTotal = req.PeriodosDepreciacionTotal,
                ValorCompra = req.ValorCompra,
                IdTipoActivo = req.IdTipoActivo
            };

            var ok = await _repo.UpdateAsync(entity);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _repo.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
