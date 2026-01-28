using DistributedApp.Assets.Application.DTOs;
using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Assets.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TipoActivosController : ControllerBase
{
    private readonly ITipoActivoRepository _repo;

    public TipoActivosController(ITipoActivoRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync();
        var result = items.Select(x => new TipoActivoResponse(x.IdTipoActivo, x.Nombre));
        return Ok(result);
    }

    // GET: api/TipoActivos/activos
    // Devuelve SOLO los tipos de activo que están activos (para combos / selects)
    [HttpGet("activos")]
    public async Task<IActionResult> GetActivos()
    {
        // En esta implementación, GetAllAsync ya devuelve solo tipos activos.
        var items = await _repo.GetAllAsync();
        var result = items.Select(x => new TipoActivoResponse(x.IdTipoActivo, x.Nombre));
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(new TipoActivoResponse(item.IdTipoActivo, item.Nombre));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string term)
    {
        term ??= string.Empty;
        var items = await _repo.SearchAsync(term);
        var result = items.Select(x => new TipoActivoResponse(x.IdTipoActivo, x.Nombre));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TipoActivoCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nombre))
            return BadRequest(new { Message = "El nombre es obligatorio" });

        var entity = new TipoActivo { Nombre = request.Nombre.Trim(), Activo = true };
        var newId = await _repo.CreateAsync(entity);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { Id = newId, Message = "Tipo de Activo creado" });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] TipoActivoUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nombre))
            return BadRequest(new { Message = "El nombre es obligatorio" });

        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.Nombre = request.Nombre.Trim();
        var ok = await _repo.UpdateAsync(existing);
        return ok ? Ok(new { Message = "Tipo de Activo actualizado" }) : StatusCode(500, new { Message = "No se pudo actualizar" });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? Ok(new { Message = "Tipo de Activo eliminado" }) : NotFound();
    }
}
