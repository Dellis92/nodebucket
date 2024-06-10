/**
 * Title: security.module.ts
 * Author: Professor Krasso
 * Date: 8/5/23
*/

// imports statements
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { SecurityRouteingModule } from "./security-routing.module";
import { SigninComponent } from "./signin/signin.component";
import { SecurityComponent } from "./security.component";
import { Router } from "express";

@NgModule({
  declarations: [
    SigninComponent,
    SecurityComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SecurityRouteingModule,
    HttpClientModule
  ]
})
export class SecurityModule { }