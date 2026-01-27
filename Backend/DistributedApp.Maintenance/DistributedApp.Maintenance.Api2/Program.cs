using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Application.Services;
using DistributedApp.Maintenance.Infrastructure.Data;
using DistributedApp.Maintenance.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);
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


builder.Services.AddScoped<SqlConnectionFactory>();


builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();


builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IMaintenanceService, MaintenanceService>();

var app = builder.Build();


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