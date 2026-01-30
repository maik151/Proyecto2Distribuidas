using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Application.Interfaces;
using DistributedApp.Maintenance.Application.Services;
using DistributedApp.Maintenance.Infrastructure.Data;
using DistributedApp.Maintenance.Infrastructure.Messaging;
using DistributedApp.Maintenance.Infrastructure.Repositories;
using Microsoft.Data.SqlClient;
using System.Data;

var builder = WebApplication.CreateBuilder(args);

// =========================================================
// 1. CONFIGURACIÓN CORS
// =========================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =========================================================
// 2. CONEXIÓN Y FACTORY (Base de datos)
// =========================================================

// Registramos el Factory vinculado a su Interfaz
builder.Services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();

// TRUCO: Registramos TAMBIÉN la clase concreta por si algún repositorio antiguo
// (como ActivityRepository) la pide directamente y no por interfaz.
// Esto soluciona tu error actual sin editar todos los archivos.
builder.Services.AddSingleton<SqlConnectionFactory>();

// =========================================================
// 3. INYECCIÓN DE DEPENDENCIAS (REPOSITORIOS)
// =========================================================
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();

// =========================================================
// 4. RABBITMQ & SERVICIOS DE NEGOCIO
// =========================================================
builder.Services.AddScoped<IRabbitMQProducer, RabbitMQProducer>(); // Productor

builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IMaintenanceService, MaintenanceService>();

// Consumidor (Background Service)
builder.Services.AddHostedService<AssetConsumerService>();

var app = builder.Build();

// =========================================================
// 5. PIPELINE DE LA APLICACIÓN
// =========================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();