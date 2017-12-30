/**
 * Created by ena3 on 12/29/17.
 */
import {NgModule}     from '@angular/core';
import {RouterModule} from '@angular/router'
import {IgDocumentCreateComponent} from "./igdocument-create.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: IgDocumentCreateComponent,
        children: [

        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class IgDocumentCreateRoutingModule {}
