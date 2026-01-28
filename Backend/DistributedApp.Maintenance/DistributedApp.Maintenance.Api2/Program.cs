using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Application.Services;
using DistributedApp.Maintenance.Infrastructure.Data;
using DistributedApp.Maintenance.Infrastructure.Repositories;
using System.Data;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// =========================================================
// 1. CONFIGURACIÓN CORS (ESTO ES LO QUE FALTABA)
// =========================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()  // Permite todas las URLs (localhost:5173, etc)
              .AllowAnyMethod()  // Permite GET, POST, PUT, DELETE
              .AllowAnyHeader(); // Permite enviar Tokens y JSON
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =========================================================
// 2. CONEXIÓN BASE DE DATOS (Dapper)
// =========================================================
// Nota: Usé "BeaconDesk-AzureDatabase" porque vi que así lo tienes en tu código
builder.Services.AddScoped<IDbConnection>(sp =>
    new SqlConnection(builder.Configuration.GetConnectionString("BeaconDesk-AzureDatabase")));

// Factory (Si lo usas en otros repos antiguos)
builder.Services.AddScoped<SqlConnectionFactory>();

// =========================================================
// 3. INYECCIÓN DE DEPENDENCIAS (REPOSITORIOS)
// =========================================================
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();

// =========================================================
// 4. RABBITMQ & SERVICIOS DE NEGOCIO
// =========================================================
builder.Services.AddScoped<IRabbitMQProducer, RabbitMQProducer>(); // <--- El Productor

builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IMaintenanceService, MaintenanceService>(); // <--- El Servicio Principal

var app = builder.Build();

// =========================================================
// 5. PIPELINE DE LA APLICACIÓN
// =========================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ¡IMPORTANTE! UseCors debe ir ANTES de UseAuthorization y MapControllers
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();