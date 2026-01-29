using DistributedApp.Accounting.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DistributedApp.Accounting.Api.Services
{
    public class RabbitMQWorker : BackgroundService
    {
        private readonly ILogger<RabbitMQWorker> _logger;
        private readonly IServiceProvider _serviceProvider;

        public RabbitMQWorker(ILogger<RabbitMQWorker> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 RabbitMQ Worker iniciado");

            using var scope = _serviceProvider.CreateScope();
            var rabbitService = scope.ServiceProvider.GetRequiredService<RabbitMQService>();

            try
            {
                rabbitService.Connect();
                rabbitService.StartListening();

                // Mantener el worker activo
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(5000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en el Worker de RabbitMQ");
            }
            finally
            {
                rabbitService.Disconnect();
            }
        }
    }
}