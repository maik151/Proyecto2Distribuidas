using Dapper;
using DistributedApp.Maintenance.Application.Interface;   // O .Interfaces según tu carpeta
using DistributedApp.Maintenance.Application.Interfaces; // Asegúrate de tener este using para el Factory
using DistributedApp.Maintenance.Domain.Entities;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace DistributedApp.Maintenance.Infrastructure.Repositories
{
    public class MaintenanceRepository : IMaintenanceRepository
    {
        // CAMBIO CLAVE: Inyectamos el Factory, no la conexión directa
        private readonly ISqlConnectionFactory _connectionFactory;

        public MaintenanceRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // 1. LISTAR TODO
        public async Task<IEnumerable<MaintenanceHeader>> GetAllAsync()
        {
            // Creamos la conexión fresca para esta operación
            using var connection = _connectionFactory.CreateConnection();

            var sql = @"
                SELECT 
                    c.ID_CABECERA, c.NUMERO, c.FECHA, c.RESPONSABLE, c.ESTADO_MQ,
                    d.ID_DETALLE, d.ID_CABECERA, d.ID_ACTIVO, d.ID_ACTIVIDAD, d.VALOR,
                    a.NOMBRE as NombreActivo,       
                    act.NOMBRE as NombreActividad   
                FROM MANT_CABECERA c
                LEFT JOIN MANT_DETALLE d ON c.ID_CABECERA = d.ID_CABECERA
                LEFT JOIN MANT_ACTIVO a ON d.ID_ACTIVO = a.ID_ACTIVO         
                LEFT JOIN MANT_ACTIVIDAD act ON d.ID_ACTIVIDAD = act.ID_ACTIVIDAD 
                ORDER BY c.ID_CABECERA DESC";

            var orderDictionary = new Dictionary<int, MaintenanceHeader>();

            await connection.QueryAsync<MaintenanceHeader, MaintenanceDetail, MaintenanceHeader>(
                sql,
                (header, detail) =>
                {
                    if (!orderDictionary.TryGetValue(header.ID_CABECERA, out var currentHeader))
                    {
                        currentHeader = header;
                        currentHeader.Detalles = new List<MaintenanceDetail>();
                        orderDictionary.Add(currentHeader.ID_CABECERA, currentHeader);
                    }

                    if (detail != null && detail.ID_DETALLE > 0)
                    {
                        currentHeader.Detalles.Add(detail);
                    }
                    return currentHeader;
                },
                splitOn: "ID_DETALLE"
            );

            return orderDictionary.Values;
        }

        // 2. OBTENER POR ID
        public async Task<MaintenanceHeader> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();

            var sql = @"
                SELECT 
                    c.ID_CABECERA, c.NUMERO, c.FECHA, c.RESPONSABLE, c.ESTADO_MQ,
                    d.ID_DETALLE, d.ID_CABECERA, d.ID_ACTIVO, d.ID_ACTIVIDAD, d.VALOR,
                    a.NOMBRE as NombreActivo,       
                    act.NOMBRE as NombreActividad   
                FROM MANT_CABECERA c
                LEFT JOIN MANT_DETALLE d ON c.ID_CABECERA = d.ID_CABECERA
                LEFT JOIN MANT_ACTIVO a ON d.ID_ACTIVO = a.ID_ACTIVO         
                LEFT JOIN MANT_ACTIVIDAD act ON d.ID_ACTIVIDAD = act.ID_ACTIVIDAD 
                WHERE c.ID_CABECERA = @Id";

            var orderDictionary = new Dictionary<int, MaintenanceHeader>();

            await connection.QueryAsync<MaintenanceHeader, MaintenanceDetail, MaintenanceHeader>(
                sql,
                (header, detail) =>
                {
                    if (!orderDictionary.TryGetValue(header.ID_CABECERA, out var currentHeader))
                    {
                        currentHeader = header;
                        currentHeader.Detalles = new List<MaintenanceDetail>();
                        orderDictionary.Add(currentHeader.ID_CABECERA, currentHeader);
                    }
                    if (detail != null && detail.ID_DETALLE > 0)
                    {
                        currentHeader.Detalles.Add(detail);
                    }
                    return currentHeader;
                },
                new { Id = id },
                splitOn: "ID_DETALLE"
            );

            return orderDictionary.Values.FirstOrDefault();
        }

        // 3. CREAR
        public async Task<int> CreateAsync(MaintenanceHeader header)
        {
            // Patrón correcto para transacciones con Factory
            using var connection = _connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open) connection.Open();

            using var transaction = connection.BeginTransaction();
            try
            {
                var sqlHead = @"INSERT INTO MANT_CABECERA (NUMERO, FECHA, RESPONSABLE, ESTADO_MQ) 
                                VALUES (@Numero, @Fecha, @Responsable, 'PENDIENTE');
                                SELECT CAST(SCOPE_IDENTITY() as int)";

                // Pasamos la transacción en cada llamada
                var id = await connection.QuerySingleAsync<int>(sqlHead, header, transaction);

                if (header.Detalles != null && header.Detalles.Any())
                {
                    var sqlDetail = @"INSERT INTO MANT_DETALLE (ID_CABECERA, ID_ACTIVO, ID_ACTIVIDAD, VALOR)
                                      VALUES (@ID_CABECERA, @ID_ACTIVO, @ID_ACTIVIDAD, @VALOR)";

                    foreach (var item in header.Detalles)
                    {
                        item.ID_CABECERA = id;
                        await connection.ExecuteAsync(sqlDetail, item, transaction);
                    }
                }

                transaction.Commit();
                return id;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // 4. ACTUALIZAR
        public async Task<bool> UpdateAsync(MaintenanceHeader header)
        {
            using var connection = _connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open) connection.Open();

            using var transaction = connection.BeginTransaction();
            try
            {
                var sqlHead = @"UPDATE MANT_CABECERA 
                                SET NUMERO = @Numero, FECHA = @Fecha, RESPONSABLE = @Responsable 
                                WHERE ID_CABECERA = @ID_CABECERA";
                await connection.ExecuteAsync(sqlHead, header, transaction);

                // Borrar detalles antiguos
                await connection.ExecuteAsync("DELETE FROM MANT_DETALLE WHERE ID_CABECERA = @Id", new { Id = header.ID_CABECERA }, transaction);

                if (header.Detalles != null)
                {
                    var sqlDetail = @"INSERT INTO MANT_DETALLE (ID_CABECERA, ID_ACTIVO, ID_ACTIVIDAD, VALOR)
                                      VALUES (@ID_CABECERA, @ID_ACTIVO, @ID_ACTIVIDAD, @VALOR)";
                    foreach (var item in header.Detalles)
                    {
                        item.ID_CABECERA = header.ID_CABECERA;
                        await connection.ExecuteAsync(sqlDetail, item, transaction);
                    }
                }

                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // 5. ELIMINAR
        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open) connection.Open();

            using var transaction = connection.BeginTransaction();
            try
            {
                await connection.ExecuteAsync("DELETE FROM MANT_DETALLE WHERE ID_CABECERA = @Id", new { Id = id }, transaction);
                await connection.ExecuteAsync("DELETE FROM MANT_CABECERA WHERE ID_CABECERA = @Id", new { Id = id }, transaction);

                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                return false;
            }
        }

        // 6. REPORTE
        public async Task<IEnumerable<MaintenanceDetail>> GetReportDataAsync(DateTime start, DateTime end)
        {
            using var connection = _connectionFactory.CreateConnection();

            var sql = @"
                SELECT 
                    d.ID_DETALLE, d.ID_CABECERA, d.ID_ACTIVO, d.ID_ACTIVIDAD, d.VALOR,
                    a.NOMBRE as NombreActivo,       
                    act.NOMBRE as NombreActividad,
                    c.FECHA   
                FROM MANT_DETALLE d
                INNER JOIN MANT_CABECERA c ON d.ID_CABECERA = c.ID_CABECERA
                INNER JOIN MANT_ACTIVO a ON d.ID_ACTIVO = a.ID_ACTIVO        
                INNER JOIN MANT_ACTIVIDAD act ON d.ID_ACTIVIDAD = act.ID_ACTIVIDAD
                WHERE c.FECHA >= @Start AND c.FECHA <= @End
                ORDER BY c.FECHA DESC";

            return await connection.QueryAsync<MaintenanceDetail>(sql, new { Start = start, End = end });
        }
    }
}