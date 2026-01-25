using Dapper;
using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Infrastructure.Repositories
{
    public class CuentaRepository : ICuentaRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public CuentaRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Cuenta>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                SELECT c.*, tc.Nombre AS NombreTipoCuenta
                FROM Contabilidad.Cuenta c
                INNER JOIN Contabilidad.TipoCuenta tc ON c.IdTipoCuenta = tc.IdTipoCuenta
                WHERE c.Activo = 1";
            return await connection.QueryAsync<Cuenta>(sql);
        }

        public async Task<Cuenta?> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Cuenta>(
                "SELECT * FROM Contabilidad.Cuenta WHERE IdCuenta = @Id",
                new { Id = id });
        }

        public async Task<int> CreateAsync(Cuenta cuenta)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                INSERT INTO Contabilidad.Cuenta (Codigo, Nombre, IdTipoCuenta, Activo)
                VALUES (@Codigo, @Nombre, @IdTipoCuenta, 1);
                SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, cuenta);
        }

        public async Task<bool> UpdateAsync(Cuenta cuenta)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                UPDATE Contabilidad.Cuenta
                SET Codigo = @Codigo, Nombre = @Nombre, IdTipoCuenta = @IdTipoCuenta
                WHERE IdCuenta = @IdCuenta";
            var rows = await connection.ExecuteAsync(sql, cuenta);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "UPDATE Contabilidad.Cuenta SET Activo = 0 WHERE IdCuenta = @Id",
                new { Id = id });
            return rows > 0;
        }
    }
}