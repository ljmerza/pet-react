const petfinderKey = '$t';
const lastUpdatedFormat = 'MMMM Qo, YYYY';

// https://www.petfinder.com/developers/api-docs#response

const moment = require('moment');

/**
 * 
 * @param {*} pets
 * @returns
 */
function formatPets(pets) {
    return pets.map(pet => {
        return {
            name: pet.name[petfinderKey],
            animal: pet.animal[petfinderKey],
            sex: pet.sex[petfinderKey],
            details: _formatPetDetails(pet.options),
            image: _formatPetImage(pet.media),
            description: _formatDescription(pet.description[petfinderKey]),
            shelterId: pet.shelterId[petfinderKey],
            shelterPetId: pet.shelterPetId[petfinderKey],
            contact: _formatContactInfo(pet.contact),
            status: _formatPetStatus(pet.status[petfinderKey]),
            age: _formatPetAge(pet.age[petfinderKey]),
            size: _formatPetSize(pet.size[petfinderKey]),
            breeds: _formatPetBreeds(pet.breeds),
            lastUpdated: _formatLastUpdated(pet.lastUpdate[petfinderKey]),
        };
    });
};

module.exports.formatPets = formatPets;

function _formatContactInfo(contact){
    return {
        email: contact.email[petfinderKey] || '',
        address: contact.address1[petfinderKey] || contact.address2[petfinderKey] || '',
        city: contact.city[petfinderKey] || '',
        state: contact.state[petfinderKey] || '',
        zip: contact.zip[petfinderKey] || '',
        ..._formatPhone(contact.phone[petfinderKey])
    };
}

function _formatPhone(phone){
    if(!phone) return {phone: '', extension: ''};

    const phoneFormatted = phone.replace(/\(|\)/g, '');
    const [nakedPhone, extension] = phoneFormatted.split(/ ?ext\.?/);

    return {
        extension: extension,
        phone: nakedPhone.replace(/ /g, '-'),
    };
}

function _formatPetStatus(status){
    switch(status){
        case 'A':
            return 'Adoption';
        default:
            return '';
    }
}

function _formatPetAge(age){
    return age;
}

function _formatPetSize(size){
    const petSizesMap = {
        S: 'Small',
        M: 'Medium',
        L: 'Large',
    };

    return petSizesMap[size];
}

function _formatPetBreeds(breeds){

    if(Array.isArray(breeds.breed)){
        return breeds.breed.map(breed => breed[petfinderKey]);
    }

    return [breeds.breed[petfinderKey]];
}

function _formatLastUpdated(lastUpdated){
    return moment(lastUpdated).format(lastUpdatedFormat);
}

function _formatPetDetails(options){
    return options.option.map(option => option[petfinderKey]);
}

function _formatPetImage(media){
    const idKey = '@id';
    const idSize = '@size';
    const images = [];

    const imageSizeMap = {
        't': 'xs',
        'pnt': 'sm',
        'pn': 'md',
        'fpm': 'lg',
        'x': 'xl',
    };

    for(let image of (media.photos && media.photos.photo || [])){
        const imageId = image[idKey];

        // see if the image object already exists
        let matchingIndex = images.findIndex(image => image.id === imageId);
        let currentImage;

        // if the image object does then save else create it
        if(matchingIndex > -1) {
            currentImage = images[matchingIndex];
        } else {
            currentImage = {id: imageId};
            images.push(currentImage);
        }
        
        // save new image onto image object
        const imageSizeKey = image[idSize];
        const newImageSizeKey = imageSizeMap[imageSizeKey] || 'default';
        currentImage[newImageSizeKey] = image[petfinderKey];
    }

    return images;
}

function _formatDescription(description){
    const descriptionArr = description.split('. ').filter(sentence => sentence);
    
    const sentences = descriptionArr.filter(sentence => {
        return !(removedDescripts.find(removed => {
            return sentence.includes(removed)
        }));
    });

    return sentences.join(' ')
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/(\\n){1,2}/g, ' ');
}

const removedDescripts = [
    'You MUST fill out an application',
    'Due to a large volume of calls and emails',
    'AVAILABLE:',
    'http'
]