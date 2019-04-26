import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueDescriptionComponent } from './issue-description/issue-description.component';
import { RouterModule } from '@angular/router';
// https://www.syncfusion.com/kb/9864/how-to-get-started-easily-with-syncfusion-angular-7-rich-text-editor
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import {NgxPaginationModule} from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPipe } from '../shared/search-pipe';
import { RouteGuardService } from './route-guard.service';

@NgModule({
  declarations: [DashboardComponent, IssueDescriptionComponent, SearchPipe],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent, canActivate:[RouteGuardService] },
      { path: 'description', component: IssueDescriptionComponent, canActivate:[RouteGuardService] },
      { path: 'description/:issueId', component: IssueDescriptionComponent, canActivate:[RouteGuardService] }
    ]),
    RichTextEditorAllModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [RouteGuardService]
})
export class TrackerModule { }