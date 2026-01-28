using DistributedApp.Assets.Domain.Entities;

namespace DistributedApp.Assets.Application.Interfaces;

public interface IActivoRepository
{
    Task<IEnumerable<Activo>> GetAllAsync();
    Task<Activo?> GetByIdAsync(int id);
    Task<IEnumerable<Activo>> SearchAsync(string term);

    /// <summary>
    /// Reporte por rango de fechas.
    /// <para>from: inclusivo (00:00)</para>
    /// <para>toExclusive: exclusivo (normalmente to + 1 día)</para>
    /// </summary>
    Task<IEnumerable<Activo>> GetReportAsync(DateTime from, DateTime toExclusive);

    Task<int> CreateAsync(Activo activo);
    Task<bool> UpdateAsync(Activo activo);
    Task<bool> DeleteAsync(int id);
}
