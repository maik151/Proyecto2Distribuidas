using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Infrastructure.Data;
using DistributedApp.Accounting.Infrastructure.Repositories;
using DistributedApp.Accounting.Infrastructure.Services;
using DistributedApp.Accounting.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Inyección de Dependencias
builder.Services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<ITipoCuentaRepository, TipoCuentaRepository>();
builder.Services.AddScoped<ICuentaRepository, CuentaRepository>();
builder.Services.AddScoped<IComprobanteRepository, ComprobanteRepository>();

// 🆕 RabbitMQ Service
builder.Services.AddScoped<RabbitMQService>();

// 🆕 Background Worker para RabbitMQ
builder.Services.AddHostedService<RabbitMQWorker>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();