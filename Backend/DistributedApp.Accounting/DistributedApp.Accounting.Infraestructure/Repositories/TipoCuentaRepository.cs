using Dapper;
using DistributedApp.Accounting.Application.Interfaces;
using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Infrastructure.Repositories
{
    public class TipoCuentaRepository : ITipoCuentaRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public TipoCuentaRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<TipoCuenta>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<TipoCuenta>(
                "SELECT * FROM Contabilidad.TipoCuenta WHERE Activo = 1");
        }

        public async Task<TipoCuenta?> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<TipoCuenta>(
                "SELECT * FROM Contabilidad.TipoCuenta WHERE IdTipoCuenta = @Id",
                new { Id = id });
        }

        public async Task<int> CreateAsync(TipoCuenta tipoCuenta)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                INSERT INTO Contabilidad.TipoCuenta (Codigo, Nombre, Activo)
                VALUES (@Codigo, @Nombre, 1);
                SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, tipoCuenta);
        }

        public async Task<bool> UpdateAsync(TipoCuenta tipoCuenta)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                UPDATE Contabilidad.TipoCuenta
                SET Codigo = @Codigo, Nombre = @Nombre
                WHERE IdTipoCuenta = @IdTipoCuenta";
            var rows = await connection.ExecuteAsync(sql, tipoCuenta);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "UPDATE Contabilidad.TipoCuenta SET Activo = 0 WHERE IdTipoCuenta = @Id",
                new { Id = id });
            return rows > 0;
        }
    }
}