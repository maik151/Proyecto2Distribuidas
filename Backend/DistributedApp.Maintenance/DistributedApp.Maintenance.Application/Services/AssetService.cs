using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Services
{
    public class AssetService : IAssetService
    {
        private readonly IAssetRepository _repository;

        public AssetService(IAssetRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Asset>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el listado de activos.", ex);
            }
        }

        // Este método daba error antes, ahora ya está implementado correctamente
        public async Task<Asset> GetByIdAsync(int id)
        {
            try
            {
                var asset = await _repository.GetByIdAsync(id);
                if (asset == null)
                    throw new KeyNotFoundException($"El activo con ID {id} no existe.");

                return asset;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al buscar el activo {id}.", ex);
            }
        }

        public async Task<int> CreateAsync(Asset asset)
        {
            try
            {
                if (string.IsNullOrEmpty(asset.CODIGO))
                    throw new ArgumentException("El código del activo es obligatorio.");

                if (string.IsNullOrEmpty(asset.NOMBRE))
                    throw new ArgumentException("El nombre del activo es obligatorio.");

                return await _repository.InsertAsync(asset);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al registrar el activo.", ex);
            }
        }

        public async Task<bool> UpdateAsync(Asset asset)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(asset.ID_ACTIVO);
                if (existing == null)
                    throw new KeyNotFoundException($"El activo con ID {asset.ID_ACTIVO} no existe.");

                return await _repository.UpdateAsync(asset);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al actualizar el activo.", ex);
            }
        }

        // Este método daba error antes, ahora ya está implementado correctamente
        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    throw new KeyNotFoundException($"El activo con ID {id} no existe.");

                return await _repository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al eliminar el activo.", ex);
            }
        }
    }
}