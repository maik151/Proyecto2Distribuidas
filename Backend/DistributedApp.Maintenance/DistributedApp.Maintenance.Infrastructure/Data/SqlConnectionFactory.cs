using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using DistributedApp.Maintenance.Application.Interfaces;

namespace DistributedApp.Maintenance.Infrastructure.Data
{
    public class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public SqlConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("BeaconDesk-AzureDatabase"));
        }
    }
}