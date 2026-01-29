using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using DistributedApp.Accounting.Application.DTOs;
using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Infrastructure.Services
{
    public class RabbitMQService
    {
        private readonly ILogger<RabbitMQService> _logger;
        private readonly IComprobanteRepository _comprobanteRepository;
        private readonly ICuentaRepository _cuentaRepository;
        private IConnection? _connection;
        private IModel? _channel;

        // 🔥 URL COMPLETA DE RABBITMQ
        private const string RABBITMQ_URL = "amqps://jxflsaoh:ZvYqv3-5b6QfJQVfY8GHFQUflwYAiN1M@gorilla.lmq.cloudamqp.com/jxflsaoh";
        private const string QUEUE_NAME = "contabilidad_queue";

        public RabbitMQService(
            ILogger<RabbitMQService> logger,
            IComprobanteRepository comprobanteRepository,
            ICuentaRepository cuentaRepository)
        {
            _logger = logger;
            _comprobanteRepository = comprobanteRepository;
            _cuentaRepository = cuentaRepository;
        }

        public void Connect()
        {
            try
            {
                var factory = new ConnectionFactory()
                {
                    Uri = new Uri(RABBITMQ_URL),
                    AutomaticRecoveryEnabled = true,
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                // Declarar la cola (si no existe)
                _channel.QueueDeclare(
                    queue: QUEUE_NAME,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null
                );

                _logger.LogInformation("✅ Conectado a RabbitMQ - Cola: {Queue}", QUEUE_NAME);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al conectar con RabbitMQ");
                throw;
            }
        }

        public void StartListening()
        {
            if (_channel == null)
            {
                _logger.LogError("❌ Canal no inicializado. Llama a Connect() primero.");
                return;
            }

            var consumer = new EventingBasicConsumer(_channel);

            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var routingKey = ea.RoutingKey;

                _logger.LogInformation("📩 Mensaje recibido - Routing Key: {RoutingKey}", routingKey);
                _logger.LogInformation("📄 Contenido: {Message}", message);

                try
                {
                    // Procesar según el tipo de mensaje
                    await ProcesarMensaje(message, routingKey);

                    // Confirmar que se procesó correctamente
                    _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                    _logger.LogInformation("✅ Mensaje procesado y confirmado");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error al procesar mensaje");

                    // Rechazar y reencolar (o enviarlo a Dead Letter)
                    _channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
                }
            };

            _channel.BasicConsume(
                queue: QUEUE_NAME,
                autoAck: false,
                consumer: consumer
            );

            _logger.LogInformation("👂 Escuchando mensajes en la cola: {Queue}", QUEUE_NAME);
        }

        private async Task ProcesarMensaje(string mensaje, string routingKey)
        {
            // Detectar automáticamente el tipo de mensaje por sus propiedades
            try
            {
                // Intentar deserializar como mensaje de mantenimiento
                if (mensaje.Contains("monto_total") && mensaje.Contains("tipo_gasto"))
                {
                    await ProcesarGastoMantenimiento(mensaje);
                }
                // Intentar deserializar como mensaje de depreciación
                else if (mensaje.Contains("total_depreciado") && mensaje.Contains("periodo"))
                {
                    await ProcesarDepreciacion(mensaje);
                }
                // Mensaje de nuevo activo (solo log)
                else if (mensaje.Contains("codigo_activo"))
                {
                    _logger.LogInformation("ℹ️ Nuevo activo registrado (sin acción contable): {Mensaje}", mensaje);
                }
                else
                {
                    _logger.LogWarning("⚠️ Tipo de mensaje desconocido: {Mensaje}", mensaje);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al identificar tipo de mensaje");
                throw;
            }
        }

        // ESCENARIO 1: Gasto de Mantenimiento
        private async Task ProcesarGastoMantenimiento(string mensaje)
        {
            try
            {
                var data = JsonSerializer.Deserialize<MensajeMantenimientoGasto>(mensaje);
                if (data == null) throw new Exception("Mensaje inválido");

                _logger.LogInformation("💰 Procesando Gasto de Mantenimiento: {Id}", data.id_transaccion);

                // Buscar cuentas necesarias
                var cuentas = await _cuentaRepository.GetAllAsync();
                var cuentaGasto = cuentas.FirstOrDefault(c => c.Nombre.Contains("Gasto") || c.Nombre.Contains("Mantenimiento"));
                var cuentaBanco = cuentas.FirstOrDefault(c => c.Nombre.Contains("Banco") || c.Nombre.Contains("Caja"));

                if (cuentaGasto == null || cuentaBanco == null)
                {
                    _logger.LogError("❌ No se encontraron las cuentas necesarias (Gasto y Banco)");
                    return;
                }

                // Generar número único para el comprobante
                var numeroComprobante = GenerarNumeroComprobante(data.id_transaccion);

                // Crear Comprobante Automático
                var comprobante = new ComprobanteContable
                {
                    Numero = numeroComprobante,
                    Fecha = DateTime.Parse(data.fecha),
                    Observaciones = $"[AUTO MANTENIMIENTO] {data.glosa}",
                    Activo = true
                };

                var idComprobante = await _comprobanteRepository.CreateAsync(comprobante);

                // Detalle 1: DEBE - Gasto
                await _comprobanteRepository.CreateDetalleAsync(new DetalleComprobante
                {
                    IdComprobante = idComprobante,
                    IdCuenta = cuentaGasto.IdCuenta,
                    Debe = data.monto_total,
                    Haber = 0
                });

                // Detalle 2: HABER - Banco
                await _comprobanteRepository.CreateDetalleAsync(new DetalleComprobante
                {
                    IdComprobante = idComprobante,
                    IdCuenta = cuentaBanco.IdCuenta,
                    Debe = 0,
                    Haber = data.monto_total
                });

                _logger.LogInformation("✅ Comprobante #{Id} creado automáticamente - Monto: ${Monto}",
                    idComprobante, data.monto_total);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al procesar gasto de mantenimiento");
                throw;
            }
        }

        // ESCENARIO 2: Depreciación de Activos
        private async Task ProcesarDepreciacion(string mensaje)
        {
            try
            {
                var data = JsonSerializer.Deserialize<MensajeDepreciacion>(mensaje);
                if (data == null) throw new Exception("Mensaje inválido");

                _logger.LogInformation("📉 Procesando Depreciación: {Periodo}", data.periodo);

                var cuentas = await _cuentaRepository.GetAllAsync();
                var cuentaGastoDepre = cuentas.FirstOrDefault(c => c.Nombre.Contains("Depreciación") && c.Nombre.Contains("Gasto"));
                var cuentaDepreAcum = cuentas.FirstOrDefault(c => c.Nombre.Contains("Depreciación") && c.Nombre.Contains("Acumulada"));

                if (cuentaGastoDepre == null || cuentaDepreAcum == null)
                {
                    _logger.LogError("❌ No se encontraron las cuentas de depreciación");
                    return;
                }

                // Generar número único
                var numeroComprobante = int.Parse(DateTime.Now.ToString("yyyyMMddHHmmss").Substring(2));

                var comprobante = new ComprobanteContable
                {
                    Numero = numeroComprobante,
                    Fecha = DateTime.Parse(data.fecha_proceso),
                    Observaciones = $"[AUTO DEPRECIACIÓN] {data.glosa}",
                    Activo = true
                };

                var idComprobante = await _comprobanteRepository.CreateAsync(comprobante);

                // DEBE: Gasto por Depreciación
                await _comprobanteRepository.CreateDetalleAsync(new DetalleComprobante
                {
                    IdComprobante = idComprobante,
                    IdCuenta = cuentaGastoDepre.IdCuenta,
                    Debe = data.total_depreciado,
                    Haber = 0
                });

                // HABER: Depreciación Acumulada
                await _comprobanteRepository.CreateDetalleAsync(new DetalleComprobante
                {
                    IdComprobante = idComprobante,
                    IdCuenta = cuentaDepreAcum.IdCuenta,
                    Debe = 0,
                    Haber = data.total_depreciado
                });

                _logger.LogInformation("✅ Asiento de depreciación #{Id} creado - Monto: ${Monto}",
                    idComprobante, data.total_depreciado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al procesar depreciación");
                throw;
            }
        }

        private int GenerarNumeroComprobante(string id_transaccion)
        {
            // Extraer números del ID
            var numeros = new string(id_transaccion.Where(char.IsDigit).ToArray());

            if (string.IsNullOrEmpty(numeros))
            {
                // Si no hay números, usar timestamp
                return int.Parse(DateTime.Now.ToString("HHmmss"));
            }

            return int.Parse(numeros);
        }

        public void Disconnect()
        {
            _channel?.Close();
            _connection?.Close();
            _logger.LogInformation("🔌 Desconectado de RabbitMQ");
        }
    }
}