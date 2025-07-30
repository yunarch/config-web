/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from '../models/Order';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StoreService {
  /**
   * Returns pet inventories by status.
   * Returns a map of status codes to quantities.
   * @returns number successful operation
   * @returns any Unexpected error
   * @throws ApiError
   */
  public static getInventory(): CancelablePromise<
    Record<string, number> | any
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/store/inventory',
    });
  }
  /**
   * Place an order for a pet.
   * Place a new order in the store.
   * @param requestBody
   * @returns Order successful operation
   * @returns any Unexpected error
   * @throws ApiError
   */
  public static placeOrder(
    requestBody?: Order
  ): CancelablePromise<Order | any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/store/order',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Invalid input`,
        422: `Validation exception`,
      },
    });
  }
  /**
   * Find purchase order by ID.
   * For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
   * @param orderId ID of order that needs to be fetched
   * @returns Order successful operation
   * @returns any Unexpected error
   * @throws ApiError
   */
  public static getOrderById(orderId: number): CancelablePromise<Order | any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/store/order/{orderId}',
      path: {
        orderId: orderId,
      },
      errors: {
        400: `Invalid ID supplied`,
        404: `Order not found`,
      },
    });
  }
  /**
   * Delete purchase order by identifier.
   * For valid response try integer IDs with value < 1000. Anything above 1000 or non-integers will generate API errors.
   * @param orderId ID of the order that needs to be deleted
   * @returns any order deleted
   * @throws ApiError
   */
  public static deleteOrder(orderId: number): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/store/order/{orderId}',
      path: {
        orderId: orderId,
      },
      errors: {
        400: `Invalid ID supplied`,
        404: `Order not found`,
      },
    });
  }
}
