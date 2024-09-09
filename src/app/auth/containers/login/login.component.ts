import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { PrimaryButtonComponent } from 'src/app/shared';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { cookieHelper } from 'src/app/core/helpers';
import { AuthService } from '../../services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    PrimaryButtonComponent
  ],
  providers: [AuthService, cookieHelper],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public passwordType = 'password';
  public showPassword = false;
  public error = false;


  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _auth: AuthService
    ) {
  }

  ngOnInit(): void {
    this._router.navigate(['/admin/dashboard']);
    this.loginForm = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  public togglePasswordVisibility(): void {
    this.passwordType === 'password' ? this.passwordType = 'text' : this.passwordType = 'password';
    this.showPassword = !this.showPassword;
  }

  public login(): void {
    if (this.loginForm.invalid) {
      this.error = true;
      return;
    }
    this._auth.login(this.loginForm.value.username, this.loginForm.value.password).subscribe(success => {
      if (success) {
        this._router.navigate(['/admin/dashboard']);
      }
    });
  }
}
