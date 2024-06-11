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

window.addEventListener('load', async () => {
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
});