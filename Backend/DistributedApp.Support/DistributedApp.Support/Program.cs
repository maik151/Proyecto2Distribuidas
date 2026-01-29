using DistributedApp.Support.Hubs;

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar SignalR
builder.Services.AddSignalR();

// 2. CORS (Permisivo para evitar dolores de cabeza iniciales en Render)
// OJO: En un futuro, cambia .AllowAnyOrigin() por la URL real de tu Front en Vercel/Netlify
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Permite cualquier origen
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Necesario para SignalR
    });
});

var app = builder.Build();

// 3. Importante: Escuchar en el puerto que Render asigne
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://0.0.0.0:{port}");

app.UseCors("AllowAll");

app.MapHub<SupportHub>("/chatHub");

app.Run();