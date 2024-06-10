/**
 * Title: security.service.ts
 * Author: Professor Krasso
 * Date: 8/5/23
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  //constructor with http parameter
  constructor(private http: HttpClient) { }

  /**
   * Description: this function returns the employee by empId from the database
   * @param empId
   * @returns employee
   */
  findEmployeeById(empId: number) {
    return this.http.get('/api/employees/' + empId) // returns the employee by empId from the database
  }
}
