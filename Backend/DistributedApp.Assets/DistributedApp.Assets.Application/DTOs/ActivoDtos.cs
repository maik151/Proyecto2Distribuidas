namespace DistributedApp.Assets.Application.DTOs;

public record ActivoCreateRequest(
    string Nombre,
    int PeriodosDepreciacionTotal,
    decimal ValorCompra,
    int IdTipoActivo
);

public record ActivoUpdateRequest(
    string Nombre,
    int PeriodosDepreciacionTotal,
    decimal ValorCompra,
    int IdTipoActivo
);

public record ActivoResponse(
        int IdActivo,
        string Nombre,
        int PeriodosDepreciacionTotal,
        decimal ValorCompra,
        int IdTipoActivo,
        DateTime FechaCreacion,         // <-- NUEVO
        string? TipoActivoNombre
    );

// Reporte por rango de fechas
public record ActivoReportResponse(
    int IdActivo,
    string Nombre,
    string? TipoActivoNombre,
    decimal ValorCompra,
    int PeriodosDepreciacionTotal,
    DateTime FechaRegistro
);
