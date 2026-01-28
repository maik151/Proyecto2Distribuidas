using Dapper;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using DistributedApp.Maintenance.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Infrastructure.Repositories
{
    public class MaintenanceRepository : IMaintenanceRepository
    {
        private readonly SqlConnectionFactory _sqlConnectionFactory;

        public MaintenanceRepository(SqlConnectionFactory sqlConnectionFactory)
        {
            _sqlConnectionFactory = sqlConnectionFactory;
        }

        public async Task<int> CreateTransactionAsync(MaintenanceHeader header, List<MaintenanceDetail> details)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            connection.Open(); // Dapper abre solo si es necesario, pero para transacciones es mejor abrir explícito

            using var transaction = connection.BeginTransaction();

            try
            {
                var sqlHead = @"
                    INSERT INTO MANT_CABECERA (NUMERO, FECHA, RESPONSABLE, ESTADO_MQ) 
                    VALUES (@NUMERO, @FECHA, @RESPONSABLE, 'PENDIENTE');
                    SELECT CAST(SCOPE_IDENTITY() as int);";

                int idCabecera = await connection.ExecuteScalarAsync<int>(sqlHead, header, transaction);

                var sqlDet = @"
                    INSERT INTO MANT_DETALLE (ID_CABECERA, ID_ACTIVO, ID_ACTIVIDAD, VALOR) 
                    VALUES (@ID_CABECERA, @ID_ACTIVO, @ID_ACTIVIDAD, @VALOR)";

                foreach (var item in details)
                {
                    item.ID_CABECERA = idCabecera;
                    await connection.ExecuteAsync(sqlDet, item, transaction);
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

        public async Task<IEnumerable<MaintenanceHeader>> GetAllHeadersAsync()
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = "SELECT * FROM MANT_CABECERA ORDER BY FECHA DESC";
            return await connection.QueryAsync<MaintenanceHeader>(sql);
        }

        public async Task<MaintenanceHeader> GetByIdWithDetailsAsync(int idHeader)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = @"
                SELECT * FROM MANT_CABECERA WHERE ID_CABECERA = @Id;
                SELECT D.*, A.NOMBRE as NombreActivo, S.NOMBRE as NombreActividad
                FROM MANT_DETALLE D
                INNER JOIN MANT_ACTIVO A ON D.ID_ACTIVO = A.ID_ACTIVO
                INNER JOIN MANT_ACTIVIDAD S ON D.ID_ACTIVIDAD = S.ID_ACTIVIDAD
                WHERE D.ID_CABECERA = @Id;";

            using var multi = await connection.QueryMultipleAsync(sql, new { Id = idHeader });

            var header = await multi.ReadFirstOrDefaultAsync<MaintenanceHeader>();
            if (header != null)
            {
                header.Detalles = (await multi.ReadAsync<MaintenanceDetail>()).ToList();
            }
            return header;
        }

        public async Task<IEnumerable<MaintenanceDetail>> GetReportDataAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            using var connection = _sqlConnectionFactory.CreateConnection();
            var sql = @"
                SELECT 
                    D.VALOR,
                    A.NOMBRE as NombreActivo, 
                    S.NOMBRE as NombreActividad
                FROM MANT_DETALLE D
                INNER JOIN MANT_CABECERA C ON D.ID_CABECERA = C.ID_CABECERA
                INNER JOIN MANT_ACTIVO A ON D.ID_ACTIVO = A.ID_ACTIVO
                INNER JOIN MANT_ACTIVIDAD S ON D.ID_ACTIVIDAD = S.ID_ACTIVIDAD
                WHERE C.FECHA >= @Inicio AND C.FECHA <= @Fin";

            return await connection.QueryAsync<MaintenanceDetail>(sql, new { Inicio = fechaInicio, Fin = fechaFin });
        }
    }
}