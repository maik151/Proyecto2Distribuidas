using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IRabbitMQProducer
    {
        // OJO: Ahora devuelve Task
        Task SendMessageAsync<T>(T message, string queueName);
    }
}
