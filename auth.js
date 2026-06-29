/*====================================================
                ELEMENTS
====================================================*/

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");

const showRegister = document.querySelector("#showRegister");
const showLogin = document.querySelector("#showLogin");

const loginUsername = document.querySelector("#loginUsername");
const loginPassword = document.querySelector("#loginPassword");

const registerUsername = document.querySelector("#registerUsername");
const registerPassword = document.querySelector("#registerPassword");
const confirmPassword = document.querySelector("#confirmPassword");


/*====================================================
                AUTO LOGIN
====================================================*/

const currentUser = localStorage.getItem("currentUser");

if (currentUser) {

    window.location.href = "dashboard.html";

}


/*====================================================
                FORM TOGGLE
====================================================*/

showRegister.addEventListener("click", () => {

    loginForm.classList.add("hidden");

    registerForm.classList.remove("hidden");

    loginForm.reset();

});



showLogin.addEventListener("click", () => {

    registerForm.classList.add("hidden");

    loginForm.classList.remove("hidden");

    registerForm.reset();

});


/*====================================================
                REGISTER
====================================================*/

registerForm.addEventListener("submit", e => {

    e.preventDefault();

    const username = registerUsername.value.trim();

    const password = registerPassword.value;

    const confirm = confirmPassword.value;



    if (

        username === "" ||

        password === "" ||

        confirm === ""

    ) {

        alert("Please fill all fields.");

        return;

    }



    if (password.length < 6) {

        alert("Password must be at least 6 characters.");

        return;

    }



    if (password !== confirm) {

        alert("Passwords do not match.");

        return;

    }



    let users = JSON.parse(

        localStorage.getItem("users")

    ) || [];



    const alreadyExists = users.find(

        user => user.username === username

    );



    if (alreadyExists) {

        alert("Username already exists.");

        return;

    }



    users.push({

        username,

        password

    });



    localStorage.setItem(

        "users",

        JSON.stringify(users)

    );



    alert("Registration Successful!");



    registerForm.reset();

    registerForm.classList.add("hidden");

    loginForm.classList.remove("hidden");

});


/*====================================================
                LOGIN
====================================================*/

loginForm.addEventListener("submit", e => {

    e.preventDefault();

    const username = loginUsername.value.trim();

    const password = loginPassword.value;



    let users = JSON.parse(

        localStorage.getItem("users")

    ) || [];



    const user = users.find(item => {

        return (

            item.username === username &&

            item.password === password

        );

    });



    if (!user) {

        alert("Invalid Username or Password.");

        return;

    }



    localStorage.setItem(

        "currentUser",

        username

    );



    loginForm.reset();



    window.location.href = "dashboard.html";

});