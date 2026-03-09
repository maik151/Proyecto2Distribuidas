using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Interface
{
    public interface IServiceNew
    {
        Task<decimal> ObtenerMontoTotal_MJBS();

    }
}
