import AsyncStorage from '@react-native-async-storage/async-storage';

exports.storeToken = function (tok) {
  try {
    AsyncStorage.setItem('token_data', tok.accessToken);
  } catch (e) {
    console.log(e.message);
  }
};

exports.retrieveToken = function () {
  let userData;
  try {
    userData = AsyncStorage.getItem('token_data');
  } catch (e) {
    console.log(e.message);
  }
  return userData;
};
