using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace DistributedApp.Support.Hubs
{
    
    public class SupportHub : Hub
    {


        // Agregamos 'role' como parámetro
        public async Task SendMessage(string user, string role, string message)
        {
            Console.WriteLine($"[SERVIDOR] Recibido de {user}: {message}");
            // Forzamos "ReceiveMessage" tal cual
            await Clients.All.SendAsync("ReceiveMessage", user, role, message, DateTime.Now);
        }


    }
}