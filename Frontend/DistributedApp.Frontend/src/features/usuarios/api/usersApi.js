import { apiAuth } from "../../../core/api/axios";

export const getUsers = async () => {
  const resp = await apiAuth.get("/usuarios");
  return resp.data;
};

export const createUser = async (payload) => {
  const resp = await apiAuth.post("/usuarios", payload);
  return resp.data;
};

export const updateUser = async (idUsuario, payload) => {
  const resp = await apiAuth.put(`/usuarios/${idUsuario}`, payload);
  return resp.data;
};

export const deleteUser = async (idUsuario) => {
  const resp = await apiAuth.delete(`/usuarios/${idUsuario}`);
  return resp.data;
};

export const toggleActive = async (idUsuario, activo) => {
  const resp = await apiAuth.patch(`/usuarios/${idUsuario}/estado`, { Activo: activo });
  return resp.data;
};