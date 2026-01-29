using Dapper;
using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Domain.Entities;
using DistributedApp.Assets.Infraestructure.Data; // Asegúrate de tener el namespace de tu Data/ConnectionFactory
using System.Data;

namespace DistributedApp.Assets.Infraestructure.Repositories;

public class DepreciacionRepository : IDepreciacionRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public DepreciacionRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> CreateTransactionalAsync(DepreciacionCabecera cabecera, List<DepreciacionDetalle> detalles)
    {
        using var connection = _connectionFactory.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            const string sqlCabecera = @"
                INSERT INTO Activos.DepreciacionCabeceras 
                    (Fecha, Observaciones, Responsable, FechaRegistro, Estado)
                VALUES 
                    (@Fecha, @Observaciones, @Responsable, GETDATE(), 1);
                SELECT CAST(SCOPE_IDENTITY() AS int);";

            var idCabecera = await connection.QuerySingleAsync<int>(sqlCabecera, cabecera, transaction);

            const string sqlDetalle = @"
                INSERT INTO Activos.DepreciacionDetalles 
                    (IdDepreciacion, IdActivo, Periodo, ValorDepreciacion)
                VALUES 
                    (@IdDepreciacion, @IdActivo, @Periodo, @ValorDepreciacion);";

            foreach (var det in detalles)
            {
                det.IdDepreciacion = idCabecera;
                await connection.ExecuteAsync(sqlDetalle, det, transaction);
            }

            transaction.Commit();
            return idCabecera;
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<IEnumerable<DepreciacionCabecera>> GetAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Activos.DepreciacionCabeceras ORDER BY IdDepreciacion DESC";
        return await connection.QueryAsync<DepreciacionCabecera>(sql);
    }

    public async Task<DepreciacionCabecera?> GetByIdWithDetailsAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        const string sql = @"
            SELECT * FROM Activos.DepreciacionCabeceras WHERE IdDepreciacion = @Id;
            
            SELECT 
                d.IdDetalle, d.IdDepreciacion, d.IdActivo, d.Periodo, d.ValorDepreciacion,
                a.Nombre as NombreActivo 
            FROM Activos.DepreciacionDetalles d
            INNER JOIN Activos.Activos a ON d.IdActivo = a.IdActivo
            WHERE d.IdDepreciacion = @Id;";

        using var multi = await connection.QueryMultipleAsync(sql, new { Id = id });
        
        var cabecera = await multi.ReadSingleOrDefaultAsync<DepreciacionCabecera>();
        if (cabecera != null)
        {
            // Nota: Para que 'NombreActivo' se mapee, usamos Dapper dynamic o un DTO interno.
            // Aquí asumimos que mapeamos directo a la entidad.
            cabecera.Detalles = (await multi.ReadAsync<DepreciacionDetalle>()).ToList();
        }
        
        return cabecera;
    }

    // --- NUEVO MÉTODO ---
    public async Task<bool> AnularAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Activos.DepreciacionCabeceras 
            SET Estado = 0 
            WHERE IdDepreciacion = @Id";
            
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}