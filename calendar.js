

window.addEventListener('load', async () =>{
  const header = document.querySelector(".calendar h3");
  const dates = document.querySelector(".dates");
  const navs = document.querySelectorAll("#prev, #next");

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
  const contractAddress = "0x23C073965Ea45a7952E1335A51b4F495633fd762";
  const abi = await loadContractAbi();
  const contract = new web3.eth.Contract(abi, contractAddress);
  
  
  let runOnce = false;
  async function renderCalendar() {
        //get the start, end and previous end of the month
        const start = new Date(year, month, 1).getDay();
        const endDate = new Date(year, month + 1, 0).getDate();
        const end = new Date(year, month, endDate).getDay();
        const endDatePrev = new Date(year, month, 0).getDate();
    
        datesHtml = ``
        //generate the previous dates of months
        for (let i = start; i > 0; i--) {
          datesHtml += `<li class="inactive">${endDatePrev - i + 1}</li>`;
        }

        for ( let i = 1; i <= endDate; i++) {
          let className = i === date.getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? ' class="today"' : '';
          datesHtml += `<li${className} id="date-${i}">${i}</li>`;
        }
        
        
        //generate the dates of the upcoming month
        for (let i = end; i < 6; i++) {
          datesHtml += `<li class="inactive">${i - end + 1}</li>`;
        }
        
        dates.innerHTML = datesHtml;
        header.textContent = `${months[month]} ${year}`;
        renderAppointment();
  }

  async function renderAppointment(){
    const appointmentCount = await contract.methods.appointmentCount().call();
    for(let i = 1; i <= appointmentCount; i++){
      const appointments = await contract.methods.getAppointmentById(i).call();
      
      if(appointments[7]!=""){
        let appointmentDate = new Date(appointments[7]);
        let appDate = appointmentDate.getDate();
        let appMonth = appointmentDate.getMonth();
        let appYear = appointmentDate.getFullYear();
        let currentDate = new Date();

        let remainingMonths = appointmentDate - currentDate;
        let remainingDays = appointmentDate - currentDate;
        let days = Math.floor(remainingDays / (1000 * 60 * 60 * 24));
        let months = Math.floor(remainingMonths / (1000 * 60 * 60 * 24 * 30.44));

        let selectedDate = document.getElementById(`date-${appDate}`);
        if(appDate == selectedDate.innerHTML && month == appMonth && appYear == year){
          selectedDate.classList.add('highlight');
        }

        if(Math.sign(days) == -1 && month == appMonth && appYear == year){
          selectedDate.classList.add('done');
        }
      }
      
      
    }
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
        month = 0;renderCalendarconsole.log();
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