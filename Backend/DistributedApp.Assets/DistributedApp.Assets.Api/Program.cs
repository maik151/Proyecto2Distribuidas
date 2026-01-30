using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Infraestructure.Data;
using DistributedApp.Assets.Infraestructure.Repositories;
using DistributedApp.Assets.Infraestructure.Messaging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// REGISTRO DE RABBITMQ
builder.Services.AddScoped<IMessageProducer, RabbitMQProducer>();
// ✅ DB
builder.Services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

// ✅ Repositorios (CLAVE)
builder.Services.AddScoped<ITipoActivoRepository, TipoActivoRepository>();
builder.Services.AddScoped<IActivoRepository, ActivoRepository>();
builder.Services.AddScoped<IDepreciacionRepository, DepreciacionRepository>();

// ✅ CORS para Vite
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowVite");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
