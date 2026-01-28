namespace DistributedApp.Assets.Application.DTOs;

public record TipoActivoResponse(int IdTipoActivo, string Nombre);

public record TipoActivoCreateRequest(string Nombre);

public record TipoActivoUpdateRequest(string Nombre);
