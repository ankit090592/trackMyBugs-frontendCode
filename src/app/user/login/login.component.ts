import { Component, OnInit } from '@angular/core'
import { AppService } from 'src/app/app.service'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { Cookie } from 'ng2-cookies/ng2-cookies'



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit {

  public email: any
  public password: any
  model: any = {}

  constructor(public appService: AppService, public router: Router, private toastr: ToastrService) { }

  ngOnInit() {
  }

  public goToSignUp: any = () => {

    this.router.navigate(['/signup'])

  } // end goToSignUp

  onSubmit() {

    let data = {
      email: this.model.email,
      password: this.model.password
    }

    this.appService.signinFunction(data).subscribe((apiResponse) => {

      if (apiResponse.status === 200) {
        // console.log(apiResponse)
        // this.cookieService.setItem('accept-cookie', 'true') 
        // this.acceptedCookie = true 
        Cookie.set("authToken", apiResponse.data.authToken)
        //console.log("authToken in cookie sigin component: "+at)
        // console.log("authToken from apiResponse in sigin component: " + apiResponse.data.authToken)

        Cookie.set("userId", apiResponse.data.userDetails.userId)

        Cookie.set("userName", (apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName).trim())

        this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)

        this.toastr.success(apiResponse.message)
        this.router.navigate(['/dashboard'])

      }  else {
        // console.log("login component in else part: " +apiResponse.message)
        this.toastr.error(apiResponse.message)
      }
     
    }, (err) => {
      // console.log("login component in error part: " +err.message)
      this.toastr.error(err.message)

    })

  } 
}
