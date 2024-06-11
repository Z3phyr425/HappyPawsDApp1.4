//GET COOKIES
function getCookieValue(cookieName) {
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if(cookie.indexOf(cookieName + '=') === 0) {
            return cookie.substring(cookie.indexOf('=') + 1);
        }
    }
    
    return null;
}

window.addEventListener('load', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    } else if (window.web3) {
        window.web3 = new Web3(window.currentProvider);
    } else {
        alert('Use Metamask');
    }

    async function loadContractAbi() {
        try {
            const response = await fetch('./build/contracts/UserManagement.json');
            const data = await response.json();
            return data.abi;
        } catch (error) {
            console.error("Unable to fetch ABI", error);
            throw error;
        }
    }

    const contractAddress = "0x2400E76613AE76874bb1bf00F26Ac822Eb3fEA48";
    const abi = await loadContractAbi();
    const contract = new web3.eth.Contract(abi, contractAddress);

    var loggedInUser = getCookieValue('loggedInUser');
    if (loggedInUser) {
        getUserByUsername(loggedInUser);
        window.location.href = "main.html";
    } else {
        // console.log('loggedInUser cookie not found.');
    }
    
    //GET USER BY USERNAME
    async function getUserByUsername(loggedInUser){
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
        try{
            const user = await contract.methods.getUserByUsername(loggedInUser).call();
            console.log(user);
        }catch(error){
            // console.log('Unable to get user by username', error);
        }
    }
    async function fetchAllUsers(){
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
        try{
            const getAllUsers = await contract.methods.totalUsers().call();
            // console.log(getAllUsers)
            if(getAllUsers == 0){
                await document.querySelector('.showReg').classList.add('active');
            }else{
                await document.querySelector('.showReg').remove();
                await document.querySelector('.registration').remove();
            }
        }
        catch(error){

        }
    }
    fetchAllUsers();

    createAdminButton = document.getElementById('createAdminButton');
    createAdminButton.addEventListener('click', async function(){
        await createAdmin();
    })

    const [
        createUsername, 
        surname, 
        firstname, 
        address, 
        contact, 
        createPassword, 
        confirmPassword] = document.querySelectorAll
        ('#createUsername, #surname, #firstname, #address, #contact, #createPassword, #confirmPassword');
    
    const fields = [createUsername, surname, firstname, address, contact, createPassword, confirmPassword];

    fields.forEach(async field => {
        field.addEventListener('input', async (event) => {
            await verifyTextFields();
        });
    });

    async function verifyTextFields(){
        let username = document.getElementById('createUsername').value;
        let surname = document.getElementById('surname').value;
        let firstname = document.getElementById('firstname').value;
        let fullname = surname +", "+ firstname;
        let address = document.getElementById('address').value;
        let contact = document.getElementById('contact').value;
        let password = document.getElementById('createPassword').value;
        let confirmPassword = document.getElementById('confirmPassword').value;


        let cAlertUser = document.querySelector('.cAlertUser');
        let cUserMsg = document.getElementById('cUserMsg');

        let cAlertPassword = document.querySelector('.cAlertPassword');
        let cPasswordMsg = document.getElementById('cPasswordMsg');

        let cAlertSurname = document.querySelector('.cAlertSurname');
        let cSurnameMsg = document.getElementById('cSurnameMsg');

        let cAlertFirstName = document.querySelector('.cAlertFirstName');
        let cFirstNameMsg = document.getElementById('cFirstNameMsg');

        let cAlertAddress = document.querySelector('.cAlertAddress');
        let cAddressMsg = document.getElementById('cAddressMsg');

        let cAlertContact = document.querySelector('.cAlertContact');
        let cContactMsg = document.getElementById('cContactMsg');


        if(username != "" ||
            surname != "" ||
            firstname != "" ||
            address != "" ||
            contact != "" ||
            password != "" ||
            confirmPassword != ""
        ){
            if(username != ""){
                cAlertUser.classList.remove('active');
                
                document.getElementById('createUsername').style.border = "none";
                cUserMsg.innerHTML = "";
            }
            if(surname != ""){
                cAlertSurname.classList.remove('active');
                
                document.getElementById('surname').style.border = "none";
                cSurnameMsg.innerHTML = "";
            }
            if(firstname != ""){
                cAlertFirstName.classList.remove('active');
                
                document.getElementById('firstname').style.border = "none";
                cFirstNameMsg.innerHTML = "";
            }
            if(address != ""){
                cAlertAddress.classList.remove('active');
                
                document.getElementById('address').style.border = "none";
                cAddressMsg.innerHTML = "";
            }
            if(contact != ""){
                cAlertContact.classList.remove('active');
                
                document.getElementById('contact').style.border = "none";
                cContactMsg.innerHTML = "";
            }
            if(password != "" || confirmPassword == ""){
                cAlertPassword.classList.remove('active');
                
                if(password != ""){
                    document.getElementById('createPassword').style.border = "none";
                }

                if(confirmPassword != ""){
                    document.getElementById('confirmPassword').style.border = "none";
                }
                cPasswordMsg.innerHTML = "";
            }
        }
    }

    async function createAdmin(){
        let username = document.getElementById('createUsername').value;
        let surname = document.getElementById('surname').value;
        let firstname = document.getElementById('firstname').value;
        let fullname = surname +", "+ firstname;
        let address = document.getElementById('address').value;
        let contact = document.getElementById('contact').value;
        let password = document.getElementById('createPassword').value;
        let confirmPassword = document.getElementById('confirmPassword').value;

        const specialCharacters = /[<>&"']/g;

        const sanitizedUsername = username.replace(specialCharacters, "");
        const sanitizedSurname = surname.replace(specialCharacters, "");
        const sanitizedFirstName = firstname.replace(specialCharacters, "");
        const sanitizedFullName = fullname.replace(specialCharacters, "");
        const sanitizedAddress = address.replace(specialCharacters, "");
        const sanitizedContact = contact.replace(specialCharacters, "");
        const sanitizedPassword = password.replace(specialCharacters, "");
        const sanitizedConfirmPassword = confirmPassword.replace(specialCharacters, "");


        let cAlertUser = document.querySelector('.cAlertUser');
        let cUserMsg = document.getElementById('cUserMsg');

        let cAlertPassword = document.querySelector('.cAlertPassword');
        let cPasswordMsg = document.getElementById('cPasswordMsg');

        let cAlertSurname = document.querySelector('.cAlertSurname');
        let cSurnameMsg = document.getElementById('cSurnameMsg');

        let cAlertFirstName = document.querySelector('.cAlertFirstName');
        let cFirstNameMsg = document.getElementById('cFirstNameMsg');

        let cAlertAddress = document.querySelector('.cAlertAddress');
        let cAddressMsg = document.getElementById('cAddressMsg');

        let cAlertContact = document.querySelector('.cAlertContact');
        let cContactMsg = document.getElementById('cContactMsg');


        let role = 1;
        const regex = /^09\d{9}$/;

        if(sanitizedUsername == "" ||
            sanitizedSurname == "" ||
            sanitizedFirstName == "" ||
            sanitizedAddress == "" ||
            sanitizedContact == "" ||
            sanitizedPassword == "" ||
            sanitizedConfirmPassword == ""
        ){
            if(sanitizedUsername == ""){
                cAlertUser.classList.add('active');
                
                document.getElementById('createUsername').style.border = "2px solid #ff4a4a";
                cUserMsg.innerHTML = "Username can't be blank";
            }
            if(sanitizedSurname == ""){
                cAlertSurname.classList.add('active');
                
                document.getElementById('surname').style.border = "2px solid #ff4a4a";
                cSurnameMsg.innerHTML = "Surname can't be blank";
            }
            if(sanitizedFirstName == ""){
                cAlertFirstName.classList.add('active');
                
                document.getElementById('firstname').style.border = "2px solid #ff4a4a";
                cFirstNameMsg.innerHTML = "Username can't be blank";
            }
            if(sanitizedAddress == ""){
                cAlertAddress.classList.add('active');
                
                document.getElementById('address').style.border = "2px solid #ff4a4a";
                cAddressMsg.innerHTML = "Address can't be blank";
            }
            if(sanitizedContact == ""){
                cAlertContact.classList.add('active');
                
                document.getElementById('contact').style.border = "2px solid #ff4a4a";
                cContactMsg.innerHTML = "Contact can't be blank";
            }
            if(sanitizedPassword == "" || confirmPassword == ""){
                cAlertPassword.classList.add('active');
                
                if(sanitizedPassword == ""){
                    document.getElementById('createPassword').style.border = "2px solid #ff4a4a";
                }

                if(sanitizedConfirmPassword == ""){
                    document.getElementById('confirmPassword').style.border = "2px solid #ff4a4a";
                }
                cPasswordMsg.innerHTML = "Password can't be blank";
            }
        }else{
            if(sanitizedPassword != sanitizedConfirmPassword){
                cAlertPassword.classList.add('active');

                document.getElementById('createPassword').style.border = "2px solid #ff4a4a";

                document.getElementById('confirmPassword').style.border = "2px solid #ff4a4a";

                cPasswordMsg.innerHTML = "Password did not match";
            }else{
                if(sanitizedPassword.length < 6){
                    cAlertPassword.classList.add('active');
    
                    document.getElementById('createPassword').style.border = "2px solid #ff4a4a";
    
                    document.getElementById('confirmPassword').style.border = "2px solid #ff4a4a";
    
                    cPasswordMsg.innerHTML = "Password must be at least 6 characters";
                }else{
                    if(regex.test(contact)){
                        const accounts = await web3.eth.getAccounts();
                        const from = accounts[0];
                        const gasEstimate = await contract.methods.addUser(sanitizedUsername, sanitizedPassword, sanitizedFullName, sanitizedAddress, sanitizedContact, role).estimateGas({ from });
                        await contract.methods.addUser(sanitizedUsername, sanitizedPassword, sanitizedFullName, sanitizedAddress, sanitizedContact, role).send({ from, gas: gasEstimate + 10000  });
                        alert(role);
                        window.location.href = "index.html";
                    }else{
                        // alert('Invalid Contact Number')
                        cAlertContact.classList.add('active');
                        
                        document.getElementById('contact').style.border = "2px solid #ff4a4a";
                        cContactMsg.innerHTML = "Invalid Contact Number";
                    }
                }
            }

        }
        
    }

    

    document.addEventListener('keyup', function(e){
        if(e.key == "Enter"){
            login();
        }
    })

    async function resetTextField(){
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        
        let alertUser = document.querySelector('.alertUser');
        let alertPassword = document.querySelector('.alertPassword');

        let userMsg = document.getElementById('userMsg');
        let passwordMsg = document.getElementById('passwordMsg');

        if(username != "" || password != ""){
            if(username != ""){
                alertUser.classList.remove('active');
                
                document.getElementById('username').style.border = "none";
                userMsg.innerHTML = "";
            }

            if(password != ""){
                alertPassword.classList.remove('active');
                
                document.getElementById('password').style.border = "none";
                passwordMsg.innerHTML = "";
            }
        }
    }
    document.getElementById('username').addEventListener('input', function(){
        resetTextField();
    })

    document.getElementById('password').addEventListener('input', function(){
        resetTextField();
    })

    loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', async function(){
        await login();
    })

    async function login(){
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let alertUser = document.querySelector('.alertUser');
        let alertPassword = document.querySelector('.alertPassword');

        let userMsg = document.getElementById('userMsg');
        let passwordMsg = document.getElementById('passwordMsg');
        
        if(username == "" || password == ""){

            if(username == ""){
                alertUser.classList.add('active');
                
                document.getElementById('username').style.border = "2px solid #ff4a4a";
                userMsg.innerHTML = "Username can't be blank";
            }

            if(password == ""){
                alertPassword.classList.add('active');
                document.getElementById('password').style.border = "2px solid #ff4a4a";
                passwordMsg.innerHTML = "Password can't be blank";
            }

        }else{
            const accounts = await web3.eth.getAccounts();
            const from = accounts[0];
            try {
                const isLoggedIn = await contract.methods.isLoggedIn(username).call();
                if (!isLoggedIn) {
                    try {
                        const gasEstimate = await contract.methods.login(username, password).estimateGas({ from });
                        await contract.methods.login(username, password).send({ from, gas: gasEstimate + 10000 });
                        const userRole = await contract.methods.getUserByUsername(username).call();
                        // Store the logged-in user's username in a cookie
                        document.cookie = `loggedInUser=${username}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
                        // Redirect to the dashboard page if login is successful
                        window.location.href = "main.html";
                    } catch (error) {
                        // console.error('Login Error:', error);
                        
                        alertUser.classList.add('active');
                            
                        document.getElementById('username').style.border = "2px solid #ff4a4a";
                        userMsg.innerHTML = "Incorrect Username";
                        
                        alertPassword.classList.add('active');
                        document.getElementById('password').style.border = "2px solid #ff4a4a";
                        passwordMsg.innerHTML = "Incorrect Password";
                    }
                } else {
                    // If already logged in, redirect to the dashboard page
                    window.location.href = "main.html";
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        }
        
    }
    ch = document.getElementById('ch');

    ch.addEventListener('click', async function(){
        await showPassword();
    });

    async function showPassword(){
        let checkbox = await document.getElementById('pcheckBox');
        if(password.type === "password"){
            password.type = "text";
            checkbox.checked = true;
        }else{
            password.type = "password";
            checkbox.checked = false;
        }
    }

})

