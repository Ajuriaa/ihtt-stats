import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [
    MatDatepickerModule, MatFormFieldModule, ReactiveFormsModule,
    MatInputModule, CommonModule, MatSelectModule, MatOptionModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.scss'
})
export class DateFilterComponent implements OnInit, OnChanges {
  private today = new Date();
  @Input() mini = false;
  @Input() endDate: Date | null = this.today;
  @Input() startDate: Date | null = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  @Input() showDateTypeFilter = false;
  @Input() dateType = 'certificateExpiration';
  @Output() dateRangeChanged = new EventEmitter<{ startDate: Date | null, endDate: Date | null, dateType?: string }>();
  public dateForm!: FormGroup;
  public dateTypes = [
    { value: 'certificateExpiration', label: 'Expiración de Certificado' },
    { value: 'permissionExpiration', label: 'Expiración de Permiso' },
    { value: 'payment', label: 'Fecha de Pago' }
  ];

  constructor(
    private _formBuilder: FormBuilder
  ){}

  ngOnInit(): void {
    this.dateForm = this._formBuilder.group({
      startDate: [this.startDate, [Validators.required]],
      endDate: [this.endDate],
      dateType: [this.dateType]
    });
    this.dateForm.controls.startDate.valueChanges.subscribe(() => {
      this.clearEndDate();
    });
    this.dateForm.valueChanges.subscribe(value => {
      if (value.endDate && value.startDate) {
        this.dateRangeChanged.emit({
          startDate: value.startDate,
          endDate: value.endDate,
          dateType: value.dateType
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dateForm) {
      if (changes.dateType) {
        this.dateForm.patchValue({ dateType: this.dateType });
      }
      if (changes.startDate) {
        this.dateForm.patchValue({ startDate: this.startDate });
      }
      if (changes.endDate) {
        this.dateForm.patchValue({ endDate: this.endDate });
      }
    }
  }

  public clearEndDate(): void {
    const startDate = this.dateForm.controls.startDate.value;
    if(startDate > this.dateForm.controls.endDate.value) {
      this.dateForm.controls.endDate.setValue(startDate);
    }
  }
}
