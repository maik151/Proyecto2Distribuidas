using Dapper;
using DistributedApp.Maintenance.Domain.Entities;
using DistributedApp.Maintenance.Infrastructure.Repositories;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

public class MaintenanceRepository : IMaintenanceRepository
{
    private readonly IDbConnection _db;

    public MaintenanceRepository(IDbConnection db)
    {
        _db = db;
    }

    // 1. LISTAR TODO
    public async Task<IEnumerable<MaintenanceHeader>> GetAllAsync()
    {
        // CORRECCIÓN: Usamos MANT_ACTIVO y MANT_ACTIVIDAD en los JOINs
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

        await _db.QueryAsync<MaintenanceHeader, MaintenanceDetail, MaintenanceHeader>(
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
        // CORRECCIÓN: Usamos MANT_ACTIVO y MANT_ACTIVIDAD en los JOINs
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

        await _db.QueryAsync<MaintenanceHeader, MaintenanceDetail, MaintenanceHeader>(
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
        _db.Open();
        using var transaction = _db.BeginTransaction();
        try
        {
            // CORRECCIÓN: Tabla MANT_CABECERA
            var sqlHead = @"INSERT INTO MANT_CABECERA (NUMERO, FECHA, RESPONSABLE, ESTADO_MQ) 
                            VALUES (@Numero, @Fecha, @Responsable, 'PENDIENTE');
                            SELECT CAST(SCOPE_IDENTITY() as int)";

            var id = await _db.QuerySingleAsync<int>(sqlHead, header, transaction);

            if (header.Detalles != null && header.Detalles.Any())
            {
                // CORRECCIÓN: Tabla MANT_DETALLE
                var sqlDetail = @"INSERT INTO MANT_DETALLE (ID_CABECERA, ID_ACTIVO, ID_ACTIVIDAD, VALOR)
                                  VALUES (@ID_CABECERA, @ID_ACTIVO, @ID_ACTIVIDAD, @VALOR)";

                foreach (var item in header.Detalles)
                {
                    item.ID_CABECERA = id;
                    await _db.ExecuteAsync(sqlDetail, item, transaction);
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
        finally { _db.Close(); }
    }

    // 4. ACTUALIZAR
    public async Task<bool> UpdateAsync(MaintenanceHeader header)
    {
        _db.Open();
        using var transaction = _db.BeginTransaction();
        try
        {
            // CORRECCIÓN: Tabla MANT_CABECERA
            var sqlHead = @"UPDATE MANT_CABECERA 
                            SET NUMERO = @Numero, FECHA = @Fecha, RESPONSABLE = @Responsable 
                            WHERE ID_CABECERA = @ID_CABECERA";
            await _db.ExecuteAsync(sqlHead, header, transaction);

            // CORRECCIÓN: Borrar de MANT_DETALLE
            await _db.ExecuteAsync("DELETE FROM MANT_DETALLE WHERE ID_CABECERA = @Id", new { Id = header.ID_CABECERA }, transaction);

            if (header.Detalles != null)
            {
                // CORRECCIÓN: Insertar en MANT_DETALLE
                var sqlDetail = @"INSERT INTO MANT_DETALLE (ID_CABECERA, ID_ACTIVO, ID_ACTIVIDAD, VALOR)
                                  VALUES (@ID_CABECERA, @ID_ACTIVO, @ID_ACTIVIDAD, @VALOR)";
                foreach (var item in header.Detalles)
                {
                    item.ID_CABECERA = header.ID_CABECERA;
                    await _db.ExecuteAsync(sqlDetail, item, transaction);
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
        finally { _db.Close(); }
    }

    // 5. ELIMINAR
    public async Task<bool> DeleteAsync(int id)
    {
        _db.Open();
        using var transaction = _db.BeginTransaction();
        try
        {
            // CORRECCIÓN: Tablas MANT_DETALLE y MANT_CABECERA
            await _db.ExecuteAsync("DELETE FROM MANT_DETALLE WHERE ID_CABECERA = @Id", new { Id = id }, transaction);
            await _db.ExecuteAsync("DELETE FROM MANT_CABECERA WHERE ID_CABECERA = @Id", new { Id = id }, transaction);

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            return false;
        }
        finally { _db.Close(); }
    }

    // 6. REPORTE
    public async Task<IEnumerable<MaintenanceDetail>> GetReportDataAsync(DateTime start, DateTime end)
    {
        // CORRECCIÓN: Usamos MANT_DETALLE, MANT_CABECERA, MANT_ACTIVO, MANT_ACTIVIDAD
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

        return await _db.QueryAsync<MaintenanceDetail>(sql, new { Start = start, End = end });
    }
}