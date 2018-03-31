import { BoxOffice } from '../commonTypes';

// this is a box office information found on the various web sites
// no way it is accurate but it is presented here for demonstration purposes
const predefinedBoxOffice = {
    'Castle in the Sky': 9.78,
    'Grave of the Fireflies': 5,
    'My Neighbor Totoro': 5,
    'Kiki\'s Delivery Service': 18,
    'Only Yesterday': 25.6,
    'Porco Rosso': 34,
    'Pom Poko': 34.1,
    'Whisper of the Heart': 25.6,
    'Princess Mononoke': 159.4,
    'My Neighbors the Yamadas': 9.4,
    'Spirited Away': 330,
    'The Cat Returns': 51.2,
    'Howl\'s Moving Castle': 231.7,
    'Tales from Earthsea': 68.67,
    'Ponyo': 201.8,
    'Arrietty': 145.6,
    'From Up on Poppy Hill': 61,
    'The Wind Rises': 136.5,
    'The Tale of the Princess Kaguya': 24.2,
    'When Marnie Was There': 34.1,    
};

export default class BoxOfficeService implements BoxOffice {
    grossRevenue = (title: string) => predefinedBoxOffice[title];
}