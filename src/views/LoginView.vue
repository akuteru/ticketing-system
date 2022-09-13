<template>
    <div class="login-container">
        <div class="form">
            <div class="form-toggle"></div>
            <div class="form-panel one">
                <div class="form-header">
                    <h1 class="indigo--text text--accent-3">Stakeholder Online System </h1>
                    <h2 class="overline">Login Page</h2>
                </div>
                <div class="form-content">
                    <form>
                        <div class="form-group">
                            <label for="loginUsername">Email</label>
                            <input type="text" id="loginUsername" v-model="loginUsername" required>
                        </div> 
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" v-model="loginPassword" required>
                        </div>
                        <div class="form-group">
                            <label class="form-remember">
                                <input type="checkbox" id="rememberMe" v-model="rememberMe"/> 
                                Remember me
                            </label>
                            <router-link to="ForgotPassword" class="form-recovery">Forgot Password</router-link>
                        </div>
                        <div class="form-group">
                            <v-btn dark class="indigo accent-3" @click="login">Login</v-btn>
                        </div>
                        <div class="form-group">
                            <span class="error-message overline red--text text--accent-3 text-center">{{errorMessage}}</span>
                        </div>
                    </form>
                </div>
            </div>
            <div class="form-panel two indigo accent-3">
                <div class="form-header">
                    <h1>Register Account</h1>
                </div>
                <div class="form-content">
                    <form action="">
                        <div class="form-group">
                            <label for="registerUsername">Email</label>
                            <input type="text" id="registerUsername" v-model="registerUsername" required>

                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <input type="password" v-model="registerPassword" id="registerPassword">
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" v-model="confirmPassword" id="confirmPassword">
                        </div>
                        <div class="form-group">
                            <v-btn dark class="grey lighten-4 indigo--text text--accent-3" @click="register">Create account</v-btn>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import firebase from '../firebase/index'
    export default {
        data: () => ({
            loginUsername: "",
            loginPassword: "",
            registerUsername: "",
            registerPassword: "",
            confirmPassword: "",
            errorMessage: '',
            registerErrorMessage: '',
            rememberMe: false
        }),
        methods:{
            login(){
                if(this.loginUsername == "" || this.loginPassword == ""){
                    this.errorMessage = "Email and password cannot be empty."
                    return
                }
                if(this.rememberMe){
                    this.loginToFirebase()
                }
                else{
                    firebase.auth
                        .setPersistence(persistence.SESSION).then(() => {
                            this.loginToFirebase()
                        })
                }
            },
            async loginToFirebase(){
                firebase.auth
                        .signInWithEmailAndPassword(this.loginUsername, this.loginPassword)
                        .then(() => {
                            location.reload()
                        })
                        .catch((error) => {
                            switch (error.code) {
                                case 'auth/invalid-email':
                                    this.errorMessage  = 'Invalid email'
                                    break
                                case 'auth/user-not-found':
                                    this.errorMessage = 'No account with that email was found'
                                    break
                                case 'auth/wrong-password':
                                    this.errorMessage = 'Incorrect password'
                                    break
                                default:
                                    this.errorMessage = 'Email or password was incorrect'
                                    break
                            }
                        })
            },
            async loginWithProvider(providerName){
                var provider = null
                switch(providerName){
                    case 'facebook':
                        provider = new firebase.auth.FacebookAuthProvider()
                        break
                    case 'google':
                        provider = new firebase.auth.GoogleAuthProvider()
                        break
                    default:
                        return
                }
                firebase.auth
                    .signInWithPopup(provider)
                    .then(() => {
                        this.$router.push({name: 'Dashboard'})
                    })
                    .catch(error => {
                        switch (error.code) {
                        case 'auth/invalid-email':
                            this.errorMessage  = 'Invalid email'
                            break
                        case 'auth/user-not-found':
                            this.errorMessage = 'No account with that email was found'
                            break
                        case 'auth/wrong-password':
                            this.errorMessage = 'Incorrect password'
                            break
                        default:
                            this.errorMessage = 'Email or password was incorrect'
                            break
                        }
                    })
            },
            async register(){
                if(this.registerUsername === '' || this.registerPassword === ''){
                    this.registerErrorMessage = "Email and Password cannot be empty"
                    return
                }
                if(this.confirmPassword === ''){
                    this.registerErrorMessage = "Confirm password cannot be empty"
                    return
                }
                if(this.registerPassword != this.confirmPassword){
                    this.registerErrorMessage = "Password did not match"
                    return
                }
                firebase.auth
                    .createUserWithEmailAndPassword(this.registerUsername, this.registerPassword)
                    .then(() => {
                        this.createUserData().then(() => {
                            this.$router.push({name:"Home"})
                        })
                    })
            },
            async createUserData(){
                const userData = {
                    lastName: '',
                    firstName: '',
                    middleName: '',
                    roleName: 'Student',
                    department: '',
                    studentCourse: '',
                    profileImg: '',
                    birthDate: '',
                    address: '',
                    createdAt: firebase.fieldValue.serverTimestamp(),
                    openTickets: 0,
                    totalTickets: 0,
                    closedTickets: 0
                }
                const userId = firebase.auth.currentUser.uid
                const userCollection = firebase.firestore.collection('user').doc(userId)
                await userCollection.set(userData)
            }
        },
        mounted() {
            //Set Title
            document.title = "Login - Stakeholders Online Support"

            //Events for the Login Box  
            var panelOne = document.querySelector(".form-panel.two").clientHeight,
                panelTwo = document.querySelector(".form-panel.two").clientHeight;

            document.querySelector(".form-panel.two:not(.active)")
                .addEventListener("click", function (e) {
                e.preventDefault();

                document.querySelector(".form-toggle").classList.add("visible");
                document.querySelector(".form-panel.one").classList.add("hidden");
                document.querySelector(".form-panel.two").classList.add("active");
                document.querySelector(".form").animate(
                    {
                        height: panelTwo
                    },
                    300
                );
            });

            document.querySelector(".form-toggle").addEventListener("click", function (e) {
                e.preventDefault();
                document.querySelector(".form-toggle").classList.remove("visible");
                document.querySelector(".form-panel.one").classList.remove("hidden");
                document.querySelector(".form-panel.two").classList.remove("active");
                document.querySelector(".form").animate(
                {
                    height: panelOne
                },
                200
                );
            });
        }
    }
