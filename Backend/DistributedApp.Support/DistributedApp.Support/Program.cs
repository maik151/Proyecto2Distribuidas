using DistributedApp.Support.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();

// --- CORRECCIÓN DE CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", // Tu frontend local
                "https://tu-frontend-en-render.onrender.com" // <--- AGREGA AQUÍ LA URL DE TU FRONT SI YA LO SUBISTE
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials() // <--- OBLIGATORIO PARA SIGNALR
              .SetIsOriginAllowed(origin => true); // Permitir cualquier origen (solo para desarrollo/pruebas)
    });
});
// ---------------------------

var app = builder.Build();

// AJUSTE DE PUERTO PARA RENDER (Esto ya lo tenías, déjalo igual)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://0.0.0.0:{port}");

// --- IMPORTANTE: EL ORDEN ---
app.UseCors("AllowAll"); // <--- Debe ir ANTES de MapHub
app.MapHub<SupportHub>("/chatHub");

app.Run();