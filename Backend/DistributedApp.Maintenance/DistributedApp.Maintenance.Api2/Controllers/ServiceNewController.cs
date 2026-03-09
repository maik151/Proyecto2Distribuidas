using Microsoft.AspNetCore.Mvc;
using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DistributedApp.Maintenance.Application.Services;

namespace DistributedApp.Maintenance.Api2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceNewController : ControllerBase
    {
        private readonly NewService _service;

        public ServiceNewController(NewService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Asset>>> OBTENERMONTOTOTAL_MJBS()
        {
            var data = await _service.ServicioObtenerMontoTotal_MJBS();


            return Ok(new { MontoTotal = data });
        }

        
    }
}