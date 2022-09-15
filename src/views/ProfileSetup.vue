<template>
    <v-container>
        <v-card class="mx-auto" max-width="1280">
            <v-toolbar
                class="grey lighten-4"
                flat>
                <v-toolbar-title class="text-h6">Profile Information</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-4" dark @click="saveProfile">
                    <v-icon class="mr-3">mdi-cloud-upload</v-icon>
                    <span>Save changes</span>
                </v-btn>
            </v-toolbar>
            <v-card flat class="mx-auto p-14">
                <v-card-text>
                    <v-container class="mx-n2">
                        <v-row class="d-flex">
                            <v-col cols="12" class="p-0">
                                <v-row>
                                    <v-col cols="12" class="px-5 my-auto d-flex flex-column">
                                        <v-img
                                            lazy-src="https://picsum.photos/id/11/10/6"
                                            aspect-ratio="1"
                                            max-height="150"
                                            max-width="150"
                                            width="150"
                                            
                                            :src="user.profileImg"
                                            class="rounded-circle mx-auto mb-5"
                                        ></v-img>
                                        <v-btn height="50" @click="onPickFile" class="mx-auto flex-grow-0">
                                            <v-icon
                                                right
                                                dark
                                                class="mr-2"
                                            >
                                                mdi-cloud-upload
                                            </v-icon>
                                            
                                            Upload photo
                                        </v-btn>
                                        <input type="file" style="display: none;" ref="photoFile" accept="image/*" @change="onFilePicked"/>
                                    </v-col>
                                    <v-col cols="12">
                                        <span class="text-caption">Note: Changes will apply only on messages sent after changing the image.</span>
                                    </v-col>
                                    <v-col cols="12" class="d-flex flex-column">
                                        <v-text-field
                                            v-model="user.lastName"
                                            label="Last Name"
                                            outlined
                                            clearable
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="user.firstName"
                                            label="First Name"
                                            outlined
                                            clearable
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="user.middleName"
                                            label="Middle Name"
                                            outlined
                                            clearable
                                        ></v-text-field>
                                        <v-combobox
                                            filled
                                            outlined
                                            label="Gender"
                                            v-model="user.gender"
                                            :items="genderList"
                                        ></v-combobox>
                                        <v-dialog
                                            ref="dialog"
                                            v-model="dateModal"
                                            :return-value.sync="user.birthDate"
                                            persistent
                                            width="290px"
                                        >
                                            <template v-slot:activator="{ on, attrs }">
                                            <v-text-field
                                                v-model="user.birthDate"
                                                label="Birthdate"
                                                prepend-icon="mdi-calendar"
                                                readonly
                                                v-bind="attrs"
                                                v-on="on"
                                            ></v-text-field>
                                            </template>
                                            <v-date-picker
                                                v-model="user.birthDate"
                                                scrollable
                                            >
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                text
                                                color="primary"
                                                @click="dateModal = false"
                                            >
                                                Cancel
                                            </v-btn>
                                            <v-btn
                                                text
                                                color="primary"
                                                @click="$refs.dialog.save(user.birthDate)"
                                            >
                                                OK
                                            </v-btn>
                                            </v-date-picker>
                                        </v-dialog> 
                                        <v-textarea
                                            outlined
                                            label="Address"
                                            v-model="user.address"
                                        >
                                        </v-textarea>
                                        <v-combobox
                                            filled
                                            outlined
                                            label="Access role"
                                            v-model="user.roleName"
                                            :items="roleItems"
                                            persistent-hint
                                            hint="Administrator and Moderator roles requires approval before having admin access"
                                        ></v-combobox>
                                        <v-combobox
                                            filled
                                            outlined
                                            label="Department"
                                            v-model="user.department"
                                            :items="departmentItems"
                                            @change="onDepartmentChange"
                                        ></v-combobox>
                                        <v-combobox
                                            filled
                                            outlined
                                            label="Student Course"
                                            v-model="user.studentCourse"
                                            :items="courseItems"
                                            item-text="name"
                                            item-value="code"
                                            persistent-hint
                                            hint="Course lists depends on selected department"
                                        ></v-combobox>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                        <!-- error dialog displays any potential errors -->
                        <v-dialog v-model="errorDialog" max-width="300">
                            <v-card>
                                <v-card-text class="subheading">{{errorText}}</v-card-text>
                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="errorDialog = false" flat>Got it!</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-card>
        <v-dialog
            v-model="loadingDialog"
            hide-overlay
            persistent
            width="300"
            >
            <v-card
                color="primary"
                dark
            >
                <v-card-text>
                Saving changes
                <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0"
                ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-snackbar
            v-model="snackbar"
            :timeout="snackbarTimeout"
            elevation="24"
            color="blue darken-2"
            >
            {{ snackbarText }}

            <template v-slot:action="{ attrs }">
                <v-btn
                color="white"
                text
                v-bind="attrs"
                @click="snackbar = false"
                >
                Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>
