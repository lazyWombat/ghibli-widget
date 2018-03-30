import * as d3 from 'd3';
import { Film } from './models/film';

// this set of links was obtained using Microsoft cognitive services through the 'get-posters.py' script
// please read the comments inside the script if you want to update the set
const predefinedPosters = {
    'Castle in the Sky': 'https://tse3.mm.bing.net/th?id=OIP.MjpxW4otIc_l6nypBZWeDwHaKj&pid=Api',
    'Grave of the Fireflies': 'https://tse3.mm.bing.net/th?id=OIP.tczpOSVbt_R0WHVT19yWBwHaKd&pid=Api',
    'My Neighbor Totoro': 'https://tse1.mm.bing.net/th?id=OIP.p9Bl558pTAhdcBWCqkPT_QHaNV&pid=Api',
    'Kiki\'s Delivery Service': 'https://tse3.mm.bing.net/th?id=OIP.GYqfGUeUcVeqluNixaDV-wHaLH&pid=Api',
    'Only Yesterday': 'https://tse4.mm.bing.net/th?id=OIP.5NAWxWw9b0aHYvzYPldB-wHaK0&pid=Api',
    'Porco Rosso': 'https://tse4.mm.bing.net/th?id=OIP.lMg1xMoWo9_d6rvvoTkHRgHaLH&pid=Api',
    'Pom Poko': 'https://tse3.mm.bing.net/th?id=OIP.9NaOdMF39C9878zZ6HbT2AHaKj&pid=Api',
    'Whisper of the Heart': 'https://tse2.mm.bing.net/th?id=OIP.9ZZanNFv1sf6g-HWoohQxQHaLG&pid=Api',
    'Princess Mononoke': 'https://tse2.mm.bing.net/th?id=OIP.JNyDgGuxETTSo-u0YQ53cAHaNU&pid=Api',
    'My Neighbors the Yamadas': 'https://tse1.mm.bing.net/th?id=OIP.ylFTucG-UUAYF6nc0uZCrwHaJ2&pid=Api',
    'Spirited Away': 'https://tse3.mm.bing.net/th?id=OIP.-7w_wgZc9_nXP6FJBeosHgHaNV&pid=Api',
    'The Cat Returns': 'https://tse3.mm.bing.net/th?id=OIP.oZe-Qa9f9hdItPCQnpCYOgHaKj&pid=Api',
    'Howl\'s Moving Castle': 'https://tse1.mm.bing.net/th?id=OIP.XY19ePGa8PC4xMy_ee3rCAHaLH&pid=Api',
    'Tales from Earthsea': 'https://tse4.mm.bing.net/th?id=OIP.xQe43dUQB_xHhW5OT_bEEAHaLc&pid=Api',
    'Ponyo': 'https://tse3.mm.bing.net/th?id=OIP.ePCAyyt3YWrq9aO-e5SRkgHaLG&pid=Api',
    'Arrietty': 'https://tse4.mm.bing.net/th?id=OIP.xLF01thjoU4Cn7JBbgCfqwHaK0&pid=Api',
    'From Up on Poppy Hill': 'https://tse4.mm.bing.net/th?id=OIP.iUU3nwDWXCTd_UATMdOiUAHaKj&pid=Api',
    'The Wind Rises': 'https://tse2.mm.bing.net/th?id=OIP.dw3AhrXkdRWfwUhobPZg2wHaK-&pid=Api',
    'The Tale of the Princess Kaguya': 'https://tse1.mm.bing.net/th?id=OIP.7ij8fDfWZxC7xRLAwQ3I8gHaFj&pid=Api',
    'When Marnie Was There': 'https://tse1.mm.bing.net/th?id=OIP.SHlBn9lrgVgAY9N8w2kkoAHaK0&pid=Api',    
};

export default class Poster {
    render(container: d3.Selection<d3.BaseType, {}, HTMLElement, undefined>, film: Film) {
        container
        .append('div')
            .style('min-width', '150px')
            .style('min-height', '200px')
        .append('img')
            .style('max-height', '200px')
            .style('width', 'auto')
            .attr('src', predefinedPosters[film.title] || '/poster.jpg');
    }
}