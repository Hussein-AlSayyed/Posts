import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
]

@NgModule({
    imports: [
        AngularMaterialModule,
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule
    ]
})
export class AuthRoutingModule { }
