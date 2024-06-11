window.addEventListener('load', async () =>{
    const header = document.querySelector(".calendar h3");
    const dates = document.querySelector(".dates");
    const navs = document.querySelectorAll("#prev, #next");
  
    let appointmentRawDate;
    let appointmentDate;
    let appointmentMonth;
    let appointmentYear;
    let dateCollection = [];
    let monthCollection = [];
    let yearCollection = [];
  
  
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  
  
    //get current year date and month
    let date = new Date();
    let month = date.getMonth();
    let year = date.getFullYear();
  
    
      
  
    //for loading the abi
    async function loadContractAbi() {
      try {
          const response = await fetch('./build/contracts/PetManagementv2.json');
          const data = await response.json();
          return data.abi;
      } catch (error) {
          throw error;
      }
    }
  
    //load Contract ABI for pets with appointments
    const contractAddress = "0x1f4D04b4250C56f466C3c536a26135eca317fB20";
    const abi = await loadContractAbi();
    const contract = new web3.eth.Contract(abi, contractAddress);
  
  
    //render the entire calendar
    async function renderCalendar() {
      //get the start, end and previous end of the month
      const start = new Date(year, month, 1).getDay();
      const endDate = new Date(year, month + 1, 0).getDate();
      const end = new Date(year, month, endDate).getDay();
      const endDatePrev = new Date(year, month, 0).getDate();
      let datesHtml = "";
  
      // // let datesHtml;
      // let datesHtml = document.createElement('li');
  
      //get appointments
  
      const lastPetId = await contract.methods.lastPetId().call();
      
      for(let i =1; i<=lastPetId;i++){
        let allAppointments = await contract.methods.getAppointments(i).call();
        const pets = await contract.methods.pets(i).call();
  
        allAppointments.forEach(appointment =>{
          appointmentRawDate = new Date(appointment.date);
          appointmentDate = appointmentRawDate.getDate();
          appointmentMonth = appointmentRawDate.getMonth();
          appointmentYear = appointmentRawDate.getFullYear();
  
          dateCollection.push(appointmentDate);
          monthCollection.push(appointmentMonth);
          yearCollection.push(appointmentYear);
        })
      }
      
      
  
      //generate the previous dates of months
      for (let i = start; i > 0; i--) {
        datesHtml += `<li class="inactive">${endDatePrev - i + 1}</li>`;
        // datesHtml.className = 'inactive';
        // datesHtml.innerHTML = endDatePrev - i + 1;
      }
  
      //generate the date of the current month
      for (let i = 1; i <= endDate; i++) {
        
        let className = i === date.getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? ' class="today"' : "";
        for(let j = 0; j<dateCollection[i]; j++)
        datesHtml += `<li${className}>${i}</li>`;
      }
      
      //generate the dates of the upcoming month
      for (let i = end; i < 6; i++) {
        datesHtml += `<li class="inactive">${i - end + 1}</li>`;
      }
  
      dates.innerHTML = datesHtml;
      header.textContent = `${months[month]} ${year}`;
    }
  
    //this is for navigating in months
    navs.forEach((nav) => {
      nav.addEventListener("click", (e) => {
        const btnId = e.target.id;
  
        if (btnId === "prev" && month === 0) {
          year--;
          month = 11;
        } else if (btnId === "next" && month === 11) {
          year++;
          month = 0;renderCalendarconsole.log(appointmentDate);
        } else {
          month = btnId === "next" ? month + 1 : month - 1;
        }
  
        date = new Date(year, month, new Date().getDate());
        year = date.getFullYear();
        month = date.getMonth();
  
        renderCalendar();
      });
    });
  
  
    window.onload = renderCalendar();
  });