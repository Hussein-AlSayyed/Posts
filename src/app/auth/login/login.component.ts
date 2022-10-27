import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading = false;
  authSubs: Subscription;


  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authSubs = this.authService.getAuthStatusListner().subscribe(authStatus => {
      this.isLoading = false;
    })
  }

  ngOnDestroy(): void {
    this.authSubs.unsubscribe();
  }


  onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.login(loginForm.value.email, loginForm.value.password);
  }

}
