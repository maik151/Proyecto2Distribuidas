using Dapper;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Application.Interfaces;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Infrastructure.Repositories
{
    public class ServiceNewRepository: IServiceNew
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public ServiceNewRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }
        public async Task<decimal> ObtenerMontoTotal_MJBS() {

            var query = "SELECT COALESCE(SUM(VALOR), 0) as MontoTotal FROM MANT_DETALLE;";
            var conn = _connectionFactory.CreateConnection();

            var data = await conn.ExecuteScalarAsync<decimal>(query);

            return data;

        }
    }
}
