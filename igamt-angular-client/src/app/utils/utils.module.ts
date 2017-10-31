/**
 * Created by hnt5 on 10/30/17.
 */
import {NgModule}     from '@angular/core';
import {DisplayBadgeComponent} from "../common/badge/display-badge.component";
import {DtFlavorPipe} from "../igdocuments/igdocument-edit/segment-edit/segment-definition/coconstraint-table/datatype-name.pipe";
import {CommonModule} from "@angular/common";
import {EntityHeaderComponent} from "../common/entity-header/entity-header.component";


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ DisplayBadgeComponent, EntityHeaderComponent, DtFlavorPipe ],
  exports: [ DisplayBadgeComponent, EntityHeaderComponent, DtFlavorPipe]
})
export class UtilsModule {}
