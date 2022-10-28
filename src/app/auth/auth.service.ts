import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthData } from './auth-data.model';
import { environment } from '../../environments/environment'

const BACKEND_URL = environment.apiURL + '/user/'

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private http: HttpClient, private router: Router) { }

    private token: string;
    private userId: string;
    private authTimer: any;
    private authStatusListener = new BehaviorSubject<boolean>(false);

    getToken() {
        return this.token;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusListner() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post(BACKEND_URL + 'signup', authData)
            .subscribe({
                next: response => {
                    this.router.navigate(['/']);
                },
                error: () => {
                    this.authStatusListener.next(false);
                }
            })
    }

    login(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post<{ token: string, expiresIn: number, userId: string }>(BACKEND_URL + 'login', authData)
            .subscribe({
                next: response => {
                    const token = response.token;
                    if (token) {
                        this.token = token;
                        this.userId = response.userId;
                        this.authStatusListener.next(true);
                        const expiresIn = response.expiresIn;
                        this.authTimer = this.autoLogoutTimer(expiresIn);
                        const expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));
                        this.saveAuthData(token, expirationDate, this.userId);
                        this.router.navigate(['/']);
                    }
                },
                error: () => {
                    this.authStatusListener.next(false);
                }
            });
    }


    logout() {
        this.token = null;
        this.userId = null;
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
                this.userId = authData.userId;
                this.authStatusListener.next(true);
                this.authTimer = this.autoLogoutTimer(expiresIn / 1000);
            }
        }
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private getAuthData(): { token: string, expirationDate: Date, userId: string } {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');
        if (!token || !expirationDate) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId,
        }
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

}