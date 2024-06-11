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

    // Load Contract ABI and initialize contract
    const abi = await loadContractAbi();
    const contractAddress = "0x2400E76613AE76874bb1bf00F26Ac822Eb3fEA48";
    const contract = new web3.eth.Contract(abi, contractAddress);

    //load Contract ABI for pets with appointments
    const contractAddressPet = "0x23C073965Ea45a7952E1335A51b4F495633fd762";
    const abiPet = await loadContractAbiPet();
    const contractPet = new web3.eth.Contract(abiPet, contractAddressPet);

    async function loadContractAbi() {
        try {
            const response = await fetch('./build/contracts/UserManagement.json');
            const data = await response.json();
            return data.abi;
        } catch (error) {
            throw error;
        }
    }

    //display all pets with appointments

    async function loadContractAbiPet() {
        try {
            const response = await fetch('./build/contracts/PetManagementv2.json');
            const data = await response.json();
            return data.abi;
        } catch (error) {
            throw error;
        }
    }

    window.redirect = async (petName) => {
        window.location.href='pet-management.html';
        sessionStorage.setItem('petName', petName);
    }

    async function initializeSearch(){
        const table_rows = await document.querySelectorAll('tbody tr');
        const table_headings = await document.querySelectorAll('thead th');
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

    function redirect(){
        window.location.href ="pet-management.html";
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


    
    let runOnce = false;
    async function renderAppointment(petId){
        const appointmentId = await contractPet.methods.getAppointmentByPet(petId).call();
        const petCount = await contractPet.methods.petCount().call();
        const appointmentCount = await contractPet.methods.appointmentCount().call();
        let appCount = 0;
        let appointmentArray = [];
        

        if(runOnce==false){
            runOnce=true;
            for(let i=1;i<=appointmentCount;i++){
                const appointments = await contractPet.methods.getAppointmentById(i).call();
                const appointmentDate = new Date(appointments[7]);
                const currentDate = new Date();
                const differenceInMilliseconds = appointmentDate.getTime() - currentDate.getTime();
                const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
                const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) /(1000 * 60 * 60));

                
                if (days < 1 && hours < 24 && hours > 0) {
                    appCount++;
                    document.getElementById('upcomingAppointment').innerHTML = appCount;
                }
            }
            if(appCount == 0){
                document.getElementById('upcomingAppointment').style.fontSize = "1.5rem";
                document.getElementById('upcomingAppointment').innerHTML = "No Appointment For Today";
                document.getElementById('appNum').innerHTML = "";
            }
            if(petCount == 0){
                document.getElementById('totalPets').style.fontSize = "1.5rem";
                document.getElementById('totalPets').innerHTML = "No Pets Registered";
                document.getElementById('petNum').innerHTML = "";
            }else{
                document.getElementById('totalPets').innerHTML = petCount;
            }
        }
        
         
    }
    

    async function initializeAppointment(){
        const petCount = await contractPet.methods.petCount().call();
        for(let i =1; i<=petCount;i++){
            renderAppointment(i);
        }
    }


    window.onload = initializeAppointment();

    window.gotoNotification = function(){
        window.location.href = "notification.html";
    }

    window.gotoPets = function(){
        window.location.href = "pet-management.html";
    }
});
