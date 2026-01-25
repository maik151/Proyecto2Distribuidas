using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Accounting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TipoCuentaController : ControllerBase
    {
        private readonly ITipoCuentaRepository _repository;

        public TipoCuentaController(ITipoCuentaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tipos = await _repository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tipo = await _repository.GetByIdAsync(id);
            if (tipo == null) return NotFound();
            return Ok(tipo);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TipoCuenta tipoCuenta)
        {
            var id = await _repository.CreateAsync(tipoCuenta);
            return CreatedAtAction(nameof(GetById), new { id }, new { Id = id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TipoCuenta tipoCuenta)
        {
            tipoCuenta.IdTipoCuenta = id;
            var success = await _repository.UpdateAsync(tipoCuenta);
            if (!success) return NotFound();
            return NoContent();
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