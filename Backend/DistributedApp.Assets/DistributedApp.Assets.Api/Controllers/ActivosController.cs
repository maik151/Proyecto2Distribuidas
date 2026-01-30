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
        private readonly IMessageProducer _messageProducer; // <--- 1. Dependencia de RabbitMQ

        // Inyección de dependencias en el constructor
        public ActivosController(IActivoRepository repo, IMessageProducer messageProducer)
        {
            _repo = repo;
            _messageProducer = messageProducer;
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
                a.FechaCreacion
            ));

            return Ok(result);
        }
        // ==========================================
        // ENDPOINT DE DIAGNÓSTICO (BORRAR DESPUÉS)
        // GET: /api/Activos/test-rabbit
        // ==========================================
        [HttpGet("test-rabbit")]
        public IActionResult TestRabbitConnection()
        {
            var log = new List<string>();
            log.Add("Iniciando prueba de conexión...");

            try
            {
                // 1. HARDCODEA TU URL AQUÍ (Solo para probar que no sea error de lectura del appsettings)
                // Copia y pega TAL CUAL la url de tu dashboard de CloudAMQP (la que empieza con amqps://)
                string urlDirecta = "amqps://jxflsaoh:ZvYqv3-5b6QfJQVfY8GHFQUflwYAiN1M@gorilla.lmq.cloudamqp.com/jxflsaoh"; 
                
                log.Add($"Intentando conectar a: {urlDirecta.Substring(0, 20)}...");

                var factory = new RabbitMQ.Client.ConnectionFactory
                {
                    Uri = new Uri(urlDirecta)
                };

                // AJUSTE CRÍTICO PARA CLOUDAMQP (SSL)
                // A veces la librería 6.x necesita esto explícito
                if (urlDirecta.StartsWith("amqps"))
                {
                    factory.Ssl.Enabled = true;
                    factory.Ssl.ServerName = System.Net.Dns.GetHostName();
                    factory.Ssl.AcceptablePolicyErrors = System.Net.Security.SslPolicyErrors.RemoteCertificateNameMismatch | 
                                                         System.Net.Security.SslPolicyErrors.RemoteCertificateChainErrors;
                }

                // Reemplaza esta línea:
                // using var connection = factory.CreateConnection();
                // Por esta línea:
                using var connection = factory.CreateConnection();
                log.Add("✅ Conexión TCP/IP exitosa.");

                using var channel = connection.CreateModel();
                log.Add("✅ Canal creado.");

                // Intentamos crear una cola de prueba
                string queueName = "cola_prueba_diagnostico";
                channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
                log.Add($"✅ Cola '{queueName}' declarada/verificada en el servidor.");

                // Enviamos un mensaje
                // Enviamos un mensaje
                var body = System.Text.Encoding.UTF8.GetBytes("Hola desde el Diagnóstico");
                
                // CORRECCIÓN AQUÍ TAMBIÉN:
                channel.BasicPublish(exchange: "", 
                                    routingKey: queueName, 
                                    mandatory: false, // <--- AGREGAR ESTO
                                    basicProperties: null, 
                                    body: body);

                return Ok(new { Status = "ÉXITO", Pasos = log });
            }
            catch (Exception ex)
            {
                // AQUÍ SALDRÁ EL ERROR REAL
                return BadRequest(new 
                { 
                    Status = "FALLÓ", 
                    ErrorType = ex.GetType().Name,
                    Mensaje = ex.Message, 
                    StackTrace = ex.StackTrace,
                    Pasos = log
                });
            }
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
                FechaCreacion = DateTime.Now // ✅ Corregido a Hora Local
            };

            // 1. Guardar en Base de Datos Local
            var id = await _repo.CreateAsync(entity);

            // 2. INTEGRACIÓN RABBITMQ: Escenario 3 (Alta de Nuevo Equipo)
            try 
            {
                var payload = new 
                {
                    codigo_activo = $"ACT-{id}", // Generamos un código legible
                    nombre = req.Nombre,
                    fecha_compra = entity.FechaCreacion.ToString("yyyy-MM-dd"),
                    estado = "ACTIVO",
                    origen = "MODULO_ACTIVOS"
                };

                // Enviamos mensaje a la cola que escucha Mantenimiento
                _messageProducer.SendMessage(payload, "activos.nuevo.registrado");
            }
            catch (Exception ex)
            {
                // Loguear el error pero NO detener la creación del activo (Fail-safe)
                Console.WriteLine($"Error enviando a RabbitMQ: {ex.Message}");
            }

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
