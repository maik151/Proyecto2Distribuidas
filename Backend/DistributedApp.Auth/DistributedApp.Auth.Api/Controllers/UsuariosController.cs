using DistributedApp.Auth.Application.DTOs;
using DistributedApp.Auth.Application.Interface;
using DistributedApp.Auth.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DistributedApp.Auth.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        // Inyectamos EL SERVICIO (Lógica de Negocio), no el repositorio
        private readonly IUsuarioService _usuarioService;

        public UsuariosController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        // POST: api/usuarios/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var respuesta = await _usuarioService.AuthenticateAsync(request);

            if (respuesta == null)
            {
                return Unauthorized(new { Message = "Usuario o contraseña incorrectos" });
            }

            // Retorna el JSON con: UsuarioId, Nombre, Rol y TOKEN
            return Ok(respuesta);
        }

        // GET: api/usuarios
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var usuarios = await _usuarioService.GetAllAsync();
            return Ok(usuarios);
        }

        // GET: api/usuarios/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var usuario = await _usuarioService.GetByIdAsync(id);

            if (usuario == null)
            {
                return NotFound(new { Message = "Usuario no encontrado" });
            }

            return Ok(usuario);
        }

        // POST: api/usuarios
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Usuario usuario)
        {
            try
            {
                var nuevoUsuario = await _usuarioService.CreateAsync(usuario);
                // Retorna 201 Created y la ubicación del nuevo recurso
                return CreatedAtAction(nameof(GetById), new { id = nuevoUsuario.IdUsuario }, new { Message = "Usuario Creado", Id = nuevoUsuario.IdUsuario });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // PUT: api/usuarios/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Usuario usuario)
        {
            try
            {
                var result = await _usuarioService.UpdateAsync(id, usuario);

                if (!result)
                {
                    return NotFound(new { Message = "Usuario no encontrado o IDs no coinciden" });
                }

                if (!string.IsNullOrEmpty(usuario.Contrasena)) 
                {
                    usuario.Contrasena = usuario.Contrasena; 
                }
                return Ok(new { Message = "Usuario actualizado correctamente" });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // DELETE: api/usuarios/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _usuarioService.DeleteAsync(id);

            if (!result)
            {
                return NotFound(new { Message = "Usuario no encontrado" });
            }

            return Ok(new { Message = "Usuario eliminado correctamente" });
        }

        // PATCH: api/usuarios/{id}/estado
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> ToggleStatus(int id, [FromBody] EstadoRequest request)
        {
            var result = await _usuarioService.UpdateStatusAsync(id, request.Activo);

            if (!result)
            {
                return NotFound(new { Message = "Usuario no encontrado" });
            }

            return Ok(new { Message = "Estado actualizado correctamente", NuevoEstado = request.Activo });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.Credential))
                {
                    return BadRequest(new { Message = "El token de Google es obligatorio." });
                }

                var respuesta = await _usuarioService.AuthenticateGoogleAsync(request.Credential);

                if (respuesta == null)
                {
                    return Unauthorized(new { Message = "Autenticación fallida." });
                }

                return Ok(respuesta);
            }
            catch (System.Exception ex) // <--- ESTO ES LO NUEVO
            {
                // Esto devolverá el error exacto al frontend para que lo leas
                return StatusCode(500, new
                {
                    Error = "Ocurrió un error en el servidor",
                    Detalle = ex.Message,
                    Inner = ex.InnerException?.Message
                });
            }
        }
    }    
}