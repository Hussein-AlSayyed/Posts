import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

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

  onSignup(signupForm: NgForm) {
    if (signupForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(signupForm.value.email, signupForm.value.password);
  }

}
