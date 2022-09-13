<template>
    <div class="form">
        <div class="form-panel">
            <div class="form-header">
                <h1 class="indigo--text text--accent-3">Forgot password?</h1>
            </div>
            <div class="form-content">
                <form>
                    <div class="form-group">
                        <label for="emailAddress">Enter your email</label>
                        <input type="text" id="emailAddress" v-model="emailAddress" required>
                    </div> 
                    <div class="form-group">
                        <v-btn dark class="indigo accent-3" @click="resetPassword">Send link</v-btn>
                    </div>
                    <div class="form-group">
                        <span class="error-message overline red--text text--accent-3 text-center">{{errorMessage}}</span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
    import firebase from 'firebase'
    export default {
        data: () => ({
            emailAddress: "",
            errorMessage: ""
        }),
        mounted() {
            document.title = "Forgot Password - Stakeholders Online Support"
        },
        methods: {
            resetPassword(){
                if(this.emailAddress == ""){
                    this.errorMessage = "Email address cannot be empty."
                    return
                }
                firebase.auth()
                    .sendPasswordResetEmail(this.emailAddress)
                    .then(() => {
                        
                    })
            }
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