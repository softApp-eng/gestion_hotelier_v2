import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TypeClientService } from 'src/app/core/services/type-client.service';

@Component({
  selector: 'app-type-client-config',
  templateUrl: './type-client-config.component.html',
  styleUrls: ['./type-client-config.component.scss']
})
export class TypeClientConfigComponent implements OnInit {

  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private typeClientService: TypeClientService,
    private router: Router
  ) {
 
  }
  ngOnInit(): void {
      this.form = this.fb.group({
      code: ['', Validators.required],
      libelle: ['', Validators.required],
      description: ['']
    });
  }

  save(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const dto = {
      code: this.form.value.code,
      libelle: this.form.value.libelle,
      description: this.form.value.description
    };

    this.typeClientService.create(dto).subscribe({
      next: (response) => {
        console.log('Type client créé :', response);

        this.loading = false;

        this.router.navigate(['/type-client']);
      },

      error: (error) => {
        console.error('Erreur création type client :', error);

        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/type-client']);
  }

}