</script>
<style scoped>
    .overlay, .form-panel.one:before {
        position: absolute;
        top: 0;
        left: 0;
        display: none;
        background: rgba(0, 0, 0, 0.8);
        width: 100%;
        height: 100%;
    }

    .form {
    z-index: 15;
    position: relative;
    background: #ffffff;
    width: 600px;
    border-radius: 4px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    margin: 100px auto 10px;
    overflow: hidden;
    }
    .form-toggle {
    z-index: 10;
    position: absolute;
    top: 60px;
    right: 60px;
    background: #ffffff;
    width: 60px;
    height: 60px;
    border-radius: 100%;
    transform-origin: center;
    transform: translate(0, -25%) scale(0);
    opacity: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    }
    .form-toggle:before, .form-toggle:after {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 4px;
    background: #4285f4;
    transform: translate(-50%, -50%);
    }
    .form-toggle:before {
    transform: translate(-50%, -50%) rotate(45deg);
    }
    .form-toggle:after {
    transform: translate(-50%, -50%) rotate(-45deg);
    }
    .form-toggle.visible {
    transform: translate(0, -25%) scale(1);
    opacity: 1;
    }
    .form-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 0 0 20px;
    }
    .form-group:last-child {
    margin: 0;
    }
    .form-group label {
    display: block;
    margin: 0 0 10px;
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    }
    .two .form-group label {
    color: #ffffff;
    }
    .form-group input {
    outline: none;
    display: block;
    background: rgba(0, 0, 0, 0.1);
    width: 100%;
    border: 0;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 12px 20px;
    color: rgba(0, 0, 0, 0.6);
    font-family: inherit;
    font-size: inherit;
    font-weight: 500;
    line-height: inherit;
    transition: 0.3s ease;
    }
    .form-group input:focus {
    color: rgba(0, 0, 0, 0.8);
    }
    .two .form-group input {
    color: #ffffff;
    }
    .two .form-group input:focus {
    color: #ffffff;
    }
    .form-group button {
    outline: none;
    background: #4285f4;
    width: 100%;
    border: 0;
    border-radius: 4px;
    padding: 12px 20px;
    color: #ffffff;
    font-family: inherit;
    font-size: inherit;
    font-weight: 500;
    line-height: inherit;
    text-transform: uppercase;
    cursor: pointer;
    }
    .two .form-group button {
    background: #ffffff;
    color: #4285f4;
    }
    .form-group .form-remember {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    align-items: center;
    }
    .form-group .form-remember input[type=checkbox] {
    display: inline-block;
    width: auto;
    margin: 0 10px 0 0;
    }
    .form-group .form-recovery {
    color: #4285f4;
    font-size: 12px;
    text-decoration: none;
    }
    .form-panel {
    padding: 60px calc(5% + 60px) 60px 60px;
    box-sizing: border-box;
    }
    .form-panel.one:before {
    content: "";
    display: block;
    opacity: 0;
    visibility: hidden;
    transition: 0.3s ease;
    }
    .form-panel.one.hidden:before {
    display: block;
    opacity: 1;
    visibility: visible;
    }
    .form-panel.two {
    z-index: 5;
    position: absolute;
    top: 0;
    left: 95%;
    background: #4285f4;
    width: 100%;
    min-height: 100%;
    padding: 60px calc(10% + 60px) 60px 60px;
    transition: 0.3s ease;
    cursor: pointer;
    }
    .form-panel.two:before, .form-panel.two:after {
    content: "";
    display: block;
    position: absolute;
    top: 60px;
    left: 1.5%;
    background: rgba(255, 255, 255, 0.2);
    height: 30px;
    width: 2px;
    transition: 0.3s ease;
    }
    .form-panel.two:after {
    left: 3%;
    }
    .form-panel.two:hover {
    left: 93%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
    .form-panel.two:hover:before, .form-panel.two:hover:after {
    opacity: 0;
    }
    .form-panel.two.active {
    left: 10%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    cursor: default;
    }
    .form-panel.two.active:before, .form-panel.two.active:after {
    opacity: 0;
    }
    .form-header {
    margin: 0 0 40px;
    }
    .form-header h1 {
    padding: 4px 0;
    color: #4285f4;
    font-size: 24px;
    font-weight: 700;
    text-transform: uppercase;
    }
    .two .form-header h1 {
    position: relative;
    z-index: 40;
    color: #ffffff;
    }
</style>