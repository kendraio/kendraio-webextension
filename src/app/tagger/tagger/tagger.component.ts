import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { limit } from 'normalize-range';
import { fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

const HALF_TAG_WIDTH = 48;
const HALF_TAG_HEIGHT = 48;

@Component({
  selector: 'app-tagger',
  templateUrl: './tagger.component.html',
  styleUrls: ['./tagger.component.scss']
})
export class TaggerComponent implements OnInit {

  @Input() imageUrl: string;
  @Input() pageUrl: string;
  @Output() taggedSubmitted = new EventEmitter<any>();

  form: FormGroup;

  @ViewChild('sourceImage') sourceImage: ElementRef;
  imageX = 0;
  imageY = 0;
  imageWidth = 0;
  imageHeight = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      tags: this.fb.array([]),
      imgUrl: [{ value: this.imageUrl, disabled: true }],
      pageUrl: [{ value: this.pageUrl, disabled: true }]
    });
  }

  get formTags(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  onSubmit() {
    // console.log(this.form.getRawValue());
    this.taggedSubmitted.emit({
      ...this.form.getRawValue(),
      width: this.imageWidth,
      height: this.imageHeight
    });
  }

  removeTag(i) {
    this.formTags.removeAt(i);
  }

  onImageLoad(event) {
    this.imageX = (this.sourceImage.nativeElement as HTMLImageElement).x;
    this.imageY = (this.sourceImage.nativeElement as HTMLImageElement).y;
    this.imageWidth = (this.sourceImage.nativeElement as HTMLImageElement).clientWidth;
    this.imageHeight = (this.sourceImage.nativeElement as HTMLImageElement).clientHeight;
  }

  onTagMouseDown(index: number) {
    const move$ = fromEvent(document, 'mousemove');
    const up$ = fromEvent(document, 'mouseup');
    move$
      .pipe(
        filter((event: MouseEvent) => (event.target as HTMLDivElement).className.includes('tag-box')),
        takeUntil(up$)
      )
      .subscribe((event: MouseEvent) => {
        event.stopPropagation();
        const { offsetX, offsetY, clientX, clientY, target } = event;
        const x = (target as HTMLDivElement).offsetLeft + offsetX;
        const y = (target as HTMLDivElement).offsetTop + offsetY;
        const region = this.getRegionFromPoint(x, y);
        this.formTags.at(index).get('region').setValue(region);
      });
  }

  onImageClicked(event: MouseEvent) {
    const { offsetX: x, offsetY: y , target } = event;
    const region = this.getRegionFromPoint(x, y);
    this.addTagZone(region);
  }

  addTagZone(region) {
    this.formTags.push(this.fb.group({ region, name: ['', Validators.required] }));
  }
  getRegionFromPoint(x, y) {
    const midX = limit(HALF_TAG_WIDTH, this.imageWidth - HALF_TAG_WIDTH, x);
    const midY = limit(HALF_TAG_HEIGHT, this.imageHeight - HALF_TAG_HEIGHT, y);
    const minX = midX - HALF_TAG_WIDTH;
    const minY = midY - HALF_TAG_HEIGHT;
    const maxX = midX + HALF_TAG_WIDTH;
    const maxY = midY + HALF_TAG_HEIGHT;
    return { minX, minY, maxX, maxY };
  }
}
