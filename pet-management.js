

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
    
    window.addPet = async () => {
        console.log('Pet Added Successfully');
        const petName = document.getElementById('petName').value;
        const petBirthdate = document.getElementById('petBirthDate').value;
        const petBreed = document.getElementById('petBreed').value;
        const petSpecies= document.getElementById('petSpecies').value;
        const petOwner = document.getElementById('petOwner').value;
        const petSex = document.getElementById('petSex').value;
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];

        await contract.methods.addPet(petName, petBirthdate, petBreed, petSpecies, petOwner, petSex).send({from});
        displayAllPets();
        closeAddPetFormModal();
    }


    

    async function initializeSearch(clicked) {
        const search = await document.querySelector('.table_header .input-group input');
        const searchAppointment = await document.querySelector('.appointmentModal .modalHeader .input-group input');
        const modalSections = await document.querySelectorAll('.appointmentSection');
        const table_rows = await document.querySelectorAll('tbody tr');
        const table_headings = await document.querySelectorAll('thead th');
    
        if (search) {
            search.addEventListener('input', searchTable);
            if(clicked == true){
                searchTable();
            }
        }

        if(searchAppointment){
            searchAppointment.addEventListener('input', searchDivs);
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

        function searchDivs() {
            const searchValue = searchAppointment.value.toLowerCase();
            modalSections.forEach(section => {
                const divs = section.querySelectorAll('div'); // Select all div elements within the section
                divs.forEach(div => {
                    const divContent = div.textContent.toLowerCase();
                    const isVisible = divContent.includes(searchValue);
                    //div.style.display = isVisible ? 'block' : 'none';
                    div.classList.toggle('hidden', !isVisible);
                });
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

    async function displayAllPets(){
        const petCount = await contract.methods.petCount().call();
        document.getElementById('petRecords').innerHTML += ": "+ petCount;
        const pets = [];
        for(let i=1; i<=petCount; i++){
            const pet = await contract.methods.pets(i).call();
            pets.push(pet);
        }
        displayPets(pets);
        initializeSearch();
    }
    window.onload = displayAllPets();
    getSessionStorage();

    async function displayPets(pets){
        const petsTable = document.getElementById("pets");
        petsTable.innerHTML = "";
        pets.forEach(pet => {
            const petTable = document.createElement("tr");
            petTable.innerHTML = `
                <tr>
                    <td>${pet.id}</td>
                    <td>${pet.ownerName}</td>
                    <td>${pet.name}</td>
                    <td>${pet.birthdate}</td>
                    <td>${pet.species}</td>
                    <td>${pet.breed}</td>
                    <td>${pet.sex}</td>
                    <td>
                        <button class="btn1" onclick="viewUpdateModal(${pet.id}, '${pet.name}', '${pet.birthdate}', '${pet.species}', '${pet.breed}',  '${pet.ownerName}','${pet.sex}')">Update</button>
                        <button class="btn1" onclick="viewPetModal(${pet.id}, '${pet.name}', '${pet.birthdate}', '${pet.species}', '${pet.breed}', '${pet.ownerName}','${pet.sex}')">Records</button>
                    </td>
                </tr>
            `;
            petsTable.appendChild(petTable);
        });
    }

    window.viewPetModal = async (petId, petName, petBirthDate, petSpecies, petBreed, petOwner, petSex) =>{
        // document.getElementById('view-pet-modal').style.display = 'block';
        let appointmentModal = document.querySelector('.appointmentEntries');
        appointmentModal.classList.add('active');

        window.scrollTo({
            top: 800, // Adjust the value to the desired scroll position
            behavior: 'smooth' // Make the scroll behavior smooth
        });

        document.getElementById('hiddenId').value = petId;
        document.getElementById('petHeaderName').innerHTML = await petName;
        document.getElementById('petHeaderName1').innerHTML = await petName;
        document.getElementById('hpetSex').value = petSex;

        
        document.getElementById("appointmentList").innerHTML = ``;
        // document.getElementById("ownerDetails").innerHTML = ``;
        document.getElementById("petDetails").innerHTML = ``;

        // let i = 1;
        displayAppointmentList(petId, petOwner);
        // displayAppointment(petId);
        // while(i<= appointmentCount){ 
        //     displayAppointmentList(petId, i, appointmentCount, petOwner);
        //     i++;
        // }
    }

    window.openAddAppointmentModal = async () =>{
        let appointmentForm = document.querySelector('.appointmentForm');
        appointmentForm.classList.add('active');
        let userFullName = document.getElementById('userFullName').innerText;
        document.getElementById('vetOnDuty').value = userFullName;
    }

    window.closeAddAppointmentModal = async () => {
        let appointmentForm = document.querySelector('.appointmentForm');
        appointmentForm.classList.remove('active');
    }

    
    window.addAppointment = async () =>{
        const petId = document.getElementById('hiddenId').value;
        const vet = document.getElementById('vetOnDuty').value;
        const complaint = document.getElementById('complaint').value;
        const assessment = document.getElementById('generalAssessment').value;
        const weight = document.getElementById('bodyWt').value;
        const diagnostic = document.getElementById('diagnosticTool').value;
        const medication = document.getElementById('medicationTreatment').value;
        const date = document.getElementById('checkUpVisit').value;
        const temp = document.getElementById('temp').value;
        const laboratory = document.getElementById('laboratoryFindings').value;
        const remarks = document.getElementById('remarks').value;
        const currentDate = new Date();

        const specialCharacters = /[<>&"']/g;

        const sanitizedVet = vet.replace(specialCharacters, "");
        const sanitizedComplaint = complaint.replace(specialCharacters, "");
        const sanitizedAssessment = assessment.replace(specialCharacters, "");
        const sanitizedWeight = weight.replace(specialCharacters, "");
        const sanitizedDiagnostic = diagnostic.replace(specialCharacters, "");
        const sanitizedMedication= medication.replace(specialCharacters, "");
        const sanitizedDate= date.replace(specialCharacters, "");
        const sanitizedTemp= temp.replace(specialCharacters, "");
        const sanitizedLaboratory = laboratory.replace(specialCharacters, "");
        const sanitizedRemarks = remarks.replace(specialCharacters, "");
        
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
        

        try{
            if(date==""){
                let modifiedComplaint = sanitizedComplaint + "--Date: " + currentDate;
                
                const gasEstimation = await contract.methods.addAppointment(sanitizedVet, modifiedComplaint, sanitizedAssessment, sanitizedWeight, sanitizedDiagnostic, sanitizedMedication, sanitizedDate, sanitizedTemp, sanitizedLaboratory, sanitizedRemarks, petId).estimateGas({ from });

                await contract.methods.addAppointment(sanitizedVet, modifiedComplaint, sanitizedAssessment, sanitizedWeight, sanitizedDiagnostic, sanitizedMedication, sanitizedDate, sanitizedTemp, sanitizedLaboratory, sanitizedRemarks, petId).send({ from, gas: gasEstimation + 10000 });   
            }else{
                const gasEstimation = await contract.methods.addAppointment(sanitizedVet, sanitizedComplaint, sanitizedAssessment, sanitizedWeight, sanitizedDiagnostic, sanitizedMedication, sanitizedDate, sanitizedTemp, sanitizedLaboratory, sanitizedRemarks, petId).estimateGas({ from });

                await contract.methods.addAppointment(sanitizedVet, sanitizedComplaint, sanitizedAssessment, sanitizedWeight, sanitizedDiagnostic, sanitizedMedication, sanitizedDate, sanitizedTemp, sanitizedLaboratory, sanitizedRemarks, petId).send({ from, gas: gasEstimation + 10000 });
            }
           
            
            document.getElementById('view-pet-modal').style.display = 'hidden';
            window.scrollTo({
                top: 0, // Adjust the value to the desired scroll position
                behavior: 'smooth' // Make the scroll behavior smooth
            });
        }catch(error){
            console.error("Transaction failed:", error);
        }
    }


    




    window.getAppointment = async () => {
        const petIdAppointment = document.getElementById('petIdAppointment').value;
        const appointmentId = document.getElementById('appointmentId').value;
        displayAppointment(petIdAppointment, appointmentId);
        initializeSearch();
    }



    async function displayAppointment(appointmentId){
        const appointment = await contract.methods.getAppointmentById(appointmentId).call();
        // console.log(appointments);

        const appointmentDiv = document.getElementById(`petDetails`);
        const appointmentsDiv = document.getElementById("appointmentList");
        // const ownersDiv = document.getElementById("ownerDetails");

        if(appointmentId == null || appointmentId == 0){
            appointmentsDiv.innerHTML =  `<h4 style="text-align: center; margin-left: auto; margin-right: auto; margin-top: auto"></h4>`;
            // ownersDiv.innerHTML =  `<h4 style="text-align: center; margin-left: auto; margin-right: auto; margin-top: auto"></h4>`;
            appointmentDiv.innerHTML = `<h4 style="text-align: center; margin-left: auto; margin-right: auto; margin-top: auto">Select An Appointment</h4>`;
        }else{    
        appointmentDiv.innerHTML = `
        <p>Vet on Duty: ${appointment[1]}</p>
        <p>Complaint/History: ${appointment[2]}</p>
        <p>General Assessment: ${appointment[3]}</p>
        <p>Body Wt: ${appointment[4]}</p>
        <p>Diagnostic Tool: ${appointment[5]}</p>
        <p>Medication/Treatment: ${appointment[6]}</p>
        <p>Follow Up Check-Up/Visit: ${appointment[7]}</p>
        <p>Temperature: ${appointment[8]}</p>
        <p>Laboratory/Findings: ${appointment[9]}</p>
        <p>Remarks: ${appointment[10]}</p>
        
        
        <button onclick="generatePdf('${petId}', '${appointmentId}', '${appointment[1]}', '${appointment[2]}', '${appointment[3]}', '${appointment[4]}', '${appointment[5]}', '${appointment[6]}', '${appointment[7]}', '${appointment[8]}', '${appointment[9]}', '${appointment[10]}')">Generate PDF</button>
    `;
        }
    }

    window.generatePdf = async (petId, appointmentId, vet, complaint, assessment, weight, diagnostic, medication, date, temp, laboratory, remarks) =>{
        const pet = await contract.methods.getPetById(petId).call();
        const owner = await contract.methods.getOwnerById(pet[7]).call();
        // console.log(owner);
        // console.log(pet);
        // console.log(date);
    
        let petBirthDate = new Date(pet[2]);
        let currentDate = new Date();
    
        let petMonth = petBirthDate.getMonth();
        let petYear = petBirthDate.getFullYear();
    
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
    
        // Calculate the difference in years
        let yearDiff = currentYear - petYear;
    
        // Calculate the difference in months
        let monthDiff = currentMonth - petMonth;
    
        // Adjust the yearDiff and monthDiff if necessary
        if (monthDiff < 0) {
            yearDiff--;
            monthDiff += 12;
        }
    
        // If the current day is less than the pet's birth day, subtract one month
        if (currentDate.getDate() < petBirthDate.getDate()) {
            monthDiff--;
            if (monthDiff < 0) {
                yearDiff--;
                monthDiff += 12;
            }
        }
    
        
    
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
    
        // Header
        pdf.setFontSize(16);
        const headerText = "HAPPY PETS VETERINARY SERVICES";
        const headerTextWidth = pdf.getTextWidth(headerText);
        const headerX = (pageWidth - headerTextWidth) / 2;
        pdf.text(headerText, headerX, 20);
    
        pdf.setFontSize(14);
        const subHeaderText = "CLIENT DATA INFORMATION SHEET";
        const subHeaderTextWidth = pdf.getTextWidth(subHeaderText);
        const subHeaderX = (pageWidth - subHeaderTextWidth) / 2;
        pdf.text(subHeaderText, subHeaderX, 30);
    
        pdf.setFontSize(12);
    
        // Data
        let yPosition = 40;
        pdf.text("Client Name:", 10, yPosition);
        pdf.text(`${owner[1]}, ${owner[2]}`, 50, yPosition);
        pdf.text("CP Number:", 110, yPosition);
        pdf.text(`${owner[3]}`, 140, yPosition);
    
        yPosition += 10;
        pdf.text("Pet's Name:", 10, yPosition);
        pdf.text(`${pet[1]}`, 50, yPosition);
        pdf.text("Gender:", 110, yPosition);
        pdf.text(`${pet[5]}`, 140, yPosition);  // Assuming pet[5] is gender
        yPosition += 10;
        pdf.text("Wt:", 110, yPosition);
        pdf.text(`${weight}`, 140, yPosition);
        yPosition += 10;
        pdf.text("Temp:", 110, yPosition);
        pdf.text(`${temp}`, 140, yPosition);

        yPosition += 10;
        pdf.text("History/Complaint:", 10, yPosition);
        yPosition += 10;
        pdf.text(`${complaint}`, 10, yPosition);
    
        yPosition += 30;
        pdf.text("Diagnostic/Laboratory:", 10, yPosition);
        yPosition += 10;
        pdf.text(`${diagnostic}`, 10, yPosition);
    
        yPosition += 30;
        pdf.text("Medical Assessment:", 10, yPosition);
        yPosition += 10;
        pdf.text(`${assessment}`, 10, yPosition);
    
        yPosition += 30;
        pdf.text("Treatment/Medication:", 10, yPosition);
        yPosition += 10;
        pdf.text(`${medication}`, 10, yPosition);
    
        yPosition += 30;
        pdf.text("Recommendation:", 10, yPosition);
        yPosition += 10;
        pdf.text(`${remarks}`, 10, yPosition);
    
        yPosition += 10;
        pdf.text("Follow Up Date:", 10, yPosition);
        pdf.text(`${date}`, 50, yPosition);
    
        // Footer
        pdf.setFontSize(16);
        const footerText = "HAPPY PETS VETERINARY SERVICES";
        const footerTextWidth = pdf.getTextWidth(footerText);
        const footerX = (pageWidth - footerTextWidth) / 2;
        pdf.text(footerText, footerX, pdf.internal.pageSize.getHeight() - 5);
    
        // Save or download the PDF
        pdf.save(`${petId}-${pet[1]}_${date}_Appointment_Details.pdf`);

            
    }
    
    

    window.generateAllPdf = (petId, appointmentId, vet, complaint, assessment, weight, diagnostic, medication, date, temp, laboratory, remarks, petName) =>{
        // Create a new jsPDF instance
        const doc = new jsPDF();
        // Add content to the PDF
        doc.setFontSize(32);
        doc.setFont("helvetica", "bold");
        doc.text('CLIENT DATA INFO',100, 15);
        doc.setLineWidth(1);
        doc.line(101, 20, 205, 20);
        //line x1 , y1, x2, y2,

        doc.setFontSize(24);
        doc.setFont("helvetica", "normal");
        doc.text('-CHECK UP/NEW CLIENT-',100, 30);



        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Vet: ${vet}`, 10, 50);
        doc.text(`Complaint: ${complaint}`, 10, 60);
        doc.text(`Assessment: ${assessment}`, 10, 70);
        doc.text(`Weight: ${weight}`, 10, 80);
        doc.text(`Diagnostic: ${diagnostic}`, 10, 90);
        doc.text(`Medication: ${medication}`, 10, 100);
        doc.text(`Date: ${date}`, 10, 110);
        doc.text(`Temperature: ${temp}`, 10, 120);
        doc.text(`Laboratory: ${laboratory}`, 10, 130);
        doc.text(`Remarks: ${remarks}`, 10, 250);
    
        // Save or download the PDF
        doc.save(`${petId}-${petName}_${date}_Appointment_Details.pdf`);
    }





















    async function displayAppointmentList(petId, petOwner) {
        const app = await contract.methods.getAppointmentByPet(petId).call();
        app.forEach(async appointment =>{
            const appointments = await contract.methods.getAppointmentById(appointment).call();

            

            const appointmentDiv = document.createElement('div');
            appointmentDiv.style.textAlign = 'center';
            appointmentDiv.style.margin = '1rem';
            appointmentDiv.style.cursor = 'pointer';
            appointmentDiv.onclick = function(event) {
                event.stopPropagation();
                selectAppointment(appointments[0]);
            };

            // const ownerDiv = document.getElementById("ownerDetails");
            // ownerDiv.style.textAlign = "center";
            // ownerDiv.style.margin = "1rem";
            // ownerDiv.style.cursor = "pointer";
            // ownerDiv.innerHTML = `<h3>${petOwner}</h3>`;

            
            // for date calculation later
            let dateString = appointments[7];
            let date = new Date(dateString);
            let currentDate = new Date;
            let difference = date - currentDate;

            let days = Math.floor(difference / (1000 * 60 * 60 * 24));
            let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            let fontColor;
            let status;
            
            if(days<0 && hours<0){
                fontColor = "gray";
                status = "Done";
                appointmentDiv.innerHTML = `
                    <h5 style="color:${fontColor}">Status: ${status}</h5>
                    <h5 style="color:${fontColor}">Overdue of: ${(days*-1)} days and ${hours*-1} hours.</h5>
                    <h5 style="color:${fontColor}">Type: Appointment</h5>
                    <h5>Appointment Date: ${appointments[7]}</h5>
                    <h5 class="forSearchingHistory">Complaint/History: ${appointments[2]}</h5>
                    <hr>
                `
            }else if(days<2){
                fontColor = "orange";
                status = "Near";
                // other term for close
                appointmentDiv.innerHTML = `
                    <h5 style="color:${fontColor}">Status: ${status}</h5>
                    <h5 style="color:${fontColor}">Remaining time: ${days} days and ${hours} hours.</h5>
                    <h5 style="color:${fontColor}">Type: Appointment</h5>
                    <h5>Appointment Date: ${appointments[7]}</h5>
                    <h5 class="forSearchingHistory">Complaint/History: ${appointments[2]}</h5>
                    <hr>
                `
            }else if(days>=2){
                fontColor = "green";
                status = "Remote";
                appointmentDiv.innerHTML = `
                    <h5 style="color:${fontColor}">Status: ${status}</h5>
                    <h5 style="color:${fontColor}">Remaining time: ${days} days and ${hours} hours.</h5>
                    <h5 style="color:${fontColor}">Type: Appointment</h5>
                    <h5>Appointment Date: ${appointments[7]}</h5>
                    <h5 class="forSearchingHistory">Complaint/History: ${appointments[2]}</h5>
                    <hr>
                `
            }else{
                fontColor = "gray";
                status = "Done";
                appointmentDiv.innerHTML = `
                    <h5 style="color:${fontColor}">Status: ${status}</h5>
                    <h5 style="color:${fontColor}">Type: Check-up</h5>
                    <h5 class="forSearchingHistory">Complaint/History: ${appointments[2]}</h5>
                    <hr>
                `
            }

            
            // console.log(`Remaining time: ${days} days and ${hours} hours.`);
        
            document.getElementById('appointmentList').appendChild(appointmentDiv);
            
        })


    }
    
    

    window.selectAppointment = async (appointmentId) => {
        // console.log(appointmentId);
        petId = document.getElementById('hiddenId').value;
        displayAppointment(appointmentId);
    }

    
    window.closeViewPetModal = async () => {
        // document.getElementById('view-pet-modal').style.display = 'none';
        let appointmentModal = document.querySelector('.appointmentEntries');
        appointmentModal.classList.remove('active');

        window.scrollTo({
            top: 0, // Adjust the value to the desired scroll position
            behavior: 'smooth' // Make the scroll behavior smooth
        });

        document.getElementById("appointmentList").innerHTML = ``;
        // document.getElementById("ownerDetails").innerHTML = ``;
        document.getElementById("petDetails").innerHTML = ``;
    };

    window.closeAllAppointmentEntries = async () => {
        // document.getElementById('view-pet-modal').style.display = 'none';
        let appointmentModal = document.querySelector('.allAppointmentEntries');
        appointmentModal.classList.remove('active');

        document.getElementById("allAppointmentList").innerHTML = ``;
        // document.getElementById("ownerDetails").innerHTML = ``;
        document.getElementById("allPetDetails").innerHTML = ``;
    };
    

    window.viewUpdateModal = async (petId, petName, petBirthDate, petSpecies, petBreed, petOwner, petSex) =>{
        document.getElementById('update-pet-form-modal').style.opacity = 1;
        document.getElementById('updatePetHeaderName').innerHTML = petId + "-" +petName;

        document.getElementById('upetName').value = petName;
        document.getElementById('upetBirthDate').value = petBirthDate;
        document.getElementById('upetBreed').value = petBreed;
        document.getElementById('upetSpecies').value = petSpecies;
        document.getElementById('upetOwner').value = petOwner;
        document.getElementById('upetSex').value = petSex;

        document.getElementById('upetId').value = petId;
        
        
        
        let updateModal = await document.querySelector('.updateModal');
        updateModal.classList.add('active');

    }

    window.closeUpdatePetFormModal = async () =>{
        let updateModal = await document.querySelector('.updateModal');
        updateModal.classList.remove('active');

        document.getElementById('update-pet-form-modal').style.opacity = 0;
    }

    window.openAddPetFormModal = async () => {
        document.getElementById('add-pet-form-modal').style.opacity = 1;
        let addModal = await document.querySelector('.addModal');
        addModal.classList.add('active');
    }
    
    window.closeAddPetFormModal = async() => {
        document.getElementById('add-pet-form-modal').style.opacity = 0;
        let addModal = await document.querySelector('.addModal');
        addModal.classList.remove('active');
    }

    //validation for add pet
    document.getElementById('upetName').addEventListener('input', function(){
        showUpdatePetAlert();
    });

    document.getElementById('upetBirthDate').addEventListener('input', function(){
        showUpdatePetAlert();
    });

    document.getElementById('upetBreed').addEventListener('input', function(){
        showUpdatePetAlert();
    });

    document.getElementById('upetSpecies').addEventListener('input', function(){
        showUpdatePetAlert();
    });

    function showUpdatePetAlert(){
        const petName = document.getElementById('upetName').value;
        const petBirthdate = document.getElementById('upetBirthDate').value;
        const petBreed = document.getElementById('upetBreed').value;
        const petSpecies = document.getElementById('upetSpecies').value;

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

    window.updatePet = async () => {
        const petId = document.getElementById('upetId').value;
        const petName = document.getElementById('upetName').value;
        const birthDate = document.getElementById('upetBirthDate').value;
        const breed = document.getElementById('upetBreed').value;
        const species = document.getElementById('upetSpecies').value;
        const sex = document.getElementById('upetSex').value;

        const specialCharacters = /[<>&"']/g;

        const sanitizedPetName = petName.replace(specialCharacters, "");
        const sanitizedpetBreed = breed.replace(specialCharacters, "");
        const sanitizedpetSpecies = species.replace(specialCharacters, "");

        try {
            if(petName == "" ||
                birthDate == "" ||
                breed =="" ||
                species == ""
            ){
                showUpdatePetAlert();
            }else{
                const accounts = await web3.eth.getAccounts();
                const from = accounts[0];
        
                // Call the Solidity function to update the pet
                await contract.methods.updatePet(petId, sanitizedPetName, birthDate, sanitizedpetSpecies, sanitizedpetBreed, sex).send({ from });
                document.getElementById('update-pet-form-modal').style.display = 'none';
                location.reload();
            }
        } catch (error) {
            console.error("Error updating pet:", error);
        }
    }

    year = document.getElementById('year');
    month = document.getElementById('month');

    yearAll = document.getElementById('yearAll');
    monthAll = document.getElementById('monthAll');

    window.sortBtn = () =>{
        sortAppointment();
    }

    window.sortAllBtn = () =>{
        sortAllAppointment();
    }

    async function sortAllAppointment(){
        selectedYear = yearAll.value;
        selectedMonth = monthAll.value;

        let date = new Date(selectedYear, selectedMonth - 1); 

        let yearString = date.getFullYear();
        let monthString = ('0' + (date.getMonth() + 1)).slice(-2); 

        let formattedDate = `${yearString}-${monthString}`;

        // console.log(formattedDate);
        const searchValue = formattedDate;
        const modalSections = await document.querySelectorAll('.allAppointmentSection');

        modalSections.forEach(section => {
            const divs = section.querySelectorAll('div'); // Select all div elements within the section
            divs.forEach(div => {
                const divContent = div.textContent.toLowerCase();
                const isVisible = divContent.includes(searchValue);
                //div.style.display = isVisible ? 'block' : 'none';
                div.classList.toggle('hidden', !isVisible);
            });
        });
    }

    async function sortAppointment(){
        selectedYear = year.value;
        selectedMonth = month.value;

        let date = new Date(selectedYear, selectedMonth - 1); 

        let yearString = date.getFullYear();
        let monthString = ('0' + (date.getMonth() + 1)).slice(-2); 

        let formattedDate = `${yearString}-${monthString}`;

        // console.log(formattedDate);
        const searchValue = formattedDate;
        const modalSections = await document.querySelectorAll('.appointmentSection');

        modalSections.forEach(section => {
            const divs = section.querySelectorAll('div'); // Select all div elements within the section
            divs.forEach(div => {
                const divContent = div.textContent.toLowerCase();
                const isVisible = divContent.includes(searchValue);
                //div.style.display = isVisible ? 'block' : 'none';
                div.classList.toggle('hidden', !isVisible);
            });
        });
    }

    window.resetDate = async () =>{
        year.value = "";
        month.value = "01";

        const modalSections = await document.querySelectorAll('.appointmentSection');
        modalSections.forEach(section => {
            const divs = section.querySelectorAll('div.hidden'); // Select all div elements within the section
            divs.forEach(div => {
                const divContent = div.textContent.toLowerCase();
                // const isVisible = divContent.includes(searchValue);
                //div.style.display = isVisible ? 'block' : 'none';
                div.classList.remove('hidden');
            });
        });
    }

    window.resetAllDate = async () =>{
        yearAll.value = "";
        monthAll.value = "01";

        const modalSections = await document.querySelectorAll('.allAppointmentSection');
        modalSections.forEach(section => {
            const divs = section.querySelectorAll('div.hidden'); // Select all div elements within the section
            divs.forEach(div => {
                const divContent = div.textContent.toLowerCase();
                // const isVisible = divContent.includes(searchValue);
                //div.style.display = isVisible ? 'block' : 'none';
                div.classList.remove('hidden');
            });
        });
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







