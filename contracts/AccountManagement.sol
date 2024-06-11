// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.13;

contract PetManagement {
    struct Pet {
        string name;
        uint age;
        string breed;
        string species;  // Add species field
        string owner;    // Add owner field
        uint timestamp;  // Add timestamp field
        string action;   // Add action field
    }

    Pet[] public pets;

    function addPet(
        string memory petName,
        uint petAge,
        string memory petBreed,
        string memory petSpecies,  // Add species parameter
        string memory petOwner,    // Add owner parameter
        string memory petAction    // Add action parameter
    ) public {
        Pet memory newPet = Pet({
            name: petName,
            age: petAge,
            breed: petBreed,
            species: petSpecies,
            owner: petOwner,
            timestamp: block.timestamp,
            action: petAction
        });

        pets.push(newPet);
    }

    function getPetCount() public view returns (uint) {
        return pets.length;
    }

    function getPets(uint index) public view returns (Pet memory) {
        require(index < pets.length, "Index out of bounds");
        return pets[index];
    }
}
