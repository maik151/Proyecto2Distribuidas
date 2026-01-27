using Dapper;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities; // Aquí está ActivityA
using DistributedApp.Maintenance.Infrastructure.Data; // Aquí está el Factory
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Infrastructure.Repositories
{
    public class ActivityRepository : IActivityRepository
    {
        private readonly SqlConnectionFactory _sqlConnectionFactory;

        public ActivityRepository(SqlConnectionFactory sqlConnectionFactory)
        {
            _sqlConnectionFactory = sqlConnectionFactory;
        }

        public async Task<IEnumerable<ActivityA>> GetAllAsync()
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = "SELECT * FROM MANT_ACTIVIDAD WHERE ESTADO = 1";
            return await connection.QueryAsync<ActivityA>(sql);
        }

        public async Task<ActivityA> GetByIdAsync(int id)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = "SELECT * FROM MANT_ACTIVIDAD WHERE ID_ACTIVIDAD = @Id";
            return await connection.QueryFirstOrDefaultAsync<ActivityA>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(ActivityA entity)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            // Insertamos y devolvemos el ID generado (SCOPE_IDENTITY)
            var sql = @"
                INSERT INTO MANT_ACTIVIDAD (CODIGO, NOMBRE, ESTADO) 
                VALUES (@CODIGO, @NOMBRE, 1);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await connection.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(ActivityA entity)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = @"UPDATE MANT_ACTIVIDAD 
                        SET NOMBRE = @NOMBRE, 
                            CODIGO = @CODIGO 
                        WHERE ID_ACTIVIDAD = @ID_ACTIVIDAD";

            var rows = await connection.ExecuteAsync(sql, entity);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            // Borrado Lógico (Solo cambiamos el estado a 0)
            var sql = "UPDATE MANT_ACTIVIDAD SET ESTADO = 0 WHERE ID_ACTIVIDAD = @Id";

            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
}