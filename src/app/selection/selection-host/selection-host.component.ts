import { Component, NgZone, OnInit } from '@angular/core';
import { ExtensionService } from '../../extension.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as UUIDv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-selection-host',
  templateUrl: './selection-host.component.html',
  styleUrls: ['./selection-host.component.scss']
})
export class SelectionHostComponent implements OnInit {

  userToken = '';
  backendUrl = 'https://facta.kendra.io';

  isDone = false;
  isSending = false;
  isError = false;
  errorTitle = 'No Auth';
  errorMessage = 'Login via the toolbar to start tagging.';

  selectionText = '';
  sourceUrl = '';
  form: FormGroup = this.fb.group({
    citation: this.fb.group({
      name: ['', Validators.required],
      genre: [''],
      description: [''],
      numberOfPages: [''],
      publisher: [''],
      copyrightHolder: [''],
      copyrightYear: [''],
      isbn: [''],
      visibility: ['Public']
    }),
    sourceUrl: [{ value: '' }],
    selectionText: [{ value: '' }]
  });

  constructor(
    private zone: NgZone,
    private fb: FormBuilder,
    private ext: ExtensionService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.ext.getUserToken(token => {
      if (token) {
        this.userToken = token
      } else {
        this.isError = true;
        this.errorTitle = 'No Auth';
        this.errorMessage = 'Login via the toolbar to start tagging.';
      }
    });
    this.ext.initTagger(({ pageUrl, selectionText }) => {
      this.zone.run(() => {
        console.log({ pageUrl, selectionText });
        this.sourceUrl = pageUrl;
        this.selectionText = selectionText;

        this.form = this.fb.group({
          citation: this.fb.group({
            name: ['', Validators.required],
            genre: [''],
            description: [''],
            numberOfPages: [''],
            publisher: [''],
            copyrightHolder: [''],
            copyrightYear: [''],
            isbn: [''],
            visibility: ['Public']
          }),
          sourceUrl: [{ value: pageUrl, disabled: true }],
          selectionText: [{ value: selectionText, disabled: true }]
        });
      });
    });
    this.ext.get({
      kendraioOptions: { backend: this.backendUrl }
    }, (items) => {
      if (items.kendraioOptions.backend) {
        this.backendUrl = items.kendraioOptions.backend;
      }
    });
  }


  // get formCitations(): FormArray {
  //   return this.form.get('citations') as FormArray;
  // }
  //
  // removeCitation(i) {
  //   this.formCitations.removeAt(i);
  // }
  //
  // addCitation() {
  //   this.formCitations.push(this.fb.group({
  //     name: ['', Validators.required],
  //     genre: [''],
  //     description: [''],
  //     numberOfPages: [''],
  //     publisher: [''],
  //     copyrightHolder: [''],
  //     copyrightYear: [''],
  //     isbn: ['']
  //   }));
  // }


  onSubmit() {
    const { citation, selectionText, sourceUrl } = this.form.getRawValue();

    const graph = [];

    const textId = UUIDv4();
    const citeId = UUIDv4();

    graph.push({
      "@type": "kendra:TextSelection",
      "@id": `kuid:${textId}`,
      "kendra:timestamp": new Date().toISOString(),
      "kendra:selectionText": selectionText,
      "kendra:sourceUrl": sourceUrl,
      "kendra:citation": { "@id": `kuid:${citeId}` },
      "kendra:visibility": citation.visibility,
    });

    graph.push({
      "@type": "schema:CreativeWork",
      "@id": `kuid:${citeId}`,
      "schema:name": citation.name,
      "schema:genre": citation.genre,
      "schema:description": citation.description,
      "schema:numberOfPages": citation.numberOfPages,
      "schema:publisher": citation.publisher,
      "schema:copyrightHolder": citation.copyrightHolder,
      "schema:copyrightYear": citation.copyrightYear,
      "schema:isbn": citation.isbn
    });

    // TODO: does citation need this linking entity?
    // graph.push({
    //   "@type": "kendra:Citation",
    //   "kendra:timestamp": new Date().toISOString(),
    //   "kendra:source": { "@id": textId },
    //   "kendra:target": { "@id": citeId },
    //   "kendra:visibility": citation.visibility,
    // });

    const DTO = [
      {
        "@context": {
          "schema": "http://schema.org/",
          "kendra": "http://kendra.io/types#",
          "kuid": "http://kendra.io/uuid#",
          "@vocab": "http://facta.kendra.io/vocab#"
        },
        graph
      }
    ];

    console.log({ DTO });

    const headers = {
      'Authorization': `Bearer ${this.userToken}`
    };

    console.log({ headers, backend: this.backendUrl });

    this.isSending = true;
    this.http
      .post(`${this.backendUrl}/api/assert`, DTO, { headers })
      .subscribe(() => {
        this.isSending = false;
        this.isDone = true;
      }, ({ error, status }) => {
        this.isError = true;
        this.errorTitle = 'Error';
        this.errorMessage = 'Unknown error';
        if (status === 500) {
          this.isError = true;
          this.errorTitle = 'Server Error';
          this.errorMessage = error.details;
        }
        if (status === 401) {
          this.isError = true;
          this.errorTitle = 'No Auth';
          this.errorMessage = 'Login via the toolbar to start tagging.';
        }
      });
  }

  onCancel() {
    window.close();
  }

  /*
    "copyrightHolder": {
    "@type": "Organization",
    "name": "Holt, Rinehart and Winston"
  },
  "copyrightYear": "2007",
  "description": "NIMAC-sourced textbook",
  "genre": "Educational Materials",
  "inLanguage": "en-US",
  "isFamilyFriendly": "true",
  "isbn": "9780030426599",
  "name": "Holt Physical Science",
  "numberOfPages": "598",
  "publisher": {
    "@type": "Organization",
    "name": "Holt, Rinehart and Winston"
  }
   */
}
