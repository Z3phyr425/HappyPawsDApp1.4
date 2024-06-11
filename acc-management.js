
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

    const contractAddress = "0x2400E76613AE76874bb1bf00F26Ac822Eb3fEA48";
    const abi = await loadContractAbi();
    const contract = new web3.eth.Contract(abi, contractAddress);
    
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
            verifyRole(user[5]);
        }catch(error){
            console.log('Unable to get user by username', error);
            window.location.href = "index.html";
        }
    }

    function verifyRole(role){
        if(role == 1){
            document.getElementById('accountManagement').classList.add('shown');
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

    // searching and sorting

    async function initializeSearch(clicked) {
        const search = await document.querySelector('.table_header .input-group input');
        const table_rows = await document.querySelectorAll('tbody tr');
        const table_headings = await document.querySelectorAll('thead th');

        if (search) {
            search.addEventListener('input', searchTable);
            if(clicked == true){
                searchTable();
            }
        }

    
        function searchTable() {
            table_rows.forEach((row, i) => {
                let table_data = row.textContent.toLowerCase(),
                search_data = search.value.toLowerCase();
    
                row.classList.toggle('hide',table_data.indexOf(search_data) < 0);
                row.style.setProperty('--delay', i / 25 + 's');
            });
            console.log(table_rows);
            document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i)=>{
                visible_row.style.backgroundColor = (i % 2 == 0) ? '#0000000b' : 'transparent'
            });
        }

        window.search = () =>{
            initializeSearch(true);
        }

        table_headings.forEach((head, i)=>{
            let sort_arc = true;
            head.onclick = () =>{
                table_headings.forEach((head)=> head.classList.remove('active'));
                head.classList.add('active');

                document.querySelectorAll('td').forEach(td=>td.classList.remove('active'));
                table_rows.forEach(row => {
                    row.querySelectorAll('td')[i].classList.add('active');
                })

                head.classList.toggle('asc', sort_arc);
                sort_arc = head.classList.contains('asc') ? false : true;

                sortTable(i, sort_arc);
            }
        })

        function sortTable(column, sort_arc){
            [...table_rows].sort((a,b)=>{
                let first_row = a.querySelectorAll('td')[column].textContent,
                second_row = b.querySelectorAll('td')[column].textContent;
                return sort_arc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
            }).map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
        }
    }



    async function initializeEverything(){
        await displayUsers(); // Wait for users to be displayed before initializing search
        initializeSearch();
    }
    
    // Call initializeEverything after the window loads
    window.onload = initializeEverything();



    async function displayUsers() {
        const usersTable = document.getElementById('users');
        usersTable.innerHTML = "";
        try{
        // Call the contract method to get all user details
        const allUsers = await contract.methods.getAllUsers().call();
        // Populate table with user data
        allUsers[0].forEach((userId, index) => {
            // const row = userTable.insertRow();
            const row = document.createElement('tr');

            const user = {
                id: userId,
                username: allUsers[1][index],
                password: allUsers[2][index],
                fullname: allUsers[3][index],
                useraddress: allUsers[4][index],
                contact: allUsers[5][index],
                role: allUsers[6][index]
            };
            let role;

            if(user.role == 1){
                role="Vet";
                row.innerHTML = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.password}</td>
                    <td>${user.fullname}</td>
                    <td>${user.useraddress}</td>
                    <td>${user.contact}</td>
                    <td>${role}</td>
                    <td>
                        <button disabled onclick="updateUserModal(${user.id}, '${user.username}', '${user.password}', '${user.fullname}', '${user.useraddress}', '${user.contact}', '${user.role}')">Update</button>
                    </td>
                </tr>
                `;  
            }else if(user.role == 0){
                role="Vet Assistant";
                row.innerHTML = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.password}</td>
                    <td>${user.fullname}</td>
                    <td>${user.useraddress}</td>
                    <td>${user.contact}</td>
                    <td>${role}</td>
                    <td>
                        <button onclick="updateUserModal(${user.id}, '${user.username}', '${user.password}', '${user.fullname}', '${user.useraddress}', '${user.contact}', '${user.role}')">Update</button>
                    </td>
                </tr>
                `;  
            }

            
            
        usersTable.appendChild(row);
        });
        }catch(error){
            console.error('error');
        }
    };

    //validation for add user
    document.getElementById('username').addEventListener('input', function(){
        showAddUser();
    });

    document.getElementById('surname').addEventListener('input', function(){
        showAddUser();
    });

    document.getElementById('firstname').addEventListener('input', function(){
        showAddUser();
    });

    document.getElementById('address').addEventListener('input', function(){
        showAddUser();
    });

    document.getElementById('contact').addEventListener('input', function(){
        showAddUser();
    });

    function showAddUser(){
        let username = document.getElementById('username').value;
        let surname = document.getElementById('surname').value;
        let firstname = document.getElementById('firstname').value;
        let address = document.getElementById('address').value;
        let contact = document.getElementById('contact').value;

        
        const regex = /^09\d{9}$/;

        if(username == "" ||
            surname == "" ||
            firstname =="" ||
            address =="" ||
            contact ==""
        ){
            if(username == ""){
                document.querySelector('.alertUsername').classList.add('show');
                document.querySelector('.alertUsername').innerHTML = "Username is required";
            }else{
                document.querySelector('.alertUsername').classList.remove('show');
            }

            if(surname == ""){
                document.querySelector('.alertSurname').classList.add('show');
                document.querySelector('.alertSurname').innerHTML = "Surname is required";
            }else{
                document.querySelector('.alertSurname').classList.remove('show');
            }

            if(firstname == ""){
                document.querySelector('.alertFirstName').classList.add('show');
                document.querySelector('.alertFirstName').innerHTML = "First name is required";
            }else{
                document.querySelector('.alertFirstName').classList.remove('show');
            }

            if(address == ""){
                document.querySelector('.alertAddress').classList.add('show');
                document.querySelector('.alertAddress').innerHTML = "Address is required";
            }else{
                document.querySelector('.alertAddress').classList.remove('show');
            }
            
            if(contact == ""){
                document.querySelector('.alertContact').classList.add('show');
                document.querySelector('.alertContact').innerHTML = "Contact number is required";
            }else{
                document.querySelector('.alertContact').classList.remove('show');
                if(regex.test(contact)){
                    document.querySelector('.alertContact').classList.remove('show');
                }else{
                    document.querySelector('.alertContact').classList.add('show');
                    document.querySelector('.alertContact').innerHTML = "Invalid contact mumber";
                }
            }
        }else{
            document.querySelector('.alertUsername').classList.remove('show');
            document.querySelector('.alertSurname').classList.remove('show');
            document.querySelector('.alertFirstName').classList.remove('show');
            document.querySelector('.alertAddress').classList.remove('show');
            document.querySelector('.alertContact').classList.remove('show');
            if(regex.test(contact)){
                document.querySelector('.alertContact').classList.remove('show');
            }else{
                document.querySelector('.alertContact').classList.add('show');
                document.querySelector('.alertContact').innerHTML = "Invalid contact mumber";
            }
        }
    }

    window.createUser = async () =>{
        let username = document.getElementById('username').value;
        let surname = document.getElementById('surname').value;
        let firstname = document.getElementById('firstname').value;
        let fullname = surname + ", " + firstname;
        let address = document.getElementById('address').value;
        let contact = document.getElementById('contact').value;
        let password = generateRandomCode();
        let role = document.getElementById('role').value;

        const specialCharacters = /[<>&"']/g;
        const regex = /^09\d{9}$/;

        const sanitizedUsername = username.replace(specialCharacters, "");
        const sanitizedSurname = surname.replace(specialCharacters, "");
        const sanitizedFirstName = firstname.replace(specialCharacters, "");
        const sanitizedFullname = fullname.replace(specialCharacters, "");
        const sanitizedAddress = address.replace(specialCharacters, "");
        const sanitizedContact = contact.replace(specialCharacters, "");

        try{
            const accounts = await web3.eth.getAccounts();
            const from = accounts[0];
            if(username == "" ||
            surname == "" ||
            firstname =="" ||
            address =="" ||
            contact ==""){
                showAddUser();
            }else{
                if(regex.test(contact)){
                    const gasEstimate = await contract.methods.addUser(sanitizedUsername, password, sanitizedFullname, sanitizedAddress, sanitizedContact, role).estimateGas({ from });
                    await contract.methods.addUser(sanitizedUsername, password, sanitizedFullname, sanitizedAddress, sanitizedContact, role).send({ from, gas: gasEstimate + 10000  });
                    window.location.href = "account-management.html"
                }else{
                    showAddUser();
                }
            }
        }catch(error){
            console.log('Failed to create account', error);
        }
    }


    function generateRandomCode() {
        // Define all possible characters and numbers
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        
        let randomCode = '';
        
        // Generate a random 6-digit code
        for (let i = 0; i < 6; i++) {
            // Choose a random character from the characters string
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomCode += characters[randomIndex];
        }
        
        return randomCode;
    }

        window.updateUserModal = async (userId, username, password, fullname, address, contact, role) => {
            document.getElementById('update-user-form-modal').style.opacity = 1;
            document.getElementById('updateUserHeaderName').innerHTML = userId + "-" + username;

            document.getElementById('usernameHeader').value = username;

            document.getElementById('updatepassword').value = password;
            document.getElementById('updatefullname').value = fullname;
            document.getElementById('updateaddress').value = address;
            document.getElementById('updatecontact').value = contact;
            document.getElementById('updaterole').value = role;

            let updateModal = await document.querySelector('.updateModal');
            updateModal.classList.add('active');
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

                if(password.length < 6){
                    document.querySelector('.alertUpdatePassword').classList.add('show');
                    document.querySelector('.alertUpdatePassword').innerHTML = "Password must be at least 6 characters long";
                }else{
                    document.querySelector('.alertUpdatePassword').classList.remove('show');
                }

                if(regex.test(contact)){
                    document.querySelector('.alertUpdateContact').classList.remove('show');
                }else{
                    document.querySelector('.alertUpdateContact').classList.add('show');
                    document.querySelector('.alertUpdateContact').innerHTML = "Invalid contact mumber";
                }
            }
        }

        window.updateUser = async () =>{
            let username = document.getElementById('usernameHeader').value;
            let password = document.getElementById('updatepassword').value;
            let fullname = document.getElementById('updatefullname').value;
            let address = document.getElementById('updateaddress').value;
            let contact = document.getElementById('updatecontact').value;
            let role = document.getElementById('updaterole').value;
            const regex = /^09\d{9}$/
            const specialCharacters = /[<>&"']/g;

            const sanitizedUsername = username.replace(specialCharacters, "");
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
                contact ==""
                ){
                    showUpdateUser();
                }else{
                    if(regex.test(contact)){
                        const gasEstimate = await contract.methods.updateUserByUsername(sanitizedUsername, sanitizedPassword, sanitizedFullName, sanitizedAddress, sanitizedContact, role).estimateGas({ from });
                        await contract.methods.updateUserByUsername(sanitizedUsername, sanitizedPassword, sanitizedFullName, sanitizedAddress, sanitizedContact, role).send({ from, gas: gasEstimate + 10000 });
                        window.location.href = "account-management.html"
                    }else{
                        showUpdateUser();
                    }
                }
                
                // Optionally, you can reload the page or update the UI
            } catch (error) {
                console.error('Failed to update user:', error);
                // Handle error scenario
            }
        }
    



        
        

    window.openAddUserFormModal = async () =>{
        document.getElementById('add-user-form-modal').style.opacity = 1;
        let addModal = await document.querySelector('.addModal');
        addModal.classList.add('active');
    }

    window.closeAddUserFormModal = async () => {
        document.getElementById('add-user-form-modal').style.opacity = 0;
        let addModal = await document.querySelector('.addModal');
        addModal.classList.remove('active');

    }

    window.closeUpdateUserFormModal = async () =>{
        let updateModal = await document.querySelector('.updateModal');
        updateModal.classList.remove('active');

        document.getElementById('update-user-form-modal').style.opacity = 0;
    }
})