
$(document).ready(function(){

    //Hide the modal:
    $('#modal').hide();

    //Declare arrays for storing API promises and users:
    const promises = [];
    const users = [];

    //Variable used to keep track of the user index while going through users in the modal:
    let userModalIndex;

    //Re-usable API function for fetching user data:
    const getUsers = () => {
        return fetch('https://randomuser.me/api/?nat=gb,us')
            .then(response => response.json())
            .then(data => data.results[0]);
    }

    //Push API fetch promises into the promises array:
    for (let i = 0; i < 12; i++) {
        promises.push(getUsers());
    }

    //Empties the gallery div and appends cards based on the users array parameter:
    const renderUserCards = (users) => {
        $('.gallery').empty();

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            $('.gallery').append(`
                <div class="card" id="${user.login.uuid}" index="${i}">
                    <div class="card-img-container">
                        <img class="card-img" src="${user.picture.large}" alt="profile picture">
                    </div>
                    <div class="card-info-container">
                        <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
                        <p class="card-text">${user.email}</p>
                        <p class="card-text cap">${user.location.city}</p>
                    </div>
                </div>
            `);
        }
    }

    //Resolve all promises then render cards:
    Promise.all(promises).then(data => {
        users.push(...data);
        renderUserCards(users); 
    }); 

    //Function to format birth date:
    const birthDateFormatter = (_date) => {
        const date = new Date(_date)
        const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' }); 
        const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(date); 
        return `${month}/${day}/${year}`;
    }

    //Function to populate the modal with the selected user's info and open the modal:
    const displayUserModal = (uuid) => {
        const selectedUser = users.filter(user => user.login.uuid === uuid)[0];
        $('.modal-img').attr('src', selectedUser.picture.large)
        $('.modal-info-container #name').html(`${selectedUser.name.first} ${selectedUser.name.last}`);
        $('#modal-email').html(`${selectedUser.email}`);
        $('#modal-city').html(`${selectedUser.location.city}`);
        $('#modal-phone').html(`${selectedUser.cell}`);
        $('#modal-address').html(`${selectedUser.location.street.number} ${selectedUser.location.street.name}, ${selectedUser.location.state}, ${selectedUser.location.country}, ${selectedUser.location.postcode}`);
        $('#modal-birthDate').html(birthDateFormatter(selectedUser.dob.date));
        $('#modal').show();
    }

    //Handle Card click and Modal Display:
    $(document).on('click', '.card', function() {
        const uuid = $(this).attr('id');
        const index = $(this).attr('index');
        userModalIndex = index;
        displayUserModal(uuid);
    });

    //Close modal:
    $('#modal-close-btn').on('click', function(){
        $('#modal').hide();
    });

    //Function for filtering and rendering the results of the search string:
    const filterUsers = (searchString) => {
        const filteredUsers = users.filter(user => `${user.name.first.toLowerCase()} ${user.name.last.toLowerCase()}`.includes(searchString.toLowerCase()));
        renderUserCards(filteredUsers);
    }

    //*Bonus 1: Search
    //Display the user's search results when searching for a name:
    $('#search-submit').on('click', function(e) {    
        e.preventDefault();
        if ($('#search-input').val().length > 0) {
            const searchString = $('#search-input').val();
            filterUsers(searchString);
        }
    });

    //Re-render all the user cards if the user searches for a name, and then removes the entire search string.
    $('#search-input').on('input', function(){
        if ($('#search-input').val().length === 0) {
            renderUserCards(users);
        }
    });

    //*Bonus 2: Modal Toggle
    //Function for traversing through the users - if next (true) go forward, else, go backgwards:
    const nextUser = (next) => {
        if (next) {
            userModalIndex = (parseInt(userModalIndex) + 1) % 12
        } else {
            userModalIndex = parseInt(userModalIndex) - 1 === -1 ? 11 : parseInt(userModalIndex) - 1;  
        }

        const nextUser = users[userModalIndex];
        const {uuid} = nextUser.login;
        displayUserModal(uuid);
    }

    //Modal Next
    $('#modal-next').on('click', function(){
        nextUser(true);
    });

    //Modal Prev
    $('#modal-prev').on('click', function(){
        nextUser(false);
    });
});
