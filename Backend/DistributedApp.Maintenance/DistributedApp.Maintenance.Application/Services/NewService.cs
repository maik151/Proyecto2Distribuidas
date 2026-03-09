using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Services
{
    public class NewService
    {
        private readonly IServiceNew _repository;
       

        public NewService(IServiceNew repository)
        {
            _repository = repository;
            
        }


        public async Task<decimal> ServicioObtenerMontoTotal_MJBS() {

            return await _repository.ObtenerMontoTotal_MJBS();
        
        }

    }
}