<script>
import firebase from '../firebase/index'
export default {
    data: () => ({
        dateModal: false,
        snackbar: false,
        snackbarText: 'My timeout is set to 2000.',
        snackbarTimeout: 4000,
        errorDialog: false,
        loadingDialog: false,
        previousRole: '',
        genderList: ["Male","Female"],
        user:{
            lastName: '',
            firstName: '',
            middleName: '',
            roleName: '',
            department: '',
            studentCourse: '',
            birthDate: '',
            gender: '',
            address: '',
            profileImg: '',
            openTickets: 0,
            totalTickets: 0,
            closedTickets: 0
        },
        profileImageFile: null,
        errorText: '',
        roleItems: [
          'Administrator',
          'Moderator',
          'Student'
        ],
        departmentItems: [
          'College of Engineering and Information Sciences',
          'College of Agriculture',
          'College of Arts and Sciences',
          'College of Teacher Education',
          'Office of Student Affair Services'
        ],
        courseItems:[],
        courseItemsLibrary:[
            {
                department: "College of Engineering and Information Sciences",
                code: "BIT-CT",
                name: "Bachelor of Industrial Technology Major in Computer Technology"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BIT-ET",
                name: "Bachelor of Industrial Technology Major in Electronic Technology"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BIT-HVRAC",
                name: "Bachelor of Industrial Technology Major in Heating, Ventilating, Refrigerating and Air Conditioning"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BIT-WAFT",
                name: "Bachelor of Industrial Technology Major in Welding and Fabrication Technology"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BSABE",
                name: "Bachelor of Science in Agricultural and Biosystems Engineering"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BSAE",
                name: "Bachelor of Science in Agricultural Engineering"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BSCE",
                name: "Bachelor of Science in Civil Engineering"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BSECE",
                name: "Bachelor of Science in AElectronics and Communications Engineering"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BSIS",
                name: "Bachelor of Science in Information System"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "BSIT",
                name: "Bachelor of Science in Information Technology"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "DIFT",
                name: "Diploma in Inland Fisheries Technology"
            },
            {
                department: "College of Engineering and Information Sciences",
                code: "MS ABE",
                name: "Master of Science in Agricultural and Biosystems Engineering"
            },
            {
                department: "College of Agriculture",
                code: "BAT",
                name: "Bachelor of Agricultural Technology"
            },
            {
                department: "College of Agriculture",
                code: "BSA ANSCI",
                name: "Bachelor of Science in Agriculture Major in Animal Science"
            },
            {
                department: "College of Agriculture",
                code: "BSA HORT",
                name: "Bachelor of Science in Agriculture Major in Horticulture"
            },
            {
                department: "College of Agriculture",
                code: "BSA ARGON",
                name: "Bachelor of Science in Agriculture Major in Argonomy"
            },
            {
                department: "College of Agriculture",
                code: "BSAF",
                name: "Bachelor of Science in Agroforestry"
            },
            {
                department: "College of Agriculture",
                code: "BS AGRIB",
                name: "Bachelor of Science in AgriBusiness"
            },
            {
                department: "College of Agriculture",
                code: "BS ENTREP",
                name: "Bachelor of Science in Entrepreneurship"
            },
            {
                department: "College of Agriculture",
                code: "MS AGRON",
                name: "Master of Science in Agronomy"
            },
            {
                department: "College of Agriculture",
                code: "MS AN SCI",
                name: "Master of Science in Animal Science"
            },
            {
                department: "College of Agriculture",
                code: "MS HORTI",
                name: "Master of Science in Horticulture"
            },
            {
                department: "College of Arts and Sciences",
                code: "ABEL",
                name: "Bachelor of Arts in English Language"
            },
            {
                department: "College of Arts and Sciences",
                code: "BSAM",
                name: "Bachelor of Science in Applied Mathematics"
            },
            {
                department: "College of Arts and Sciences",
                code: "BS BIO",
                name: "Bachelor of Science in Biology"
            },
            {
                department: "College of Arts and Sciences",
                code: "BSES",
                name: "Bachelor of Sceience in Environmental Science"
            },
            {
                department: "College of Teacher Education",
                code: "BEED",
                name: "Bachelor of Elementary Education"
            },
            {
                department: "College of Teacher Education",
                code: "BSED ENGLISH",
                name: "Bachelor of Secondary Education Major in English"
            },
            {
                department: "College of Teacher Education",
                code: "BSED MATH",
                name: "Bachelor of Secondary Education Major in Mathematics"
            },
            {
                department: "College of Teacher Education",
                code: "BSED SCI",
                name: "Bachelor of Secondary Education Major in Science"
            },
            {
                department: "College of Teacher Education",
                code: "BTLED AFA",
                name: "Bachelor of Technology and Livelihood Education Major in Agri-Fishery Arts"
            },
            {
                department: "College of Teacher Education",
                code: "BTLED HE",
                name: "Bachelor of Technology and Livelihood Education Major in Home Economics"
            },
            {
                department: "Office of Student Affair Services",
                code: "SSG",
                name: "Student Supreme Government"
            },
            {
                department: "Office of Student Affair Services",
                code: "AR",
                name: "Asscat Registrar"
            },
            {
                department: "Office of Student Affair Services",
                code: "MIS",
                name: "MIS"
            },
            {
                department: "Office of Student Affair Services",
                code: "ADMIN",
                name: "Admission Office"
            }
          
        ]
    }),
    methods: {
        onDepartmentChange(){
            this.courseItems = this.courseItemsLibrary.filter(dept => dept.department == this.user.department)
        },
        saveProfile(){
            this.loadingDialog = true
            const userId = firebase.auth.currentUser.uid
            if(this.profileImageFile == null){
                this.saveUser(userId)
                return
            }
            const fileName = this.profileImageFile.name
            const ext = fileName.slice(fileName.lastIndexOf('.'))
            const ref = firebase.storage.ref('users/' + userId)
            var uploadTask = ref.put(this.profileImageFile)
            uploadTask.on(firebase.taskEvent.STATE_CHANGED, (snapshot) => {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case firebase.taskState.PAUSED: // or 'paused'
                            console.log('Upload is paused');
                            break;
                        case firebase.taskState.RUNNING: // or 'running'
                            console.log('Upload is running');
                            break;
                    }
                }, 
                (error) => {console.log(error.code)}, 
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        this.user.profileImg = downloadURL
                        this.saveUser(userId)
                    });
                }
            )
        },
        saveUser(userId){
            console.log(this.previousRole + " => " + this.user.roleName)
            var batch = firebase.firestore.batch()
            const userRef = firebase.firestore.collection('user').doc(userId)
            var additionalMessage = ''
            if((
                (this.user.roleName == 'Administrator' && this.previousRole == 'Administrator') || (this.user.roleName == 'Administrator' || this.user.roleName == 'Moderator')
                ) && 
                    (this.previousRole == 'Student' || this.previousRole == '')
                ){
                const approvalRef = firebase.firestore.collection('approval').doc()
                var approvalData = {
                    requestedById:userId,
                    requestedBy: this.user.lastName + ", " + this.user.firstName,
                    requestedRole: this.user.roleName,
                    requestDate: firebase.fieldValue.serverTimestamp()
                }
                batch.set(approvalRef, approvalData)
                if(this.user.roleName == 'Administrator' && this.previousRole == 'Administrator'){
                    if(this.previousRole == ''){
                        this.user.roleName = 'Student'
                    }
                    else{
                        this.user.roleName = this.previousRole
                    }
                }
                else{
                    this.user.roleName = 'Student'
                }
                additionalMessage = ' (Role was set to student for now. Please wait for approval from the administrator)'
            }
            
            batch.set(userRef, this.user)

            batch.commit().then(() => {
                this.loadingDialog = false
                this.snackbar = true
                this.snackbarText = "Profile has been updated" + additionalMessage
            })
        },
        onPickFile(){
            this.$refs.photoFile.click();
        },
        onFilePicked(event){
            const files = event.target.files
            let filename = files[0].name;
            if(filename.lastIndexOf('.') <= 0){
                // Return a prompt to uploade valid file
            }
            const fileReader = new FileReader()
            fileReader.addEventListener('load', () => {
                this.user.profileImg = fileReader.result
            })
            fileReader.readAsDataURL(files[0])
            this.profileImageFile = files[0]
        }
    },
    mounted(){
        document.title = "Profile - Stakeholders Online Support"
        const userId = firebase.auth.currentUser.uid;
        const userCollection = firebase.firestore.collection('user').doc(userId)
            userCollection.get().then((doc) => {
                // const userInfo = doc.data()
                const userInfo = {
                    lastName: doc.data().lastName,
                    firstName: doc.data().firstName,
                    middleName: doc.data().middleName,
                    roleName: doc.data().roleName,
                    department: doc.data().department,
                    studentCourse: doc.data().studentCourse,
                    profileImg: doc.data().profileImg,
                    birthDate: doc.data().birthDate,
                    gender: doc.data().gender,
                    address: doc.data().address,
                    createdAt: doc.data().createdAt,
                    openTickets: doc.data().openTickets,
                    totalTickets: doc.data().totalTickets,
                    closedTickets: doc.data().closedTickets
                }
                this.previousRole = doc.data().roleName
                this.user = userInfo
            })
    }
}
</script>