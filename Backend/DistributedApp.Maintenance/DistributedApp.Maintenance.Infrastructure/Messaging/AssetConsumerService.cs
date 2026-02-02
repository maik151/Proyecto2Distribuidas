using DistributedApp.Maintenance.Application.DTOs;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Application.Interfaces;
using DistributedApp.Maintenance.Domain.Entities;
using Microsoft.Extensions.Configuration; // <--- NECESARIO
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace DistributedApp.Maintenance.Infrastructure.Messaging
{
    public class AssetConsumerService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AssetConsumerService> _logger;
        private readonly IConfiguration _configuration; // <--- Agregamos esto
        private const string QUEUE_NAME = "activos.nuevo.registrado";

        // Inyectamos IConfiguration en el constructor
        public AssetConsumerService(IServiceScopeFactory scopeFactory, ILogger<AssetConsumerService> logger, IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // 1. LEER LA URL DESDE APPSETTINGS (CloudAMQP)
            var rabbitUrl = _configuration["RabbitMQ:Url"];

            if (string.IsNullOrEmpty(rabbitUrl))
            {
                _logger.LogCritical("❌ FATAL: No se encontró la URL de RabbitMQ en appsettings.json");
                return;
            }

            // Usamos la propiedad Uri para conectar a la nube
            var factory = new ConnectionFactory { Uri = new Uri(rabbitUrl) };

            try
            {
                // 2. Conexión Asíncrona (RabbitMQ v7)
                using var connection = await factory.CreateConnectionAsync(stoppingToken);
                using var channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken);

                // 3. Declarar la cola (Async)
                // Asegúrate que los parámetros (durable, exclusive) coincidan con los del Producer
                await channel.QueueDeclareAsync(queue: QUEUE_NAME, durable: true, exclusive: false, autoDelete: false, arguments: null);

                _logger.LogInformation($"[AssetConsumer] Conectado a CloudAMQP. Escuchando: {QUEUE_NAME}...");

                // 4. Crear el Consumidor
                var consumer = new AsyncEventingBasicConsumer(channel);

                consumer.ReceivedAsync += async (model, ea) =>
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);

                    _logger.LogInformation($"[AssetConsumer] Recibido JSON: {message}");

                    try
                    {
                        await ProcessMessage(message);
                        // Confirmación (ACK)
                        await channel.BasicAckAsync(ea.DeliveryTag, false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"❌ Error procesando activo: {ex.Message}");
                        // Si falla, podrías usar BasicNackAsync, pero por ahora solo logueamos
                    }
                };

                // 5. Iniciar Consumo
                await channel.BasicConsumeAsync(queue: QUEUE_NAME, autoAck: false, consumer: consumer);

                // Mantener vivo el servicio
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogCritical($"FATAL: Error al conectar con RabbitMQ: {ex.Message}");
            }
        }

        private async Task ProcessMessage(string jsonMessage)
        {
            // Opciones para que no importe mayúsculas/minúsculas en el JSON
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var dto = JsonSerializer.Deserialize<AssetIntegrationDto>(jsonMessage, options);

            if (dto != null)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var repository = scope.ServiceProvider.GetRequiredService<IAssetRepository>();

                    // MAPEO: Del DTO (Json) a tu Entidad (Mantenimiento)
                    var newAsset = new Asset
                    {
                        CODIGO = dto.CodigoActivo,
                        NOMBRE = dto.Nombre,
                        // Parseamos la fecha (asumiendo formato YYYY-MM-DD)
                        FECHA_COMPRA = DateTime.TryParse(dto.FechaCompra, out var date) ? date : DateTime.Now,
                        ESTADO = dto.Estado == "ACTIVO"
                    };

                    await repository.InsertAsync(newAsset);

                    _logger.LogInformation($"✅ Activo INSERTADO en BD Local: {newAsset.NOMBRE} ({newAsset.CODIGO})");
                }
            }
        }
    }
}