import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './primary-button.component.html',
  styleUrls: ['../base-button.component.scss']
})
export class PrimaryButtonComponent {
  @Input() public styleClass = 'btn-blue';
  @Input() public disableButton = false;
  @Output() public btnClick = new EventEmitter();
}
