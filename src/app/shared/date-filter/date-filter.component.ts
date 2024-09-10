import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [
    MatDatepickerModule, MatFormFieldModule, ReactiveFormsModule,
    MatInputModule, CommonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.scss'
})
export class DateFilterComponent implements OnInit {
  private today = new Date();
  @Input() mini = false;
  @Input() endDate: Date | null = this.today;
  @Input() startDate: Date | null = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  @Output() dateRangeChanged = new EventEmitter<{ startDate: Date | null, endDate: Date | null }>();
  public dateForm!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder
  ){}

  ngOnInit(): void {
    this.dateForm = this._formBuilder.group({
      startDate: [this.startDate, [Validators.required]],
      endDate: [this.endDate],
    });
    this.dateForm.controls.startDate.valueChanges.subscribe(() => {
      this.clearEndDate();
    });
    this.dateForm.valueChanges.subscribe(value => {
      value.endDate && value.startDate ? this.dateRangeChanged.emit({ startDate: value.startDate, endDate: value.endDate }) : '';
    });
  }

  public clearEndDate(): void {
    const startDate = this.dateForm.controls.startDate.value;
    if(startDate > this.dateForm.controls.endDate.value) {
      this.dateForm.controls.endDate.setValue(startDate);
    }
  }
}
