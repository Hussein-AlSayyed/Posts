import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private http: HttpClient, private router: Router) { }

    private token: string;
    private authTimer: any;
    private authStatusListener = new BehaviorSubject<boolean>(false);

    getToken() {
        return this.token;
    }

    getAuthStatusListner() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post('http://localhost:3000/api/user/signup', authData)
            .subscribe(response => {
                console.log(response);
                this.router.navigate(['/']);
            })
    }

    login(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post<{ token: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData)
            .subscribe(response => {
                const token = response.token;
                if (token) {
                    this.token = token;
                    this.authStatusListener.next(true);
                    const expiresIn = response.expiresIn;
                    this.authTimer = this.autoLogoutTimer(expiresIn);
                    const expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));
                    this.saveAuthData(token, expirationDate);
                    this.router.navigate(['/']);
                }
            })
    }


    logout() {
        this.token = null;
        this.authStatusListener.next(false);
        this.clearAuthData();
        if (this.authTimer) {
            clearTimeout(this.authTimer);
        }
        this.router.navigate(['/']);
    }

    private autoLogoutTimer(expiresIn: number) {
        return setTimeout(() => {
            this.logout();
        }, expiresIn * 1000);
    }

    autoLogin() {
        const authData = this.getAuthData();
        if (authData) {
            const expiresIn = authData.expirationDate.getTime() - new Date().getTime();
            if (expiresIn > 0) {
                this.token = authData.token;
                this.authStatusListener.next(true);
                this.authTimer = this.autoLogoutTimer(expiresIn / 1000);
            }
        }
    }

    private saveAuthData(token: string, expirationDate: Date) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
    }

    private getAuthData(): { token: string, expirationDate: Date } {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        if (!token || !expirationDate) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
        }
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
    }

}