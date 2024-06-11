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


    async function loadContractAbiPet() {
        try {
            const response = await fetch('./build/contracts/PetManagementv2.json');
            const data = await response.json();
            return data.abi;
        } catch (error) {
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



    //for notifications
    let runOnce = false;
    async function getUpcomingAppointments(){
        const appointmentCount = await contractPet.methods.appointmentCount().call();
        let appCount = 0;
        if(runOnce == false){
            runOnce = true;
            if(appointmentCount != 0){
                document.querySelector('.noApp').classList.add('show');
                for(let i = 1; i<=appointmentCount;i++){
                    const appointments = await contractPet.methods.getAppointmentById(i).call();
                    
                    const appointmentDate = new Date(appointments[7]);
                    const currentDate = new Date();
                    const appHours = appointmentDate.getHours();
                    const appMinutes = appointmentDate.getMinutes();
                    const differenceInMilliseconds = appointmentDate.getTime() - currentDate.getTime();
                    const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) /(1000 * 60 * 60));
    
                    if (days < 1 && hours < 24 && hours > 0) {
                        appCount++;
                        const pets = await contractPet.methods.getPetById(appointments[11]).call();
                        const owners = await contractPet.methods.getOwnerById(pets[7]).call();
                        document.getElementById('todaysAppointmentRecords').innerHTML = ": "+ appCount;
                        let appDiv = document.createElement('div');
                        appDiv.classList.add('app');
                        appDiv.innerHTML = `
                            <h3>Owner: <span style="color:#ff8400">${owners[1]}, ${owners[2]}</span></h3>
                            <p>Contact No.: <strong>${owners[3]}</strong></p>
                            <p>Pet Name: <span style="color:#ff8400">${pets[1]}</span></p>
                            <p>Remaining Days: ${days}</p>
                            <p>Remaining Hours: ${hours}</p>
                            <p>Expected Arrival: ${appHours}:${appMinutes}</p>
                            <p>Complaint: ${appointments[2]}</p>
                        `
                        document.getElementById('appointments').appendChild(appDiv);
                    }
                }
            }
        }
    }

    window.onload = getUpcomingAppointments();




    async function initializeSearch(){
        const search = await document.querySelector('.mainHeader .input-group input');
        const modalSections = await document.querySelectorAll('#allAppointments');

        if(search){
            search.addEventListener('input', searchDivs);
        }

        function searchDivs() {
            const searchValue = search.value.toLowerCase();
            console.log(searchValue)
            modalSections.forEach(section => {
                const divs = section.querySelectorAll('.allAppList .mainContent #allAppointments .app'); // Select all div elements within the section
                divs.forEach(div => {
                    const divContent = div.textContent.toLowerCase();
                    const isVisible = divContent.includes(searchValue);
                    //div.style.display = isVisible ? 'block' : 'none';
                    div.classList.toggle('hidden', !isVisible);
                });
            });
        }
    }

    let runOnlyOnce = false;
    async function getAllAppointments(){
        const appointmentCount = await contractPet.methods.appointmentCount().call();
        let appCount = 0;
        if(runOnlyOnce == false){
            runOnlyOnce = true;
            if(appointmentCount != 0){
                document.querySelector('.noAllApp').classList.add('show');
                for(let i = 1; i<=appointmentCount;i++){
                    const appointments = await contractPet.methods.getAppointmentById(i).call();
                    
                    const appointmentDate = new Date(appointments[7]);
                    const currentDate = new Date();
                    const appHours = appointmentDate.getHours();
                    const appMinutes = appointmentDate.getMinutes();
                    const differenceInMilliseconds = appointmentDate.getTime() - currentDate.getTime();
                    const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) /(1000 * 60 * 60));
    
                    if (hours > 0) {
                        appCount++;
                        const pets = await contractPet.methods.getPetById(appointments[11]).call();
                        const owners = await contractPet.methods.getOwnerById(pets[7]).call();
                        document.getElementById('allApp').innerHTML = ": "+ appCount;
                        let appDiv = document.createElement('div');
                        appDiv.classList.add('app');
                        appDiv.innerHTML = `
                            <h3>Owner: <span style="color:#ff8400">${owners[1]}, ${owners[2]}</span></h3>
                            <p>Contact No.: <strong>${owners[3]}</strong></p>
                            <p>Pet Name: <span style="color:#ff8400">${pets[1]}</span></p>
                            <p>Date: ${appointments[7]}</p>
                            <p>Complaint: ${appointments[2]}</p>
                        `
                        document.getElementById('allAppointments').appendChild(appDiv);
                    }else{
                        appCount++;
                        const pets = await contractPet.methods.getPetById(appointments[11]).call();
                        const owners = await contractPet.methods.getOwnerById(pets[7]).call();
                        document.getElementById('allApp').innerHTML = ": "+ appCount;
                        let appDiv = document.createElement('div');
                        appDiv.classList.add('app');
                        appDiv.classList.add('disabled');
                        appDiv.innerHTML = `
                            <h3>Owner: <span style="color:#ff8400">${owners[1]}, ${owners[2]}</span></h3>
                            <p>Contact No.: <strong>${owners[3]}</strong></p>
                            <p>Pet Name: <span style="color:#ff8400">${pets[1]}</span></p>
                            <p>Status: Done</p>
                            <p>Date: ${appointments[7]}</p>
                            <p>Complaint: ${appointments[2]}</p>
                        `
                        document.getElementById('allAppointments').appendChild(appDiv);
                    }
                    
                }
            }
        }
        
        initializeSearch();
    }

    window.onload = getAllAppointments();


    
});