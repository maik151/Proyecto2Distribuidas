using DistributedApp.Auth.Application.Interface;
using DistributedApp.Auth.Application.Interfaces;
using DistributedApp.Auth.Application.Services;
using DistributedApp.Auth.Infrastructure.Data;
using DistributedApp.Auth.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURACI�N CORS (La regla se llama "AllowFrontend")
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy => // <--- NOMBRE CLAVE
    {
        policy.AllowAnyOrigin()   // Permite localhost y cualquier dominio
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Inyecci�n de dependencias (Esto estaba bien)
builder.Services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors("AllowFrontend"); // <--- AQU� ESTABA EL ERROR (Dec�a "AllowAll")

app.UseAuthorization();

app.MapControllers();

app.Run();