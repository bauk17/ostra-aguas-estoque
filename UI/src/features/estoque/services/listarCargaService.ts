import { listarCargas } from '../repository';

export async function listarCargasService() {
  const cargas = await listarCargas();

  return cargas.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );
}