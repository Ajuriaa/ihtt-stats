import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-side-nav-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-nav-button.component.html',
  styleUrl: './side-nav-button.component.scss'
})
export class SideNavButtonComponent {
  @Input() public icon = 'emissions';
  @Input() public label = 'Emissions';
  @Input() public selected = false;
}
