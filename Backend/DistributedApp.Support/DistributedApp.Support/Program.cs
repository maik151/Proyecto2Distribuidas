using DistributedApp.Support.Hubs;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddSignalR();


builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientPermission", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("ClientPermission");

// 3. Mapear la ruta del socket
// URL final: https://localhost:7500/chatHub
app.MapHub<SupportHub>("/chatHub");

app.Run();