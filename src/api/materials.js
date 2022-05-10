import axios from "axios";

export const get = async (id) => {
  const res = await axios.get(`/materials/${id}`);

  return res.data.material;
};

export const getAll = async () => {
  const res = await axios.get("/materials");

  return res.data.materials;
};

export const add = async (data) => {
  const res = await axios.post("/materials", data);

  return res.data.material;
};

export const update = async (data) => {
  await axios.put(`/materials/${data.id}`, data);
};

export const remove = async (id) => {
  await axios.delete(`/materials/${id}`);
};
