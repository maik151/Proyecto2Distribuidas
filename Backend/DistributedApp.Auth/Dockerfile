# 1. IMAGEN BASE (SDK para compilar)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 2. COPIAR Y RESTAURAR
# Copiamos el csproj y restauramos dependencias
COPY ["DistributedApp.Auth.csproj", "./"]
RUN dotnet restore "DistributedApp.Auth.csproj"

# 3. COPIAR TODO EL CÓDIGO Y COMPILAR
COPY . .
RUN dotnet publish "DistributedApp.Auth.csproj" -c Release -o /app/publish

# 4. IMAGEN FINAL (Runtime ligero)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render usa la variable PORT, ASP.NET Core debe escuchar ahí
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "DistributedApp.Auth.dll"]