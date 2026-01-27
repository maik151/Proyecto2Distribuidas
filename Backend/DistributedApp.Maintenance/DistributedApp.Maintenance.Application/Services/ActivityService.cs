using DistributedApp.Maintenance.Application.Interface;
using DistributedApp.Maintenance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Maintenance.Application.Services
{
    public class ActivityService : IActivityService
    {
        private readonly IActivityRepository _repository;

        public ActivityService(IActivityRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ActivityA>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                // Aquí podrías loguear el error
                throw new Exception("Error al obtener el listado de actividades.", ex);
            }
        }

        public async Task<ActivityA> GetByIdAsync(int id)
        {
            try
            {
                var result = await _repository.GetByIdAsync(id);
                if (result == null)
                    throw new KeyNotFoundException($"No se encontró la actividad con ID {id}");

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al buscar la actividad {id}.", ex);
            }
        }

        public async Task<int> CreateAsync(ActivityA activity)
        {
            try
            {
                // Validación básica de negocio
                if (string.IsNullOrEmpty(activity.NOMBRE))
                    throw new ArgumentException("El nombre de la actividad es obligatorio.");

                if (string.IsNullOrEmpty(activity.CODIGO))
                    throw new ArgumentException("El código de la actividad es obligatorio.");

                return await _repository.InsertAsync(activity);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear la actividad.", ex);
            }
        }

        public async Task<bool> UpdateAsync(ActivityA activity)
        {
            try
            {
                // Validamos que exista antes de intentar actualizar (opcional pero recomendado)
                var existing = await _repository.GetByIdAsync(activity.ID_ACTIVIDAD);
                if (existing == null)
                    throw new KeyNotFoundException($"La actividad con ID {activity.ID_ACTIVIDAD} no existe.");

                return await _repository.UpdateAsync(activity);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al actualizar la actividad.", ex);
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    throw new KeyNotFoundException($"La actividad con ID {id} no existe.");

                return await _repository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al eliminar la actividad.", ex);
            }
        }
    }
}