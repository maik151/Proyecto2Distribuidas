using System.Text;
using System.Text.Json;
using DistributedApp.Assets.Application.Interfaces;
using RabbitMQ.Client;
using Microsoft.Extensions.Configuration; // <--- ESTO FALTABA PARA IConfiguration

namespace DistributedApp.Assets.Infraestructure.Messaging;

public class RabbitMQProducer : IMessageProducer
{
    private readonly string _url;

    // Inyectamos IConfiguration para leer el appsettings.json
    public RabbitMQProducer(IConfiguration configuration)
    {
        // CORRECCIÓN DEL ERROR DE ARGUMENTNULL:
        // Usamos InvalidOperationException porque es un error de configuración, no de argumento nulo del método.
        _url = configuration["RabbitMQ:Url"] 
               ?? throw new InvalidOperationException("La URL de RabbitMQ no se encontró en appsettings.json");
    }

    public void SendMessage<T>(T message, string routingKey)
    {
        var factory = new ConnectionFactory
        {
            Uri = new Uri(_url)
        };

        using var connection = factory.CreateConnection();
        using var channel = connection.CreateModel();

        channel.QueueDeclare(queue: routingKey,
                             durable: true,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);

        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;

        // CORRECCIÓN: Agregamos 'mandatory: false'
        channel.BasicPublish(exchange: "",
                             routingKey: routingKey,
                             mandatory: false, // <--- ESTO FALTABA
                             basicProperties: properties,
                             body: body);
    }
}