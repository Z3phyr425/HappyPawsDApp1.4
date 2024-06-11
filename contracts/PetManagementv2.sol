// SPDX-License-Identifier: MIT


pragma solidity 0.8.13;

contract PetManagementv2{

    struct Owner{
        uint256 id;
        string surname;
        string firstname;
        string contactNumber;
        string email;
        uint256[] pets;
    }

    struct Pet{
        uint256 id;
        string name;
        string birthdate;
        string species;
        string breed;
        string sex;
        string ownerName;
        uint256 ownerId;
        uint256[] appointments;
    }

    struct Appointment{
        uint256 id;
        string vet;
        string complaint;
        string assessment;
        string weight;
        string diagnostic;
        string medication;
        string date;
        string temperature;
        string laboratory;
        string remarks;
        uint256 petId;
    }

    mapping(uint256 => Appointment) public appointments;
    mapping (uint256 => Owner) public owners;
    mapping (uint256 => Pet) public pets;
    
    uint256 public ownerCount;
    uint256 public petCount;
    uint256 public appointmentCount;

    constructor(){
        ownerCount = 0;
        petCount = 0;
        appointmentCount = 0;
    }


    function addOwner(string memory _surname, string memory _firstname, string memory _contactNumber, string memory _email) public{
        ownerCount++;
        owners[ownerCount] = Owner(ownerCount, _surname, _firstname, _contactNumber, _email, new uint256[](0));
    }

    function addPet(string memory _name, string memory _birthdate, string memory _species, string memory _breed, string memory _sex, string memory _ownerName, uint256 _ownerId) public {
        petCount++;
        pets[petCount] = Pet(petCount, _name, _birthdate, _species, _breed, _sex,_ownerName, _ownerId, new uint[](0));
        owners[_ownerId].pets.push(petCount);
    }

    function addAppointment(
        string memory _vet, 
        string memory _complaint, 
        string memory _assessment, 
        string memory _weight, 
        string memory _diagnostic,
        string memory _medication,
        string memory _date,
        string memory _temperature,
        string memory _laboratory,
        string memory _remarks,
        uint256 _petId) public{
        appointmentCount++;
        appointments[appointmentCount] = 
        Appointment(
            appointmentCount, 
            _vet,
            _complaint,
            _assessment,
            _weight,
            _diagnostic,
            _medication,
            _date,
            _temperature,
            _laboratory,
            _remarks,
            _petId);
        pets[_petId].appointments.push(appointmentCount);
    }

    function getOwnerById(uint _ownerId) public view returns(uint256, string memory, string memory, string memory){
        Owner memory owner = owners[_ownerId];
        return (owner.id, owner.surname, owner.firstname, owner.contactNumber);
    }

    function getPetsByOwner(uint256 _ownerId) public view returns (uint256[] memory){
        return owners[_ownerId].pets;
    }

    function getPetById(uint256 _petId) public view returns (uint256, string memory, string memory, string memory, string memory, string memory, string memory, uint256){
        Pet memory pet = pets[_petId];
        return (pet.id, pet.name, pet.birthdate, pet.species, pet.breed, pet.sex, pet.ownerName, pet.ownerId);
    }

    function getAppointmentByPet(uint256 _petId) public view returns(uint256[] memory){
        return pets[_petId].appointments;
    }

    function getAppointmentById(uint256 _appointmentId)
     public view returns(
        uint256, 
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint){
        
            Appointment memory appointment = appointments[_appointmentId];
            return (appointment.id, appointment.vet, appointment.complaint, appointment.assessment, appointment.weight, appointment.diagnostic, appointment.medication, appointment.date, appointment.temperature, appointment.laboratory, appointment.remarks, appointment.petId);
    }

    // Function to update owner's details
    function updateOwner(
        uint256 _ownerId,
        string memory _surname,
        string memory _firstname,
        string memory _contactNumber,
        string memory _email
    ) public {
        require(_ownerId <= ownerCount, "Invalid owner ID");

        Owner storage owner = owners[_ownerId];
        owner.surname = _surname;
        owner.firstname = _firstname;
        owner.contactNumber = _contactNumber;
        owner.email = _email;
    }

    // Function to update pet's details
    function updatePet(
        uint256 _petId,
        string memory _name,
        string memory _birthdate,
        string memory _species,
        string memory _breed,
        string memory _sex
    ) public {
        require(_petId <= petCount, "Invalid pet ID");

        Pet storage pet = pets[_petId];
        pet.name = _name;
        pet.birthdate = _birthdate;
        pet.species = _species;
        pet.breed = _breed;
        pet.sex = _sex;
    }
}