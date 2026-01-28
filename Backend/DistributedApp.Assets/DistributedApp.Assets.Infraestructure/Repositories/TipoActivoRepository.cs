using Dapper;
using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Domain.Entities;

namespace DistributedApp.Assets.Infraestructure.Repositories;

public class TipoActivoRepository : ITipoActivoRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public TipoActivoRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<TipoActivo>> GetAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT IdTipoActivo, Nombre, Activo FROM Activos.TipoActivos WHERE Activo = 1 ORDER BY Nombre";
        return await connection.QueryAsync<TipoActivo>(sql);
    }

    public async Task<TipoActivo?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT IdTipoActivo, Nombre, Activo FROM Activos.TipoActivos WHERE IdTipoActivo = @Id";
        return await connection.QuerySingleOrDefaultAsync<TipoActivo>(sql, new { Id = id });
    }

    public async Task<IEnumerable<TipoActivo>> SearchAsync(string term)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT IdTipoActivo, Nombre, Activo
            FROM Activos.TipoActivos
            WHERE Activo = 1 AND Nombre LIKE '%' + @Term + '%'
            ORDER BY Nombre";
        return await connection.QueryAsync<TipoActivo>(sql, new { Term = term });
    }

    public async Task<int> CreateAsync(TipoActivo entity)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Activos.TipoActivos (Nombre, Activo)
            VALUES (@Nombre, 1);
            SELECT CAST(SCOPE_IDENTITY() AS int);";
        return await connection.QuerySingleAsync<int>(sql, entity);
    }

    public async Task<bool> UpdateAsync(TipoActivo entity)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Activos.TipoActivos
            SET Nombre = @Nombre
            WHERE IdTipoActivo = @IdTipoActivo";
        var rows = await connection.ExecuteAsync(sql, entity);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "UPDATE Activos.TipoActivos SET Activo = 0 WHERE IdTipoActivo = @Id";
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
