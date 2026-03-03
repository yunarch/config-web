/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Category } from './Category';
import type { Tag } from './Tag';
export type Pet = {
  id?: number;
  name: string;
  category?: Category;
  photoUrls: Array<string>;
  tags?: Array<Tag>;
  /**
   * pet status in the store
   */
  status?: Pet.status;
};
export namespace Pet {
  /**
   * pet status in the store
   */
  export enum status {
    AVAILABLE = 'available',
    PENDING = 'pending',
    SOLD = 'sold',
  }
}
