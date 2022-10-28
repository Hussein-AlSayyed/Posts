import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AngularMaterialModule } from '../angular-material.module';
import { AuthRoutingModule } from './auth-routing.module';


@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        AuthRoutingModule,
        AngularMaterialModule,
    ],
    declarations: [
        LoginComponent,
        SignupComponent,
    ],
    providers: [],
})
export class AuthModule { }
