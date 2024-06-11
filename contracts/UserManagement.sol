// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManagement {
    struct User {
        uint userId;
        string username;
        string password;
        string fullname;
        string useraddress;
        string contact;
        uint8 role; // 0: Regular user, 1: Admin
    }

    mapping(string => address) private usernameToAddress;
    mapping(address => User) public users;
    mapping(string => bool) private loggedIn;
    uint public totalUsers;
    address[] public userAddresses; // Maintain an array of user addresses

    event AccountCreated(uint indexed userId, string indexed username, uint8 role);
    event PasswordChanged(string indexed username);
    event UserLoggedIn(string indexed username, uint userId, uint8 role);
    event UserLoggedOut(string indexed username);

    // Function to add a new user account
    function addUser(
        string memory _username,
        string memory _password,
        string memory _fullname,
        string memory _useraddress,
        string memory _contact,
        uint8 _role
    ) public {
        require(usernameToAddress[_username] == address(0), "User already exists");
        totalUsers++;
        address newUserAddress = address(bytes20(keccak256(abi.encodePacked(msg.sender, block.timestamp)))); // Generate a new address for the user
        users[newUserAddress] = User(totalUsers, _username, _password, _fullname, _useraddress, _contact, _role);
        usernameToAddress[_username] = newUserAddress;
        userAddresses.push(newUserAddress); // Add the new user address to the array
        emit AccountCreated(totalUsers, _username, _role);
    }

    // Function to get user details by username
    function getUserByUsername(string memory _username) public view returns (string memory, string memory, string memory, string memory, string memory, uint8) {
        address userAddress = usernameToAddress[_username];
        require(userAddress != address(0), "User does not exist");
        User memory user = users[userAddress];
        return (user.username, user.password, user.fullname, user.useraddress, user.contact, user.role);
    }
    

    // Function to change user password
    function changePasswordByUsername(string memory _username, string memory _currentPassword, string memory _newPassword) public {
        address userAddress = usernameToAddress[_username];
        require(userAddress != address(0), "User does not exist");
        User storage user = users[userAddress];
        require(keccak256(abi.encodePacked(user.password)) == keccak256(abi.encodePacked(_currentPassword)), "Incorrect current password");
        user.password = _newPassword;
        emit PasswordChanged(_username);
    }

    // Function to authenticate user
    function login(string memory _username, string memory _password) public {
        address userAddress = usernameToAddress[_username];
        require(userAddress != address(0), "User does not exist");
        User memory user = users[userAddress];
        require(keccak256(abi.encodePacked(user.password)) == keccak256(abi.encodePacked(_password)), "Incorrect password");
        loggedIn[_username] = true;
        emit UserLoggedIn(_username, user.userId, user.role);
    }

    // Function to logout user
    function logout(string memory _username) public {
        delete loggedIn[_username];
        emit UserLoggedOut(_username);
    }

    // Function to check if user is logged in
    function isLoggedIn(string memory _username) public view returns (bool) {
        return loggedIn[_username];
    }
    
    // Function to get all user IDs and their details
    function getAllUsers() public view returns (uint[] memory, string[] memory, string[] memory, string[] memory, string[] memory, string[] memory, uint8[] memory) {
        uint[] memory userIds = new uint[](totalUsers);
        string[] memory usernames = new string[](totalUsers);
        string[] memory passwords = new string[](totalUsers);
        string[] memory fullnames = new string[](totalUsers);
        string[] memory useraddresses = new string[](totalUsers);
        string[] memory contacts = new string[](totalUsers);
        uint8[] memory roles = new uint8[](totalUsers);
        
        for (uint i = 0; i < totalUsers; i++) {
            User memory user = users[userAddresses[i]];
            userIds[i] = user.userId;
            usernames[i] = user.username;
            passwords[i] = user.password;
            fullnames[i] = user.fullname;
            useraddresses[i] = user.useraddress;
            contacts[i] = user.contact;
            roles[i] = user.role;
        }
        
        return (userIds, usernames, passwords, fullnames, useraddresses, contacts, roles);
    }


    // Function to update user details by username
    function updateUserByUsername(
        string memory _username,
        string memory _password,
        string memory _fullname,
        string memory _useraddress,
        string memory _contact,
        uint8 _role
    ) public {
        address userAddress = usernameToAddress[_username];
        require(userAddress != address(0), "User does not exist");
        User storage user = users[userAddress];
        
        user.password = _password;
        user.fullname = _fullname;
        user.useraddress = _useraddress;
        user.contact = _contact;
        user.role = _role;
    }
    

    function getUserByFullName(string memory _fullName) public view returns (uint, string memory, string memory, string memory, string memory, string memory, uint8) {
        for (uint i = 0; i < totalUsers; i++) {
            User memory user = users[userAddresses[i]];
            if (bytes(user.fullname).length != 0 && bytes(_fullName).length != 0 && bytes(user.fullname).length >= bytes(_fullName).length) {
                bool found = false;
                for (uint j = 0; j <= bytes(user.fullname).length - bytes(_fullName).length; j++) {
                    bool tugma = true;
                    for (uint k = 0; k < bytes(_fullName).length; k++) {
                        if (bytes(user.fullname)[j + k] != bytes(_fullName)[k]) {
                            tugma = false;
                            break;
                        }
                    }
                    if (tugma) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    return (user.userId, user.username, user.password, user.fullname, user.useraddress, user.contact, user.role);
                }
            }
        }
        revert("User with the provided full name does not exist");
    }

}
