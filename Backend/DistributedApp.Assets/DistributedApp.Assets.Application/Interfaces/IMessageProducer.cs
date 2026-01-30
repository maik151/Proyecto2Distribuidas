namespace DistributedApp.Assets.Application.Interfaces
{
    public interface IMessageProducer
    {
        void SendMessage<T>(T message, string routingKey);
    }
}