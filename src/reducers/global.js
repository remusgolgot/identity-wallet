/**
 * Created by vladtomsa on 10/10/2018
 */
import { globalConstants } from 'constants/global';

const initialState = {
  // passphrase: null,
  passphrase: 'blade early broken display angry wine diary alley panda left spy woman',
  sidenavOpened: false,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case (globalConstants.OPEN_SIDENAV): return { ...state, sidenavOpened: true };
    case (globalConstants.ON_STORE_PASSPHRASE): return { ...state, passphrase: payload };
    case (globalConstants.ON_REMOVE_PASSPHRASE): return { ...state, passphrase: null };

    case ('@@router/LOCATION_CHANGE'):
    case (globalConstants.CLOSE_SIDENAV):
      return { ...state, sidenavOpened: false };

    default:
      return state;
  }
};
