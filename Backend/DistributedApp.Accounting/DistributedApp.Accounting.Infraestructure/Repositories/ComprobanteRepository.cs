using Dapper;
using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Infrastructure.Repositories
{
    public class ComprobanteRepository : IComprobanteRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public ComprobanteRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<ComprobanteContable>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<ComprobanteContable>(
                "SELECT * FROM Contabilidad.ComprobanteContable WHERE Activo = 1 ORDER BY Fecha DESC");
        }

        public async Task<ComprobanteContable?> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<ComprobanteContable>(
                "SELECT * FROM Contabilidad.ComprobanteContable WHERE IdComprobante = @Id",
                new { Id = id });
        }

        public async Task<int> CreateAsync(ComprobanteContable comprobante)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                INSERT INTO Contabilidad.ComprobanteContable (Numero, Fecha, Observaciones, Activo)
                VALUES (@Numero, @Fecha, @Observaciones, 1);
                SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, comprobante);
        }

        public async Task<bool> UpdateAsync(ComprobanteContable comprobante)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                UPDATE Contabilidad.ComprobanteContable
                SET Numero = @Numero, Fecha = @Fecha, Observaciones = @Observaciones
                WHERE IdComprobante = @IdComprobante";
            var rows = await connection.ExecuteAsync(sql, comprobante);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "UPDATE Contabilidad.ComprobanteContable SET Activo = 0 WHERE IdComprobante = @Id",
                new { Id = id });
            return rows > 0;
        }

        public async Task<IEnumerable<DetalleComprobante>> GetDetallesByComprobanteAsync(int idComprobante)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                SELECT d.*, c.Nombre AS NombreCuenta
                FROM Contabilidad.DetalleComprobante d
                INNER JOIN Contabilidad.Cuenta c ON d.IdCuenta = c.IdCuenta
                WHERE d.IdComprobante = @IdComprobante";
            return await connection.QueryAsync<DetalleComprobante>(sql, new { IdComprobante = idComprobante });
        }

        public async Task<int> CreateDetalleAsync(DetalleComprobante detalle)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                INSERT INTO Contabilidad.DetalleComprobante (IdComprobante, IdCuenta, Debe, Haber)
                VALUES (@IdComprobante, @IdCuenta, @Debe, @Haber);
                SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, detalle);
        }

        public async Task<bool> DeleteDetalleAsync(int idDetalle)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "DELETE FROM Contabilidad.DetalleComprobante WHERE IdDetalle = @Id",
                new { Id = idDetalle });
            return rows > 0;
        }
    }
}