using DistributedApp.Accounting.Domain.Entities;

namespace DistributedApp.Accounting.Application.Interfaces
{
    public interface IComprobanteRepository
    {
        Task<IEnumerable<ComprobanteContable>> GetAllAsync();
        Task<ComprobanteContable?> GetByIdAsync(int id);
        Task<int> CreateAsync(ComprobanteContable comprobante);
        Task<bool> UpdateAsync(ComprobanteContable comprobante);
        Task<bool> DeleteAsync(int id);

        // Detalles
        Task<IEnumerable<DetalleComprobante>> GetDetallesByComprobanteAsync(int idComprobante);
        Task<int> CreateDetalleAsync(DetalleComprobante detalle);
        Task<bool> DeleteDetalleAsync(int idDetalle);
    }
}