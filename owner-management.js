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

function getSessionStorage(){
    searchPetName = sessionStorage.getItem('petName');
    if(searchPetName != null){
        searchBar = document.getElementById('searchBar');
        searchBar.value = searchPetName;
    }
}

window.addEventListener('load', async ()=>{
    if(window.ethereum){
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable;
    }else if(window.web3){
        window.web3 = new Web3(window.currentProvider);
    }else{
        alert('Use Metamask');
    }

    async function loadContractAbi(){
        try{
            const response = await fetch('./build/contracts/PetManagementv2.json');
            const data = await response.json();
            return data.abi;
        }catch{
            console.error("Unable to fetch ABI", error);
            throw error;
        }
    }

    async function loadContractAbiUser(){
        try{
            const response = await fetch('./build/contracts/UserManagement.json');
            const data = await response.json();
            return data.abi;
        }catch{
            console.error("Unable to fetch ABI", error);
            throw error;
        }
    }

    const contractAddress = "0x23C073965Ea45a7952E1335A51b4F495633fd762";
    const abi = await loadContractAbi();
    const contract = new web3.eth.Contract(abi, contractAddress);

    const contractAddressUser = "0x2400E76613AE76874bb1bf00F26Ac822Eb3fEA48";
    const abiUser = await loadContractAbiUser();
    const contractUser = new web3.eth.Contract(abiUser, contractAddressUser);

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
            const user = await contractUser.methods.getUserByUsername(loggedInUser).call();
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

    //validation for add owner
    document.getElementById('contactNumber').addEventListener('input', function(){
        showAddAlert();
    });

    document.getElementById('surname').addEventListener('input', function(){
        showAddAlert();
    });

    document.getElementById('firstName').addEventListener('input', function(){
        showAddAlert();
    });

    function showAddAlert(){
        const surname = document.getElementById('surname').value;
        const firstname = document.getElementById('firstName').value;
        const contactNumber = document.getElementById('contactNumber').value;
        const email = document.getElementById('email').value;
        const regex = /^09\d{9}$/;
        const regexLength = /^.{6,}$/;
        if(surname == "" ||
            firstname == "" ||
            contactNumber ==""
        ){
            if(surname == ""){
                document.querySelector('.alertSurname').classList.add('show');
                document.querySelector('.alertSurname').innerHTML = "Surname is required";
            }else{
                document.querySelector('.alertSurname').classList.remove('show');
            }

            if(firstname == ""){
                document.querySelector('.alertFirstname').classList.add('show');
                document.querySelector('.alertFirstname').innerHTML = "First Name is required";
            }else{
                document.querySelector('.alertFirstname').classList.remove('show');
            }

            if(contactNumber == ""){
                document.querySelector('.alertContact').classList.add('show');
                document.querySelector('.alertContact').innerHTML = "Contact is required";
            }else{
                document.querySelector('.alertContact').classList.remove('show');
                //contact format
                if(regex.test(contactNumber)){
                    document.querySelector('.alertContact').classList.remove('show');
                }else{
                    document.querySelector('.alertContact').classList.add('show');
                    document.querySelector('.alertContact').innerHTML = "Invalid Contact Number";
                }
            }
        }else{
            document.querySelector('.alertSurname').classList.remove('show');
            document.querySelector('.alertContact').classList.remove('show');
            document.querySelector('.alertFirstname').classList.remove('show');
            //contact format
            if(regex.test(contactNumber)){
                document.querySelector('.alertContact').classList.remove('show');
            }else{
                document.querySelector('.alertContact').classList.add('show');
                document.querySelector('.alertContact').innerHTML = "Invalid Contact Number";
            }
        }
    }

    window.addOwner = async () => {
        const surname = document.getElementById('surname').value;
        const firstname = document.getElementById('firstName').value;
        const contactNumber = document.getElementById('contactNumber').value;
        const email = document.getElementById('email').value
        const accounts = await web3.eth.getAccounts();
        const specialCharacters = /[<>&"']/g;

        const sanitizedSurname = surname.replace(specialCharacters, "");
        const sanitizedFirstname = firstname.replace(specialCharacters, "");
        const sanitizedEmail = email.replace(specialCharacters, "");

        
        const from = accounts[0];
        const regex = /^09\d{9}$/;
        if(surname == ""||
            firstname == ""||
            contactNumber ==""
        ){
            showAddAlert();
        }else{
            if(regex.test(contactNumber)){
                await contract.methods.addOwner(sanitizedSurname, sanitizedFirstname, contactNumber, sanitizedEmail).send({from});
                displayAllOwners();
                closeAddOwnerFormModal();
            }else{
                showAddAlert();
            }
        }
    }

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

            document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i)=>{
                visible_row.style.backgroundColor = (i % 2 == 0) ? '#0000000b' : 'transparent'
            });

        }

        window.search = async () =>{
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

    document.getElementById('ucontactNumber').addEventListener('input', function(){
        showUpdateAlert();
    });

    document.getElementById('usurname').addEventListener('input', function(){
        showUpdateAlert();
    });

    document.getElementById('ufirstName').addEventListener('input', function(){
        showUpdateAlert();
    });

    function showUpdateAlert(){
        const surname = document.getElementById('usurname').value;
        const firstname = document.getElementById('ufirstName').value;
        const contactNumber = document.getElementById('ucontactNumber').value;
        const email = document.getElementById('uemail').value;
        const regex = /^09\d{9}$/;
        const regexLength = /^.{6,}$/;
        if(surname == "" ||
            firstname == "" ||
            contactNumber ==""
        ){
            if(surname == ""){
                document.querySelector('.alertUpdateSurname').classList.add('show');
                document.querySelector('.alertUpdateSurname').innerHTML = "Surname is required";
            }else{
                document.querySelector('.alertUpdateSurname').classList.remove('show');
            }

            if(firstname == ""){
                document.querySelector('.alertUpdateFirstname').classList.add('show');
                document.querySelector('.alertUpdateFirstname').innerHTML = "First Name is required";
            }else{
                document.querySelector('.alertUpdateFirstname').classList.remove('show');
            }
            if(contactNumber == ""){
                document.querySelector('.alertUpdateContact').classList.add('show');
                document.querySelector('.alertUpdateContact').innerHTML = "Contact is required";
            }else{
                document.querySelector('.alertUpdateContact').classList.remove('show');
                if(regex.test(contactNumber)){
                    document.querySelector('.alertUpdateContact').classList.remove('show');
                }else{
                    document.querySelector('.alertUpdateContact').classList.add('show');
                    document.querySelector('.alertUpdateContact').innerHTML = "Invalid Contact Number";
                }
            }
        }else{
            document.querySelector('.alertUpdateSurname').classList.remove('show');
            document.querySelector('.alertUpdateContact').classList.remove('show');
            document.querySelector('.alertUpdateFirstname').classList.remove('show');
            //contact format
            if(regex.test(contactNumber)){
                document.querySelector('.alertUpdateContact').classList.remove('show');
            }else{
                document.querySelector('.alertUpdateContact').classList.add('show');
                document.querySelector('.alertUpdateContact').innerHTML = "Invalid Contact Number";
            }
        }
    }

    window.updateOwner = async () =>{
        const ownerId = document.getElementById('uhiddenId').value;
        const surname = document.getElementById('usurname').value;
        const firstname = document.getElementById('ufirstName').value;
        const contactNumber = document.getElementById('ucontactNumber').value;
        const email = document.getElementById('uemail').value;

        const specialCharacters = /[<>&"']/g;

        const sanitizedSurname = surname.replace(specialCharacters, "");
        const sanitizedFirstname = firstname.replace(specialCharacters, "");
        const sanitizedEmail = email.replace(specialCharacters, "");
        
        const regex = /^09\d{9}$/;
        try{
            const accounts = await web3.eth.getAccounts();
            const from = accounts[0];
            if(surname == ""||
                firstname =="" ||
                contactNumber ==""
            ){
                showUpdateAlert();
            }else{
                if(regex.test(contactNumber)){
                    await contract.methods.updateOwner(ownerId, sanitizedSurname, sanitizedFirstname, contactNumber, sanitizedEmail).send({from});
                    location.reload();
                }else{
                    showUpdateAlert();
                }
            }
            
        }catch(error){
            console.error("Error updating owner:", error);
        }
    }

    async function displayAllOwners(){
        const ownerCount = await contract.methods.ownerCount().call();
        document.getElementById('ownerRecords').innerHTML = ownerCount;
        const owners = [];
        for(let i=1; i<=ownerCount; i++){
            const owner = await contract.methods.owners(i).call();
            owners.push(owner);
        }
        displayOwners(owners);
        initializeSearch();
    }

    window.onload = displayAllOwners();
    

    async function displayOwners(owners){
        const ownersTable = document.getElementById("owners");
        ownersTable.innerHTML = "";
        owners.forEach(owner => {
            const ownerTable = document.createElement("tr");
            ownerTable.innerHTML = `
                <tr>
                    <td>${owner.id}</td>
                    <td>${owner.surname}, ${owner.firstname}</td>
                    <td>${owner.contactNumber}</td>
                    <td>${owner.email}</td>
                    <td>
                        <button class="btn1" onclick="viewUpdateModal(${owner.id}, '${owner.surname}', '${owner.firstname}', '${owner.contactNumber}', '${owner.email}')">Update</button>
                        <button class="btn1" onclick="addPetModal(${owner.id}, '${owner.surname}', '${owner.firstname}', '${owner.contactNumber}', '${owner.email}')">Add Pet</button>
                    </td>
                </tr>
            `;
            ownersTable.appendChild(ownerTable);
        });
    }

    window.openAddOwnerFormModal = async () =>{
        document.getElementById('add-owner-form-modal').style.opacity = 1;
        let addModal = await document.querySelector('.addModal');
        addModal.classList.add('active');

        document.getElementById('surname').value = "";
        document.getElementById('firstName').value = "";
        document.getElementById('contactNumber').value = "";
    }
    
    window.closeAddOwnerFormModal = async() => {
        document.getElementById('add-owner-form-modal').style.opacity = 0;
        let addModal = await document.querySelector('.addModal');
        addModal.classList.remove('active');

    }

    window.viewUpdateModal = async (ownerId, surname, firstname, contactNumber, email) =>{
        document.getElementById('update-owner-form-modal').style.opacity = 1;
        document.getElementById('updateOwnerHeaderName').innerHTML = ownerId + "-" +surname +", "+firstname;
        let updateModal = await document.querySelector('.updateModal');
        updateModal.classList.add('active');

        document.getElementById('uhiddenId').value = ownerId;
        document.getElementById('usurname').value = surname;
        document.getElementById('ufirstName').value = firstname;
        document.getElementById('ucontactNumber').value = contactNumber;
        document.getElementById('uemail').value = email;
    }

    window.closeUpdateOwnerFormModal = async () =>{
        let updateModal = await document.querySelector('.updateModal');
        updateModal.classList.remove('active');

        document.getElementById('update-owner-form-modal').style.opacity = 0;
    }

    window.addPetModal = async (ownerId, surname, firstname)=>{
        document.getElementById('add-pet-form-modal').style.opacity = 1;
        let addModal = await document.querySelector('.addPetModal');
        addModal.classList.add('active');

        document.getElementById('hiddenOwnerId').value = ownerId;
        document.getElementById('petOwner').value = surname +", "+ firstname;
    }

    window.closeAddPetFormModal = async () =>{
        document.getElementById('add-pet-form-modal').style.opacity = 0;
        let addModal = await document.querySelector('.addPetModal');
        addModal.classList.remove('active');
    }

    //validation for add pet
    document.getElementById('petName').addEventListener('input', function(){
        showAddPetAlert();
    });

    document.getElementById('petBirthDate').addEventListener('input', function(){
        showAddPetAlert();
    });

    document.getElementById('petBreed').addEventListener('input', function(){
        showAddPetAlert();
    });

    document.getElementById('petSpecies').addEventListener('input', function(){
        showAddPetAlert();
    });

    function showAddPetAlert(){
        const petName = document.getElementById('petName').value;
        const petBirthdate = document.getElementById('petBirthDate').value;
        const petBreed = document.getElementById('petBreed').value;
        const petSpecies= document.getElementById('petSpecies').value;

        if(petName == "" ||
            petBirthdate == "" ||
            petBreed =="" ||
            petSpecies == ""
        ){
            if(petName == ""){
                document.querySelector('.alertPetName').classList.add('show');
                document.querySelector('.alertPetName').innerHTML = "Pet name is required";
            }else{
                document.querySelector('.alertPetName').classList.remove('show');
            }

            if(petBirthdate == ""){
                document.querySelector('.alertBirthDate').classList.add('show');
                document.querySelector('.alertBirthDate').innerHTML = "Birth date is required";
            }else{
                document.querySelector('.alertBirthDate').classList.remove('show');
            }

            if(petBreed == ""){
                document.querySelector('.alertPetBreed').classList.add('show');
                document.querySelector('.alertPetBreed').innerHTML = "Breed is required";
            }else{
                document.querySelector('.alertPetBreed').classList.remove('show');
            }

            if(petSpecies == ""){
                document.querySelector('.alertPetSpecies').classList.add('show');
                document.querySelector('.alertPetSpecies').innerHTML = "Species is required";
            }else{
                document.querySelector('.alertPetSpecies').classList.remove('show');
            }
        }else{
            document.querySelector('.alertPetName').classList.remove('show');
            document.querySelector('.alertBirthDate').classList.remove('show');
            document.querySelector('.alertPetBreed').classList.remove('show');
            document.querySelector('.alertPetSpecies').classList.remove('show');
        }
    }

    window.addPet = async () => {
        const petName = document.getElementById('petName').value;
        const petBirthdate = document.getElementById('petBirthDate').value;
        const petBreed = document.getElementById('petBreed').value;
        const petSpecies= document.getElementById('petSpecies').value;
        const petSex = document.getElementById('petSex').value;
        const petOwnerName = document.getElementById('petOwner').value;
        const petOwnerId = document.getElementById('hiddenOwnerId').value 
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];

        const specialCharacters = /[<>&"']/g;

        const sanitizedPetName = petName.replace(specialCharacters, "");
        const sanitizedpetBreed = petBreed.replace(specialCharacters, "");
        const sanitizedpetSpecies = petSpecies.replace(specialCharacters, "");

        if(petName == "" ||
            petBirthdate == "" ||
            petBreed =="" ||
            petSpecies == ""
        ){
            showAddPetAlert();
        }else{
            await contract.methods.addPet(sanitizedPetName, petBirthdate, sanitizedpetSpecies, sanitizedpetBreed, petSex, petOwnerName, petOwnerId).send({from});
        }
    }

    window.logout = async () => {
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
        try {
                const user = await contractUser.methods.getUserByUsername(loggedInUser).call();
                await contractUser.methods.logout(user[0]).send({ from });
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
})