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

    public DepreciacionesController(IDepreciacionRepository repo)
    {
        _repo = repo;
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
            var id = await _repo.CreateTransactionalAsync(cabecera, detalles);
            return Ok(new { Id = id, Message = "Depreciación procesada correctamente." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Error interno al procesar.", Error = ex.Message });
        }
    }

    // --- NUEVO ENDPOINT ---
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Anular(int id)
    {
        var result = await _repo.AnularAsync(id);
        if (!result) return NotFound(new { Message = "Depreciación no encontrada." });
        
        return Ok(new { Message = "Depreciación anulada correctamente." });
    }
}