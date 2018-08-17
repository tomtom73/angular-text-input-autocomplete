import {
  Component,
  HostListener,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  template: `
    <ul #inputACMenu
      *ngIf="choices?.length > 0"
      class="dropdown-menu"
      [style.top.px]="position?.top"
      [style.left.px]="position?.left">
      <li 
        *ngFor="let choice of choices"
        [ngStyle] = "{'background-color': choice.startsWith('---') ? '#E0EFF6' : 'auto', 
                    'color': choice.startsWith('---') ? 'black' : 'auto'}"
        [class.active]="activeChoice === choice">
        <a
          href="javascript:;"
          (click)="selectChoice.next(choice)">
          {{ choice }}
        </a>
      </li>
    </ul>
  `,
  styles: [
    `
    .dropdown-menu {
      display: block;
      overflow: auto;
      height: 200px;
      resize: both;
    }
  `
  ]
})
export class TextInputAutocompleteMenuComponent {
  @ViewChild('inputACMenu') dropdown: ElementRef;
  @Output() closeMenu = new EventEmitter();

  position: { top: number; left: number };
  selectChoice = new Subject();
  activeChoice: any;
  searchText: string;
  choiceLoadError: any;
  choiceLoading = false;
  private _choices: string[];
  startingY = 0;
  endY = 0;
  currentY = 0;
  itemHeight = 0;
  viewHeight = 0;

  set choices(choices: string[]) {
    this._choices = choices;
    if (choices.indexOf(this.activeChoice) === -1 && choices.length > 0) {
      this.activeChoice = choices[1];
    }
  }

  get choices() {
    return this._choices;
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  onArrowDown(event: KeyboardEvent) {
    event.preventDefault();
    const index = this.choices.indexOf(this.activeChoice);
    if (this.itemHeight === 0 && this.dropdown.nativeElement.children[0]) {
      this.itemHeight = this.dropdown.nativeElement.children[0].clientHeight;
      this.viewHeight =
        this.dropdown.nativeElement.clientHeight - this.itemHeight * 3;
      this.currentY = -this.viewHeight;
    }

    this.currentY += this.itemHeight;

    if (this.endY === 0 || this.currentY < this.endY) {
      this.dropdown.nativeElement.scrollTo(0, this.currentY);
    }

    if (this.choices[index + 1]) {
      if (this.choices[index + 1].startsWith('---')) {
        if (this.choices[index + 2]) {
          this.activeChoice = this._choices[index + 2];
        }
      } else {
        this.activeChoice = this._choices[index + 1];
      }
    } else {
      this.endY = this.currentY;
    }
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  onArrowUp(event: KeyboardEvent) {
    event.preventDefault();
    const index = this.choices.indexOf(this.activeChoice);
    if (this.itemHeight === 0 && this.dropdown.nativeElement.children[0]) {
      this.itemHeight = this.dropdown.nativeElement.children[0].clientHeight;
      this.viewHeight =
        this.dropdown.nativeElement.clientHeight - this.itemHeight * 3;
    }

    if (this.currentY < 0) {
      this.currentY = -this.viewHeight;
    } else {
      this.currentY -= this.itemHeight;
      this.dropdown.nativeElement.scrollTo(0, this.currentY);
    }

    if (this.choices[index - 1]) {
      if (this.choices[index - 1].startsWith('---')) {
        if (this.choices[index - 2]) {
          this.activeChoice = this._choices[index - 2];
        } else {
          // do nothing
        }
      } else {
        this.activeChoice = this._choices[index - 1];
      }
    }
  }

  @HostListener('document:keydown.Enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if (this.choices.indexOf(this.activeChoice) > -1) {
      event.preventDefault();
      this.selectChoice.next(this.activeChoice);
    }
  }

  @HostListener('document:keydown.Escape', ['$event'])
  onEscPress(e: KeyboardEvent) {
    this.closeMenu.emit();
  }
}
