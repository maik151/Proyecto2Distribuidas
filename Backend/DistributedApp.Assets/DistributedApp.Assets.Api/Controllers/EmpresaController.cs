using Dapper;
using DistributedApp.Assets.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace DistributedApp.Assets.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EmpresaController : ControllerBase
{
    private readonly string _connectionString;

    public EmpresaController(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("BeaconDesk-AzureDatabase");
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        using var db = new SqlConnection(_connectionString);
        // Siempre retornamos el ID 1
        var empresa = await db.QueryFirstOrDefaultAsync<Empresa>("SELECT * FROM Activos.Empresa WHERE IdEmpresa = 1");
        return Ok(empresa);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] Empresa req)
    {
        using var db = new SqlConnection(_connectionString);
        var sql = @"UPDATE Activos.Empresa 
                    SET Nombre = @Nombre, Departamento = @Departamento, 
                        Ruc = @Ruc, Direccion = @Direccion, Ciudad = @Ciudad 
                    WHERE IdEmpresa = 1"; // Forzamos ID 1
        
        await db.ExecuteAsync(sql, req);
        return Ok(new { Message = "Cabecera actualizada correctamente" });
    }
}