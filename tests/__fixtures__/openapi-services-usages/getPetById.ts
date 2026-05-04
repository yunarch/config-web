import { PetService } from '../../__mocks__/openapi-gen-input';

export const getPetById = async (id: number) => {
  return PetService.getPetById(id);
};
