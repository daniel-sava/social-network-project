let networkUsers = [];
let skills = {};
let positions = {};

// active, blocked, idle, pending

let currentUser = {};

const maxDisplayedUsers = 7;
let totalPages = 0;
let currentPage = 2;

const networkFeedElement = document.getElementById('network');
const networkFeedResultsNumberElement =
    document.getElementById('results-number');
const networkFeedPaginationElement =
    document.getElementById('network-pagination');
const accountElement = document.getElementById('account');

function getNetworkUsers() {
    let getNetworkUsersRequest = fetch(
        'https://random-data-api.com/api/v2/users?size=43'
    );
    getNetworkUsersRequest
        .then((response) => response.json())
        .then((data) => {
            networkUsers = data;
            let currentDisplayedUsers = 0;

            // Preia primul utilizator, ca fiind utilizatorul curent
            currentUser = new NetworkUser(networkUsers[0]);
            createUserProfileElement(currentUser, accountElement);
            // Sterge primul utilizator din lista cu toti utilizatorii
            networkUsers = networkUsers.slice(1);
            totalPages = Math.ceil(networkUsers.length / maxDisplayedUsers);

            getPagesConfiguration();

            for (let networkUser of networkUsers) {
                const user = new NetworkUser(networkUser);

                if (currentDisplayedUsers !== maxDisplayedUsers) {
                    createUserProfileElement(user, networkFeedElement);
                    currentDisplayedUsers++;
                }

                addSkillToList(user.employment.mainSkill);
                addPositionToList(user.employment.position);
            }
        })
        .catch((error) => {
            console.log(error);
            throw new Error();
        });
}

function addSkillToList(skill) {
    if (skills[skill]) {
        skills[skill] += 1;
    } else {
        skills[skill] = 1;
    }
}

function addPositionToList(position) {
    if (positions[position]) {
        positions[position] += 1;
    } else {
        positions[position] = 1;
    }
}

function createUserProfileElement(user, parentElement) {
    if (!parentElement) {
        return;
    }

    const userProfileElement = document.createElement('div');
    userProfileElement.classList.add('user-profile');
    userProfileElement.id = `user-profile-${user.id}`;

    const userProfileAvatarElement = document.createElement('img');
    userProfileAvatarElement.classList.add('avatar');
    userProfileAvatarElement.src = user.personalData.avatar;
    userProfileAvatarElement.loading = 'lazy';

    userProfileElement.appendChild(userProfileAvatarElement);

    const userProfilePersonalDataElement = document.createElement('div');
    userProfilePersonalDataElement.classList.add('personal-data');

    const userProfilePersonalDataName = document.createElement('p');
    userProfilePersonalDataName.classList.add('full-name');

    const userFullName = document.createTextNode(
        `${user.personalData.firstName} ${user.personalData.lastName}`
    );

    userProfilePersonalDataName.appendChild(userFullName);

    const userProfilePersonalDataJobTitle = document.createElement('p');
    userProfilePersonalDataJobTitle.classList.add('job-title');

    const userJobTitle = document.createTextNode(user.employment.position);
    userProfilePersonalDataJobTitle.appendChild(userJobTitle);

    userProfilePersonalDataElement.appendChild(userProfilePersonalDataName);
    userProfilePersonalDataElement.appendChild(userProfilePersonalDataJobTitle);

    userProfileElement.appendChild(userProfilePersonalDataElement);

    const userPlanElement = document.createElement('div');
    userPlanElement.classList.add(
        'subscription-plan',
        user.subscription.status.toLowerCase()
    );

    const userPlanText = document.createTextNode(user.subscription.plan);

    userPlanElement.appendChild(userPlanText);

    userProfileElement.appendChild(userPlanElement);

    if (parentElement === accountElement) {
        const userNameElement = document.createElement('span');
        const userNameText = document.createTextNode(
            ` @${user.personalData.username}`
        );

        userNameElement.appendChild(userNameText);

        userProfilePersonalDataName.appendChild(userNameElement);

        const userBioElement = document.createElement('p');
        userBioElement.classList.add('bio');

        const userBioText = document.createTextNode(
            `I am a ${user.employment.mainSkill} ${user.employment.position} from ${user.address.city}, ${user.address.country}.`
        );

        userBioElement.appendChild(userBioText);
        userProfilePersonalDataElement.appendChild(userBioElement);
    }

    parentElement.appendChild(userProfileElement);
}

function getPagesConfiguration() {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const pageNumberElement = document.createElement('div');
        pageNumberElement.classList.add('page-number');

        const pageNumberText = document.createTextNode(pageNumber);
        pageNumberElement.appendChild(pageNumberText);

        networkFeedPaginationElement.appendChild(pageNumberElement);
    }

    setResultsNumberElement();
}

// max displayed = 10
// current page = 2 => Showing users from 11 to 20

function setResultsNumberElement() {
    const startingNumber = (currentPage - 1) * maxDisplayedUsers + 1;
    const endingNumber =
        currentPage === totalPages
            ? networkUsers.length
            : currentPage * maxDisplayedUsers;

    networkFeedResultsNumberElement.textContent = `Showing users from ${startingNumber} to ${endingNumber} out of ${networkUsers.length}`;
}

getNetworkUsers();

class NetworkUser {
    id;
    address;
    personalData;
    employment;
    subscription;

    constructor(data) {
        this.id = data.id;

        this.setUserAddress(data.address);
        this.setUserPersonalData(data);
        this.setUserEmploymentData(data.employment);
        this.setUserSubscriptionData(data.subscription);
    }

    setUserAddress(address) {
        this.address = {
            city: address.city,
            country: address.country,
            coordinates: address.coordinates,
        };
    }

    setUserPersonalData(data) {
        this.personalData = {
            firstName: data.first_name,
            lastName: data.last_name,
            dateOfBirth: data.date_of_birth,
            phoneNumber: data.phone_number,
            email: data.email,
            username: data.username,
            avatar: data.avatar,
        };
    }

    setUserEmploymentData(employmentData) {
        this.employment = {
            position: employmentData.title,
            mainSkill: employmentData.key_skill,
        };
    }

    setUserSubscriptionData(subscriptionData) {
        this.subscription = {
            plan: subscriptionData.plan,
            status: subscriptionData.status,
        };
    }
}
