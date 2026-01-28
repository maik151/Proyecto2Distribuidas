using Dapper;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using DistributedApp.Maintenance.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Infrastructure.Repositories
{
    public class AssetRepository : IAssetRepository
    {
        private readonly SqlConnectionFactory _sqlConnectionFactory;

        // Inyección del Factory corregida
        public AssetRepository(SqlConnectionFactory sqlConnectionFactory)
        {
            _sqlConnectionFactory = sqlConnectionFactory;
        }

        public async Task<IEnumerable<Asset>> GetAllAsync()
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = "SELECT * FROM MANT_ACTIVO WHERE ESTADO = 1";
            return await connection.QueryAsync<Asset>(sql);
        }

        public async Task<Asset> GetByIdAsync(int id)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = "SELECT * FROM MANT_ACTIVO WHERE ID_ACTIVO = @Id";
            return await connection.QueryFirstOrDefaultAsync<Asset>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(Asset entity)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = @"
                INSERT INTO MANT_ACTIVO (CODIGO, NOMBRE, FECHA_COMPRA, ESTADO) 
                VALUES (@CODIGO, @NOMBRE, @FECHA_COMPRA, 1);
                SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Asset entity)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = @"UPDATE MANT_ACTIVO SET NOMBRE = @NOMBRE, CODIGO = @CODIGO, FECHA_COMPRA = @FECHA_COMPRA WHERE ID_ACTIVO = @ID_ACTIVO";
            var rows = await connection.ExecuteAsync(sql, entity);
            return rows > 0;
        }

        // Aunque tu interfaz base tiene Delete, recuerda que es borrado lógico
        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = "UPDATE MANT_ACTIVO SET ESTADO = 0 WHERE ID_ACTIVO = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
}