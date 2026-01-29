using Dapper;
using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Domain.Entities;
using DistributedApp.Assets.Infraestructure.Data;

namespace DistributedApp.Assets.Infraestructure.Repositories;

public class ActivoRepository : IActivoRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public ActivoRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Activo>> GetAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT 
                a.IdActivo,
                a.Nombre,
                a.PeriodosDepreciacionTotal,
                a.ValorCompra,
                a.IdTipoActivo,
                a.Activo AS IsActivo,
                a.FechaCreacion,   -- ✅ alias para mapear a la propiedad
                t.Nombre AS TipoActivoNombre
            FROM Activos.Activos a
            INNER JOIN Activos.TipoActivos t ON a.IdTipoActivo = t.IdTipoActivo
            WHERE a.Activo = 1
            ORDER BY a.IdActivo DESC;";

        return await connection.QueryAsync<Activo>(sql);
    }

    public async Task<Activo?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT 
                a.IdActivo,
                a.Nombre,
                a.PeriodosDepreciacionTotal,
                a.ValorCompra,
                a.IdTipoActivo,
                a.Activo AS IsActivo,
                a.FechaCreacion,
                t.Nombre AS TipoActivoNombre
            FROM Activos.Activos a
            INNER JOIN Activos.TipoActivos t ON a.IdTipoActivo = t.IdTipoActivo
            WHERE a.IdActivo = @Id AND a.Activo = 1;";

        return await connection.QueryFirstOrDefaultAsync<Activo>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Activo>> SearchAsync(string term)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT 
                a.IdActivo,
                a.Nombre,
                a.PeriodosDepreciacionTotal,
                a.ValorCompra,
                a.IdTipoActivo,
                a.Activo AS IsActivo,
                a.FechaCreacion,
                t.Nombre AS TipoActivoNombre
            FROM Activos.Activos a
            INNER JOIN Activos.TipoActivos t ON a.IdTipoActivo = t.IdTipoActivo
            WHERE a.Activo = 1
              AND (
                    a.Nombre LIKE '%' + @Term + '%'
                    OR t.Nombre LIKE '%' + @Term + '%'
                  )
            ORDER BY a.IdActivo DESC;";

        return await connection.QueryAsync<Activo>(sql, new { Term = term ?? string.Empty });
    }

    public async Task<IEnumerable<Activo>> GetReportAsync(DateTime from, DateTime toExclusive)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT 
                a.IdActivo,
                a.Nombre,
                a.PeriodosDepreciacionTotal,
                a.ValorCompra,
                a.IdTipoActivo,
                a.Activo AS IsActivo,
                a.FechaCreacion,   -- ✅ alias + consistente con filtros
                t.Nombre AS TipoActivoNombre
            FROM Activos.Activos a
            INNER JOIN Activos.TipoActivos t ON a.IdTipoActivo = t.IdTipoActivo
            WHERE a.Activo = 1
              AND a.FechaCreacion >= @From
              AND a.FechaCreacion <  @ToExclusive
            ORDER BY a.FechaCreacion DESC, a.IdActivo DESC;";

        return await connection.QueryAsync<Activo>(sql, new { From = from, ToExclusive = toExclusive });
    }

    public async Task<int> CreateAsync(Activo activo)
    {
        using var connection = _connectionFactory.CreateConnection();
        // CAMBIO: En VALUES, cambiamos GETDATE() por @FechaCreacion
        const string sql = @"
            INSERT INTO Activos.Activos 
                (Nombre, PeriodosDepreciacionTotal, ValorCompra, IdTipoActivo, Activo, FechaCreacion)
            VALUES 
                (@Nombre, @PeriodosDepreciacionTotal, @ValorCompra, @IdTipoActivo, 1, @FechaCreacion); 
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        return await connection.ExecuteScalarAsync<int>(sql, activo);
    }

    public async Task<bool> UpdateAsync(Activo activo)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Activos.Activos
            SET Nombre = @Nombre,
                PeriodosDepreciacionTotal = @PeriodosDepreciacionTotal,
                ValorCompra = @ValorCompra,
                IdTipoActivo = @IdTipoActivo
            WHERE IdActivo = @IdActivo AND Activo = 1;";

        var rows = await connection.ExecuteAsync(sql, activo);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Activos.Activos
            SET Activo = 0
            WHERE IdActivo = @Id;";

        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
