# 1. IMAGEN BASE
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 2. COPIAR LOS .CSPROJ DE CADA CAPA
# Esto es vital para que Docker entienda las dependencias entre capas
COPY ["DistributedApp.Auth.Api/DistributedApp.Auth.Api.csproj", "DistributedApp.Auth.Api/"]
COPY ["DistributedApp.Auth.Application/DistributedApp.Auth.Application.csproj", "DistributedApp.Auth.Application/"]
COPY ["DistributedApp.Auth.Domain/DistributedApp.Auth.Domain.csproj", "DistributedApp.Auth.Domain/"]
COPY ["DistributedApp.Auth.Infrastructure/DistributedApp.Auth.Infrastructure.csproj", "DistributedApp.Auth.Infrastructure/"]

# 3. RESTAURAR DEPENDENCIAS
# Le decimos que restaure la API (automáticamente restaurará las otras porque están conectadas)
RUN dotnet restore "DistributedApp.Auth.Api/DistributedApp.Auth.Api.csproj"

# 4. COPIAR TODO EL CÓDIGO
COPY . .

# 5. COMPILAR Y PUBLICAR LA API
WORKDIR "/src/DistributedApp.Auth.Api"
RUN dotnet publish "DistributedApp.Auth.Api.csproj" -c Release -o /app/publish

# 6. IMAGEN FINAL (RUNTIME)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render usa PORT, pero .NET necesita saber dónde escuchar
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# OJO: Aquí el nombre del DLL cambia porque tu proyecto principal es .Api
ENTRYPOINT ["dotnet", "DistributedApp.Auth.Api.dll"]