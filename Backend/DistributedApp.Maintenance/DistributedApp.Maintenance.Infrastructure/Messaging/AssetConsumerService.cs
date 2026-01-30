using DistributedApp.Maintenance.Application.DTOs;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Application.Interfaces;
using DistributedApp.Maintenance.Domain.Entities;
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
        private const string QUEUE_NAME = "activos.nuevo.registrado";

        // En la versión 7, no creamos la conexión en el constructor porque es Async
        public AssetConsumerService(IServiceScopeFactory scopeFactory, ILogger<AssetConsumerService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var factory = new ConnectionFactory { HostName = "localhost" }; // Ajusta si usas Docker (ej: "rabbitmq")

            try
            {
                // 1. Conexión Asíncrona (RabbitMQ v7)
                using var connection = await factory.CreateConnectionAsync(stoppingToken);
                using var channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken);

                // 2. Declarar la cola (Async)
                await channel.QueueDeclareAsync(queue: QUEUE_NAME, durable: true, exclusive: false, autoDelete: false, arguments: null);

                _logger.LogInformation("🎧 [AssetConsumer] Escuchando RabbitMQ (v7)...");

                // 3. Crear el Consumidor (AsyncEventingBasicConsumer)
                var consumer = new AsyncEventingBasicConsumer(channel);

                consumer.ReceivedAsync += async (model, ea) =>
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);

                    _logger.LogInformation($"📥 [AssetConsumer] Recibido: {message}");

                    try
                    {
                        await ProcessMessage(message);
                        // Confirmación (ACK) Asíncrona
                        await channel.BasicAckAsync(ea.DeliveryTag, false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"❌ Error procesando activo: {ex.Message}");
                        // await channel.BasicNackAsync(ea.DeliveryTag, false, true); // Opcional: Reencolar si falla
                    }
                };

                // 4. Iniciar Consumo
                await channel.BasicConsumeAsync(queue: QUEUE_NAME, autoAck: false, consumer: consumer);

                // Mantener el servicio vivo mientras no se cancele
                // (En v7, como usamos 'using', si salimos de ExecuteAsync se cierra la conexión, por eso esperamos indefinidamente)
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogCritical($"FATAL: No se pudo conectar a RabbitMQ: {ex.Message}");
            }
        }

        private async Task ProcessMessage(string jsonMessage)
        {
            var dto = JsonSerializer.Deserialize<AssetIntegrationDto>(jsonMessage);

            if (dto != null)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var repository = scope.ServiceProvider.GetRequiredService<IAssetRepository>();

                    var newAsset = new Asset
                    {
                        CODIGO = dto.codigo_activo,
                        NOMBRE = dto.nombre,
                        FECHA_COMPRA = dto.fecha_compra,
                        ESTADO = true
                    };

                    await repository.InsertAsync(newAsset);

                    _logger.LogInformation($"✅ Activo {newAsset.NOMBRE} guardado en BD Local.");
                }
            }
        }
    }
}