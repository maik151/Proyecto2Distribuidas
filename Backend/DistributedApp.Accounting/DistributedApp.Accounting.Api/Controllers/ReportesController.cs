using DistributedApp.Accounting.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Accounting.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : ControllerBase
    {
        private readonly IComprobanteRepository _comprobanteRepository;
        private readonly ICuentaRepository _cuentaRepository;
        private readonly ITipoCuentaRepository _tipoCuentaRepository;

        public ReportesController(
            IComprobanteRepository comprobanteRepository,
            ICuentaRepository cuentaRepository,
            ITipoCuentaRepository tipoCuentaRepository)
        {
            _comprobanteRepository = comprobanteRepository;
            _cuentaRepository = cuentaRepository;
            _tipoCuentaRepository = tipoCuentaRepository;
        }

        [HttpGet("saldos")]
        public async Task<IActionResult> GetSaldos([FromQuery] DateTime? fechaInicio, [FromQuery] DateTime? fechaFin)
        {
            try
            {
                // Obtener todos los comprobantes en el rango de fechas
                var comprobantes = await _comprobanteRepository.GetAllAsync();

                if (fechaInicio.HasValue)
                {
                    comprobantes = comprobantes.Where(c => c.Fecha >= fechaInicio.Value);
                }

                if (fechaFin.HasValue)
                {
                    comprobantes = comprobantes.Where(c => c.Fecha <= fechaFin.Value);
                }

                // Obtener todos los detalles de esos comprobantes
                var saldosPorCuenta = new Dictionary<int, decimal>();
                var debePorCuenta = new Dictionary<int, decimal>();
                var haberPorCuenta = new Dictionary<int, decimal>();

                foreach (var comprobante in comprobantes)
                {
                    var detalles = await _comprobanteRepository.GetDetallesByComprobanteAsync(comprobante.IdComprobante);

                    foreach (var detalle in detalles)
                    {
                        if (!debePorCuenta.ContainsKey(detalle.IdCuenta))
                        {
                            debePorCuenta[detalle.IdCuenta] = 0;
                            haberPorCuenta[detalle.IdCuenta] = 0;
                            saldosPorCuenta[detalle.IdCuenta] = 0;
                        }

                        debePorCuenta[detalle.IdCuenta] += detalle.Debe;
                        haberPorCuenta[detalle.IdCuenta] += detalle.Haber;
                        saldosPorCuenta[detalle.IdCuenta] += detalle.Debe - detalle.Haber;
                    }
                }

                // Obtener todas las cuentas con sus tipos
                var cuentas = await _cuentaRepository.GetAllAsync();
                var tipos = await _tipoCuentaRepository.GetAllAsync();

                var resultado = cuentas.Select(cuenta => new
                {
                    cuenta.IdCuenta,
                    cuenta.Codigo,
                    cuenta.Nombre,
                    cuenta.IdTipoCuenta,
                    cuenta.NombreTipoCuenta,
                    Debe = debePorCuenta.ContainsKey(cuenta.IdCuenta) ? debePorCuenta[cuenta.IdCuenta] : 0,
                    Haber = haberPorCuenta.ContainsKey(cuenta.IdCuenta) ? haberPorCuenta[cuenta.IdCuenta] : 0,
                    Saldo = saldosPorCuenta.ContainsKey(cuenta.IdCuenta) ? saldosPorCuenta[cuenta.IdCuenta] : 0
                }).ToList();

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpGet("balance-general")]
        public async Task<IActionResult> GetBalanceGeneral([FromQuery] DateTime? fechaInicio, [FromQuery] DateTime? fechaFin)
        {
            try
            {
                var saldosResponse = await GetSaldos(fechaInicio, fechaFin);
                var saldos = (saldosResponse as OkObjectResult)?.Value as List<object>;

                // Calcular totales por tipo
                var resultado = new
                {
                    FechaInicio = fechaInicio,
                    FechaFin = fechaFin,
                    Activo = new { Cuentas = new List<object>(), Total = 0m },
                    Pasivo = new { Cuentas = new List<object>(), Total = 0m },
                    Patrimonio = new { Cuentas = new List<object>(), Total = 0m }
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
}