import {library} from '@fortawesome/fontawesome-svg-core';
import {
    faAlbum,
    faTurntable,
    faListMusic,
    faUserMusic,
    faSquarePlus,
    faPeopleGroup
} from '@fortawesome/pro-light-svg-icons';
import {faTurntable as faTurntableThin} from '@fortawesome/pro-thin-svg-icons';
import {faSpotify, faYoutube} from '@fortawesome/free-brands-svg-icons';
import {Icon} from '@xh/hoist/icon';

library.add(
    faAlbum,
    faListMusic,
    faPeopleGroup,
    faSpotify,
    faSquarePlus,
    faTurntable,
    faTurntableThin,
    faUserMusic,
    faYoutube
);

const prefix = 'fal';
export const addToHomescreenIcon = (opts = {}) =>
    Icon.icon({iconName: 'square-plus', prefix, ...opts});
export const albumIcon = (opts = {}) => Icon.icon({iconName: 'album', prefix, ...opts});
export const artistIcon = (opts = {}) => Icon.icon({iconName: 'user-music', prefix, ...opts});
export const clubIcon = (opts = {}) => Icon.icon({iconName: 'turntable', prefix, ...opts});
export const locationIcon = (opts = {}) => Icon.location({prefix, ...opts});
export const meetingIcon = (opts = {}) => Icon.icon({iconName: 'people-group', prefix, ...opts});
export const memberIcon = (opts = {}) => Icon.user({prefix, ...opts});
export const spotifyIcon = (opts = {}) => Icon.icon({iconName: 'spotify', prefix: 'fab', ...opts});
export const youTubeIcon = (opts = {}) => Icon.icon({iconName: 'youtube', prefix: 'fab', ...opts});
export const trackIcon = (opts = {}) => Icon.icon({iconName: 'list-music', prefix, ...opts});
