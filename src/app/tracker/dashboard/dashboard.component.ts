import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { AppService } from 'src/app/app.service'
import { SocketService } from 'src/app/socket.service'
import { Cookie } from 'ng2-cookies/ng2-cookies'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {
  sortType: string
  private sortDesc: boolean = false
  public searchText: any
  public authToken: any
  public userInfo: any
  public userName: any
  public disconnectedSocket: boolean
  public allIssues: any = []
  public issueTitle: any
  public assignee: any
  public issueDescription: any
  public notifCounter: number = 0
  public notifData: any = []
  public issueEdited: boolean = false
  constructor(public appService: AppService, public socketService: SocketService,
    public router: Router, public toastr: ToastrService) {
    console.log("Inside dashboard constructor")
  }

  ngOnInit() {
    console.log("Inside dashboard ngOnInit")
    this.authToken = Cookie.get("authToken")
    console.log("dashboard authToken: " + this.authToken)
    this.userName = Cookie.get("userName")
    console.log("dashboard userName: " + this.userName)

    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    console.log("dashboard userInfo: " + JSON.stringify(this.userInfo))
    this.getAllIssues()
    this.verifyUserAndJoinIssues()
    this.socketService.receiveNotification().subscribe((data) => {
      console.log(data)

      if (data.editedContent == "issue") {
        this.issueEdited = true
        this.notifCounter++
        if (Array.isArray(this.notifData)) {
          this.notifData.push(data)
        } else {
          this.notifData = []
          this.notifData.push(data)
        }
        this.toastr.success(`Open notifications panel for details`, 'New Notification')
      }
      else if (data.editedContent == 'comment') {
        this.issueEdited = false
        this.notifCounter++
        if (Array.isArray(this.notifData)) {
          this.notifData.push(data)
        } else {
          this.notifData = []
          this.notifData.push(data)
        }
        this.toastr.success(`Open notifications panel for details`, 'New Notification')
      }
    })
    this.authError()
  }


  //get the all issues assigned to/created-by logged-in user
  public getAllIssues: any = () => {
    this.appService.getAllIssues(this.userInfo.userId).subscribe((data) => {
      if (data.status == 200) {
        this.allIssues = data['data']
        console.log("All Issues: " + JSON.stringify(this.allIssues[0].issueId))
      }


      else if (data.status == 404) {
        this.toastr.info("No issues found!")
      }

      for (let issue of this.allIssues) {
        console.log("All issue in ts file:" + issue.issueId)
      }
    }
    )
  }

  //verify the logged-in user & join all issues room which have been assigned to the user
  public verifyUserAndJoinIssues: any = () => {

    this.socketService.verifyUser()
      .subscribe((data) => {

        this.disconnectedSocket = false

        this.socketService.setUser(this.authToken)

      })//end subscribe
  }//end verifyUserAndJoinIssues


  // click user-event: for sorting issues
  // sortType/property: which column to sort
  // sortDesc: to track whether to sort in descending order or not. Also for toggling icon in table header
  // in Array.prototype.sort(): -1 is for ascending & 1 is for descending sort order
  sortIssues(property) {
    this.sortType = property
    this.sortDesc = !this.sortDesc
    this.allIssues.sort(this.dynamicSort(property))
  }

  dynamicSort(property) {
    // default: minus(-)1 
    // only for toggling result b/w asc/desc
    let sortOrder = -1

    //sortDesc: for changing the order of sorting i.e ascending or descending
    // sortDesc icon: down icon to sort in ascending order when list is reverse sorted
    // sortDesc icon: up icon to reverse sort when list is sorted
    if (this.sortDesc)
      sortOrder = 1

    return function (a, b) {
      let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
      console.log("dynamicSort called")
      // to make result the opposite i.e toggle between ascending/descending
      return result * sortOrder
    }
  }

  // navigate to next view to create new issue
  public createNewIssue: any = () => {
    this.router.navigate(['/description'])
  }

  // navigate to issue-description view
  public selectedIssue: any = (issueId) => {
    this.router.navigate(['/description', issueId])
  }


  public logout: any = () => {

    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          Cookie.delete('authToken');
          Cookie.delete('userId');
          Cookie.delete('userName');

          this.socketService.disconnect(this.userInfo.userId);
          this.router.navigate(['/']);//navigating to signin page
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      }, (err) => {
        this.toastr.error('some error occured');
      })
  }//end logout

  public authError: any = () => {
    this.socketService.authError().subscribe(
      data => {
        this.toastr.error(data.error)
      }
    )
  }  

}