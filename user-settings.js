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

window.addEventListener('load', async () =>{
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
    } else {
            window.location.href = "index.html";
            console.log('loggedInUser cookie not found.');
    }

    //GET USER BY USERNAME
    async function getUserByUsername(loggedInUser){
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
        try{
            const user = await contract.methods.getUserByUsername(loggedInUser).call();
            document.getElementById('userFullName').innerHTML = user[2];
            document.getElementById('userAccount').innerHTML = user[0];
            
            document.getElementById('fullname').innerHTML = user[2]
            document.getElementById('address').innerHTML = user[3]
            document.getElementById('contact').innerHTML = user[4]
            
            if(user[5] == 1){
                document.getElementById('role').innerHTML = "Vet";
            }else{
                document.getElementById('role').innerHTML = "Vet Assistant";
            }
            verifyRole(user[5]);
        }catch(error){
            console.log('Unable to get user by username', error);
            window.location.href = "index.html";
        }
    }

    function verifyRole(role){
        if(role == 1){
            document.getElementById('accountManagement').classList.add('shown');
            // document.querySelector('.backUpManagement').classList.add('active');
        }
    }

    window.logout = async () => {
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
        try {
                const user = await contract.methods.getUserByUsername(loggedInUser).call();
                await contract.methods.logout(user[0]).send({ from });
                deleteCookie('loggedInUser');
                window.location.href = "index.html";
        } catch (error) {
                alert('Logout failed.');
                console.error('Logout Error:', error);
        }
    }

    function deleteCookie(cookieName) {
       document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    window.showPassword = function (){
        let password = document.getElementById('password');
        let npassword = document.getElementById('npassword');
        if(password.type === "password" || npassword.type === "password"){
            password.type = "text";
            npassword.type = "text";
        }else{
            password.type = "password";
            npassword.type = "password";
        }
    }

    window.changePassword = async () => {
        const username = localStorage.getItem('username');
        const currentPassword = document.getElementById('password').value;
        const newPassword = document.getElementById('npassword').value;
        try {
            const accounts = await web3.eth.getAccounts();
    
            const user = await contract.methods.getUserByUsername(username).call();
            console.log(user);
            if (web3.utils.keccak256(user[1]) !== web3.utils.keccak256(currentPassword)) {
                throw new Error('Incorrect current password');
            }
    
            // Call the contract function to change password
            await contract.methods.changePasswordByUsername(username, currentPassword, newPassword).send({ from: accounts[0] });
            console.log('Password changed successfully.');
        }catch(error){
            console.error('Error:', error.message);
        }
    }

    window.openUpdateUserFormModal = async () =>{
        document.getElementById('update-user-form-modal').style.opacity = 1;
        const user = await contract.methods.getUserByUsername(loggedInUser).call();
       
        document.getElementById('updatepassword').value = user[1];
        document.getElementById('updatefullname').value = user[2];
        document.getElementById('updateaddress').value = user[3];
        document.getElementById('updatecontact').value = user[4];

        let updateModal = await document.querySelector('.updateModal');
        updateModal.classList.add('active');
    }

    window.closeUpdateUserFormModal = async () =>{
        let updateModal = await document.querySelector('.updateModal');
        updateModal.classList.remove('active');

        document.getElementById('update-user-form-modal').style.opacity = 0;
    }


    document.getElementById('updatepassword').addEventListener('input', function(){
        showUpdateUser();
    });

    document.getElementById('updatefullname').addEventListener('input', function(){
        showUpdateUser();
    });

    document.getElementById('updateaddress').addEventListener('input', function(){
        showUpdateUser();
    });

    document.getElementById('updatecontact').addEventListener('input', function(){
        showUpdateUser();
    });

    function showUpdateUser(){
        let password = document.getElementById('updatepassword').value;
        let fullname = document.getElementById('updatefullname').value;
        let address = document.getElementById('updateaddress').value;
        let contact = document.getElementById('updatecontact').value;
        const regex = /^09\d{9}$/


        if(password == "" ||
            fullname =="" ||
            address =="" ||
            contact ==""
        ){
            if(password == ""){
                document.querySelector('.alertUpdatePassword').classList.add('show');
                document.querySelector('.alertUpdatePassword').innerHTML = "Password is required";
            }else{
                document.querySelector('.alertUpdatePassword').classList.remove('show');
            }

            if(password.length < 6){
                document.querySelector('.alertUpdatePassword').classList.add('show');
                document.querySelector('.alertUpdatePassword').innerHTML = "Password must be at least 6 characters long";
            }else{
                document.querySelector('.alertUpdatePassword').classList.remove('show');
            }

            if(fullname == ""){
                document.querySelector('.alertUpdateFullName').classList.add('show');
                document.querySelector('.alertUpdateFullName').innerHTML = "Full name is required";
            }else{
                document.querySelector('.alertUpdateFullName').classList.remove('show');
            }

            if(address == ""){
                document.querySelector('.alertUpdateAddress').classList.add('show');
                document.querySelector('.alertUpdateAddress').innerHTML = "Address is required";
            }else{
                document.querySelector('.alertUpdateAddress').classList.remove('show');
            }
            
            if(contact == ""){
                document.querySelector('.alertUpdateContact').classList.add('show');
                document.querySelector('.alertUpdateContact').innerHTML = "Contact number is required";
            }else{
                document.querySelector('.alertUpdateContact').classList.remove('show');
                if(regex.test(contact)){
                    document.querySelector('.alertUpdateContact').classList.remove('show');
                }else{
                    document.querySelector('.alertUpdateContact').classList.add('show');
                    document.querySelector('.alertUpdateContact').innerHTML = "Invalid contact mumber";
                }
            }
        }else{
            document.querySelector('.alertUpdatePassword').classList.remove('show');
            document.querySelector('.alertUpdateFullName').classList.remove('show');
            document.querySelector('.alertUpdateAddress').classList.remove('show');
            document.querySelector('.alertUpdateContact').classList.remove('show');

            if(regex.test(contact)){
                document.querySelector('.alertUpdateContact').classList.remove('show');
            }else{
                document.querySelector('.alertUpdateContact').classList.add('show');
                document.querySelector('.alertUpdateContact').innerHTML = "Invalid contact mumber";
            }

            if(password.length < 6){
                document.querySelector('.alertUpdatePassword').classList.add('show');
                document.querySelector('.alertUpdatePassword').innerHTML = "Password must be at least 6 characters long";
            }else{
                document.querySelector('.alertUpdatePassword').classList.remove('show');
            }
        }
    }

    window.updateUser = async () =>{
        const user = await contract.methods.getUserByUsername(loggedInUser).call();

        let username = user[0];
        let password = document.getElementById('updatepassword').value;
        let fullname = document.getElementById('updatefullname').value;
        let address = document.getElementById('updateaddress').value;
        let contact = document.getElementById('updatecontact').value;
        let role = user[5];

        const specialCharacters = /[<>&"']/g;
        const regex = /^09\d{9}$/

        const sanitizedPassword = password.replace(specialCharacters, "");
        const sanitizedFullName = fullname.replace(specialCharacters, "");
        const sanitizedAddress = address.replace(specialCharacters, "");
        const sanitizedContact = contact.replace(specialCharacters, "");
         

             // Get the Ethereum address of the current user
             const accounts = await web3.eth.getAccounts();
             const from = accounts[0];

            // Call the contract's updateUserByUsername function
            try {
                if(password == "" ||
                fullname =="" ||
                address =="" ||
                contact ==""){
                    showUpdateUser()
                }else{
                    if(regex.test(contact)){
                        const gasEstimate = await contract.methods.updateUserByUsername(username, sanitizedPassword, sanitizedFullName, sanitizedAddress, sanitizedContact, role).estimateGas({ from });
                        await contract.methods.updateUserByUsername(username, sanitizedPassword, sanitizedFullName, sanitizedAddress, sanitizedContact, role).send({ from, gas: gasEstimate + 10000 });
    
                        window.location.href = "user-settings.html"
                    // Optionally, you can reload the page or update the UI
    
                    }else{
                        showUpdateUser();
                    }
                }
                
                
            } catch (error) {
                console.error('Failed to update user:', error);
                // Handle error scenario
            }
    }

    window.showPassword = async () =>{
        let password = await document.getElementById('updatepassword');
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


function togglePasswordVisibility(inputId) {
    var x = document.getElementById(inputId);
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }