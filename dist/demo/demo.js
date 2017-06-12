var names = [
    'Василий',
    'Иван',
    'Ваня',
    'Дима',
    'Коля',
    'Женя',
    'Жанна',
    'Карина',
    'Михаил',
    'Андрей',
    'Andrew',
    'Demid',
    'Kalla',
    'Марк',
    'Гордон',
    'Иннокентий',
    'Хан',
    'Демид'
];

var lastNames = [
    'Иванов',
    'Петров',
    'Гагарин',
    'Рогозин',
    'Малышев',
    'Евдокимов',
    'Жасминов',
    'Рордецкий',
    'Дмитриев',
    'Захаров',
    'Потемким',
    'Arserian',
    'Marensia',
    'Demida',
    'Живаго',
    'Толстой',
    'Пастернак',
    'Юань'
];

var avatars = [
    'https://vk.com/images/deactivated_50.png',
    'https://pp.userapi.com/c622722/v622722250/4aef0/uBgwpeepUpg.jpg',
    'https://pp.userapi.com/c836231/v836231369/20b34/roo-lITga94.jpg',
    'https://pp.userapi.com/c630527/v630527949/19207/H7gpgTokRls.jpg',
    'https://pp.userapi.com/c636831/v636831235/61fdc/XkXa-hcLedE.jpg',
    'https://pp.userapi.com/c604521/v604521316/47de8/ZdOxYcxRESg.jpg',
    'https://pp.userapi.com/c606219/v606219551/7d93/DRohPjbb2Rc.jpg'

];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomName() {
    return names[getRandomInt(0, names.length)];
}

function getRandomLastName() {
    return lastNames[getRandomInt(0, lastNames.length)];
}

function getRandomAva() {
    return avatars[getRandomInt(0, avatars.length)];
}

function makeData(count) {
    var result = [];
    var name, lastName;
    for (var i = 0; i < count; i++) {
        name = getRandomName();
        lastName = getRandomLastName();

        result.push({
            name: name + ' ' + lastName,
            uid: 2000 + i,
            avatarUrl: getRandomAva(),
            extra: 'Number ' + i
        });
    }
    return result;
}


var wMultiple = new UiDropDown('#demo-multiple', {
    suggestions: makeData(500),
    limit: 10,
    serverSide: true,
    showAvatars: true,
    serverSideUrl: 'http://ui-drop-down-ui-drop-down.7e14.starter-us-west-2.openshiftapps.com/find',
    serverSideFindProperty: 'domain'
});

var wSingle = new UiDropDown('#demo-single', {
    suggestions: makeData(500),
    limit: 10,
    serverSide: true,
    showAvatars: false,
    multiple: false,
    serverSideUrl: 'http://ui-drop-down-ui-drop-down.7e14.starter-us-west-2.openshiftapps.com/find',
    serverSideFindProperty: 'domain'
});

var multipleNoAutocomplete = new UiDropDown('#demo-multiple-no-autocomplete', {
    suggestions: makeData(500),
    limit: 20,
    serverSide: false,
    autocomplete: false,
    showAvatars: true,
    multiple: true
});

var signgleNoAutocomplete = new UiDropDown('#demo-multiple-no-autocomplete-single',  {
    suggestions: makeData(10),
    limit: 10,
    serverSide: false,
    autocomplete: false,
    showAvatars: true,
    multiple: false
});

function activateWidget() {
    wMultiple.activate();
}

function closeWidget() {
    wMultiple.close();
}