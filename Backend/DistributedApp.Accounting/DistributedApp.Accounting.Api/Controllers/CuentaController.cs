using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Accounting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CuentaController : ControllerBase
    {
        private readonly ICuentaRepository _repository;

        public CuentaController(ICuentaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cuentas = await _repository.GetAllAsync();
            return Ok(cuentas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cuenta = await _repository.GetByIdAsync(id);
            if (cuenta == null) return NotFound();
            return Ok(cuenta);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Cuenta cuenta)
        {
            var id = await _repository.CreateAsync(cuenta);
            return CreatedAtAction(nameof(GetById), new { id }, new { Id = id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Cuenta cuenta)
        {
            cuenta.IdCuenta = id;
            var success = await _repository.UpdateAsync(cuenta);
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