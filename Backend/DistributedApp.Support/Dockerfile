# 1. IMAGEN DE CONSTRUCCIÓN (SDK)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos el archivo de proyecto y restauramos dependencias
# Ajusta la ruta si tu carpeta se llama diferente
COPY ["DistributedApp.Support/DistributedApp.Support.csproj", "DistributedApp.Support/"]
RUN dotnet restore "DistributedApp.Support/DistributedApp.Support.csproj"

# Copiamos todo el resto del código
COPY . .
WORKDIR "/src/DistributedApp.Support"

# Compilamos y publicamos
RUN dotnet build "DistributedApp.Support.csproj" -c Release -o /app/build
RUN dotnet publish "DistributedApp.Support.csproj" -c Release -o /app/publish

# 2. IMAGEN DE EJECUCIÓN (RUNTIME - Más ligera)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .

# Comando de inicio
ENTRYPOINT ["dotnet", "DistributedApp.Support.dll"]